<?php
namespace memberpress\courses\helpers;
if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

use memberpress\courses\lib;
use memberpress\courses\models;
use memberpress\courses\lib\BaseEmail;

class Lessons {
  /**
  * Href for lesson
  * @param int ID of the current lesson
  * @return (string|false)
  */
  public static function lesson_link($lesson_id) {
    return get_permalink($lesson_id);
  }

  /**
  * Href for course
  * @param int ID of the current course
  * @return (string|false)
  */
  public static function course_link($course_id) {
    return get_permalink($course_id);
  }

  /**
  * Check if current lesson is the first lesson
  * @param int $current_lesson_index Index of the current lesson
  * @return boolean
  */
  public static function has_previous_lesson($current_lesson_index) {
    return $current_lesson_index > 0;
  }

  /**
  * Check if section has next lesson
  * @param int $current_lesson_index Index of the current lesson
  * @param array[int] $lesson_nav_ids Array of lesson ids for current section
  * @return boolean
  */
  public static function has_next_lesson($current_lesson_index, $lesson_nav_ids) {
    return isset($lesson_nav_ids[$current_lesson_index + 1]);
  }

  /**
  * Check if course has next section
  * @param int $current_section_index Index of the current section
  * @param array[int] $section_ids Array of section ids for current course
  * @return boolean
  */
  public static function has_previous_section($current_section_index) {
    return $current_section_index > 0;
  }

  /**
  * Check if course has next section
  * @param int $current_section_index Index of the current section
  * @param array[int] $section_ids Array of section ids for current course
  * @return boolean
  */
  public static function has_next_section($current_section_index, $section_ids) {
    return isset($section_ids[$current_section_index + 1]);
  }

  /**
  * Href for previous lesson
  * @param int $current_lesson_index Index of the current lesson
  * @param array[int] $lesson_nav_ids Array of lesson ids for current section
  * @return (string|false)
  */
  public static function previous_lesson_link($current_lesson_index, $lesson_nav_ids) {
    $previous_lesson_id = $lesson_nav_ids[$current_lesson_index - 1];

    return get_permalink($previous_lesson_id);
  }

  /**
  * Href for next lesson
  * @param int $current_lesson_index Index of the current lesson
  * @param array[int] $lesson_nav_ids Array of lesson ids for current section
  * @return (string|false)
  */
  public static function next_lesson_link($current_lesson_index, $lesson_nav_ids) {
    $next_lesson_id = $lesson_nav_ids[$current_lesson_index + 1];

    return get_permalink($next_lesson_id);
  }

  /**
  * Href for next section
  * @param int $current_section_index Index of the current section
  * @param array[int] $section_ids Array of section ids for current course
  * @return (string|false)
  */
  public static function previous_section_link($current_section_index, $section_ids) {
    $previous_section = new models\Section($section_ids[$current_section_index - 1]);
    $previous_section_lessons = $previous_section->lessons();
    $previous_lesson = end($previous_section_lessons);
    $permalink = '';

    if($previous_lesson) {
      $permalink = get_permalink($previous_lesson->ID);
    }

    return $permalink;
  }

  /**
  * Href for next section
  * @param int $current_section_index Index of the current section
  * @param array[int] $section_ids Array of section ids for current course
  * @return (string|false)
  */
  public static function next_section_link($current_section_index, $section_ids) {
    $permalink = '';
    $next_section = new models\Section($section_ids[$current_section_index + 1]);
    $next_section_lessons = $next_section->lessons();

    if($next_section_lessons){
      $next_lesson = $next_section_lessons[0];
      $permalink = get_permalink($next_lesson->ID);
    }

    return $permalink;
  }

  /**
  * Href for section's first lesson
  * @param int $section_id
  * @return (string|false)
  */
  public static function section_link($section_id) {
    $section = new models\Section($section_id);
    $course = $section->course();
    if(empty($course)) {
      return '#';
    }
    else {
      return get_permalink($course->ID) . '#section' . (string)((int)$section->section_order + 1);
    }
  }

  /**
   * Checks if current post is a lesson or a quiz
   *
   * @param  \WP_Post $post
   * @return bool
   */
  public static function is_a_lesson($post) {
    $cpts = models\Lesson::lesson_cpts();
    return isset($post) && is_a($post, 'WP_Post') && in_array($post->post_type, $cpts, true);
  }

  /**
   * Get the lesson or quiz instance for the given post
   *
   * @param  \WP_Post $post
   * @return models\Lesson|models\Quiz|null
   */
  public static function get_lesson($post) {
    if($post instanceof \WP_Post) {
      $cpts = models\Lesson::lesson_cpts(true);

      if(array_key_exists($post->post_type, $cpts)) {
        return new $cpts[$post->post_type]($post->ID) ;
      }
    }

    return null;
  }

  /**
   * Get permalink base slug
   *
   * @return string
   */
  public static function get_permalink_base() {
    $slug = models\Lesson::$permalink_slug;
    $options = \get_option('mpcs-options');

    if(!empty(Options::val($options,'lessons-slug'))) {
      $slug = Options::val($options,'lessons-slug');
    }

    return $slug;
  }

  /**
   * Display lesson menu
   *
   * @param  object $post
   * @return mixed
   */
  public static function display_lesson_buttons($post){
    $current_user = lib\Utils::get_currentuserinfo();
    $current_lesson = new models\Lesson($post->ID);
    $lesson_nav_ids = $current_lesson->nav_ids();
    $current_lesson_index = \array_search($current_lesson->ID, $lesson_nav_ids);
    $current_section = $current_lesson->section();
    $lesson_available = $current_lesson->is_available();
    $current_section_index = false;
    $current_course = $current_section->course();
    $section_ids = array();

    if($current_section !== false && $lesson_available) {
      if(!self::has_next_lesson($current_lesson_index, $lesson_nav_ids) || !self::has_previous_lesson($current_lesson_index, $lesson_nav_ids)) {
        $sections = $current_course->sections();
        $section_ids = \array_map(function($section) {
          return $section->id;
        }, $sections);
        $current_section_index = \array_search($current_section->id, $section_ids);
      }

      $options = \get_option('mpcs-options');

      \ob_start();

      require \MeprView::file('/lessons/courses_classroom_buttons');
      $nav_links = \ob_get_clean();

      $nav_links = \apply_filters('mpcs_classroom_lesson_buttons', $nav_links, get_defined_vars());


      return $nav_links;
    }
  }

  public static function get_email_vars(BaseEmail $email)
  {
    return apply_filters(
      'mpcs_lesson_email_vars',
      [
        'lesson_url'     => esc_html__('Should output the URL to the Lesson', 'memberpress-courses'),
        'lesson_name'    => esc_html__('Should output the Lesson Name (post_title)', 'memberpress-courses'),
        'lesson_id'      => esc_html__('Should output the Lesson ID (post_ID)', 'memberpress-courses'),
        'lesson_status'  => esc_html__('Not Started, In-Progress, Completed', 'memberpress-courses'),
      ],
      $email
    );
  }

  /**
   * Get email params
   *
   * @return array
   */
  public static function get_email_params(models\Lesson $lesson, $record = null)
  {
    $params = [
      'lesson_url'    => get_permalink($lesson->ID),
      'lesson_name'   => $lesson->post_title,
      'lesson_id'     => $lesson->ID,
      'lesson_status' => $lesson->is_complete() ? __('Completed', 'memberpress-courses') : __('Not Started', 'memberpress-courses'),
    ];

    return apply_filters('mpcs_lesson_email_params', $params, $lesson, $record);
  }

}
