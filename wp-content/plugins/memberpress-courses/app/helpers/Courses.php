<?php
namespace memberpress\courses\helpers;
if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

use memberpress\courses as base;
use memberpress\courses\models;
use memberpress\courses\controllers;
use memberpress\courses\lib;

class Courses {
  public static function course_lessons_list($course) {
    $course_sections = $course->sections();
    if(empty($course_sections)) {
      ?><div id="init-section-container"></div><?php
    }
    else {
      foreach($course_sections as $section) {
        $section_lessons = $section->lessons();
        ?>
          <div class="course-section sort-scroll-element">
            <span class="remove-span">
              <a href="" class="remove-section" title=<?php __('Remove Section', 'memberpress-courses') ?>><i class="mpcs-icon mpcs-cancel-circled mpcs-32"></i></a>
            </span>
            <span class="sort-arrows">
              <a class="sort-scroll-button-up"><span class="dashicons dashicons-arrow-up-alt"></span></a>
              <a class="sort-scroll-button-down"><span class="dashicons dashicons-arrow-down-alt"></span></a>
            </span>
            <div class="form-fields">
              <?php Courses::section_fields($section); ?>
              <h3><?php _e('Lessons', 'memberpress-courses'); ?></h3>
              <?php if(empty($section_lessons)): ?>
                <ol class="sortable-lessons">
                  <?php Courses::add_lesson($section); ?>
                </ol>
                <?php Courses::add_lesson_buttons(); ?>
              <?php else: ?>
                <ol class="sortable-lessons">
                <?php foreach($section_lessons as $lesson): ?>
                  <li>
                    <i class="mpcs-icon mpcs-grip-vertical-solid"></i>
                    <?php
                      Courses::all_lessons_dropdown($section, $lesson->ID);
                      Courses::lesson_callout_menu($lesson->ID);
                    ?>
                  </li>
                <?php endforeach; ?>
                </ol>
                <?php Courses::add_lesson_buttons(); ?>
              <?php endif; ?>
            </div>
          </div>
        <?php
      }
    }
  }

  public static function all_lessons_dropdown($section, $selected = null) {
    $uuid = (isset($section) && !empty($section->uuid)) ? $section->uuid : '{uuid}';
    $lessons = models\Lesson::find_all();
    ?>
      <select name="course[sections][<?php echo $uuid ?>][lessons][]" class="chosen-select">
        <option value=""><?php _e('Choose Lesson', 'memberpress-courses'); ?></option>
        <?php foreach($lessons as $lesson): ?>
          <option value="<?php echo $lesson->ID; ?>" <?php selected($lesson->ID, $selected); ?>><?php echo $lesson->post_title; ?></option>
        <?php endforeach; ?>
      </select>
    <?php
  }

  public static function new_section() {
    $section = new models\Section;
    ?>
      <div class="course-section sort-scroll-element">
        <span class="remove-span">
          <a href="" class="remove-section" title=<?php __('Remove Section', 'memberpress-courses') ?>><i class="mpcs-icon mpcs-cancel-circled mpcs-32"></i></a>
        </span>
        <span class="sort-arrows">
          <a class="sort-scroll-button-up"><span class="dashicons dashicons-arrow-up-alt"></span></a>
          <a class="sort-scroll-button-down"><span class="dashicons dashicons-arrow-down-alt"></span></a>
        </span>
        <div class="form-fields">
          <?php Courses::section_fields($section); ?>
          <h3><?php _e('Lessons', 'memberpress-courses'); ?></h3>
          <ol class="sortable-lessons">
            <li>
              <i class="mpcs-icon mpcs-grip-vertical-solid"></i>
              <?php
                Courses::all_lessons_dropdown($section);
                Courses::lesson_callout_menu();
              ?>
            </li>
          </ol>
          <?php Courses::add_lesson_buttons(); ?>
        </div>
      </div>
    <?php
  }

  public static function add_lesson($section = null) {
    ?>
      <li class="lesson-item">
        <i class="mpcs-icon mpcs-grip-vertical-solid"></i>
        <?php
          Courses::all_lessons_dropdown($section);
          Courses::lesson_callout_menu();
        ?>
      </li>
    <?php
  }

  public static function new_lesson($section = null) {
    $uuid = (isset($section) && !empty($section->uuid)) ? $section->uuid : '{uuid}';
    ?>
      <li class="lesson-item">
        <i class="mpcs-icon mpcs-grip-vertical-solid"></i>
        <input type="text" name="course[sections][<?php echo $uuid ?>][lessons][]" class="course-lesson-title" placeholder="<?php _e('Lesson Title', 'memberpress-courses') ?>"></input>
        <span class="remove-span">
          <a href="" class="remove-item" title=<?php __('Remove Lesson', 'memberpress-courses') ?>><i class="mpcs-icon mpcs-cancel-circled mpcs-16"></i></a>
        </span>
        <span class="new-lesson-info"><?php _e('A new Lesson with this title will be created when the Course is saved', 'memberpress-courses') ?></span>
      </li>
    <?php
  }

  private static function section_fields($section) {
    $uuid = (isset($section) && !empty($section->uuid)) ? $section->uuid : '{uuid}';
    ?>
      <input type="hidden" name="course[sections][<?php echo $uuid ?>][id]" value="<?php echo $section->id ?>"></input>
      <input type="hidden" id="course_section_uuid" name="course[sections][<?php echo $uuid ?>][uuid]" value="<?php echo $uuid ?>"></input>
      <p><input type="text" id="course_section_title" name="course[sections][<?php echo $uuid ?>][title]" class="course-section-title" value="<?php echo esc_attr($section->title); ?>" placeholder="<?php _e('Section Title', 'memberpress-courses') ?>" data-validation="length" data-validation-length="1-60" data-validation-error-msg="<?php _e('Section Title cannot be blank and must be between 1-60 characters.', 'memberpress-courses'); ?>"></input></p>
      <input type="text" name="course[sections][<?php echo $uuid ?>][description]" class="course-section-title" value="<?php echo esc_attr($section->description) ?>" placeholder="<?php _e('Section Description', 'memberpress-courses') ?>"></input>
    <?php
  }

  private static function add_lesson_buttons() {
    ?>
      <div class="new-lesson-buttons">
        <button class="add-new-lesson button button-primary button-large" title="<?php _e('Add Lesson', 'memberpress-courses'); ?>"><?php _e('Add Lesson', 'memberpress-courses') ?></button>
        <button class="create-new-lesson button button-large" title="<?php _e('New Lesson', 'memberpress-courses'); ?>"><?php _e('New Lesson', 'memberpress-courses') ?></button>
      </div>
    <?php
  }

  private static function lesson_callout_menu($lesson_id = null) {
    // If there's no lesson_id then we don't want to show the view & edit links
    $hidden_class = !empty($lesson_id) && is_numeric($lesson_id) ? '' : ' hidden';

    ?>
      <span class="mpcs-lesson-menu">
        <a href="" class="trigger-menu"><i class="mpcs-icon mpcs-angle-circled-down"></i></a>
        <div class="mpcs-callout-menu">
          <div class="mpcs-cm-callout"></div>
          <div class="mpcs-cm-menu">
            <div class="mpcs-cm-item mpcs-cm-view-item<?php echo $hidden_class; ?>"><a href="" class="view-item"><i class="mpcs-eye"></i> <?php _e('View', 'memberpress-courses'); ?></a></div>
            <div class="mpcs-cm-item mpcs-cm-edit-item<?php echo $hidden_class; ?>"><a href="" class="edit-item"><i class="mpcs-edit"></i> <?php _e('Edit', 'memberpress-courses'); ?></a></div>
            <div class="mpcs-cm-item mpcs-cm-remove-item"><a href="" class="remove-item"><i class="mpcs-cancel-circled"></i> <?php _e('Remove', 'memberpress-courses'); ?></a></div>
          </div>
        </div>
      </span>
    <?php
  }

  public static function course_settings($post_id) {
    $course = new models\Course($post_id);
    $settings = array(
      "status" => array(
        "name" => models\Course::$page_status_str,
        "value" => $course->status
      ),

      "lessonTitle" => array(
        "name" => models\Course::$lesson_title_str,
        "value" => $course->lesson_title
      ),
      "salesUrl" => array(
        "name" => models\Course::$sales_url_str,
        "value" => $course->sales_url
      ),
      "requirePrevious" => array(
        "name" => models\Course::$require_previous_str,
        "value" => $course->require_previous
      ),
      "showResults" => array(
        "name" => models\Course::$show_results_str,
        "value" => $course->show_results
      ),
      "showAnswers" => array (
        "name" => models\Course::$show_answers_str,
        "value" => $course->show_answers
      ),
      "accordionCourse" => array (
        "name" => models\Course::$accordion_course_str,
        "value" => $course->accordion_course
      ),
      "accordionSidebar" => array (
        "name" => models\Course::$accordion_sidebar_str,
        "value" => $course->accordion_sidebar
      ),
      "certificates" => array (
        "name" => models\Course::$certificates_enable_str,
        "value" => $course->certificates_enable
      ),
      "certificates_force_download_pdf" => array (
        "name" => models\Course::$certificates_force_download_pdf_str,
        "value" => $course->certificates_force_download_pdf
      ),
      "certificates_expiration_date" => array (
        "name" => models\Course::$certificates_expiration_date_str,
        "value" => $course->certificates_expiration_date
      ),
      "certificates_expires_value" => array (
        "name" => models\Course::$certificates_expires_value_str,
        "value" => $course->certificates_expires_value
      ),
      "certificates_expires_unit" => array (
        "name" => models\Course::$certificates_expires_unit_str,
        "value" => $course->certificates_expires_unit
      ),
      "certificates_expires_reset" => array (
        "name" => models\Course::$certificates_expires_reset_str,
        "value" => $course->certificates_expires_reset
      ),
      "certificates_completion_date" => array (
        "name" => models\Course::$certificates_completion_date_str,
        "value" => $course->certificates_completion_date
      ),
      "certificates_share_link" => array (
        "name" => models\Course::$certificates_share_link_str,
        "value" => $course->certificates_share_link
      ),
      "certificates_paper_size" => array (
        "name" => models\Course::$certificates_paper_size_str,
        "value" => $course->certificates_paper_size
      ),
      "certificates_logo" => array (
        "name" => models\Course::$certificates_logo_str,
        "value" => $course->certificates_logo
      ),
      "certificates_bottom_logo" => array (
        "name" => models\Course::$certificates_bottom_logo_str,
        "value" => $course->certificates_bottom_logo
      ),
      "certificates_instructor_signature" => array (
        "name" => models\Course::$certificates_instructor_signature_str,
        "value" => $course->certificates_instructor_signature
      ),
      "certificates_instructor_name" => array (
        "name" => models\Course::$certificates_instructor_name_str,
        "value" => $course->certificates_instructor_name
      ),
      "certificates_instructor_title" => array (
        "name" => models\Course::$certificates_instructor_title_str,
        "value" => $course->certificates_instructor_title
      ),
      "certificates_signature" => array (
        "name" => models\Course::$certificates_signature_str,
        "value" => $course->certificates_signature
      ),
      "certificates_text_color" => array (
        "name" => models\Course::$certificates_text_color_str,
        "value" => $course->certificates_text_color
      ),
      "certificates_background_color" => array (
        "name" => models\Course::$certificates_background_color_str,
        "value" => $course->certificates_background_color
      ),
      "certificates_title" => array (
        "name" => models\Course::$certificates_title_str,
        "value" => $course->certificates_title
      ),
      "certificates_footer_message" => array (
        "name" => models\Course::$certificates_footer_message_str,
        "value" => $course->certificates_footer_message
      ),
      "certificates_style" => array (
        "name" => models\Course::$certificates_style_str,
        "base_img_path" => base\IMAGES_PATH,
        "base_img_url" => base\IMAGES_URL,
        "value" => $course->certificates_style
      ),
      "dripping" => array (
        "name" => models\Course::$dripping_str,
        "value" => $course->dripping
      ),
      "drip_type" => array (
        "name" => models\Course::$drip_type_str,
        "value" => $course->drip_type
      ),
      "drip_amount" => array (
        "name" => models\Course::$drip_amount_str,
        "value" => $course->drip_amount
      ),
      "drip_frequency" => array (
        "name" => models\Course::$drip_frequency_str,
        "value" => $course->drip_frequency
      ),
      "drip_frequency_type" => array (
        "name" => models\Course::$drip_frequency_type_str,
        "value" => $course->drip_frequency_type
      ),
      "drip_frequency_fixed_date" => array (
        "name" => models\Course::$drip_frequency_fixed_date_str,
        "value" => $course->drip_frequency_fixed_date
      ),
      "drip_lessons" => array (
        "name" => models\Course::$drip_lessons_str,
        "value" => $course->drip_lessons
      ),
      "drip_assignments" => array (
        "name" => models\Course::$drip_assignments_str,
        "value" => 0
      ),
      "drip_quizzes" => array (
        "name" => models\Course::$drip_quizzes_str,
        "value" => 0
      ),
      "drip_time" => array (
        "name" => models\Course::$drip_time_str,
        "value" => $course->drip_time
      ),
      "drip_timezone" => array (
        "name" => models\Course::$drip_timezone_str,
        "value" => $course->drip_timezone
      ),
      "not_dripped_message" => array (
        "name" => models\Course::$not_dripped_message_str,
        "value" => $course->not_dripped_message
      ),
    );

    return apply_filters('mpcs_course_admin_settings', $settings, $course);
  }

  public static function course_curriculum($post_id, $status = null ) {
    $course = new models\Course($post_id);
    $course_sections = (array) $course->sections();

    $curriculum = array(
      'lessons' => array(
        'section' => array(),
        'sidebar' => array()
      ),
      'quizzes' => array(
        'sidebar' => array()
      ),
      'assignments' => array(
        'sidebar' => array()
      ),
      'sections' => array(),
      'sectionOrder' => array(),
      'lessonMeta' => array(),
      'quizMeta' => array(),
      'assignmentMeta' => array()
    );


    if(empty($course_sections)) {
      return $curriculum;
    }

    foreach($course_sections as $section) {
      $curriculum['sections'][$section->uuid] = array(
        'id' => $section->uuid,
        'title' => $section->title,
        'lessonIds' => array()
      );

      $curriculum['sectionOrder'][] = $section->uuid;

      $section_lessons = $section->lessons();
      foreach ($section_lessons as $lesson) {

        if( null !== $status && $status !== $lesson->post_status ) {
          continue;
        }

        $curriculum['sections'][$section->uuid]['lessonIds'][] = $lesson->ID;

        $curriculum['lessons']['section'][$lesson->ID] = array(
          'id' => $lesson->ID,
          'title' => $lesson->post_title,
          'href' => get_permalink($lesson->ID),
          'status' => $lesson->post_status,
          'type' => $lesson->post_type
        );

        $curriculum = apply_filters('mpcs_curriculum_lesson', $curriculum, $lesson);
      }
    }

    return $curriculum;
  }

  public static function get_default_resources() {
    $resources = array(
      'items' => array(),
      'sections' => array(
        'downloads' => [
          'id' => 'downloads',
          'label' => __('Downloads', 'memberpress-courses'),
          'items' => array()
        ],
        'links' => [
          'id' => 'links',
          'label' => __('Links', 'memberpress-courses'),
          'items' => array()
        ],
        'custom' => [
          'id' => 'custom',
          'label' => '',
          'items' => array()
        ]
      )
    );

    return $resources;
  }

  public static function course_resources($post_id) {
    $course = new models\Course($post_id);
    $resources = (array) json_decode($course->resources, true);

    if(empty($resources)){
      $resources = self::get_default_resources();
    }

    if(empty($resources['sections']['custom'])) {
      $resources['sections']['custom'] = array(
        'id' => 'custom',
        'label' => '',
        'items' => array()
      );
    }

    $resources = self::add_url_to_downloads($resources);
    $resources = self::add_metadata_to_resources($resources);

    return $resources;
  }

  public static function remove_downloads_from_resources($resources){

    if(!isset($resources['items'], $resources['sections']['downloads']['items'])){
      return $resources;
    }

    foreach ( $resources['items'] as $key => $item ) {
      if ( isset($item['type']) && $item['type'] === 'download' ) {
        foreach ($resources['sections']['downloads']['items'] as $k => $item) {
          if ($item == $key) {
            unset($resources['sections']['downloads']['items'][$k]);
          }
        }
        unset( $resources['items'][$key] );
      }
    }

    // Resort
    $resources['sections']['downloads']['items'] = array_values($resources['sections']['downloads']['items']);

    return $resources;
  }

  public static function sanitize_resources($posted_resources) {
    $resources = json_decode(stripslashes($posted_resources), TRUE);

    if( is_array($resources) && isset($resources['query']) ){
      unset($resources['query']);
    }

    $resources = self::sanitize_resource_items($resources);
    return json_encode($resources, JSON_UNESCAPED_UNICODE);
  }

  public static function sanitize_resource_items( $var ) {
    if ( is_array( $var ) ) {
      if ( isset( $var['id'], $var['content'] ) && $var['id'] == 'custom' ) {
        return [
          'id' => 'custom',
          'content' => wp_kses_post( $var['content'] )
        ];
      }

      return array_map( [self::class, 'sanitize_resource_items'], $var );
    } else {
      return filter_var($var, FILTER_VALIDATE_URL) !== false ? esc_url_raw($var) : sanitize_text_field($var);
    }
  }

  public static function filter_resources($posted_resources) {
    if( App::is_downloads_addon_active() ){
      return $posted_resources;
    }

    $resources = json_decode($posted_resources, TRUE);
    $resources = self::remove_downloads_from_resources($resources);

    return wp_json_encode( $resources );
  }

  public static function add_url_to_downloads($resources){

    if(!isset($resources['items']) || !is_array($resources['items']) ){
      return $resources;
    }

    if( ! App::is_downloads_addon_active() ){
      return $resources;
    }

    foreach ($resources['items'] as $key => &$item) {
      if( isset($item['type']) && 'download' === $item['type'] ){
        $file = new \memberpress\downloads\models\File($item['id']);
        $item['url'] = $file->url();
      }
      elseif( isset($item['type']) && 'attachment' === $item['type'] ){
        $item['url'] = wp_get_attachment_url($item['id']);
      }
    }

    return $resources;
  }

  public static function add_metadata_to_resources($resources){

    if(!isset($resources['items']) || !is_array($resources['items']) ){
      return $resources;
    }

    $is_downloads_addon_active = App::is_downloads_addon_active();

    foreach ($resources['items'] as $key => &$item) {
      if ( isset($item['type']) && 'attachment' === $item['type'] ) {
        $metadata = wp_get_attachment_metadata($item['id']);
        $item['filesize'] = $metadata['filesize'];
        $item['filetype'] = get_post_mime_type($item['id']);
      } else if ( isset($item['type']) && 'download' === $item['type'] && $is_downloads_addon_active ) {
        $file = new \memberpress\downloads\models\File($item['id']);
        $item['filesize'] = $file->filesize;
        $item['filetype'] = $file->filetype;
      }
    }

    return $resources;
  }

  /**
   * Get permalink base slug
   *
   * @return string
   */
  public static function get_permalink_base(){
    $slug = models\Course::$permalink_slug;
    $options = \get_option('mpcs-options');

    if(!empty(Options::val($options,'courses-slug'))){
      $slug = Options::val($options,'courses-slug');
    }

    return $slug;
  }


  /**
   * Returns header HTML
   *
   * @param  mixed $classes
   * @return string
   */
  public static function get_classroom_header($classes = ''){
    global $post;

    $mepr_options = \MeprOptions::fetch();
    $account_url = $mepr_options->account_page_url();
    $logout_url = \MeprUtils::logout_url();
    $mycourses_url = add_query_arg( 'type', 'mycourses', get_home_url( null, Courses::get_permalink_base() ) );
    $back_link = self::get_back_link( $post );
    $back_url = $back_link['url'];
    $back_url_text = $back_link['text'];

    if(!\is_array($classes)){
      $classes = \explode(',', $classes);
    }

    if(!isset($back_url)){
      return '';
    }

    $classes = array_merge(['mpcs-classroom'], (array) $classes);
    $loggedout_url = add_query_arg('preview', 'out');
    $loggedin_url = add_query_arg('preview', false);

    \ob_start();
      require(\MeprView::file('/classroom/courses_header'));
    $content = \ob_get_clean();

    return apply_filters( base\SLUG_KEY . '_classroom_header', $content, $classes, $back_url, $back_url_text );
  }

  /**
   * Retrieves information about the back link featured in the courses header
   *
   * @param \WP_Post $post The global post object.
   * @return array {
   *     Returns an associative array of information about the back link.
   *
   *     @type string $url  The URL. Empty if called in an invalid context or without a valid $post object.
   *     @type string $text A text description of the URL, used for screen reader and link title text.
   * }
   */
  private static function get_back_link( $post ) {

    $course_cpt = get_post_type_object( models\Course::$cpt );

    $url  = '';
    $text = '';
    if( self::is_course_archive() ){
      $url = home_url();
      $text = __( 'Return home', 'memberpress-courses' );
    } elseif(isset($post->post_type)) {
      $course = null;
      $lesson_models = models\Lesson::lesson_cpts(true);
      if(array_key_exists($post->post_type, $lesson_models)){
        $lesson = new $lesson_models[$post->post_type]($post->ID);
        $course = $lesson->course();
      }

      if($course instanceof models\Course) {
        $url  = get_permalink($course->ID);
        $text = sprintf(
          /* Translators: %1$s is the course post object singular name; %2$s is the title of the course. */
          __( 'Return to %1$s: %2$s', 'memberpress-courses' ),
          strtolower( $course_cpt->labels->singular_name ),
          get_the_title( $course->ID )
        );
      } elseif($post->post_type === models\Course::$cpt) {
        $url = get_post_type_archive_link(models\Course::$cpt);
        /* Translators: %s is the course post object plural name. */
        $text = sprintf( __( 'Return to all %s', 'memberpress-courses' ), strtolower( $course_cpt->labels->name ) );
      }
    }

    return compact( 'url', 'text' );

  }

  public static function get_email_vars(lib\BaseEmail $email)
  {
    return apply_filters(
      'mpcs_course_email_vars',
      [
        'user_id'                => esc_html__('User ID', 'memberpress-courses'),
        'user_login'             => esc_html__('User login name', 'memberpress-courses'),
        'username'               => esc_html__('Username', 'memberpress-courses'),
        'user_email'             => esc_html__('User email address', 'memberpress-courses'),
        'user_first_name'        => esc_html__('User first name', 'memberpress-courses'),
        'user_last_name'         => esc_html__('User last name', 'memberpress-courses'),
        'user_full_name'         => esc_html__('User full name', 'memberpress-courses'),
        'user_address'           => esc_html__('User address', 'memberpress-courses'),
        'user_register_date'     => esc_html__('User registration date', 'memberpress-courses'),
        'blog_name'              => esc_html__('Name of the blog', 'memberpress-courses'),
        'login_page'             => esc_html__('URL of the login page', 'memberpress-courses'),
        'account_url'            => esc_html__('URL to the user’s account', 'memberpress-courses'),
        'login_url'              => esc_html__('Login URL', 'memberpress-courses'),
        'user_profile_link'      => esc_html__('URL to view the user’s profile', 'memberpress-courses'),
        'site_name'              => esc_html__('Name of the site', 'memberpress-courses'),
        'site_url'               => esc_html__('URL of the site', 'memberpress-courses'),
        'course_url'             => esc_html__('URL to the course', 'memberpress-courses'),
        'course_name'            => esc_html__('Course name (post title)', 'memberpress-courses'),
        'course_id'              => esc_html__('Post ID of the course', 'memberpress-courses'),
        'course_start_date'      => esc_html__('Start date of the course', 'memberpress-courses'),
        'course_status'          => esc_html__('Course status (Not Started, In Progress, Completed, Passed, or Failed)', 'memberpress-courses'),
        'course_resources_url'   => esc_html__('URL to view the course resources page', 'memberpress-courses'),
        'course_instructor_url'  => esc_html__('URL to view the course instructor page', 'memberpress-courses'),
        'course_certificate_url' => esc_html__('URL to view the course certificate page', 'memberpress-courses'),
        'course_grades_url'      => esc_html__('URL to view the course grades', 'memberpress-courses'),
        'course_gradebook_url'      => esc_html__('Admin only, should link to the gradebook filtered by this user for this course. If gradebook is not installed, should default to the WP User Profile for the student.', 'memberpress-courses')
      ],
      $email
    );
  }

  /**
   * Get email params
   *
   * @return array
   */
  public static function get_email_params($course)
  {
    $mepr_options = \MeprOptions::fetch();
    $usr = lib\Utils::get_currentuserinfo();
    $ts = lib\Utils::db_date_to_ts($usr->user_registered);
    $usr_date = date_i18n(__('F j, Y, g:i a', 'memberpress-courses'), $ts, true);
    $course_url = get_permalink($course->ID);
    $cert_url = admin_url( 'admin-ajax.php?action=mpcs-course-certificate' );
    $cert_url = add_query_arg(
      array(
        'user' => $usr->ID,
        'course' => $course->ID,
        'shareable' => 'true'
      ),
      $cert_url
    );

    $progress = $course->user_progress($usr->ID);

    $course_status = esc_html__('Not Started', 'memberpress-courses');

    if($progress == 100.00) {
      $course_status = esc_html__('Completed', 'memberpress-courses');
    } elseif ($progress > 0 && $progress < 100) {
      $course_status = esc_html__('In Progress', 'memberpress-courses');
    }

    $params = [
      'user_id'                => $usr->ID,
      'user_login'             => $usr->user_login,
      'username'               => $usr->user_login,
      'user_email'             => $usr->user_email,
      'user_first_name'        => $usr->first_name,
      'user_last_name'         => $usr->last_name,
      'user_full_name'         => lib\Utils::get_full_name($usr->ID),
      'user_address'           => $usr->formatted_address(),
      'user_register_date'     => $usr_date,
      'blog_name'              => get_bloginfo('name'),
      'login_page'             => $mepr_options->login_page_url(),
      'account_url'            => $mepr_options->account_page_url(),
      'login_url'              => $mepr_options->login_page_url(),
      'user_profile_link'      => admin_url('user-edit.php?user_id=' . $usr->ID . '#mpcs-profile-course-information-heading'),
      'site_name'              => get_bloginfo('name'),
      'site_url'               => home_url(),
      'course_url'             => get_permalink($course->ID),  // added based on first block
      'course_name'            => $course->post_title,  // renamed from course_title
      'course_id'              => $course->ID,  // added based on first block
      'course_start_date'      => lib\Utils::format_date(lib\Utils::db_now()),
      'course_status'          => $course_status,
      'course_resources_url'   => add_query_arg( 'action', 'resources', $course_url ),
      'course_instructor_url'  => add_query_arg( 'action', 'instructor', $course_url ),
      'course_certificate_url' => $cert_url,
      'course_grades_url'      => self::get_course_grades_url($course),
      'course_gradebook_url'      => self::get_course_gradebook_url($course, $usr),
    ];

    return apply_filters('mpcs_course_email_params', $params, $course);
  }

  /**
   * Return sidebar HTML
   *
   * @return string
   */
  public static function get_classroom_sidebar($post){
    $course = new models\Course($post->ID);
    $current_user = lib\Utils::get_currentuserinfo();

    \ob_start();
      require(\MeprView::file('/classroom/courses_sidebar'));
    $content = \ob_get_clean();

    return apply_filters( base\SLUG_KEY . '_classroom_sidebar', $content );
  }

  public static function get_classroom_footer(){
    \ob_start();
      require(\MeprView::file('/classroom/courses_footer'));
    $footer = \ob_get_clean();

    return $footer;
  }

  public static function is_a_course($post){
    return (isset($post) && is_a($post, 'WP_Post') && $post->post_type == models\Course::$cpt);
  }

  public static function classroom_sidebar_progress($post) {
    $progress_bar = '';
    $lesson_models = models\Lesson::lesson_cpts(true);

    if(array_key_exists($post->post_type, $lesson_models)){
      $lesson = new $lesson_models[$post->post_type]($post->ID);
      $course = $lesson->course();
    } else {
      $course = new models\Course($post->ID);
    }
    // if($post->post_type == models\Lesson::$cpt) {
    //   $lesson = new models\Lesson($post->ID);
    //   $course = $lesson->course();
    // }
    // elseif($post->post_type == models\Quiz::$cpt) {
    //   $quiz = new models\Quiz($post->ID);
    //   $course = $quiz->course();
    // }
    // else{
    //   $course = new models\Course($post->ID);
    // }

    $current_user = lib\Utils::get_currentuserinfo();
    $show_bookmark = true;

    if($course instanceof models\Course && $show_bookmark) {
      \ob_start();
        require(\MeprView::file('/courses/courses_classroom_sidebar_progress'));
      $progress_bar = \ob_get_clean();
    }
    return $progress_bar;
  }

  /**
  * Modify the content to show sections and lessons
  *
  * @param bool $show_bookmark
  * @param bool $is_sidebar
  * @return string
  */
  public static function display_course_overview($show_bookmark = true, $is_sidebar = false) {
    global $post;
    $course_overview = $progress = $next_lesson_title = '';
    $current_user_id = 0;

    if(!is_single()) {
      return '';
    }

    if(is_user_logged_in()) {
      $current_user = lib\Utils::get_currentuserinfo();
      $current_user_id = $current_user->ID;
    }

    // Get Sections and Lessons
    if($is_sidebar){
      $current_lesson = new models\Lesson($post->ID);
      $course = $current_lesson->course();

      if(!$course instanceof models\Course) {
        return '';
      }
    }
    else{
      $course = new models\Course($post->ID);
    }

    $sections = $course->sections();
    $next_lesson = models\UserProgress::next_lesson($current_user_id, $course->ID);

    if($next_lesson!==false && is_object($next_lesson)) {
      $next_lesson_title = $next_lesson->post_title;
      $bookmark_url = get_permalink($next_lesson->ID);
    }

    // If classroom mode is not active, load default section list
    if(! App::is_classroom()) {
      \ob_start();
        require(\MeprView::file('/courses/courses_section_lesson_list'));
      $course_overview = \ob_get_clean();

      // Progress Bar above lessons
      $course_overview =
        self::maybe_display_progress_bar() .
        $course_overview;

      return $course_overview;
    }

    // classroom mode is active, load classroom section list
    if($show_bookmark){
      \ob_start();
        require(\MeprView::file('/courses/courses_classroom_bookmark'));
      $progress = \ob_get_clean();
    }

    \ob_start();
      require(\MeprView::file('/courses/courses_classroom_section_lessons'));
    $course_overview = \ob_get_clean();

    $course_overview =
      $progress .
      $course_overview;

    return $course_overview;
  }

  /**
  * Modify the content to show progress bar
  * @see self::display_course_overview($content)
  * @param string $content the_content for post
  * @return string $content modified content for post
  */
  private static function maybe_display_progress_bar($content='') {
    global $post;

    if(isset($post) && is_a($post, 'WP_Post') && $post->post_type === models\Course::$cpt) {
      $current_user = lib\Utils::get_currentuserinfo();
      if($current_user !== false) {
        $course = new models\Course($post->ID);
        $lesson = models\UserProgress::next_lesson($current_user->ID, $course->ID);
        $progress = $course->user_progress($current_user->ID);

        if($lesson!==false && is_object($lesson)) {
          $bookmark_url = get_permalink($lesson->ID);
        }
          \ob_start();
            require(\MeprView::file('/courses/courses_bookmark'));
          $content = \ob_get_clean() . $content;
      }
    }

    return $content;
  }

  public function display_courses(){
    \ob_start();
      require(base\VIEWS_PATH . '/.php');
    $courses = \ob_get_clean();
    return $courses;
  }


  /**
   * Archive Navigation
   *
   * @return string $link
  */
  public static function archive_navigation() {
    if( is_singular() )
    return;

    global $wp_query;

    /** Stop execution if there's only 1 page */
    if( $wp_query->max_num_pages <= 1 )
      return;

    $links = array();
    $paged = get_query_var( 'paged' ) ? absint( get_query_var( 'paged' ) ) : 1;
    $max   = intval( $wp_query->max_num_pages );
    $count = 5;
    $last_pages = ($paged <= $max && $paged > ($max - 4));

    /** Add the pages around the first 5 pages to the array */
    if( $paged <= $max && $paged <= ($count-1) ){
      for( $i = 1; $i < $count; $i++ ) {
        $page = 1 + $i;
        if( $page <= $max ) {
          $links[] = $page;
        }
      }
    }

    /** Add the pages around the last 5 pages to the array */
    if( $paged <= $max && $max > $count && $paged > ($max - ($count-1)) ){
      for( $i = ($max - ($count-1)); $i < $max; $i++ ) {
        $page = $i;
        if( $page <= $max ) {
          $links[] = $page;
        }
      }
    }

    /** Add the pages around the current page to the array */
    if ( $paged >= $count && $paged <= ($max - ($count-1)) ) {
      // Add current page to the array */
      $links = array($paged);
      $links[] = $paged - 1;
      $links[] = $paged - 2;

      if ( ( $paged + 2 ) <= $max ) {
        $links[] = $paged + 2;
        $links[] = $paged + 1;
      }
    }

    $links = array_unique($links);

    \ob_start();

    echo '<ul>' . "\n";

    /** Previous Post Link */
    if ( get_previous_posts_link() )
        printf( '<li>%s</li>' . "\n", get_previous_posts_link('<i class="mpcs-angle-left"></i>') );

    /** Link to first page, plus ellipses if necessary */
    if ( ! in_array( 1, $links ) ) {
        $class = 1 == $paged ? ' class="active"' : '';

        printf( '<li%s><a href="%s">%s</a></li>' . "\n", $class, esc_url( get_pagenum_link( 1 ) ), '1' );

        if ( ! in_array( 2, $links ) )
            echo '<li>…</li>';
    }

    /** Link to current page, plus 2 pages in either direction if necessary */
    sort( $links );
    foreach ( (array) $links as $link ) {
      $class = $paged == $link ? ' class="active"' : '';
      printf( '<li%s><a href="%s">%s</a></li>' . "\n", $class, esc_url( get_pagenum_link( $link ) ), $link );
    }

    /** Link to last page, plus ellipses if necessary */
    if ( ! in_array( $max, $links ) ) {
      if ( ! in_array( $max - 1, $links ) )
        echo '<li>…</li>' . "\n";

      $class = $paged == $max ? ' class="active"' : '';
      printf( '<li%s><a href="%s">%s</a></li>' . "\n", $class, esc_url( get_pagenum_link( $max ) ), $max );
    }

    /** Next Post Link */
    if ( get_next_posts_link() )
      printf( '<li>%s</li>' . "\n", get_next_posts_link('<i class="mpcs-angle-right"></i>') );
    echo '</ul>' . "\n";

    $pagination = \ob_get_clean();
    return $pagination;
  }

  /**
   * display_course_instructor
   *
   * @return void
   */
  public static function display_course_instructor(){
    global $post;

    $course_instructor = '';
    \ob_start();
      require(\MeprView::file('/courses/courses_instructor'));
    $course_instructor = \ob_get_clean();

    return apply_filters( base\SLUG_KEY . '_classroom_instructor', $course_instructor );
  }


  /**
   * display_course_resources
   *
   * @return string The rendered content from the [mpcs-resources] shortcode.
   */
  public static function display_course_resources(){
    global $post;
    $shortcode = '[mpcs-resources course-id="'.$post->ID.'"]';
    return do_shortcode( $shortcode );
  }


  public static function is_course_archive(){
    $query = get_queried_object();
    if( isset($query) && $query->name == models\Course::$cpt ){
      return true;
    }
    return false;
  }

  /**
   * Deletes all course listings transients
   *
   * @return void
   */
  public static function delete_transients(){
    $transients = \get_option('mpcs-transients', array());
    foreach ($transients as $transient) {
      delete_transient( $transient );
    }
    \delete_option('mpcs-transients');
  }

  /**
   * Get course grades URL for a Student
   *
   * @param models\Course $course
   * @return string
   */
  public static function get_course_grades_url(models\Course $course){
    $url = get_permalink( $course->ID );
    if( App::is_gradebook_addon_active() ){
      $url = add_query_arg(
        array(
          'action' => 'gradebook'
        ),
        $url
      );
    }
    return $url;
  }

  /**
   * Get course gradebook URL for an Admin
   *
   * @param models\Course $course
   * @return string
   */
  public static function get_course_gradebook_url(models\Course $course, $user){
    $url = admin_url('user-edit.php?user_id=' . $user->ID . '#mpcs-profile-course-information-heading');
    if( App::is_gradebook_addon_active() ){
      $url = add_query_arg(
        array(
          'id' => $course->ID,
          'search-field' => 'id',
          'search' => get_current_user_id()
        ),
        admin_url('admin.php?page=memberpress-course-gradebook')
      );
    }
    return $url;
  }
}
