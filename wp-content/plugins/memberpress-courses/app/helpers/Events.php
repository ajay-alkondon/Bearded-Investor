<?php
namespace memberpress\courses\helpers;

if ( ! defined( 'ABSPATH' ) ) {
  die( 'You are not allowed to call this page directly.' );}

use memberpress\courses\lib;
use memberpress\courses\models;
use memberpress\courses\emails;
use memberpress\quizzes\models as quizmodels;
use memberpress\courses\helpers;

class Events {

  /**
   * Extends member object for courses event.
   *
   * @param false $data Initially false, returning any non-false value will use the returned value.
   * @param array $mbr The member data.
   * @return array|false Returns false, or the modified member data.
   */
  public static function mpdt_member_extend_object( $data, $mbr ) {

    if ( ! isset( $mbr['event_args'] ) ) {
      return $data;
    }

    if ( ! is_array( $mbr['event_args'] ) ) {
      return $data;
    }

    if ( 0 === (int) $mbr['event_args']['event_id'] ) {
      return self::get_dummy_event_data( $mbr );
    } else {
      return self::get_event_data( $mbr );
    }
  }

  private static function get_dummy_event_data( $mbr ) {
    $event_args = $mbr['event_args'];

    if ( strstr( $event_args['event'], 'mpca-quiz' ) ) {

      $mbr['attempt'] = array(
        'id'              => 999999,
        'attempt_no'      => 1,
        'points_possible' => 100,
        'points_scored'   => 0,
        'score'           => '0%',
        'date_attempt'    => '0000-00-00 00:00',
      );

      $mbr['course'] = array(
        'id'        => 999999,
        'title'     => 'Test X',
        'started'   => '0000-00-00 00:00',
        'completed' => '0000-00-00 00:00',
      );

      $mbr['quiz'] = array(
        'id'    => 999999,
        'title' => 'Test Z',
      );
      return $mbr;
    } elseif ( strstr( $event_args['event'], 'mpca-lesson' ) ) {
      $mbr['course'] = array(
        'id'        => 999999,
        'title'     => 'Test X',
        'started'   => '0000-00-00 00:00',
        'completed' => '0000-00-00 00:00',
      );

      $mbr['lesson'] = array(
        'id'        => 999999,
        'title'     => 'Test Y',
        'started'   => '0000-00-00 00:00',
        'completed' => '0000-00-00 00:00',
      );
      return $mbr;
    } elseif ( strstr( $event_args['event'], 'mpca-course' ) ) {
      $mbr['course'] = array(
        'id'        => 999999,
        'title'     => 'Test Z',
        'started'   => '0000-00-00 00:00',
        'completed' => '0000-00-00 00:00',
      );
      return $mbr;
    }

    return false;
  }

  private static function get_event_data( $mbr ) {

    $found = false;

    // prepare course data
    if ( isset( $mbr['event_args']['course_id'] ) ) {
      $found     = true;
      $course_id = (int) $mbr['event_args']['course_id'];
      if ( $course_id > 0 ) {
        $course = get_post( $course_id );
        if ( $course ) {
          $mbr['course'] = array(
            'id'        => $course->ID,
            'title'     => $course->post_title,
            'started'   => self::get_course_start_date( $course_id, $mbr['id'] ),
            'completed' => self::get_course_completion_date( $course_id, $mbr['id'] ),
          );
        }
      }
    }

    // prepare lesson data
    if ( isset( $mbr['event_args']['lesson_id'] ) ) {
      $found     = true;
      $lesson_id = (int) $mbr['event_args']['lesson_id'];
      if ( $lesson_id > 0 ) {
        $lesson = get_post( $lesson_id );
        if ( $lesson ) {

          $model_lesson = new models\Lesson( $lesson->ID );
          $course       = $model_lesson->course();
          if ( $course ) {
            $mbr['course'] = array(
              'id'        => $course->ID,
              'title'     => $course->post_title,
              'started'   => self::get_course_start_date( $course->ID, $mbr['id'] ),
              'completed' => self::get_course_completion_date( $course->ID, $mbr['id'] ),
            );
          }

          $mbr['lesson'] = array(
            'id'        => $lesson->ID,
            'title'     => $lesson->post_title,
            'started'   => self::get_lesson_start_date( $lesson->ID, $mbr['id'] ),
            'completed' => self::get_lesson_completion_date( $lesson->ID, $mbr['id'] ),
          );
        }
      }
    }

    // prepare quiz data
    if ( isset( $mbr['event_args']['attempt_id'] ) && helpers\App::is_quizzes_addon_active() ) {
      $found      = true;
      $mbr = apply_filters( 'mpcs-mpdt-event-data', $mbr );

      $attempt_id = (int) $mbr['event_args']['attempt_id'];
      $attempt    = quizmodels\Attempt::find( $attempt_id );
      if ( $attempt instanceof quizmodels\Attempt ) {
        $attempted_quiz = $attempt->quiz();
        $quiz           = get_post( $attempted_quiz->ID );
        if ( $quiz ) {
          $mbr['attempt'] = array(
            'id'              => $attempt->id,
            'attempt_no'      => 1,
            'points_possible' => $attempt->points_possible,
            'points_scored'   => $attempt->points_awarded,
            'score'           => $attempt->score . '%',
            'date_attempt'    => $attempt->finished_at,
          );

          $model_course = $attempted_quiz->course();
          if ( $model_course ) {
            $mbr['course'] = array(
              'id'        => $model_course->ID,
              'title'     => $model_course->post_title,
              'started'   => self::get_course_start_date( $model_course->ID, $mbr['id'] ),
              'completed' => self::get_course_completion_date( $model_course->ID, $mbr['id'] ),
            );
          }

          $mbr['quiz'] = array(
            'id'    => $quiz->ID,
            'title' => $quiz->post_title,
          );
        }
      }
    }

    if ( $found ) {
      return $mbr;
    } else {
      return false;
    }
  }

  /**
   * Processes json and returns the extended and clean data.
   *
   * @param array $mbr
   * @return array
   */
  public static function mpdt_event_data( $mbr ) {

    if ( ! is_array( $mbr ) ) {
      return $mbr;
    }

    if ( ! isset( $mbr['data']['event_args'] ) ) {
      return $mbr;
    }

    if ( ! is_array( $mbr['data']['event_args'] ) ) {
      return $mbr;
    }

    $data = self::mpdt_member_extend_object( false, $mbr['data'] );

    if ( false !== $data ) {

      $cleanup_keys = apply_filters( 'mpca-mpdt-user-object-excluded-keys', array( 'active_memberships', 'first_txn', 'latest_txn', 'profile', 'recent_transactions', 'recent_subscriptions', 'login_count', 'sub_count', 'active_txn_count', 'expired_txn_count', 'trial_txn_count', 'address' ) );
      foreach ( $cleanup_keys as $cleanup_key ) {
        if ( isset( $data[ $cleanup_key ] ) ) {
          unset( $data[ $cleanup_key ] );
        }
      }

      $data = array_filter( $data );

      $mbr['data'] = $data;
    }

    return $mbr;
  }

  public static function do_lesson_course_started() {

    if ( ! is_single() ) {
      return;
    }

    if ( ! is_user_logged_in() ) {
      return;
    }

    global $post;

    if('publish' !== $post->post_status){
      return;
    }

    // Is course started?
    if ( 'mpcs-course' === $post->post_type ) {
      self::maybe_start_course( get_current_user_id(), $post->ID );
      return;
    }

    $lesson_cpts = models\Lesson::lesson_cpts(true);

    if(!array_key_exists($post->post_type, $lesson_cpts)){
      return;
    }

    foreach ($lesson_cpts as $cpt => $model) {

      switch ($cpt) {
        case 'mpcs-lesson':
          if ( $cpt === $post->post_type ) {
            $user_id           = get_current_user_id();
            $lesson_start_date = self::get_lesson_start_date( $user_id, $post->ID, false );
            if ( false === $lesson_start_date ) {
              $model_lesson = new $model( $post->ID );
              $modal_course = $model_lesson->course();
              if ( $modal_course ) {
                self::maybe_start_course( $user_id, $modal_course->ID );
              }

              // check if lesson is not completed.
              if ( ! models\UserProgress::has_completed_lesson( $user_id, $post->ID ) ) {
                  $user = new \MeprUser( $user_id );
                  \MeprEvent::record(
                    'mpca-lesson-started',
                    $user,
                    array(
                      'lesson_id' => $post->ID,
                    )
                  );
                  update_user_meta( $user_id, 'mpcs_lesson_started_' . $post->ID, lib\Utils::ts_to_mysql_date( time() ) );
              }
            }
          }
          break;

        case 'mpcs-quiz':
        case 'mpcs-assignment':
          if ( $cpt === $post->post_type ) {
            $user_id = get_current_user_id();
            $quiz    = new $model( $post->ID );

            if ( $quiz ) {
              $course = $quiz->course();
              if ( $course ) {
                self::maybe_start_course( $user_id, $course->ID );
              }
            }
          }
          break;

        default:
          break;
      }
    }
  }

  private static function maybe_start_course( $user_id, $course_id ) {

    if ( $user_id <= 0 || $course_id <= 0 ) {
      return;
    }

    $has_started_course = models\UserProgress::has_started_course( $user_id, $course_id );

    if ( $has_started_course ) {
      return;
    }

    $course = get_post( $course_id );

    if ( \MeprRule::is_locked( $course ) ) {
      return; // Return if locked
    }

    $course_started_meta = get_user_meta( $user_id, 'mpcs_course_started_' . $course_id, true );
    if ( empty( trim( $course_started_meta ) ) ) {
      $user = new \MeprUser( $user_id );
      \MeprEvent::record( 'mpca-course-started', $user, array( 'course_id' => $course_id ) );
      update_user_meta( $user_id, 'mpcs_course_started_' . $course_id, lib\Utils::ts_to_mysql_date( time() ) );
      lib\Utils::send_notices(new models\Course($course_id), null, emails\AdminCourseStartedEmail::class);
      return true;
    }

    return false;
  }

  public static function get_course_start_date( $course_id, $user_id ) {
    $course_started = get_user_meta( $user_id, 'mpcs_course_started_' . $course_id, true );
    if ( ! empty( trim( $course_started ) ) ) {
      return $course_started;
    }

    $start_date = models\UserProgress::get_course_start_date( $user_id, $course_id );
    if ( ! empty( trim( $start_date ) ) ) {
      return $start_date;
    }

    return '0000-00-00 00:00';
  }

  private static function get_course_completion_date( $course_id, $user_id ) {
    $has_completed_course = models\UserProgress::has_completed_course( $user_id, $course_id );
    if ( ! $has_completed_course ) {
      return '0000-00-00 00:00';
    }

    $completion_date = models\UserProgress::get_course_completion_date( $user_id, $course_id );
    if ( ! empty( trim( $completion_date ) ) ) {
      return $completion_date;
    }

    return '0000-00-00 00:00';
  }

  private static function get_lesson_start_date( $lesson_id, $user_id, $default = '0000-00-00 00:00' ) {
    $lesson_started = get_user_meta( $user_id, 'mpcs_lesson_started_' . $lesson_id, true );
    if ( ! empty( trim( $lesson_started ) ) ) {
      return $lesson_started;
    }

    $start_date = models\UserProgress::get_lesson_start_date( $user_id, $lesson_id );
    if ( ! empty( trim( $start_date ) ) ) {
      return $start_date;
    }

    return $default;
  }

  private static function get_lesson_completion_date( $lesson_id, $user_id ) {
    $has_completed_lesson = models\UserProgress::has_completed_lesson( $user_id, $lesson_id );
    if ( ! $has_completed_lesson ) {
      return '0000-00-00 00:00';
    }

    $completion_date = models\UserProgress::get_lesson_completion_date( $user_id, $lesson_id );
    if ( ! empty( trim( $completion_date ) ) ) {
      return $completion_date;
    }

    return '0000-00-00 00:00';
  }
}
