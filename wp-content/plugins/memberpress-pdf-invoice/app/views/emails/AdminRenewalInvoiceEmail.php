<?php
if (!defined('ABSPATH')) {
    die('You are not allowed to call this page directly.');
}
?>
<div id="header" style="width: 680px; padding: 0px; margin: 0 auto; text-align: left;">
  <h2 style="margin-top: 0; color: #999; font-weight: normal;"><?php esc_html_e('{$trans_num} – {$blog_name}', 'memberpress-pdf-invoice'); ?></h2>
</div>
<div id="body" style="width: 600px; background: white; padding: 40px; margin: 0 auto; text-align: left;">
    <div class="section" style="display: block; margin-bottom: 24px;">
      <?php esc_html_e('Hello,', 'memberpress-pdf-invoice'); ?><br><br>
    </div>
    <div class="section" style="display: block; margin-bottom: 24px;">
      <p><?php esc_html_e('A renewal proforma invoice has been automatically generated for an offline payment subscription.', 'memberpress-pdf-invoice'); ?></p>
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
      <p><?php esc_html_e('The member has been notified about this invoice and asked to make a payment.', 'memberpress-pdf-invoice'); ?></p>
    </div>
</div>