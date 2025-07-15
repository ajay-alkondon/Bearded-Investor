<?php
namespace memberpress\courses\lib\Drip;

use memberpress\courses\models;
use memberpress\courses\helpers;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

/**
 * Class ItemDripInfoProvider
 *
 */
class ItemDripInfoProvider implements ItemInfoProviderInterface {
  public function get_info($course, $current_post, $lesson) {
    $course_curriculum = helpers\Courses::course_curriculum($course->ID, 'publish');
    $dripping_cpts     = $this->get_dripping_post_types($course);

    // if data is not valid or dripping for the item is current post type is not enabled - bailout.
    if (!is_array($course_curriculum) ||
        ! isset($dripping_cpts[$current_post->post_type]) || 1 !== $dripping_cpts[$current_post->post_type] ||
        !isset($course_curriculum['lessons'], $course_curriculum['lessons']['section']) ||
        !is_array($course_curriculum['lessons']['section'])) {
      return array();
    }

    // Filter curriclum to exclude items for which dripping is not enabled.
    foreach ($course_curriculum['lessons']['section'] as $key => $section) {
      if (isset($section['type']) && !$dripping_cpts[$section['type']]) {
        unset($course_curriculum['lessons']['section'][$key]);
      }
    }

    return $this->get_item_index_in_curriculum($course_curriculum, $current_post->ID);
  }

  protected function get_dripping_post_types($course) {
    $dripping_cpts = array(
      models\Lesson::$cpt => isset($course->drip_lessons) ? (int) $course->drip_lessons : 0
    );

    return apply_filters('mpcs_dripping_post_types', $dripping_cpts, $course);
  }

  /**
   * Get the index of an item in the curriculum and the previous item's index if available.
   *
   * @param array $curriculum The curriculum array.
   * @param int $post_id The post ID to search for.
   * @return array|false Returns an array or false if not found.
   */
  private function get_item_index_in_curriculum($curriculum, $post_id) {
    $index = array_search($post_id, array_column($curriculum['lessons']['section'], 'id'));
    if (false !== $index) {
      $previous      = $index - 1;
      $lesson_ids    = array_keys($curriculum['lessons']['section']);
      $previous_item = isset($lesson_ids[$previous]) ? $lesson_ids[$previous] : null;
      return array(
        'current_index'  => (int) $index,
        'previous_index' => (int) $previous,
        'previous_item'  => $previous_item
      );
    } else {
      return false;
    }
  }
}
