(function($) {
  $(document).ready(function() {
    let lastFocusedElement;

    $(document).on('keyup', function(e) {
      if (e.key === 'Escape' && $('#course-progress-modal').hasClass('on')) {
        $('.course-progress-close-button').trigger('click');
      }
    });

    // Handle focus trap in modal
    $('#course-progress-modal').on('keydown', function(e) {
      if (e.key === 'Tab') {
        const focusableElements = $(this).find('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstFocusableElement) {
            e.preventDefault();
            lastFocusableElement.focus();
          }
        } else { // Tab
          if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
    });

    $('.course-progress-close-button').on('click', function(e) {
      let course_progress_modal = $('#course-progress-modal');
      course_progress_modal.removeClass('on');
      $('body').removeClass('mpca_progress_on');
      // Restore focus to the last focused element
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    });

    $('.mpca-course-sub-account-progress').on('click', function(e) {
      e.preventDefault();

      var oThis = $(this);
      let course_progress_modal = $('#course-progress-modal');

      // Store the last focused element
      lastFocusedElement = document.activeElement;

      let mpca_subaccount_progress = $('#mpca-subaccount-progress');
      let params = {
        action:  'mpcs_ca_view_course_progress',
        ca:      $(this).data('ca'),
        sa:      $(this).data('sa'),
        nonce:   mpca_progress.nonce
      };
      course_progress_modal.removeClass('on');
      $.post(mpca_progress.ajaxurl, params, function(res) {
        mpca_subaccount_progress.html(res);
        course_progress_modal.addClass('on');
        $('body').addClass('mpca_progress_on');

        $('.course-progress').each(function(i, e) {
          var progress_bar = $('.ca-user-progress', e);
          var progress = 0;
          var interval = setInterval(expand_progress, 10);
          var target_progress = progress_bar.data('value');
          progress_bar.html('<span>'+target_progress + '&#37;</span>');
          function expand_progress() {
              if (progress >= target_progress) {
                  clearInterval(interval);
              } else {
                  progress++;
                  progress_bar.width(progress + '%');
              }
          }
        });
      });

      // Set focus to the first focusable element in the modal
      setTimeout(function() {
        const focusableElements = course_progress_modal.find('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
          focusableElements.first().focus();
        }
      }, 500);
    });
  });
})(jQuery);
