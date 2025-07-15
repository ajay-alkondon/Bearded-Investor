<h2><?php esc_html_e('Resources', 'memberpress-courses') ?></h2>

<?php if (!empty($resources->downloads)) : ?>
  <div id="downloads" class="mpcs-section mpcs-resource-section">
    <div class="mpcs-section-header active">
      <div class="mpcs-section-title">
        <span class="mpcs-section-title-text"><?php echo esc_html(!empty($resources->labels['downloads']) ? $resources->labels['downloads'] : __('Downloads', 'memberpress-courses')); ?></span>
      </div>
    </div> <!-- mpcs-section-header -->
    <div class="mpcs-lessons" style="display: block;">
      <?php foreach ($resources->downloads as $key => $download) : ?>
        <?php if (isset($download->id)) : ?>
        <div id="mpcs-lesson-<?php echo esc_attr($download->id) ?>" class="mpcs-lesson">
          <a href="<?php echo esc_url($download->url) ?>" class="mpcs-lesson-row-link" target="_blank">
            <div class="mpcs-lesson-link">
              <i class="mpcs-download"></i>
              <?php echo $download->title ?>
            </div>
            <div class="mpcs-lesson-button">
              <span class="mpcs-button">
                <span class="btn"> <?php esc_html_e('View', 'memberpress-courses') ?> </span>
              </span>
            </div>
          </a>
        </div>
        <?php endif; ?>
      <?php endforeach; ?>
    </div> <!-- mpcs-lessons -->
  </div>
<?php endif; ?>

<?php if (!empty($resources->links)) : ?>
  <div id="links" class="mpcs-section mpcs-resource-section">
    <div class="mpcs-section-header active">
      <div class="mpcs-section-title">
        <span class="mpcs-section-title-text"><?php echo esc_html(!empty($resources->labels['links']) ? $resources->labels['links'] : __('Links', 'memberpress-courses')); ?></span>
      </div>
    </div> <!-- mpcs-section-header -->
    <div class="mpcs-lessons" style="display: block;">
      <?php foreach ($resources->links as $key => $link) { ?>
        <div id="mpcs-lesson-<?php echo esc_attr($link->id) ?>" class="mpcs-lesson">
          <a href="<?php echo esc_url($link->url) ?>" class="mpcs-lesson-row-link" target="_blank">
            <div class="mpcs-lesson-link">
              <i class="mpcs-link"></i>
              <?php echo $link->label ? $link->label : $link->url ?>
            </div>
            <div class="mpcs-lesson-button">
              <span class="mpcs-button">
                <span class="btn"> <?php esc_html_e('Visit', 'memberpress-courses') ?> </span>
              </span>
            </div>
          </a>
        </div>
      <?php } ?>
    </div> <!-- mpcs-lessons -->
  </div>
<?php endif; ?>

<?php if(!empty($resources->custom) && !empty($resources->custom[0]->content)) : ?>
  <div id="custom" class="mpcs-resource-section">
    <?php if(!empty($resources->labels['custom'])) : ?>
      <h3><?php echo esc_html($resources->labels['custom']); ?></h3>
    <?php endif; ?>
    <?php echo wpautop(wp_kses_post($resources->custom[0]->content)); ?>
  </div>
<?php endif; ?>
