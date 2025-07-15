<?php if(!defined('ABSPATH')) { die('You are not allowed to call this page directly.'); } ?>
<?php
use memberpress\courses\helpers as helpers;
$sort_order = helpers\Options::val($options,'courses-sort-order', 'alphabetically');
$sort_order_direction = helpers\Options::val($options,'courses-sort-order-direction', 'ASC');
?>

<table class="form-table">
  <tbody>

    <tr valign="top">
      <th scope="row">
        <label for="mpcs_options_show_protected_courses"><?php _e('Show Protected Courses in Listing', 'memberpress-courses'); ?></label>
        <?php helpers\App::info_tooltip('mpcs-show-protected-courses',
                _x('Show Protected Courses in Listing', 'ui', 'memberpress-courses'),
                _x('By default, protected courses are displayed in Course Listing page with a padlock icon appearing before the title. Use this field to show/hide protected courses in Course Listing', 'ui', 'memberpress-courses'));
        ?>
      </th>
      <td>
        <label class="mpcs-switch">
          <input id="mpcs_options_show_protected_courses" name="mpcs-options[show-protected-courses]" class="" type="checkbox" value="1" <?php checked( 1, helpers\Options::val($options,'show-protected-courses', 1) ); ?> />
          <span class="mpcs-slider round"></span>
        </label>

      </td>
    </tr>

    <tr valign="top">
      <th scope="row">
        <label for="mpcs_options_remove_instructor_link"><?php _e('Remove your instructor link', 'memberpress-courses'); ?></label>
        <?php helpers\App::info_tooltip('mpcs-show-protected-courses',
                _x('Remove instructor link in classroom mode', 'ui', 'memberpress-courses'),
                _x('By default, a link to instructor of the course will be displayed in Course Listing page. Use this field to show/hide the link', 'ui', 'memberpress-courses'));
        ?>
      </th>
      <td>
        <label class="mpcs-switch">
          <input id="mpcs_options_remove_instructor_link" name="mpcs-options[remove-instructor-link]" class="" type="checkbox" value="1" <?php checked( 1, helpers\Options::val($options,'remove-instructor-link', 1) ); ?> />
          <span class="mpcs-slider round"></span>
        </label>

      </td>
    </tr>

    <tr valign="top">
        <th scope="row">
            <label for="mpcs_options_show_comments_course"><?php _e('Show Comments Settings on Course and Lesson Pages', 'memberpress-courses'); ?></label>
          <?php helpers\App::info_tooltip('mpcs-show-protected-courses',
            _x('Show Comments Settings on Course and Lesson Pages', 'ui', 'memberpress-courses'),
            _x('Select this option to display comment settings in the sidebar of main course and lesson pages. To display comments on specific course or lesson you will have to check Allow comments option in Discussion section of that course or lesson.', 'ui', 'memberpress-courses'));
          ?>
        </th>
        <td>
            <label class="mpcs-switch">
                <input id="mpcs_options_show_comments_course" name="mpcs-options[show-course-comments]" class="" type="checkbox" value="" <?php checked( 1, helpers\Options::val($options,'show-course-comments', 0) ); ?> />
                <span class="mpcs-slider round"></span>
            </label>

        </td>
    </tr>

    <tr valign="top">
        <th scope="row">
          <label for="mpcs_options_courses_per_page"><?php _e('Courses Per Page', 'memberpress-courses'); ?></label>
          <?php helpers\App::info_tooltip('mpcs-show-protected-courses',
            _x('Courses Per Page', 'ui', 'memberpress-courses'),
            _x('This setting will alter how many courses are shown in the Course Listing page and in the user\'s Account > Courses tab', 'ui', 'memberpress-courses'));
          ?>
        </th>
        <td>
          <input id="mpcs_options_courses_per_page" name="mpcs-options[courses-per-page]" class="" type="text" value="<?php echo esc_attr(helpers\Options::val($options,'courses-per-page', 10)); ?>" />
        </td>
    </tr>

    <tr valign="top">
        <th scope="row">
          <label for="mpcs_options_courses_sort_order"><?php _e('Courses Sort Order', 'memberpress-courses'); ?></label>
          <?php helpers\App::info_tooltip('mpcs-show-protected-courses',
            _x('Courses Sort Order', 'ui', 'memberpress-courses'),
            _x('This setting will alter the way courses are sorted in the Course Listing page and in the user\'s Account > Courses tab', 'ui', 'memberpress-courses'));
          ?>
        </th>
        <td>
          <select name="mpcs-options[courses-sort-order]" id="mpcs_options_courses_sort_order">
            <option value="alphabetically" <?php selected($sort_order, 'alphabetically'); ?>><?php esc_html_e('Alphabetically', 'memberpress-courses'); ?></option>
            <option value="last-updated" <?php selected($sort_order, 'last-updated'); ?>><?php esc_html_e('Last Updated', 'memberpress-courses'); ?></option>
            <option value="publish-date" <?php selected($sort_order, 'publish-date'); ?>><?php esc_html_e('Publish Date', 'memberpress-courses'); ?></option>
          </select>

          <select name="mpcs-options[courses-sort-order-direction]" id="mpcs_options_courses_sort_order_direction" aria-label="<?php esc_html_e('Sort order direction', 'memberpress-courses'); ?>">
            <option value="ASC" <?php selected($sort_order_direction, 'ASC'); ?>><?php esc_html_e('ASC', 'memberpress-courses'); ?></option>
            <option value="DESC" <?php selected($sort_order_direction, 'DESC'); ?>><?php esc_html_e('DESC', 'memberpress-courses'); ?></option>
          </select>
        </td>
    </tr>

    <?php do_action('mpcs_admin_courses_general_options'); ?>
  </tbody>
</table>
