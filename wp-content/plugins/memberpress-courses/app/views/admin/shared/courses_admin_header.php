<?php if(!defined('ABSPATH')) { die('You are not allowed to call this page directly.'); } ?>
<div id="mp-admin-header">
  <img class="mp-logo" src="<?php echo esc_url($logo_url); ?>" width="150" height="36" alt="MemberPress Courses logo" />
  <div class="mp-admin-header-actions">
    <a class="mp-support-button button button-primary" href="<?php echo esc_url(admin_url('admin.php?page=memberpress-support')); ?>"><?php esc_html_e('Support', 'memberpress-courses'); ?></a>
  </div>
</div>
