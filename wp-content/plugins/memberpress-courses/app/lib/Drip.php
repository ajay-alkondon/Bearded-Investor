<?php
namespace memberpress\courses\lib;

use memberpress\courses\models as models;
use memberpress\courses\helpers as helpers;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

/**
 * Class Drip
 *
 * Validates the availability of items based on a drip sequence.
 */
class Drip {
  /**
 * @var object The course object containing drip settings and other details.
 */
  private $course;

  /**
   * @var int The ID of the user for whom the drip is being calculated.
   */
  private $user_id;

  /**
   * @var int The amount of time between each drip interval.
   */
  private $drip_amount;

  /**
   * @var string The type of drip frequency (e.g., daily, weekly, monthly).
   */
  private $drip_frequency;

  /**
   * @var string The drip time
   */
  private $drip_time;

  /**
   * @var string The timezone used for date calculations.
   */
  private $timezone;

  /**
   * @var string The type of drip frequency calculation.
   */
  private $drip_frequency_type;

  /**
   * @var string The fixed date for drip frequency, if applicable.
   */
  private $drip_frequency_fixed_date;

  /**
   * @var Drip\BaseDateCalculator The base date calculator instance used for drip date calculation.
   */
  private $base_date_calculator;

  /**
   * @var Drip\ItemInfoProviderInterface The item info provider instance used for retrieving data.
   */
  private $item_info_provider;

  /**
   * DripValidate constructor.
   *
   * @param object $course
   * @param int $user_id
   * @param Drip\BaseDateCalculator $base_date_calculator
   * @param Drip\ItemInfoProviderInterface $item_info_provider
   *
   * @throws InvalidArgumentException If invalid argument types are provided.
   */
  public function __construct($course, $user_id, Drip\BaseDateCalculator $base_date_calculator, Drip\ItemInfoProviderInterface $item_info_provider) {
    $this->base_date_calculator = $base_date_calculator;
    $this->item_info_provider = $item_info_provider;

    // Sanity checks for constructor arguments
    $this->validate_arguments($course);

    // Initialize properties
    $this->initialize_properties($course, $user_id);
  }

  private function initialize_properties($course, $user_id) {
    $timezone = $course->drip_timezone;
    // Convert UTC offset to timezone identifier if necessary
    if (false !== strpos($timezone, 'UTC')) {
      $timezone = helpers\Drip::offset_to_timezone_string($timezone);
    }

    $this->course = $course;
    $this->user_id = $user_id;
    $this->drip_amount = $course->drip_amount;
    $this->drip_frequency = $course->drip_frequency;
    $this->drip_frequency_type = $course->drip_frequency_type;
    $this->drip_frequency_fixed_date = $course->drip_frequency_fixed_date;
    $this->drip_time = $course->drip_time;
    $this->timezone = $timezone;
  }

  private function validate_arguments($course) {
    if (empty($course->drip_type)) {
      throw new \InvalidArgumentException(__('Drip type must be valid.', 'memberpress-courses'));
    }

    if (!is_numeric($course->drip_amount)) {
      throw new \InvalidArgumentException(__('Drip amount must be numeric.', 'memberpress-courses'));
    }

    if (!is_string($course->drip_frequency) || !is_string($course->drip_frequency_type)) {
      throw new \InvalidArgumentException(__('Frequency and Frequency Type must be valid.', 'memberpress-courses'));
    }
  }

  public function get_course() {
    return $this->course;
  }

  public function get_user_id() {
    return $this->user_id;
  }

  private function get_the_base_date($item_index_info) {
    $this->base_date_calculator->initialize($this->course, $this->user_id, $item_index_info);
    return $this->base_date_calculator->calculate();
  }

  /**
   * Calculate the available date for an item in the drip sequence.
   *
   * @param array $item_index_info Index of the item to calculate the available date for.
   * @return DateTimeImmutable The available date for the item.
   */
  public function calculate_available_date($item_index_info) {
    if( ! isset($item_index_info['current_index']) || 0 === (int) $item_index_info['current_index'] ) {
      return false;
    }

    // get the base drip date
    $base_date = $this->get_the_base_date($item_index_info);

    if( is_null($base_date) || false === $base_date || ! helpers\Drip::is_valid_date($base_date) ) {
      throw new \Exception(__('Drip base date is invalid.', 'memberpress-courses'));
    }

    $item_index = $item_index_info['current_index'];
    if ( 'previous_item_completed' === $this->drip_frequency_type )  {
      $item_index = 1;
    }

    return $this->calculate_interval($base_date, $item_index);
  }

  private function calculate_interval($base_date, $item_index) {
    // Create a DateTimeImmutable object from the date string with the desired timezone
    $start_date = new \DateTimeImmutable($base_date, new \DateTimeZone($this->timezone));

    // Parse the time from drip_time
    $time_parts = explode(':', $this->drip_time);
    $hour = intval($time_parts[0]);
    $minute = intval(substr($time_parts[1], 0, 2)); // Extract minutes
    $ampm = strtoupper(substr($time_parts[1], -2)); // Extract AM/PM

    if ($ampm === 'PM' && $hour !== 12) {
      $hour += 12;
    } elseif ($ampm === 'AM' && $hour === 12) {
      $hour = 0;
    }

    // Set the time of day for the start date
    $start_date = $start_date->setTime($hour, $minute);

    // Determine the interval based on drip_frequency
    $interval = $this->get_interval_str($this->drip_frequency, $item_index);

    // Calculate the available date for the item
    return $start_date->add(new \DateInterval($interval));
  }

  private function get_interval_str($drip_frequency, $item_index) {
    $interval = null;
    $drip_frequency = strtolower($drip_frequency);
    switch ($drip_frequency) {
      case 'daily':
        $interval = 'P' . ($this->drip_amount * $item_index) . 'D';
        break;
      case 'weekly':
        $interval = 'P' . ($this->drip_amount * $item_index) . 'W';
        break;
      case 'monthly':
        $interval = 'P' . ($this->drip_amount * $item_index) . 'M';
        break;
      default:
        throw new \InvalidArgumentException(__('Invalid drip frequency.', 'memberpress-courses'));
    }

    return $interval;
  }

  /**
   * Check if date is valid based on the availablity date and current date.
   *
   * @param DateTimeImmutable $available_date The available date for the item.
   * @param DateTimeImmutable|null $current_date Current date. Defaults to null, which uses the current date.
   * @return bool True if available, false otherwise.
   */
  public function is_available($available_date, $current_date = null) {
    // Set current date if not provided
    if (!$current_date || null === $current_date || ! ($current_date instanceof \DateTimeImmutable) ) {
      $current_date = new \DateTimeImmutable('now', $available_date->getTimezone());
    }

    // Check if the current date is greater than or equal to the available date
    return $current_date >= $available_date;
  }

  public function get_item_info($current_post, $lesson) {
    return $this->item_info_provider->get_info($this->course, $current_post, $lesson);
  }
}
