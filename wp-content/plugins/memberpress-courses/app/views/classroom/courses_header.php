<?php

/**
 * This template can be overidden in the theme
 */

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}
use memberpress\courses\helpers as helpers;
use memberpress\courses as base;
$options   = \get_option('mpcs-options');
$logo_id   = helpers\Options::val($options, 'classroom-logo');
$logo      = wp_get_attachment_image_url($logo_id, 'full');
$site_name = get_bloginfo('name');
$logo_alt  = get_post_meta($logo_id, '_wp_attachment_image_alt', true);
// Translators: %s is the site's title option value.
$logo_alt = $logo_alt ? $logo_alt : sprintf(_x('%s logo', 'Site logo alternative text', 'memberpress-courses'), $site_name);
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="profile" href="https://gmpg.org/xfn/11">

  <?php wp_head(); ?>
  <?php global $post; ?>
</head>

<body <?php body_class($classes); ?>>

<header id="mpcs-navbar" class="navbar">
  <?php do_action(base\SLUG_KEY . '_classroom_start_header'); ?>

  <!-- Logo & Back Button -->
  <section class="navbar-section">
    <a href="<?php echo esc_url($back_url); ?>" class="btn nav-back" title="<?php echo esc_attr($back_url_text); ?>">
      <span class="screen-reader-text"><?php echo esc_html($back_url_text); ?></span>
      <i class="mpcs-angle-circled-left"></i>
    </a>
    <a href="<?php echo esc_url(home_url()) ?>" class="navbar-brand site-branding">
      <?php
        echo ($logo) ? '<img alt="' . esc_attr($logo_alt) . '" class="img-responsive" src="' . esc_url($logo) . '" />' : '<span>' . get_bloginfo('name') . '</span>'
        ?>
    </a>
  </section>

  <!-- Show Prev/Next Lesson buttons -->
  <?php
    if (helpers\Lessons::is_a_lesson($post) && helpers\Options::val($options, 'lesson-button-location', 'top') != 'bottom') {
        echo helpers\Lessons::display_lesson_buttons($post);
    }
    ?>

  <?php
    if (helpers\Courses::is_a_course($post) || ( helpers\Courses::is_course_archive() )) { ?>
      <section class="navbar-section">
        <?php
        wp_nav_menu([
            'menu'       => 'MemberPress Classroom',
            'container'  => false,
            'menu_class' => 'mpcs-nav-menu hide-lg',
        ]);
        ?>

        <div class="mpcs-nav-menu-mobile dropdown dropdown-right show-lg">

          <?php
            $menu_args = [
                'menu'       => 'MemberPress Classroom',
                'container'  => false,
                'menu_class' => 'menu',
                'device'     => 'small',
            ];

            if (false == wp_nav_menu(array_merge($menu_args, ['echo' => 'false']))) { ?>
            <button class="btn dropdown-toggle" aria-label="<?php esc_html_e('Toggle menu', 'memberpress-courses'); ?>">
              <i class="mpcs-ellipsis"></i>
            </button>
            <?php }
            wp_nav_menu($menu_args);
            ?>
        </div>

        <?php if (\MeprUtils::is_logged_in_and_an_admin() || isset($_GET['preview'])) { ?>
          <div class="dropdown hide-sm">
            <button id="preview-dropdown-button" class="btn dropdown-toggle" type="button" aria-haspopup="true" aria-expanded="false">
              <?php esc_html_e('Preview as', 'memberpress-courses') ?> <i class="mpcs-down-dir"></i>
            </button>
            <!-- menu component -->
            <ul class="menu" role="menu" aria-labelledby="preview-dropdown-button">
              <li><a href="<?php echo esc_url_raw($loggedin_url) ?>"><?php esc_html_e('Logged in', 'memberpress-courses') ?></a></li>
              <li><a href="<?php echo esc_url($loggedout_url) ?>"><?php esc_html_e('Logged out', 'memberpress-courses') ?></a></li>
              <?php do_action(base\SLUG_KEY . '_classroom_preview_menu'); ?>
            </ul>
          </div>
        <?php } ?>

        <?php if (\MeprUtils::is_user_logged_in()) { ?>
          <div class="dropdown dropdown-right has-image">
            <button class="btn dropdown-toggle" aria-label="<?php esc_html_e('Toggle menu', 'memberpress-courses'); ?>">
              <?php
                $user_id = MeprUtils::get_current_user_id();
                $user    = get_userdata($user_id);
                ?>
              <figure class="figure">
                <img
                  class="img-responsive s-circle"
                  src="<?php echo esc_url(get_avatar_url($user_id)); ?> "
                  alt="<?php printf(esc_html__('Photo of %s.', 'memberpress-courses'), $user->display_name); ?>"
                >
              </figure>
            </button>
            <!-- menu component -->
            <ul class="menu">
              <li><a href="<?php echo $account_url ?>"><?php esc_html_e('Account', 'memberpress-courses') ?></a></li>
              <li><a href="<?php echo $mycourses_url ?>"><?php esc_html_e('My Courses', 'memberpress-courses') ?></a></li>
              <?php if (\MeprUtils::is_mepr_admin()) { ?>
                <li><a href="<?php echo get_dashboard_url() ?>" target="_blank"><?php esc_html_e('WP Dashboard', 'memberpress-courses') ?></a></li>
              <?php } ?>
              <li><a href="<?php echo $logout_url ?>"><?php esc_html_e('Logout', 'memberpress-courses') ?></a></li>
              <?php do_action(base\SLUG_KEY . '_classroom_user_menu'); ?>
            </ul>
          </div>
        <?php } ?>

        <button class="btn sidebar-open show-sm" aria-label="<?php esc_html_e('Toggle sidebar', 'memberpress-courses'); ?>">
          <i class="mpcs-th-list"></i>
        </button>
      </section>
        <?php
    }
    ?>
  <?php do_action(base\SLUG_KEY . '_classroom_end_header'); ?>
</header>
