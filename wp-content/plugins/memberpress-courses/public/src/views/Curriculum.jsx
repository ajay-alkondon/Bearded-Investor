import { Container } from "@edorivai/react-smooth-dnd";
import Section from "../components/Section";
import Addable from "../components/Addable";
import { applyDrag, getDuplicateModalHtml } from "../lib/helpers.js";
import { v4 as uuidv4 } from "uuid";
import { xor, extend, delay } from "lodash";

import { compose } from '@wordpress/compose';
import { Component, createRef } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

class Curriculum extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openedSections: [0],
      isAddingSection: false,
      isAddingSectionTitle: '',
    };
    this.isSavingFlag = true;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      curriculum,
      isDirty,
      isSavingPost,
      isAutoSaving,
      didPostSave,
      editPost,
      refreshPost,
      refreshSidebarLessons,
    } = this.props;

    if (curriculum.sections != prevProps.curriculum.sections) {
      // editor is dirty if previous section data is different from current
      editPost({ dirty: "true" }); // Activates 'beforeunload.edit-post'
      isDirty(true); // Activates modal
    }

    // editor is clean after post is saved
    if (isSavingPost && !isAutoSaving) {
      this.isSavingFlag = false;
    } else {
      if (!this.isSavingFlag) {
        // Post just got saved
        this.isSavingFlag = true;
        if (didPostSave) {
          isDirty(false);
          delay(this.updateSectionLessonsUrl, 1000);
        }
      }
    }
  }

  toggleSection = (index) => {
    const toggle = (array, item) => xor(array, [item]);
    const openedSections = toggle(this.state.openedSections, index);
    this.setState({ openedSections: openedSections });
  };

  // Reorder section after dragging and dropping it
  onSectionDrop = (result) => {
    const newSectionOrder = applyDrag(
      this.props.curriculum.sectionOrder,
      result
    );
    this.props.reOrderSection(newSectionOrder);
  };

  /**
   * Reorder lesson after dragging and dropping it
   * @param {type} sectionId
   * @param {type} result
   */
  onLessonDrop = (sectionId, result) => {
    // Exit if we are not removing or adding anything
    if (
      false == Number.isInteger(result.removedIndex) &&
      false == Number.isInteger(result.addedIndex)
    )
      return;

    // Get all the stuff we need from props
    const {
      currentPostId,
      duplicateLesson,
      refreshSidebarLessons,
      refreshSidebarQuizzes
    } = this.props;
    let { payload } = result;

    // Check if lesson has course
    const $this = this;
    const html = getDuplicateModalHtml(payload);
    if (payload.courseId > 0 && payload.courseId != currentPostId) {
      vex.dialog.confirm({
        unsafeMessage: html,
        showCloseButton: true,
        className: "vex-theme-plain mpcs-vex",
        buttons: [
          extend({}, vex.dialog.buttons.NO, {
            text: __("Cancel", "memberpress-courses"),
            className: "button button-secondary",
          }),
          extend({}, vex.dialog.buttons.YES, {
            text: __("Okay", "memberpress-courses"),
            className: "button button-primary",
          }),
        ],
        callback: function (value) {
          if (value) {
            duplicateLesson(payload.lessonId, currentPostId, payload.postType).then((resolve) => {
              payload.lessonId = resolve.newPost.ID;
              payload.lesson = resolve.newPost;
              payload.action = "duplicate";
              $this.moveLesson(sectionId, payload, result);
              refreshSidebarLessons();
              refreshSidebarQuizzes();
            });
          } else {
            return;
          }
        },
      });
    } else {
      $this.moveLesson(sectionId, payload, result);
    }

    return;
  };

  // Adds a new section
  addSection = () => {
    const { addSection } = this.props;

    if (this.state.isAddingSectionTitle !== '') {
      const uuid = uuidv4();
      const newSection = {
        [uuid]: {
          id: uuid,
          title: this.state.isAddingSectionTitle,
          lessonIds: [],
          added: Date.now(),
        },
      };

      // Create New Section
      addSection(newSection).then(() => {
        const sections = this.props.curriculum.sections;
        const index = Object.keys(sections).indexOf(uuid);

        this.setState({
          openedSections: [index],
          isAddingSectionTitle: '',
        });
      });
    }

    this.setState({ isAddingSection: false });
  };

  moveLesson = (sectionId, payload, result) => {
    const { curriculum, reorderLessons, moveLessonsBtwApps } = this.props;
    const section = curriculum.sections[sectionId];
    const { lessonId, lesson } = payload;

    // let's take care of internal lesson drops first (ie inter/intra section) ... charity begins where?
    if (false == payload.external) {
      const newLessonIds = applyDrag(section.lessonIds, result);
      const newSection = {
        ...section,
        lessonIds: newLessonIds,
      };

      reorderLessons(newSection);
      return;
    }

    // External drops (ie from outside this app eg Lessons Meta Box) ... your turn please
    if (null == payload.sourceSectionId) {
      // If the lesson is not added to a section at all ... easy thing
      let newLessons = {};
      const newLessonIds = applyDrag(section.lessonIds, result);
      const newSection = {
        ...section,
        lessonIds: newLessonIds,
      };

      // If lesson belongs to another course
      if (payload.action == "duplicate") {
        newLessons = {
          ...curriculum.lessons.section,
          [lessonId]: {
            id: lesson.ID,
            title: lesson.post_title,
            href: lesson.guid,
            type: lesson.post_type,
            status: lesson.post_status,
          },
        };
      } else {
        newLessons = {
          ...curriculum.lessons.section,
          [lessonId]: this.getFromSidebar(lessonId),
        };
      }

      moveLessonsBtwApps(newSection, newLessons);
      return;
    }

    // Here, the lesson is already in a section, so let's remove the lesson first, then add it
    let cloneResult = { ...result };
    cloneResult.removedIndex = payload.sourceIndex;
    cloneResult.addedIndex = null;

    const sourceSection = curriculum.sections[payload.sourceSectionId];
    const newLessonIds = applyDrag(sourceSection.lessonIds, cloneResult);
    const newSection = {
      ...sourceSection,
      lessonIds: newLessonIds,
    };

    const newLessons = {
      ...curriculum.lessons.section,
      [payload.lessonId]: this.getFromSidebar(payload.lessonId),
    };

    moveLessonsBtwApps(newSection, newLessons).then((resolve) => {
      const destination =
        payload.sourceSectionId == sectionId ? resolve.newSection : section;
      const newLessonIds = applyDrag(destination.lessonIds, result);
      const destinationSection = {
        ...destination,
        lessonIds: newLessonIds,
      };

      reorderLessons(destinationSection);
    });

    return;
  };

  getFromSidebar = (id) => {
    let found = this.props.curriculum.lessons.sidebar[id];

    if (undefined == found) {
      found = this.props.curriculum.quizzes.sidebar[id];
    }

    if (undefined == found) {
      found = this.props.curriculum.assignments.sidebar[id];
    }

    return found;
  };

  /**
   * Update Section Lessons URL from Sidebar Lessons URL
   * @param {Object} sidebarLessons
   */
  updateSectionLessonsUrl = () => {
    const {
      curriculum,
      updateSectionLessons,
      updateSectionQuizzes,
      updateSectionAssignments,
      refreshSidebarLessons,
      refreshSidebarQuizzes,
      refreshSidebarAssignments
    } = this.props;

    if (MPCS_Course_Data.activePlugins.quizzes) {
      refreshSidebarQuizzes().then((resolve) => {
        let newSectionQuizzes = {};
        const sidebarQuizzes = resolve.quizzes;

        for (const [key, value] of Object.entries(curriculum.lessons.section)) {
          if (sidebarQuizzes.hasOwnProperty(key)) {
            value.href = sidebarQuizzes[key].href;
          }
          newSectionQuizzes[key] = value;
        }
        updateSectionQuizzes(newSectionQuizzes);
      });
    }

    if (MPCS_Course_Data.activePlugins.assignments) {
      refreshSidebarAssignments().then((resolve) => {
        let newSectionAssignments = {};
        const sidebarAssignments = resolve.assignments;

        for (const [key, value] of Object.entries(curriculum.lessons.section)) {
          if (sidebarAssignments.hasOwnProperty(key)) {
            value.href = sidebarAssignments[key].href;
          }
          newSectionAssignments[key] = value;
        }
        updateSectionAssignments(newSectionAssignments);
      });
    }

    refreshSidebarLessons().then((resolve) => {
      let newSectionLessons = {};
      const sidebarLessons = resolve.lessons;

      for (const [key, value] of Object.entries(curriculum.lessons.section)) {
        if (sidebarLessons.hasOwnProperty(key)) {
          value.href = sidebarLessons[key].href;
        }
        newSectionLessons[key] = value;
      }
      updateSectionLessons(newSectionLessons);
    });
  };

  render() {
    const { curriculum } = this.props;

    return (
      <div className="mepr-curriculum-builder">
        {curriculum.sectionOrder && (
          <Container
            onDrop={this.onSectionDrop}
            dragHandleSelector=".mepr-section-drag-handle"
            dropPlaceholder={{
              animationDuration: 150,
              showOnTop: true,
              className: "sections-drop-preview",
            }}
            className="mepr-curriculum-builder"
            dragClass="mepr-section-ghost"
          >
            {curriculum.sectionOrder.map((sectionId, index) => {
              const section = curriculum.sections[sectionId];
              const lessons = section.lessonIds
                .map((lessonId) => curriculum.lessons.section[lessonId])
                .filter((item) => item !== undefined); // let's filter any that's undefined

              return (
                <Section
                  key={section.id}
                  section={section}
                  lessons={lessons}
                  index={index}
                  onDrop={this.onLessonDrop}
                  onDropReady={this.beforeLessonDrop}
                  isOpen={this.state.openedSections.includes(index)}
                  toggle={this.toggleSection}
                />
              );
            })}
          </Container>
        )}
        {this.state.isAddingSection && (
          <Addable
            className="mpcs-addable-section"
            placeholder={__('Section Name', 'memberpress-courses')}
            value={this.state.isAddingSectionTitle}
            handleChange={value => {
              this.setState({ isAddingSectionTitle: value });
            }}
            handleSubmit={this.addSection}
          />
        )}
        <h3
          className="mpcs-add-section"
          onClick={() => {
            this.setState({
              isAddingSection: true,
            });
          }}
        >
          <i className="mpcs-plus" />
          {__('Add section', 'memberpress-courses')}
        </h3>
        <input
          type="hidden"
          name="mpcs-curriculum"
          value={JSON.stringify(curriculum)}
        />
      </div>
    );
  }
}

export default compose([
  withDispatch((dispatch, props) => {
    const {
      addSection,
      reorderLessons,
      moveLessonsBtwApps,
      reOrderSection,
      duplicateLesson,
      isDirty,
      refreshSidebarLessons,
      refreshSidebarQuizzes,
      refreshSidebarAssignments,
      refreshCurriculum,
      updateSectionLessons,
      updateSectionQuizzes,
      updateSectionAssignments
    } = dispatch("memberpress/course/curriculum");

    const { editPost, refreshPost } = dispatch("core/editor");

    return {
      addSection,
      reorderLessons,
      moveLessonsBtwApps,
      reOrderSection,
      duplicateLesson,
      isDirty,
      editPost,
      refreshPost,
      refreshSidebarLessons,
      refreshSidebarQuizzes,
      refreshSidebarAssignments,
      refreshCurriculum,
      updateSectionLessons,
      updateSectionQuizzes,
      updateSectionAssignments
    };
  }),
  withSelect((select, props) => {
    return {
      curriculum: select("memberpress/course/curriculum").getAll(),
      isSavingPost: select("core/editor").isSavingPost(),
      isAutoSaving: select("core/editor").isAutosavingPost(),
      didPostSave: select("core/editor").didPostSaveRequestSucceed(),
      currentPostId: select("core/editor").getCurrentPost().id,
    };
  }),
])(Curriculum);
