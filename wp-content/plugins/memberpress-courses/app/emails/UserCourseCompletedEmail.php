<?php
namespace memberpress\courses\emails;
use memberpress\courses\lib;
use memberpress\courses\helpers;
use memberpress\courses as base;

if (!defined('ABSPATH')) {
  die('You are not allowed to call this page directly.');
}

class UserCourseCompletedEmail extends lib\BaseEmail
{
  public $key = 'user_course_completed_email';

  /** Set the default enabled, title, subject & body */
  public function set_defaults($args = array())
  {
    $this->title = esc_html__('Course Completion Notice', 'memberpress-courses');
    $this->description = esc_html__('This email is sent to the user when they successfully complete a course.', 'memberpress-courses');
    $this->ui_order = 0;

    $enabled = $use_template = $this->show_form = true;
    $subject = esc_html__('Course Completed: {$course_name}', 'memberpress-courses');
    $body = $this->body_partial();

    $this->defaults = compact('enabled', 'subject', 'body', 'use_template');
    $this->variables = array_unique( helpers\Courses::get_email_vars($this) );
  }
}
