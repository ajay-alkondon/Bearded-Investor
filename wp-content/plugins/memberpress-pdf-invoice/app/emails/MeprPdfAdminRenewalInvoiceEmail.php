<?php
if (!defined('ABSPATH')) {
  die('You are not allowed to call this page directly.');
}

/**
 * Email sent to admin when an offline payment renewal invoice is generated
 */
class MeprPdfAdminRenewalInvoiceEmail extends MeprBaseOptionsAdminEmail
{
  /**
   * Set the default enabled, title, subject & body
   *
   * @param  array $args The arguments.
   * @return void
   */
  public function set_defaults($args = [])
  {
    $this->title       = __('<b>Offline Payment Request Proforma Invoice</b>', 'memberpress-pdf-invoice');
    $this->description = __('This email is sent to the administrator when a renewal invoice is generated for an offline payment subscription.', 'memberpress-pdf-invoice');
    $this->ui_order    = 50; // Place it after other admin emails

    $enabled = $use_template = $this->show_form = true;
    $subject = __('[{$blog_name}] Offline Payment Renewal Invoice Generated - {$firstname} {$lastname}', 'memberpress-pdf-invoice');
    $body    = $this->body_partial();

    $this->defaults  = compact('enabled', 'subject', 'body', 'use_template');
    $this->variables = array_unique(
      array_merge(
        MeprTransactionsHelper::get_email_vars(),
        MeprSubscriptionsHelper::get_email_vars(),
        MeprUsersHelper::get_email_vars()
      )
    );
  }

  /**
   * Returns the default email body
   *
   * @return string
   */
  public function body_partial($vars = [])
  {
    $file = MeprView::file('/emails/AdminRenewalInvoiceEmail');
    if (!$file) {
      return '';
    }

    ob_start();
    require($file);
    $view = ob_get_clean();

    return $view;
  }

  /**
   * Get the "to" email addresses
   *
   * @param  array $args The arguments.
   * @return array
   */
  public function get_to($args = [])
  {
    $mepr_options = MeprOptions::fetch();
    return $mepr_options->admin_email_addresses;
  }
}