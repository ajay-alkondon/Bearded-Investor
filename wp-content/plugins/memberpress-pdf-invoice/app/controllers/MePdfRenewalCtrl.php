<?php
if (!defined('ABSPATH')) {
  die('You are not allowed to call this page directly.');
}

/**
 * Controller for handling offline payment renewal invoice generation.
 * This controller manages the cron job and functionality for creating renewal
 * invoice notifications for offline payment gateway subscriptions.
 */
class MePdfRenewalCtrl extends MeprBaseCtrl
{

  /**
   * Custom cron interval name
   */
  const CRON_INTERVAL = 'mcpdf_renewal_interval';

  /**
   * Cron hook name
   */
  const CRON_HOOK = 'mcpdf_renewal_cron_hook';

  /**
   * Event name for tracking processed transactions
   */
  const EVENT_NAME = 'offline-payment-renewal-notice';

  /**
   * Maximum number of transactions to process in a single cron run.
   * This limit helps prevent server overload and ensures consistent processing.
   * If there are more transactions pending, they will be processed in subsequent cron runs.
   *
   * @var int
   */
  const MAX_TRANSACTIONS = 5;

  /**
   * Number of days to look back for missed transactions.
   * A negative value creates a buffer window to catch transactions that might have been missed
   * due to cron job failures or server issues. For example, -1 means check transactions
   * that should have been processed yesterday but weren't.
   *
   * @var int
   */
  const BUFFER_DAYS = -1;

  private $enabled_manual_gateways = null;

  private $txn_pdf_attachments = [];

  /**
   * Load hooks for the renewal functionality
   *
   * @return void
   */
  public function load_hooks()
  {
    // Cron setup
    add_filter('cron_schedules', array($this, 'register_cron_interval'));
    add_action(self::CRON_HOOK, array($this, 'process_renewal_notifications'));

    // Plugin activation/deactivation
    register_activation_hook(MPDFINVOICE_FILE, array($this, 'activate_cron'));
    register_deactivation_hook(MPDFINVOICE_FILE, array($this, 'deactivate_cron'));

    // Admin settings hook
    add_action('mepr_artificial_gateway_settings_after', array($this, 'add_gateway_settings'));

    // Email integration hooks - register with both underscore and dash formats
    add_filter('mepr_email_paths', array($this, 'add_email_paths'));
    add_filter('mepr_pdf_invoice_test_renewal_email', array($this, 'maybe_assume_offline_txn_renewal'), 10, 2);

    // Ensure cron is scheduled when settings change
    add_action('admin_init', array($this, 'ensure_cron_scheduled'));

    // Attach PDF to the email
    add_filter('mepr_email_send_attachments', array($this, 'add_email_attachments'), 10, 4);

    add_filter( 'mepr_transaction_email_params', array( $this, 'more_pf_invoice_params' ), 10, 2 );

    // Remove the PDF invoice from the email once sent
    add_action('mepr_email_sent', array($this, 'remove_receipt_pdf_invoice'), 10, 3);

    // Send Invoice notification for offline payment renewals
    add_action('wp_ajax_mepr_resend_txn_invoice_email', array($this, 'ajax_resend_renewal_invoice'));
    add_action('wp_ajax_nopriv_mepr_resend_txn_invoice_email', array($this, 'ajax_resend_renewal_invoice'));
  }

  /**
   * Register custom cron interval (30 minutes)
   *
   * @param array $schedules Existing cron schedules
   * @return array Modified schedules
   */
  public function register_cron_interval($schedules)
  {
    $schedules[self::CRON_INTERVAL] = array(
      'interval' => 30 * MINUTE_IN_SECONDS,
      'display' => __('Every 30 Minutes', 'memberpress-pdf-invoice')
    );
    return $schedules;
  }

  /**
   * Schedule the cron job on plugin activation
   *
   * @return void
   */
  public function activate_cron()
  {
    if (!wp_next_scheduled(self::CRON_HOOK)) {
      wp_schedule_event(time(), self::CRON_INTERVAL, self::CRON_HOOK);
    }
  }

  /**
   * Clear the cron job on plugin deactivation
   *
   * @return void
   */
  public function deactivate_cron()
  {
    $timestamp = wp_next_scheduled(self::CRON_HOOK);
    if ($timestamp) {
      wp_unschedule_event($timestamp, self::CRON_HOOK);
    }
  }

  /**
   * Ensure the cron job is scheduled (runs on admin_init)
   *
   * @return void
   */
  public function ensure_cron_scheduled()
  {
    if (!wp_next_scheduled(self::CRON_HOOK)) {
      $this->activate_cron();
    }
  }

  /**
   * Gets enabled offline payment gateways that have renewal settings configured
   *
   * Checks the integrations settings for offline payment gateways (MeprArtificialGateway)
   * that have renewal invoices enabled. Uses caching to avoid repeated lookups.
   *
   * @return array Array of gateway settings, keyed by gateway ID
   */
  public function get_enabled_gateways()
  {
    // Return cached gateways if already loaded
    if ($this->enabled_manual_gateways === null) {
      $mepr_options = MeprOptions::fetch();
      $payment_methods = $mepr_options->integrations;

      $this->enabled_manual_gateways = array();

      if (!empty($payment_methods)) {
        foreach ($payment_methods as $gateway_id => $gateway_data) {
          // Check if gateway is an offline gateway with renewal settings
          if (
            isset(
            $gateway_data['gateway'],
            $gateway_data['enable_renewal_invoice'],
            $gateway_data['days_before_renewal']
          )
            && 'MeprArtificialGateway' == $gateway_data['gateway']
          ) {

            // Add gateway if renewal invoices are enabled
            if (
              $gateway_data['enable_renewal_invoice'] == 'on'
              || $gateway_data['enable_renewal_invoice'] === true
            ) {
              $this->enabled_manual_gateways[$gateway_id] = $gateway_data;
            }
          }
        }
      }
    }

    return $this->enabled_manual_gateways;
  }

  /**
   * Main cron job handler for processing renewal notifications
   *
   * This method:
   * 1. Checks if renewal notifications are enabled via filter
   * 2. Verifies at least one offline gateway has renewals enabled
   * 3. Processes expiring transactions in batches
   *
   * @return void
   * @see get_enabled_gateways() Checks for enabled offline gateways
   * @see process_expiring_transactions() Handles the actual processing
   * @see MAX_TRANSACTIONS Maximum transactions processed per run
   * @filter mepr-pdf-invoice-renewal-notifications Can be used to disable processing
   */
  public function process_renewal_notifications()
  {
    $process_renewal_notifications = apply_filters('mepr-pdf-invoice-renewal-notifications', true);
    if (true !== $process_renewal_notifications) {
      $this->log_message('Renewal notifications processing is disabled. Skipping.');
      return;
    }

    // Check if at least one offline gateway has renewal notifications enabled
    $has_enabled_gateway = count($this->get_enabled_gateways()) > 0;
    if (!$has_enabled_gateway) {
      $this->log_message('No offline gateways have renewal notifications enabled. Skipping processing.');
      return;
    }

    // Process expiring transactions
    $this->process_expiring_transactions();
  }

  /**
   * Gets enabled gateways grouped by their days before renewal setting
   *
   * @return array Array where keys are days before renewal (int) and values are arrays of gateway IDs
   */
  protected function get_gateway_days()
  {
    $gateway_days = [];
    $payment_methods = $this->get_enabled_gateways();

    if (!empty($payment_methods)) {
      foreach ($payment_methods as $gateway_id => $gateway_data) {
        $days = isset($gateway_data['days_before_renewal']) ? intval($gateway_data['days_before_renewal']) : 1;
        if ($days < 1) {
          $days = 1;
        }

        // Add to unique days array using days as key and gateway IDs as values
        if (!isset($gateway_days[$days])) {
          $gateway_days[$days] = [];
        }

        $gateway_days[$days][] = $gateway_id;
      }
    }

    return $gateway_days;
  }

  /**
   * Retrieves transactions that are approaching expiration and need renewal notifications
   * Finds transactions that:
   * - Are marked as 'complete'
   * - Belong to active subscriptions
   * - Use enabled offline payment gateways
   * - Are expiring within the configured days window
   * - Haven't been processed for renewal yet
   *
   * @global wpdb $wpdb WordPress database abstraction object
   * @return array Array of transaction data, each containing:
   *               - 'transaction' => MeprTransaction object
   *               - 'days' => int (days before expiration)
   *               - 'gateway' => string (payment gateway ID)
   * @see MAX_TRANSACTIONS Maximum number of transactions to process per run
   * @see BUFFER_DAYS Number of days to look back for missed transactions
   */
  public function get_expiring_offline_transactions()
  {
    global $wpdb;

    // Find all active offline payment gateways with unique days settings
    $gateway_days = $this->get_gateway_days();
    if (empty($gateway_days)) {
      $this->log_message('No offline payment gateways with renewal notifications enabled found.');
      return [];
    }

    $this->log_message(sprintf('Found %d different expiration day settings across gateways.', count($gateway_days)));

    // Find transactions for each unique days setting
    $transactions = [];
    $filtered_count = 0;
    $mepr_db = new MeprDb();

    foreach ($gateway_days as $days => $gateway_ids) {
      // Prepare a list of %s placeholders for the gateway IDs
      $placeholders = implode(',', array_fill(0, count($gateway_ids), '%s'));

      if (absint($days) < 1) {
        $this->log_message(sprintf('Invalid days setting for gateway IDs: %s', implode(', ', $gateway_ids)));
        continue;
      }

      /**
       * Query to fetch transactions that:
       * - Are marked as 'complete'
       * - Belong to subscriptions with 'active' status
       * - Use one of the specified offline gateways
       * - Are set to expire in exactly $days days
       *
       * IMPORTANT:
       * We use DATEDIFF(DATE(expires_at), CURDATE()) BETWEEN $buffer_days AND $days
       * instead of = $days to create a *grace period*.
       *
       * This covers cases where:
       * - The CRON job fails or skips a day (e.g., server issue, load)
       * - We don't want to permanently miss sending a notice
       *
       * For example:
       * - If $days = 1 (notice should be sent 1 day before expiry)
       * - And $buffer_days = -1 (check back up to 1 day in the past)
       *
       * Then transactions expiring *tomorrow* will be matched if the job runs late.
       */
      $sql = "
        SELECT t.id, t.gateway, t.expires_at, t.subscription_id, s.status
        FROM {$mepr_db->transactions} AS t
        JOIN {$mepr_db->subscriptions} AS s ON t.subscription_id = s.id
        LEFT JOIN {$mepr_db->transaction_meta} AS tm
          ON tm.transaction_id = t.id AND tm.meta_key = 'renewal_txn_created'
        WHERE t.status = %s
        AND tm.transaction_id IS NULL
        AND DATEDIFF(DATE(t.expires_at), CURDATE()) BETWEEN %d AND %d
        AND s.status = %s
        AND t.gateway IN ($placeholders)
        ORDER BY t.expires_at ASC
        LIMIT %d
      ";

      // Combine the query parameters: transaction status, date window, subscription status, gateway IDs, and limit
      $params = array_merge(
        [MeprTransaction::$complete_str, self::BUFFER_DAYS, $days, MeprSubscription::$active_str],
        $gateway_ids,
        [self::MAX_TRANSACTIONS]
      );

      // Prepare and execute the query
      $query = $wpdb->prepare($sql, ...$params);

      $results = $wpdb->get_results($query);
      if ($wpdb->last_error) {
        $this->log_message(sprintf('Database error: %s', $wpdb->last_error));
        continue;
      }


      if (!empty($results) && is_array($results)) {
        foreach ($results as $result) {
          $txn = new MeprTransaction($result->id);

          if (!$txn->id) {
            $this->log_message(sprintf('Failed to load transaction ID %d', $result->id));
            continue;
          }

          // Skip if we already have MAX_TRANSACTIONS for the current CRON run
          if ($filtered_count >= self::MAX_TRANSACTIONS) {
            $this->log_message('Reached maximum number of transactions to process. Stopping.');
            break 2; // Break out of both loops
          }

          $transactions[] = array(
            'transaction' => $txn,
            'days' => $days,
            'gateway' => $txn->gateway
          );

          $filtered_count++;

          $this->log_message(sprintf(
            'Added transaction ID %d for gateway %s with %d days before expiration',
            $txn->id,
            $txn->gateway,
            $days
          ));
        }
      }
    }

    $this->log_message(sprintf('Found a total of %d transactions to process.', count($transactions)));

    return $transactions;
  }

  /**
   * Check if a transaction already has a renewal notice event
   *
   * @param MeprTransaction $transaction The transaction to check
   * @return boolean True if event exists, false otherwise
   */
  public function has_renewal_event($transaction)
  {
    global $wpdb;
    $mepr_db = new MeprDb();

    $query = $wpdb->prepare(
      "SELECT COUNT(*)
       FROM {$mepr_db->events}
       WHERE event = %s
       AND evt_id = %d
       AND evt_id_type = %s LIMIT 1",
      self::EVENT_NAME,
      $transaction->id,
      MeprEvent::$transactions_str
    );

    return (int) $wpdb->get_var($query) > 0;
  }

  /**
   * Check if a subscription already has a pending renewal transaction
   *
   * @param MeprTransaction $transaction The transaction to check
   * @return boolean True if pending transaction exists, false otherwise
   */
  public function has_pending_renewal_transaction($transaction)
  {
    global $wpdb;

    // Only check if the transaction has a valid subscription ID
    if (empty($transaction->subscription_id)) {
      return false;
    }

    $mepr_db = new MeprDb();
    $query = $wpdb->prepare(
      "SELECT COUNT(*)
       FROM {$mepr_db->transactions}
       WHERE subscription_id = %d
       AND status = %s
       AND id > %d",
      $transaction->subscription_id,
      MeprTransaction::$pending_str,
      $transaction->id
    );

    return (int) $wpdb->get_var($query) > 0;
  }

  /**
   * Create a pending renewal transaction for a subscription
   * This method creates a new transaction that will be used to process the renewal payment.
   * It validates the original transaction and subscription before creating the new one.
   *
   * @param MeprTransaction $transaction The original transaction to base the renewal on
   * @return MeprTransaction|false The newly created pending transaction or false on failure
   */
  public function create_pending_renewal_transaction($transaction)
  {
    // Get the subscription
    $subscription = $transaction->subscription();

    if ($this->validate_subscription($subscription, $transaction->id) === false) {
      return false;
    }

    // Get the product
    if ($this->validate_product($transaction->product(), $transaction->id) === false) {
      return false;
    }

    // Create new transaction
    $new_transaction = new MeprTransaction();

    // Copy relevant fields from original transaction
    $new_transaction->user_id = $transaction->user_id;
    $new_transaction->product_id = $transaction->product_id;
    $new_transaction->subscription_id = $transaction->subscription_id;
    $new_transaction->gateway = $transaction->gateway;
    $new_transaction->amount = $subscription->price;
    $new_transaction->total = $subscription->total;
    $new_transaction->tax_amount = $transaction->tax_rate > 0 ? MeprUtils::format_currency_us_float($subscription->price * ($transaction->tax_rate / 100)) : 0;
    $new_transaction->tax_rate = $transaction->tax_rate;
    $new_transaction->tax_desc = $transaction->tax_desc;
    $new_transaction->tax_compound = $transaction->tax_compound;
    $new_transaction->coupon_id = $transaction->coupon_id;
    $new_transaction->coupon = $transaction->coupon;

    // Set unique fields for the new transaction
    $new_transaction->status = MeprTransaction::$pending_str;
    $new_transaction->txn_type = 'payment';
    $new_transaction->trans_num = 'mp-rtxn-' . uniqid();

    // Set the expiration date to the appropriate period after the original expiration
    $expires_at = strtotime($transaction->expires_at);
    $period_type = $subscription->period_type;
    $period_length = (int) $subscription->period;

    if ($period_type && $period_length > 0) {
      switch ($period_type) {
        case 'days':
          $expires_at = strtotime('+' . $period_length . ' days', $expires_at);
          break;
        case 'weeks':
          $expires_at = strtotime('+' . $period_length . ' weeks', $expires_at);
          break;
        case 'months':
          $expires_at = strtotime('+' . $period_length . ' months', $expires_at);
          break;
        case 'years':
          $expires_at = strtotime('+' . $period_length . ' years', $expires_at);
          break;
      }

      $new_transaction->expires_at = gmdate('Y-m-d 23:59:59', $expires_at);
    }

    try {
      // Store the transaction
      $new_transaction->store();

      $transaction->add_meta('renewal_txn_created', time());

      $this->store_invoice_number($new_transaction, $transaction);

      return $new_transaction;
    } catch (Exception $e) {
      $this->log_message(sprintf('Failed to create pending renewal transaction: %s', $e->getMessage()));
      return false;
    }
  }

  /**
   * Record a renewal event for a transaction
   * This logs the renewal event with the number of days before expiration
   * and the expiration date.
   *
   * @param MeprTransaction $transaction The transaction to record the event for
   * @param int $days_before Number of days before expiration when the renewal was processed
   * @return void
   */
  public function record_renewal_event($transaction, $days_before)
  {
    MeprEvent::record(self::EVENT_NAME, $transaction, [
      'days_before' => (int) $days_before,
      'expiry' => $transaction->expires_at
    ]);
  }

  /**
   * Log message for debugging purposes
   *
   * @param string $message Message to log
   * @return void
   */
  protected function log_message($message, $context = [])
  {
    if (class_exists('MePdfLogger')) {
      $logger = new MePdfLogger();
      $default_context = [
        'method' => debug_backtrace()[1]['function']
      ];
      $logger->log('', '[McPDFRenewalCtrl] ' . $message, array_merge($default_context, $context));
    }
  }

  /**
   * Sends renewal notification emails for a transaction
   * Performs validation checks on transaction and related entities before sending
   * both user and admin notifications. Attaches PDF invoice and records notification
   * timestamp in transaction meta.
   *
   * @param MeprTransaction $transaction The transaction to process notifications for
   * @return boolean True if all validations pass and notifications sent successfully
   * @see validate_transaction() Validates the transaction object
   * @see validate_user() Validates the associated user
   * @see validate_subscription() Validates the associated subscription
   * @see validate_product() Validates the associated product
   */
  protected function send_renewal_notifications($transaction)
  {
    if (!$this->validate_transaction($transaction)) {
      return false;
    }

    // Get the user associated with the transaction
    $user = $transaction->user();
    if ($this->validate_user($user, $transaction->id) === false) {
      return false;
    }

    // Get the subscription associated with the transaction
    if ($this->validate_subscription($transaction->subscription(), $transaction->id) === false) {
      return false;
    }

    // Get the product associated with the transaction
    if ($this->validate_product(new MeprProduct($transaction->product_id), $transaction->id) === false) {
      return false;
    }

    if (!MePdfInvoicesHelper::is_offline_renewal_invoice_enabled($transaction->gateway)) {
      $this->log_message(sprintf('Automatic renewal is disabled for transaction ID %d', $transaction->id));
      return false;
    }

    $params = MeprTransactionsHelper::get_email_params($transaction);
    $params['pdf_renewal_txn_id'] = $transaction->id;

    // Send user notification
    $sent = $this->send_notification('MeprPdfUserRenewalInvoiceEmail', $transaction, $params, $user->formatted_email());
    if ($sent) {
      $transaction->add_meta('renewal_notice_sent', gmdate('Y-m-d H:i:s'));
    }

    // Send admin notification
    $this->send_notification('MeprPdfAdminRenewalInvoiceEmail', $transaction, $params);

    $this->maybe_clear_attachment_cache($transaction); // Clear the attachment cache

    return true;
  }

  /**
   * Cleans up cached PDF attachments for a transaction
   * If a cached PDF file exists for the transaction, removes it from both
   * the filesystem and the internal cache array
   *
   * @param MeprTransaction|null $transaction The transaction to clear cache for
   * @return void
   * @see safely_remove_file()
   */
  protected function maybe_clear_attachment_cache($transaction)
  {
    if (!$transaction || !$transaction->id) {
      return;
    }

    if (isset($this->txn_pdf_attachments[$transaction->id])) {
      $file = $this->txn_pdf_attachments[$transaction->id];
      if (file_exists($file)) {
        $this->safely_remove_file($file);
      }
      unset($this->txn_pdf_attachments[$transaction->id]);
    }
  }

  /**
   * Add the email path to MemberPress email factory
   *
   * @param array $paths The current email paths
   * @return array The modified email paths
   */
  public function add_email_paths($paths)
  {
    // Add our email path
    $paths[] = MPDFINVOICE_EMAILS;

    return $paths;
  }

  /**
   * Add gateway-specific settings to the offline payment gateway
   *
   * @param MeprArtificialGateway $gateway The gateway object
   * @return void
   */
  public function add_gateway_settings($gateway)
  {
    $mepr_options = MeprOptions::fetch();
    $enable_renewal_invoice = isset($gateway->settings->enable_renewal_invoice) ? $gateway->settings->enable_renewal_invoice : false;
    $days_before_renewal = isset($gateway->settings->days_before_renewal) ? $gateway->settings->days_before_renewal : 1;
    $enable_renewal_invoice = ($enable_renewal_invoice == 'on' || $enable_renewal_invoice == true);
    MeprView::render('/admin/options/artificial_gateway_settings', get_defined_vars());
  }

  /**
   * Check if automatic renewal is enabled for a specific gateway and get days before renewal
   *
   * @param string $gateway_id The gateway ID to check
   * @param boolean $return_days Whether to return days before expiration instead of boolean
   * @return boolean|int True if enabled, false otherwise. If $return_days is true, returns days before expiration or 0 if disabled
   */
  public function is_auto_renewal_enabled($gateway_id)
  {
    $mepr_options = MeprOptions::fetch();
    $gateway = $mepr_options->payment_method($gateway_id);

    $this->log_message(sprintf('Automatic renewal for gateway %s', $gateway_id));

    if ($gateway && isset($gateway->settings->gateway) && $gateway->settings->gateway == 'MeprArtificialGateway') {
      $is_enabled = isset($gateway->settings->enable_renewal_invoice) &&
        ($gateway->settings->enable_renewal_invoice == 'on' || $gateway->settings->enable_renewal_invoice == true);

      return $is_enabled;
    }

    return false;
  }

  /**
   * Creates a PDF receipt for a transaction if not already created
   * Caches the PDF file path to avoid duplicate generation
   *
   * @param MeprTransaction $txn The transaction to create receipt for
   * @return string|null Path to the PDF file if created/cached, null on failure
   * @see MePdfInvoicesCtrl::create_receipt_pdf()
   */
  protected function maybe_create_receipt_pdf($txn)
  {
    if (isset($this->txn_pdf_attachments[$txn->id])) {
      return $this->txn_pdf_attachments[$txn->id]; // PDF already created for this transaction
    }

    $invoice_ctrl = new MePdfInvoicesCtrl();
    $file = $invoice_ctrl->create_receipt_pdf($txn);

    if ($file) {
      $this->txn_pdf_attachments[$txn->id] = $file;
    }

    return $this->txn_pdf_attachments[$txn->id] ?? null; // Return the cached file path or null if not created
  }

  /**
   * Check if the given class is a renewal email class
   *
   * @param mixed $class The class to check
   * @return boolean True if it's a renewal email class, false otherwise
   */
  protected function is_renewal_email_class($class): bool
  {
    return $class instanceof MeprPdfUserRenewalInvoiceEmail ||
      $class instanceof MeprPdfAdminRenewalInvoiceEmail;
  }

  /**
   * Add PDF attachments to the renewal email
   *
   * @param array $attachments Current attachments
   * @param MeprBaseEmail $class Email class
   * @param string $body Email body
   * @param array $values Email values
   * @return array Modified attachments
   */
  public function add_email_attachments($attachments, $class, $body, $values)
  {
    if (!$this->is_renewal_email_class($class)) {
      return $attachments;
    }

    if (isset($values['pdf_renewal_txn_id'])) {
      $txn_id = $values['pdf_renewal_txn_id'];
      $txn = new MeprTransaction($txn_id);

      if (!$txn->id || empty($values['pdf_renewal_txn_id'])) {
        return $attachments;
      }
    } elseif ('johndoe' == $values['user_login']) {
      // We're sending test email
      $txn = new MeprTransaction();
    } else {
      return $attachments;
    }

    $attachments = array(); // Make sure we only add one attachment.

    $file = $this->maybe_create_receipt_pdf($txn);

    if ($file) {
      $attachments[] = $file;
      $attachments = array_unique($attachments); // Make sure we have unique attachments
    }

    return $attachments;
  }

  public function remove_receipt_pdf_invoice($class, $values, $attachments)
  {
    if (!$class instanceof MeprPdfUserRenewalInvoiceEmail && !$class instanceof MeprPdfAdminRenewalInvoiceEmail) {
      return;
    }

    if ($attachments) {
      foreach ($attachments as $attachment) {
        $this->safely_remove_file($attachment);
      }
    }
  }

  protected function safely_remove_file($file_path)
  {
    if (empty($file_path) || !is_string($file_path)) {
      return false;
    }

    // Check for directory traversal attempts before realpath()
    if (
      strpos($file_path, '..') !== false ||
      strpos($file_path, './') !== false ||
      strpos($file_path, '//') !== false
    ) {
      $this->log_message('Directory traversal attempt detected');
      return false;
    }

    $normalized_path = realpath($file_path);
    if (!$normalized_path) {
      return false;
    }

    $mpdf = new MePdfMPDF();
    $lookup_path = $mpdf->get_tempdir();

    // Verify the file is within allowed directory
    $allowed_dir = realpath($lookup_path);
    if (strpos($normalized_path, $allowed_dir) !== 0) {
      $this->log_message('Attempted to remove file outside allowed directory');
      return false;
    }

    if (is_string($normalized_path) && file_exists($normalized_path)) {
      return @unlink($normalized_path);
    }
    return false;
  }

  /**
   * Send a notification email for a transaction
   *
   * @param string $type The type of notification (e.g., 'MeprPdfUserRenewalInvoiceEmail')
   * @param MeprTransaction $transaction The transaction object
   * @param array $params Parameters to pass to the email
   * @param string|null $to Optional recipient email address, defaults to email from the transaction
   * @return boolean True if email sent successfully, false otherwise
   */
  protected function send_notification($type, $transaction, $params, $to = null)
  {
    if (!$transaction || !$transaction->id) {
      $this->log_message("Invalid transaction for notification $type");
      return false;
    }

    try {
      $this->log_message(sprintf('Sending renewal notification [%s] for transaction ID %d', $type, $transaction->id));

      $email = MeprEmailFactory::fetch($type, 'MeprBaseEmail');
      if (!$email->enabled()) {
        $this->log_message("$type notifications disabled");
        return false;
      }

      $email->to = empty($to) ? $email->get_to() : $to;

      return $email->send($params);
    } catch (Exception $e) {
      $this->log_message("Failed to send renewal notification $type: " . $e->getMessage());
      return false;
    }
  }

  /**
   * Process expiring transactions
   * This method fetches expiring transactions and processes them for renewal notifications
   *
   * @return void
   */
  public function process_expiring_transactions()
  {
    $this->log_message('Starting to process expiring transactions');

    // Get expiring transactions
    $expiring_transactions = $this->get_expiring_offline_transactions();

    if (empty($expiring_transactions)) {
      $this->log_message('No expiring offline transactions found');
      return;
    }

    $this->log_message(sprintf(
      'Found %d expiring offline transactions. Will process up to %d.',
      count($expiring_transactions),
      self::MAX_TRANSACTIONS
    ));

    $processed_count = 0;
    foreach ($expiring_transactions as $transaction_data) {
      if ($processed_count >= self::MAX_TRANSACTIONS) {
        $this->log_message('Reached maximum number of transactions to process. Stopping.');
        break;
      }

      $processed_count += $this->process_single_transaction($transaction_data);
    }

    $this->log_message(sprintf('Finished processing expiring transactions. Processed %d transactions.', $processed_count));
  }

  /**
   * Validate transaction data structure and content
   * Checks if the transaction is valid, has the correct status, and meets all requirements
   *
   * @param array $transaction_data Transaction data including transaction object and days before renewal
   * @return array Validation result with 'is_valid' boolean and 'message' string
   */
  private function validate_transaction_data($transaction_data)
  {
    // Validate data structure
    if (!isset($transaction_data['transaction']) || !isset($transaction_data['days'])) {
      return ['is_valid' => false, 'message' => 'Invalid transaction data structure'];
    }

    $transaction = $transaction_data['transaction'];
    $days = $transaction_data['days'];

    // Basic transaction validation
    if (!$transaction || !$transaction->id) {
      return ['is_valid' => false, 'message' => 'Invalid transaction object'];
    }

    // Status validation
    if ($transaction->status !== MeprTransaction::$complete_str) {
      return [
        'is_valid' => false,
        'message' => sprintf(
          'Transaction ID %d has invalid status: %s',
          $transaction->id,
          $transaction->status
        )
      ];
    }

    // Days validation
    if (!is_numeric($days) || $days < 1) {
      return ['is_valid' => false, 'message' => sprintf('Invalid days before renewal: %s', $days)];
    }

    // Required fields validation
    if (empty($transaction->subscription_id)) {
      return ['is_valid' => false, 'message' => sprintf('Transaction ID %d has no subscription ID', $transaction->id)];
    }

    if (empty($transaction->user_id)) {
      return ['is_valid' => false, 'message' => sprintf('Transaction ID %d has no user ID', $transaction->id)];
    }

    if (empty($transaction->gateway)) {
      return ['is_valid' => false, 'message' => sprintf('Transaction ID %d has no gateway', $transaction->id)];
    }

    if (empty($transaction->expires_at)) {
      return ['is_valid' => false, 'message' => sprintf('Transaction ID %d has no expiration date', $transaction->id)];
    }

    // Duplicate check
    if ($this->has_renewal_event($transaction)) {
      return [
        'is_valid' => false,
        'message' => sprintf(
          'Transaction ID %d already has a renewal notice event',
          $transaction->id
        )
      ];
    }

    if ($this->has_pending_renewal_transaction($transaction)) {
      return [
        'is_valid' => false,
        'message' => sprintf(
          'Subscription ID %d already has a pending renewal transaction',
          $transaction->subscription_id
        )
      ];
    }

    // Related entities validation
    $subscription = $transaction->subscription();
    if (!$subscription || $subscription->status !== MeprSubscription::$active_str) {
      return [
        'is_valid' => false,
        'message' => sprintf(
          'Invalid or inactive subscription for transaction ID %d',
          $transaction->id
        )
      ];
    }

    if ($this->validate_product($transaction->product(), $transaction->id) === false) {
      return [
        'is_valid' => false,
        'message' => sprintf(
          'Invalid product for transaction ID %d',
          $transaction->id
        )
      ];
    }

    if ($this->validate_user($transaction->user(), $transaction->id) === false) {
      return [
        'is_valid' => false,
        'message' => sprintf(
          'Invalid user for transaction ID %d',
          $transaction->id
        )
      ];
    }

    return ['is_valid' => true, 'message' => ''];
  }

  /**
   * Process a single transaction for renewal
   * Validates the transaction, creates a pending renewal transaction, and sends notifications
   *
   * @param array $transaction_data Transaction data including transaction object and days before renewal
   * @return int Number of transactions processed (1 for success, 0 for failure)
   */
  private function process_single_transaction($transaction_data)
  {
    if (!$this->validate_transaction($transaction_data['transaction'])) {
      return 0;
    }

    $validation_result = $this->validate_transaction_data($transaction_data);
    if (!$validation_result['is_valid']) {
      $this->log_message($validation_result['message'] . '. Skipping.');
      return 0;
    }

    $transaction = $transaction_data['transaction'];
    $days_before_renewal = $transaction_data['days'];

    try {
      // Create pending renewal transaction
      $new_transaction = $this->create_pending_renewal_transaction($transaction);
      if (!$new_transaction) {
        return 0;
      }

      // Record the event to prevent duplicate processing
      $this->record_renewal_event($transaction, $days_before_renewal);

      // Send email notifications
      $this->send_renewal_notifications($new_transaction);

      $this->log_message(sprintf(
        'Successfully created pending renewal transaction ID %d for subscription ID %d',
        $new_transaction->id,
        $transaction->subscription_id
      ));

      return 1;
    } catch (Exception $e) {
      $this->log_message(sprintf('Error processing transaction ID %d: %s', $transaction->id, $e->getMessage()));
      return 0;
    }
  }

  /**
   * Validates a transaction object
   * Checks if the transaction exists and has a valid ID
   *
   * @param MeprTransaction|null $transaction The transaction to validate
   * @return bool True if transaction is valid, false otherwise
   */
  private function validate_transaction($transaction)
  {
    if (!$transaction || !$transaction->id) {
      $this->log_message("Invalid transaction");
      return false;
    }
    return true;
  }

  /**
   * Validates a subscription object
   * Checks if the subscription exists, has a valid ID, and is of correct type
   *
   * @param MeprSubscription|null $subscription The subscription to validate
   * @param int $transaction_id Associated transaction ID for error logging
   * @return bool True if subscription is valid, false otherwise
   */
  private function validate_subscription($subscription, $transaction_id)
  {
    if (!$subscription || !$subscription->id || !($subscription instanceof MeprSubscription)) {
      $this->log_message(sprintf('Failed to get valid subscription for transaction ID %d', $transaction_id));
      return false;
    }
    return true;
  }

  /**
   * Validates a product object
   * Checks if the product exists, has a valid ID, and is of correct type
   *
   * @param MeprProduct|null $product The product to validate
   * @param int $transaction_id Associated transaction ID for error logging
   * @return bool True if product is valid, false otherwise
   */
  private function validate_product($product, $transaction_id)
  {
    if (!$product || !$product->ID || !($product instanceof MeprProduct)) {
      $this->log_message(sprintf('Failed to get product for transaction ID %d', $transaction_id));
      return false;
    }
    return true;
  }

  /**
   * Validates a user object
   * Checks if the user exists, has a valid ID, and is of correct type
   *
   * @param MeprUser|null $user The user to validate
   * @param int $transaction_id Associated transaction ID for error logging
   * @return bool True if user is valid, false otherwise
   */
  private function validate_user($user, $transaction_id)
  {
    if (!$user || !$user->ID || !($user instanceof MeprUser)) {
      $this->log_message(sprintf('Invalid user for transaction ID %d', $transaction_id));
      return false;
    }
    return true;
  }

  /**
   * AJAX handler to resend renewal invoice email
   * Validates the request, checks permissions, and sends the renewal notifications
   *
   * @return void
   */
  public function ajax_resend_renewal_invoice()
  {
    if (!MeprUtils::is_mepr_admin()) {
      die(__('You do not have access.', 'memberpress', 'memberpress-pdf-invoice'));
    }

    // Validate nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'mepr_pdf_invoice')) {
      die(__('Invalid request. Please try again.', 'memberpress', 'memberpress-pdf-invoice'));
    }

    if (!isset($_POST['id']) || empty($_POST['id']) || !is_numeric($_POST['id'])) {
      die(__('Could not send email. Please try again later.', 'memberpress', 'memberpress-pdf-invoice'));
    }

    $txn = new MeprTransaction($_POST['id']);
    if (false === $this->validate_transaction($txn)) {
      die(__('Transaction not found.', 'memberpress', 'memberpress-pdf-invoice'));
    }

    $return = $this->send_renewal_notifications($txn);
    if (!$return) {
      die(__('Unable to send renewal notifications.', 'memberpress', 'memberpress-pdf-invoice'));
    }

    die(__('Email sent', 'memberpress', 'memberpress-pdf-invoice'));
  }

  /**
   * Get PF invoice number
   *
   * @param MeprTransaction $txn
   *
   * @return [type]
   */
  public function get_invoice_no(MeprTransaction $txn){
    $invoice_number = MePdfProformaInvoiceNumber::get_invoice_num($txn->id);
    if($invoice_number){
      return apply_filters('mepr-pdf-pf-invoice-number', sprintf("%02d", $invoice_number)) ;
    }

    return $txn->id;
  }

  /**
   * Override `invoice_num` param
   *
   * @param  mixed $params
   * @param  mixed $txn
   *
   * @return void
   */
  public function more_pf_invoice_params( $params, $txn ) {
    if(MeprTransaction::$pending_str !== $txn->status){
      return $params;
    }

    if(! MePdfInvoicesHelper::is_offline_renewal_transaction($txn)) {
      return $params;
    }

    $params['invoice_num'] = $this->get_invoice_no( $txn );

    return $params;
  }

  /**
   * Generate and store an invoice number for the given transaction ID.
   *
   * @param int $transaction_id
   */
  protected function store_invoice_number($new_transaction, $transaction)
  {
    $pf_invoice_no = absint(MePdfProformaInvoiceNumber::next_invoice_num());

    if($pf_invoice_no <= 0) {
      return;
    }

    $invoice_number = new MePdfProformaInvoiceNumber();
    $invoice_number->invoice_number = absint($pf_invoice_no);
    $invoice_number->parent_transaction_id  = $transaction->id;
    $invoice_number->transaction_id = $new_transaction->id;
    $invoice_number->due_date = $transaction->expires_at;
    $invoice_number->store();
  }

  public function maybe_assume_offline_txn_renewal($bool, $txn) {
    // if WP AJAX request
    // if action = mepr_send_test_email
    // if email = MeprPdfUserRenewalInvoiceEmail or MeprPdfAdminRenewalInvoiceEmail
    // If the transaction is a pending renewal transaction, assume it is a renewal
    // then set to true.
    if ( is_admin() && MeprUtils::is_mepr_admin() && wp_doing_ajax() && isset($_POST['action'], $_POST['e']) && $_POST['action'] === 'mepr_send_test_email' &&
        in_array($_POST['e'], ['MeprPdfUserRenewalInvoiceEmail', 'MeprPdfAdminRenewalInvoiceEmail'], true) ) {
        return true; // Assume it is a renewal
    }
    // Otherwise, return the original boolean value
    return $bool;
  }

}