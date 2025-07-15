<?php if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');} ?>
<?php
use memberpress\courses\lib as lib;
?>
<h4 class="mpca-course-progress-heading"><?php esc_html_e('Course Progress for', 'memberpress-courses'); ?> <?php echo esc_html(lib\Utils::get_full_name( $user->ID )); ?> </h4>
  <?php if( ! empty($my_courses) ): ?>
  <?php foreach($my_courses as $course): ?>
    <div class="mpcs-course-information">
      <div class="course-progress-summary-row">
        <div class="course-progress-summary-title"><a href="<?php echo esc_url(get_the_permalink( $course->ID )) ; ?>"><?php echo esc_html( $course->post_title ); ?></a></div>
        <div class="course-progress-summary">
          <div class="course-progress">
            <div class="ca-user-progress" data-value="<?php echo esc_attr($course->user_progress($user->ID)); ?>"></div>
          </div>
        </div>
      </div>

      <?php
      do_action('mpcs_before_course_progress_summary', $course, $user);

    endforeach;
    else: ?>
    <div class="mpcs-course-information">
       <p><?php esc_html_e('No records found.', 'memberpress-courses'); ?></p>
    </div>
  <?php endif;