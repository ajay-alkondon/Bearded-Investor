<?php
namespace memberpress\courses\helpers;

if (!defined('ABSPATH')) { die('You are not allowed to call this page directly.'); }

class Drip {

  protected static $drip_track = array();

  /**
   * Generate time intervals between start and end time with a specified interval.
   *
   * @param string $start Start time in 'HH:MM' format.
   * @param string $end End time in 'HH:MM' format.
   * @param int $interval Interval in minutes.
   * @return array|false Returns an array of time intervals or false on failure.
   */
  public static function generate_time_intervals($start, $end, $interval) {
    // Input validation
    if (!preg_match('/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/', $start) ||
        !preg_match('/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/', $end) ||
        !is_int($interval) || $interval <= 0) {
      return false; // Invalid input
    }

    $start_time = strtotime($start);
    $end_time = strtotime($end);

    // Sanity check: Ensure end time is greater than start time
    if ($end_time <= $start_time) {
      return false; // Invalid input
    }

    $current_time = $start_time;
    $time_intervals = array();

    while ($current_time <= $end_time) {
      $time_intervals[] = date('h:i A', $current_time);
      $current_time += $interval * 60; // Add interval in seconds
    }

    return $time_intervals;
  }

  /**
   * Generate timezone options for a select input.
   *
   * @return array An array of timezone options with 'label' and 'value'.
   */
  public static function generate_timezones_options() {
    $timezones = self::generate_timezones();
    $results = array();
    foreach ($timezones as $key => $value) {
      $results[] = array(
        'label' => $value,
        'value' => $key
      );
    }

    return $results;
  }

  /**
   * Generate a list of timezones including regional and UTC zones.
   *
   * @return array An array of timezone identifiers.
   */
  public static function generate_timezones() {
    $timezones = timezone_identifiers_list();
    $region_timezones = array_combine($timezones, $timezones);
    $utc_zones = array(
      'UTC'       => 'UTC',
      'UTC-12'    => 'UTC-12',
      'UTC-11.5'  => 'UTC-11:30',
      'UTC-11'    => 'UTC-11',
      'UTC-10.5'  => 'UTC-10:30',
      'UTC-10'    => 'UTC-10',
      'UTC-9.5'   => 'UTC-9:30',
      'UTC-9'     => 'UTC-9',
      'UTC-8.5'   => 'UTC-8:30',
      'UTC-8'     => 'UTC-8',
      'UTC-7.5'   => 'UTC-7:30',
      'UTC-7'     => 'UTC-7',
      'UTC-6.5'   => 'UTC-6:30',
      'UTC-6'     => 'UTC-6',
      'UTC-5.5'   => 'UTC-5:30',
      'UTC-5'     => 'UTC-5',
      'UTC-4.5'   => 'UTC-4:30',
      'UTC-4'     => 'UTC-4',
      'UTC-3.5'   => 'UTC-3:30',
      'UTC-3'     => 'UTC-3',
      'UTC-2.5'   => 'UTC-2:30',
      'UTC-2'     => 'UTC-2',
      'UTC-1.5'   => 'UTC-1:30',
      'UTC-1'     => 'UTC-1',
      'UTC-0.5'   => 'UTC-0:30',
      'UTC+0'     => 'UTC+0',
      'UTC+0.5'   => 'UTC+0:30',
      'UTC+1'     => 'UTC+1',
      'UTC+1.5'   => 'UTC+1:30',
      'UTC+2'     => 'UTC+2',
      'UTC+2.5'   => 'UTC+2:30',
      'UTC+3'     => 'UTC+3',
      'UTC+3.5'   => 'UTC+3:30',
      'UTC+4'     => 'UTC+4',
      'UTC+4.5'   => 'UTC+4:30',
      'UTC+5'     => 'UTC+5',
      'UTC+5.5'   => 'UTC+5:30',
      'UTC+5.75'  => 'UTC+5:45',
      'UTC+6'     => 'UTC+6',
      'UTC+6.5'   => 'UTC+6:30',
      'UTC+7'     => 'UTC+7',
      'UTC+7.5'   => 'UTC+7:30',
      'UTC+8'     => 'UTC+8',
      'UTC+8.5'   => 'UTC+8:30',
      'UTC+8.75'  => 'UTC+8:45',
      'UTC+9'     => 'UTC+9',
      'UTC+9.5'   => 'UTC+9:30',
      'UTC+10'    => 'UTC+10',
      'UTC+10.5'  => 'UTC+10:30',
      'UTC+11'    => 'UTC+11',
      'UTC+11.5'  => 'UTC+11:30',
      'UTC+12'    => 'UTC+12',
      'UTC+12.75' => 'UTC+12:45',
      'UTC+13'    => 'UTC+13',
      'UTC+13.75' => 'UTC+13:45',
      'UTC+14'    => 'UTC+14'
    );

    return array_merge($region_timezones, $utc_zones);
  }

  /**
   * Convert offset to PHP accepted timezone.
   *
   * @param string $offset UTC offset.
   * @return string timezone string.
   */
  public static function offset_to_timezone_string($offset) {
    if (false === strpos($offset, 'UTC')) {
      return $offset;
    }

    if ('UTC+0' === $offset || 'UTC-0' === $offset) {
      return 'UTC';
    }

    $offset = \MeprUtils::float_value(str_replace('UTC', '', strtoupper($offset)));
    if (empty($offset)) {
      return 'UTC';
    }
    $sign = ($offset < 0) ? '-' : '+';
    $abs_offset = abs($offset);
    $hours = floor($abs_offset);
    $minutes = round(($abs_offset - $hours) * 60);
    return sprintf('%s%02d:%02d', $sign, $hours, $minutes);
  }

  /**
   * Validate a given date string.
   *
   * @param string $date The date string to validate.
   * @return bool Returns true if valid, false otherwise.
   */
  public static function is_valid_date($date) {
    $timestamp = strtotime($date);
    return $timestamp !== false;
  }

  /**
   * Generate a string representation of the drip schedule.
   *
   * @param string $drip_type The type of drip ('daily', 'weekly', 'monthly').
   * @param int $number The number associated with the drip type.
   * @return string The drip schedule string.
   */
  public static function drip_schedule_str($drip_type, $number) {
    $drip_types = [
      'daily'   => _n('%s Day(s)', '%s Days', $number, 'memberpress-courses'),
      'weekly'  => _n('%s Week(s)', '%s Weeks', $number, 'memberpress-courses'),
      'monthly' => _n('%s Month(s)', '%s Months', $number, 'memberpress-courses')
    ];

    return isset($drip_types[$drip_type]) ? sprintf($drip_types[$drip_type], $number) : '';
  }

  public static function set_data($content_id, array $data) {
    self::$drip_track[$content_id] = $data;
  }

  public static function get_data($content_id) {
    return isset(self::$drip_track[$content_id]) ? self::$drip_track[$content_id] : array();
  }
}
