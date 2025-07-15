<?php

namespace memberpress\courses\lib;

if (!defined('ABSPATH')) {
  die('You are not allowed to call this page directly.');
}

use memberpress\courses as base;
use memberpress\courses\lib;
use memberpress\courses\emails;

class EmailManager
{
  private $emails = [];

  /**
   * EmailManager constructor.
   */
  public function __construct()
  {
    // Initialize with core courses emails
    $this->register_email('admin_course_started_email', emails\AdminCourseStartedEmail::class);
    $this->register_email('admin_course_completed_email', emails\AdminCourseCompletedEmail::class);
    $this->register_email('admin_lesson_completed_email', emails\AdminLessonCompletedEmail::class);
    $this->register_email('user_course_completed_email', emails\UserCourseCompletedEmail::class);

    // Allow sub-addons to register their emails via hooks
    do_action('mpcs_register_addon_emails', $this);
  }

  /**
   * Register a new email notification.
   * @param string $key The unique key for this email.
   * @param string $email_class The class name of the email.
   * @return void
   */
  public function register_email($key, $email_class)
  {
    if (isset($this->emails[$key])) {
      throw new \Exception(sprintf(__('Email key %1$s is already registered', 'memberpress-courses'), $key));
    }

    if (is_subclass_of($email_class, lib\BaseEmail::class)) {
      $this->emails[$key] = $email_class;
    }
  }

  /**
   * Get all registered emails.
   */
  public static function get_emails()
  {
    $email_manager = new EmailManager();
    return $email_manager->instantiate_emails();
  }

  /**
   * Instantiate all registered email classes.
   */
  private function instantiate_emails()
  {
    $instances = [];
    foreach ($this->emails as $key => $email_class) {
      $email = self::fetch($email_class, [$key] );

      if(! $email instanceof lib\BaseEmail) {
        continue;
      }

      if(null === $email->key) {
        continue;
      }

      $instances[$key] = self::fetch($email_class, [$key] );
    }
    return $instances;
  }

  /**
   * Fetch an email object by class name.
   * @param string $class The class name of the email.
   * @param array $args The arguments to pass to the email constructor.
   * @param string $etype The expected type of the email object.
   * @return mixed
   * @throws \Exception
   */
  public static function fetch($class, $args = [], $etype = lib\BaseEmail::class)
  {
    $class = str_replace('\\\\', '\\', $class);

    if (!class_exists($class)) {
      throw new \Exception(__('Email wasn\'t found', 'memberpress-courses'));
    }

    $r = new \ReflectionClass($class);
    $obj = $r->newInstanceArgs($args);

    if (!($obj instanceof $etype)) {
      throw new \Exception(sprintf(__('Not a valid email object: %1$s is not an instance of %2$s', 'memberpress-courses'), $class, $etype));
    }

    return $obj;
  }

  /**
   * Fetch an email object by key.
   * @param string $key The key of the email.
   * @return mixed
   */
  public static function fetch_by_key($key)
  {
    $emails = self::get_emails();

    if(!isset($emails[$key])) {
      return null;
    }

    // if email is not subclass of BaseEmail, return null
    if(!is_subclass_of($emails[$key], lib\BaseEmail::class)) {
      return null;
    }

    return $emails[$key];
  }

  /**
   * Transform email objects into an array.
   * @param array $emails The email objects to transform.
   * @return array
   */
  public static function transform_email_objects($emails)
  {
    $transformed = [];

    foreach ($emails as $key => $email) {
      $entry = [
        'id' => $email->get_stored_field('id'),
        'key' => $key,
        'title' => $email->title,
        'status' => $email->enabled(),
        'subject' => $email->subject(),
        'body' => $email->body(),
        'type' => strpos($key, 'admin') !== false ? 'Admin' : 'User',
        'use_template' => $email->use_template(),
        'admin_url' => admin_url('admin.php?page=memberpress-courses-emails&action=edit&email=' . $key),
      ];

      $transformed[$key] = $entry;
    }

    return $transformed;
  }
}
