<div id="header" style="width: 680px; padding: 0px; margin: 0 auto 10px; text-align: left;">
  <h1 style="font-size: 30px; margin-bottom: 0;"><?php esc_html_e('Course Completed Notice', 'memberpress-courses'); ?></h1>
</div>
<div id="body" style="width: 600px; background: white; padding: 40px; margin: 0 auto; text-align: left;">
  <p><?php echo wp_kses_post('Hello <strong>{$user_full_name}</strong>,'); ?></p>
  <p><?php echo wp_kses_post('Congratulations on completing <strong>{$course_name}</strong>.'); ?></p>
  <p>
    <?php esc_html_e('Access helpful resources here:', 'memberpress-courses'); ?>
    <ul>
      <li><?php echo wp_kses_post('<strong>Certificate:</strong> <a href="{$course_certificate_url}">{$course_certificate_url}</a>'); ?></li>
      <li><?php echo wp_kses_post('<strong>Grades:</strong> <a href="{$course_grades_url}">{$course_grades_url}</a>'); ?></li>
    </ul>
  </p>
  <p><?php echo wp_kses_post('Regards, <br/> The <strong>{$blog_name}</strong> Team'); ?></p>
</div>
