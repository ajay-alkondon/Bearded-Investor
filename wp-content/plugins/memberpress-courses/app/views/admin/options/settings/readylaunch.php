<?php if (!defined('ABSPATH')) { die('You are not allowed to call this page directly.'); } ?>
 <tr>
  <td>
    <label class="mpcs-switch">
      <input x-model="courses.enableTemplate" type="checkbox" id="mpcs_options_classroom_mode" name="mpcs-options[classroom-mode]" value="1" class="mepr-template-enablers">
      <span class="mpcs-slider round"></span>
    </label>
  </td>

  <td>
    <label for="mpcs_options_classroom_mode"><?php esc_html_e('Courses', 'memberpress-courses'); ?></label>
  </td>
  <td x-show="courses.enableTemplate">
    <button x-on:click="courses.openModal = true" class="link" type="button">
      <?php esc_html_e('Customize', 'memberpress-courses'); ?>
    </button>
    <a href="#0"></a>
  </td>
</tr>