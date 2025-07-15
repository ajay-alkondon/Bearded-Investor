<?php
namespace memberpress\courses\controllers\admin;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

use memberpress\courses as base;
use memberpress\courses\lib as lib;
use memberpress\courses\models as models;
use memberpress\courses\helpers as helpers;
use memberpress\courses\controllers as controllers;

class Courses extends lib\BaseCptCtrl {
  public function load_hooks() {
    add_filter('manage_'.models\Course::$cpt.'_posts_columns', array($this, 'set_courses_columns'), 1);
    add_action('manage_'.models\Course::$cpt.'_posts_custom_column', array($this, 'courses_columns'), 10, 2);
    add_filter('default_hidden_columns', array($this, 'hide_courses_columns'), 10, 2);
    add_action('admin_footer-edit.php', array($this, 'categories_tags_buttons'));
    add_action('admin_footer-edit-tags.php', array($this, 'categories_tags_return_to_courses_button'));
    add_action('save_post', array($this, 'save_post_data'));
    add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
    add_action('enqueue_block_editor_assets', array($this, 'enqueue_block_editor_assets'));
    add_filter('user_contactmethods', array($this, 'user_social_links'));
    add_action('wp_ajax_mpcs_reset_course_progress', array($this, 'reset_course_progress'));
    add_filter('mepr-list-table-joins', array($this, 'members_table_joins'));
    add_action('mepr-after-admin-members-heading', array($this, 'maybe_display_members_course_heading'));
    add_action('admin_init', array($this, 'register_filter_queries'));
    add_action('restrict_manage_posts', array($this, 'render_additional_filters'));
    $this->ctaxes = array();
  }

  public function categories_tags_return_to_courses_button() {

    if ( empty( $_GET['post_type'] ) || models\Course::$cpt !== $_GET['post_type'] ) {
      return;
    }

    if ( empty( $_GET['taxonomy'] ) || ! in_array( $_GET['taxonomy'], array( 'mpcs-course-tags', 'mpcs-course-categories' ) ) ) {
      return;
    }

    $new_links = sprintf( '<a href="%2$s" class="" style="display: block; margin-top: 10px; text-decoration: none;">%1$s</a>', esc_html__( '&larr; Back to Courses', 'memberpress-courses' ), add_query_arg( array(
      'post_type' => models\Course::$cpt
    ), admin_url( 'edit.php' ) ) );
    ?>
    <script>
      jQuery(document).ready(function($) {
        $('.wrap .wp-header-end').before("<?php echo addslashes( $new_links ); ?>");
      });
    </script>
    <?php
  }

  public function categories_tags_buttons() {
    if ( empty( $_GET['post_type'] ) || models\Course::$cpt !== $_GET['post_type'] ) {
      return;
    }
    $new_links = sprintf( '<a href="%2$s" class="page-title-action" style="margin-left: 0;">%1$s</a>', esc_html__( 'Categories', 'memberpress-courses' ), add_query_arg( array(
      'taxonomy' => 'mpcs-course-categories',
      'post_type' => models\Course::$cpt
    ), admin_url( 'edit-tags.php' ) ) );
    $new_links .= sprintf( '<a href="%2$s" class="page-title-action">%1$s</a>', esc_html__( 'Tags', 'memberpress-courses' ), add_query_arg( array(
      'taxonomy' => 'mpcs-course-tags',
      'post_type' => models\Course::$cpt
    ), admin_url( 'edit-tags.php' ) ) );
    ?>
    <script>
      jQuery(document).ready(function($) {
        $('.wrap .wp-header-end').before("<?php echo addslashes( $new_links ); ?>");
      });
    </script>
    <?php
  }


  /**
   * Add columns to Courses CPT
   *
   * @return void
   */
  public function set_courses_columns($default_cols){

    $columns = array();
    foreach($default_cols as $key=>$value) {
      if($key=='date') {  // when we find the date column
        $columns['mpcs-participants']     = __('Participants', 'memberpress-courses');
        $columns['mpcs-completed']        = __('Completed', 'memberpress-courses');
        $columns['mpcs-completion-rate']  = __('Completion Rate', 'memberpress-courses');
     }
     $columns[$key]=$value;
    }

    return $columns;
  }

  /**
   * Hide courses columns by default
   *
   * @param  mixed $hidden
   * @param  mixed $screen
   * @return void
   */
  public function hide_courses_columns($hidden, $screen){
    $hidden[] = 'mpcs-completed';
    $hidden[] = 'mpcs-completion-rate';
    return $hidden;
  }

  /**
   * Courses Columns
   *
   * @param  mixed $column
   * @param  mixed $post_id
   * @return void
   */
  public function courses_columns($column, $post_id){
    global $current_screen;
    $hidden_columns = get_hidden_columns($current_screen);

    switch ( $column ) {
      case 'mpcs-participants':
        if(in_array('mpcs-participants', $hidden_columns)) {
          break;
        }

        $participants = (array) models\UserProgress::find_all_course_participants($post_id);
        $members_url = admin_url("admin.php?page=memberpress-members&course={$post_id}");
        if(count( $participants ) > 0){
          printf('<a href="%s">%d</a>', esc_url($members_url) , count( $participants ) );
        }else{
          echo count( $participants );
        }
        break;

      case 'mpcs-completed':
        if(in_array('mpcs-completed', $hidden_columns)) {
          break;
        }

        $completers = models\UserProgress::find_course_completers($post_id);
        $members_url = admin_url("admin.php?page=memberpress-members&course={$post_id}");

        echo count( $completers );
        break;

      case 'mpcs-completion-rate':
        if(in_array('mpcs-completion-rate', $hidden_columns)) {
          break;
        }

        $members_url = admin_url("admin.php?page=memberpress-members&course={$post_id}");
        $completion_rate  = round(models\UserProgress::completion_rate($post_id));
        echo $completion_rate . '%';
        break;
    }
  }


  public static function save_post_data($post_id) {
    # Verify nonce
    if(!\wp_verify_nonce(isset($_POST[models\Course::$nonce_str]) ? $_POST[models\Course::$nonce_str] : '', models\Course::$nonce_str . \wp_salt())) {
      return $post_id;
    }

    # Skip ajax
    if(defined('DOING_AJAX') || defined('DOING_LESSON_SAVE')) {
      return;
    }

    // Return early if the curriculum is not present in the posted data - see #394.
    if(!isset($_POST['mpcs-curriculum'])) {
      return;
    }

    $course = new models\Course($post_id);
    $course->page_template = isset($_POST[models\Course::$page_template_str]) ? sanitize_text_field($_POST[models\Course::$page_template_str]) : $course->attrs['page_template']['default'];
    $course->status = isset($_POST[models\Course::$page_status_str]) ? $_POST[models\Course::$page_status_str] : $course->attrs['status']['default'];
    $course->lesson_title = isset($_POST[ models\Course::$lesson_title_str]) ? $_POST[ models\Course::$lesson_title_str] : $course->attrs['lesson_title']['default'];
    $course->menu_order = (isset($_POST['menu_order']) && is_numeric($_POST['menu_order'])) ? $_POST['menu_order'] : $course->attrs['menu_order']['default'];
    $course->sales_url = (isset($_POST[models\Course::$sales_url_str])) ? esc_url($_POST[models\Course::$sales_url_str]) : $course->attrs['sales_url']['default'];
    $course->require_previous = (isset($_POST[models\Course::$require_previous_str])) ? $_POST[models\Course::$require_previous_str] : $course->attrs['require_previous']['default'];
    $course->show_results = (isset($_POST[models\Course::$show_results_str])) ? $_POST[models\Course::$show_results_str] : $course->attrs['show_results']['default'];
    $course->show_answers = (isset($_POST[models\Course::$show_answers_str])) ? $_POST[models\Course::$show_answers_str] : $course->attrs['show_answers']['default'];
    $course->accordion_course = (isset($_POST[models\Course::$accordion_course_str])) ? $_POST[models\Course::$accordion_course_str] : $course->attrs['accordion_course']['default'];
    $course->accordion_sidebar = (isset($_POST[models\Course::$accordion_sidebar_str])) ? $_POST[models\Course::$accordion_sidebar_str] : $course->attrs['accordion_sidebar']['default'];
    $course->certificates_enable = (isset($_POST[models\Course::$certificates_enable_str])) ? $_POST[models\Course::$certificates_enable_str] : $course->attrs['certificates']['default'];
    $course->certificates_force_download_pdf = (isset($_POST[models\Course::$certificates_force_download_pdf_str])) ? $_POST[models\Course::$certificates_force_download_pdf_str] : $course->attrs['certificates_force_download_pdf']['default'];
    $course->certificates_logo = (isset($_POST[models\Course::$certificates_logo_str])) ? esc_url($_POST[models\Course::$certificates_logo_str]) : $course->attrs['certificates_logo']['default'];
    $course->certificates_instructor_signature = (isset($_POST[models\Course::$certificates_instructor_signature_str])) ? esc_url($_POST[models\Course::$certificates_instructor_signature_str]) : $course->attrs['certificates_instructor_signature']['default'];
    $course->certificates_bottom_logo = (isset($_POST[models\Course::$certificates_bottom_logo_str])) ? esc_url($_POST[models\Course::$certificates_bottom_logo_str]) : $course->attrs['certificates_bottom_logo']['default'];
    $course->certificates_signature = (isset($_POST[models\Course::$certificates_signature_str])) ? esc_url($_POST[models\Course::$certificates_signature_str]) : $course->attrs['certificates_signature']['default'];
    $course->certificates_text_color = (isset($_POST[models\Course::$certificates_text_color_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_text_color_str])) : $course->attrs['certificates_text_color']['default'];
    $course->certificates_paper_size = (isset($_POST[models\Course::$certificates_paper_size_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_paper_size_str])) : $course->attrs['certificates_paper_size']['default'];
    $course->certificates_background_color = (isset($_POST[models\Course::$certificates_background_color_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_background_color_str])) : $course->attrs['certificates_background_color']['default'];
    $course->certificates_title = (isset($_POST[models\Course::$certificates_title_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_title_str])) : $course->attrs['certificates_title']['default'];
    $course->certificates_instructor_name = (isset($_POST[models\Course::$certificates_instructor_name_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_instructor_name_str])) : $course->attrs['certificates_instructor_name']['default'];
    $course->certificates_instructor_title = (isset($_POST[models\Course::$certificates_instructor_title_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_instructor_title_str])) : $course->attrs['certificates_instructor_title']['default'];
    $course->certificates_footer_message = (isset($_POST[models\Course::$certificates_footer_message_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_footer_message_str])) : $course->attrs['certificates_footer_message']['default'];
    $course->certificates_completion_date = (isset($_POST[models\Course::$certificates_completion_date_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_completion_date_str])) : $course->attrs['certificates_completion_date']['default'];
    $course->certificates_share_link = (isset($_POST[models\Course::$certificates_share_link_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_share_link_str])) : $course->attrs['certificates_share_link']['default'];
    $course->certificates_expiration_date = (isset($_POST[models\Course::$certificates_expiration_date_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_expiration_date_str])) : $course->attrs['certificates_expiration_date']['default'];
    $course->certificates_style = (isset($_POST[models\Course::$certificates_style_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_style_str])) : $course->attrs['certificates_style']['default'];
    $course->certificates_expires_value = (isset($_POST[models\Course::$certificates_expires_value_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_expires_value_str])) : $course->attrs['certificates_expires_value']['default'];
    $course->certificates_expires_unit = (isset($_POST[models\Course::$certificates_expires_unit_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_expires_unit_str])) : $course->attrs['certificates_expires_unit']['default'];
    $course->certificates_expires_reset = (isset($_POST[models\Course::$certificates_expires_reset_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$certificates_expires_reset_str])) : $course->attrs['certificates_expires_reset']['default'];
    $course->dripping = (isset($_POST[models\Course::$dripping_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$dripping_str])) : $course->attrs['dripping']['default'];

    if( 'enabled' == $course->dripping ) {
      $course->require_previous = 'enabled';
    }

    $course->drip_type = (isset($_POST[models\Course::$drip_type_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$drip_type_str])) : $course->attrs['drip_type']['default'];
    $course->drip_amount = (isset($_POST[models\Course::$drip_amount_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$drip_amount_str])) : $course->attrs['drip_amount']['default'];
    $course->drip_time = (isset($_POST[models\Course::$drip_time_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$drip_time_str])) : $course->attrs['drip_time']['default'];
    $course->drip_timezone = (isset($_POST[models\Course::$drip_timezone_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$drip_timezone_str])) : $course->attrs['drip_timezone']['default'];
    $course->drip_frequency = (isset($_POST[models\Course::$drip_frequency_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$drip_frequency_str])) : $course->attrs['drip_frequency']['default'];
    $course->drip_frequency_type = (isset($_POST[models\Course::$drip_frequency_type_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$drip_frequency_type_str])) : $course->attrs['drip_frequency_type']['default'];
    $course->drip_frequency_fixed_date = (isset($_POST[models\Course::$drip_frequency_fixed_date_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$drip_frequency_fixed_date_str])) : $course->attrs['drip_frequency_fixed_date']['default'];
    $course->drip_lessons = (isset($_POST[models\Course::$drip_lessons_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$drip_lessons_str])) : $course->attrs['drip_lessons']['default'];
    $course->drip_quizzes = (isset($_POST[models\Course::$drip_quizzes_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$drip_quizzes_str])) : $course->attrs['drip_quizzes']['default'];
    $course->drip_assignments = (isset($_POST[models\Course::$drip_assignments_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$drip_assignments_str])) : $course->attrs['drip_assignments']['default'];
    $course->not_dripped_message = (isset($_POST[models\Course::$not_dripped_message_str])) ? sanitize_text_field(wp_unslash($_POST[models\Course::$not_dripped_message_str])) : $course->attrs['not_dripped_message']['default'];

    $course->resources = isset($_POST['mpcs-resources']) ? helpers\Courses::sanitize_resources($_POST['mpcs-resources']) : '';

    $course->resources = helpers\Courses::filter_resources($course->resources);

    $course->validate();
    $course->store_meta();
    $curriculum = json_decode(stripslashes($_POST['mpcs-curriculum']), TRUE);

    $course->remove_sections($curriculum['sections']);

    # Create or update sections and lessons that were added or reordered in the UI
    foreach($curriculum['sections'] as $uuid => $section_data) {
      //Skip hidden section element
      if($uuid === '{uuid}') { continue; }

      $section = new models\Section($section_data['id']);
      $section->title         = sanitize_text_field(stripslashes($section_data['title']));
      $section->description   = '';
      // $section->description   = sanitize_text_field(stripslashes($section_data['description']));
      $section->course_id     = $course->ID;
      $section->section_order = array_search ($uuid, $curriculum['sectionOrder']);;
      $section->uuid          = $uuid;
      //FIXME: fix validation
      $section_id = $section->store();
      $section->remove_unassigned_lessons($section_data['lessonIds']);
      foreach($section_data['lessonIds'] as $index => $lessonId) {
        $lesson = $curriculum['lessons']['section'][$lessonId];
        $lesson_id = sanitize_text_field(stripslashes($lesson['id']));
        $lesson_type = isset($lesson['type']) ? sanitize_text_field(stripslashes($lesson['type'])) : models\Lesson::$cpt;
        $attrs = array(
          'ID'           => $lesson_id,
          'section_id'   => $section_id,
          'lesson_order' => $index,
        );

        $lesson_cpts = models\Lesson::lesson_cpts(true);
        if(array_key_exists($lesson_type, $lesson_cpts)) {
          $lesson = new $lesson_cpts[$lesson_type]($attrs);
        }

        if (!defined('DOING_LESSON_SAVE')) define('DOING_LESSON_SAVE', true);

        $lesson->store_meta();
      }
    }
  }


  /**
   * Modify Members Query Joins to filter members by courses
   *
   * @param  mixed $joins
   * @param  mixed $params
   * @return void
   */
  public function members_table_joins($joins){
    $params = $_GET;
    if(isset($params['page']) && 'memberpress-members' != $params['page']){
      return $joins;
    }

    if(isset($params['course']) && !empty($params['course']) && is_numeric($params['course'])) {
      global $wpdb;
      $db = lib\Db::fetch();

      $joins[] =  $wpdb->prepare("/* IMPORTANT */ INNER JOIN (
        SELECT user_id, course_id
        FROM   {$db->user_progress}
        GROUP  BY user_id, course_id
        ) AS user_progress ON user_progress.course_id=%d AND user_progress.user_id=m.user_id", $params['course']);
    }
    return $joins;
  }

  public function admin_enqueue_scripts() {
    global $current_screen;
    global $post;
    if($current_screen->post_type === models\Course::$cpt && isset($post->ID)) {

      $downloads_slug = helpers\App::is_downloads_addon_active() ?  \memberpress\downloads\SLUG_KEY : '';

      $view_submissions_url = admin_url('admin.php?page=mpcs-assignment-submissions');
      $view_attempts_url = admin_url('admin.php?page=mpcs-quiz-attempts');

      if(helpers\App::is_gradebook_addon_active()){
          $view_submissions_url = admin_url('admin.php?page=memberpress-course-gradebook&id=' . $post->ID );
          $view_attempts_url = admin_url('admin.php?page=memberpress-course-gradebook&id=' . $post->ID );
      }

      wp_tinymce_inline_scripts();
      wp_enqueue_editor();
      \wp_enqueue_style('vex-css', base\CSS_URL . '/vendor/vex.css', array(), base\VERSION);
      \wp_dequeue_script('autosave'); //Disable auto-saving
      \wp_enqueue_script('vex-js', base\JS_URL . '/vendor/vex.combined.js', array(), base\VERSION);
      \wp_enqueue_script('mpcs-course-editor-js', base\JS_URL . '/course-editor.js', array('jquery'), base\VERSION);
      \wp_enqueue_script('mpcs-courses-js', base\JS_URL . '/admin-courses.js', array('mpcs-course-editor-js', 'vex-js'), base\VERSION);

      $course_data = array(
        'curriculum' => helpers\Courses::course_curriculum($post->ID),
        'resources' => helpers\Courses::course_resources($post->ID),
        'coursesUrl' => admin_url('edit.php?post_type='.models\Course::$cpt),
        'back_cta_url' => admin_url('edit.php?post_type='.models\Course::$cpt),
        'back_cta_label' => __("Back to Courses", "memberpress-courses"),
        'posts_url' => admin_url('post.php'),
        'settings' => helpers\Courses::course_settings($post->ID),
        'imagesUrl' => base\IMAGES_URL,
        'viewQuizAttemptsUrl' => $view_attempts_url,
        'viewAssignmentSubmissionsUrl' => $view_submissions_url,
        'api'       => array(
          'curriculum' => controllers\CoursesApi::$namespace_str.'/'.controllers\CoursesApi::$resource_name_str.'/curriculum/',
          'lessons' => controllers\CoursesApi::$namespace_str.'/'.controllers\CoursesApi::$resource_name_str.'/lessons/',
          'quizzes' => controllers\CoursesApi::$namespace_str.'/'.controllers\CoursesApi::$resource_name_str.'/quizzes/',
          'resources' => $downloads_slug.'/downloads/files/',
        ),
        'activePlugins' => array(
          'downloads' => helpers\App::is_downloads_addon_active(),
          'quizzes' => helpers\App::is_quizzes_addon_active(),
          'assignments' => helpers\App::is_assignments_addon_active()
        ),
        'dripping_time_intervals' => json_encode(array_map(function($time) {
            return array('label' => $time, 'value' => strtolower(str_replace(' ', '', $time)));
        }, helpers\Drip::generate_time_intervals('00:00', '23:30', 30))),
        'dripping_drip_timezones' => json_encode(helpers\Drip::generate_timezones_options())
      );

      \wp_localize_script('mpcs-courses-js', 'MPCS_Course_Data', apply_filters('mpcs_course_data', $course_data));
    }
  }


  /**
   * Enqueue block editor only JavaScript and CSS.
   */
  public function enqueue_block_editor_assets() {
    global $current_screen;

    if($current_screen->post_type === models\Course::$cpt) {
      // enqueue development or production React code
      $asset_file = include(base\PATH . '/public/build/main.asset.php');
      wp_enqueue_style('mpcs-builder-style', base\URL . '/public/build/style-main.css', [], $asset_file['version']);
      wp_enqueue_script(
          'mpcs-builder',
          base\URL . '/public/build/main.js',
          array_merge($asset_file['dependencies'], ['mpcs-course-editor-js', 'regenerator-runtime']),
          $asset_file['version'],
          true
      );
      wp_set_script_translations( 'mpcs-builder', 'memberpress-courses', base\MEPR_I18N );
    }
  }

  public function lesson_links() {
    $lessons = models\Lesson::find_all();
    $lesson_links = array();

    foreach($lessons as $lesson) {
      $lesson_links[$lesson->ID] = array(
        'view' => get_permalink($lesson->ID),
        'edit' => admin_url("post.php?post={$lesson->ID}&action=edit")
      );
    }

    return $lesson_links;
  }

  public function register_post_type() {
    $this->cpt = (object)array(
      'slug' => models\Course::$cpt,
      'config' => array(
        'labels' => array(
          'name' => __('Courses', 'memberpress-courses'),
          'singular_name' => __('Course', 'memberpress-courses'),
          'add_new' => __('Add New', 'memberpress-courses'),
          'add_new_item' => __('Add New Course', 'memberpress-courses'),
          'edit_item' => __('Edit Course', 'memberpress-courses'),
          'new_item' => __('New Course', 'memberpress-courses'),
          'view_item' => __('View Course', 'memberpress-courses'),
          'search_items' => __('Search Courses', 'memberpress-courses'),
          'not_found' => __('No Courses found', 'memberpress-courses'),
          'not_found_in_trash' => __('No Courses found in Trash', 'memberpress-courses'),
          'parent_item_colon' => __('Parent Course:', 'memberpress-courses')
        ),
        'public' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_rest' => true,
        'query_var' => 'course',
        'show_in_menu' => base\PLUGIN_NAME,
        'has_archive' => true,
        'capability_type' => 'page',
        'hierarchical' => false,
        'register_meta_box_cb' => function () {
          $this->add_meta_boxes();
        },
        'rewrite' => array('slug' => helpers\Courses::get_permalink_base(), 'with_front' => false),
        'supports' => array('title', 'excerpt', 'editor', 'thumbnail', 'author'),
        'taxonomies' => array()
      )
    );

    if(!empty($this->ctaxes)) {
      $this->cpt->config['taxonomies'] = $this->ctaxes;
    }

    register_post_type( models\Course::$cpt, $this->cpt->config );
  }

  public function add_meta_boxes() {
    add_meta_box(models\Course::$cpt . '-builder', __("Curriculum Builder", 'memberpress-courses'), array($this, 'curriculum_meta_box'), models\Course::$cpt, "normal", "high");
    add_meta_box(models\Course::$cpt . '-settings', __("Course Setting", 'memberpress-courses'), array($this, 'course_settings_meta_box'), models\Course::$cpt, "normal", "high");
    add_meta_box(models\Course::$cpt . '-resources', __("Resources", 'memberpress-courses'), array($this, 'course_resources_meta_box'), models\Course::$cpt, "normal", "high");
    add_meta_box(models\Course::$cpt . '-certificates', __("Course Certificates", 'memberpress-courses'), array($this, 'course_certificates_meta_box'), models\Course::$cpt, "normal", "high");
    add_meta_box(models\Course::$cpt . "-custom-template", __('Page Options', 'memberpress-courses'), array($this, 'page_options_meta_box'), models\Course::$cpt, "side", "default");
  }

  public function curriculum_meta_box($post) {
    $course = new models\Course($post->ID);
    require_once(base\VIEWS_PATH . '/admin/courses/courses_curriculum_meta_box.php');
  }

  public function course_settings_meta_box($post) {
    $course = new models\Course($post->ID);
    require_once(base\VIEWS_PATH . '/admin/courses/courses_settings_meta_box.php');
  }

  public function course_resources_meta_box($post) {
    $course = new models\Course($post->ID);
    require_once(base\VIEWS_PATH . '/admin/courses/courses_resources_meta_box.php');
  }

  public function course_certificates_meta_box($post) {
    $course = new models\Course($post->ID);
    require_once(base\VIEWS_PATH . '/admin/courses/courses_certificates_meta_box.php');
  }

  public function page_options_meta_box($post) {
    $course = new models\Course($post->ID);
    $templates = get_page_templates();
  $course = new models\Course($post->ID);
    require_once(base\VIEWS_PATH . '/admin/courses/courses_page_options_meta_box.php');
  }

  private static function add_or_reorder_lesson($section_id, $lesson_id, $index) {
    $section_lesson = models\Lesson::get_one(array(
      'wheres' => array(
        'ID' => $lesson_id,
        'section_id' => $section_id,
      )
    ));

    if($section_lesson !== false) {
      if($section_lesson->lesson_order != $index) {
        $section_lesson->update_order($index);
      }
    }
    else {
      $lesson = new models\Lesson($lesson_id);
      $lesson->add_to_section($section_id, $index);
    }
  }

  /**
   * Adds social links to user profile
   *
   * @param $user_contact
   * @return mixed
   */
  function user_social_links( $user_contact ) {

    /* Add user contact methods */
    $user_contact['facebook']   = __('Facebook URL', 'memberpress-courses');
    $user_contact['twitter']    = __('Twitter URL', 'memberpress-courses');
    $user_contact['Instagram']  = __('Instagram URL', 'memberpress-courses');
    $user_contact['youtube']    = __('Youtube URL', 'memberpress-courses');

    return $user_contact;
  }

  public function reset_course_progress(){
    lib\Utils::check_ajax_referer('reset_progress', 'nonce');

    try {
      lib\Validate::not_null($_POST['course_id'], 'Course ID');
      lib\Validate::is_numeric($_POST['user_id'], 1, null, 'User ID');

      $course = new models\Course($_POST['course_id']);
      $user_id = $_POST['user_id'];

      lib\Validate::is_numeric($course->ID, 1, null, 'Course ID');
    }
    catch(lib\ValidationException $e) {
      lib\Utils::exit_with_status(403, json_encode(array('error' => $e->getErrorMessage())));
    }

    // Only Admins can delete other user's progress
    if( $user_id != get_current_user_id() && false == lib\Utils::is_user_admin() ) {
      lib\Utils::exit_with_status(403, json_encode(array('error' => __('You are not allowed to delete user\'s progress', 'memberpress-courses'))));
    }

    $user_progresses = (array) models\UserProgress::find_all_by_user_and_course($user_id, $course->ID);

    foreach ($user_progresses as $user_progress) {

      $course_id = $user_progress->course_id;
      $lesson_id = $user_progress->lesson_id;
      $user_id = $user_progress->user_id;

      delete_user_meta( $user_id, 'mpcs_course_started_'.$course_id );
      delete_user_meta( $user_id, 'mpcs_lesson_started_'.$lesson_id );
      do_action('mpcs_reset_course_progress', $user_id, $lesson_id, $course_id);

      $user_progress->destroy();
    }

    lib\Utils::exit_with_status(200, json_encode(array('message' => __('Progress was deleted for this User and Course', 'memberpress-courses'))));
  }

  /**
   * On memberpress-members page, show the course title at the top
   * @return void
   */
  public function maybe_display_members_course_heading() {
    $page = isset( $_GET['page'] ) ? $_GET['page'] : ''; // phpcs:ignore WordPress.Security.NonceVerification
    $course = isset( $_GET['course'] ) ? (int) $_GET['course'] : ''; // phpcs:ignore WordPress.Security.NonceVerification

    if ( 'memberpress-members' !== $page || $course <= 0 ) {
      return;
    }

    $course_title = get_the_title($course);

    if( ! empty($course_title) ) {
      echo esc_html(\MeprHooks::apply_filters('mpcs-members-course-title', ' - ' . $course_title, $course_title));
    }
  }

  /**
   * Render extra filters.
   */
  public static function render_additional_filters($post_type) {
    if ($post_type === models\Course::$cpt) {
      $taxonomy      = CourseCategories::$tax;
      $selected      = isset($_GET[$taxonomy]) ? $_GET[$taxonomy] : '';
      $info_taxonomy = get_taxonomy($taxonomy);

      if( false === $info_taxonomy ) {
        return;
      }

      $taxonomy_args = array(
        'taxonomy'   => $taxonomy,
        'hide_empty' => false,
        'fields'     => 'ids',
        'number'     => 1
      );

      $taxonomy_terms = get_terms( $taxonomy_args );

      if ( empty( $taxonomy_terms ) ) {
        return;
      }

      wp_dropdown_categories(array(
        'show_option_all' => sprintf( esc_html__( 'Show all %s', 'memberpress-courses' ), $info_taxonomy->label ),
        'taxonomy'        => $taxonomy,
        'name'            => $taxonomy,
        'orderby'         => 'name',
        'selected'        => $selected,
        'show_count'      => true,
        'hide_empty'      => false
      ));
    }
  }

  public function register_filter_queries() {
    add_action('parse_query', array($this,'filter_post_type_by_taxonomy'));
  }

  /**
   * Filter the courses as per selected taxonomy.
   *
   * @param $query
   */
  public function filter_post_type_by_taxonomy($query) {
    global $pagenow;
    $taxonomy = CourseCategories::$tax;
    if (
      $pagenow == 'edit.php' && is_admin()
      && isset($query->query_vars['post_type'])
      && $query->query_vars['post_type'] === models\Course::$cpt
      && isset($query->query_vars[$taxonomy])
      && is_numeric($query->query_vars[$taxonomy])
      && 0 < absint($query->query_vars[$taxonomy])
    ) {
      $term = get_term_by('id', (int) $query->query_vars[$taxonomy], $taxonomy);
      if ($term && ! is_wp_error($term)) {
        $query->query_vars[$taxonomy] = $term->slug;
      }
    }
  }
}
