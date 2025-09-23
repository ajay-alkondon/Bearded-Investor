<?php

namespace memberpress\courses\models;

if (!defined('ABSPATH')) {
    die('You are not allowed to call this page directly.');
}

use memberpress\courses\lib as lib;
use memberpress\courses\models as models;

class UserProgress extends lib\BaseModel
{
    /**
     * @var array
     */
    protected static $course_participants = [];

    /**
     * @var array
     */
    private static $completion_cache = [];

    public function __construct($obj = null)
    {
        $this->initialize(
            [
                'id'           => [
                    'default' => 0,
                    'type'    => 'integer',
                ],
                'user_id'      => [
                    'default' => 0,
                    'type'    => 'integer',
                ],
                'lesson_id'    => [
                    'default' => 0,
                    'type'    => 'integer',
                ],
                'course_id'    => [
                    'default' => null,
                    'type'    => 'integer',
                ],
                'progress'     => [
                    'default' => 100.00,
                    'type'    => 'float',
                ],
                'created_at'   => [
                    'default' => lib\Utils::ts_to_mysql_date(time()),
                    'type'    => 'datetime',
                ],
                'completed_at' => [
                    'default' => lib\Utils::ts_to_mysql_date(time()),
                    'type'    => 'datetime',
                ],
            ],
            $obj
        );
    }

    /**
     * Used to validate the user_progress object
     *
     * @return true|null ValidationException raised on failure
     */
    public function validate()
    {
        lib\Validate::not_empty($this->user_id, 'user_id');
        lib\Validate::not_empty($this->lesson_id, 'lesson_id');
        lib\Validate::not_empty($this->course_id, 'course_id');
        lib\Validate::not_empty($this->created_at, 'created_at');

        return true;
    }

    public static function reset_course_progress($user_id, $course_id)
    {
        global $wpdb;
        $db = new lib\Db();

        $q = $wpdb->prepare(
            "
        DELETE FROM {$db->user_progress}
         WHERE user_id = %d
           AND course_id = %d
      ",
            $user_id,
            $course_id
        );

        return $wpdb->query($q);
    }

    /**
     * Used to create or update the user_progress record
     *
     * @param  boolean $validate default true
     * @return integer id
     */
    public function store($validate = true)
    {
        if ($validate) {
            $this->validate();
        }

        if (isset($this->id) && (int) $this->id > 0) {
            $this->update();
        } else {
            $this->id = self::create($this);
        }

        return $this->id;
    }

    /**
     * Destroy the user_progress
     *
     * @return integer|false Returns number of rows affected or false
     */
    public function destroy()
    {
        $db = new lib\Db();

        return $db->delete_records($db->user_progress, ['id' => $this->id]);
    }

    /**
     * Fetch lesson for user_progress
     *
     * @return Lesson Returns Lesson object
     */
    public function lesson()
    {
        return new Lesson($this->lesson_id);
    }

    /**
     * Used to create the user_progress record
     *
     * @param  UserProgress $user_progress
     * @return integer id
     */
    public static function create($user_progress)
    {
        $db    = new lib\Db();
        $attrs = $user_progress->get_values();

        return $db->create_record($db->user_progress, $attrs, false);
    }

    /**
     * Used to update the user_progress record
     *
     * @return integer id
     */
    private function update()
    {
        $db    = new lib\Db();
        $attrs = $this->get_values();

        return $db->update_record($db->user_progress, $this->id, $attrs);
    }

    /**
     * Find one by user & lesson
     *
     * @param  integer $user_id
     * @param  integer $lesson_id
     * @return UserProgress Retuns a UserProgress object or empty
     */
    public static function find_one_by_user_and_lesson($user_id, $lesson_id)
    {
        $db = new lib\Db();

        $lesson = new models\Lesson($lesson_id);
        $course = $lesson->course();

        $args = [
            'user_id'   => $user_id,
            'lesson_id' => $lesson->ID,
            'course_id' => $course->ID,
        ];

        return $db->get_one_model('memberpress\courses\models\UserProgress', $args);
    }

    /**
     * Find all by user & course
     *
     * @param  integer $user_id
     * @param  integer $course_id
     * @return UserProgress Retuns UserProgress objects or empty
     */
    public static function find_all_by_user_and_course($user_id, $course_id, $order_by = '', $limit = '')
    {
        $db = new lib\Db();

        $course = new models\Course($course_id);

        $args = [
            'user_id'   => $user_id,
            'course_id' => $course->ID,
        ];

        return $db->get_models('memberpress\courses\models\UserProgress', $order_by, $limit, $args);
    }


    /**
     * Find all by user
     *
     * @param  integer $user_id
     * @return array[UserProgress] Retuns array of UserProgress objects
     */
    public static function find_all_by_user($user_id)
    {
        $db = new lib\Db();

        $records = $db->get_records($db->user_progress, compact('user_id'));

        $user_progress = [];
        foreach ($records as $rec) {
            $user_progress[] = new UserProgress($rec->id);
        }

        return $user_progress;
    }

    /**
     * Fetch all users by course ID
     *
     * @param  integer $user_id
     * @return array[UserProgress] Retuns array of UserProgress objects
     */
    public static function find_all_course_participants($course_id, $force = false)
    {
        if (isset(UserProgress::$course_participants[$course_id]) && !$force) {
            return UserProgress::$course_participants[$course_id];
        }

        $db      = new lib\Db();
        $records = $db->get_col($db->user_progress, 'user_id', compact('course_id'));
        UserProgress::$course_participants[$course_id] = array_unique($records);

        return UserProgress::$course_participants[$course_id];
    }

    /**
     * Find course completers
     *
     * @param  mixed $course_id
     * @return void
     */
    public static function find_course_completers($course_id, $participants = [])
    {

        if (empty($participants)) {
            $participants = self::find_all_course_participants($course_id);
        }

        $completers = [];

        foreach ($participants as $user_id) {
            if (true == self::has_completed_course($user_id, $course_id)) {
                $completers[] = $course_id;
            }
        }

        return $completers;
    }

    /**
     * Returns the completion rate of a course
     *
     * @param  mixed $course_id
     * @return integer
     */
    public static function completion_rate($course_id)
    {
        $participants = (array) self::find_all_course_participants($course_id);

        if (count($participants) <= 0) {
            return 0;
        }

        $completers = (array) self::find_course_completers($course_id, $participants);
        $c          = count($completers);
        $p          = count($participants);
        $rate       = ($c / $p) * 100;

        if ($rate > 100) {
            $rate = 100;
        }

        return $rate;
    }

    /**
     * Finds the next un-completed lesson and returns it
     *
     * @param  integer $user_id
     * @param  integer $course_id
     * @return boolean Next un-completed lesson or false if not found
     */
    public static function next_lesson($user_id, $course_id)
    {
        $course  = new models\Course($course_id);
        $lessons = $course->lessons('objects', true, false);

        $lcl = self::latest_completed_lesson($user_id, $course_id);

        $lesson = false;

        // Look for the first un-completed lesson after the latest
        // completed lesson, Hint: this loop is a basic state-machine
        if ($lcl !== false && is_object($lcl)) {
            $lcl_found = false;
            foreach ($lessons as $l) {
                if ($l->ID == $lcl->ID) {
                    $lcl_found = true;
                    continue;
                }
                if ($lcl_found && !self::has_completed_lesson($user_id, $l->ID)) {
                    $lesson = $l;
                    break;
                }
            }
        }

        // We didn't find an un-completed lesson after the latest lesson completed
        // so now we're going to just return the first un-completed lesson
        if ($lesson === false) {
            $lesson = self::first_uncompleted_lesson($user_id, $course_id, true, false);
        }

        return $lesson;
    }

    /**
     * Has the give user completed the given lesson?
     *
     * @param  integer $user_id       The user ID.
     * @param  integer $lesson_id     The lesson ID.
     * @param  boolean $force_refresh Whether to force refresh the cache.
     * @return boolean
     */
    public static function has_completed_lesson($user_id, $lesson_id, $force_refresh = false)
    {
        $lesson = new models\Lesson($lesson_id);
        $course = $lesson->course();

        if (!$course instanceof models\Course) {
            return false;
        }

        $cache_key = $user_id . '_' . $course->ID;

        if (!isset(self::$completion_cache[$cache_key]) || $force_refresh) {
            $db         = new lib\Db();
            $lesson_ids = $db->get_col(
                $db->user_progress,
                'lesson_id',
                [
                    'user_id'   => $user_id,
                    'course_id' => $course->ID,
                ]
            );

            self::$completion_cache[$cache_key] = array_map('intval', $lesson_ids);
        }

        return in_array((int) $lesson_id, self::$completion_cache[$cache_key], true);
    }

    /**
     * Clear the lesson completion cache for a specific user and course
     * This is necessary when a lesson is just completed to ensure accurate course completion detection
     *
     * @param integer $user_id   The user ID.
     * @param integer $course_id The course ID.
     */
    public static function clear_completion_cache($user_id, $course_id)
    {
        unset(self::$completion_cache[$user_id . '_' . $course_id]);
    }

    /**
     * Has the user started the section?
     *
     * @param  integer $user_id
     * @param  integer $section_id
     * @return boolean Existence of UserProgress
     */
    public static function has_started_section($user_id, $section_id)
    {
        // Loop through section lessons and if one is completed short circuit and return false.
        $section = new models\Section($section_id);
        foreach ($section->lessons() as $lesson) {
            if (self::has_completed_lesson($user_id, $lesson->ID)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has completed section
     *
     * @param  integer $user_id
     * @param  integer $section_id
     * @return boolean Existence of UserProgress
     */
    public static function has_completed_section($user_id, $section_id)
    {
        // Loop through section lessons and if one isn't complete short circuit and return false.
        $section = new models\Section($section_id);
        foreach ($section->lessons(true, false) as $lesson) {
            if (!self::has_completed_lesson($user_id, $lesson->ID)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Has the given user completed the given course?
     *
     * @param  integer $user_id   The user ID.
     * @param  integer $course_id The course ID.
     * @return boolean
     */
    public static function has_completed_course($user_id, $course_id)
    {
        if (!self::has_started_course($user_id, $course_id)) {
            return false;
        }

        // Loop through course lessons and if one isn't complete short circuit and return false.
        $course = new models\Course($course_id);
        foreach ($course->lessons('ids') as $lesson_id) {
            if (!self::has_completed_lesson($user_id, $lesson_id)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Has the user started the course?
     *
     * @param  integer $user_id
     * @param  integer $course_id
     * @return boolean Existence of UserProgress
     */
    public static function has_started_course($user_id, $course_id)
    {
        global $wpdb;
        $db = new lib\Db();

        $course     = new models\Course($course_id);
        $lesson_ids = $db->prepare_array('%d', $course->lessons('ids'));

        if (empty($lesson_ids)) {
            $lesson_ids = 0;
        }

        $q                      = $wpdb->prepare(
            "
        SELECT COUNT(*)
          FROM {$db->user_progress} AS up
         WHERE up.user_id = %d
           AND up.lesson_id IN ($lesson_ids)
           AND up.course_id = %d
      ",
            $user_id,
            $course->ID
        );
        $completed_lesson_count = $wpdb->get_var($q);

        return ($completed_lesson_count > 0);
    }

    /**
     * Find the most recent user progress for a course
     *
     * @param  integer $user_id
     * @param  integer $course_id
     * @return Lesson latest completed lesson
     */
    private static function latest_completed_lesson($user_id, $course_id)
    {
        global $wpdb;
        $db = new lib\Db();

        $course     = new models\Course($course_id);
        $lesson_ids = $db->prepare_array('%d', $course->lessons('ids'));

        if (empty($lesson_ids)) {
            $lesson_ids = 0;
        }

        $q         = $wpdb->prepare(
            "
        SELECT up.lesson_id
          FROM {$db->user_progress} AS up
         WHERE up.user_id = %d
           AND up.lesson_id IN (" . $lesson_ids . ')
           AND up.course_id = %d
         ORDER BY completed_at DESC
         LIMIT 1
      ',
            $user_id,
            $course_id
        );
        $lesson_id = $wpdb->get_var($q);

        if (!empty($lesson_id) && is_numeric($lesson_id)) {
            return new models\Lesson($lesson_id);
        } else {
            return false;
        }
    }

    /**
     * Find the most recent user progress for a course
     *
     * @param  integer $user_id
     * @param  integer $course_id
     * @return Lesson latest completed lesson
     */
    private static function completed_lessons($user_id, $course_id)
    {
        global $wpdb;
        $db = new lib\Db();

        $course     = new models\Course($course_id);
        $lesson_ids = $course->lessons('ids');

        $q          = $wpdb->prepare(
            "
        SELECT up.lesson_id
          FROM {$db->user_progress} AS up
         WHERE up.user_id = %d
           AND up.lesson_id IN (" . $db->prepare_array('%d', $lesson_ids) . ')
           AND up.course_id = %d
         ORDER BY completed_at DESC
      ',
            $user_id,
            $course_id
        );
        $lesson_ids = $wpdb->get_col($q);

        if (!empty($lesson_ids) && array_map('is_numeric', $lesson_ids)) {
            return $lesson_ids;
        } else {
            return false;
        }
    }


    /**
     * Find the first Un-completed Lesson for a course
     *
     * @param  integer $user_id
     * @param  integer $course_id
     * @return Lesson First Un-completed Lesson or false if no un-completed lessons found
     */
    private static function first_uncompleted_lesson($user_id, $course_id, $include_private = true, $include_draft = null)
    {
        $course  = new models\Course($course_id);
        $lessons = $course->lessons('objects', $include_private, $include_draft, 1);

        foreach ($lessons as $lesson) {
            if (!self::has_completed_lesson($user_id, $lesson->ID)) {
                return $lesson;
            }
        }

        return false;
    }

    /**
     * Get course completion date by a user.
     *
     * @param  integer $user_id
     * @param  integer $course_id
     * @return string
     */
    public static function get_course_completion_date($user_id, $course_id)
    {
        global $wpdb;
        $db = new lib\Db();

        $q = $wpdb->prepare(
            "
        SELECT up.completed_at
          FROM {$db->user_progress} AS up
         WHERE up.user_id = %d
           AND up.course_id = %d
         ORDER BY completed_at DESC
         LIMIT 1
      ",
            $user_id,
            $course_id
        );

        $completed_at = $wpdb->get_var($q);

        if (!empty($completed_at)) {
            return $completed_at;
        } else {
            return false;
        }
    }

    /**
     * Get course start date by a user.
     *
     * @param  integer $user_id
     * @param  integer $course_id
     * @return string
     */
    public static function get_course_start_date($user_id, $course_id)
    {
        global $wpdb;
        $db = new lib\Db();

        $q = $wpdb->prepare(
            "
        SELECT up.created_at
          FROM {$db->user_progress} AS up
         WHERE up.user_id = %d
           AND up.course_id = %d
         ORDER BY created_at ASC
         LIMIT 1
      ",
            $user_id,
            $course_id
        );

        $created_at = $wpdb->get_var($q);

        if (!empty($created_at)) {
            return $created_at;
        } else {
            return false;
        }
    }

    /**
     * Get lesson start date by a user.
     *
     * @param  integer $user_id
     * @param  integer $lesson_id
     * @return string
     */
    public static function get_lesson_start_date($user_id, $lesson_id)
    {
        global $wpdb;
        $db = new lib\Db();

        $q = $wpdb->prepare(
            "
        SELECT up.created_at
          FROM {$db->user_progress} AS up
         WHERE up.user_id = %d
           AND up.lesson_id = %d
         ORDER BY created_at ASC
         LIMIT 1
      ",
            $user_id,
            $lesson_id
        );

        $created_at = $wpdb->get_var($q);

        if (!empty($created_at)) {
            return $created_at;
        } else {
            return false;
        }
    }

    /**
     * Get lesson completion date by a user.
     *
     * @param  integer $user_id
     * @param  integer $lesson_id
     * @return string
     */
    public static function get_lesson_completion_date($user_id, $lesson_id)
    {
        global $wpdb;
        $db = new lib\Db();

        $q = $wpdb->prepare(
            "
        SELECT up.completed_at
          FROM {$db->user_progress} AS up
         WHERE up.user_id = %d
           AND up.lesson_id = %d
         ORDER BY completed_at DESC
         LIMIT 1
      ",
            $user_id,
            $lesson_id
        );

        $completed_at = $wpdb->get_var($q);

        if (!empty($completed_at)) {
            return $completed_at;
        } else {
            return false;
        }
    }

    /**
     * Fetch all users
     *
     * @return array Returns array of User Ids
     */
    public static function get_all_users()
    {
        global $wpdb;

        $db = new lib\Db();

        $table = $db->user_progress;

        $query   = "SELECT user_id FROM {$table} GROUP BY user_id";
        $records = $wpdb->get_col($query);

        return $records;
    }
}
