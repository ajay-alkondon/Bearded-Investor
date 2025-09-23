<?php if (!defined('ABSPATH')) {
    die('You are not allowed to call this page directly.');
} ?>
<div class="mp_wrapper mpcs-course-list">
  <?php foreach ($my_courses as $course) : ?>
    <div class="grid">
      <div class="col-1-2 grid-pad">
        <a href="<?php echo esc_url(get_permalink($course->ID)); ?>">
          <?php echo esc_html($course->post_title); ?>
        </a>
      </div>
      <div class="col-1-2 grid-pad">
        <?php if ($show_bookmark === true) : ?>
            <?php $progress = $course->user_progress($current_user->ID); ?>
          <div class="course-progress" role="progressbar" aria-valuenow="<?php echo esc_attr($progress); ?>" aria-label="<?php echo esc_attr(sprintf(__('Course Progress: %s', 'memberpress-courses'), $course->post_title)); ?>">
            <div class="user-progress <?php echo esc_attr($progress == 0 ? 'center-block' : ''); ?>" data-value="<?php echo esc_attr($progress); ?>">
            </div>
          </div>
        <?php endif; ?>
      </div>
    </div>
  <?php endforeach; ?>

    <div class="navigation">
      <div class="alignleft">
        <?php previous_posts_link(__('&laquo; Previous', 'memberpress-courses')); ?>
      </div>
      <div class="alignright">
        <?php next_posts_link(__('Next &raquo;', 'memberpress-courses'), $course_query->max_num_pages); ?>
      </div>
    </div>

</div>
