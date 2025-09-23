<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href='https://fonts.googleapis.com/css2?family=Great+Vibes' rel='stylesheet' type='text/css'>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@700&display=swap" rel="stylesheet">
    <link href='https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap' rel='stylesheet' type='text/css'>
    <?php do_action('mpcs_certificate_pdf_before_style_tag'); ?>
    <style>
      @page {
        margin: 0;
        padding: 0;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: <?php echo esc_attr($default_font); ?>;
        background: url('<?php echo $bg_image_path; ?>') no-repeat center center;
        background-size: 100% 100%;
      }

      .container {
        height: <?php if ($paper_size == 'A4') {
            echo '793px';
                } elseif ($paper_size == 'letter') {
                    echo '815px';
                } else {
                    echo apply_filters('mpcs_certificate_pdf_file_height', '800px');
                } ?>;
        position: relative;
        border: 0;
        margin: 0;
        padding: 0;
      }

      .vertical-center {
        margin: 0;
        padding: 0;
        position: absolute;
        top: 50%;
        -ms-transform: translateY(-50%);
        transform: translateY(-50%);
        color: <?php echo esc_attr($course->certificates_text_color); ?>;
        width: 100%;
        text-align: center;
      }

      p, h1, h2, h3, h4 {
        text-align: center;
      }

      img.top-logo {
        max-height: 100px;
      }

      h1.top-title {
        font-size: 3em;
        font-family: <?php echo esc_attr($title_font); ?>;
      }

      div.footer-message {
        text-align: center;
        width: 80%;
        margin: auto;
      }

      .course-name {
          max-width: 80%;
          margin: auto;
      }

      p.student-name {
        margin: 0;
        padding: 0;
        padding-bottom: 27px;
        font-family: <?php echo esc_attr($student_name_font); ?>;
        font-size: 4em;
        line-height: 1em;
      }

      div.footer-wrap {
        margin: 0 auto;
        margin-top: 42px;
        padding: 0;
        line-height: 1em;
        width: 68%;
        font-weight: bold;
        font-family: <?php echo esc_attr($footer_font); ?>;
        text-align: center;
      }

      div.signature-wrap {
        margin:0;
        padding:0;
        width:39%;
        text-align: center;
        display: inline-block;
        border:0;
        /*margin-right: <?php echo ($no_bottom_logo) ? '50px' : '0'; ?>;*/
      }

      div.signature {
        width:100%;
        text-align: center;
      }

      div.signature img {
        margin: 0;
        padding: 0;
        margin-bottom:3px;
        max-height: 60px;
        max-width: 250px;
      }

      b.signature-denom {
        height: 40px;
        padding-top: 5px;
        border-top: 2px solid;
        display: inline-block;
        text-align: center;
        width: 100%;
      }

      div.bottom-logo {
        margin: 0 auto;
        padding: 0;
        width: 20%;
        text-align: center;
        display: inline-block;
        border:0;
      }

      div.bottom-logo img {
        max-height: 100px;
        max-width: 100px;
        margin: 0;
        padding: 0;
      }

      div.instructor-wrap {
        margin: 0;
        padding: 0;
        width: 39%;
        text-align: center;
        display: inline-block;
        border:0;
        /*margin-left: <?php echo ($no_bottom_logo) ? '50px' : '0'; ?>;*/
      }

      div.instructor-name {
        width: 100%;
        margin: 0 auto;
        margin-bottom:3px;
        font-family: <?php echo esc_attr($instructor_name_font); ?>;
        font-size: 1.3em;
      }

      div.instructor-title {
        height:40px;
        padding-top: 5px;
        border-top: 2px solid;
        margin: 0 auto;
      }
      .completion-date > span {
        padding: auto 1em;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="vertical-center">
        <?php if (!$no_top_logo) : ?>
          <p>
            <img class="top-logo" src="<?php echo $top_logo_path; ?>" />
          </p>
        <?php endif; ?>
        <h1 class="top-title">
          <?php esc_html_e('Certificate of Completion', 'memberpress-courses'); ?>
        </h1>
        <h2>
          <?php esc_html_e(strtoupper($title), 'memberpress-courses'); ?>
        </h2>
        <p class="student-name">
          <?php echo $student_name; ?>
        </p>
        <div class="footer-message">
          <?php esc_html_e($footer_message, 'memberpress-courses'); ?>
        </div>
        <h4 class="course-name">
          <?php echo $course_title; ?>
        </h4>
        <?php if ($course->certificates_completion_date == 'enabled' || $course->certificates_expiration_date == 'enabled') { ?>
        <p class="completion-date">
            <?php if ($course->certificates_completion_date == 'enabled') {
                ?><span><b><?php esc_html_e('COMPLETED', 'memberpress-courses'); ?>:</b> <?php echo esc_html(wp_date(apply_filters('mpcs_certificate_pdf_completion_date', 'F jS Y'), strtotime($last_completion_date))); ?></span><?php
            } ?>
            <?php if ($course->certificates_expiration_date == 'enabled') {
                ?><span><b><?php esc_html_e('EXPIRES', 'memberpress-courses'); ?>:</b> <?php echo esc_html(wp_date(apply_filters('mpcs_certificate_pdf_expiration_date', 'F jS Y'), $last_completion_datetime->getTimestamp())); ?></span><?php
            } ?>
        </p>
        <?php } ?>
        <div class="footer-wrap">
          <?php if (!$no_instructor_sign) : ?>
          <div class="signature-wrap">
              <div class="signature">
                <img src="<?php echo $signature_path; ?>" />
              </div>
              <b class="signature-denom"><?php esc_html_e('Signature', 'memberpress-courses'); ?></b>
          </div>
          <?php endif; ?>
          <?php if (!$no_bottom_logo) : ?>
          <div class="bottom-logo">
              <img src="<?php echo $bottom_logo_path; ?>" />
          </div>
          <?php endif; ?>
          <?php if (!(empty($instructor_name) || empty($instructor_title))) : ?>
            <div class="instructor-wrap">
              <div class="instructor-name">
                <?php echo esc_textarea($instructor_name); ?>
              </div>
              <div class="instructor-title">
                <?php echo esc_textarea($instructor_title); ?>
              </div>
            </div>
          <?php endif ?>
        </div>
      </div>
    </div>
  </body>
</html>
