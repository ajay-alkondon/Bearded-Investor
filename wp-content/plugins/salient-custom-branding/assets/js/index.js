import '../css/style.scss';

class salientWhiteLabel {
  constructor() {
    this.events();
  }

  events() {
    document.addEventListener('DOMContentLoaded', () => {
      this.fields();
    });
  }

  fields() {
    this.mediaField();
    this.switchField();
    this.colorField();
  }

  colorField() {


    document.querySelectorAll('.salient-custom-branding-color-picker').forEach( field => {

      const input = jQuery(field).find('.salient-custom-branding-color-field');
      input.wpColorPicker({
        change: function(event, ui) {
          input.val(ui.color.toString());
        }
      });
      
    });

  }

  switchField() {

    var that = this;

    document.querySelectorAll('.salient-toggle-switch').forEach( toggleSwitch => {
        
      toggleSwitch.addEventListener('click', function(e) {

        const switchInput = toggleSwitch.querySelector('input[type="hidden"]');

        const cbEnable = toggleSwitch.querySelector('.cb-enable');
        const cbDisable = toggleSwitch.querySelector('.cb-disable');


        if( switchInput.value === 'on' ) {
          switchInput.value = 'off';
          toggleSwitch.classList.remove('activated');
          cbDisable.classList.add('selected');
          cbEnable.classList.remove('selected');
        } else {
          switchInput.value = 'on';
          toggleSwitch.classList.add('activated');
          cbDisable.classList.remove('selected');
          cbEnable.classList.add('selected');
        }

      });
  
    });


  }

  mediaField() {

    // Remove media
    const removeBtns = document.querySelectorAll('.salient-custom-branding-remove-image');
    removeBtns.forEach(removeBtn => {
      removeBtn.addEventListener('click', function(e) {

        e.preventDefault();

        const nectarMediaPreviewWrap = this.parentElement;
        const nectarMediaPreview = this.parentElement.querySelector('.media-preview');
        const relId = this.getAttribute('rel-id');
        nectarMediaPreview.setAttribute('src', '');
        
        if( !document.querySelector(`#${relId}-url`) || 
            !document.querySelector(`#${relId}-id`) ) {
          return;
        }

        document.querySelector(`#${relId}-url`).value = '';
        document.querySelector(`#${relId}-id`).value = '';
  
        nectarMediaPreviewWrap.classList.add('hidden-option');
      }); 
    });

    // Add media
    const addBtns = document.querySelectorAll('.salient-custom-branding-media__button-add');
    addBtns.forEach(addBtn => {

      addBtn.addEventListener('click', function() {
        
        const that = this;

        let imageAddFrame = null;
        imageAddFrame = wp.media.frames.customHeader = wp.media({
          title: that.getAttribute('data-title'),
          library: {
            type: 'image',
          },
          button: {
            text: that.getAttribute('data-update'),
          },
        });
        
        imageAddFrame.on('select', function () {
          const imageAttachment = imageAddFrame.state().get('selection').first();
          const imageAttachmentUrl = imageAttachment.attributes.url;
          const imageAttachmentId = imageAttachment.attributes.id;
        
          const parentElement = that.closest('td');
        
          const nectarMediaPreviewWrap = parentElement.querySelector('.media-preview-wrap');
          const nectarMediaPreview = parentElement.querySelector('.media-preview');

          const relId = that.getAttribute('rel-id');
        
          nectarMediaPreview.setAttribute('src', imageAttachmentUrl);
          
          if( !document.querySelector(`#${relId}-url`) || 
              !document.querySelector(`#${relId}-id`) ) {
            return;
          }

          document.querySelector(`#${relId}-url`).value = imageAttachmentUrl;
          document.querySelector(`#${relId}-id`).value = imageAttachmentId;
        
          nectarMediaPreviewWrap.classList.remove('hidden-option');
        });

        imageAddFrame.open();
      });
    });


  }
}

new salientWhiteLabel();