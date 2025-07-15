import { v4 as uuidv4 } from "uuid";

import { Fragment, useEffect, useState } from '@wordpress/element';
import { Modal, TextControl, Button } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

const LinksModal = ({ openModal, onCloseModal, onAddLinkToSection }) => {
  const [isOpen, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [errors, setErrors] = useState({});

  const { filterDownloads } = useDispatch('memberpress/course/resources');

  const resources = useSelect(select => {
    if (isOpen) {
      return select('memberpress/course/resources').fetchDownloads();
    }
  }, [isOpen]);

  useEffect(() => {
    setOpen(openModal);
  }, [openModal]);

  const closeModal = () => {
    setOpen(false);
    onCloseModal(); // Call the callback function to update isAdding in the parent class
  };

  const handleSearch = (inputValue) => {
    // Check if the input value is 2 characters or more
    if (inputValue && inputValue.length >= 2) {
      runSearch(inputValue);
    } else {
      if (inputValue.length == 1) {
        return;
      }
      runSearch("");
    }
  };

  const runSearch = (inputValue) => {
    filterDownloads(inputValue)
  };

  const addLinkToSection = async () => {

    // Reset errors
    setErrors({});

    // Validate
    const res = await apiFetch( {
      path: '/mpcs/courses/validate/links',
      method: 'POST',
      data: { url, label },
    } );

    setUrl(res.url);
    setLabel(res.label);
    setErrors(res.errors);

    if(errors.length > 0 || Object.keys(res.errors).length > 0){
      return;
    }

    const item = {
      id: uuidv4(),
      url: url,
      label: label
    }
    onAddLinkToSection('links', item);

    closeModal();
  }

  return (
    <Fragment>
      {isOpen && (
        <Modal
          size="large"
          className="links-modal"
          title="Add Link"
          onRequestClose={closeModal}
        >
          <div>


            <TextControl
              value={url}
              onChange={(nextValue) => {
                setUrl(nextValue ? nextValue : "");
              }}
              label={__('URL')}
              required
            />
            <p className="text-error">{errors.url}</p>

            <TextControl
              value={label}
              onChange={(nextValue) => {
                setLabel(nextValue ? nextValue : "");
              }}
              label={__('Text')}
            />

          </div>

          <div className="resources_download__footer">
            <Button variant="primary" onClick={addLinkToSection}>Add Link</Button>
          </div>

        </Modal>
      )}
    </Fragment>
  );
};

export default LinksModal;
