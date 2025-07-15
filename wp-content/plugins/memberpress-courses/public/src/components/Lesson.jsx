import { Draggable } from "@edorivai/react-smooth-dnd";
import Editable from "./Editable";
import icons from "../lib/icons";
import Spinner from "../components/Spinner";
import { getPostEditUrl, getPostUrl } from "../lib/helpers.js";
import { debounce } from "lodash";
import { compose } from '@wordpress/compose';
import { Fragment, createRef } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { Icon, Animate } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

class Lesson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovering: false,
      title: "",
      isEditing: false,
      loading: false,
    };

    this.type = "mpcs-lesson";
    this.inputRef = createRef();
  }

  /**
   * Deletes a lesson
   * @param {type} lessonId
   * @param {type} index
   */
  deleteOne(lessonId, index) {
    const {
      curriculum,
      sectionId,
      sidebar,
      deleteLesson,
      deleteSectionLesson,
      refreshSidebarLessons,
    } = this.props;

    // Show loader
    this.setState({ loading: true });

    // Remove lesson from lessonIds
    if (true == sidebar) {
      // Remove lesson from course lessons and create a new object named newLessons

      // Loop through sections and remove the lesson
      for (let [key, section] of Object.entries(curriculum.sections)) {
        const sectionLessonIds = section.lessonIds;
        const index = sectionLessonIds.indexOf(lessonId);
        if (index >= 0) sectionLessonIds.splice(index, 1);

        const newSection = {
          ...section,
          lessonIds: sectionLessonIds,
        };

        deleteSectionLesson(newSection);
      }

      deleteLesson(lessonId, this.type, curriculum.lessons.sidebar).then((resolve) => {
        refreshSidebarLessons(curriculum.lessonMeta.currentPage);
        this.setState({ loading: false });
      });

      return;
    }

    // Remove lesson from Sections
    const sectionLessonIds = curriculum.sections[sectionId].lessonIds;
    sectionLessonIds.splice(index, 1);

    const newSection = {
      ...curriculum.sections[this.props.sectionId],
      lessonIds: sectionLessonIds,
    };

    deleteSectionLesson(newSection);
  }

  publishOneLesson = debounce((lessonId) => {
    const { publishLesson, refreshSidebarLessons, curriculum } = this.props;

    this.setState({ loading: true });

    publishLesson(curriculum, lessonId, this.type).then((resolve) => {
      refreshSidebarLessons(curriculum.lessonMeta.currentPage);
      this.setState({ loading: false });
    });
  }, 1000);

  updateOne = debounce((title, lessonId) => {
    const { updateLesson, refreshSidebarLessons, curriculum } = this.props;
    updateLesson(curriculum, lessonId, title, this.type).then((resolve) => {
      refreshSidebarLessons(curriculum.lessonMeta.currentPage);
      this.setState({ loading: false });
    });
  }, 1000);

  handleMouseEnter = (index) => {
    if (this.state.isEditing == true) return;
    this.setState({ isHovering: true });
  };

  handleMouseLeave = (index) => {
    if (this.state.isEditing == true) return;
    this.setState({ isHovering: false });
  };

  handleChange = (value, id) => {
    this.setState({ title: value, loading: true });
    this.updateOne(value, id);
  };

  render() {
    const { lesson } = this.props;
    const isHovering = this.state.isHovering;
    const hasCourse = lesson.courseId > 0;
    let iconSize = 14;
    let deleteIcon = icons.close;

    if (true == this.props.sidebar) {
      iconSize = 14;
      deleteIcon = icons.delete;
    }

    return (
      <Draggable className="mpcs-card-wrapper" key={this.props.index}>
        <div
          className={
            isHovering && hasCourse ? "mepr-lesson mpcs-card" : "mepr-lesson"
          }
          onMouseEnter={() => this.handleMouseEnter(this.props.index)}
          onMouseLeave={() => this.handleMouseLeave(this.props.index)}
          data-post={lesson.id}
        >
          <a className="mepr-lesson-drag-handle">
            {this.props.sidebar
              ? isHovering && (
                  <Fragment>
                    <Icon icon={icons.draggable} size={iconSize} />
                  </Fragment>
                )
              : isHovering && (
                  <Fragment>
                    <Icon icon={icons.draggable} size="16" />
                  </Fragment>
                )}
          </a>
          {!this.props.sidebar && lesson.status && lesson.status == 'draft' && (
            <i className="mpcs-lesson-draft-icon"></i>
          )}

          {!this.props.sidebar && lesson.status && lesson.status != 'draft' && (
            <i className="mpcs-lesson-icon"></i>
          )}

          <Editable
            lesson={lesson}
            text={lesson.title}
            placeholder={__("Lesson title", "memberpress-courses")}
            childRef={this.inputRef}
            isSidebar={this.props.sidebar}
            type="input"
            element="span"
            isEditing={this.state.isEditing}
            setEditing={(value) => {
              this.setState({ isEditing: value });
              if (false == value) {
                this.setState({ isHovering: false });
              }
            }}
          >
            <input
              ref={this.inputRef}
              type="text"
              name={lesson.id}
              placeholder={__("Lesson title", "memberpress-courses")}
              value={this.state.title}
              onChange={(e) => this.handleChange(e.target.value, lesson.id)}
            />
          </Editable>

          {isHovering && (
            <div className="mepr-actions">
              <Animate options={{ origin: "middle center" }} type="appear">
                {({ className }) => (
                  <a
                    className={className}
                    href={getPostUrl(lesson.href)}
                    title={__("View Lesson", "memberpress-courses")}
                  >
                    <Icon icon={icons.view} size={iconSize} />
                  </a>
                )}
              </Animate>
              <Animate options={{ origin: "middle left" }} type="appear">
                {({ className }) => (
                  <a className={className} href={getPostEditUrl(lesson.id)} target="_self" title={__("Edit Lesson", "memberpress-courses")}
                  >
                    <Icon icon={icons.edit} size={iconSize} />
                  </a>
                )}
              </Animate>
              <Animate options={{ origin: "bottom center" }} type="appear">
                {({ className }) => (
                  <a
                    className={className}
                    href="#0"
                    title={__("Delete Lesson", "memberpress-courses")}
                    onClick={() => this.deleteOne(lesson.id, this.props.index)}
                  >
                    <Icon icon={deleteIcon} size={iconSize} />{" "}
                  </a>
                )}
              </Animate>

              {lesson.status && 'draft' == lesson.status && ! this.props.sidebar  && (
              <Animate options={{ origin: "bottom center" }} type="appear">
                  {({ className }) => (
                    <a
                      className={className + " mpcs-publish-lesson"}
                      href="#0"
                      onClick={() => this.publishOneLesson(lesson.id)}
                    >
                      {__("Publish", "memberpress-courses")}
                    </a>
                  )}
              </Animate>
              )}
            </div>
          )}

          {isHovering && this.props.sidebar && this.props.lesson.courseId > 0 && (
            <div className="mepr-lesson-meta">
              {__("Course", "memberpress-courses")}: {this.props.lesson.courseTitle}
            </div>
          )}

          { this.state.loading && <Spinner/>}

        </div>
      </Draggable>
    );
  }
}

export default compose([
  withDispatch((dispatch, props) => {
    const {
      updateLesson,
      deleteSectionLesson,
      deleteLesson,
      refreshSidebarLessons,
      publishLesson,
    } = dispatch("memberpress/course/curriculum");
    return {
      updateLesson,
      deleteSectionLesson,
      deleteLesson,
      refreshSidebarLessons,
      publishLesson,
    };
  }),
  withSelect((select, props) => {
    return {
      curriculum: select("memberpress/course/curriculum").getAll(),
      post: select("core/editor").getCurrentPost(),
    };
  }),
])(Lesson);
