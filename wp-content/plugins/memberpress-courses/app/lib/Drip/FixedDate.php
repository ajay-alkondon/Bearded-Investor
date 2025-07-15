<?php
namespace memberpress\courses\lib\Drip;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

/**
 * Class FixedDate
 *
 */
class FixedDate extends BaseDateCalculator {
  public function calculate() {
    if( ! $this->is_course() || ! $this->is_user() ) {
      return null;
    }
    return isset($this->course->drip_frequency_fixed_date) ? $this->course->drip_frequency_fixed_date : null;
  }
}