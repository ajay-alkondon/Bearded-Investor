<?php
if (!defined('ABSPATH')) {
  die('You are not allowed to call this page directly.');
}

/**
 * Email sent to user when an offline payment renewal invoice is generated
 */
class MeprPdfUserRenewalInvoiceEmail extends MeprBaseOptionsUserEmail
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
    $this->description = __('This email is sent to the user when a renewal invoice is generated for an offline payment subscription.', 'memberpress-pdf-invoice');
    $this->ui_order    = 50; // Place it after other user emails

    $enabled = $use_template = $this->show_form = true;
    $subject = __('Your subscription payment is due - Invoice #{$invoice_num}', 'memberpress-pdf-invoice');
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

    $file = MeprView::file('/emails/UserRenewalInvoiceEmail');
    if (!$file) {
      return '';
    }

    ob_start();
    require($file);
    $view = ob_get_clean();

    return $view;
  }

  /**
   * Get the "to" email address
   *
   * @param  array $args The arguments.
   * @return array
   */
  public function get_to($args = [])
  {
    if (isset($args['email'])) {
      return [$args['email']];
    } elseif (isset($args['user_id']) && $args['user_id'] > 0) {
      $user = get_userdata($args['user_id']);
      return [$user->user_email];
    }
  }
}