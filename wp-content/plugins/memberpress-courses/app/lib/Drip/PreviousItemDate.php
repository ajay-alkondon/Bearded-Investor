<?php
namespace memberpress\courses\lib\Drip;

use memberpress\courses\helpers;
use memberpress\courses\models;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

/**
 * Class PreviousItemDate
 *
 */
class PreviousItemDate extends BaseDateCalculator {

  protected $completion_methods = array(
    'section' => 'get_section_completion_date',
    'item'    => 'get_item_completion_date'
  );

  public function calculate() {
    $completion_date = null;

    if( false === $this->is_initialized() ) {
      return $completion_date;
    }

    $completion_method = $this->get_completion_method();
    $completion_date = $completion_method ? $this->$completion_method() : null;

    return $completion_date;
  }

  private function get_completion_method() {
    return isset( $this->completion_methods[ $this->course->drip_type ] ) ? $this->completion_methods[ $this->course->drip_type ] : null;
  }

  private function get_previous_section() {
    if ( ! isset( $this->item_index_info['previous_section'] )   ||
      ! isset( $this->item_index_info['previous_section_uuid'] ) ||
      ! is_array( $this->item_index_info['previous_section'] ) ) {
      return false;
    }

    $section_obj = models\Section::find_by_uuid( $this->item_index_info['previous_section_uuid'] );
    return new models\Section( $section_obj->id );
  }

  private function get_section_completion_date() {
    $section = $this->get_previous_section();
    if ( ! $section || intval($section->id) <= 0 || ! models\UserProgress::has_completed_section( $this->user_id, $section->id ) ) {
      return null;
    }

    $lesson_ids = isset($this->item_index_info['previous_section']['lessonIds']) ?
    $this->item_index_info['previous_section']['lessonIds'] : array();

    return $this->find_max_completion_date( $lesson_ids );
  }

  private function find_max_completion_date( $lesson_ids ) {
    if ( ! is_array( $lesson_ids ) || empty( $lesson_ids ) ) {
      return null;
    }

    $completion_dates = array();

    foreach ( $lesson_ids as $lesson_id ) {
      $date = models\UserProgress::get_lesson_completion_date( $this->user_id, $lesson_id );
      if ( helpers\Drip::is_valid_date( $date ) ) {
        $completion_dates[strtotime($date)] = $date;
      }
    }

    if ( empty( $completion_dates ) ) {
      return null;
    }

    $max_timestamp = max(array_keys($completion_dates));
    return $completion_dates[$max_timestamp];
  }

  private function get_item_completion_date() {
    if ( ! isset( $this->item_index_info['previous_item'] ) ) {
      return null;
    }

    $completion_date = models\UserProgress::get_lesson_completion_date(
      $this->user_id, $this->item_index_info['previous_item']
    );

    return helpers\Drip::is_valid_date($completion_date) ? $completion_date : null;
  }
}