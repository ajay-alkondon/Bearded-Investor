<?php
namespace memberpress\courses\helpers;
if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

class Options {
  public static function val($options, $option_name, $default = '') {
    $value = isset($options[$option_name]) ? $options[$option_name] : $default;

    if('course_emails_from_name' === $option_name && empty($value)){
      $mepr_options = \MeprOptions::fetch();
      $value = $mepr_options->mail_send_from_name;
    }

    if('course_emails_from_email' === $option_name && empty($value)){
      $mepr_options = \MeprOptions::fetch();
      $value = $mepr_options->mail_send_from_email;
    }

    if('course_emails_from_email' === $option_name && empty($value)){
      $mepr_options = \MeprOptions::fetch();
      $value = $mepr_options->mail_send_from_email;
    }

    if('course_emails_admin_email' === $option_name && empty($value)){
      $mepr_options = \MeprOptions::fetch();
      $value = $mepr_options->admin_email_addresses;
    }

    if('course_emails_bkg_jobs' === $option_name && empty($value)){
      $value = get_option('mp-bkg-email-jobs-enabled', false);
    }

    return $value;
  }

  /**
   * Generates RGB from hex color
   *
   * @param  mixed $options
   * @param  mixed $option_key
   * @return array
   */
  public static function get_rgb($options, $option_key){
    $color = self::val($options, $option_key);
    $color = ltrim($color, '#');

    if(empty($color)){
      return array();
    }

    list($r, $g, $b) = array_map('hexdec', str_split($color, 2));
    return array($r, $g, $b);
  }
}
