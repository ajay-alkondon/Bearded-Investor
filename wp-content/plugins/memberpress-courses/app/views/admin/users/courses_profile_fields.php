<?php if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');} ?>
<?php use memberpress\courses\models as models; ?>
<h3 id="mpcs-profile-course-information-heading"><?php _e('Course Information', 'memberpress-courses'); ?></h3>
<table class="form-table mpcs-course-information">
  <?php foreach($my_courses as $course): ?>
    <tr>
      <th><a class="mpca-course-progress-title" target="_blank" href="<?php echo esc_url(add_query_arg(['post' => $course->ID], admin_url('post.php?action=edit'))); ?>"><?php echo $course->post_title; ?></a></th>
      <td class="progress">
        <div class="course-progress">
          <div class="user-progress" data-value="<?php echo $course->user_progress($user->ID); ?>">
          </div>
        </div>
      </td>
      <td>
      <?php if($course->user_progress($user->ID) > 0){ ?>
        <a class="mpcs-reset-course-progress" data-value="<?php echo $course->ID; ?>" data-user="<?php echo (int) $_GET['user_id']; ?>" data-nonce="<?php echo wp_create_nonce('reset_progress') ?>" href="#0"><?php _e('Reset Progress', 'memberpress-courses'); ?></a>
      <?php } ?>
      </td>
    </tr>
    <?php
    foreach($course->lessons() as $lesson){
      if ($lesson->post_status == 'draft') {
        continue;
      }
      do_action('mpcs_profile_lesson_progress', $lesson, $course, $user);
    }
    // do_action('mpcs_after_course_profile_fields', $course, $user);
  endforeach; ?>
</table>
