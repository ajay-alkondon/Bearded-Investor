<?php
namespace memberpress\courses\lib\Drip;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

/**
 * Abstract Class BaseDateCalculator
 *
 */
abstract class BaseDateCalculator implements DateCalculatorInterface {
  protected $course = null;
  protected $user_id = 0;
  protected $item_index_info = array();

  public function initialize($course, $user_id, $item_index_info) {
    $this->course = $course;
    $this->user_id = (int) $user_id;
    $this->item_index_info = $item_index_info;
  }

  public function is_initialized() {
    if (!$this->is_course() || !$this->is_user() || !$this->is_valid_item()) {
      return false;
    }
    return true;
  }

  protected function is_valid_item() {
    return is_array($this->item_index_info) && !empty($this->item_index_info);
  }

  protected function is_course() {
    return is_object($this->course) && isset($this->course->ID) && $this->course->ID > 0;
  }

  protected function is_user() {
    return $this->user_id > 0;
  }

  abstract public function calculate();
}
