<?php

namespace memberpress\courses\lib;

if (!defined('ABSPATH')) {
  die('You are not allowed to call this page directly.');
}

use memberpress\courses as base;
use memberpress\courses\controllers as ctrl;
use memberpress\courses\models;
use memberpress\courses\helpers;

class Utils
{
  public static function get_user_id_by_email($email)
  {
    if (isset($email) and !empty($email)) {
      global $wpdb;
      $query = "SELECT ID FROM {$wpdb->users} WHERE user_email=%s";
      $query = $wpdb->prepare($query, esc_sql($email));
      return (int)$wpdb->get_var($query);
    }

    return '';
  }

  public static function is_image($filename)
  {
    if (!file_exists($filename))
      return false;

    $file_meta = getimagesize($filename);

    $image_mimes = array("image/gif", "image/jpeg", "image/png");

    return in_array($file_meta['mime'], $image_mimes);
  }

  public static function is_curl_enabled()
  {
    return function_exists('curl_version');
  }

  public static function is_post_request()
  {
    return (strtolower($_SERVER['REQUEST_METHOD']) == 'post');
  }

  public static function base36_encode($base10)
  {
    return base_convert($base10, 10, 36);
  }

  public static function base36_decode($base36)
  {
    return base_convert($base36, 36, 10);
  }

  public static function is_date($str)
  {
    if (!is_string($str)) {
      return false;
    }
    $d = strtotime($str);
    return ($d !== false);
  }

  public static function is_ip($ip)
  {
    // return preg_match('#^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$#',$ip);
    return ((bool)filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) || (bool)filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6));
  }

  public static function is_url($str)
  {
    return preg_match('/https?:\/\/[\w-]+(\.[\w-]{2,})*(:\d{1,5})?/', $str);
  }

  public static function is_email($str)
  {
    return preg_match('/[\w\d._%+-]+@[\w\d.-]+\.[\w]{2,4}/', $str);
  }

  public static function is_phone($str)
  {
    return preg_match('/\(?\d{3}\)?[- ]\d{3}-\d{4}/', $str);
  }

  public static function get_delim($link)
  {
    return ((preg_match("#\?#", $link)) ? '&' : '?');
  }

  public static function http_status_codes()
  {
    return array(
      100 => 'Continue',
      101 => 'Switching Protocols',
      102 => 'Processing',
      200 => 'OK',
      201 => 'Created',
      202 => 'Accepted',
      203 => 'Non-Authoritative Information',
      204 => 'No Content',
      205 => 'Reset Content',
      206 => 'Partial Content',
      207 => 'Multi-Status',
      300 => 'Multiple Choices',
      301 => 'Moved Permanently',
      302 => 'Found',
      303 => 'See Other',
      304 => 'Not Modified',
      305 => 'Use Proxy',
      306 => 'Switch Proxy',
      307 => 'Temporary Redirect',
      400 => 'Bad Request',
      401 => 'Unauthorized',
      402 => 'Payment Required',
      403 => 'Forbidden',
      404 => 'Not Found',
      405 => 'Method Not Allowed',
      406 => 'Not Acceptable',
      407 => 'Proxy Authentication Required',
      408 => 'Request Timeout',
      409 => 'Conflict',
      410 => 'Gone',
      411 => 'Length Required',
      412 => 'Precondition Failed',
      413 => 'Request Entity Too Large',
      414 => 'Request-URI Too Long',
      415 => 'Unsupported Media Type',
      416 => 'Requested Range Not Satisfiable',
      417 => 'Expectation Failed',
      418 => 'I\'m a teapot',
      422 => 'Unprocessable Entity',
      423 => 'Locked',
      424 => 'Failed Dependency',
      425 => 'Unordered Collection',
      426 => 'Upgrade Required',
      449 => 'Retry With',
      450 => 'Blocked by Windows Parental Controls',
      500 => 'Internal Server Error',
      501 => 'Not Implemented',
      502 => 'Bad Gateway',
      503 => 'Service Unavailable',
      504 => 'Gateway Timeout',
      505 => 'HTTP Version Not Supported',
      506 => 'Variant Also Negotiates',
      507 => 'Insufficient Storage',
      509 => 'Bandwidth Limit Exceeded',
      510 => 'Not Extended'
    );
  }

  public static function exit_with_status($status, $message = '')
  {
    $codes = self::http_status_codes();
    header("HTTP/1.1 {$status} {$codes[$status]}", true, $status);
    exit($message);
  }

  public static function rewriting_on()
  {
    $permalink_structure = get_option('permalink_structure');

    return ($permalink_structure and !empty($permalink_structure));
  }

  // Returns a list of just user data from the wp_users table
  public static function get_raw_users($where = '', $order_by = 'user_login')
  {
    global $wpdb;

    static $raw_users;

    if (!isset($raw_users)) {
      $where    = ((empty($where)) ? '' : " WHERE {$where}");
      $order_by = ((empty($order_by)) ? '' : " ORDER BY {$order_by}");

      $query = "SELECT * FROM {$wpdb->users}{$where}{$order_by}";
      $raw_users = $wpdb->get_results($query);
    }

    return $raw_users;
  }

  public static function site_domain()
  {
    return preg_replace('#^https?://(www\.)?([^\?\/]*)#', '$2', home_url());
  }

  public static function is_logged_in_and_current_user($user_id)
  {
    $current_user = Utils::get_currentuserinfo();

    return (Utils::is_user_logged_in() and ($current_user->ID == $user_id));
  }

  public static function is_logged_in_and_an_admin()
  {
    return (Utils::is_user_logged_in() and Utils::is_admin());
  }

  public static function is_logged_in_and_a_subscriber()
  {
    return (Utils::is_user_logged_in() and Utils::is_subscriber());
  }

  public static function is_admin()
  {
    return current_user_can('administrator');
  }

  public static function is_subscriber()
  {
    return (current_user_can('subscriber') and !current_user_can('contributor'));
  }

  public static function array_to_string($my_array, $debug = false, $level = 0)
  {
    return self::object_to_string($my_array);
  }

  public static function object_to_string($object)
  {
    return print_r($object, true);
  }

  public static function replace_text_variables($text, $variables)
  {
    $patterns = array();
    $replacements = array();

    foreach ($variables as $var_key => $var_val) {
      $patterns[] = '/\{\$' . preg_quote($var_key, '/') . '\}/';
      $replacements[] = preg_replace('/\$/', '\\\$', $var_val); // $'s must be escaped for some reason
    }

    $preliminary_text = preg_replace($patterns, $replacements, $text);

    // Clean up any failed matches
    return preg_replace('/\{\$.*?\}/', '', $preliminary_text);
  }

  public static function with_default($variable, $default)
  {
    if (isset($variable)) {
      if (is_numeric($variable))
        return $variable;
      elseif (!empty($variable))
        return $variable;
    }

    return $default;
  }

  public static function format_float($number, $num_decimals = 2)
  {
    return number_format((float)$number, $num_decimals, '.', '');
  }

  public static function is_subdir_install()
  {
    return preg_match('#^https?://[^/]+/.+$#', home_url());
  }

  public static function get_pages()
  {
    global $wpdb;

    $query = "SELECT * FROM {$wpdb->posts} WHERE post_status=%s AND post_type=%s";

    $query = $wpdb->prepare($query, "publish", "page");

    $results = $wpdb->get_results($query);

    if ($results) {
      return $results;
    } else {
      return array();
    }
  }

  /**
   * Formats a line (passed as a fields array) as CSV and returns the CSV as a string.
   * Adapted from http://us3.php.net/manual/en/function.fputcsv.php#87120
   */
  public static function to_csv(
    $struct,
    $delimiter = ',',
    $enclosure = '"',
    $enclose_all = false,
    $null_to_mysql_null = false
  ) {
    $delimiter_esc = preg_quote($delimiter, '/');
    $enclosure_esc = preg_quote($enclosure, '/');

    $csv = '';
    $line_num = 0;

    if ((!is_array($struct) and !is_object($struct)) or empty($struct)) {
      return $csv;
    }

    foreach ($struct as $line) {
      $output = array();

      foreach ($line as $field) {
        if (is_null($field) and $null_to_mysql_null) {
          $output[] = 'NULL';
          continue;
        }

        // Enclose fields containing $delimiter, $enclosure or whitespace
        if ($enclose_all or preg_match("/(?:{$delimiter_esc}|{$enclosure_esc}|\s)/", $field))
          $output[] = $enclosure . str_replace($enclosure, $enclosure . $enclosure, $field) . $enclosure;
        else
          $output[] = $field;
      }

      $csv .= implode($delimiter, $output) . "\n";
      $line_num++;
    }

    return $csv;
  }

  public static function random_string($length = 10, $lowercase = true, $uppercase = false, $symbols = false)
  {
    $characters = '0123456789';
    $characters .= $uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '';
    $characters .= $lowercase ? 'abcdefghijklmnopqrstuvwxyz' : '';
    $characters .= $symbols ? '@#*^%$&!' : '';
    $string = '';
    $max_index = strlen($characters) - 1;

    for ($p = 0; $p < $length; $p++)
      $string .= $characters[mt_rand(0, $max_index)];

    return $string;
  }

  /* Keys to indexes, indexes to keys ... do it! */
  public static function array_invert($invertable)
  {
    $inverted = array();

    foreach ($invertable as $key => $orray) {
      foreach ($orray as $index => $value) {
        if (!isset($inverted[$index])) {
          $inverted[$index] = array();
        }
        $inverted[$index][$key] = $value;
      }
    }

    return $inverted;
  }

  public static function blogurl()
  {
    return ((get_option('home')) ? get_option('home') : get_option('siteurl'));
  }

  public static function siteurl()
  {
    return get_option('siteurl');
  }

  public static function blogname()
  {
    return get_option('blogname');
  }

  public static function blogdescription()
  {
    return get_option('blogdescription');
  }

  public static function db_date_to_ts($mysql_date)
  {
    return strtotime($mysql_date);
  }

  public static function ts_to_mysql_date($ts, $format = 'Y-m-d H:i:s')
  {
    return gmdate($format, $ts);
  }

  public static function db_now($format = 'Y-m-d H:i:s')
  {
    return self::ts_to_mysql_date(time(), $format);
  }

  public static function db_lifetime()
  {
    return '0000-00-00 00:00:00';
  }

  public static function error_log($error)
  {
    if (is_array($error) || is_object($error)) {
      $error = json_encode($error);
    }

    error_log(sprintf(__("*** MemberPress Courses Error\n==========\n%s\n==========\n", 'memberpress-courses'), $error));
  }

  public static function debug_log($message)
  {
    if (is_array($message) || is_object($message)) {
      $message = json_encode($message);
    }

    //Getting some complaints about using WP_DEBUG here
    if (defined('WP_MPCS_DEBUG') && WP_MPCS_DEBUG) {
      error_log(sprintf(__('*** MemberPress Courses Debug: %s', 'memberpress-courses'), $message));
    }
  }

  public static function filter_array_keys($sarray, $keys)
  {
    $rarray = array();
    foreach ($sarray as $key => $value) {
      if (in_array($key, $keys)) {
        $rarray[$key] = $value;
      }
    }
    return $rarray;
  }

  public static function get_property($className, $property)
  {
    if (!class_exists($className)) {
      return null;
    }
    if (!property_exists($className, $property)) {
      return null;
    }

    $vars = get_class_vars($className);

    return $vars[$property];
  }

  public static function get_static_property($className, $property)
  {
    $r = new \ReflectionClass($className);
    return $r->getStaticPropertyValue($property);
  }

  public static function is_associative_array($arr)
  {
    return array_keys($arr) !== range(0, count($arr) - 1);
  }

  public static function protocol()
  {
    if (
      is_ssl() ||
      (defined('MEPR_SECURE_PROXY') && //USER must define this in wp-config.php if they're doing HTTPS between the proxy
        isset($_SERVER['HTTP_X_FORWARDED_PROTO']) &&
        strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) == 'https')
    ) {
      return 'https';
    } else {
      return 'http';
    }
  }

  public static function is_ssl()
  {
    return (self::protocol() === 'https');
  }

  // Special handling for protocol
  public static function get_permalink($id = 0, $leavename = false)
  {
    $permalink = get_permalink($id, $leavename);

    if (self::is_ssl()) {
      $permalink = preg_replace('!^https?://!', 'https://', $permalink);
    }

    return $permalink;
  }

  public static function base_class_name($class)
  {
    if (preg_match('/([^\\\]*)$/', $class, $m)) {
      return $m[1];
    } else {
      return '';
    }
  }

  public static function snakecase($str, $delim = '_')
  {
    // Search for '_-' then just lowercase and ensure correct delim
    if (preg_match('/[-_]/', $str)) {
      $str = preg_replace('/[-_]/', $delim, $str);
    } else { // assume camel case
      $str = preg_replace('/([A-Z])/', $delim . '$1', $str);
      $str = preg_replace('/^' . preg_quote($delim) . '/', '', $str);
    }

    return strtolower($str);
  }

  public static function model_for_controller(BaseCtrl $ctrl)
  {
    $ctrl_class = \get_class($ctrl);
    $ctrl_name = self::base_class_name($ctrl_class);
    $model_name = Inflector::singularize($ctrl_name);
    $model_class = base\MODELS_NAMESPACE . "\\{$model_name}";

    if (class_exists($model_class)) {
      return $model_class;
    }

    return false;
  }

  public static function controller_for_model(BaseModel $model)
  {
    $model_class = \get_class($model);
    $model_name = self::base_class_name($model_class);
    $ctrl_name = Inflector::pluralize($model_name);
    $ctrl_class = base\CTRLS_NAMESPACE . "\\{$ctrl_name}";

    if (class_exists($ctrl_class)) {
      return $ctrl_class;
    }

    return false;
  }

  /* PLUGGABLE FUNCTIONS AS TO NOT STEP ON OTHER PLUGINS' CODE */
  public static function get_currentuserinfo()
  {
    Utils::_include_pluggables('wp_get_current_user');
    $current_user = \wp_get_current_user();

    if (isset($current_user->ID) && $current_user->ID > 0)
      return new \WP_User($current_user->ID);
    else
      return false;
  }

  public static function get_userdata($id)
  {
    Utils::_include_pluggables('get_userdata');
    $data = get_userdata($id);
    // Handle the returned object for wordpress > 3.2
    if (!empty($data->data)) {
      return $data->data;
    }
    return $data;
  }

  public static function get_user_by($field, $value)
  {
    self::_include_pluggables('get_user_by');
    return get_user_by($field, $value);
  }

  public static function get_userdatabylogin($screenname)
  {
    Utils::_include_pluggables('get_user_by');
    $data = get_user_by('login', $screenname);
    //$data = get_userdatabylogin($screenname);
    // Handle the returned object for wordpress > 3.2
    if (isset($data->data) and !empty($data->data)) {
      return $data->data;
    }
    return $data;
  }

  public static function get_user_admin_capability()
  {
    return apply_filters(base\SLUG_KEY . '-admin-capability', 'remove_users');
  }

  public static function is_user_admin($user_id = null)
  {
    $cap = self::get_user_admin_capability();

    if (empty($user_id)) {
      return self::current_user_can($cap);
    } else {
      return user_can($user_id, $cap);
    }
  }

  public static function current_user_can($role)
  {
    self::_include_pluggables('wp_get_current_user');
    return current_user_can($role);
  }

  public static function minutes($n = 1)
  {
    return $n * 60;
  }

  public static function hours($n = 1)
  {
    return $n * self::minutes(60);
  }

  public static function days($n = 1)
  {
    return $n * self::hours(24);
  }

  public static function weeks($n = 1)
  {
    return $n * self::days(7);
  }

  public static function months($n, $month_timestamp = false, $backwards = false)
  {
    $month_timestamp = empty($month_timestamp) ? time() : $month_timestamp;
    $seconds = 0;

    // If backward we start in the previous month
    if ($backwards) {
      $month_timestamp -= self::days((int)date('t', $month_timestamp));
    }

    for ($i = 0; $i < $n; $i++) {
      $month_seconds = self::days((int)date('t', $month_timestamp));
      $seconds += $month_seconds;

      // We want the months going into the past
      if ($backwards) {
        $month_timestamp -= $month_seconds;
      } else { // We want the months going into the past
        $month_timestamp += $month_seconds;
      }
    }

    return $seconds;
  }

  public static function years($n, $year_timestamp = false, $backwards = false)
  {
    $year_timestamp = empty($year_timestamp) ? time() : $year_timestamp;
    $seconds = 0;

    // If backward we start in the previous year
    if ($backwards) {
      $year_timestamp -= self::days((int)date('t', $year_timestamp));
    }

    for ($i = 0; $i < $n; $i++) {
      $seconds += $year_seconds = self::days(365 + (int)date('L', $year_timestamp));
      // We want the years going into the past
      if ($backwards) {
        $year_timestamp -= $year_seconds;
      } else { // We want the years going into the past
        $year_timestamp += $year_seconds;
      }
    }

    return $seconds;
  }

  public static function wp_mail($recipient, $subject, $message, $header)
  {
    Utils::_include_pluggables('wp_mail');

    //Let's get rid of the pretty TO's -- causing too many problems
    //mbstring?
    if (extension_loaded('mbstring')) {
      if (mb_strpos($recipient, '<') !== false) {
        $recipient = mb_substr($recipient, (mb_strpos($recipient, '<') + 1), -1);
      }
    } else {
      if (strpos($recipient, '<') !== false) {
        $recipient = substr($recipient, (strpos($recipient, '<') + 1), -1);
      }
    }

    return \wp_mail($recipient, $subject, $message, $header);
  }

  public static function is_user_logged_in()
  {
    Utils::_include_pluggables('is_user_logged_in');
    return is_user_logged_in();
  }

  public static function get_avatar($id, $size)
  {
    Utils::_include_pluggables('get_avatar');
    return get_avatar($id, $size);
  }

  public static function wp_hash_password($password_str)
  {
    Utils::_include_pluggables('wp_hash_password');
    return \wp_hash_password($password_str);
  }

  public static function wp_generate_password($length, $special_chars)
  {
    Utils::_include_pluggables('wp_generate_password');
    return \wp_generate_password($length, $special_chars);
  }

  public static function wp_redirect($location, $status = 302)
  {
    Utils::_include_pluggables('wp_redirect');
    return \wp_redirect($location, $status);
  }

  public static function wp_salt($scheme = 'auth')
  {
    Utils::_include_pluggables('wp_salt');
    return \wp_salt($scheme);
  }

  public static function check_ajax_referer($slug, $param)
  {
    self::_include_pluggables('check_ajax_referer');
    return check_ajax_referer($slug, $param);
  }

  public static function check_admin_referer($slug, $param)
  {
    self::_include_pluggables('check_admin_referer');
    return check_admin_referer($slug, $param);
  }

  public static function _include_pluggables($function_name)
  {
    if (!function_exists($function_name)) {
      require_once(ABSPATH . WPINC . '/pluggable.php');
    }
  }

  /**
   * Get the user's full name
   *
   * @param int $user_id
   * @return string
   */
  public static function get_full_name($user_id)
  {
    $user = get_userdata($user_id);

    if (!$user) {
      return ''; // Return empty string if the user is not found
    }

    $first_name = get_user_meta($user_id, 'first_name', true);
    $last_name = get_user_meta($user_id, 'last_name', true);
    $name = '';

    if (!empty($first_name)) {
      $name = $first_name;
    }

    if (!empty($last_name)) {
      if (empty($name)) {
        $name = $last_name;
      } else {
        $name .= " {$last_name}";
      }
    }

    if (empty(trim($name))) {
      $name = $user->display_name;
    }

    if (empty($name)) {
      $name = $user->user_login;
    }

    return $name;
  }

  public static function get_user_formatted_email($user)
  {
    return str_replace(',', '', self::get_full_name($user->ID)) . " <{$user->user_email}>";
  }

  /**
   * Get the number of items per page for the current screen
   *
   * @param string $fallback The fallback usermeta meta_key if the current screen is null (e.g. when exporting)
   * @return int
   */
  public static function get_per_page_screen_option($fallback = null)
  {
    $screen = get_current_screen();

    if ($screen instanceof \WP_Screen) {
      $per_page = get_user_meta(
        get_current_user_id(),
        $screen->get_option('per_page', 'option'),
        true
      );

      if (is_numeric($per_page)) {
        $per_page = (int) $per_page;

        if ($per_page >= 1 && $per_page <= 999) {
          return $per_page;
        }
      }

      return $screen->get_option('per_page', 'default');
    } elseif ($fallback) {
      $per_page = (int) get_user_meta(get_current_user_id(), $fallback, true);

      if ($per_page >= 1 && $per_page <= 999) {
        return $per_page;
      }
    }

    return 10;
  }

  /**
   * Ensure the given number $x is between $min and $max inclusive
   *
   * @param   mixed  $x
   * @param   mixed  $min
   * @param   mixed  $max
   * @return  mixed
   */
  public static function clamp($x, $min, $max)
  {
    return min(max($x, $min), $max);
  }

  /**
   * Get the full name, first name or username depending on what's not empty
   *
   * @param string $first_name
   * @param string $last_name
   * @param string $user_login
   * @return string
   */
  public static function name_or_username($first_name, $last_name, $user_login)
  {
    $name = [];

    if (!empty($first_name)) {
      $name[] = $first_name;

      if (!empty($last_name)) {
        $name[] = $last_name;
      }
    }

    if (!empty($name)) {
      return join(' ', $name);
    }

    return $user_login;
  }

  /**
   * Get the date format from the WP settings
   *
   * @return string
   */
  public static function get_date_format()
  {
    $date_format = get_option('date_format');

    if (empty($date_format)) {
      $date_format = 'm/d/Y';
    }

    return $date_format;
  }

  /**
   * Get the time format from the WP settings
   *
   * @return string
   */
  public static function get_time_format()
  {
    $time_format = get_option('time_format');

    if (empty($time_format)) {
      $time_format = 'H:i';
    }

    return $time_format;
  }

  /**
   * Formats and translates the given date string and converts to the configured WP timezone
   *
   * @param string        $date     The date to format
   * @param string        $format   The date format, leave blank to use the WP date format
   * @param \DateTimeZone $timezone The timezone of the returned date, will default to the WP timezone if omitted
   * @return string|false           The formatted date or false if there was an error
   */
  public static function format_date($date, $format = '', \DateTimeZone $timezone = null)
  {
    try {
      if (empty($format)) {
        $format = self::get_date_format();
      }

      return self::date($format, new \DateTime($date), $timezone);
    } catch (\Exception $e) {
      return false;
    }
  }

  /**
   * Converts the given date string to a time string in the configured WP timezone
   *
   * @param string        $date   The date to format
   * @return string|false         The formatted date or false if there was an error
   */
  public static function format_time($date)
  {
    return self::format_date($date, self::get_time_format());
  }

  /**
   * Converts the given date string to a datetime string in the configured WP timezone
   *
   * @param string        $date   The date to format
   * @return string|false         The formatted date or false if there was an error
   */
  public static function format_datetime($date)
  {
    return self::format_date($date, self::get_date_format() . ' ' . self::get_time_format());
  }

  /**
   * Formats and translates a date or time
   *
   * @param string                  $format   The format of the returned date
   * @param \DateTimeInterface|null $date     The DateTime or DateTimeImmutable instance representing the moment of time in UTC, or null to use the current time
   * @param \DateTimeZone|null      $timezone The timezone of the returned date, will default to the WP timezone if omitted
   * @return string|false                     The formatted date or false if there was an error
   */
  public static function date($format, \DateTimeInterface $date = null, \DateTimeZone $timezone = null)
  {
    if (!$date) {
      $date = date_create('@' . time());

      if (!$date) {
        return false;
      }
    }

    $timestamp = $date->getTimestamp();

    if ($timestamp === false || !function_exists('wp_date')) {
      $timezone = $timezone ? $timezone : self::get_timezone();
      $date->setTimezone($timezone);

      return $date->format($format);
    }

    return wp_date($format, $timestamp, $timezone);
  }

  /**
   * Get the WP timezone as a DateTimeZone instance
   *
   * Duplicate of wp_timezone() for WP <5.3.
   *
   * @return \DateTimeZone
   */
  public static function get_timezone()
  {
    if (function_exists('wp_timezone')) {
      return wp_timezone();
    }

    $timezone_string = get_option('timezone_string');

    if ($timezone_string) {
      return new \DateTimeZone($timezone_string);
    }

    $offset  = (float) get_option('gmt_offset');
    $hours   = (int) $offset;
    $minutes = ($offset - $hours);

    $sign      = ($offset < 0) ? '-' : '+';
    $abs_hour  = abs($hours);
    $abs_mins  = abs($minutes * 60);
    $tz_offset = sprintf('%s%02d:%02d', $sign, $abs_hour, $abs_mins);

    return new \DateTimeZone($tz_offset);
  }

  /**
   * Validate an admin Ajax request
   *
   * Sends a JSON error response if validation fails
   *
   * @param string|null $nonce_action Optional nonce action to verify
   */
  public static function validate_admin_ajax_post_request($nonce_action = null)
  {
    if (!self::is_post_request()) {
      wp_send_json_error(__('Bad request', 'memberpress-courses'));
    }

    if (!self::is_logged_in_and_an_admin()) {
      wp_send_json_error(__('Insufficient permissions', 'memberpress-courses'));
    }

    if (is_string($nonce_action) && !check_ajax_referer($nonce_action, false, false)) {
      wp_send_json_error(__('Security check failed', 'memberpress-courses'));
    }
  }

  /**
   * Convert the given string to lowercase.
   *
   * Uses mb_strtolower() if available.
   *
   * @param string $string
   * @return string
   */
  public static function strtolower($string)
  {
    if (function_exists('mb_strtolower')) {
      return mb_strtolower($string);
    }

    return strtolower($string);
  }


  /**
   * Convert the given string to uppercase.
   *
   * Uses mb_strtoupper() if available.
   *
   * @param string $string
   * @return string
   */
  public static function count_characters($text)
  {
    $text = str_replace(array("\r", "\n"), '', $text);
    $charCount = mb_strlen($text);
    return $charCount;
  }

  /**
   * Can the current user view the given course?
   *
   * @param models\Course $course
   * @return boolean
   */
  public static function user_can_view_course(models\Course $course)
  {
    return apply_filters(
      'mpcs_user_can_view_course',
      is_user_logged_in() ? current_user_can('read_post', $course->ID) : $course->post_status == 'publish',
      $course
    );
  }

  /**
   * Convert to plain text
   *
   * @param string $text
   * @return string
   */
  public static function convert_to_plain_text($text)
  {
    $text = preg_replace('~<style[^>]*>[^<]*</style>~', '', $text);
    $text = strip_tags($text);
    $text = trim($text);
    $text = preg_replace("~\r~", '', $text); // Make sure we're only dealint with \n's here
    $text = preg_replace("~\n\n+~", "\n\n", $text); // reduce 1 or more blank lines to 1

    return $text;
  }


  // Drop in replacement for evil eval
  public static function replace_vals($content, $params, $start_token = "\\{\\$", $end_token = "\\}")
  {
    if (!is_array($params)) {
      return $content;
    }

    $callback = function ($k) use ($start_token, $end_token) {
      $k = preg_quote($k, "/");
      return "/{$start_token}" . "[^\W_]*{$k}[^\W_]*" . "{$end_token}/";
    };
    $patterns = array_map($callback, array_keys($params));
    $replacements = array_values($params);

    //Make sure all replacements can be converted to a string yo
    foreach ($replacements as $i => $val) {
      // The method_exists below causes a fatal error for incomplete classes
      if ($val instanceof \__PHP_Incomplete_Class) {
        $replacements[$i] = '';
        continue;
      }

      //Numbers and strings and objects with __toString are fine as is
      if (is_string($val) || is_numeric($val) || (is_object($val) && method_exists($val, '__toString'))) {
        continue;
      }

      //Datetime's
      if ($val instanceof \DateTime && isset($val->date)) {
        $replacements[$i] = $val->date;
        continue;
      }

      //If we made it here ???
      $replacements[$i] = '';
    }

    $result = preg_replace($patterns, $replacements, $content);

    // Remove unreplaced tags
    return preg_replace('({\$.*?})', '', $result);
  }

  /**
   * Send email notices for courses
   *
   * @param object $obj
   * @param string|null $user_class
   * @param string|null $admin_class
   * @param bool $force
   */
  public static function send_notices($obj, $user_class = null, $admin_class = null, $force = false)
  {
    $is_attempt = $obj instanceof \memberpress\quizzes\models\Attempt;
    $is_submission = $obj instanceof \memberpress\assignments\models\Submission;

    if ($obj instanceof models\Course) {
      $params = helpers\Courses::get_email_params($obj);
    } elseif ($obj instanceof models\Lesson) {
      $course = $obj->course();
      $params = array_merge(
        helpers\Lessons::get_email_params($obj),
        helpers\Courses::get_email_params($course)
      );
    } elseif( $is_attempt ){
      $quiz = $obj->quiz();
      $course = $quiz->course();
      $params = array_merge(
        helpers\Lessons::get_email_params($quiz, $obj),
        helpers\Courses::get_email_params($course)
      );
    } elseif( $is_submission ){
      $assignment = $obj->assignment();
      $course = $assignment->course();
      $params = array_merge(
        helpers\Lessons::get_email_params($assignment, $obj),
        helpers\Courses::get_email_params($course)
      );
    } else {
      return false;
    }

    $usr = self::get_currentuserinfo();
    $disable_email = apply_filters('mpcs_send_email_disable', false, $obj, $user_class, $admin_class);

    try {
      if (!is_null($user_class) && false == $disable_email) {
        $uemail = EmailManager::fetch($user_class);
        $uemail->to = self::get_user_formatted_email($usr);

        if( ( $is_attempt || $is_submission ) && method_exists($obj, 'user') ){
          $usr = $obj->user();
          $uemail->to = self::get_user_formatted_email($usr);
        }

        if ($force) {
          $uemail->send($params);
        } else {
          $uemail->send_if_enabled($params);
        }
      }

      if (!is_null($admin_class) && false == $disable_email) {
        $aemail = EmailManager::fetch($admin_class);

        if ($force) {
          $aemail->send($params);
        } else {
          $aemail->send_if_enabled($params);
        }
      }
    } catch (\Exception $e) {
      // Log the error
      Utils::error_log($e->getMessage());
    }
  }

  /**
   * Sanitize multiple emails
   *
   * @param string $emails Comma separated list of emails
   * @return string
   */
  public static function sanitize_multiple_emails($emails) : string
  {
    if (empty($emails)) {
      return '';
    }

    $email_list = array_map('trim', explode(',', $emails));
    $sanitized_emails = array();

    foreach ($email_list as $email) {
      $sanitized_email = sanitize_email($email);
      if (is_email($sanitized_email)) {
        $sanitized_emails[] = $sanitized_email;
      }
    }

    return implode(', ', $sanitized_emails);
  }
}
