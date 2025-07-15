<?php

namespace memberpress\courses\jobs;

use memberpress\courses\GroundLevel\Resque\Models\Job;
use memberpress\courses\lib\EmailManager;

class EmailJob extends Job
{

  protected function perform(): void
  {
    // Maybe save something in the args (payload).
    $args = json_decode($this->getAttribute('args'), true);

    if (!isset($args['class']) || empty($args['class'])) {
      throw new \Exception(__('"class" cannot be blank', 'memberpress-courses'));
    }

    if (!isset($args['to']) || empty($args['to'])) {
      throw new \Exception(__('"to" cannot be blank', 'memberpress-courses'));
    }

    if (!isset($args['values'])) {
      $this->values = null;
    }

    if (!isset($args['subject'])) {
      $args['subject'] = null;
    }

    if (!isset($args['body'])) {
      $args['body'] = null;
    }

    if (!isset($args['use_template'])) {
      $args['use_template'] = null;
    }

    if (!isset($args['content_type'])) {
      $args['content_type'] = null;
    }

    if (!isset($args['headers'])) {
      $args['headers'] = null;
    }

    $email = EmailManager::fetch($args['class']);
    // error_log($args['values']);

    $email->to = $args['to'];
    $email->send(
      $args['values'],
      $args['subject'],
      $args['body'],
      $args['use_template'],
      $args['content_type']
    );
  }

  public function onComplete()
  {
    // Do something when the job is completed.
  }

  public function onFail()
  {
    // Do something when the job fails.
  }

  public function onRetry()
  {
    // Do something when the job is retried.
  }
}
