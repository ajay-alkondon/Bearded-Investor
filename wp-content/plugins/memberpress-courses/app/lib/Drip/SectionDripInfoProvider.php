<?php
namespace memberpress\courses\lib\Drip;

use memberpress\courses\models;
use memberpress\courses\helpers;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

/**
 * Class SectionDripInfoProvider
 *
 */
class SectionDripInfoProvider implements ItemInfoProviderInterface {

  public function get_info($course, $current_post, $lesson) {
    $course_curriculum = helpers\Courses::course_curriculum($course->ID, 'publish');
    $section           = $lesson->section();

    if ($section instanceof models\Section) {
      return $this->get_section_indexes_in_curriculum($course_curriculum, $section);
    }

    return array();
  }

  /**
   * Get the index of a section in the curriculum and the previous section's index if available.
   *
   * @param array $curriculum The curriculum array.
   * @param object $section The section object with uuid property.
   * @return array|false Returns an array or false if not found.
   */
  private function get_section_indexes_in_curriculum($curriculum, $section) {
    $section_uuid  = isset($section->uuid) ? $section->uuid : '';
    $section_order = isset($curriculum['sectionOrder']) ? $curriculum['sectionOrder'] : '';
    $index         = false;

    if( '' !== $section_uuid && is_array($section_order) && !empty($section_order)) {
      $index = array_search($section_uuid, $section_order);
    }

    if (false !== $index) {
      $previous              = $index - 1;
      $previous_section      = isset($section_order[$previous]) ? $section_order[$previous] : -1;
      $previous_section_data = isset($curriculum['sections'][$previous_section]) ? $curriculum['sections'][$previous_section] : null;

      return array(
        'current_index'         => (int) $index,
        'previous_index'        => (int) $previous,
        'previous_section_uuid' => $previous_section,
        'previous_section'      => $previous_section_data
      );
    } else {
      return false;
    }
  }
}
