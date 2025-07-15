<?php
namespace memberpress\courses\lib\Drip;

use memberpress\courses\helpers as helpers;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

/**
 * Class CourseStartDate
 *
 */
class CourseStartDate extends BaseDateCalculator {
  public function calculate() {

    if( ! $this->is_course() || ! $this->is_user() ) {
      return null;
    }

    return helpers\Events::get_course_start_date($this->course->ID, $this->user_id);
  }
}
