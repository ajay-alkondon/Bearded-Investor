<div class="wrap">
  <h1 class="wp-heading-inline"><?php echo wp_strip_all_tags($email->title) ?></h1>

  <a href="#"
    id="mpcs-send-test-email"
    class="page-title-action"
    data-obj-dashed-name="<?php echo $email->dashed_name(); ?>"
    data-obj-name="<?php echo get_class($email); ?>"
    data-use-template-id="<?php echo $email->field_name('use_template', true); ?>"
    data-obj-key="<?php echo $email->key; ?>"
    data-body-id="<?php echo $email->field_name('body', true); ?>"><?php _e('Send Test', 'memberpress-courses'); ?></a>

  <img src="<?php echo memberpress\courses\IMAGES_URL . '/square-loader.gif'; ?>" alt="<?php _e('Loading...', 'memberpress-courses'); ?>" id="mpcs-loader-<?php echo $email->dashed_name(); ?>" class="mpcs_loader" style="display: none;" />
  <p class="wp-heading-description"><?php echo esc_html($email->description); ?></p>
  <hr class="wp-header-end">
  <div class="mpcs-form-wrapper">
    <form action="" method="post">
      <input type="hidden" name="action" value="update" />
      <?php wp_nonce_field('update_email', 'mpcs_update_email_nonce'); ?>

      <table class="form-table" role="presentation">
        <tbody>
          <tr class="form-field form-required term-name-wrap">
            <th scope="row"><label for="name"><?php esc_html_e('Enabled', 'memberpress-courses') ?></label></th>
            <td>
              <label class="mpcs-switch">
                <input name="mpcs-email[enabled]" type="checkbox" value="1" <?php checked(1, $email->enabled()); ?> />
                <span class="mpcs-slider round"></span>
              </label>
            </td>
          </tr>

          <tr class="form-field form-required term-name-wrap">
            <th scope="row"><label for="name"><?php esc_html_e('Use Template', 'memberpress-courses') ?></label></th>
            <td>
              <label class="mpcs-switch">
                <input name="mpcs-email[use_template]" id="mpcs-email-use-template" type="checkbox" value="1" <?php checked(1, $email->use_template()); ?> />
                <span class="mpcs-slider round"></span>
              </label>
            </td>
          </tr>

          <tr class="form-field form-required term-name-wrap">
            <th scope="row"><label for="name">Subject</label></th>
            <td>
              <input name="mpcs-email[subject]" id="mpcs-email-subject" type="text" value="<?php echo esc_html($email->subject()) ?>" size="40" aria-required="true"
                aria-describedby="name-description" class="regular-text">
            </td>
          </tr>

          <tr class="form-field term-description-wrap">
            <th scope="row"><label for="description"><?php esc_html_e('Description', 'memberpress-courses') ?></label></th>
            <td>
              <?php
              $content   = $email->body();
              $editor_id = 'mpcs-email-content';
              $args = array(
                'tinymce'       => array(
                  'toolbar1'      => 'bold,italic,underline,separator,alignleft,aligncenter,alignright,separator,link,unlink,undo,redo',
                  'toolbar2'      => '',
                  'toolbar3'      => '',
                ),
                'textarea_name' => 'mpcs-email[body]',
                'textarea_rows' => 10
              );
              wp_editor($content, $editor_id, $args);
              ?>
            </td>
          </tr>
          <tr>
            <td></td>
            <td>
              <p class="submit"><input type="submit" name="submit" id="submit" class="button button-primary" value="<?php esc_html_e('Save Changes', 'memberpress-courses') ?>"></p>
            </td>
          </tr>
        </tbody>
      </table>

    </form>
  </div>
  <div class="mepr_modal" aria-labelledby="mepr-courses-modal" id="mpcs-course-email-tags" role="dialog" aria-modal="true" style="z-index: 99;">
    <div class="mepr_modal__overlay"></div>
    <div class="mepr_modal__content_wrapper">
      <div class="mepr_modal__content">
        <div class="mepr_modal__box">
          <button type="button" class="mepr_modal__close">&#x2715;</button>
          <div>
            <h3>
              <?php esc_html_e('', 'memberpress-courses'); ?>
            </h3>

            <p>
              <input type="text" placeholder="Find a tag..." id="mpcs-tag-search-input" class="widefat">
            </p>

            <ul id="mpcs-email-tag-list">
              <?php
              foreach ($email->variables as $key => $value) {
                echo "<li><span>{\$$key}</span><span>$value</span></li>";
              }
              ?>
            </ul>

          </div>
        </div>
      </div>
    </div>
  </div>

</div>