<?php
namespace memberpress\courses\controllers\admin;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

use memberpress\courses as base;
use memberpress\courses\lib as lib;
use memberpress\courses\helpers as helpers;

class Options extends lib\BaseCtrl {
  public function load_hooks() {
    add_action('admin_menu', array($this, 'add_sub_menu'), 90);
    add_action('mpcs_admin_general_options', array($this, 'general'));
    add_action('mpcs_admin_pages_slugs_options', array($this, 'page_slugs'));
    add_action('wp_ajax_logo_uploader', array($this, 'dnd_logo_uploader'));
    add_filter('mepr-readylaunch-options-data', array($this,'readylaunch_options_data'), 99);
    add_action('mepr-after-readylaunch-options', array($this,'render_readylaunch_settings'), 99);
    add_action('mepr-after-readylaunch-options-table', array($this,'render_readylaunch_options'), 99);
  }

  public function general($options) {
    \MeprView::render('/admin/options/courses_general', get_defined_vars());
  }

  public function page_slugs($options) {
    \MeprView::render('/admin/options/pages_slugs', get_defined_vars());
  }

  // handle uploaded file here
  public function dnd_logo_uploader (){

    check_ajax_referer('photo-upload');

    // you can use WP's wp_handle_upload() function:
    $file = $_FILES['async-upload'];
    $status = wp_handle_upload($file, array('test_form'=>true, 'action' => 'logo_uploader'));
    $id = wp_insert_attachment( array(
      'post_mime_type' => $status['type'],
      'post_title' => preg_replace('/\.[^.]+$/', '', basename($file['name'])),
      'post_content' => '',
      'post_status' => 'inherit'
    ), $status['file']);

    // and output the results or something...
    $response = array(
      'url' => $status['url'],
      'id' => $id,
    );

    echo json_encode($response);
    exit;
  }

  public function add_sub_menu() {
    $capability = \MeprUtils::get_mepr_admin_capability();
    add_submenu_page(
      base\PLUGIN_NAME,
      __('MemberPress Courses - Settings', 'memberpress-courses'),
      __('Settings', 'memberpress-courses'),
      $capability,
      base\PLUGIN_NAME .'-options',
      array($this,'route')
    );
  }

  public function route() {

    $action = (isset($_REQUEST['action'])?$_REQUEST['action']:'');

    if(\MeprUtils::is_post_request() && $action == 'process-mpcs-form') {
      check_admin_referer('mpcs_update_options', 'mpcs_options_nonce');
      return $this->process_form();
    }

    if(\MeprUtils::is_logged_in_and_an_admin()) {
      $mepr_options = \MeprOptions::fetch();
      $options = get_option('mpcs-options', array());
      \MeprView::render('/admin/options/settings', get_defined_vars());
    }
  }

  protected function process_form() {
    if(\MeprUtils::is_logged_in_and_an_admin()) {
      $errors = \MeprHooks::apply_filters('mpcs-validate-options', array(), $_POST);
      if(empty($errors)) {
        $this->store_options();
        $message = __('Options saved.', 'memberpress-courses');
      }

      $options = get_option('mpcs-options', array());
      \MeprView::render('/admin/options/settings', get_defined_vars());
    }
  }

  /**
   * Saves the "Courses" data
   *
   * @return void
   */
  public function store_options() {

    if(lib\Utils::is_post_request() && isset($_POST['mpcs-options']) && is_array($_POST['mpcs-options'])) {
      $values = wp_unslash($_POST['mpcs-options']);

      // Maybe update courses slug in classroom menu
      $old_options = get_option('mpcs-options', array());

      // Fallback data.
      $old_quizzes_slug = isset($old_options['quizzes-slug']) && is_string($old_options['quizzes-slug']) ? sanitize_key($old_options['quizzes-slug']) : '';
      $old_assignments_slug = isset($old_options['assignments-slug']) && is_string($old_options['assignments-slug']) ? sanitize_key($old_options['assignments-slug']) : '';

      $orderby = isset($values['courses-sort-order-direction']) ? strtoupper(sanitize_key($values['courses-sort-order-direction'])) : '';
      $sort_order = isset($values['courses-sort-order']) ? sanitize_key($values['courses-sort-order']) : 'alphabetically';

      // Validate
      if( ! in_array($orderby, array('ASC','DESC'), true) ) {
        $orderby = 'ASC';
      }

      $sort_options = array(
        'alphabetically', 'last-updated', 'publish-date'
      );
      if( ! in_array($sort_order, $sort_options, true) ) {
        $sort_order = 'alphabetically';
      }

      $updated_options = [
        'courses-slug' => isset($values['courses-slug']) && is_string($values['courses-slug']) ? sanitize_key($values['courses-slug']) : '',
        'lessons-slug' => isset($values['lessons-slug']) && is_string($values['lessons-slug']) ? sanitize_key($values['lessons-slug']) : '',
        'quizzes-slug' => isset($values['quizzes-slug']) && is_string($values['quizzes-slug']) ? sanitize_key($values['quizzes-slug']) : $old_quizzes_slug,
        'assignments-slug' => isset($values['assignments-slug']) && is_string($values['assignments-slug']) ? sanitize_key($values['assignments-slug']) : $old_assignments_slug,
        'show-protected-courses' => isset($values['show-protected-courses']) ? 1 : 0,
        'remove-instructor-link' => isset($values['remove-instructor-link']) ? 1 : 0,
        'show-course-comments' => isset($values['show-course-comments']) ? 1 : 0,
        'courses-per-page' => isset($values['courses-per-page']) ? (int) $values['courses-per-page'] : 10,
        'course_emails_from_name' => isset($values['course_emails_from_name']) ? sanitize_text_field($values['course_emails_from_name']) : '',
        'course_emails_from_email' => isset($values['course_emails_from_email']) ? lib\Utils::sanitize_multiple_emails($values['course_emails_from_email']) : '',
        'course_emails_admin_email' => isset($values['course_emails_admin_email']) ? lib\Utils::sanitize_multiple_emails($values['course_emails_admin_email']) : '',
        'course_emails_bkg_jobs' => isset($values['course_emails_bkg_jobs']) ? 1 : 0,
        'courses-sort-order' => $sort_order,
        'courses-sort-order-direction' => $orderby
      ];

      $options = array_merge($old_options, $updated_options);
      $old_courses_slug = isset($old_options['courses-slug']) ? $old_options['courses-slug'] : '';

      // Maybe update courses slug in classroom menu
      if($options['courses-slug'] !== $old_courses_slug) {
        $menu = wp_get_nav_menu_items('MemberPress Classroom');

        if($menu) {
          $old_slug = $old_courses_slug !== '' ? $old_courses_slug : 'courses';
          $slug = $options['courses-slug'] !== '' ? $options['courses-slug'] : 'courses';

          foreach($menu as $item) {
            $data = [
              'menu-item-object-id'   => $item->object_id,
              'menu-item-object'      => $item->object,
              'menu-item-parent-id'   => $item->menu_item_parent,
              'menu-item-position'    => $item->menu_order,
              'menu-item-type'        => $item->type,
              'menu-item-title'       => $item->title,
              'menu-item-url'         => str_replace('/' . $old_slug, '/' . $slug, $item->url),
              'menu-item-description' => $item->description,
              'menu-item-attr-title'  => $item->attr_title,
              'menu-item-target'      => $item->target,
              'menu-item-classes'     => implode(' ',$item->classes),
              'menu-item-xfn'         => $item->xfn,
            ];

            wp_update_nav_menu_item('MemberPress Classroom', $item->db_id, $data);
          }
        }
      }

      update_option('mpcs-options', $options);

      // Ensure that the rewrite rules are flushed & in place
      if(
        $options['courses-slug'] !== $old_courses_slug ||
        $options['lessons-slug'] !== (isset($old_options['lessons-slug']) ? $old_options['lessons-slug'] : '') ||
        $options['quizzes-slug'] !== (isset($old_options['quizzes-slug']) ? $old_options['quizzes-slug'] : '') ||
        $options['assignments-slug'] !== (isset($old_options['assignments-slug']) ? $old_options['assignments-slug'] : '')
      ) {
        delete_option('mepr_courses_flushed_rewrite_rules');
      }

      // Delete Course Listing Transient
      helpers\Courses::delete_transients();

      \MeprHooks::do_action('mpcs-process-options', $_POST, $options, $old_options);
    }
  }

  public function readylaunch_options_data($data) {
    $courses_options = get_option( 'mpcs-options' );
    $data['courses'] = array(
      'enableTemplate'       => isset( $courses_options['classroom-mode'] ) ? filter_var( $courses_options['classroom-mode'], FILTER_VALIDATE_BOOLEAN ) : '',
      'showProtectedCourses' => isset( $courses_options['show-protected-courses'] ) ? filter_var( $courses_options['show-protected-courses'], FILTER_VALIDATE_BOOLEAN ) : '',
      'removeInstructorLink' => isset( $courses_options['remove-instructor-link'] ) ? filter_var( $courses_options['remove-instructor-link'], FILTER_VALIDATE_BOOLEAN ) : '',
      'logoId'               => isset( $courses_options['classroom-logo'] ) ? absint( $courses_options['classroom-logo'] ) : '',
    );

    return $data;
  }

  public function render_readylaunch_settings() {
    \MeprView::render('/admin/options/settings/readylaunch');
  }

  public function render_readylaunch_options() {
    $data = array();
    $data['courses_options'] = get_option( 'mpcs-options' );
    \MeprView::render('/admin/options/settings/readylaunch_options', $data);
  }
}
