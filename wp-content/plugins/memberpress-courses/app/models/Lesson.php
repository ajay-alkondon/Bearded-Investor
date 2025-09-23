<?php

namespace memberpress\courses\models;

if (!defined('ABSPATH')) {
    die('You are not allowed to call this page directly.');
}

use memberpress\courses as base;
use memberpress\courses\lib;
use memberpress\courses\models;
use memberpress\courses\helpers;
use memberpress\courses\emails;

/**
 * @property string $status The status
 * @property int $section_id The section ID
 * @property int $lesson_order The lesson order
 */
class Lesson extends lib\BaseCptModel
{
    public static $cpt              = 'mpcs-lesson';
    public static $nonce_str        = 'mpcs-lesson-nonce';
    public static $permalink_slug   = 'lessons';
    public static $section_id_str   = '_mpcs_lesson_section_id';
    public static $lesson_order_str = '_mpcs_lesson_lesson_order';
    public $statuses;

    public function __construct($obj = null)
    {
        parent::__construct($obj);
        $this->load_cpt(
            $obj,
            self::$cpt,
            [
                'status'       => [
                    'default' => 'enabled',
                    'type'    => 'string',
                ],
                'section_id'   => [
                    'default' => 0,
                    'type'    => 'integer',
                ],
                'lesson_order' => [
                    'default' => 0,
                    'type'    => 'integer',
                ],
            ]
        );

        $this->statuses = [
            'enabled',
            'disabled',
        ];
    }

    public function validate()
    {
        lib\Validate::is_in_array($this->status, $this->statuses, 'status');
    }

    /**
     * Get the section for this lesson
     *
     * @return Section|false
     */
    public function section()
    {
        static $sections = [];

        if (!isset($sections[$this->section_id])) {
            $sections[$this->section_id] = models\Section::find($this->section_id);
        }

        return $sections[$this->section_id];
    }

    /**
     * Get the course for this lesson
     *
     * @return Course|false
     */
    public function course()
    {
        if ($section = $this->section()) {
            if ($course = $section->course()) {
                return $course;
            }
        }

        return false;
    }

    /**
     * Get ids of ordered surrounding pages
     *
     * @return array[int] Array of lesson ids
     */
    public function nav_ids()
    {
        $query = new \WP_Query(
            [
                'post_type'      => Lesson::lesson_cpts(),
                'meta_query'     => [
                    [
                        'key'   => Lesson::$section_id_str,
                        'value' => $this->section_id,
                    ],
                    [
                        'key'     => Lesson::$lesson_order_str,
                        'compare' => 'EXISTS',
                    ],
                ],
                'fields'         => 'ids',
                'posts_per_page' => -1,  // Make sure not to account default WP limit.
                'no_found_rows'  => true, // Query optimization.
            ]
        );

        $lesson_ids = [];

        if ($query->posts) {
            foreach ($query->posts as $lesson_id) {
                $lesson_order              = absint(get_post_meta($lesson_id, Lesson::$lesson_order_str, true));
                $lesson_ids[$lesson_order] = $lesson_id;
            }

            // Re-index while keeping lesson order intact
            ksort($lesson_ids); // Sort by lesson order
            $lesson_ids = array_values($lesson_ids); // Reset array keys
        }

        return $lesson_ids;
    }

    public function cloneit()
    {
        $lesson_dup                = (array) $this->rec;
        $unset_keys                = ['ID', 'post_date', 'post_date_gmt', 'post_modified', 'post_modified_gmt', 'guid'];
        $lesson_dup                = \array_diff_key($lesson_dup, \array_flip($unset_keys));
        $lesson_dup['post_title'] .= ' (' . __('Copy', 'memberpress-courses') . (string) time() . ')';

        return \wp_insert_post($lesson_dup);
    }

    public static function lesson_cpts($with_classes = false)
    {
        $cpts = [
            self::$cpt => self::class,
        ];

        $cpts = apply_filters('mpcs_lesson_cpts', $cpts, $with_classes);

        if ($with_classes) {
            return $cpts;
        }

        return array_keys($cpts);
    }

    /**
     * Filter lesson post types.
     *
     * @param  array|null $post_types   Post types to filter by, or null for all.
     * @param  boolean    $with_classes Whether to return with class mappings (true) or just post type keys (false).
     * @return array Filtered post types
     */
    private static function post_type_filter($post_types = null, $with_classes = false): array
    {
        $all_post_types = self::lesson_cpts($with_classes);

        if (!is_array($post_types) || empty($post_types)) {
            return $all_post_types;
        }

        if ($with_classes) {
            // Filter associative array by keys.
            return array_filter($all_post_types, function ($key) use ($post_types) {
                return in_array($key, $post_types);
            }, ARRAY_FILTER_USE_KEY);
        } else {
            // Filter simple array by values.
            return array_filter($all_post_types, function ($post_type) use ($post_types) {
                return in_array($post_type, $post_types);
            });
        }
    }

    /**
     * Build array of post statuses to exclude from queries.
     *
     * @param  boolean      $include_private Whether to include private posts.
     * @param  boolean|null $include_draft   Whether to include draft posts.
     * @return array Array of post statuses to exclude
     */
    private static function exclude_post_status_filter($include_private = true, $include_draft = null): array
    {
        $post_statuses = ['trash'];

        if (false === $include_draft) {
            $post_statuses[] = 'draft';
        }
        if (!$include_private) {
            $post_statuses[] = 'private';
        }

        $hide_scheduled = apply_filters('mpcs_hide_scheduled_posts', true);
        if (true === $hide_scheduled && !lib\Utils::is_logged_in_and_an_admin()) {
            $post_statuses[] = 'future';
        }

        return $post_statuses;
    }

    public static function find_all_by_section($section_id, $post_types = null, $include_private = true, $include_draft = null)
    {
        global $wpdb;
        static $section_lessons   = [];
        $post_types               = self::post_type_filter($post_types, true);
        $post_type_placeholders   = implode(', ', array_fill(0, count(array_keys($post_types)), '%s'));
        $post_statuses            = self::exclude_post_status_filter($include_private, $include_draft);
        $post_status_placeholders = implode(', ', array_fill(0, count($post_statuses), '%s'));

        $query = $wpdb->prepare(
            "SELECT ID, post_type FROM {$wpdb->posts} AS p
        JOIN {$wpdb->postmeta} AS pm
          ON p.ID = pm.post_id
         AND pm.meta_key = %s
         AND pm.meta_value = %s
        JOIN {$wpdb->postmeta} AS pm_order
          ON p.ID = pm_order.post_id
         AND pm_order.meta_key = %s
       WHERE p.post_type IN ($post_type_placeholders)
         AND p.post_status NOT IN ($post_status_placeholders)
       ORDER BY pm_order.meta_value * 1",
            array_merge(
                [
                    Lesson::$section_id_str,
                    $section_id,
                    Lesson::$lesson_order_str,
                ],
                array_keys($post_types),
                $post_statuses
            )
        );

        $key_query = md5($query);
        if (! isset($section_lessons[$key_query])) {
            $section_lessons[$key_query] = $wpdb->get_results($query);
        }

        $lessons = [];

        foreach ($section_lessons[$key_query] as $lesson) {
            if (array_key_exists($lesson->post_type, $post_types)) {
                $lessons[] = new $post_types[$lesson->post_type]($lesson->ID);
            }
        }

        return $lessons;
    }

    /**
     * Get the IDs of all lessons in the given course.
     *
     * @param  integer      $course_id       The course ID.
     * @param  array|null   $post_types      Filter by these post types. `null` to fetch all lesson post types.
     * @param  boolean      $include_private Whether to include private posts.
     * @param  boolean|null $include_draft   Whether to include draft posts.
     * @return int[] The array of lesson IDs.
     */
    public static function find_all_ids_by_course(int $course_id, $post_types = null, $include_private = true, $include_draft = null)
    {
        global $wpdb;
        static $cache = [];

        // Create cache key based on parameters.
        $cache_key = $course_id . '_' . md5(serialize([$post_types, $include_private, $include_draft]));

        if (isset($cache[$cache_key])) {
            return $cache[$cache_key];
        }

        $db                       = new lib\Db();
        $post_types               = models\Lesson::post_type_filter($post_types);
        $post_type_placeholders   = implode(', ', array_fill(0, count($post_types), '%s'));
        $post_statuses            = models\Lesson::exclude_post_status_filter($include_private, $include_draft);
        $post_status_placeholders = implode(', ', array_fill(0, count($post_statuses), '%s'));

        $query = $wpdb->prepare(
            "SELECT p.ID
        FROM $wpdb->posts AS p
        JOIN $wpdb->postmeta AS pm
          ON p.ID = pm.post_id
          AND pm.meta_key = '%s'
        JOIN $db->sections AS s
          ON s.id = pm.meta_value
          AND s.course_id = %d
        JOIN $wpdb->postmeta AS pm_order
          ON p.ID = pm_order.post_id
          AND pm_order.meta_key = '%s'
        WHERE p.post_type IN ($post_type_placeholders)
          AND p.post_status NOT IN ($post_status_placeholders)
        ORDER BY s.section_order, pm_order.meta_value * 1",
            array_merge(
                [
                    models\Lesson::$section_id_str,
                    $course_id,
                    models\Lesson::$lesson_order_str,
                ],
                $post_types,
                $post_statuses
            )
        );

        $lesson_ids = $wpdb->get_col($query);
        $lesson_ids = array_map('intval', $lesson_ids);

        // Cache the result.
        $cache[$cache_key] = $lesson_ids;

        return $lesson_ids;
    }

    public static function find_all($options = [])
    {
        $lessons = Lesson::get_all_objects($options);

        if ($lessons === false) {
            $lessons = [];
        }

        return $lessons;
    }

    public static function exists($lesson_id, $section_id)
    {
        $lesson = Lesson::get_one([
            'wheres' => [
                'ID'         => $lesson_id,
                'section_id' => $section_id,
            ],
        ]);

        return (isset($lesson) && $lesson instanceof Lesson) ? true : false;
    }

    public function add_to_section($section_id, $order)
    {
        $this->section_id   = $section_id;
        $this->lesson_order = $order;
        $this->store_meta();
    }

    public function update_order($order)
    {
        $this->lesson_order = $order;
        $this->store_meta();
    }

    public function remove_from_section()
    {
        delete_post_meta($this->ID, Lesson::$section_id_str, $this->section_id);
        delete_post_meta($this->ID, Lesson::$lesson_order_str, $this->lesson_order);
    }

    public function get_previous_lesson()
    {
        $course = $this->course();

        if ($course instanceof models\Course) {
            $previous_lesson = false;

            foreach ($course->sections() as $section) {
                foreach ($section->lessons(true, false) as $lesson) {
                    if ($lesson->ID == $this->ID) {
                        return $previous_lesson;
                    }

                    $previous_lesson = $lesson;
                }
            }
        }

        return false;
    }

    public function is_available()
    {
        if (!is_user_logged_in()) {
            return true;
        }

        // Allow access to users who can edit this lesson, so they can preview it
        if (current_user_can('edit_post', $this->ID)) {
            return true;
        }

        // Allow access to completed lessons
        if (UserProgress::has_completed_lesson(get_current_user_id(), $this->ID)) {
            return true;
        }

        $section = $this->section();
        $course  = $this->course();

        // We need all this info to continue
        if ($section && $course) {
            // Previous lesson is required
            if ($course->require_previous == 'enabled') {
                if ($previous_lesson = $this->get_previous_lesson()) {
                    // If we have a previous lesson, look to see if it is complete
                    if (!UserProgress::has_completed_lesson(get_current_user_id(), $previous_lesson->ID)) {
                        // previous lesson is required but not completed
                        return false;
                    }
                }
            }
        }

        // If we have reached this point, the lesson is available
        return true;
    }

    protected function load_cpt_from_id($id)
    {
        $post = (array)get_post($id);

        // Doing this so that Quiz can extend Lesson. So a quiz can appear as a Lesson unless we specifically need it to be a quiz.
        // For example, in UserProgress
        if (null === $post || (isset($post['post_type']) && !in_array($post['post_type'], self::lesson_cpts()))) {
            // error_log('load_cpt_from_id didn\'t find lesson ID='.$id);
        } else {
            $this->rec = (object)array_merge((array)$this->rec, (array)$post);
            $this->load_meta($id);
        }
    }

    /**
     * Has this lesson been completed?
     *
     * @param  integer|null $user_id The user ID. If null, defaults to the ID of the currently logged-in user
     * @return boolean
     */
    public function is_complete($user_id = null)
    {
        if (is_null($user_id)) {
            $user_id = get_current_user_id();
        }

        if (empty($user_id)) {
            return false;
        }

        $user_progress = models\UserProgress::find_one_by_user_and_lesson($user_id, $this->ID);

        return !empty($user_progress) && !empty($user_progress->id);
    }

    /**
     * Complete this lesson for the given user ID
     *
     * Creates a UserProgress record and fires hooks.
     *
     * @param  integer $user_id The user ID
     * @return void
     */
    public function complete($user_id)
    {
        $section_id = 0;
        $course_id  = 0;

        if ($section = $this->section()) {
            $section_id = $section->id;

            if ($course = $section->course()) {
                $course_id = $course->ID;
            }
        }

        $has_started_course  = models\UserProgress::has_started_course($user_id, $course_id);
        $has_started_section = models\UserProgress::has_started_section($user_id, $section_id);

        $user_progress               = new models\UserProgress();
        $user_progress->lesson_id    = $this->ID;
        $user_progress->course_id    = $course_id;
        $user_progress->user_id      = $user_id;
        $user_progress->created_at   = lib\Utils::ts_to_mysql_date(time());
        $user_progress->completed_at = lib\Utils::ts_to_mysql_date(time());
        $user_progress->store();

        // Clear the lesson completion cache to ensure accurate course completion detection
        models\UserProgress::clear_completion_cache($user_id, $course_id);

        $user = new \MeprUser($user_id);

        if ('memberpress\courses\models\Lesson' === get_class($this)) {
            // No need to check has_completed_lesson since we just completed it
            \MeprEvent::record('mpca-lesson-completed', $user, [
                'lesson_id' => $user_progress->lesson_id,
            ]);

            // Send notice for Lesson class only
            lib\Utils::send_notices(new models\Lesson($user_progress->lesson_id), null, emails\AdminLessonCompletedEmail::class);
        }

        do_action(base\SLUG_KEY . '_completed_lesson', $user_progress);

        if (false == $has_started_course) {
            do_action(base\SLUG_KEY . '_started_course', $user_progress);
        }

        if (false == $has_started_section) {
            do_action(base\SLUG_KEY . '_started_section', $user_progress, $section_id);
        }

        if (models\UserProgress::has_completed_course($user_id, $course_id)) {
            \MeprEvent::record('mpca-course-completed', $user, [
                'course_id' => $user_progress->course_id,
            ]);
            lib\Utils::send_notices(new models\Course($course_id), null, emails\AdminCourseCompletedEmail::class);
            lib\Utils::send_notices(new models\Course($course_id), emails\UserCourseCompletedEmail::class);
            do_action(base\SLUG_KEY . '_completed_course', $user_progress);
        }

        if (models\UserProgress::has_completed_section($user_id, $section_id)) {
            do_action(base\SLUG_KEY . '_completed_section', $user_progress, $section_id);
        }
    }

    public static function get_thumbnail($post)
    {
        $thumbnail_url = '';

        if (helpers\Lessons::is_a_lesson($post)) {
            if (has_post_thumbnail($post)) {
                $thumbnail_url = get_the_post_thumbnail_url($post);
            } else {
                $lesson        = new models\Lesson($post->ID);
                $course        = $lesson->course();
                $thumbnail_url = get_the_post_thumbnail_url($course->ID);
            }
        } elseif (helpers\Courses::is_a_course($post) && has_post_thumbnail($post)) {
            $thumbnail_url = get_the_post_thumbnail_url($post);
        }

        return $thumbnail_url;
    }
}
