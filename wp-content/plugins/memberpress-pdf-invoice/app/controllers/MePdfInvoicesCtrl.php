<?php
if ( ! defined( 'ABSPATH' ) ) {
  die( 'You are not allowed to call this page directly.' );
}

class MePdfInvoicesCtrl extends MeprBaseCtrl {

  protected $invoice = array();
  protected $txn;

  public function __construct() {
    parent::__construct();

    $this->addon_updates();
  }

  /**
   * Enable updates for this add-on.
   */
  public function addon_updates() {
    if(class_exists('MeprAddonUpdates')) {
      new MeprAddonUpdates(
        MPDFINVOICE_SLUG,
        MPDFINVOICE_FILE,
        'mpdfinvoice_license_key',
        'MemberPress PDF Invoice',
        'PDF Invoice Integration for MemberPress'
      );
    }
  }

  /**
   * Load hooks.
   *
   * @return void
   */
  public function load_hooks() {
    add_action( 'admin_init', array($this, 'upgrade_db') );
    add_filter( 'mepr_admin_transaction_validation_errors', array( $this, 'validate_transaction' ), 10, 3 );
    add_action( 'mepr_account_payments_table_header', array( $this, 'table_header' ) );
    add_action( 'mepr_account_payments_table_row', array( $this, 'table_row' ) );
    add_action( 'wp_ajax_mepr_download_invoice', array( $this, 'ajax_download_invoice' ) );
    add_action( 'admin_notices', array($this, 'missing_starting_num'));
    add_filter( 'mepr_get_model_attribute_invoice_num', array($this, '__get_transaction_invoice_num'), 10, 2 );

    add_action( 'mepr_display_info_options', array( $this, 'admin_options_invoice_fields' ) );
    add_filter( 'mepr_view_paths', array( $this, 'add_view_path' ) );

    add_filter( 'mepr_validate_options', array( $this, 'validate_options' ) );
    add_action( 'mepr_process_options', array( $this, 'process_options' ) );
    add_filter( 'mepr_options_dynamic_attrs', array( $this, 'add_dynamic_attrs' ) );
    add_action( 'admin_enqueue_scripts', 'MePdfInvoicesCtrl::enqueue_scripts' );

    add_filter( 'mepr_transaction_email_params', array( $this, 'more_invoice_params' ), 10, 2 );
    add_filter( 'mepr_pdf_invoice_data', array( $this, 'test_invoice_data' ), 10, 2 );
    add_filter( 'mepr_wp_mail_headers', array( $this, 'add_email_headers' ), 10, 5 );
    add_filter( 'mepr_email_send_attachments', array( $this, 'add_email_attachments' ), 10, 4 );
    add_filter( 'mepr_email_sent', array( $this, 'remove_receipt_pdf_invoice' ), 10, 3 );
    add_action( 'mepr_event_transaction_completed', array( $this, 'create_invoice_number' ));
    add_action( 'mepr_txn_status_confirmed', array( $this, 'maybe_create_order_sub_invoice_number' ));
    add_action( 'mepr_txn_status_refunded', array( $this, 'create_negative_invoice' ));
    add_action( 'mepr_admin_txn_form_before_user', array( $this, 'invoice_num_html_field' ) );
    add_action( 'mepr_admin_txn_row_action_links', array( $this, 'add_txn_action_links' ), 10, 3 );
    add_action( 'mepr_readylaunch_thank_you_page_after_invoice', array( $this, 'render_print_button_readylaunch' ) );
  }

  /**
   * Enqueues styles and scripts
   *
   * @param  mixed $hook
   *
   * @return void
   */
  public static function enqueue_scripts( $hook ) {
    if ( $hook == 'memberpress_page_memberpress-options' ) {
      // Add the color picker css file
      wp_enqueue_style( 'wp-color-picker' );
      wp_enqueue_style( 'mepr-pdfinvoice-css', MPDFINVOICE_URL . 'css/invoice.css', array( 'mp-options' ), MPDFINVOICE_VERSION );
    }

    if(in_array($hook, array('memberpress_page_memberpress-trans', 'memberpress_page_memberpress-options'))){
      $data = array(
        'invoice_num_confirm' => sprintf('%s (%s). %s', __('Invoice Number is lower than the last Transaction ID', 'memberpress-pdf-invoice'), MePdfInvoiceNumber::get_last_transaction(), __('Are you sure you want to continue?', 'memberpress-pdf-invoice')),
        'last_txn' => MePdfInvoiceNumber::get_last_transaction(),
        'ajax_url' => admin_url( 'admin-ajax.php' ),
        'nonce' => wp_create_nonce( 'mepr_pdf_invoice' ),
      );

      wp_enqueue_script( 'mepr-pdfinvoice-js', MPDFINVOICE_URL . 'js/invoice.js', array( 'jquery', 'wp-color-picker' ), MPDFINVOICE_VERSION );
      wp_localize_script('mepr-pdfinvoice-js', 'MeprPDFInvoice', $data);
    }
  }

  /**
   * Outputs Download column header to Account>Payment page
   *
   * @return void
   */
  public function table_header() { ?>
    <th scope="col"><?php _ex( 'Download', 'ui', 'memberpress-pdf-invoice' ); ?></th>
    <?php
  }

  /**
   * Outputs Download column row to Account>Payment page
   *
   * @param  mixed $payment
   *
   * @return void
   */
  public function table_row( $payment ) {
    ?>
    <td data-label="<?php echo esc_html_x( 'Download', 'ui', 'memberpress-pdf-invoice' ); ?>">
      <a href="<?php
      echo MeprUtils::admin_url(
        'admin-ajax.php',
        array( 'download_invoice', 'mepr_invoices_nonce' ),
        array(
          'action' => 'mepr_download_invoice',
          'txn'    => $payment->id,
        )
      );
      ?>" target="_blank"><?php echo esc_html_x( 'PDF', 'ui', 'memberpress-pdf-invoice' ); ?></a>
    </td>
    <?php
  }

  /**
   * Adds Invoice Setting fields to MemberPress Settings page.
   *
   * @return void
   */
  public function admin_options_invoice_fields() {
    $mepr_options = MeprOptions::fetch();
    MeprView::render( '/admin/options/invoice', get_defined_vars() );
  }

  /**
   * Dynamic attributes for admin invoice settings
   *
   * @param  mixed $attrs
   *
   * @return array
   */
  public function add_dynamic_attrs( $attrs ) {
    $attrs = array_merge( $attrs, MePdfInvoicesHelper::get_dynamic_attrs() );
    return $attrs;
  }

  /**
   * Hooks to MemberPress validation function
   *
   * @param  mixed $errors
   *
   * @return array
   */
  public function validate_options( $errors ) {
    // Validate Logo
    if ( isset( $_FILES['mepr_biz_logo'] ) && ! empty( $_FILES['mepr_biz_logo']['name'] ) ) {
      $filetype = wp_check_filetype( basename( $_FILES['mepr_biz_logo']['name'] ), null );
      if ( ! in_array( $filetype['type'], array( 'image/jpeg', 'image/gif', 'image/png' ) ) ) {
        $errors[] = esc_html__( 'Business Logo must have a valid image extension. Valid extensions are JPG, PNG, and GIF', 'memberpress-pdf-invoice' );
      }
    }

    // Validate Business Email
    if ( isset( $_POST['mepr_biz_email'] ) && !empty( $_POST['mepr_biz_email'] ) && false == is_email( $_POST['mepr_biz_email'] ) ) {
      $errors[] = esc_html__( 'Invalid Business Email Format', 'memberpress-pdf-invoice' );
    }

    return $errors;
  }

  /**
   * Process invoice settings values
   *
   * @param  mixed $params
   *
   * @return void
   */
  public function process_options( $params ) {
    $mepr_options = MeprOptions::fetch();

    if (isset($_POST['mepr_biz_invoice_format'])) {
      $_POST['mepr_biz_invoice_format'] = htmlspecialchars($_POST['mepr_biz_invoice_format']);
    }

    if ( isset( $_FILES['mepr_biz_logo'] ) && ! empty( $_FILES['mepr_biz_logo']['name'] ) ) {
      $upload = wp_upload_bits( $_FILES['mepr_biz_logo']['name'], null, @file_get_contents( $_FILES['mepr_biz_logo']['tmp_name'] ) );

      if ( false === $upload['error'] ) {

        // Check the type of file. We'll use this as the 'post_mime_type'.
        $filetype = wp_check_filetype( basename( $upload['file'] ), null );
        $tempDir  = wp_upload_dir();

        // Prepare an array of post data for the attachment.
        $attachment = array(
          'guid'           => $tempDir['url'] . '/' . basename( $upload['file'] ),
          'post_mime_type' => $filetype['type'],
          'post_title'     => preg_replace( '/\.[^.]+$/', '', basename( $upload['file'] ) ),
          'post_content'   => '',
          'post_status'    => 'inherit',
        );
        $attach_id  = wp_insert_attachment( $attachment, $upload['file'] );
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $attach_data = wp_generate_attachment_metadata( $attach_id, $upload['file'] );
        wp_update_attachment_metadata( $attach_id, $attach_data );
        $_POST['mepr_biz_logo'] = $attach_id;
      }
    } elseif ( isset( $_POST['mepr_biz_logo_remove'] ) && '1' == $_POST['mepr_biz_logo_remove'] ) {
      wp_delete_attachment( $mepr_options->attr( 'biz_logo' ) );
      $_POST['mepr_biz_logo'] = '';
    }
  }

  /**
   * Download process begins
   *
   * @return void
   */
  public function ajax_download_invoice() {
    $current_user = MeprUtils::get_currentuserinfo();

    // Exit if any of the checks fail.
    $this->do_security_checks( $current_user );

    $mepr_options = MeprOptions::fetch();
    $prd          = $this->txn->product();

    // Prepare the data
    $invoice = (object) $this->collect_invoice_data( $this->txn, $mepr_options, $prd, $current_user );

    $mpdf = new MePdfMPDF();
    $mpdf->render( $invoice, $this->txn );

    wp_die();
  }


  /**
   * Security checks
   *
   * @return array
   */
  public function do_security_checks() {

    check_ajax_referer( 'download_invoice', 'mepr_invoices_nonce' );

    if ( ! MeprUtils::is_user_logged_in() ) {
      MeprUtils::exit_with_status( 403, esc_html__( 'Forbidden', 'memberpress-pdf-invoice' ) );
    }

    $current_user = MeprUtils::get_currentuserinfo();

    if ( ! isset( $_REQUEST['txn'] ) ) {
      MeprUtils::exit_with_status( 400, esc_html__( 'No transaction specified', 'memberpress-pdf-invoice' ) );
    }

    if ( ! MeprUpdateCtrl::is_activated() ) {
      // MeprUtils::exit_with_status( 403, esc_html__( 'A licensing error has occurred, please contact site administrator.', 'memberpress-pdf-invoice' ) );
    }

    $txn = new MeprTransaction( $_REQUEST['txn'] );
    if ( $txn->id <= 0 ) {
      MeprUtils::exit_with_status( 400, esc_html__( 'Invalid Transaction', 'memberpress-pdf-invoice' ) );
    }

    if ( ! MeprUtils::is_mepr_admin() && $txn->user_id != $current_user->ID ) {
      MeprUtils::exit_with_status( 403, esc_html__( 'Forbidden Transaction', 'memberpress-pdf-invoice' ) );
    }

    $this->txn = $txn;
  }

  /**
   * Gets all invoice data
   *
   * @param  mixed $txn
   * @param  mixed $mepr_options
   * @param  mixed $bill_to
   * @param  mixed $prd
   * @param  mixed $company
   *
   * @return void
   */
  public function collect_invoice_data( $txn, $mepr_options, $prd, $current_user ) {
    $txn_has_order = false;

    if($txn->order_id > 0) {
      if(class_exists('MeprOrder') && ($order = $txn->order()) instanceof MeprOrder) {
        $txn_has_order = true;
        $txn = new MeprTransaction($order->primary_transaction_id);
        $prd = new MeprProduct($txn->product_id);
      }
    }

    $created_ts = strtotime( $txn->created_at );
    $blog_name  = get_option( 'blogname' );

    $this->invoice['template']        = $mepr_options->attr( 'biz_invoice_template' );
    $this->invoice['locale']          = get_locale();
    $this->invoice['invoice_number']  = $this->replace_variables( 'biz_invoice_format', $txn );
    $this->invoice['credit_number']   = $this->get_credit_number( $txn );
    $this->invoice['company']         = $this->replace_variables( 'biz_address_format', $txn );
    $this->invoice['bill_to']         = $this->replace_variables( 'biz_cus_address_format', $txn );
    $this->invoice['logo']            = $mepr_options->attr( 'biz_logo' );

    // Add payment instructions for pending transactions
    $notes = $this->replace_variables( 'biz_invoice_notes', $txn );

    if ($txn->status == MeprTransaction::$pending_str && MePdfInvoicesHelper::is_offline_renewal_transaction($txn)) {
      $pf_invoice = MePdfProformaInvoiceNumber::find_by_txn_id($txn->id);
      $payment_instructions = '';
      if ($pf_invoice) {
        $invoice_due_date_ts = strtotime($pf_invoice->due_date);
        $this->invoice['invoice_due_date_ts']    = $invoice_due_date_ts;

        $invoice_issue_date_ts = strtotime($pf_invoice->created_at);
        $this->invoice['invoice_issue_date_ts']    = $invoice_issue_date_ts;

        $payment_instructions = sprintf(
          __('This is a pending invoice for renewal of your subscription. Payment is due by %s.', 'memberpress-pdf-invoice'),
          date_i18n(get_option('date_format'), $invoice_due_date_ts)
        );
      }

      $additional_desc = __( 'Please log in to your account to complete payment or contact us for assistance.', 'memberpress-pdf-invoice');

      $txn_pm = $txn->payment_method();
      if ($txn_pm->use_desc) {
        $additional_desc = wpautop(esc_html(trim(stripslashes($txn_pm->desc))));
      }

      $payment_instructions .= '<Br /><Br />' . $additional_desc;
      $payment_instructions = wpautop($payment_instructions);

      $notes = '<strong>' . __('PAYMENT INSTRUCTIONS', 'memberpress-pdf-invoice') . ':</strong><Br />' . $payment_instructions . ' <Br />' . $notes;
    }
    $this->invoice['notes'] = $notes;
    $this->invoice['footnotes']       = $this->replace_variables( 'biz_invoice_footnotes', $txn );
    $this->invoice['tax_rate']        = $txn->tax_rate;
    $this->invoice['tax_description'] = $txn->tax_desc;
    $this->invoice['paid_at']         = $created_ts;
    $this->invoice['invoice_date']    = $created_ts;
    $this->invoice['trans_num']       = $txn->trans_num;
    $this->invoice['color']           = $mepr_options->attr( 'biz_invoice_color' );
    // Set appropriate logo based on transaction status
    if ($txn->status == MeprTransaction::$refunded_str) {
      $this->invoice['paid_logo_url'] = MPDFINVOICE_PATH . 'app/views/account/invoice/refund.jpg';
      $this->invoice['payment_status'] = 'refunded';
    } elseif ($txn->status == MeprTransaction::$pending_str) {
      $this->invoice['unpaid_logo_url'] = MPDFINVOICE_PATH . 'app/views/account/invoice/unpaid.png';
      $this->invoice['payment_status'] = 'pending';
    } else {
      $this->invoice['paid_logo_url'] = MPDFINVOICE_PATH . 'app/views/account/invoice/paid.jpg';
      $this->invoice['payment_status'] = 'paid';
    }

    $sub = $txn->subscription();

    if($sub instanceof MeprSubscription && (($sub->trial && $sub->trial_days > 0 && $sub->txn_count < 1) || $txn->txn_type == MeprTransaction::$subscription_confirmation_str)) {
      self::set_invoice_txn_vars_from_sub($txn, $sub);
    }

    $desc = self::get_payment_description($txn, $sub);
    $calculate_taxes = (bool) get_option('mepr_calculate_taxes');
    $tax_inclusive = $mepr_options->attr('tax_calc_type') == 'inclusive';
    $show_negative_tax_on_invoice = get_option('mepr_show_negative_tax_on_invoice');

    if ( ( $coupon = $txn->coupon() ) ) {
      $prd        = new MeprProduct($txn->product_id);
      $show_coupon = true;

      $amount = $sub ? $sub->price : $txn->amount;

      // Add the tax amount to the subtotal if we are showing tax as negative
      if($sub && $show_negative_tax_on_invoice && $sub->tax_reversal_amount > 0) {
        $amount = $amount + $sub->tax_reversal_amount;
      }
      elseif(!$sub && $show_negative_tax_on_invoice && $txn->tax_reversal_amount > 0) {
        $amount = $amount + $txn->tax_reversal_amount;
      }

      if (!$sub && $coupon->discount_mode == 'first-payment' && $coupon->first_payment_discount_amount > 0) {
        // For one-time/non-recurring subscriptions, we can't pull in the price before the discount, so we need to calculate the original amount
        // as we do for standard coupons.
        if ($coupon->first_payment_discount_type == 'percent') {
          // Prevent division by zero when discount is 100% or close to it
          if ($coupon->first_payment_discount_amount >= 100) {
            $amount = 0;
          } else {
            $amount = $amount / (1 - ($coupon->first_payment_discount_amount / 100));
          }
        } else if ($coupon->first_payment_discount_type == 'dollar') {
          $amount = $amount + $coupon->first_payment_discount_amount;
        }
      }
      // For standard discounts the subscription price will be the price after the coupon, so either reverse and show coupon,
      // or hide the coupon, defaults to reverse, to hide coupon they can use the filter to set to false
      elseif ($coupon->discount_amount > 0 && apply_filters('mepr-pdf-invoice-reverse-coupon', true, $txn, $mepr_options, $prd, $current_user)) {
        // Since we store the after coupon price when the coupon is standard discount type, then we have to reverse that for the invoice
        if ($coupon->discount_type == 'percent') {
          // Prevent division by zero when discount is 100% or close to it
          if ($coupon->discount_amount >= 100) {
            $amount = 0;
          } else {
            $amount = $amount / (1 - ($coupon->discount_amount / 100)); //Convert the percent to decimal, subtract from 1, then divide
          }
        } else if ($coupon->discount_type == 'dollar') {
          $amount = $amount + $coupon->discount_amount;
        }
      }
      elseif ($coupon->discount_mode == 'standard') {
        $show_coupon = false;
      }

      if(apply_filters('mepr-pdf-invoice-show-coupon', $show_coupon, $txn, $mepr_options, $prd, $current_user)) {
        $cpn_id     = $coupon->ID;
        $cpn_desc   = sprintf( esc_html__( "Coupon Code '%s'", 'memberpress-pdf-invoice' ), $coupon->post_title );

        if($show_negative_tax_on_invoice && $txn->tax_reversal_amount > 0) {
          $cpn_amount = MeprUtils::format_float( (float) $amount - (float) $txn->amount - (float) $txn->tax_reversal_amount );
        }
        else {
          $cpn_amount = MeprUtils::format_float( (float) $amount - (float) $txn->amount );
        }
      }
    } else {
      $amount     = $show_negative_tax_on_invoice && $txn->tax_reversal_amount > 0 ? $txn->amount + $txn->tax_reversal_amount : $txn->amount;
      $cpn_id     = 0;
      $cpn_desc   = '';
      $cpn_amount = 0.00;
    }

    if ($sub && $coupon) {
      // Check if this invoice is for the first payment when using a first payment discount coupon.
      // We need to check both the first real payment and subscription confirmation txn since the confirmation txn
      // may be used to display the invoice from the RL Thank You page.
      $first_txns = array((int) $sub->first_txn_id);
      $_REQUEST['mepr_get_real_payment'] = true; // ensure we don't get subscription confirmation txn back this time
      $first_txns[] = (int) $sub->first_txn_id;

      if ( $coupon->discount_mode == 'first-payment' &&
           empty( $coupon->discount_amount ) &&
           !in_array((int) $txn->id, $first_txns, true)
      ) {
        // Do not apply coupon to this transaction if it's renewal payment
        // and this coupon is first-payment discount with 0 standard discount
        $cpn_id = 0;
      }
    }

    $items = array(
      $prd->ID => array(
        'description' => $prd->post_title . '&nbsp;&ndash;&nbsp;' . $desc,
        'quantity'    => 1,
        'amount'      => $amount,
        'txn_status'  => $txn->status
      )
    );

    $tax_amount = 0.00;
    $tax_items = array();

    if($txn->tax_rate > 0 || $txn->tax_amount > 0) {
      $txn_tax_amount = $show_negative_tax_on_invoice && $txn->tax_reversal_amount > 0 ? -1 * $txn->tax_reversal_amount : $txn->tax_amount;
      $tax_amount += $txn_tax_amount;

      $tax_item = array(
        'percent' => $txn->tax_rate,
        'type'    => $txn->tax_desc,
        'amount'  => $txn_tax_amount
      );

      if($txn_has_order) {
        $tax_item['post_title'] = $prd->post_title;
      }

      $tax_items = array($prd->ID => $tax_item);
    }

    if( $txn_has_order ) {
      $order_bump_transactions = MeprTransaction::get_all_by_order_id_and_gateway($txn->order_id, $txn->gateway, $txn->id);
      $processed_sub_ids = [];

      if( ! empty($order_bump_transactions) ) {
        foreach( $order_bump_transactions as $order_bump_txn ) {
          $product = $order_bump_txn->product();

          if( $product->ID === $prd->ID ) {
            continue;
          }

          $subscription = $order_bump_txn->subscription();

          if($subscription instanceof MeprSubscription) {
            // Subs can have both a payment txn and confirmation txn, make sure we don't process a sub twice
            if(in_array((int) $subscription->id, $processed_sub_ids, true)) {
              continue;
            }

            $processed_sub_ids[] = (int) $subscription->id;

            if(($subscription->trial && $subscription->trial_days > 0 && $subscription->txn_count < 1) || $order_bump_txn->txn_type == MeprTransaction::$subscription_confirmation_str) {
              self::set_invoice_txn_vars_from_sub($order_bump_txn, $subscription);
            }
          }

          $order_bump_amount = $show_negative_tax_on_invoice && $order_bump_txn->tax_reversal_amount > 0 ? $order_bump_txn->amount + $order_bump_txn->tax_reversal_amount : $order_bump_txn->amount;

          if($order_bump_txn->tax_rate > 0 || $order_bump_txn->tax_amount > 0) {
            $order_bump_tax_amount = $show_negative_tax_on_invoice && $order_bump_txn->tax_reversal_amount > 0 ? -1 * $order_bump_txn->tax_reversal_amount : $order_bump_txn->tax_amount;
            $tax_amount = $tax_amount + $order_bump_tax_amount;

            $tax_items[$product->ID] = array(
              'percent' => $order_bump_txn->tax_rate,
              'type' => $order_bump_txn->tax_desc,
              'amount' => $order_bump_tax_amount,
              'post_title' => $product->post_title,
            );
          }

          $price_string = '';
          if($product->register_price_action != 'hidden' && MeprHooks::apply_filters('mepr_checkout_show_terms', true, $product)) {
            if(!$order_bump_txn->is_one_time_payment() && $subscription instanceof MeprSubscription && $subscription->id > 0) {
              $price_string = MeprAppHelper::format_price_string($subscription, $subscription->price);
            }
            else {
              ob_start();
              MeprProductsHelper::display_invoice($product);
              $price_string = ob_get_clean();
            }
          }

          $order_bump_title = $product->post_title;
          $order_bump_desc = self::get_payment_description($order_bump_txn, $subscription);

          if('' !== $order_bump_desc) {
            $order_bump_title .= '&nbsp;&ndash;&nbsp;' . $order_bump_desc;
          }

          if($price_string != '') {
            $order_bump_title .= apply_filters('mepr_order_bump_price_string', ' <br /><small>' . $price_string . '</small>');
          }

          $items[$product->ID] = array(
            'description' => $order_bump_title,
            'quantity' => 1,
            'amount' => $order_bump_amount,
            'txn_status'  => $order_bump_txn->status
          );
        }
      }
    }

    $this->invoice['items'] = $items;

    $this->invoice['coupon'] = array(
      'id'     => $cpn_id,
      'desc'   => $cpn_desc,
      'amount' => $cpn_amount,
    );

    //If the coupon amount is HIGHER than the membership renewal price.
    if( $cpn_id > 0 && $coupon && $coupon->discount_mode == 'trial-override'
      && $sub && $sub instanceof MeprSubscription && $sub->trial
      && $coupon->trial_amount > $prd->price
    ){
      $this->invoice['items'][$sub->product_id]['amount'] = $txn->amount;
      $this->invoice['coupon']['amount'] = '0';
    }

    $this->invoice['tax_items'] = $tax_items;

    $this->invoice['show_quantity'] = MeprHooks::apply_filters( 'mepr-invoice-show-quantity', false, $txn );

    $quantities = array();
    foreach ( $this->invoice['items'] as $item ) {
      $quantities[] = $item['amount'];
    }

    $this->invoice['subtotal'] = (float) array_sum( $quantities ) - (float) $this->invoice['coupon']['amount'];
    $this->invoice['total']    = $this->invoice['subtotal'] + $tax_amount;
    $this->invoice['tax_amount'] =  $tax_amount;

    $refunded_total_adjustment = 0;
    foreach ( $this->invoice['items'] as $i => $item ) {
      if( $item['txn_status'] == MeprTransaction::$refunded_str ) {
        $this->invoice['items'][$i]['amount'] = -1 * $item['amount'];
        $refunded_total_adjustment = $refunded_total_adjustment - $item['amount'];
      }
    }

    if( $refunded_total_adjustment > 0 ) {
      $this->invoice['subtotal'] = $this->invoice['subtotal'] - $refunded_total_adjustment;
      $this->invoice['total'] =  $this->invoice['total'] - $refunded_total_adjustment;
    }


    return MeprHooks::apply_filters( 'mepr_pdf_invoice_data', $this->invoice, $txn );
  }

  /**
   * Utility function to replace variables
   *
   * @param  mixed $text
   * @param  mixed $values
   *
   * @return mixed
   */
  public function replace_variables( $name, $txn ) {
    $mepr_options = MeprOptions::fetch();
    $text         = $mepr_options->get_attr( $name );
    $params       = MePdfInvoicesHelper::get_invoice_params( $txn );

    return MeprUtils::replace_vals( $text, $params );
  }

  /**
   * Gets view template content
   *
   * @param  mixed $invoice
   * @param  mixed $txn
   *
   * @return mixed
   */
  public static function get_html_content( $invoice, $txn ) {
    $mepr_options  = MeprOptions::fetch();
    $template_name = isset( $invoice->template ) && ! empty( $invoice->template ) ? $invoice->template : $mepr_options->attr( 'invoice_template' );

    $template_name = MeprHooks::apply_filters( 'mpdf_invoices_template_name', $template_name ); // Deprecated.
    $template_name = MeprHooks::apply_filters( 'mepr_pdf_invoice_template_name', $template_name );

    // Does template exists? If not default to simple
    if ( false === MeprView::file( '/account/invoice/' . $template_name ) ) {
      $template_name = 'simple';
    }

    return MeprView::get_string( '/account/invoice/' . $template_name, get_defined_vars() );
  }

  /**
   * Adds these params to TransactionsHelper params array.
   *
   * @param  mixed $params
   * @param  mixed $txn
   *
   * @return void
   */
  public function more_invoice_params( $params, $txn ) {
    $usr          = $txn->user();
    $mepr_options = MeprOptions::fetch();
    $created_ts   = strtotime( $txn->created_at );

    $params['user_address_single'] = str_replace( '<br/>', ', ', preg_replace( '/^(<br\s*\/?>)*|(<br\s*\/?>)*$/i', '', $usr->formatted_address() ) );
    $params['invoice_num']         = $this->get_invoice_no( $txn );
    $params['biz_phone']           = $mepr_options->attr( 'biz_phone' );
    $params['biz_email']           = $mepr_options->attr( 'biz_email' );
    $params['trans_date']          = date_i18n( get_option( 'date_format' ), $created_ts );
    $params['biz_country']         = MePdfInvoicesHelper::get_formatted_country( $mepr_options->attr( 'biz_country' ) );
    $params['site_domain']         = home_url();
    $params['pdf_txn']             = $txn->id;

    return $params;
  }

  /**
   * Get invoice number
   *
   * @param MeprTransaction $txn
   *
   * @return [type]
   */
  public function get_invoice_no(MeprTransaction $txn){
    $mepr_options = MeprOptions::fetch();
    $starting_no = $mepr_options->attr( 'inv_starting_number' );

    // If the starting number is NOT set, we don’t add invoice numbers until they’ve set it
    if(empty($starting_no) || !is_numeric($starting_no)){
      return $txn->id;
    }

    $invoice_number = MePdfInvoiceNumber::get_invoice_num($txn->id);
    if($invoice_number){
      return apply_filters('mepr-pdf-invoice-number', sprintf("%02d", $invoice_number)) ;
    }

    return $txn->id;
  }

  /**
   * Generate and store an invoice number when a transaction is completed.
   *
   * @param MeprEvent $event
   */
  public function create_invoice_number($event) {
    // If it's free, no need for invoice number
    $transaction = $event->get_data();
    if($transaction->amount <= 0){
      return;
    }

    // Already has an invoice number?
    if(MePdfInvoiceNumber::find_invoice_num_by_txn_id($transaction->id)){
      return;
    }

    if(class_exists('MeprOrder')) {
      $order = $transaction->order();

      if($order instanceof MeprOrder && $order->primary_transaction_id != $transaction->id) {
        // Don't create an invoice number if this isn't the primary transaction for an order.
        return;
      }
    }

    $this->store_invoice_number((int) $transaction->id);
  }

  /**
   * Create an invoice number when a transaction is confirmed if this is the primary transaction for a multi-item order.
   *
   * @param MeprTransaction $transaction
   */
  public function maybe_create_order_sub_invoice_number($transaction)
  {
    // Already has an invoice number?
    if(MePdfInvoiceNumber::find_invoice_num_by_txn_id($transaction->id)) {
      return;
    }

    if(class_exists('MeprOrder')) {
      $order = $transaction->order();

      if($order instanceof MeprOrder && $order->primary_transaction_id == $transaction->id) {
        $this->store_invoice_number((int) $transaction->id);
      }
    }
  }

  /**
   * Generate and store an invoice number for the given transaction ID.
   *
   * @param int $transaction_id
   */
  protected function store_invoice_number($transaction_id)
  {
    $invoice_no = absint(MePdfInvoiceNumber::next_invoice_num());

    if($invoice_no <= 0) {
      return;
    }

    $invoice_number = new MePdfInvoiceNumber();
    $invoice_number->invoice_number = absint($invoice_no);
    $invoice_number->transaction_id = $transaction_id;
    $invoice_number->store();
  }

  /**
   * Get credit number
   * @param mixed $txn
   *
   * @return [type]
   */
  public function get_credit_number($txn){
    if(MeprTransaction::$refunded_str == $txn->status){
      $invoice_num = $this->get_invoice_no( $txn );
      $credit_num = MePdfCreditNote::get_credit_num($invoice_num);
      return sprintf("%02d", $credit_num);
    }
    return false;
  }


  /**
   * Validate transaction invoice number input
   * @param mixed $errors
   *
   * @return [type]
   */
  public function validate_transaction($errors){
    if(isset($_POST['invoice_num']) && !empty($_POST['invoice_num'])) {
      $next_invoice_number = MePdfInvoiceNumber::next_invoice_num();

      if(MePdfInvoiceNumber::find_invoice_num($_POST['invoice_num'])){
        $errors[] = __("Invoice Number already exists. Invoice number is a unique incremental ID. The next Invoice number is ", 'memberpress-pdf-invoice') . $next_invoice_number;
      }
      else{
        $mepr_options = MeprOptions::fetch();
        $starting_no = $mepr_options->attr( 'inv_starting_number' );
        if(is_numeric($starting_no)){
          if(absint($_POST['invoice_num']) > $next_invoice_number){
            $errors[] = __("Wrong Invoice Number. Invoice number is a unique incremental ID. Select a number equal to or lower than the Next Invoice number which is ", 'memberpress-pdf-invoice') . $next_invoice_number;
          }
        }
        else{
          $errors[] = __("<strong>Invoice Number:</strong> Please add Next Invoice number in <em>MemberPress > Settings > Info</em>", 'memberpress-pdf-invoice');
        }
      }

      if(empty($errors)){
        $invoice_number = new MePdfInvoiceNumber();
        $invoice_number->invoice_number = absint($_POST['invoice_num']);
        $invoice_number->transaction_id = absint($_GET['id']);
        $invoice_number->store();
      }
    }

    return $errors;
  }

  /**
   * @param mixed $txn
   *
   * @return [type]
   */
  public function create_negative_invoice($txn){
    $invoice_number = MePdfInvoiceNumber::get_invoice_num($txn->id);
    if(!$invoice_number) return;

    $credit_note = new MePdfCreditNote();
    $credit_note->invoice_number = $invoice_number;
    $credit_note->store();
  }

  /**
   * test_email_params
   *
   * @param  mixed $params
   * @param  mixed $txn
   * @return void
   */
  public function test_invoice_data($invoice, $txn){
    if($txn->id == 0){

      $mepr_options = MeprOptions::fetch();

      $invoice['bill_to']      = '<br/>' .
                                      __('John Doe', 'memberpress-pdf-invoice') .'<br/>' .
                                      __('111 Cool Avenue', 'memberpress-pdf-invoice') .'<br/>' .
                                      __('New York, NY 10005', 'memberpress-pdf-invoice') . '<br/>' .
                                      __('United States', 'memberpress-pdf-invoice') . '<br/>';
      $invoice['items']             = array(
        array(
          'description' => esc_html__( 'Bronze Edition', 'memberpress-pdf-invoice' ) . '&nbsp;&ndash;&nbsp;' . esc_html__( 'Initial Payment', 'memberpress-pdf-invoice' ),
          'quantity'    => 1,
          'amount'      => sprintf( '%s'.MeprUtils::format_float(15.15), stripslashes( $mepr_options->currency_symbol ) ),
        ),
      );

      $invoice['coupon'] = array(
        'id'      => 0,
        'desc'    => '',
        'amount'  => 0
      );

      $invoice['tax']               = array(
          'percent' => 10,
          'type'    => '',
          'amount'  => MeprUtils::format_float(0.15)
      );
      $invoice['paid_at'] = time();
      $invoice['tax_rate'] = 10;
      $invoice['subtotal'] = MeprUtils::format_float(15.15);
      $invoice['total'] = MeprUtils::format_float(15.30);
    }

    return $invoice;
  }

  public function invoice_num_html_field($txn){
    ob_start();
    if( $txn->invoice_num == NULL ):
    ?>
    <tr valign="top">
      <th scope="row"><label for="invoice_num"><?php _e('Invoice Number*:', 'memberpress-pdf-invoice'); ?></label></th>
      <td>
        <input type="text" name="invoice_num" id="invoice_num" value="<?php echo esc_attr($txn->invoice_num); ?>" class="regular-text" />
        <p class="description"><?php _e('A unique Invoice ID for this Transaction. Only edit this if you absolutely have to.', 'memberpress-pdf-invoice'); ?></p>
      </td>
    </tr>
    <?php
    $field = ob_get_clean();
    echo $field;
    endif;
  }

  /**
   *  Attach Invoice PDF file to email message
   *
   * @param  mixed $attachments
   * @param  mixed $class
   * @param  mixed $body
   * @param  mixed $values
   * @return string
   */
  public function add_email_attachments($attachments, $class, $body, $values){

    if (($class instanceof MeprUserReceiptEmail||$class instanceof MeprAdminReceiptEmail) && isset($values['pdf_txn'])) {
      $txn_id = $values['pdf_txn'];
      $txn = new MeprTransaction($txn_id);

      if(!$txn->id || empty($values['pdf_txn'])){
        return $attachments;
      }
    }
    elseif(($class instanceof MeprUserReceiptEmail||$class instanceof MeprAdminReceiptEmail) && 'johndoe' == $values['user_login']){
      // We're sending test email
      $txn = new MeprTransaction();
    }
    else{
      return $attachments;
    }

    $file = $this->create_receipt_pdf($txn);
    if($file){
      $attachments[] = $file;
    }

    return $attachments;
  }


  /**
   * create_receipt_pdf
   *
   * @param  mixed $txn
   * @return string|null|boolean
   */
  public function create_receipt_pdf($txn){
    $mepr_options = MeprOptions::fetch();
    $prd = $txn->product();
    $current_user = MeprUtils::get_currentuserinfo();
    $invoice = (object) $this->collect_invoice_data( $txn, $mepr_options, $prd, $current_user );

    // Create and Save PDF in the Uploads directory
    $mpdf = new MePdfMPDF();
    $path = $mpdf->save( $invoice, $txn );
    return $path;
  }

  public function remove_receipt_pdf_invoice($class, $values, $attachments){
    if(!$class instanceof MeprUserReceiptEmail && !$class instanceof MeprBaseEmail){
      return;
    }

    if($attachments){
      foreach ($attachments as $attachment) {
        if(file_exists($attachment)) {
          unlink($attachment);
        }
      }
    }
  }

  public function add_email_headers($headers, $recipients,  $subject, $message, $attachments){
    if($attachments){
      $separator = md5(time());
      $eol = PHP_EOL;
      $headers = "MIME-Version: 1.0".$eol;
      // $headers .= "Content-Type: application/pdf".$eol; // see below
      // $headers .= "Content-Transfer-Encoding: 7bit".$eol;
    }
    return $headers;
  }

  /**
   * Register the plugin views path.
   *
   * @param  array $paths The current views paths.
   * @return array
   */
  public function add_view_path($paths) {
    array_splice($paths, 1, 0, MPDFINVOICE_PATH . 'app/views');
    return $paths;
  }

  /**
   * Admin notice to add next starting number
   * @return [type]
   */
  public static function missing_starting_num() {
    $starting_num = MePdfInvoiceNumber::get_starting_number();
    if(empty($starting_num)) {
      MeprView::render( '/admin/update/missing-starting-num', get_defined_vars() );
    }
  }


  /**
   * Using magic method, get transaction invoice number.
   *
   * @param mixed $value
   * @param MeprBaseModel $transaction
   * @see mepr_get_model_attribute hook
   *
   * @return int|null
   */
  public function __get_transaction_invoice_num($value, $transaction) {
    if($transaction instanceof MeprTransaction){
      $db = MePdfDB::fetch();
      $invoice = $db->get_one_record($db->invoice_numbers, array('transaction_id' => $transaction->id));
      if($invoice){
        $value = absint( $invoice->invoice_number );
      }
    }

    return $value;
  }

  public function upgrade_db() {
    $mpdf_db = MePdfDB::fetch();

    if($mpdf_db->do_upgrade()) {
      @ignore_user_abort(true);
      @set_time_limit(0);

      if(is_multisite() && is_super_admin()) {
        global $blog_id;
        // If we're on the root blog then let's upgrade every site on the network
        if($blog_id==1) {
          $mpdf_db->upgrade_multisite();
        }
        else {
          $mpdf_db->upgrade();
        }
      }
      else {
        $mpdf_db->upgrade();
      }
    }
  }

  public static function format_real_number($number) {
    global $wp_locale;

    $decimal_point = $wp_locale->number_format['decimal_point'];
    $thousands_sep = $wp_locale->number_format['thousands_sep'];

    return (string)number_format((float)$number, 2, $decimal_point, $thousands_sep);
  }

  protected static function get_payment_description($txn, $sub) {
    if($sub instanceof MeprSubscription) {
      if($txn->subscription_payment_index() <= 1) {
        $desc = esc_html__('Initial Payment', 'memberpress-pdf-invoice');
      }
      else {
        $desc = esc_html__('Subscription Payment', 'memberpress-pdf-invoice');
      }
    }
    else {
      $desc = esc_html__('Payment', 'memberpress-pdf-invoice');
    }

    if($txn->status == MeprTransaction::$refunded_str) {
      $desc .= ' ' . esc_html__('Refund', 'memberpress-pdf-invoice');
    }

    return $desc;
  }

  /**
   * Set the transaction vars from the given subscription
   *
   * Used when there is a trial period or confirmation transaction to be displayed in the invoice.
   *
   * @param MeprTransaction $txn
   * @param MeprSubscription $sub
   */
  protected static function set_invoice_txn_vars_from_sub(MeprTransaction $txn, MeprSubscription $sub) {
    if($sub->trial && $sub->trial_days > 0) {
      $txn->amount = $sub->trial_total - $sub->trial_tax_amount;
      $txn->total = $sub->trial_total;
      $txn->tax_amount = $sub->trial_tax_amount;
      $txn->tax_reversal_amount = $sub->trial_tax_reversal_amount;
    }
    else {
      $txn->amount = $sub->price;
      $txn->total = $sub->total;
      $txn->tax_amount = $sub->tax_amount;
      $txn->tax_reversal_amount = $sub->tax_reversal_amount;
    }

    $txn->tax_rate = $sub->tax_rate;
    $txn->tax_desc = $sub->tax_desc;
    $txn->tax_class = $sub->tax_class;
  }

  /**
   * Displays PDF Invoice and Send Renewal Invoice (if applicable) links.
   *
   * @param array $links
   * @param mixed $rec
   * @param mixed $txn
   */
  public function add_txn_action_links($links, $rec, $txn) {
    if (! $txn || !$txn->id || !($txn instanceof \MeprTransaction)) {
      return $links;
    }

    // Base invoice link
    $invoice_link = [
      'href' => \MeprUtils::admin_url(
        'admin-ajax.php',
        ['download_invoice', 'mepr_invoices_nonce'],
        ['action' => 'mepr_download_invoice', 'txn' => $rec->id]
      ),
      'text' => esc_html__('PDF Invoice', 'memberpress-pdf-invoice'),
      'class' => '',
      'target' => '_blank',
      'priority' => 25
    ];

    // Renewal flow
    if (in_array($rec->status, [\MeprTransaction::$pending_str])
      && MePdfInvoicesHelper::is_offline_renewal_transaction($txn)
    ) {

      if (\MeprUtils::is_mepr_admin()) {
        $links['send_renewal_invoice'] = [
          'href' => '',
          'title' => '',
          'text' => esc_html__('Send Proforma Invoice', 'memberpress-pdf-invoice'),
          'class' => 'mepr_resend_txn_invoice_email',
          'data' => ['value' => $rec->id],
          'id' => 'send-renewal-invoice-' . $rec->id,
          'wrapper_id' => 'renewal-invoice-wrapper-' . $rec->id,
          'priority' => 12
        ];
      }
      $invoice_link['text'] = esc_html__('PDF Proforma Invoice', 'memberpress-pdf-invoice');
      $links['download_invoice'] = $invoice_link;
    }
    // Non-pending/failed transaction flow
    elseif (!in_array($rec->status, [\MeprTransaction::$pending_str, \MeprTransaction::$failed_str])) {
      $links['download_invoice'] = $invoice_link;
    }

    return $links;
  }

  /**
   * Displays print button on the thank you page.
   *
   * @param \MeprTransaction $txn
   * @return void
   */
  public function render_print_button_readylaunch($txn) {
    if (! $txn || !$txn->id || !($txn instanceof \MeprTransaction)) {
      return;
    }

    if (!in_array($txn->status, [MeprTransaction::$complete_str, MeprTransaction::$confirmed_str], true)) {
      return;
    }

    $url = MeprUtils::admin_url(
      'admin-ajax.php',
      ['download_invoice', 'mepr_invoices_nonce'],
      [
        'action' => 'mepr_download_invoice',
        'txn'    => $txn->id,
      ]
    );
    ?>
    <a class="mepr-invoice-print mepr-button" href="<?php echo esc_url($url); ?>" target="_blank">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round"
        d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
      </svg>
      <?php echo esc_html_x('Print', 'ui', 'memberpress-pdf-invoice'); ?>
    </a>
    <?php
  }
} //End class
