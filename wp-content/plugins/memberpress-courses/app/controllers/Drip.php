<?php
namespace memberpress\courses\controllers;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

use memberpress\courses as base;
use memberpress\courses\lib as lib;
use memberpress\courses\helpers as helpers;
use memberpress\courses\models as models;
use MeprUtils;

class Drip extends lib\BaseCtrl {

  private $already_run = false;

  /**
   * @var lib/Drip
   * */
  private $drip = null;

  /**
   * Constructor.
   * Hooks into the MemberPress access check.
   */
  public function load_hooks() {
    add_filter('template_include', array( $this, 'run_dripping'), 1);
    add_filter('mepr-last-chance-to-block-content', array($this,'maybe_block_content'), 99, 3);
    add_filter('mepr-unauthorized-content', array($this,'maybe_render_unauthorized_message'), 99, 3);
  }

  /**
   * Set drip content access.
   * @return void
   */
  public function run_dripping($template, $current_post = null, $user_id = 0) {

    if( true === $this->already_run ) {
      return $template;
    }

    $this->already_run = true; // To make sure we run this hook once.

    // Current post
    if ($current_post === null || ! is_object($current_post)) {
      $current_post = MeprUtils::get_current_post();
    }

    // User ID
    if (0 === $user_id || ! is_numeric($user_id)) {
      $user_id = MeprUtils::get_current_user_id();
    }

    // Sanitize the user ID.
    $user_id = absint($user_id);

    //This isn't a post or invalid user id? Just return the content, bail out.
    if($current_post === false || 0 === $user_id ) { return $template; }

    // Post ID
    $content_id = $current_post->ID;

    $cpts = models\Lesson::lesson_cpts();

    // Check the post type.
    if ( ! in_array( $current_post->post_type, $cpts, true ) ) {
        return $template; // Bail out if not a lesson or quiz.
    }

    $lesson  = new models\Lesson( $content_id );
    $course  = $lesson->course();
    $section = $lesson->section();

    if ( ! ( $course instanceof models\Course ) ) {
      return $template; // No Dripping - Bail out if course not found.
    }

    // Check if the dripping is enabled
    if ( ! isset( $course->dripping ) || 'enabled' !== (string) $course->dripping ) {
      return $template; // Bail out if dripping is not enabled for the course.
    }

    $frequency_type = isset($course->drip_frequency_type) ? $course->drip_frequency_type : '';
    $drip_type      = isset($course->drip_type) ? $course->drip_type : '';

    // List of WP Roles to bypass dripping
    $bypass_user_roles = apply_filters( 'mpcs_dripping_bypass_user_roles', array('administrator'), $course, $current_post );
    $role_can_bypass   = false;
    if( is_array($bypass_user_roles) && !empty($bypass_user_roles) ) {
      foreach ( $bypass_user_roles as $wp_role_slug ) {
        // Check if the current user's role is in the $bypass_user_roles array
        if ( user_can( $user_id, $wp_role_slug ) ) {
          $role_can_bypass = true;
          break;
        }
      }
    }

    // Bypass Dripping for a specific roles?
    $role_can_bypass = apply_filters( 'mpcs_dripping_can_roles_bypass', $role_can_bypass, $user_id, $course, $content_id, $current_post );
    if ( true === $role_can_bypass ) {
        return $template;
    }

    // Bypass Dripping for a specific User?
    $mpcs_dripping_bypass = apply_filters( 'mpcs_dripping_bypass', false, $user_id, $course, $current_post, $current_post );
    if( true === $mpcs_dripping_bypass ) {
      return $template;
    }

    // No Dripping is needed as Section is already completed.
    if( 'section' === $drip_type && models\UserProgress::has_completed_section($user_id, $section->id) ) {
      return $template;
    }

    // No Dripping is needed as Lesson/quiz is already completed.
    if( models\UserProgress::has_completed_lesson($user_id, $content_id) ) {
      return $template;
    }

    try {
      // For dependency injection.
      $date_calculator = lib\Drip\BaseDateFactory::create($frequency_type);
      $info_provider   = lib\Drip\ItemInfoProviderFactory::create($drip_type);

      // Create an instance of lib/Drip
      $this->drip = new lib\Drip($course, $user_id, $date_calculator, $info_provider);
      $item_info  = $this->drip->get_item_info($current_post, $lesson);

      if ( is_array($item_info) && !empty($item_info) && isset($item_info['current_index']) ) {

        if( 0 === $item_info['current_index'] ) {
          return $template; // bailout. No dripping needed for the first item.
        }

        // Calculate the available date for the item.
        $dripped_date_obj = $this->drip->calculate_available_date($item_info);
        if( false === $dripped_date_obj ) {
          return $template;
        }

        $is_content_available = $this->drip->is_available($dripped_date_obj);

        if ( ! $is_content_available ) {
          helpers\Drip::set_data($current_post->ID, array(
            'dripped_date_obj' => $dripped_date_obj,
            'is_content_blocked' => true
          ));
        }

      }
    } catch ( \Exception $ex ) {
      lib\Utils::debug_log("maybe_drip_content Exception: " . print_r($ex, true));
    }

    return $template;
  }

  public function maybe_block_content( $block_content, $current_post, $uri ) {
    $drip_data = helpers\Drip::get_data($current_post->ID);
    if( isset($drip_data['dripped_date_obj']) ) {
      return true; // block the content
    }

    return $block_content;
  }

  private function prepare_unauthmessage_tokens($dripped_date_obj, $course) {
    $timestamp = lib\Utils::db_date_to_ts($dripped_date_obj->format(get_option('date_format') . ' ' . get_option('time_format')));
    $dripped_date = date_i18n(__("F j, Y, g:i a", 'memberpress-courses'), $timestamp, true);

    $message_tokens = array();
    $message_tokens['mpcs_drip_date'] = $dripped_date;
    $message_tokens['mpcs_drip_amount'] = $course->drip_amount;
    $message_tokens['mpcs_drip_schedule'] = helpers\Drip::drip_schedule_str($course->drip_frequency, $course->drip_amount);
    $message_tokens['mpcs_drip_timezone'] = $course->drip_timezone;
    $message_tokens['mpcs_drip_time'] = $course->drip_time;
    $message_tokens['mpcs_item_type'] = $course->drip_type;

    return $message_tokens;
  }

  public function maybe_render_unauthorized_message($content, $post) {
    $drip_data = helpers\Drip::get_data($post->ID);

    if( empty($drip_data) ) {
      return $content; // Dripping is not applicable - bailout.
    }

    if( isset($drip_data['is_content_blocked']) && is_object($this->drip) && is_object($this->drip->get_course()) ) {
      $course  = $this->drip->get_course();
      $user_id = $this->drip->get_user_id();

      $message_tokens = $this->prepare_unauthmessage_tokens($drip_data['dripped_date_obj'], $course);

      $not_dripped_message = isset($course->not_dripped_message) ? $course->not_dripped_message : '';

      if( !empty($not_dripped_message) ) {
        // Replace the placeholders with actual values
        foreach ($message_tokens as $key => $value) {
          $not_dripped_message = str_replace("{" . $key . "}", $value, $not_dripped_message);
        }

        $content = wp_kses_post( $not_dripped_message );
        $content = apply_filters( 'mpcs_drip_unauthorized_message', $content, $user_id, $course, $post, $message_tokens );
      }

      return $content;
    }
  }
}
