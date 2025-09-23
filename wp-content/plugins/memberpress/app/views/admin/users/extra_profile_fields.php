<?php if (!defined('ABSPATH')) {
    die('You are not allowed to call this page directly.');
} ?>

<h3><?php esc_html_e('Membership Information', 'memberpress'); ?></h3>

<table class="form-table mepr-form">
  <tbody>
    <?php if ($mepr_options->require_privacy_policy) : ?>
      <tr>
        <th>
          <label><?php esc_html_e('Privacy Policy', 'memberpress') ?></label>
        </th>
        <td>
          <?php
            if (get_user_meta($user->ID, 'mepr_agree_to_privacy_policy', false)) {
                esc_html_e('User has consented to the Privacy Policy', 'memberpress');
            } else {
                esc_html_e('User has NOT consented to the Privacy Policy', 'memberpress');
            }
            ?>
        </td>
      </tr>
    <?php endif; ?>
    <?php if ($mepr_options->require_tos) : ?>
      <tr>
        <th>
          <label><?php esc_html_e('Terms of Service', 'memberpress') ?></label>
        </th>
        <td>
          <?php
            if (get_user_meta($user->ID, 'mepr_agree_to_tos', false)) {
                esc_html_e('User has consented to the Terms of Service', 'memberpress');
            } else {
                esc_html_e('User has NOT consented to the Terms of Service', 'memberpress');
            }
            ?>
        </td>
      </tr>
    <?php endif; ?>
    <tr>
      <th>
        <label for="mepr-geo-country"><?php esc_html_e('Signup Location', 'memberpress'); ?></label>
      </th>
      <td>
        <?php
        $geo_country = get_user_meta($user->ID, 'mepr-geo-country', true);
        if ($geo_country) {
            $countries = MeprUtils::countries(false);
            printf($countries[$geo_country]);
        } else {
            esc_html_e('Unknown', 'memberpress');
        }
        ?>
        <p class="description"><?php esc_html_e('Detected on user\'s initial signup', 'memberpress'); ?></p>
      </td>
    </tr>
  <?php
    MeprUsersHelper::render_editable_custom_fields($user);

    if (MeprUtils::is_mepr_admin()) { // Allow admins to see.
        ?>
      <tr>
        <td colspan="2">
          <a href="<?php echo admin_url('admin.php?page=memberpress-trans&search=' . urlencode($user->user_email)) . '&search-field=email'; ?>" class="button"><?php esc_html_e("View Member's Transactions", 'memberpress');?></a>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <a href="<?php echo admin_url('admin.php?page=memberpress-subscriptions&search=' . urlencode($user->user_email)) . '&search-field=email'; ?>" class="button"><?php esc_html_e("View Member's Subscriptions", 'memberpress');?></a>
        </td>
        <?php MeprHooks::do_action('mepr_after_user_profile_subs_btn', $user); ?>
      </tr>
      <tr>
        <td colspan="2">
          <a class="button mepr-resend-welcome-email" href="#"
             data-uid="<?php echo $user->ID; ?>"
             data-nonce="<?php echo wp_create_nonce('mepr_resend_welcome_email'); ?>"> <?php esc_html_e('Resend MemberPress Welcome Email', 'memberpress'); ?>
          </a>&nbsp;&nbsp;
          <img src="<?php echo admin_url('images/loading.gif'); ?>" alt="<?php esc_attr_e('Loading...', 'memberpress'); ?>" class="mepr-resend-welcome-email-loader" />&nbsp;&nbsp;<span class="mepr-resend-welcome-email-message">&nbsp;</span>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <h4><?php esc_html_e('Custom MemberPress Account Message', 'memberpress'); ?></h4>
          <?php wp_editor($user->user_message, MeprUser::$user_message_str); ?>
        </td>
      </tr>
        <?php
    }

    MeprHooks::do_action('mepr_extra_profile_fields', $user);
    ?>
  </tbody>
</table>
