<?php if(!defined('ABSPATH')) { die('You are not allowed to call this page directly.'); } ?>
<?php
use memberpress\courses\helpers\App;
use memberpress\courses\helpers\Options;
use memberpress\courses\models\Course;
use memberpress\courses\models\Lesson;
?>
<table class="mepr-options-pane">
  <tbody>
      <tr valign="top">
    <td>
      <label for="mpcs_options_courses_slug"><?php esc_html_e('Classroom Slug:', 'memberpress-courses'); ?>
        <?php
          App::info_tooltip(
            'mpcs-courses-slug',
            esc_html__('Classroom Slug', 'memberpress-courses'),
            esc_html__('Use this field to change the permalink base of your courses to something other than /courses/', 'memberpress-courses')
          );
        ?>
    </td>
    <td>
      <input type="text" id="mpcs_options_courses_slug" name="mpcs-options[courses-slug]" placeholder="<?php echo esc_attr(Course::$permalink_slug); ?>" class="regular-text" value="<?php echo esc_attr(Options::val($options, 'courses-slug')); ?>" />
    </td>
  </tr>
  <tr valign="top">
    <td>
      <label for="mpcs_options_lessons_slug"><?php esc_html_e('Lesson Slug:', 'memberpress-courses'); ?>
        <?php
          App::info_tooltip(
            'mepr-lessons-slug',
            esc_html__('Lesson Slug', 'memberpress-courses'),
            esc_html__('Use this field to change the permalink base of your lessons to something other than /lessons/', 'memberpress-courses')
          );
        ?>
    </td>
    <td>
      <input type="text" id="mpcs_options_lessons_slug" name="mpcs-options[lessons-slug]" placeholder="<?php echo esc_attr(Lesson::$permalink_slug); ?>" class="regular-text" value="<?php echo esc_attr(Options::val($options, 'lessons-slug')); ?>" />
    </td>
  </tr>
     <?php do_action('mpcs_admin_slugs_options', $options); ?>
  </tbody>
</table>
