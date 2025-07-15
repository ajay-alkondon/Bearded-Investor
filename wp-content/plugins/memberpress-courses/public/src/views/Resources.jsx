import { Container } from "@edorivai/react-smooth-dnd";
import { applyDrag } from "../lib/helpers.js";

import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { Component, Fragment, createRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import Editable from "../components/Editable";
import ClassicEditor from "../components/ClassicEditor";
import DownloadsModal from "../components/DownloadsModal";
import LinksModal from "../components/LinksModal";
import Download from "../components/Download";
import Link from "../components/Link";

class Resources extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditingDownloadsSection: false,
      isEditingLinksSection: false,
      isEditingCustomSection: false,
      isAdding: false,
      isAddingLoader: false,
      isDownloadsAddonActive: MPCS_Course_Data.activePlugins.downloads,
    };

    // Create a reference to the media frame
    this.mediaFrame = wp.media({
      title: "Select or Upload Media",
      button: {
        text: "Use this media",
      },
      multiple: false, // Set to true for multiple selection
    });

    // Callback when media is selected
    this.mediaFrame.on("select", () => {
      const attachment = this.mediaFrame
        .state()
        .get("selection")
        .first()
        .toJSON();

      // Do something with the selected media
      const item = {
        'id': attachment.id,
        'title': attachment.title,
        'url': attachment.url,
        'type': 'attachment', // Specify the correct property for the 'type'
        'thumb': attachment.type, // Specify the correct property for the 'type'
      };

      this.addFileToSection('downloads', item)
    });
  }

  // Function to open the media library
  openMediaLibrary = () => {
    // Open the media frame
    this.mediaFrame.open();
  };

  componentDidUpdate(prevProps) {
    const { settings, isDirty, editPost } = this.props;
    if (settings !== prevProps.settings) {
      editPost({ dirty: "true" }); // Activates 'beforeunload.edit-post'
      isDirty(true); // Activates modal
    }
  }

  /**
   * Updates a section
   *
   * @param {string} sectionId
   * @param {string} value
   */
  updateTitle(sectionId, value) {
    const newSections = {
      ...this.props.resources.sections,
      [sectionId]: {
        ...this.props.resources.sections[sectionId],
        label: value,
      },
    };

    this.props.updateSection(newSections);
  }

  updateCustom(content) {
    const { resources, addResource, removeResource } = this.props;

    if (content.length) {
      resources.sections.custom.items = [];
      addResource({ id: 'custom', content }, 'custom', resources);
    } else {
      removeResource(0, 'custom', 'custom', resources);
    }
  }

  addFileToSection(sectionId, item) {
    const { resources, addResource } = this.props;

    // Check if item exists
    if (resources.items[item.id]) {
      return;
    }

    addResource(item, sectionId, resources);
  }

  addLinkToSection(sectionId, item) {
    const { resources, addResource } = this.props;

    // Check if item exists
    const urlExists = Object.values(resources.items).some(entry => entry.url === item.url);
    if(urlExists){
      return;
    }

    addResource(item, sectionId, resources);
  }

  onItemDrop = (sectionId, drop) => {
    // Exit if we are not removing or adding anything
    if (
      false == Number.isInteger(drop.removedIndex) &&
      false == Number.isInteger(drop.addedIndex)
    ) {
      return;
    }

    // Get all the stuff we need from props
    const { resources, reorderItems } = this.props;

    let { payload } = drop;
    const section = resources.sections[sectionId];

    const items = applyDrag(section.items, drop);
    reorderItems(section, items);
  };

  render() {
    const { resources } = this.props;
    const downloadTextRef = createRef();
    const linkTextRef = createRef();
    const customTextRef = createRef();

    let section = resources.sections.downloads;
    const downloads = section.items
      .map((id) => resources.items[id])
      .filter((item) => item !== undefined); // let's filter any that's undefined

    section = resources.sections.links;
    const links = section.items
      .map((id) => resources.items[id])
      .filter((item) => item !== undefined); // let's filter any that's undefined

    return (
      <Fragment>
        <section className="mepr-resource-section">
          {/* Section Title */}

          <div className="mepr-title notransition">
            <Editable
              text={resources.sections.downloads.label}
              placeholder={__("Downloads", "memberpress-courses")}
              childRef={downloadTextRef}
              type="input"
              element="h3"
              isEditing={this.state.isEditingDownloadsSection}
              setEditing={(value) => {
                this.setState({ isEditingDownloadsSection: value });
              }}
            >
              <input
                ref={downloadTextRef}
                type="text"
                // name={this.props.section.id}
                placeholder={__("Downloads", "memberpress-courses")}
                value={resources.sections.downloads.label}
                onChange={(e) => this.updateTitle("downloads", e.target.value)}
              />
            </Editable>

          </div>
          <Container
            groupName="downloads"
            dragHandleSelector=".mepr-lesson-drag-handle"
            onDrop={(e) => this.onItemDrop(resources.sections.downloads.id, e)}
            dragClass="mepr-lesson-ghost"
            dropClass="mepr-lesson-ghost-drop"
            dropPlaceholder={{
              animationDuration: 150,
              showOnTop: true,
              className: "lessons-drop-preview",
            }}
            dropPlaceholderAnimationDuration={200}
          >
            {downloads.map((download, index) => {
              return <Download
                key={download.id}
                download={download}
                index={index}
                sectionId={resources.sections.downloads.id}
              />
            })}
          </Container>
          {/* Meta Buttons */}
          <div className="mepr-add-controls">
            {this.state.isDownloadsAddonActive && (
              <Fragment>
                <button
                  className="mpcs-link-button"
                  onClick={() => {
                    this.setState({
                      isAdding: "downloads",
                      isAddingLoader: false, // If adding fails, this allows the user to try again
                    });
                  }}
                  type="button"
                >
                  {__("Add Download", "memberpress-courses")}
                </button>
                <span className="mpcs-add-controls-or">
                  {__(" or ", "memberpress-courses")}
                </span>
              </Fragment>
            )}

            <button
              className="mpcs-link-button"
              onClick={this.openMediaLibrary}
              type="button"
            >
              {__("Add Media", "memberpress-courses")}
            </button>
          </div>

          {this.state.isAdding === 'downloads' && <DownloadsModal openModal={this.state.isAdding === 'downloads'} onCloseModal={() => this.setState({ isAdding: null })} onAddFileToSection={this.addFileToSection.bind(this)} curentDownloads={downloads} />}
        </section>

        <section className="mepr-resource-section">
          <div className="mepr-title notransition">
            <Editable
              text={resources.sections.links.label}
              placeholder={__("Links", "memberpress-courses")}
              childRef={linkTextRef}
              type="input"
              element="h3"
              isEditing={this.state.isEditingLinksSection}
              setEditing={(value) => {
                this.setState({ isEditingLinksSection: value });
              }}
            >
              <input
                ref={linkTextRef}
                type="text"
                // name={this.props.section.id}
                placeholder={__("Links", "memberpress-courses")}
                value={resources.sections.links.label}
                onChange={(e) => this.updateTitle("links", e.target.value)}
              />
            </Editable>

          </div>
          <Container
            groupName="links"
            dragHandleSelector=".mepr-lesson-drag-handle"
            onDrop={(e) => this.onItemDrop(resources.sections.links.id, e)}
            dragClass="mepr-lesson-ghost"
            dropClass="mepr-lesson-ghost-drop"
            dropPlaceholder={{
              animationDuration: 150,
              showOnTop: true,
              className: "lessons-drop-preview",
            }}
            dropPlaceholderAnimationDuration={200}
          >
            {links.map((link, index) => {
              return <Link
                key={link.id}
                link={link}
                index={index}
                sectionId={resources.sections.links.id}
              />
            })}
          </Container>
          {/* Meta Buttons */}
          <div className="mepr-add-controls">
              <Fragment>
                <button
                  className="mpcs-link-button"
                  onClick={() => {
                    this.setState({
                      isAdding: "links",
                      isAddingLoader: false, // If adding fails, this allows the user to try again
                    });
                  }}
                  type="button"
                >
                  {__("Add Link", "memberpress-courses")}
                </button>
              </Fragment>
          </div>

          {this.state.isAdding === 'links' && <LinksModal openModal={this.state.isAdding === 'links'} onCloseModal={() => this.setState({ isAdding: null })} onAddLinkToSection={this.addLinkToSection.bind(this)} />}
        </section>

        <section className="mepr-resource-section">
          <div className="mepr-title notransition">
            <Editable
              text={resources.sections.custom.label}
              placeholder={__("Custom", "memberpress-courses")}
              childRef={customTextRef}
              type="input"
              element="h3"
              isEditing={this.state.isEditingCustomSection}
              setEditing={(value) => {
                this.setState({ isEditingCustomSection: value });
              }}
            >
              <input
                ref={customTextRef}
                type="text"
                placeholder={__("Custom", "memberpress-courses")}
                value={resources.sections.custom.label}
                onChange={(e) => this.updateTitle("custom", e.target.value)}
              />
            </Editable>
          </div>
          <div className="mpcs-custom-resource-field">
            <ClassicEditor
              id="mpcs-resource-custom"
              content={resources.items.custom ? resources.items.custom.content : ''}
              onChange={value => this.updateCustom(value)}
            />
          </div>
        </section>

        <div className="form-group">
          <input
            type="hidden"
            name="mpcs-resources"
            value={JSON.stringify(resources)}
          />
        </div>
      </Fragment>
    );
  }
}

export default compose([
  withDispatch((dispatch) => {
    const { updateSection, addResource, removeResource, reorderItems } = dispatch("memberpress/course/resources");

    return {
      updateSection,
      addResource,
      removeResource,
      reorderItems,
    };
  }),
  withSelect((select) => {
    return {
      resources: select("memberpress/course/resources").getAll(),
    };
  }),
])(Resources);
