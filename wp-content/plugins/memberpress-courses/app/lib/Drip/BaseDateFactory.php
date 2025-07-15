<?php
namespace memberpress\courses\lib\Drip;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

/**
 * Class BaseDateFactory
 *
 */
class BaseDateFactory {
  public static function create($frequency_type) {
    $frequency_type = strtolower($frequency_type);
    switch ($frequency_type) {
      case 'fixed_date':
        return new FixedDate();
      case 'previous_item_completed':
        return new PreviousItemDate();
      case 'course_start_date':
        return new CourseStartDate();
      default:
        throw new \InvalidArgumentException(__('Invalid drip frequency type.', 'memberpress-courses'));
    }
  }
}
