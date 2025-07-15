import Editable from "./Editable";
import Addable from "./Addable";
import Lesson from "./Lesson";
import Quiz from "./Quiz";
import Assignment from "./Assignment";
import icons from "../lib/icons";
import { Container, Draggable } from "@edorivai/react-smooth-dnd";
import { debounce, throttle } from "lodash";
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { Fragment, createRef } from '@wordpress/element';
import { Icon, Animate } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

class Section extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovered: {}, // Title is hovered on
      isEditing: false,
      isAdding: false,
      isAddingValue: '',
      isAddingLoading: false,
    };
    this.sectionTitle = createRef();
  }

  /**
   * This is invoked immediately after Section component is mounted
   */
  componentDidMount() {
    // Auto-open lesson after a section is added
    if (this.props.newlyAdded.id == this.props.section.id) {
      this.setState({ isAdding: 'lesson', postType: 'mpcs-lesson' });
    }
  }

  /**
   * Runs when you hover mouse on a section
   * @param {int} index
   */
  handleMouseEnter = (index) => {
    this.setState((prevState) => {
      return { isHovered: { ...prevState.isHovered, [index]: true } };
    });
  };

  /**
   * Runs after you hover on a section
   * @param {int} index
   */
  handleMouseLeave = (index) => {
    this.setState((prevState) => {
      return { isHovered: { ...prevState.isHovered, [index]: false } };
    });
  };

  /**
   * Runs before dropping a lesson on to a section
   * @param {int} index
   */
  handleDropReady = () => {
    // if section is closed, add blinking CSS class
    if (false == this.props.isOpen) {
      this.sectionTitle.current.classList.add("mpcs-border-blink");
      this.autoOpenSection();
    }
  };

  /**
   * A section auto-opens if it's closed and you drag a lesson over it
   */
  autoOpenSection = debounce(() => {
    // Open section
    this.props.toggle(this.props.index);

    // Remove border class
    this.sectionTitle.current.classList.remove("mpcs-border-blink");
  }, 2000);

  /**
   * Deletes a section
   * @param {int} sectionId
   */
  deleteOne = (sectionId) => {
    const {
      [sectionId]: value,
      ...newSections
    } = this.props.curriculum.sections;
    let newSectionOrder = this.props.curriculum.sectionOrder.filter(
      (item) => item !== sectionId
    );
    this.props.deleteSection(newSections, newSectionOrder);
  };

  /**
   * Updates a section
   * @param {int} sectionId
   * @param {mixed} value
   */
  updateOne(sectionId, value) {
    const newSections = {
      ...this.props.curriculum.sections,
      [sectionId]: {
        ...this.props.curriculum.sections[sectionId],
        title: value,
      },
    };
    this.props.updateSection(newSections);
  }

  /**
   * Send request to create a lesson or quiz post
   */
  addLesson = throttle(() => {
    if (this.state.isAdding && this.state.isAddingValue !== '') {
      this.setState({ isAddingLoading: true });
      const { curriculum, section, addLesson, refreshSidebarLessons, refreshSidebarQuizzes, refreshSidebarAssignments } = this.props;
      let postType = this.state.postType;

      addLesson(curriculum, section, this.state.isAddingValue, postType).then(() => {
        this.setState({
          isAddingValue: '',
          isAddingLoading: false,
        });

        if (this.state.isAdding === 'quiz') {
          refreshSidebarQuizzes(curriculum.quizMeta.currentPage);
        } else if (this.state.isAdding === 'assignment') {
          refreshSidebarAssignments(curriculum.assignmentMeta.currentPage);
        } else {
          refreshSidebarLessons(curriculum.lessonMeta.currentPage);
        }
      });
    } else {
      this.setState({
        isAdding: false,
        isAddingValue: '',
      });
    }
  }, 1000);

  /**
   * The function to be called to get the payload object to be passed onDrop function
   * See https://github.com/kutlugsahin/react-smooth-dnd
   * @param {int} sectionId
   * @param {int} index
   */
  getLessonPayload = (sectionId, index) => {
    for (let [key, lesson] of this.props.curriculum.sections[
      sectionId
    ].lessonIds.entries()) {
      if (key == index) {
        return {
          external: false,
          lessonId: lesson,
          postType: 'mpcs-lesson',
        };
      }
    }
  };

  /**
   * Renders to the DOM
   */
  render() {
    const isHovering = this.state.isHovered[this.props.index];
    const isOpen = this.props.isOpen;
    const editInputRef = createRef();

    return (
      <Draggable key={this.props.index}>
        <div className="mepr-course-section">
          <Container
            groupName="lessons"
            onDrop={(e) => this.autoOpenSection.cancel}
            onDragLeave={() => {
              this.sectionTitle.current.classList.remove("mpcs-border-blink");
              this.autoOpenSection.cancel();
            }}
            onDropReady={(e) => this.handleDropReady()}
          >
            <div
              ref={this.sectionTitle}
              className="mepr-title notransition"
              onMouseEnter={() => this.handleMouseEnter(this.props.index)}
              onMouseLeave={() => this.handleMouseLeave(this.props.index)}
            >
              <span className="mepr-section-drag-handle">
                {isHovering && (
                  <Fragment>
                    <Icon icon={icons.draggable} size="18" />
                  </Fragment>
                )}
              </span>

              <button
                type="button"
                className="mepr-toggle-lessons"
                onClick={() => this.props.toggle(this.props.index)}
              >
                {isOpen ? (
                  <Icon icon={icons.arrowDown} size="14" />
                ) : (
                  <Icon icon={icons.arrowRight} size="14" />
                )}
              </button>

              <Editable
                text={this.props.section.title}
                placeholder={__("Section Title", "memberpress-courses")}
                childRef={editInputRef}
                type="input"
                element="h3"
                isEditing={this.state.isEditing}
                setEditing={(value) => {
                  this.setState({ isEditing: value });
                }}
              >
                <input
                  ref={editInputRef}
                  type="text"
                  name={this.props.section.id}
                  placeholder={__("Section Title", "memberpress-courses")}
                  value={this.props.section.title}
                  onChange={(e) =>
                    this.updateOne(this.props.section.id, e.target.value)
                  }
                />
              </Editable>

              {isHovering && (
                <div className="mepr-actions">
                  <Animate options={{ origin: "middle center" }} type="appear">
                    {({ className }) => (
                      <a
                        className={className}
                        href="#"
                        onClick={() => {
                          this.deleteOne(
                            this.props.section.id,
                            this.props.index
                          );
                        }}
                      >
                        <Icon icon={icons.delete} size="14" />
                      </a>
                    )}
                  </Animate>
                </div>
              )}
            </div>
          </Container>

          {isOpen && (
            <div className="mepr-lesson-list">
              <Container
                groupName="lessons"
                dragHandleSelector=".mepr-lesson-drag-handle"
                onDrop={(e) => this.props.onDrop(this.props.section.id, e)}
                getChildPayload={(index) =>
                  this.getLessonPayload(this.props.section.id, index)
                }
                dragClass="mepr-lesson-ghost"
                dropClass="mepr-lesson-ghost-drop"
                dropPlaceholder={{
                  animationDuration: 150,
                  showOnTop: true,
                  className: "lessons-drop-preview",
                }}
                dropPlaceholderAnimationDuration={200}
              // onDropReady={(e) => this.props.onDropReady(this.props.section.id, e)}
              >
                {this.props.lessons.map((lesson, index) => {

                    return lesson.type === 'mpcs-quiz' ? (
                      <Quiz
                        key={lesson.id}
                        quiz={lesson}
                        index={index}
                        sectionId={this.props.section.id}
                        type={lesson.type}
                      />
                    ) : lesson.type === 'mpcs-assignment' ? (
                      <Assignment
                        key={lesson.id}
                        assignment={lesson}
                        index={index}
                        sectionId={this.props.section.id}
                        type={lesson.type}
                      />
                    ) : (
                      <Lesson
                        key={lesson.id}
                        lesson={lesson}
                        index={index}
                        sectionId={this.props.section.id}
                        type={lesson.type}
                      />
                    );

                }
                )}
              </Container>
              {(this.state.isAdding || this.state.isAddingLoading) && (
                <Addable
                  className="mpcs-addable-lesson"
                  icon={<i className={this.state.addingDraftIcon} />}
                  placeholder={this.state.isAdding === 'quiz' ? __('Write quiz name', 'memberpress-courses') : (this.state.isAdding === 'assignment' ? __('Write assignment name', 'memberpress-courses') : __('Write lesson name', 'memberpress-courses'))}
                  value={this.state.isAddingValue}
                  handleChange={value => {
                    this.setState({ isAddingValue: value });
                  }}
                  handleSubmit={this.addLesson}
                  isLoading={this.state.isAddingLoading}
                />
              )}
              <div className="mepr-add-controls">
                <span
                  className="mpcs-add-lesson"
                  onClick={() => {
                    this.setState({
                      isAdding: 'lesson',
                      postType: 'mpcs-lesson',
                      addingIcon: "mpcs-lesson-icon",
                      addingDraftIcon: "mpcs-lesson-draft-icon",
                      addingPlaceholder: __('Write lesson name', 'memberpress-courses'),
                      isAddingLoading: false, // If adding fails, this allows the user to try again
                    });
                  }}
                >
                  {__('Add Lesson...', 'memberpress-courses')}
                </span>
                {MPCS_Course_Data.activePlugins.assignments && (
                  <Fragment>
                    <span className="mpcs-add-controls-or">{__('or', 'memberpress-courses')}</span>
                    <span
                      className="mpcs-add-assignment"
                      onClick={() => {
                        this.setState({
                          isAdding: 'assignment',
                          postType: 'mpcs-assignment',
                          addingIcon: "mpcs-assignment-icon",
                          addingDraftIcon: "mpcs-edit",
                          addingPlaceholder: __('Write assignment name', 'memberpress-courses'),
                          isAddingLoading: false, // If adding fails, this allows the user to try again
                        });
                      }}
                    >
                      {__('Add Assignment...', 'memberpress-courses')}
                    </span>
                  </Fragment>
                )}
                {MPCS_Course_Data.activePlugins.quizzes && (
                  <Fragment>
                    <span className="mpcs-add-controls-or">{__('or', 'memberpress-courses')}</span>
                    <span
                      className="mpcs-add-quiz"
                      onClick={() => {
                        this.setState({
                          isAdding: 'quiz',
                          postType: 'mpcs-quiz',
                          addingIcon: "mpcs-quiz-icon",
                          addingDraftIcon: "mpcs-lesson-draft-icon",
                          addingPlaceholder: __('Write quiz name', 'memberpress-courses'),
                          isAddingLoading: false, // If adding fails, this allows the user to try again
                        });
                      }}
                    >
                      {__('Add Quiz...', 'memberpress-courses')}
                    </span>
                  </Fragment>
                )}
              </div>
            </div>
          )}
        </div>
      </Draggable>
    );
  }
}

export default compose([
  withDispatch((dispatch) => {
    const { addLesson, updateSection, deleteSection, refreshSidebarLessons, refreshSidebarQuizzes, refreshSidebarAssignments } = dispatch(
      "memberpress/course/curriculum"
    );
    const { editPost } = dispatch("core/editor");

    return {
      addLesson,
      updateSection,
      deleteSection,
      refreshSidebarLessons,
      refreshSidebarQuizzes,
      refreshSidebarAssignments,
      editPost,
    };
  }),
  withSelect((select) => {
    return {
      curriculum: select("memberpress/course/curriculum").getAll(),
      newlyAdded: select(
        "memberpress/course/curriculum"
      ).getNewlyAddedSection(),
    };
  }),
])(Section);
