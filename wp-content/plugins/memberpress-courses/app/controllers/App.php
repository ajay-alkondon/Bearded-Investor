<?php
namespace memberpress\courses\controllers;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

use memberpress\courses as base;
use memberpress\courses\lib as lib;
use memberpress\courses\helpers as helpers;
use memberpress\courses\controllers\admin as ctrl;
use memberpress\courses\models as models;
use MeprAddonUpdates;

class App extends lib\BaseCtrl {
  public function load_hooks() {
    add_action( 'init', array( $this, 'maybe_flush_rewrite_rules' ), 99 );
    add_action( 'init', array( $this, 'add_comments_support' ) );
    add_action( 'admin_notices', array( $this, 'courses_activated_admin_notice' ) );
    add_action( 'admin_notices', array( $this, 'required_wordpress_admin_notice' ) );
    add_action( 'admin_init', array($this,'install') ); // DB upgrade is handled automatically here now
    add_action( 'mepr-process-options', array($this,'store_options') );
    add_action( 'admin_enqueue_scripts', array($this, 'enqueue_admin_scripts') );
    add_action( 'in_admin_header', array($this, 'admin_header'), 0 );
    add_filter( 'mepr-extend-rules', array($this, 'protect_sections_lessons'), 10, 3 );
    add_filter( 'mepr-content-locked-for-user', array($this, 'protect_courses_lessons'), 10, 4 );
    add_action( 'template_redirect', array($this, 'redirect_to_sales_page'), 1 );
    add_action( 'customize_register', array($this, 'register_customizer') );
    add_filter( 'post_type_link', array($this, 'lesson_permalink_replace'), 1, 2 );
    add_filter( 'rewrite_rules_array', array($this, 'lesson_permalink_rules') );
    add_filter( 'use_block_editor_for_post_type', array( $this, 'force_block_editor_for_courses' ), 999, 2 );
    add_filter( 'mepr-pre-run-rule-content', array($this, 'show_more_content_on_archive_page'), 10, 3 );
    add_filter( 'the_title', array($this, 'show_lock_icon') );
    add_action( 'plugins_loaded', array($this, 'addon_updates') );
    add_filter( 'mepr_view_paths', array( $this, 'add_view_path' ) );
    add_filter( 'mepr-rule-types-before-partial', array( $this, 'course_section_rule_type' ) );
    add_filter( 'mepr-rule-contents-array', array( $this, 'course_section_contents_array' ), 10, 2 );
    add_filter( 'mepr-rule-content', array( $this, 'course_section_content' ), 10, 3 );
    add_filter( 'mepr-rule-has-content', array( $this, 'has_course_section' ), 10, 2 );
    add_filter( 'mepr-rule-search-content', array( $this, 'find_course_sections' ), 10, 3 );
    add_filter( 'mepr-extend-post-rules', array( $this, 'extend_post_rules' ), 10, 3 );
    add_filter( 'comments_template', array( $this, 'course_comments_template' ) );
    add_action( base\SLUG_KEY . '_courses_footer', array($this, 'do_wordpress_footer'));
    add_action( 'wp_footer', array($this, 'record_course_events'));
    add_filter( 'mpdt-member-extend-obj-data', array( 'memberpress\courses\helpers\Events', 'mpdt_member_extend_object' ), 10, 2 );
    add_filter( 'mdpt-ajax-event-data', array( 'memberpress\courses\helpers\Events', 'mpdt_event_data' ) );
    add_filter( 'mpdt-sample-event-data', array( 'memberpress\courses\helpers\Events', 'mpdt_event_data' ) );
    add_action( 'menu_order', array( $this, 'admin_menu_order' ), 11 );
    add_action( 'custom_menu_order', array( $this, 'admin_menu_order' ), 11 );
    add_action( 'plugins_loaded', array( $this, 'autoinstall_quizzes_addon' ));
  }

  /**
   * Make sure the rewrite rules are flushed to prevent issues with accessing the custom post types.
   * All custom post types should be registered by now.
   *
   * @return void
   */
  public function maybe_flush_rewrite_rules() {
    if ( empty( get_option( 'mepr_courses_flushed_rewrite_rules', '' ) ) ) {
      flush_rewrite_rules();
      update_option( 'mepr_courses_flushed_rewrite_rules', true );
    }
  }

  /**
   * Add comments support to courses and lessons post types
   *
   * @return void
   */
  public function add_comments_support() {
    $options = \get_option('mpcs-options');
    $show_course_comments = helpers\Options::val($options, 'show-course-comments');
    if ( !empty( $show_course_comments ) ) {
      add_post_type_support( models\Course::$cpt, 'comments' );
      add_post_type_support( models\Lesson::$cpt, 'comments' );
    }
  }

  public function courses_activated_admin_notice() {
    if ( ! empty( $_GET['courses_activated'] ) && 'true' === $_GET['courses_activated'] ) : ?>
      <div class="notice notice-success is-dismissible">
        <p><?php esc_html_e( 'MemberPress Courses has been activated successfully!', 'memberpress-courses' ) ?></p>
      </div>
    <?php endif;
  }

  public function required_wordpress_admin_notice() {
    if(version_compare(get_bloginfo('version'),'5.0', '<') ) : ?>
      <div class="notice notice-warning is-dismissible">
        <p><?php esc_html_e( 'MemberPress Courses requires WordPress 5.0 and above to run smoothly. Please upgrade!', 'memberpress-courses' ) ?></p>
      </div>
    <?php endif;
  }

  /**
   * Enable updates for this add-on.
   */
  public function addon_updates() {
    if(class_exists('MeprAddonUpdates')) {
      new MeprAddonUpdates(
        base\EDITION,
        base\PLUGIN_SLUG,
        'mpcs_license_key',
        'MemberPress Courses',
        'Courses add-on for MemberPress.'
      );
    }
  }

  /**
   * Saves the "Courses" data after Options page is updated
   *
   * @return void
   */
  public function store_options() {
    if(lib\Utils::is_post_request() && isset($_POST['mpcs-options']) && is_array($_POST['mpcs-options'])) {
      $values = wp_unslash($_POST['mpcs-options']);

      $old_options = get_option('mpcs-options', array());
      $old_courses_slug = isset($old_options['courses-slug']) && is_string($old_options['courses-slug']) ? sanitize_key($old_options['courses-slug']) : '';
      $old_lessons_slug = isset($old_options['lessons-slug']) && is_string($old_options['lessons-slug']) ? sanitize_key($old_options['lessons-slug']) : '';
      $old_quizzes_slug = isset($old_options['quizzes-slug']) && is_string($old_options['quizzes-slug']) ? sanitize_key($old_options['quizzes-slug']) : '';
      $old_assignments_slug = isset($old_options['assignments-slug']) && is_string($old_options['assignments-slug']) ? sanitize_key($old_options['assignments-slug']) : '';

      $updated_options = [
        'courses-slug' => isset($values['courses-slug']) && is_string($values['courses-slug']) ? sanitize_key($values['courses-slug']) : $old_courses_slug,
        'lessons-slug' => isset($values['lessons-slug']) && is_string($values['lessons-slug']) ? sanitize_key($values['lessons-slug']) : $old_lessons_slug,
        'quizzes-slug' => isset($values['quizzes-slug']) && is_string($values['quizzes-slug']) ? sanitize_key($values['quizzes-slug']) : $old_quizzes_slug,
        'classroom-mode' => isset($values['classroom-mode']) ? 1 : 0,
        'assignments-slug' => isset($values['assignments-slug']) && is_string($values['assignments-slug']) ? sanitize_key($values['assignments-slug']) : $old_assignments_slug,
        'comments' => isset($values['comments']) && in_array($values['comments'], ['disabled', 'enabled'], true) ? $values['comments'] : '',
        'brand-color' => isset($values['brand-color']) && is_string($values['brand-color']) ? sanitize_text_field($values['brand-color']) : '',
        'accent-color' => isset($values['accent-color']) && is_string($values['accent-color']) ? sanitize_text_field($values['accent-color']) : '',
        'progress-color' => isset($values['progress-color']) && is_string($values['progress-color']) ? sanitize_text_field($values['progress-color']) : '',
        'menu-text-color' => isset($values['menu-text-color']) && is_string($values['menu-text-color']) ? sanitize_text_field($values['menu-text-color']) : '',
        'classroom-logo' => isset($values['classroom-logo']) && is_numeric($values['classroom-logo']) ? (int) $values['classroom-logo'] : '',
        'lesson-button-location' => isset($values['lesson-button-location']) && in_array($values['lesson-button-location'], ['top', 'bottom', 'both'], true) ? $values['lesson-button-location'] : '',
        'complete-link-css' => isset($values['complete-link-css']) && is_string($values['complete-link-css']) ? sanitize_text_field($values['complete-link-css']) : '',
        'previous-link-css' => isset($values['previous-link-css']) && is_string($values['previous-link-css']) ? sanitize_text_field($values['previous-link-css']) : '',
        'breadcrumb-link-css' => isset($values['breadcrumb-link-css']) && is_string($values['breadcrumb-link-css']) ? sanitize_text_field($values['breadcrumb-link-css']) : '',
      ];

      $options = array_merge($old_options, $updated_options);

      update_option('mpcs-options', $options);

      // Delete Course Listing Transient
      helpers\Courses::delete_transients();
    }
  }

  /**
  * Register custom post type for all CPTs
  * Called from activation.php
  * Hook: register_activation_hook
  */
  public function register_all_cpts() {
    $courses_ctrl = ctrl\Courses::fetch();
    $courses_ctrl->register_post_type();
    $lesson_ctrl = ctrl\Lessons::fetch();
    $lesson_ctrl->register_post_type();
  }

  public function toplevel_menu_route() {
    $courses_ctrl = ctrl\Courses::fetch();
    ?>
    <script>
      window.location.href="<?php echo $courses_ctrl->cpt_admin_url(); ?>";
    </script>
    <?php
  }

  /**
   * Get dashboard icon data image
   *
   * @return string
   */
  public static function courses_icon() {
    $icon = file_get_contents(base\BRAND_PATH . '/images/plugin-icon.svg');

    return 'data:image/svg+xml;base64,' . base64_encode( $icon ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
  }

  public static function setup_menus() {
    $app = App::fetch();
    add_action('admin_menu', array($app,'menu'), 20);
  }

  public function menu() {
    self::admin_separator();
    $menu_title = __('MemberPress Courses', 'memberpress-courses');
    $capability = \MeprUtils::get_mepr_admin_capability();

    add_menu_page(
      $menu_title,
      __('MP Courses', 'memberpress-courses'),
      $capability,
      base\PLUGIN_NAME,
      array($this, 'toplevel_menu_route'),
      self::courses_icon(),
      59
    );
  }

  /********* INSTALL PLUGIN ***********/
  public function install() {
    $db = lib\Db::fetch();
    $db->upgrade();
  }

  /**
   * Add a separator to the WordPress admin menus
   */
  public static function admin_separator() {
    global $menu;

    // Prevent duplicate separators when no core menu items exist
    if(!lib\Utils::is_user_admin()) { return; }

    $menu[] = array('', 'read', 'separator-'.base\PLUGIN_NAME, '', 'wp-menu-separator '.base\PLUGIN_NAME);
  }

  public static function admin_header() {
    global $current_screen;
    $cpts = [models\Course::$cpt, models\Lesson::$cpt];

    if($current_screen instanceof \WP_Screen) {
      if(
        $current_screen->base == 'post' &&
        in_array($current_screen->post_type, $cpts, true)
      ) {
        \MeprView::render('/admin/shared/courses_builder_header');
        self::mp_override_editor_logo();
      }
      if(
        version_compare(MEPR_VERSION , '1.11.33', '>') &&
        (
          in_array($current_screen->id, ['edit-mpcs-course', 'edit-mpcs-lesson', 'edit-mpcs-quiz', 'edit-mpcs-assignment'], true) ||
          preg_match('/_page_memberpress-courses-options$/', $current_screen->id) ||
          preg_match('/_page_memberpress-courses-addon/', $current_screen->id) ||
          preg_match('/_page_memberpress-courses-emails$/', $current_screen->id)
        )
      ) {
        \MeprView::render('/admin/shared/courses_admin_header', ['logo_url' => base\BRAND_URL . '/images/plugin-logo.svg']);
      }
    }
  }

  public function enqueue_admin_scripts($hook) {
    \wp_enqueue_style('mpcs-simplegrid', base\CSS_URL . '/vendor/simplegrid.css', array(), base\VERSION);
    \wp_enqueue_style('mpcs-fontello-styles', base\FONTS_URL.'/fontello/css/mp-courses.css', array(), base\VERSION);
    \wp_enqueue_style('mpcs-admin-shared', base\CSS_URL . '/admin_shared.css', array('wp-pointer','mpcs-simplegrid','mpcs-fontello-styles'), base\VERSION);
    \wp_enqueue_script('mpcs-tooltip', base\JS_URL . '/tooltip.js', array('jquery','wp-pointer'), base\VERSION);
    if(strstr($hook, 'memberpress-options') !== false || strstr($hook, 'memberpress-courses-options') !== false || strstr($hook, 'mp-courses') !== false) {

      \wp_enqueue_style('mpcs-settings-table', base\CSS_URL . '/settings_table.css', array(), base\VERSION);
      \wp_enqueue_script('mpcs-settings-table', base\JS_URL . '/settings_table.js', array('jquery', 'wp-color-picker'), base\VERSION);

      $plupload_loaded = false;
      if( strstr($hook, 'memberpress-options') !== false ) {
        wp_enqueue_script('plupload-all');
        wp_enqueue_style( 'wp-color-picker' );
        $plupload_loaded = true;
      }

      // Let's localize data for our drag and drop settings

      $plupload_init = array(
        'runtimes'            => 'html5,silverlight,flash,html4',
        'browse_button'       => 'plupload-browse-button',
        'container'           => 'plupload-upload-ui',
        'drop_element'        => 'drag-drop-area',
        'file_data_name'      => 'async-upload',
        'multiple_queues'     => true,
        'max_file_size'       => wp_max_upload_size().'b',
        'url'                 => admin_url('admin-ajax.php'),
        'flash_swf_url'       => includes_url('js/plupload/plupload.flash.swf'),
        'silverlight_xap_url' => includes_url('js/plupload/plupload.silverlight.xap'),
        'filters'             => array(array('title' => __('Allowed Files', 'memberpress-courses'), 'extensions' => '*')),
        'multipart'           => true,
        'urlstream_upload'    => true,
        'multi_selection'     => false, // Limit selection to just one
        'plupload_loaded'     => $plupload_loaded,

        // additional post data to send to our ajax hook
        'multipart_params'    => array(
          '_ajax_nonce' => wp_create_nonce('photo-upload'),
          'action'      => 'logo_uploader',            // the ajax action name
        ),
      );

      // we should probably not apply this filter, plugins may expect wp's media uploader...
      $plupload_init = apply_filters('plupload_init', $plupload_init);
      \wp_localize_script( 'mpcs-settings-table', 'MPCS_Settings', $plupload_init );
    }
  }

  /**
   * Protect lessons associated with course based on rule
   *
   * @see load_hooks(), add_filter('mepr-extend-rules')
   * @param array $post_rules All rules for post
   * @param \MeprRule $rule Current rule
   * @param mixed $context We only handle WP_Post here
   * @return array $post_rules Modified post rules
   */
  public function protect_sections_lessons($post_rules, $rule, $context) {
    if(is_a($context, 'WP_Post') && $rule->mepr_type !== 'custom' && in_array($context->post_type, models\Lesson::lesson_cpts(), true)) {
      switch($rule->mepr_type) {
        case 'all_' . models\Course::$cpt:
          $lesson = new models\Lesson($context->ID);
          $course = $lesson->course();
          if(!\MeprRule::is_exception_to_rule($course, $rule)){
            $post_rules[] = $rule;
          }
          break;
        case 'single_' . models\Course::$cpt:
          $lesson = new models\Lesson($context->ID);
          if($course = $lesson->course()) {
            if($rule->mepr_content == $course->ID)
              $post_rules[] = $rule;
          }
          break;
        case 'all_tax_'.ctrl\CourseTags::$tax:
        case 'tax_'.ctrl\CourseTags::$tax.'||cpt_' . models\Course::$cpt:
        case 'tag':
          $lesson = new models\Lesson($context->ID);
          if($course = $lesson->course()) {
            if(has_term($rule->mepr_content, ctrl\CourseTags::$tax, $course->ID)){
              $post_rules[] = $rule;
            }
          }
          break;
        case 'all_tax_'.ctrl\CourseCategories::$tax:
        case 'tax_'.ctrl\CourseCategories::$tax.'||cpt_' . models\Course::$cpt:
        case 'category':
          $lesson = new models\Lesson($context->ID);
          if($course = $lesson->course()) {
            if(has_term($rule->mepr_content, ctrl\CourseCategories::$tax, $course->ID)){
              $post_rules[] = $rule;
            }
          }
          break;
      }
    }

    return $post_rules;
  }

  /**
   * Protect lessons and quizzes even when user has access to the course
   *
   * @param bool $bool whether to lock the content or not
   * @param MeprRule $rule the current rule
   * @param object $context
   * @param array $rules
   * @return bool
   */
  public function protect_courses_lessons( $bool, $rule, $context, $rules ){
    $match_mepr_rule_types = array(
      'tax_'.ctrl\CourseCategories::$tax.'||cpt_' . models\Course::$cpt,
      'tax_'.ctrl\CourseTags::$tax.'||cpt_' . models\Course::$cpt,
      'single_' . models\Course::$cpt,
      'all_tax_'.ctrl\CourseTags::$tax,
      'all_tax_'.ctrl\CourseCategories::$tax
    );

    $lesson_cpts = models\Lesson::lesson_cpts(true);

    if (
      $context instanceof \WP_Post &&
      array_key_exists($context->post_type, $lesson_cpts) &&
      in_array($rule->mepr_type, $match_mepr_rule_types, true)
    ) {
      $user = \MeprUtils::get_currentuserinfo();
      $single_cpt = 'single_' . $context->post_type;

      // Get lesson rules for this course rule
      $lessonRules = array_values( array_filter(
        $rules,
        function ( $r ) use ( $single_cpt ) {
          return $r->mepr_type === $single_cpt;
        }
      ) );

      // Check if user has access from lesson rule.
      if ( ! empty( $lessonRules ) ) {
        $lessonRule = $lessonRules[0];
        if (
          $lessonRule instanceof \MeprRule &&
          $user->has_access_from_rule( $lessonRule->ID ) &&
          $lessonRule->has_dripped( $user->ID ) &&
          ! $lessonRule->has_expired( $user->ID )
        ) {
          $bool = false;
        } else {
          $bool = true;
        }
      } else {
        $bool = false;
      }
    }

    return $bool;
  }

  /**
  * Unauthorized User visit’s the course URL
  * If the Sales page URL is set for the course then the course URL will simply redirect to the Sales page.
  * @return void
  */
  public function redirect_to_sales_page(){
    global $wp_query;
    $user = lib\Utils::get_currentuserinfo();

    if(!is_single()){
      return;
    }

    if(current_user_can('memberpress_authorized')) {
      return;
    }

    //If the content user has access, but the content hasn't
    //dripped or has expired, don't redirect to the sales page
    if ($user) {
      $rules = \MeprRule::get_rules($wp_query->post);
      foreach($rules as $rule) {
        if(!$rule->has_dripped() || $rule->has_expired()) {
          return;
        }
      }
    }

    $lesson_cpts = models\Lesson::lesson_cpts(true);

    if($wp_query->post->post_type == models\Course::$cpt){
      $course = new models\Course($wp_query->post->ID);
    }
    elseif (array_key_exists($wp_query->post->post_type, $lesson_cpts)) {
      $lesson = new $lesson_cpts[$wp_query->post->post_type]($wp_query->post->ID);
      if(apply_filters(base\SLUG_KEY . '_redirect_'.$wp_query->post->post_type.'_to_sales', true, $lesson)) {
        $course = $lesson->course();
      }
    }

    if(!isset($course)) {
      return;
    }

    $sales_url = $course->sales_url;
    if(wp_http_validate_url($sales_url)) {
      nocache_headers(); //Prevent Browser caching here
      lib\Utils::wp_redirect($sales_url);
      exit;
    }
  }

  /**
   * Add customizer section and settings
   *
   * @param  mixed $wp_customize
   * @return void
   */
  public function register_customizer($wp_customize){

    // Don't add these settings unless Classroom Mode is enabled.
    $options = \get_option('mpcs-options');
    $classroom_mode = helpers\Options::val($options,'classroom-mode', 1);
    if ( empty( $classroom_mode ) ) {
      return;
    }

    $sections = apply_filters( base\SLUG_KEY . '_customiser_sections', array() );
    $settings = apply_filters( base\SLUG_KEY . '_customiser_settings', array() );

    foreach ($sections as $section) {
      \extract($section);

      $wp_customize->add_section( $name,
        array(
          'title' => $title,
        )
      );
    }

    foreach ($settings as $setting) {
      \extract($setting);

      switch ($type) {
        case 'color':
          $wp_customize->add_setting( $name,
            array(
              'default' => $default,
              'transport' => 'refresh',
              'type' => 'option',
              'sanitize_callback' => $sanitize_callback
            )
          );
          $wp_customize->add_control( new \WP_Customize_Color_Control( $wp_customize,  $name,
          array(
            'label' => $label,
            'section' => $section,
          ) ) );
          break;

          case 'image':
            $wp_customize->add_setting( $name,
              array(
                'default' => $default,
                'transport' => 'refresh',
                'type' => 'option',
                'sanitize_callback' => $sanitize_callback
              )
            );
            $wp_customize->add_control( new \WP_Customize_Media_Control( $wp_customize,  $name,
            array(
              'label' => $label,
              'section' => $section,
              'mime_type' => 'image',
            ) ) );
            break;

        default:
          $wp_customize->add_setting( $name,
            array(
              'default' => $default,
              'transport' => 'refresh',
              'type' => 'option',
              'sanitize_callback' => $sanitize_callback
            )
          );
          $wp_customize->add_control(
            $name,
            array(
              'label' => $label,
              'section' => $section,
              'type' => $type
            )
          );
          break;
      }
    }
  }

  /**
   * Replace tags in lesson permalink structure
   *
   * @param  mixed $post_link
   * @param  mixed $post
   * @return void
   */
  public function lesson_permalink_replace( $post_link, $post ){
    if ( is_object( $post ) && in_array( $post->post_type, models\Lesson::lesson_cpts() ) ) {
      $lesson = new models\Lesson($post->ID);

      $course = $lesson->course();

      // Permalink if lesson is associated with a course
      if($course instanceof models\Course && lib\Utils::user_can_view_course($course)) {
        $slug = $course->post_name;
        return str_replace( '%course_slug%', $slug, $post_link );
      }

      // Default lesson permalink
      return str_replace( '/'.helpers\Courses::get_permalink_base().'/%course_slug%/', '/', $post_link );
    }

    return $post_link;

  }


  /**
   * Ensure that courses and lessons are using the block editor.
   *
   * @param  boolean  $use        Whether to use the block editor in the admin.
   * @param  string   $post_type  Post type
   *
   * @return boolean
   */
  public function force_block_editor_for_courses( $use, $post_type ) {
    $post_types = array(
      models\Course::$cpt
    );
    if ( in_array( $post_type, $post_types ) ) {
      $use = true;
    }
    return $use;
  }

  /**
   * Run this if you want default lesson permalink to still work
   * For now, I think it's not necessary
   *
   * @param  array $rules
   * @return array
   */
  public function lesson_permalink_rules( $rules ) {
    $customRules = [];
    $customRules[ helpers\Courses::get_permalink_base() . '/([^/]+)/' . helpers\Lessons::get_permalink_base() . '/([^/]+)/?$' ] = 'index.php?'.models\Course::$cpt.'=$matches[2]&'.models\Lesson::$cpt.'=$matches[2]'; // makes /courses/course-name/lessons/lesson-name/ resolves to lesson post
    $customRules[ helpers\Lessons::get_permalink_base() . '/([^/]+)/?$' ] = 'index.php?'.models\Lesson::$cpt.'=$matches[1]'; // Comment this line if you don't want lessons/lesson-name to work alongside /courses/course-name/lessons/lesson-name/
    // $customRules[ helpers\Courses::get_permalink_base() . '/([^/]+)/' . helpers\Lessons::get_quizzes_permalink_base() . '/([^/]+)/?$' ] = 'index.php?'.models\Course::$cpt.'=$matches[2]&'.models\Quiz::$cpt.'=$matches[2]'; // makes /courses/course-name/quizzes/quiz-name/ resolves to quiz post
    // $customRules[ helpers\Lessons::get_quizzes_permalink_base(). '/([^/]+)/?$' ] = 'index.php?'.models\Quiz::$cpt.'=$matches[1]'; // Comment this line if you dont want quizzes/quiz-name to work alongside /courses/course-name/quizzes/quiz-name/

    $customRules = apply_filters( 'mpcs_lesson_permalink_rules', $customRules, models\Course::$cpt, helpers\Courses::get_permalink_base());
    return $customRules + $rules;
  }

  /**
   * Show course "more content" even if post is protected.
   *
   * @param mixed $show_unauth_message
   * @param mixed $current_post
   * @param mixed $uri
   *
   * @return bool
   */
  public function show_more_content_on_archive_page($show_unauth_message, $current_post, $uri){
    if(
      $current_post->post_type == models\Course::$cpt &&
      helpers\Courses::is_course_archive() &&
      true == $show_unauth_message
    ){
      $show_unauth_message = false;
    }
    return $show_unauth_message;
  }

  /**
   * SHow lock icon if course is locked
   * @param mixed $title
   * @param mixed $post_id
   *
   * @return [type]
   */
  public function show_lock_icon($title) {
    $post = get_post( get_the_ID() );

    if(!class_exists('MeprRule')) { return $title; }

    if(is_admin() || defined('REST_REQUEST')) { return $title; }

    if(!isset($post->ID) || !$post->ID) { return $title; }

    if(!in_the_loop()) { return $title; }

    if(strpos($title, 'mpcs-lock') !== false) { return $title; } //Already been here?

    if(\MeprRule::is_locked($post) && helpers\Courses::is_course_archive()) {
      $title = '<i class="mpcs-icon mpcs-lock"></i>' . " {$title}";
    }

    return $title;
  }

  /**
   * Register the plugin views path.
   *
   * @param  array $paths The current views paths.
   * @return array
   */
  public function add_view_path($paths) {
    array_splice($paths, 1, 0, base\VIEWS_PATH);
    return $paths;
  }

  /**
   * Add Course Section rule type
   *
   * @param array $all_types
   *
   * @return array
   */
  function course_section_rule_type($all_types) {
    return array_merge(
      $all_types,
      array( 'course_section' => __('Course Section', 'memberpress-courses') )
    );
  }

  /**
   * Get Course Section rule data
   *
   * @param array $contents
   * @param string $type
   *
   * @return array
   */
  function course_section_contents_array($contents, $type) {
    if($type == 'course_section') {
      $contents[$type] = models\Section::find_all();
    }

    return $contents;
  }

  /**
   * Get Course Section data
   *
   * @param array $content
   * @param string $type
   * @param int $id
   *
   * @return mixed $content
   */
  function course_section_content($content, $type, $id) {
    if($type == 'course_section') {
      return models\Section::get_section($id);
    }

    return $content;
  }

  /**
   * Check whether there is a Course Section
   *
   * @param bool $has_content
   * @param string $type
   *
   * @return bool
   */
  function has_course_section($has_content, $type) {
    if($type == 'course_section') {
      return true;
    }

    return $has_content;
  }

  /**
   * Find course sections rule
   *
   * @param mixed $content
   * @param string $type
   * @param string $search
   *
   * @return array
   */
  public function find_course_sections($content, $type, $search) {
    if($type == 'course_section') {
      return array_map( function($i) {
        $course_title = get_the_title($i->course_id);
        return [
            'id' => $i->id,
            'label' => $i->title,
            'slug' => $course_title,
            'desc' => "ID: {$i->id} | Course: {$course_title}",
        ];
      }, models\Section::find_all_by_title($search));
    }

    return $content;
  }

  /**
   * Add comments template for RL
   *
   * @param string $template
   *
   * @return void
   */
  public function course_comments_template($template) {
    global $post;

    if(!in_array($post->post_type, array('mpcs-course', 'mpcs-lesson'))) {
      return $template;
    }
    $options = \get_option('mpcs-options');
    $show_course_comments = helpers\Options::val($options, 'show-course-comments');
    if(empty($show_course_comments)) {
      return $template;
    }

    if(! helpers\App::is_classroom()) {
      return $template;
    }

    return \MeprView::file('/classroom/courses_comments_template');
  }

  /**
   * Display comments list on course and lesson pages
   *
   * @param $comment
   * @param $args
   * @param $depth
   * @return void
   */
  public static function course_comments($comment, $args, $depth) {
    switch ( $comment->comment_type ) {

      case 'pingback':
      case 'trackback':
      // Display trackbacks differently than normal comments.
      ?>
        <li <?php comment_class(); ?> id="comment-<?php comment_ID(); ?>">
          <p><?php esc_html_e( 'Pingback:', 'memberpress-courses' ); ?> <?php comment_author_link(); ?> <?php edit_comment_link( __( '(Edit)', 'memberpress-courses' ), '<span class="edit-link">', '</span>' ); ?></p>
        </li>
        <?php
        break;

      default:
        // Proceed with normal comments.
        global $post;
        ?>
        <li <?php comment_class(); ?> id="li-comment-<?php comment_ID(); ?>">
          <article id="comment-<?php comment_ID(); ?>" class="course-comment">
            <div class= 'course-comment-info'>
              <div class='course-comment-avatar-wrap'><?php echo get_avatar( $comment, 50 ); ?></div>
              <div class="course-comment-author vcard">
                <?php
                printf( __( '<div class="course-comment-cite-wrap"><cite class="fn">%s</cite> </div>', 'memberpress-courses' ), get_comment_author_link());
                printf(__('<div class="course-comment-time"><span class="timendate"><a href="%1$s"><time datetime="%2$s">%3$s</time></a></span></div>', 'memberpress-courses' ),
                  esc_url( get_comment_link( $comment->comment_ID ) ),
                  esc_attr( get_comment_time( 'c' ) ),
                  esc_html( sprintf( __( '%1$s at %2$s', 'memberpress-courses' ), get_comment_date(), get_comment_time() ) ) );
                ?>
              </div>
            </div>
            <section class="course-comment-content comment">
              <?php comment_text(); ?>
                <div class="course-comment-edit-reply-wrap">
                  <?php edit_comment_link( __( 'Edit', 'memberpress-courses' ), '<span class="course-edit-link">', '</span>' ); ?>
                  <?php
                  comment_reply_link(
                    array_merge(
                      $args,
                      array(
                        'reply_text' => __( 'Reply', 'memberpress-courses' ),
                        'add_below' => 'comment',
                        'depth'  => $depth,
                        'max_depth' => $args['max_depth'],
                        'before' => '<span class="course-reply-link">',
                        'after'  => '</span>',
                      )
                    )
                  );
                  ?>
                </div>
              <?php if ( '0' == $comment->comment_approved ) : ?>
                  <p class="course-highlight-text comment-awaiting-moderation"><?php echo __( 'Your comment is awaiting moderation.', 'memberpress-courses' ); ?></p>
              <?php endif; ?>
            </section>
          </article>
      <?php
      break;
    }
  }

  /**
   *
   *
   * @param array $post_rules
   * @param object Rule object $curr_rule
   * @param \WP_Post $context
   *
   * @return mixed
   */
  function extend_post_rules($post_rules, $curr_rule, $context) {
    $lesson_cpts = models\Lesson::lesson_cpts();
    if(
      $curr_rule->mepr_type == 'course_section' &&
      in_array($context->post_type, $lesson_cpts)
    ) {
      $lesson = new models\Lesson($context->ID);
      $section = $lesson->section();
      if($section->id == $curr_rule->mepr_content) {
        $post_rules[] = $curr_rule;
      }
    }

    return $post_rules;
  }

  /**
   * If in classroom mode, triggers the 'wp_footer' action.
   * Also logs the lesson course started event.
   */
  public function do_wordpress_footer() {
    if( helpers\App::is_classroom_wp_footer() ){
      do_action('wp_footer');
    }

    helpers\Events::do_lesson_course_started();
  }

  /**
   * Log course events when not in classroom mode
   */
  public function record_course_events() {
    if( ! helpers\App::is_classroom() ){
      helpers\Events::do_lesson_course_started();
    }
  }

  /**
   * Replace Logo in Gutenberg Fullscreen Mode
   *
   */
  private static function mp_override_editor_logo(){
    global $current_screen;
    if( ! $current_screen->is_block_editor ) {
      return;
    } ?>
    <style>
      body.is-fullscreen-mode .edit-post-header a.edit-post-fullscreen-mode-close img,
      body.is-fullscreen-mode .edit-post-header a.edit-post-fullscreen-mode-close svg {
        display: none;
      }

      .edit-post-fullscreen-mode-close {
        background-color: #184499 !important;
      }

      body.is-fullscreen-mode .edit-post-header a.edit-post-fullscreen-mode-close:before {
        background-image: url( '<?php echo esc_url_raw(base\BRAND_URL . '/images/brand-icon-white.png'); ?>' );
        background-size: contain;
        top: 20px;
        right: 10px;
        bottom: 20px;
        left: 10px;
        background-repeat: no-repeat;
      }
      </style>
  <?php
  }

  /**
   * Move our custom separator above our admin menu
   *
   * @param array $menu_order Menu Order
   * @return array Modified menu order
   */
  public static function admin_menu_order( $menu_order ) {
    if ( ! $menu_order ) {
      return true;
    }

    if ( ! is_array( $menu_order ) ) {
      return $menu_order;
    }

    // Initialize our custom order array
    $new_menu_order = array();

    // Menu values
    $first_sep   = 'separator1';
    $custom_menus = [base\PLUGIN_NAME];

    // Loop through menu order and do some rearranging
    foreach ( $menu_order as $item ) {
      // Position MemberPress Courses menu below MemberPress
      if ( $first_sep === $item ) {
        // Add our custom menus
        foreach ( $custom_menus as $custom_menu ) {
          if ( array_search( $custom_menu, $menu_order, true ) ) {
            $new_menu_order[] = $custom_menu;
          }
        }

        // Add the appearance separator
        $new_menu_order[] = $first_sep;

        // Skip our menu items down below
      } elseif ( ! in_array( $item, $custom_menus, true ) ) {
        $new_menu_order[] = $item;
      }
    }

    // Return our custom order
    return $new_menu_order;
  }

  /**
   * Autoinstall the Quizzes Addon
   *
   * @return void
   */
  public function autoinstall_quizzes_addon() {
    if (get_option('mepr_quizzes_addon_install', false)) {
        return;
    }

    // Mark the addon as installed
    update_option('mepr_quizzes_addon_install', true);

    // If the Quizzes add-on is already active, exit early
    if (is_plugin_active('memberpress-course-quizzes/main.php')) {
        return;
    }

    // Ensure the MeprOptions class is available
    if (!class_exists('MeprOptions')) {
        return;
    }

    if (!function_exists('request_filesystem_credentials')) {
        require_once ABSPATH . 'wp-admin/includes/file.php';
    }

    // Do we have any quiz?
    $quiz = get_posts(array(
        'post_type' => 'mpcs-quiz',
        'numberposts' => 1,
    ));

    if (empty($quiz)) {
        return; // Exit if no quiz is available
    }

    // Fetch the license key
    $mepr_options = \MeprOptions::fetch();
    $license = $mepr_options->mothership_license;

    if (empty($license)) {
        return; // Exit if no license key is available
    }

    try {
        $domain = urlencode(\MeprUtils::site_domain());
        $args = compact('domain');
        $slug = 'memberpress-course-quizzes';
        $addon = \MeprUpdateCtrl::send_mothership_request('/versions/info/' . $slug . "/{$license}", $args);

        // Request filesystem credentials
        $plugin_url = esc_url_raw(add_query_arg(array('page' => 'memberpress-addons'), admin_url('admin.php')));
        $creds = request_filesystem_credentials($plugin_url, '', false, false, null);

        // Check for filesystem credentials and initialize WP Filesystem
        if (false === $creds || !WP_Filesystem($creds)) {
            throw new \Exception('Filesystem credentials are missing or invalid.');
        }

        // Download the plugin ZIP file
        $temp_file = download_url($addon['url']);
        if (is_wp_error($temp_file)) {
            throw new \Exception('Failed to download the plugin zip file.');
        }

        // Extract the ZIP file
        $result = unzip_file($temp_file, WP_PLUGIN_DIR);
        if (is_wp_error($result)) {
            @unlink($temp_file); // Cleanup the temporary file
            throw new \Exception('Failed to unzip the plugin zip file.');
        }

        // Activate the plugin
        $activation_result = activate_plugin('memberpress-course-quizzes/main.php');
        if (is_wp_error($activation_result)) {
            throw new \Exception('Failed to activate the plugin.');
        }

    } catch (\Exception $e) {
        // Log any errors
        \MeprUtils::error_log($e->getMessage());
    } finally {
        // Cleanup the temporary file
        if (isset($temp_file) && file_exists($temp_file)) {
            @unlink($temp_file);
        }
    }
  }

}
