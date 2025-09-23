<?php
if (!defined('ABSPATH')) {
  die('You are not allowed to call this page directly.');
}
?>
<tr>
  <td colspan="2">
    <input type="checkbox" name="<?php echo esc_attr($mepr_options->integrations_str); ?>[<?php echo esc_attr($gateway->id);?>][enable_renewal_invoice]"<?php echo checked($enable_renewal_invoice); ?> />&nbsp;<?php esc_html_e('Enable Automatic Renewal Invoices', 'memberpress', 'memberpress-pdf-invoice'); ?>
  </td>
</tr>
<tr>
  <td colspan="2">
    <label><?php esc_html_e('Number of days before automatic renewal invoices', 'memberpress', 'memberpress-pdf-invoice'); ?></label><br/>
    <input
      name="<?php echo esc_attr($mepr_options->integrations_str); ?>[<?php echo esc_attr($gateway->id);?>][days_before_renewal]"
      type="text"
      value="<?php echo absint($days_before_renewal); ?>"
      maxlength="2"
      style="width: 5em !important;"
      oninput="this.value = this.value.replace(/[^0-9]/g, '')"
    />
  </td>
</tr>