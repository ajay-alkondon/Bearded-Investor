<div id="header" style="width: 680px; padding: 0px; margin: 0 auto 10px; text-align: left;">
  <h1 style="font-size: 30px; margin-bottom: 0;"><?php esc_html_e('Admin Course Started Notice', 'memberpress-courses'); ?></h1>
</div>
<div id="body" style="width: 600px; background: white; padding: 40px; margin: 0 auto; text-align: left;">
  <p><?php esc_html_e('Hello,', 'memberpress-courses'); ?></p>
  <p><?php echo wp_kses_post('Student <strong>{$user_full_name}</strong> has started the course <strong>{$course_name}</strong>.'); ?></p>

  <ul>
    <li><?php echo wp_kses_post('<strong>Course URL:</strong> <a href="{$course_url}">{$course_url}</a>'); ?></li>
  </ul>

  <p><?php echo wp_kses_post('Sent from <strong>{$blog_name}</strong>'); ?></p>
</div>