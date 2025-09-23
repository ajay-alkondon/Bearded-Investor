<?php
/**
 * View admin/rules/courses_input.
 *
 * @var string $field_name
 * @var string $field_classes
 * @var string $value
 */

defined('ABSPATH') || exit;

$course   = get_post($value);
$selected = $value ? $course->post_title : '';
?>

<div class="mepr-rule-access-condition-input <?php echo esc_attr($field_classes); ?>">
  <!-- The search input -->
  <input
    type="text"
    class="mpcs-search-courses"
    value="<?php echo esc_attr($selected); ?>"
    placeholder="<?php _e('Begin Typing Title', 'memberpress-courses'); ?>"
    data-validation="required"
    data-validation-error-msg="<?php echo esc_html__('Content cannot be blank', 'memberpress-courses'); ?>"
  />

  <!-- The actual input field that stores the selected course ID -->
  <input
    type="hidden"
    class="mepr-rule-access-condition-input-value"
    name="<?php echo $field_name; ?>"
    value="<?php echo $value; ?>"
  />

  <!-- Displays the selected course ID and any additional info -->
  <span class="mpcs-search-courses-info">
    <?php
    echo $value
      ? esc_html__('ID: ', 'memberpress-courses') . esc_html($value)
      : '';
    ?>
  </span>

  <script>
  jQuery(document).ready(function() {
    var ajaxUrl = '<?php echo esc_url(admin_url('admin-ajax.php')); ?>';
    var nonce = '<?php echo wp_create_nonce('mpcs_search_courses'); ?>';
    var action = 'mpcs_search_courses';

    jQuery('.mpcs-search-courses').autocomplete({
      source: function(request, response) {
        jQuery.post(
          ajaxUrl,
          {
            action: action,
            search: request.term,
            security: nonce
          },
          function(result) {
            response(result.data.map(function(item) {
              return {
                label: item.title,
                value: item.id,
              };
            }));
          },
          'json'
        );
      },
      minLength: 3,
      select: function(event, ui) {
        jQuery(this).val(ui.item.label);
        jQuery(this).removeClass("mepr-red-border");
        jQuery(this).siblings(".mepr-rule-access-condition-input-value").first().val(ui.item.value);
        jQuery(this).siblings(".mpcs-search-courses-info").first().html("<?php esc_html_e('ID: ', 'memberpress-courses'); ?>" + ui.item.value);

        return false;
      },
    })
    .data("ui-autocomplete")._renderItem = function(ul, item) {
      return jQuery("<li><a><b>" + item.label + "</b></a></li>").appendTo(ul);
    };
  });
  </script>
</div>
