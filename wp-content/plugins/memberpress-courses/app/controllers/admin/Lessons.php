<?php
namespace memberpress\courses\controllers\admin;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

use memberpress\courses as base;
use memberpress\courses\lib as lib;
use memberpress\courses\models as models;
use memberpress\courses\helpers as helpers;

class Lessons extends lib\BaseCptCtrl {
  public function load_hooks() {
    add_action('admin_action_duplicate_post', array($this, 'duplicate_post'));
    add_action('manage_mpcs-lesson_posts_custom_column', array($this, 'custom_column_content'), 10, 2);
    add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
    add_action('enqueue_block_editor_assets', array($this, 'enqueue_block_editor_assets') );
    add_filter('post_row_actions', array($this, 'duplicate_post_link'), 10, 2);
    add_filter('manage_mpcs-lesson_posts_columns', array($this, 'alter_columns'));
    add_action('admin_footer-edit.php', array($this, 'categories_tags_buttons'));
    add_action('admin_init', array($this, 'register_filter_queries'));
    add_action('restrict_manage_posts', array($this, 'render_additional_filters'));
    $this->ctaxes = array('course-tags', 'course-categories');
  }

  public function register_post_type() {
    $this->cpt = (object)array(
      'slug' => models\Lesson::$cpt,
      'config' => array(
        'labels' => array(
          'name' => __('Lessons', 'memberpress-courses'),
          'singular_name' => __('Lesson', 'memberpress-courses'),
          'add_new' => __('Add New', 'memberpress-courses'),
          'add_new_item' => __('Add New Lesson', 'memberpress-courses'),
          'edit_item' => __('Edit Lesson', 'memberpress-courses'),
          'new_item' => __('New Lesson', 'memberpress-courses'),
          'view_item' => __('View Lesson', 'memberpress-courses'),
          'search_items' => __('Search Lessons', 'memberpress-courses'),
          'not_found' => __('No Lessons found', 'memberpress-courses'),
          'not_found_in_trash' => __('No Lessons found in Trash', 'memberpress-courses'),
          'parent_item_colon' => __('Parent Lesson:', 'memberpress-courses')
        ),
        'public' => true,
        'publicly_queryable' => true,
        'show_ui' => true,
        'show_in_rest' => true,
        'show_in_menu' => base\PLUGIN_NAME,
        'has_archive' => false,
        'capability_type' => 'page',
        'hierarchical' => false,
        'rewrite' => array('slug' => '/'.helpers\Courses::get_permalink_base().'/%course_slug%/' . helpers\Lessons::get_permalink_base(), 'with_front' => false),
        'supports' => array('title','editor','thumbnail'),
        'taxonomies' => array(),
      )
    );

    if(!empty($this->ctaxes)) {
      $this->cpt->config['taxonomies'] = $this->ctaxes;
    }

    register_post_type( models\Lesson::$cpt, $this->cpt->config );
  }

  /**
  * Save meta data on save_post
  * @see load_hooks(), add_action('save_post')
  * @param integer $post_id current post
  * @return mixed (id|false) postmeta id or false
  */
  public static function save_post_data($post_id) {
    # Verify nonce
    if(!\wp_verify_nonce(isset($_POST[models\Lesson::$nonce_str]) ? $_POST[models\Lesson::$nonce_str] : '', models\Lesson::$nonce_str . \wp_salt())) {
      return $post_id;
    }
    # Skip ajax
    if(defined('DOING_AJAX')) {
      return;
    }

    $lesson = new models\Lesson($post_id);

    $lesson->store_meta();
  }

  public static function duplicate_post_link($actions, $post) {
    global $current_screen;

    if(isset($current_screen->post_type) && $current_screen->post_type === models\Lesson::$cpt) {
      if(current_user_can('edit_posts')) {
        $actions['duplicate'] = '<a href="' . \wp_nonce_url('admin.php?action=duplicate_post&post=' . $post->ID, basename(__FILE__), 'duplicate_nonce' ) . '">' . __('Duplicate', 'memberpress-courses') . '</a>';
      }
    }
    return $actions;
  }

  public static function duplicate_post() {
    if (!isset($_REQUEST['post'])  || (isset($_REQUEST['action']) && $_REQUEST['action'] !== 'duplicate_post')) {
      die();
    }
    if (!isset($_REQUEST['duplicate_nonce']) || !\wp_verify_nonce($_GET['duplicate_nonce'], basename( __FILE__ ))) {
      return;
    }

    $lesson = new models\Lesson($_REQUEST['post']);
    $cloned_post_id = $lesson->cloneit();

    \wp_redirect(admin_url('post.php?action=edit&post=' . $cloned_post_id));
  }

  public static function custom_column_content($column, $post_id) {
    if($column === 'course') {
      $lesson = new models\Lesson($post_id);
      $course = $lesson->course();
      echo empty($course) ? '' : $course->post_title;
    }
  }


  public function admin_enqueue_scripts() {
    global $current_screen;
    global $post;

    if($current_screen->post_type === models\Lesson::$cpt && (isset($_GET['post']) || isset($_GET['post_type']))) {
      $post_id = isset($post->ID) ? $post->ID : 0;
      $lesson = new models\Lesson($post_id);
      $course = $lesson->course();

      $coursesUrl = '';
      $courseTitle = '';
      if($course && isset($course->ID) && absint($course->ID) > 0){
        $coursesUrl = get_edit_post_link($course->ID) . '#curriculum';
        $courseTitle = $course->post_title;
      }

      $back_cta_label = __("Back to Lessons", "memberpress-courses");
      $back_cta_url = admin_url('edit.php?post_type=' . models\Lesson::$cpt);
      if( isset($_GET['curriculum']) && $courseTitle != '' ) {
        $back_cta_label = sprintf( __('Back to %s', "memberpress-courses"), $course->post_title );
        $back_cta_url = get_edit_post_link($course->ID) . '#curriculum';
      }

      \wp_enqueue_script('mpcs-course-editor-js', base\JS_URL . '/course-editor.js', array('jquery'), base\VERSION);
      \wp_localize_script('mpcs-course-editor-js', 'MPCS_Course_Data', array(
        'curriculum' => '',
        'imagesUrl' => base\IMAGES_URL,
        'coursesUrl' => $coursesUrl,
        'courseTitle' => $courseTitle,
        'back_cta_url' => $back_cta_url,
        'back_cta_label' => $back_cta_label
      ) );

    }
  }


  /**
   * Enqueue block editor only JavaScript and CSS.
   */
  public function enqueue_block_editor_assets() {
    global $current_screen;

    if($current_screen->post_type === models\Lesson::$cpt) {
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
    }
  }


  public static function alter_columns($columns) {
    $columns['course'] = __('Course', 'memberpress-courses');

    return $columns;
  }

  public function categories_tags_buttons() {
    if ( empty( $_GET['post_type'] ) || models\Lesson::$cpt !== $_GET['post_type'] ) {
      return;
    }
    $new_links = sprintf( '<a href="%2$s" class="page-title-action" style="margin-left: 0;">%1$s</a>', esc_html__( 'Categories', 'memberpress-courses' ), add_query_arg( array(
      'taxonomy' => CurriculumCategories::$tax,
      'post_type' => models\Lesson::$cpt
    ), admin_url( 'edit-tags.php' ) ) );
    $new_links .= sprintf( '<a href="%2$s" class="page-title-action">%1$s</a>', esc_html__( 'Tags', 'memberpress-courses' ), add_query_arg( array(
      'taxonomy' => CurriculumTags::$tax,
      'post_type' => models\Lesson::$cpt
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
   * Render extra filters.
   */
  public static function render_additional_filters($post_type) {
    if ($post_type === models\Lesson::$cpt) {
      $taxonomy      = CurriculumCategories::$tax;
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
        'hide_empty'      => false,
        'walker'          => new lib\WalkerCurriculumCategories($post_type)
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
    $taxonomy = CurriculumCategories::$tax;
    if (
      $pagenow == 'edit.php' && is_admin()
      && isset($query->query_vars['post_type'])
      && $query->query_vars['post_type'] === models\Lesson::$cpt
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
