<?php
if (!defined('ABSPATH')) {
    die('You are not allowed to call this page directly.');
} ?>
<script>
  jQuery(document).ready(function($) {
    $('.mepr-courses-addon-action').click(function(event) {
      event.preventDefault();
      var $this = $(this);
      $this.prop('disabled', 'disabled');
      var notice = $('#mepr-courses-action-notice');
      $.ajax({
        url: ajaxurl,
        type: 'POST',
        data: {
          action: 'mpcs_addons_action',
          nonce: "<?php echo wp_create_nonce('mpcs_addons_action'); ?>",
          type: $this.data('action'),
          addon: $this.data('addon')
        },
      })
      .done(function(data) {
        $this.remove();
        if ( data && data.data.redirect.length > 0 ) {
          notice.find('p').html(data.data.message);
          notice.addClass('notice-' + data.data.result);
          notice.show();
          window.location.href = data.data.redirect;
        } else {
          notice.find('p').html(data.data.message);
          notice.addClass('notice-' + data.data.result);
          notice.show();
          $this.removeProp('disabled');
        }
      })
      .fail(function(data) {
        notice.find('p').html(data.data.message);
        notice.addClass('notice-' + data.data.result);
        notice.show();
        $this.removeProp('disabled');
      });
    });
  });
</script>