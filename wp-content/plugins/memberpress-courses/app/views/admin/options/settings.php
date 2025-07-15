<?php if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');} ?>

<div class="wrap">
  <h2><?php _e('Settings', 'memberpress-courses'); ?><a href="https://memberpress.com/doc-categories/courses/" class="add-new-h2" target="_blank"><?php _e('User Manual', 'memberpress-courses'); ?></a></h2>

  <?php
    do_action( 'mpcs_admin_overview_before_table' );
    MeprView::render('/admin/errors', get_defined_vars());
    do_action( 'mpcs_before_options_form' );
    $form_url = admin_url('admin.php?page=memberpress-courses-options');
  ?>

  <form name="mpcs_options_form" id="mpcs_options_form" class="mpcs-form" method="post" action="<?php echo esc_url($form_url); ?>" data-raw-url="<?php echo esc_url($form_url); ?>" enctype="multipart/form-data">
    <input type="hidden" name="action" value="process-mpcs-form">
    <?php wp_nonce_field('mpcs_update_options', 'mpcs_options_nonce'); ?>

    <div class="mepr-options-hidden-pane">

      <table class="settings-table">
        <tr>
          <td class="settings-table-nav">
            <ul class="sidebar-nav">
              <li><a data-id="general"><?php _e('General', 'memberpress-courses'); ?></a></li>
              <li><a data-id="page_slugs"><?php _e('Page Slugs', 'memberpress-courses'); ?></a></li>
              <?php do_action('mpcs_admin_options_tab', $options); ?>
            </ul>
          </td>
          <td class="settings-table-pages">
            <div class="page" id="general">
              <?php do_action('mpcs_admin_general_options', $options); ?>
            </div>
            <div class="page" id="page_slugs">
              <?php do_action('mpcs_admin_pages_slugs_options', $options); ?>
            </div>
            <?php do_action('mpcs_admin_options_tab_content', $options); ?>
          </td>
        </tr>
      </table>

    </div>

    <?php do_action('mpcs_display_options'); ?>

    <p class="submit">
      <input type="submit" class="button button-primary" name="Submit" value="<?php _e('Update Options', 'memberpress-courses') ?>" />
    </p>

  </form>
</div>
