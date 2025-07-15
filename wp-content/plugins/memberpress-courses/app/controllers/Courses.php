<?php
namespace memberpress\courses\controllers;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

use memberpress\courses as base;
use memberpress\quizzes as quizzes;
use memberpress\courses\Dompdf\Dompdf;
use memberpress\courses\Dompdf\Options;
use memberpress\courses\lib as lib;
use memberpress\courses\models as models;
use memberpress\courses\helpers as helpers;

class Courses extends lib\BaseCtrl {
  public function load_hooks() {
    add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'), 99999999);
    add_action('pre_get_posts', array($this, 'filter_courses_archive'), 999999);
    add_action('save_post', array($this, 'delete_transients'), 10, 2 );
    add_action('mepr-txn-store', array($this, 'delete_mycourses_transient'), 10, 1);
    add_action('wp_ajax_nopriv_mpcs-course-certificate', array($this, 'generate_pdf_certificate'));
    add_action('wp_ajax_mpcs-course-certificate', array($this, 'generate_pdf_certificate'));
    add_filter('the_content', array($this, 'page_router'), 10);

    if(helpers\App::is_classroom()) {
      add_filter('template_include', array($this, 'override_template'), 999999); // High priority so we have the last say here
    } else {
      add_filter('template_include', array($this, 'override_template')); // Normal priority since we aren't using classroom mode
    }

    add_filter('body_class', array($this, 'add_body_class'));
    add_shortcode('mpcs-courses', array($this, 'courses_shortcode'));
    add_shortcode('mpcs-my-courses', array($this, 'my_courses_shortcode'));
    add_shortcode('mpcs-section-overview', array($this, 'section_overview_shortcode'));
    add_shortcode('mpcs-course-overview', array($this, 'course_overview_shortcode'));
    add_shortcode('mpcs-purchase-button', array($this, 'purchase_shortcode'));
    add_shortcode('mpcs-certificate-link', array($this, 'certificate_link'));
    add_shortcode('mpcs-resources', array($this, 'resources_shortcode'));
  }

  /**
  * Override default template with the courses page template
  * @param string $template current template
  * @return string $template modified template
  */
  public static function override_template($template) {
    global $post;

    if(isset($post) && is_a($post, 'WP_Post') && $post->post_type == models\Course::$cpt) {
      if(is_single()) {
        $course = new models\Course($post->ID);
        $new_template = locate_template($course->page_template);
        if(helpers\App::is_classroom()){ //Leaving this check here even though we check when we include the action for double layer of security
          $template = \MeprView::file('/classroom/courses_single_course');
        }
        elseif(isset($new_template) && !empty($new_template)) {
          return $new_template;
        }
        else {
          $located_template = locate_template(
            array(
              'single-mpcs-course.php',
              'page.php',
              'custom_template.php',
              'single.php',
              'index.php'
            )
          );

          if( ! empty($located_template) ) {
            $template = $located_template;
          }
        }
      }
    }

    if(is_post_type_archive( models\Course::$cpt ) && helpers\App::is_classroom()){
      $template = \MeprView::file('/classroom/courses_archive_course');
    }

    return $template;
  }

  /**
   * Add class to body course
   * @param array $classes
   * @return array
   */
  public function add_body_class($classes) {
    global $post;

    if($post instanceof \WP_Post && $post->post_type == models\Course::$cpt) {
      if(is_single()) {
        $course = new models\Course($post->ID);
        if($course->accordion_course === 'enabled') {
          $classes[] = 'mpcs-course-with-accordion';
        }
      }
    }

    return $classes;
  }

  /**
  * Render courses list html for shortcode
  * @see load_hooks, add_shortcode('mpcs-my-courses')
  * @param array $attributes Shortcode attributes
  * @return string $content HTML string for shortcode
  */
  public static function courses_shortcode($attributes = []) {
    $content = '';

    \ob_start();
      Account::my_courses_list('courses_shortcode', false, $attributes);
    $content .= \ob_get_clean();

    return $content;
  }

  /**
  * Render my courses list html for shortcode
  * @see load_hooks, add_shortcode('mpcs-my-courses')
  * @param array $attributes Shortcode attributes
  * @return string $content HTML string for shortcode
  */
  public static function my_courses_shortcode($attributes) {
    $content = '';

    \ob_start();
      Account::my_courses_list('courses', false, $attributes);
    $content .= \ob_get_clean();

    return $content;
  }

  /**
  * Render lesson list html for shortcode
  * @see load_hooks, add_shortcode('mpcs-section-overview')
  * @param array $attributes Shortcode attributes
  * @return string $content HTML string for shortcode
  */
  public static function section_overview_shortcode($attributes) {
    global $post;

    $content = '';

    if(is_user_logged_in()) {
      $current_user = lib\Utils::get_currentuserinfo();
    }

    if(isset($attributes['section_id']) && is_numeric($attributes['section_id'])) {
      $section = new models\Section($attributes['section_id']);
    }
    else if(isset($attributes['lesson_id']) && is_numeric($attributes['lesson_id'])) {
      $lesson = new models\Lesson($attributes['lesson_id']);
      $section = $lesson->section();
    }
    else if(isset($post) && $post->post_type==models\Lesson::$cpt) {
      $lesson = new models\Lesson($post->ID);
      $section = $lesson->section();
    }

    if(isset($section) && $section !== false) {
      $course = $section->course();
      \ob_start();

        ?>
        <?php if(is_user_logged_in() && models\UserProgress::has_completed_section($current_user->ID, $section->id)): ?>
          <div class="mpcs-section-overview mpcs-section-complete">
        <?php else: ?>
          <div class="mpcs-section-overview mpcs-section-not-complete">
        <?php endif; ?>

            <?php if(isset($attributes['hide_title']) && ($attributes['hide_title']=='true' || $attributes['hide_title']==1)): ?>
            <?php else: ?>
              <h3><?php echo esc_html($section->title); ?></h3>
            <?php endif; ?>
            <ol class="mpcs-lessons">
      <?php foreach($section->lessons(true, false) as $lesson): ?>
          <?php if(is_user_logged_in() && models\UserProgress::has_completed_lesson($current_user->ID, $lesson->ID)): ?>
                  <li class="mpcs-lesson mpcs-lesson-complete"><a href="<?php echo esc_url(get_permalink($lesson->ID)); ?>"><?php echo esc_html($lesson->post_title); ?></a></li>
                <?php else: ?>
                  <li class="mpcs-lesson mpcs-lesson-not-complete"><a href="<?php echo esc_url(get_permalink($lesson->ID)); ?>"><?php echo esc_html($lesson->post_title); ?></a></li>
                <?php endif; ?>
              <?php endforeach; ?>
            </ol>

          </div>
        <?php

      $content = \ob_get_clean();
    }

    return $content;
  }

  /**
  * Render section and lesson list html for shortcode
  * @see load_hooks, add_shortcode('mpcs-course-overview')
  * @param array $attributes Shortcode attributes
  * @return string $content HTML string for shortcode
  */
  public static function course_overview_shortcode($attributes) {
    $content = '';
    global $post;

    if(isset($attributes['course_id']) && is_numeric($attributes['course_id'])) {
      $course = new models\Course($attributes['course_id']);
    }
    else if(isset($attributes['section_id']) && is_numeric($attributes['section_id'])) {
      $section = new models\Section($attributes['section_id']);
      $course = $section->course();
    }
    else if(isset($attributes['lesson_id']) && is_numeric($attributes['lesson_id'])) {
      $lesson = new models\Lesson($attributes['lesson_id']);
      $course = $lesson->course();
    }
    else if(isset($attributes['quiz_id']) && is_numeric($attributes['quiz_id'])) {
      $quiz = new quizzes\models\Quiz($attributes['quiz_id']);
      $course = $quiz->course();
    }
    else if(isset($post) && $post->post_type==models\Course::$cpt) {
      $course = new models\Course($post->ID);
    }
    else if(isset($post) && $post->post_type==models\Lesson::$cpt) {
      $lesson = new models\Lesson($post->ID);
      $course = $lesson->course();
    }
    else if(isset($post) && helpers\App::is_quizzes_addon_active() && $post->post_type==quizzes\models\Quiz::$cpt) {
      $quiz = new quizzes\models\Quiz($post->ID);
      $course = $quiz->course();
    }

    if(isset($course) && $course !== false) {
      \ob_start();

        ?>
          <div class="mpcs-course-overview">
        <?php

        if(isset($attributes['hide_title']) && ($attributes['hide_title']=='true' || $attributes['hide_title']==1)):
        else:
          ?>
            <h2 class="mpcs-course-title"><?php echo esc_html($course->post_title); ?></h2>
          <?php
        endif;

        foreach($course->sections() as $section) {
          // Don't pass hide_title as in this shortcode we'll always show the section titles
          echo self::section_overview_shortcode(array('section_id' => $section->id));
        }

        ?>
          </div>
        <?php

      $content = \ob_get_clean();
    }

    return $content;
  }

  public static function purchase_shortcode($attributes) {
    $content = '';

    if(isset($attributes['membership_id']) && is_numeric($attributes['membership_id'])) {
      $membership = new \MeprProduct($attributes['membership_id']);
      if($membership !== false) {
        $link_text = isset($attributes['text']) ? $attributes['text'] : __('Enroll', 'memberpress-courses');
        $content = '<form action="' . get_permalink($membership->ID) . '"><input type="submit" value="' . $link_text . '" /></form>';
      }
    }

    return $content;
  }

  /**
  * Render resources html
  * @param array $attributes Shortcode attributes
  * @return string $content HTML string for shortcode
  */
  public static function resources_shortcode($attributes) {
    $content = '';

    if(isset($attributes['course-id']) && is_numeric($attributes['course-id'])) {
      $course = new models\Course($attributes['course-id']);

      if(!$course->ID){
        return $content;
      }

      $resources = $course->get_resources();
      $data = array();

      foreach ($resources['sections'] as $sectionKey => $sectionValue) {
        $data[$sectionKey] = array_map(function ($itemId) use ($resources) {
          return (object) $resources['items'][$itemId];
        }, $sectionValue['items']);
        $data['labels'][$sectionKey] = $resources['sections'][$sectionKey]['label'];
      }

      $resources = (object) $data;
      $content = \MeprView::get_string('/courses/course-resources', compact('resources') );

      $content = apply_filters( base\SLUG_KEY . '_classroom_resources', $content );
    }

    return $content;
  }

  /**
  * Render certificate link html for shortcode
  * @see load_hooks, add_shortcode('mpcs-certificate-link')
  * @param array $attributes Shortcode attributes
  * @return string $content HTML string for shortcode
  */
  public static function certificate_link($attributes) {
    global $post;

    $content = '';
    $course_id = null;

    if(models\Course::$cpt == get_post_type() && isset($post->ID)) {
      $course_id = $post->ID;
    } elseif(isset($attributes['course_id']) && !empty($attributes['course_id'])) {
      $course_id = esc_attr($attributes['course_id']);
    } else {
      return;
    }

    if(!$course_id) { return; }

    $current_user = wp_get_current_user();
    if($current_user->ID === 0) { return; }

    $course = new models\Course($course_id);
    if ($course->user_progress( $current_user->ID ) >= 100 && $course->certificates_enable == 'enabled' ) {
      $cert_url = admin_url( 'admin-ajax.php?action=mpcs-course-certificate' );
      $cert_url = add_query_arg(
        array(
          'user' => $current_user->ID,
          'course' => $course_id,
        ),
        $cert_url
      );
      $text = isset($attributes['text']) && !empty($attributes['text']) ? esc_attr($attributes['text']) : __('Download Certificate', 'memberpress-courses');
      $content = '<div class="mpcs-certificate-link"><a href="'. esc_url_raw($cert_url) .'" target="_blank">'. esc_html($text) .'</a></div>';
    }

    return $content;
  }

  /**
   * page_router
   *
   * @param  mixed $content
   * @return void
   */
  public function page_router($content){
    global $post;

    if( !isset($post) || !is_a($post, 'WP_Post') || $post->post_type !== models\Course::$cpt){
      return $content;
    }

    $action = self::get_param('action');

    if($action and $action == 'instructor') {
      $content = helpers\Courses::display_course_instructor();
    }
    elseif($action and $action == 'resources') {
      $content = helpers\Courses::display_course_resources();
    }
    else{
      $content .= helpers\Courses::display_course_overview();
    }

    return apply_filters('mpcs_classroom_page_router', $content, $action);
  }

  /**
   * Enqueue scripts
   *
   * @return void
   */
  public function enqueue_scripts() {
    global $post;

    if( ! helpers\App::is_classroom() ){
      \wp_enqueue_style('mpcs-progress', base\CSS_URL . '/progress.css', array(), base\VERSION);
      \wp_enqueue_script('mpcs-progress-js', base\JS_URL . '/progress.js', array('jquery'), base\VERSION, true);
      \wp_enqueue_style('mpcs-fontello-styles', base\FONTS_URL.'/fontello/css/mp-courses.css', array(), base\VERSION);
    }
    elseif( (is_a($post, 'WP_Post') && $post->post_type == models\Course::$cpt && !is_search()) || helpers\Courses::is_course_archive() ) {
      $mepr_options = \MeprOptions::fetch();
      $styles = array(
        'global-styles',
        'wp-block-library',
        'wp-block-library-theme',
        'mpcs-fontello-styles',
        'mpcs-vex'
      );
      if (
        $mepr_options->global_styles ||
        (
          !$mepr_options->redirect_on_unauthorized &&
          $mepr_options->unauth_show_login &&
          (
            \MeprRule::is_locked($post) ||
            \MeprRule::is_uri_locked(esc_url($_SERVER['REQUEST_URI']))
          )
        )
      ) {
        $styles[] = 'dashicons';
        $styles[] = 'mp-login-css';
      }
      Classroom::remove_styles($styles);

      \wp_enqueue_script('mpcs-clipboard-js', base\JS_URL . '/vendor/clipboard.min.js', array(), base\VERSION);
      \wp_enqueue_style('mpcs-tooltipster', base\CSS_URL . '/vendor/tooltipster.bundle.min.css', array(), base\VERSION);
      \wp_enqueue_style('mpcs-tooltipster-borderless', base\CSS_URL . '/vendor/tooltipster-sideTip-borderless.min.css', array(), base\VERSION);
      \wp_enqueue_script('mpcs-tooltipster', base\JS_URL . '/vendor/tooltipster.bundle.min.js', array('jquery'), base\VERSION);

      wp_enqueue_style('wp-block-gallery');

      \wp_enqueue_style('mpcs-classroom', base\CSS_URL . '/classroom.css', array(), base\VERSION);
      if(is_rtl()) {
        \wp_enqueue_style('mpcs-classroom-rtl', base\CSS_URL . '/classroom-rtl.css', array(), base\VERSION);
      }
      \wp_enqueue_script('mpcs-classroom-js', base\JS_URL . '/classroom.js', array('jquery'), base\VERSION);
      \wp_enqueue_style('mpcs-fontello-styles', base\FONTS_URL.'/fontello/css/mp-courses.css', array(), base\VERSION);
    }

  }

  /**
   * Filters Course archive posts
   *
   * @param  object $query
   * @return void
   */
  public static function filter_courses_archive($query) {
    global $wp_query, $wpdb;

    if ( is_admin() ) {
      return;
    }

    if ( ! $query->is_main_query() ) {
      return;
    }

    if ( ! is_post_type_archive( models\Course::$cpt ) ) {
      return;
    }

    $user_id = \get_current_user_id();
    $transients = \get_option('mpcs-transients', array());
    $options = \get_option('mpcs-options');

    $courses_per_page = (int) helpers\Options::val($options,'courses-per-page', 10);
    $per_page = apply_filters('mpcs_courses_per_page', $courses_per_page);

    //Get the Courses the user has Started
    if ( false == ( get_transient( 'mpcs_enrolled_courses_'.$user_id ) ) ) {
      $progress = models\UserProgress::find_all_by_user($user_id);
      $courses_started = array_unique( array_column($progress, 'course_id') );

      if (empty($courses_started)) {
        $courses_started = array ( 0 );
      }

      $my_course_ids = get_posts(array('post_type' => models\Course::$cpt, 'posts_per_page' => -1, 'post__in' => $courses_started, 'orderby' => 'title', 'order' => 'ASC', 'fields' => 'ids'));
      set_transient( 'mpcs_enrolled_courses_'.$user_id, $my_course_ids, 24 * HOUR_IN_SECONDS );
      $transients[] = 'mpcs_enrolled_courses_'.$user_id;
      \update_option('mpcs-transients', $transients);
    }
    else{
      $my_course_ids = get_transient( 'mpcs_enrolled_courses_'.$user_id );
    }

    $sort_options = array(
        'alphabetically' => array(
            'orderby' => 'title',
        ),
        'last-updated' => array(
            'orderby' => 'modified',
        ),
        'publish-date' => array(
            'orderby' => 'date',
        )
    );

    $mpcs_sort_order = helpers\Options::val($options,'courses-sort-order', 'alphabetically');
    $mpcs_sort_order_direction = helpers\Options::val($options,'courses-sort-order-direction', 'ASC');

    if( ! in_array($mpcs_sort_order_direction, array('ASC','DESC'), true) ) {
      $mpcs_sort_order_direction = 'ASC';
    }

    $sort_option = isset($sort_options[$mpcs_sort_order]) ? $sort_options[$mpcs_sort_order] : $sort_options['default'];

   // Get all Courses
   if ( false === ( $all_course_ids = get_transient( 'mpcs_all_courses'.$user_id ) ) ) {

      $courses = get_posts(array('post_type' => models\Course::$cpt, 'posts_per_page' => -1, 'post__not_in' => $my_course_ids));

      // Remove courses users are not allowed to view, if applicable
      if(false == \MeprUtils::is_logged_in_and_an_admin() && !$options['show-protected-courses']){
        $courses = array_filter($courses, function($course){
          return false == \MeprRule::is_locked($course);
        });
      }

      //Krista, Remember: ALL COURSE IDS DOES NOT INCLUDED STARTED COURSES
      $all_course_ids = array_map(function($c) {
        return is_object($c) ? $c->ID : $c['ID'];
      }, $courses);
      $course_ids = array_merge($my_course_ids, $all_course_ids);

      set_transient( 'mpcs_all_courses', $all_course_ids, 24 * HOUR_IN_SECONDS );
      $transients[] = 'mpcs_all_courses';
      \update_option('mpcs-transients', $transients);
    }else{
      $course_ids = get_transient( 'mpcs_all_courses' );
    }

    // If 'My Courses' is clicked, show only courses the user has access to
    if('mycourses' === self::get_param('type')) {
      //Get Courses User has access too
      if ( false == ( get_transient( 'mpcs_mycourses_'.$user_id ) ) ) {
        $mepr_user = new \MeprUser($user_id);

        if(empty($course_ids)) {
          $course_ids = array (0); //Empty arrays apply no filter on get_posts
        }

        $courses = get_posts(array('post_type' => models\Course::$cpt, 'posts_per_page' => -1, 'post__in' => $course_ids));

        // Remove courses the user does not have access to
        if(false == \MeprUtils::is_logged_in_and_an_admin()){
          $allowed_courses = array_filter($courses, function($course) use ($mepr_user) {
            return false == \MeprRule::is_locked_for_user($mepr_user, $course);
          });
        }

        if(isset($allowed_courses)) {
          $course_ids = array_column( $allowed_courses, 'ID' );
        }

        set_transient( 'mpcs_mycourses_'.$user_id, $course_ids, 24 * HOUR_IN_SECONDS );
        $transients[] = 'mpcs_mycourses_'.$user_id;
        \update_option('mpcs-transients', $transients);
      } else{
        $course_ids = get_transient( 'mpcs_mycourses_'.$user_id );
      }
    }

    if(empty($course_ids)) {
      $course_ids = array ( 0 );
    }
    // Filter archive by allowed courses
    $query->set('post__in', $course_ids);
    $query->set('orderby', $sort_option['orderby']);
    $query->set('order', $mpcs_sort_order_direction);
    $query->set('posts_per_page', $per_page);

    // Display only enabled courses in "All Courses" list
    if('mycourses' !== self::get_param('type')){
      $query->set('meta_query', array(
        array(
          'key' => '_mpcs_course_status',
          'value' => 'enabled',
        )
      ));
    }

    // Author filter
    if($author = self::get_param('author')){
      if( $user_id = username_exists( sanitize_text_field( $author ) ) ){
        $query->set( 'author', $user_id );
      }
    }

    // Category filter
    if($category = self::get_param('category')){
      $tax_query = array(
        array(
          'taxonomy' => 'mpcs-course-categories',
          'field'    => 'slug',
          'terms'    => $category,
        ),
      );
      $query->set( 'tax_query', $tax_query );
    }

    remove_action('parse_tax_query', 'astra_blog_post_per_page', 10);

    return $query;
  }

  /**
   * Delete transient for member's active courses when a transaction is created/modified for them.
   *
   * @param object $txn
   * @return void
   */
  function delete_mycourses_transient($txn) {
    if(isset($txn->user_id) && $txn->user_id > 0) {
      delete_transient('mpcs_mycourses_' . (string) $txn->user_id);
    }
  }

  /**
   * Delete Transients
   *
   * @param  mixed $new_status
   * @param  mixed $old_status
   * @param  mixed $post
   * @return void
   */
  function delete_transients( $post_id, $post ){
    if ( models\Course::$cpt !== $post->post_type && \MeprRule::$cpt !== $post->post_type ) {
      return; // restrict the filter to specific post types
    }

    if(\MeprRule::$cpt === $post->post_type){
      if ( stripos($post->post_title, 'course') === false ) {
        return;
      }
    }

    helpers\Courses::delete_transients();
  }


  /**
   * Utility function to grab a parameter whether it's a get or post
   *
   * @param  mixed $param
   * @param  mixed $default
   * @return void
   */
  public static function get_param($param, $default = '') {
    return (isset($_REQUEST[$param])?$_REQUEST[$param]:$default);
  }

  /**
  * @throws lib\Exception
  */
  public function generate_pdf_certificate() {
    $course_id      = filter_input(1, 'course', FILTER_VALIDATE_INT);
    $user_id        = filter_input(1, 'user', FILTER_VALIDATE_INT);
    $shareable      = filter_input(1, 'shareable', FILTER_VALIDATE_BOOLEAN);
    $course         = new models\Course($course_id);
    $current_user   = \MeprUtils::get_currentuserinfo();

    if ( $shareable ) {
      if ( $course->user_progress( $user_id ) < 100 ) {
        throw new lib\Exception(__('Course is not complete', 'memberpress-courses'));
      }
    } else {
      $user_id = $current_user->ID;
      if ( $course->user_progress( $current_user->ID ) < 100 ) {
        throw new lib\Exception(__('Course is not complete', 'memberpress-courses'));
      }
    }

    $last_completion_date = models\UserProgress::get_course_completion_date( $user_id, $course->ID );
    $expires_value = $course->certificates_expires_value;
    $expires_unit = $course->certificates_expires_unit;

    switch($expires_unit) {
        case 'day':
        $period = $expires_value . "D";
        break;
        case 'week':
        $period = $expires_value * 7 . 'D';
        break;
        case 'month':
        $period = $expires_value . "M";
        break;
        case 'year':
        $period = $expires_value . "Y";
        break;
    }

    $last_completion_datetime = new \DateTime($last_completion_date);
    $last_completion_datetime->add(new \DateInterval('P' . $period));

    $user                 = new \WP_User($user_id);
    $fontDirectory        = base\FONTS_PATH;
    $default_font         = apply_filters( 'mpcs_certificate_default_font', 'Helvetica' );
    $title_font           = apply_filters( 'mpcs_certificate_title_font', 'Crimson Text' );
    $student_name_font    = apply_filters( 'mpcs_certificate_student_name_font', 'Great Vibes' );
    $instructor_name_font = apply_filters( 'mpcs_certificate_instructor_name_font', 'Poppins' );
    $footer_font          = apply_filters( 'mpcs_certificate_footer_font', 'Poppins' );
    \ob_start();
      require(\MeprView::file('/courses/courses_certificate'));
    $content = \ob_get_clean();

    $options = new Options();
    $options->set('defaultFont', $default_font);
    $options->set('chroot', WP_CONTENT_DIR);
    $options->set('isRemoteEnabled', true);

    $dompdf = new Dompdf($options);
    $dompdf->getFontMetrics()->registerFont(
      ['family' => 'Tangerine', 'style' => 'normal', 'weight' => 'normal'],
      $fontDirectory . '/Tangerine-Regular.ttf'
    );
    $dompdf->loadHtml($content);

    // 'A4' and 'letter' are probably going to be desired
    $paper_size = empty($course->certificates_paper_size) ? 'letter' : $course->certificates_paper_size;
    $paper_size = apply_filters('mpcs_certificate_paper_size', $paper_size);
    $dompdf->setPaper($paper_size, 'landscape');

    // Render the HTML as PDF
    $dompdf->render();

    // Output or Download PDF
    if ($course->certificates_force_download_pdf === 'enabled') {
      $dompdf->stream("certificate.pdf", array("Attachment" => true));
    } else {
      $dompdf->stream("certificate.pdf", array("Attachment" => false));
    }

    exit(0); //For some weird reason in Safari and Firefox the certificates don't work without this line of code
  }
}
