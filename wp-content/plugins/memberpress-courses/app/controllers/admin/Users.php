<?php

namespace memberpress\courses\controllers\admin;

if (!defined('ABSPATH')) {
    die('You are not allowed to call this page directly.');
}

use memberpress\courses as base;
use memberpress\courses\lib as lib;
use memberpress\courses\models as models;

class Users extends lib\BaseCtrl
{
    public function load_hooks()
    {
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
        if (is_admin()) {
            add_action('edit_user_profile', [$this, 'extra_profile_fields']);
        }
    }

    /**
     * Enqueue scripts for admin user profile
     *
     * @see   load_hooks(), add_action('admin_enqueue_scripts')
     * @param string $hook Current admin page
     */
    public static function enqueue_admin_scripts($hook)
    {
        if ($hook === 'user-edit.php') {
            \wp_enqueue_style('mpcs-progress', base\CSS_URL . '/progress.css', [], base\VERSION);
            \wp_enqueue_script('mpcs-progress-js', base\JS_URL . '/progress.js', ['jquery'], base\VERSION);
        }
    }

    /**
     * Render course profile fields
     *
     * @param WP_User Edit user
     */
    public static function extra_profile_fields($user)
    {
        $my_courses = [];

        $course_posts = \get_posts([
            'post_type'   => models\Course::$cpt,
            'post_status' => 'publish',
            'numberposts' => -1,
        ]);
        foreach ($course_posts as $course) {
            $mepr_user = new \MeprUser($user->ID);
            if (\MeprUtils::is_mepr_admin() || !\MeprRule::is_locked_for_user($mepr_user, $course)) {
                $my_courses[] = new models\Course($course->ID);
            }
        }

        $show_bookmark = true;
        \MeprView::render('/admin/users/courses_profile_fields', get_defined_vars());
    }
}
