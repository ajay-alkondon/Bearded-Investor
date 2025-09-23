<?php
if (!defined('ABSPATH')) {
    die('You are not allowed to call this page directly.');
}
?>
<div id="header" style="width: 680px; padding: 0px; margin: 0 auto; text-align: left;">
  <h1 style="font-size: 30px; margin-bottom: 0;"><?php esc_html_e('Subscription Payment Reminder', 'memberpress-pdf-invoice'); ?></h1>
  <h2 style="margin-top: 0; color: #999; font-weight: normal;"><?php esc_html_e('{$trans_num} – {$blog_name}', 'memberpress-pdf-invoice'); ?></h2>
</div>
<div id="body" style="width: 600px; background: white; padding: 40px; margin: 0 auto; text-align: left;">
  <div class="section" style="display: block; margin-bottom: 24px;">
    <?php esc_html_e('Hello {$user_first_name},', 'memberpress-pdf-invoice'); ?><br><br>
    <?php esc_html_e('This is a reminder that your subscription for {$product_name} will expire on {$subscr_expires_at}.', 'memberpress-pdf-invoice'); ?>
  </div>
  <div class="section" style="display: block; margin-bottom: 24px;">
    <?php esc_html_e('A new proforma invoice has been generated for you:', 'memberpress-pdf-invoice'); ?>
  </div>
  <table class="transaction" style="clear: both;">
    <tbody>
      <tr>
        <th style="text-align: left;"><?php esc_html_e('Proforma Invoice Number:', 'memberpress-pdf-invoice'); ?></th>
        <td><?php esc_html_e('{$invoice_num}', 'memberpress-pdf-invoice'); ?></td>
      </tr>
      <tr>
        <th style="text-align: left;"><?php esc_html_e('Amount:', 'memberpress-pdf-invoice'); ?></th>
        <td><?php esc_html_e('{$payment_amount}', 'memberpress-pdf-invoice'); ?></td>
      </tr>
    </tbody>
  </table>
  <div class="section" style="display: block; margin-bottom: 24px;">
    <?php esc_html_e('Please send in your renewal payment before due date. If you have any questions about your subscription or need assistance with payment, please contact us.', 'memberpress-pdf-invoice'); ?>
  </div>
</div>