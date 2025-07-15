<?php
use memberpress\courses as base;

if (!defined('ABSPATH')) {
    die('You are not allowed to call this page directly.');
} ?>

<div class="wrap">

  <div class="mepr-sister-plugin mepr-sister-plugin-wp-mail-smtp">

    <div class="mepr-sister-plugin-image mp-courses-image">
      <img src="<?php echo esc_url(base\IMAGES_URL . '/add-ons/quizzes-icon.png'); ?>" height="216" alt="" />
    </div>

    <div class="mepr-sister-plugin-title">
      <?php esc_html_e('Create an engaging learning environment by adding Quizzes', 'memberpress-courses'); ?>
    </div>

    <div class="mepr-sister-plugin-description">
      <?php esc_html_e("The Quizzes add-on makes it simple to add quizzes to your MemberPress Courses, providing an effective way to measure student learning and keep your courses interactive.", 'memberpress-courses'); ?>
    </div>

    <div class="mepr-sister-plugin-info mepr-clearfix">
      <div class="mepr-sister-plugin-info-image">
        <div>
          <img src="<?php echo esc_url(base\IMAGES_URL . '/add-ons/quizzes-screenshot.png'); ?>" alt="">
        </div>
      </div>
      <div class="mepr-sister-plugin-info-features">
        <?php
        $bullets = array(
            esc_html__('Encourage Active Participation', 'memberpress-courses'),
            esc_html__('Enhance Material Retention', 'memberpress-courses'),
            esc_html__('Boost Engagement', 'memberpress-courses'),
            esc_html__('Increase Course Completion Rates', 'memberpress-courses'),
            esc_html__('Flexible Completion Requirements', 'memberpress-courses'),
            esc_html__('Require Passing Scores', 'memberpress-courses')
        );
        ?>
        <ul>
          <?php
          foreach ($bullets as $bullet) {
              echo '<li style="margin-bottom: 5px; font-size: 13px;"><i class="mp-icon mp-icon-right-big"></i>';
              echo esc_html($bullet);
              echo '</li>';
          }
          ?>
        </ul>
      </div>
    </div>

    <div class="mepr-sister-plugin-step mepr-sister-plugin-step-no-number mepr-sister-plugin-step-current mepr-clearfix">
      <div class="mepr-sister-plugin-step-detail">
        <div class="mepr-sister-plugin-step-title">
          <?php if (! empty($plugins['memberpress-course-quizzes/main.php'])) : // Installed but not active ?>
                <?php esc_html_e('Enable MemberPress Course Quizzes', 'memberpress-courses'); ?>
          <?php else : // Not installed ?>
              <?php esc_html_e('Install and Activate MemberPress Course Quizzes', 'memberpress-courses'); ?>
          <?php endif; ?>
        </div>
        <div class="mepr-sister-plugin-step-button">
          <?php if (! empty($plugins['memberpress-course-quizzes/main.php'])) : // Installed but not active ?>
            <button type="button" class="mepr-courses-addon-action button button-primary button-hero" data-action="activate" data-addon="quizzes"><?php esc_html_e('Activate Add-On', 'memberpress-courses'); ?></button>
          <?php else : // Not installed ?>
            <button type="button" class="mepr-courses-addon-action button button-primary button-hero" data-action="install-activate" data-addon="quizzes"><?php esc_html_e('Install & Activate Quizzes Add-On', 'memberpress-courses'); ?></button>
          <?php endif; ?>
        </div>
        <div id="mepr-courses-action-notice" class="mepr-courses-action-notice notice inline"><p></p></div>
      </div>
    </div>

  </div>
</div>