var CustomadminEmails = (function ($) {

  var $insertTagButton,
    $resetDefaultButton,
    $modalCloseButton,
    $tagSearchInput,
    $tagList,
    $sendTestEmailButton;

  var adminEmails = {

    initialize: function () {
      // Cache button elements
      $insertTagButton = $('#mpcs-insert-tag-button');
      $resetDefaultButton = $('#mpcs-reset-default-button');
      $modalCloseButton = $('.mepr_modal__close');
      $tagSearchInput = $('#mpcs-tag-search-input');
      $tagList = $('#mpcs-email-tag-list');
      $sendTestEmailButton = $('#mpcs-send-test-email');
      $enableEmail = $('.mpcs_emails_enable_single_email');

      // Bind click events
      $insertTagButton.on('click', adminEmails.openTagModal);
      $resetDefaultButton.on('click', adminEmails.resetDefault);
      $modalCloseButton.on('click', adminEmails.closeTagModal);
      $sendTestEmailButton.on('click', adminEmails.sendTestEmail);
      $enableEmail.on('click', adminEmails.enableSingleEmail);

      // Bind search input event
      $tagSearchInput.on('keyup', adminEmails.filterTags);

      // Bind click event on list items
      $tagList.on('click', 'li', adminEmails.insertTag);
    },

    openTagModal: function () {
      $('#mpcs-course-email-tags').toggle(); // Show or hide modal
    },

    closeTagModal: function () {
      $('#mpcs-course-email-tags').hide(); // Hide the modal when close button is clicked
    },

    sendTestEmail: function () {
      var $loader = $sendTestEmailButton.next('.mpcs_loader');
      var obj_name = $(this).data('obj-name');
      var obj_key = $(this).data('obj-key');
      var $subjectSelector = $('#mpcs-email-subject');
      var $useTemplateSelector = $('#mpcs-email-use-template');

      var body = '';
      if (typeof tinymce !== 'undefined') {
        var editor = tinymce.activeEditor;
        body = editor.getContent({ format: 'raw' });
      }

      $loader.show();

      $.ajax({
        method: 'POST',
        url: MpcsEmails.ajax_url,
        data: {
          action: 'mpcs_send_test_email',
          e: obj_name,
          k: obj_key,
          s: $subjectSelector.val(),
          b: body,
          t: $useTemplateSelector.is(':checked'),
          _ajax_nonce: MpcsEmails.test_email_nonce,
          key: MpcsEmails.key
        },
        success: function (response) {
          $loader.hide();
          alert(response.data.message);
        },
        error: function (xhr) {
          console.log(xhr.responseText);
        },
        complete: function () {
          $loader.hide();
        }
      });
    },

    enableSingleEmail: function (e) {
      const $checkbox = $(this);
      $checkbox.prop('disabled', true);
      var isChecked = $checkbox.prop('checked');
      var emailId = $checkbox.data('id');
      var emailKey = $checkbox.data('key');

      $.ajax({
        method: 'POST',
        url: MpcsEmails.ajax_url,
        data: {
          action: 'mpcs_emails_enable_single_email',
          _ajax_nonce: MpcsEmails.reset_nonce,
          id: emailId,
          enabled: isChecked,
          key: emailKey
        },
        success: function (response) {},
        error: function (xhr) {
          $checkbox.prop('checked', !isChecked);
        },
        complete: function () {
          $checkbox.prop('disabled', false);
        }
      });
    },

    filterTags: function () {
      var searchTerm = $tagSearchInput.val().toLowerCase();

      $tagList.find('li').each(function () {
        var tagText = $(this).text().toLowerCase();
        // Show the list item if it matches the search term, hide otherwise
        if (tagText.includes(searchTerm)) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    },

    insertTag: function (e) {
      e.preventDefault();

      var tagText = $(this).find('span:first').text(); // Get the clicked tag text

      if (typeof tinymce !== 'undefined') {
        var editor = tinymce.activeEditor;
        editor.selection.setContent(tagText); // Insert the tag into the editor
      } else {
        console.log('TinyMCE is not defined');
      }

      adminEmails.closeTagModal(); // Close the modal after tag insertion
    },

    resetDefault: function (e) {
      e.preventDefault();

      if (typeof tinymce !== 'undefined') {
        var editor = tinymce.activeEditor;

        $.ajax({
          method: 'POST',
          url: MpcsEmails.ajax_url,
          data: {
            action: 'mpcs_reset_default_content',
            _ajax_nonce: MpcsEmails.reset_nonce,
            key: MpcsEmails.key
          },
          success: function (response) {
            if (response && typeof response.data.body === 'string') {
              editor.setContent(response.data.body);
            }

            if (response && typeof response.data.subject === 'string') {
              $('#mpcs-email-subject').val(response.data.subject);
            }
          },
          error: function (xhr) {
            if (xhr.responseJSON && xhr.responseJSON.data) {
              console.log('Error message:', xhr.responseJSON.data);
            } else {
              console.log('An unknown error occurred:', xhr.responseText);
            }
          }
        });
      } else {
        console.log('TinyMCE is not defined');
      }
    }
  };

  $(adminEmails.initialize);

  return adminEmails;

})(jQuery);
