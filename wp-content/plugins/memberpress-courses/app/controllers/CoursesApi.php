<?php
namespace memberpress\courses\controllers;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

use memberpress\courses\lib as lib;
use memberpress\courses\models as models;
use memberpress\courses\helpers as helpers;

class CoursesApi extends lib\BaseCtrl {
  public static $namespace_str = 'mpcs';
  public static $resource_name_str = 'courses';

  // Here initialize our namespace and resource name.
  public function __construct() {
    parent::__construct();
  }

  public function load_hooks() {
    add_action('rest_api_init', array($this, 'register_routes'));
  }

  /**
   * Register the routes for the objects of the controller.
   */
  public function register_routes() {
    register_rest_route( self::$namespace_str, '/' . self::$resource_name_str .'/lessons', array(
      array(
        'methods'             => \WP_REST_Server::READABLE,
        'callback'            => array( $this, 'fetch_lessons' ),
        'permission_callback' => array( $this, 'fetch_lessons_permissions_check' ),
      ),
    ) );

    register_rest_route( self::$namespace_str, '/' . self::$resource_name_str .'/lessons/(?P<id>[\d]+)', array(
      array(
        'methods'             => \WP_REST_Server::CREATABLE,
        'callback'            => array( $this, 'duplicate_lesson' ),
        'permission_callback' => array( $this, 'create_item_permissions_check' ),
      ),
    ) );

    register_rest_route( self::$namespace_str, '/' . self::$resource_name_str .'/curriculum/(?P<id>[\d]+)', array(
      array(
        'methods'             => \WP_REST_Server::READABLE,
        'callback'            => array( $this, 'get_curriculum' ),
        'permission_callback' => array( $this, 'fetch_lessons_permissions_check' ),
      ),
    ) );

    register_rest_route( self::$namespace_str, '/' . self::$resource_name_str .'/validate/links', array(
      array(
        'methods'             => \WP_REST_Server::CREATABLE,
        'callback'            => array( $this, 'validate_links_fields' ),
        'permission_callback' => array( $this, 'fetch_lessons_permissions_check' ),
      ),
    ) );

    do_action( 'mpcs_courses_api_routes', $this, self::$namespace_str );
  }

  /**
   * Get a collection of lesson
   *
   * @param \WP_REST_Request $request Full data about the request.
   * @return \WP_REST_Response
   */
  public function fetch_lessons( $request ) {
    return self::fetch_items( $request, 'mpcs-lesson', 'lessons');
  }

  /**
   * Get a collection of items
   *
   * @param \WP_REST_Request $request Full data about the request.
   * @param string $post_type
   * @param string $data_key
   * @return \WP_REST_Response
   */
  public function fetch_items( $request, $post_type, $data_key ) {
    $params = $request->get_params();

    $args = [
      'post_type' => $post_type,
      'fields' => 'ids',
      's' => isset($params['s']) && is_string($params['s']) ? sanitize_text_field($params['s']) : '',
      'paged' => isset($params['paged']) && is_numeric($params['paged']) ? max(1, (int) $params['paged']) : 1,
      'post_status' => isset($params['post_status']) && is_array($params['post_status']) ? array_map('sanitize_key', $params['post_status']) : ['publish', 'draft', 'future'],
    ];

    $query = new \WP_Query($args);
    $post_ids = $query->get_posts();
    $data = [];
    $post_types = models\Lesson::lesson_cpts(true);

    foreach($post_ids as $post_id) {
      if(array_key_exists($post_type, $post_types)) {
        $post = new $post_types[$post_type]($post_id);
      }
      $data[$data_key][] = $this->prepare_item_for_response($post);
    }

    $data['meta']['total'] = $query->found_posts;
    $data['meta']['max'] = $query->max_num_pages;
    $data['meta']['count'] = $query->post_count;

    return new \WP_REST_Response( $data, 200 );
  }


  /**
   * Check if a given request has access to get items
   *
   * @return bool
   */
  public function fetch_lessons_permissions_check() {
    return current_user_can( 'read' );
  }

  /**
   * Duplicate a lesson
   *
   * @param \WP_REST_Request $request Full data about the request.
   * @return \WP_REST_Response|\WP_Error
   */
  public function duplicate_lesson( $request ) {
    $post_id = absint( $request->get_param( 'id' ) );
    $post = get_post( $post_id );

    if(!$post instanceof \WP_Post || $post->post_type !== models\Lesson::$cpt) {
      return new \WP_Error('not-found', __('Post not found', 'memberpress-courses'), ['status' => 404]);
    }

    // args for new post
    $args = array(
      'comment_status' => $post->comment_status,
      'ping_status'    => $post->ping_status,
      'post_author'    => $post->post_author,
      'post_content'   => $post->post_content,
      'post_excerpt'   => $post->post_excerpt,
      'post_name'      => $post->post_name,
      'post_parent'    => $post->post_parent,
      'post_password'  => $post->post_password,
      'post_status'    => $post->post_status,
      'post_title'     => $post->post_title,
      'post_type'      => $post->post_type,
      'to_ping'        => $post->to_ping,
      'menu_order'     => $post->menu_order
    );

    // insert the new post
    $new_post_id = wp_insert_post( $args );

    if(empty($new_post_id)) {
      return new \WP_Error('cant-create', __('Could not create duplicate post', 'memberpress-courses'), ['status' => 500]);
    }

    // add taxonomy terms to the new post
    $taxonomies = get_object_taxonomies( $post->post_type );
    foreach ( $taxonomies as $taxonomy ) {
      $post_terms = wp_get_object_terms( $post_id, $taxonomy, array( 'fields' => 'slugs' ) );
      wp_set_object_terms( $new_post_id, $post_terms, $taxonomy, false );
    }

    $lesson = new models\Lesson($new_post_id);

    return new \WP_REST_Response($lesson->rec);
  }

  /**
   * Fetches updated curriculum
   *
   * @param \WP_REST_Request $request Full data about the request.
   * @return \WP_REST_Response
   */
  public function get_curriculum($request){
    $post_id = absint( $request->get_param( 'id' ) );
    $curriculum = helpers\Courses::course_curriculum($post_id);
    return new \WP_REST_Response( $curriculum, 200 );
  }



  /**
   * Check if a given request has access to create items
   *
   * @return bool
   */
  public function create_item_permissions_check() {
    return current_user_can( 'edit_pages' );
  }

  /**
   * Prepare the item for the REST response
   *
   * @param models\Lesson $lesson
   * @return array
   */
  public function prepare_item_for_response($lesson) {
    $course = $lesson->course();

    return [
      'ID' => $lesson->ID,
      'title' => $lesson->post_title,
      'permalink' => get_permalink($lesson->ID),
      'type' => $lesson->post_type,
      'post_status' => $lesson->post_status,
      'courseID' => $course ? $course->ID : '',
      'courseTitle' => $course ? $course->post_title : '',
    ];
  }

  public function validate_links_fields($request) {
    $label = $request->get_param('label');
    $url = $request->get_param('url');
    $errors = array();

    if(false === wp_http_validate_url($url)){
      $errors['url'] = esc_html__('Please enter valid URL', 'memberpress-courses');
    }

    return new \WP_REST_Response([
      'errors' => $errors,
      'url' => $url,
      'label' => sanitize_text_field($label)
    ]);
  }
}
