<?php

namespace memberpress\courses\controllers\admin;

if (!defined('ABSPATH')) {
  die('You are not allowed to call this page directly.');
}

use memberpress\courses as base;
use memberpress\courses\lib as lib;
use memberpress\courses\helpers as helpers;

class Emails extends lib\BaseCtrl
{
  /**
   * Load the hooks
   */
  public function load_hooks()
  {
    $hook = 'mp-courses_page_' . base\PLUGIN_NAME . '-emails';
    add_action('admin_menu', array($this, 'add_sub_menu'), 80);
    add_filter("manage_{$hook}_columns", array($this, 'get_columns'), 0);
    add_action("load-{$hook}", array($this, 'add_screen_options'));
    add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
    add_action('media_buttons', array($this, 'add_tinymce_button'));
    add_action('wp_ajax_mpcs_reset_default_content', array($this, 'reset_editor_default_content'));
    add_action('wp_ajax_mpcs_emails_enable_single_email', array($this, 'enable_single_email'));
    add_action('wp_ajax_mpcs_send_test_email', array($this, 'send_test_email'));
    add_action('mpcs_admin_options_tab', array($this, 'add_options_tab'), 9);
    add_action('mpcs_admin_options_tab_content', array($this, 'add_options_tab_content'));
  }

  /**
   * Add the sub menu to the MemberPress menu
   */
  public function add_sub_menu()
  {
    $capability = \MeprUtils::get_mepr_admin_capability();
    add_submenu_page(
      base\PLUGIN_NAME,
      __('MemberPress Courses - Emails', 'memberpress-courses'),
      __('Emails', 'memberpress-courses'),
      $capability,
      base\PLUGIN_NAME . '-emails',
      array($this, 'page_router')
    );
  }

  /**
   * Route the request
   */
  public function page_router()
  {
    $action = (isset($_GET['action']) ? $_GET['action'] : '');
    $key = (isset($_GET['email']) ? $_GET['email'] : '');

    if (defined('DOING_AJAX')) {
      return;
    }

    if (lib\Utils::is_logged_in_and_an_admin() && lib\Utils::is_post_request()) {
      check_admin_referer('update_email', 'mpcs_update_email_nonce');
      $this->process_update_email($key);
    }

    if ($action == 'edit') {
      return $this->display_edit_form($key);
    }

    if (lib\Utils::is_logged_in_and_an_admin()) {
      $screen = get_current_screen();
      $table = new lib\EmailsTable($screen);
      $table->prepare_items();

      require_once base\VIEWS_PATH . '/admin/emails/table.php';
    }
  }

  /**
   * Adds the Email tab to the Courses Settings within MP Settings.
   */
  public static function add_options_tab()
  {
    ?>
    <li><a data-id="emails"><?php esc_html_e('Emails', 'memberpress-courses'); ?></a></li>
    <?php
  }

  /**
   * Adds the content of the Migrator tab.
   */
  public static function add_options_tab_content()
  {
    $options = get_option('mpcs-options', array());
    $mepr_options = \MeprOptions::fetch();

    $from_name = helpers\Options::val($options, 'course_emails_from_name');
    $from_email = helpers\Options::val($options, 'course_emails_from_email');
    $admin_email = helpers\Options::val($options, 'course_emails_admin_email');
    $bkg_email_jobs_enabled = helpers\Options::val($options, 'course_emails_bkg_jobs');

    require_once base\VIEWS_PATH . '/admin/emails/settings.php';
  }

  /**
   * Display the edit form
   */
  public function display_edit_form(string $key)
  {
    try {
      $email = lib\EmailManager::fetch_by_key($key);
    } catch (\Exception $e) {
      wp_die(json_encode(['error' => $e->getMessage()]));
    }

    if (null === $email) {
      return;
    }
    require_once base\VIEWS_PATH . '/admin/emails/edit.php';
  }

  /**
   * Process the form
   */
  public function process_update_email(string $key)
  {
    if (!isset($_POST['mpcs-email']) || empty($_POST['mpcs-email']) || !is_array($_POST['mpcs-email'])) {
      return;
    }

    $values = wp_unslash($_POST['mpcs-email']);
    $db = lib\Db::fetch();
    $record = $db->get_one_record($db->emails, ['email_key' => $key]);

    if (!$record) {
      $record_id = $db->create_record($db->emails, ['email_key' => $key]);
    } else {
      $record_id = $record->id;
    }

    $subject = isset($values['subject']) ? sanitize_text_field($values['subject']) : '';
    $body = isset($values['body']) ? wp_kses_post($values['body']) : '';
    $enabled = isset($values['enabled']) ? 1 : 0;
    $use_template = isset($values['use_template']) ? 1 : 0;

    $data = compact('subject', 'body', 'enabled', 'use_template');
    $db->update_record($db->emails, $record_id, $data);
  }

  /**
   * Get the columns
   *
   * @return void
   */
  public function get_columns()
  {
    $cols = array(
      'title'              => __('Email', 'memberpress-courses'),
      'type'       => __('Type', 'memberpress-courses'),
      'subject'       => __('Subject', 'memberpress-courses'),
      'status'          => __('Status', 'memberpress-courses')
    );

    return apply_filters('mpcs-admin-emails-cols', $cols);
  }

  /**
   * Add screen options
   *
   * @return void
   */
  public function add_screen_options()
  {
    add_screen_option('layout_columns');

    $option = 'per_page';

    $args = array(
      'label'   => __('Emails', 'memberpress-courses'),
      'default' => 10,
      'option'  => 'mpcs_emails_perpage',
    );

    add_screen_option($option, $args);
  }

  /**
   * Add the tinymce button
   *
   * @param string $editor_id
   * @return void
   */
  public function add_tinymce_button($editor_id)
  {
    if ('mpcs-email-content' !== $editor_id) {
      return;
    }

    echo '<a href="#" class="button" id="mpcs-insert-tag-button"><span class="dashicons dashicons-editor-code"></span>Insert Tags</a>';
    echo '<a href="#" class="button button-link-delete" id="mpcs-reset-default-button">Reset to Default</a>';
  }

  /**
   * Enqueue the scripts and styles
   *
   * @param string $hook The current page hook.
   * @return void
   */
  public function admin_enqueue_scripts($hook)
  {
    if (is_admin() && strstr($hook, 'memberpress-courses-emails') !== false) {
      \wp_enqueue_style('mpcs-emails', base\CSS_URL . '/admin_emails.css', array(), base\VERSION);
      wp_enqueue_script('mpcs-emails', base\JS_URL . '/admin_emails.js', array('jquery', 'editor'), base\VERSION, true);

      wp_localize_script('mpcs-emails', 'MpcsEmails', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'reset_nonce' => wp_create_nonce('mpcs_reset_nonce'),
        'test_email_nonce' => wp_create_nonce('mpcs_test_email_nonce'),
        'key' => $_GET['email'] ?? ''
      ]);
    }
  }

  /**
   * Reset the editor default content
   *
   * @return void
   */
  public function reset_editor_default_content()
  {
    check_ajax_referer('mpcs_reset_nonce', '_ajax_nonce'); // Verifying nonce
    $key = sanitize_text_field($_POST['key']);

    try {
      $email = lib\EmailManager::fetch_by_key($key);
    } catch (\Exception $e) {
      wp_send_json_error('Email not found', 500);
    }

    wp_send_json_success(['body' => $email->default_body(), 'subject' => $email->default_subject()]);
  }

  /**
   * Send a test email
   *
   * @return void
   */
  public static function send_test_email()
  {
    check_ajax_referer('mpcs_test_email_nonce', '_ajax_nonce');

    $mepr_options = \MeprOptions::fetch();
    $options = \get_option('mpcs-options');

    if (!lib\Utils::is_logged_in_and_an_admin()) {
      die(__('You do not have access to send a test email.', 'memberpress-courses'));
    }

    if (!isset($_POST['e']) or !isset($_POST['s']) or !isset($_POST['b']) or !isset($_POST['t'])) {
      die(__('Can\'t send your email ... refresh the page and try it again.', 'memberpress-courses'));
    }

    $class = isset($_POST['e']) ? wp_unslash(sanitize_text_field($_POST['e'])) : '';
    $key = isset($_POST['k']) ? wp_unslash(sanitize_key($_POST['k'])) : '';

    try {
      $email = lib\EmailManager::fetch($class, [$key]);
    } catch (Exception $e) {
      die(json_encode(['error' => $e->getMessage()]));
    }

    $email->to = helpers\Options::val($options, 'course_emails_admin_email', get_option('admin_email'));

    $params = array_merge(
      [
        'user_id'              => 481,
        'user_login'           => 'johndoe',
        'username'             => 'johndoe',
        'user_email'           => 'johndoe@example.com',
        'user_first_name'      => __('John', 'memberpress-courses'),
        'user_last_name'       => __('Doe', 'memberpress-courses'),
        'user_full_name'       => __('John Doe', 'memberpress-courses'),
        'user_address'         => '<br/>' .
          __('111 Cool Avenue', 'memberpress-courses') . '<br/>' .
          __('New York, NY 10005', 'memberpress-courses') . '<br/>' .
          __('United States', 'memberpress-courses') . '<br/>',
        'user_register_date'   => __('2024-09-24', 'memberpress-courses'),
        'blog_name'            => get_bloginfo('name'),
        'login_page'           => $mepr_options->login_page_url(),
        'account_url'          => $mepr_options->account_page_url(),
        'login_url'            => $mepr_options->login_page_url(),
        'usermeta:*'           => __('User Meta Field: *', 'memberpress-courses'),
        'course_start_date'    => __('2024-09-24', 'memberpress-courses'),
        'admin_name'           => __('Admin Name', 'memberpress-courses'),
        'course_url'           => home_url(),
        'user_profile_link'    => __('User Profile Link', 'memberpress-courses'),
        'site_name'            => get_bloginfo('name'),
        'site_url'             => home_url(),
        'course_url'             => home_url() . '/courses/your-course',
        'course_name'          => __('Course Title', 'memberpress-courses'),
        'course_id'              => 403,
        'course_start_date'      => lib\Utils::format_date(lib\Utils::db_now()),
        'course_status'          => 'Completed',
        'course_resources_url'   => add_query_arg( 'action', 'resources', home_url() . '/courses/your-course' ),
        'course_instructor_url'  => add_query_arg( 'action', 'instructor', home_url() . '/courses/your-course' ),
        'course_certificate_url' => home_url() . '/courses/your-course',
        'course_grades_url'      => add_query_arg( 'action', 'gradebook', home_url() . '/courses/your-course' ),
        'course_gradebook_url'   => add_query_arg( 'action', 'gradebook', home_url() . '/courses/your-course' ),
      ],
      $email->test_vars
    );

    $use_template = ($_POST['t'] == 'true');
    $email->send($params, sanitize_text_field(wp_unslash($_POST['s'])), wp_kses_post(wp_unslash($_POST['b'])), $use_template);

    wp_send_json_error(['message' => __('Your test email was successfully sent.', 'memberpress-courses')]);
  }

  /**
   * Enable a single email
   *
   * @return void
   */
  public function enable_single_email()
  {
    check_ajax_referer('mpcs_reset_nonce', '_ajax_nonce'); // Verifying nonce

    if (!lib\Utils::is_logged_in_and_an_admin()) {
      die(__('You do not have access to enable this email.', 'memberpress-courses'));
    }

    $email_id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $enabled = isset($_POST['enabled']) && $_POST['enabled'] === 'true' ? 1 : 0;
    $key = isset($_POST['key']) ? wp_unslash(sanitize_key($_POST['key'])) : '';
    $db = lib\Db::fetch();

    if(!$email_id) {
      $email = $db->get_one_record($db->emails, ['email_key' => $key]);

      if(!$email) {
        $email = lib\EmailManager::fetch_by_key($key);

        if ($email) {
          $email_id = $db->create_record($db->emails, [
            'email_key' => $key,
            'subject' => $email->subject(),
            'body' => $email->body(),
            'enabled' => $email->enabled(),
            'use_template' => $email->use_template()
          ]);
        }
      }

    }

    try {
      $db->update_record($db->emails, $email_id, ['enabled' => $enabled]);
    } catch (\Exception $e) {
      wp_send_json_error(esc_html__('Cannot update email', 'memberpress-courses'), 500);
    }

    // send json success
    wp_send_json_success(['message' => esc_html__('Email updated', 'memberpress-courses')]);
  }
}
