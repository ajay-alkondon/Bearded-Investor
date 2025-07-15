<?php
use memberpress\courses\helpers as helpers;
?>
<div class="page" id="emails">
  <h3><?php esc_html_e('Send Mail From', 'memberpress-courses'); ?></h3>
  <table class="mepr-options-pane">
    <tbody>
      <tr valign="top">
        <td>
          <label for="mpcs_options_courses_from_name"><?php esc_html_e('From Name:', 'memberpress-courses'); ?>
        </td>
        <td>
          <input type="text" id="mpcs_options_courses_from_name" name="mpcs-options[course_emails_from_name]" placeholder="" class="regular-text" value="<?php echo esc_attr($from_name); ?>" />
        </td>
      </tr>
      <tr valign="top">
        <td>
          <label for="mpcs_options_courses_from_email"><?php esc_html_e('From Email:', 'memberpress-courses'); ?>
        </td>
        <td>
          <input type="text" id="mpcs_options_courses_from_name" name="mpcs-options[course_emails_from_email]" placeholder="" class="regular-text" value="<?php echo esc_attr($from_email); ?>" />
        </td>
      </tr>
    </tbody>
  </table>

  <h3><?php esc_html_e('Admin Emails', 'memberpress-courses'); ?></h3>
  <table class="mepr-options-pane">
    <tbody>
      <tr valign="top">
        <td>
          <label for="mpcs_options_courses_from_name">
            <?php esc_html_e('Admin Email Addresses:', 'memberpress-courses'); ?>
            <?php helpers\App::info_tooltip(
              'mepr-admin-email-addresses',
              __('Notification Email Addresses', 'memberpress-courses'),
              __('This is a comma separated list of email addresses that will receive admin notifications. This defaults to your admin email set in "Settings" -> "General" -> "E-mail Address"', 'memberpress-courses')
          ); ?>
          </label>
        </td>
        <td>
          <input type="text" id="mpcs_options_courses_admin_name" name="mpcs-options[course_emails_admin_email]" placeholder="" class="regular-text" value="<?php echo esc_attr($admin_email); ?>" />
        </td>
      </tr>
    </tbody>
  </table>

  <h3><?php esc_html_e('Background Job', 'memberpress-courses'); ?></h3>
  <table class="mepr-options-pane">
    <tbody>
      <tr valign="top">
        <td>
        <label for="bkg_email_jobs_enabled"><?php _e('Asynchronous Emails', 'memberpress-courses'); ?></label>
          <?php helpers\App::info_tooltip(
            'mepr-asynchronous-emails',
            __('Send Emails Asynchronously in the Background', 'memberpress-courses'),
            __('This option will allow you to send all MemberPress Courses emails asynchronously. This option can increase the speed & performance of the checkout process but may also result in a delay in when emails are received. <strong>Note:</strong> This option requires wp-cron to be enabled and working.', 'memberpress-courses')
          ); ?>
        </td>
        <td>
          <input type="checkbox" name="mpcs-options[course_emails_bkg_jobs]" id="mpcs_bkg_email_jobs_enabled" <?php checked($bkg_email_jobs_enabled); ?> />
        </td>
      </tr>
    </tbody>
  </table>

</div>
