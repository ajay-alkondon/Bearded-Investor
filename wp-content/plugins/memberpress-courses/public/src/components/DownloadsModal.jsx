import { Fragment, useEffect, useState } from '@wordpress/element';
import {
  Modal,
  __experimentalItemGroup as ItemGroup,
  __experimentalItem as Item,
  __experimentalInputControl as InputControl,
  Dashicon
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

const DownloadsModal = ({ openModal, onCloseModal, curentDownloads, onAddFileToSection }) => {
  const [isOpen, setOpen] = useState(false);
  const [value, setValue] = useState("");

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

  const addFileToSection = (item) => {
    onAddFileToSection('downloads', item);
  }

  const isSelected = (id) => {
    return curentDownloads.some(obj => {
      return obj.id == id
    });
  }

  return (
    <Fragment>
      {isOpen && (
        <Modal
          size="large"
          className="downloads-modal"
          title="Add Downloads"
          onRequestClose={closeModal}
        >
          <InputControl
            value={value}
            onChange={(nextValue) => {
              setValue(nextValue ? nextValue : "");
              handleSearch(nextValue);
            }}
            placeholder={__("Search downloads...", "memberpress-courses")}
          />

          <ItemGroup className="resources_download">
            {resources.downloads.map((item, index) => (
              <Item className="resources_download__item" key={index}>

                <label htmlFor={`mpcs-download-${item.id}`}>
                  <span>
                  {item.thumb === 'icon' ? (
                    <i className={`${item.icon} mpdl-icon mpcs-icon large`}></i>
                  ) : item.thumb === 'image' ? (
                    <img className="resources_download__thumb" src={item.thumb_url} alt={item.title} />
                  ) : null}
                  <input
                    type="checkbox"
                    className="visuallyhidden"
                    id={`mpcs-download-${item.id}`}
                    value={item.id}
                    onClick={() => addFileToSection(item)}
                  />
                  {item.title}
                  </span>

                  {isSelected(item.id) && <Dashicon icon="yes" />}
                </label>

              </Item>
            ))}
          </ItemGroup>

          {! resources.downloads.length && <p>{__('No downloads found') }</p>}

          {resources.downloads.length > 0 && <p className="resources_download__footer">{__(`Showing 1-${resources.meta.count} of ${resources.meta.total} Downloads`)}</p>}
        </Modal>
      )}
    </Fragment>
  );
};

export default DownloadsModal;
