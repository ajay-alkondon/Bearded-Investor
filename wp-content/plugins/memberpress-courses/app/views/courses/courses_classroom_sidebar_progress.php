<?php

use memberpress\courses\helpers as helpers;

?>
<h2>
  <?php echo helpers\Lessons::is_a_lesson($post) ? '<a href="' . esc_url(get_permalink($course->ID)) . '" class="text-black">' : '' ?>
  <?php echo $course->post_title ?>
  <?php echo helpers\Lessons::is_a_lesson($post) ? '</a>' : '' ?>
</h2>
<?php if (is_user_logged_in()) : ?>
<div
  class="progress-bar"
  role="progressbar"
  aria-valuenow="<?php echo $course->user_progress($current_user->ID); ?>"
  aria-label="<?php printf(__('Course Progress: %d%%', 'memberpress-courses'), $course->user_progress($current_user->ID)); ?>"
  >
  <div class="user-progress" data-value="<?php echo $course->user_progress($current_user->ID); ?>"></div>
</div>
<p class="progress-text">
  <span><?php echo $course->user_progress($current_user->ID) . '% ' ?></span>
    <?php esc_html_e('COMPLETE', 'memberpress-courses') ?>
</p>

<?php endif; ?>