<?php
namespace memberpress\courses\emails;
use memberpress\courses\lib;
use memberpress\courses\helpers;
use memberpress\courses as base;

if (!defined('ABSPATH')) {
  die('You are not allowed to call this page directly.');
}

class AdminLessonCompletedEmail extends lib\BaseEmail
{
  public $key = 'admin_lesson_completed_email';

  /** Set the default enabled, title, subject & body */
  public function set_defaults($args = array())
  {
    $options = get_option('mpcs-options');
    $this->to = helpers\Options::val($options,'course_emails_admin_email');
    $this->title = esc_html__('Admin Lesson Completed Notice', 'memberpress-courses');
    $this->description = esc_html__('This email is sent to you when a user completes a lesson.', 'memberpress-courses');
    $this->ui_order = 0;

    $enabled = $use_template = $this->show_form = true;
    $subject = esc_html__('{$lesson_name} - A User Has Completed a Lesson', 'memberpress-courses');
    $body = $this->body_partial();

    $this->defaults = compact('enabled', 'subject', 'body', 'use_template');
    $this->variables = array_unique( array_merge(
      helpers\Courses::get_email_vars($this),
      helpers\Lessons::get_email_vars($this),
    ));
  }

}
