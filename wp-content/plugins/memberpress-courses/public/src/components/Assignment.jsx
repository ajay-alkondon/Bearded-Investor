import { Draggable } from "@edorivai/react-smooth-dnd";
import Editable from "./Editable.jsx";
import icons from "../lib/icons.js";
import Spinner from "./Spinner.jsx";
import { getPostEditUrl, getPostUrl, getViewAssignmentSubmissionsUrl } from "../lib/helpers.js";
import { debounce } from "lodash";
import classNames from "classnames";
import { compose } from '@wordpress/compose';
import { Fragment, createRef } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { Icon, Animate } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

class Assignment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovering: false,
      title: "",
      isEditing: false,
      loading: false,
    };

    this.type = "mpcs-assignment";
    this.inputRef = createRef();
  }

  /**
   * Deletes a Assignment
   * @param {type} assignmentId
   * @param {type} index
   */
  deleteOne(assignmentId, index) {
    const {
      curriculum,
      sectionId,
      sidebar,
      deleteLesson,
      deleteSectionLesson,
      refreshSidebarAssignments,
    } = this.props;

    // Show loader
    this.setState({ loading: true });

    // Remove Assignment from lessonIds
    if (true == sidebar) {
      // Remove Assignment from course lessons and create a new object named newLessons

      // Loop through sections and remove the Assignment
      for (let [key, section] of Object.entries(curriculum.sections)) {
        const sectionLessonIds = section.lessonIds;
        const index = sectionLessonIds.indexOf(assignmentId);
        if (index >= 0) sectionLessonIds.splice(index, 1);

        const newSection = {
          ...section,
          lessonIds: sectionLessonIds,
        };

        deleteSectionLesson(newSection);
      }

      deleteLesson(assignmentId, this.type, curriculum.Assignments.sidebar).then((resolve) => {
        refreshSidebarAssignments(curriculum.assignmentMeta.currentPage);
        this.setState({ loading: false });
      });

      return;
    }

    // Remove Assignment from Sections
    const sectionLessonIds = curriculum.sections[sectionId].lessonIds;
    sectionLessonIds.splice(index, 1);

    const newSection = {
      ...curriculum.sections[this.props.sectionId],
      lessonIds: sectionLessonIds,
    };

    deleteSectionLesson(newSection);
  }

  updateOne = debounce((title, assignmentId) => {
    const { updateLesson, refreshSidebarAssignments, curriculum } = this.props;
    updateLesson(curriculum, assignmentId, title, this.type).then((resolve) => {
      refreshSidebarAssignments(curriculum.assignmentMeta.currentPage);
      this.setState({ loading: false });
    });
  }, 1000);

  publishOne = debounce((assignmentId) => {
    const { publishLesson, refreshSidebarAssignments, curriculum } = this.props;
    this.setState({ loading: true });
    publishLesson(curriculum, assignmentId, this.type).then((resolve) => {
      // refreshSidebarAssignments(curriculum.lessonMeta.currentPage);
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
    const { assignment, post } = this.props;
    const isHovering = this.state.isHovering;
    const hasCourse = assignment.courseId > 0;
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
            isHovering && hasCourse ? "mepr-assignment mpcs-card" : "mepr-assignment"
          }
          onMouseEnter={() => this.handleMouseEnter(this.props.index)}
          onMouseLeave={() => this.handleMouseLeave(this.props.index)}
          data-post={assignment.id}
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

          {!this.props.sidebar && assignment.status && assignment.status == 'draft' && (
            <i className="mpcs-edit"></i>
          )}

          {!this.props.sidebar && assignment.status && assignment.status != 'draft' && (
            <i className="mpcs-assignment-icon"></i>
          )}

          <Editable
            lesson={assignment}
            text={assignment.title}
            placeholder={__("Assignment title", "memberpress-courses")}
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
              name={assignment.id}
              placeholder={__("Assignment title", "memberpress-courses")}
              value={this.state.title}
              onChange={(e) => this.handleChange(e.target.value, assignment.id)}
            />
          </Editable>

          {isHovering && (
            <div className="mepr-actions">
              <Animate options={{ origin: "middle center" }} type="appear">
                {({ className }) => (
                  <a
                    className={className}
                    href={getPostUrl(assignment.href)}
                    title={__("View Assignment", "memberpress-course-assignments")}
                  >
                    <Icon icon={icons.view} size={iconSize} />
                  </a>
                )}
              </Animate>
              <Animate options={{ origin: "middle left" }} type="appear">
                {({ className }) => (
                  <a
                    className={className} href={getPostEditUrl(assignment.id)}
                    target="_self"
                    title={__("Edit Assignment", "memberpress-course-assignments")}
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
                    onClick={() => this.deleteOne(assignment.id, this.props.index)}
                    title={__("Remove Assignment", "memberpress-course-assignments")}
                  >
                    <Icon icon={deleteIcon} size={iconSize} />{" "}
                  </a>
                )}
              </Animate>

              {!this.props.sidebar && assignment.hasSubmissions && (
                <Animate options={{ origin: "bottom center" }} type="appear">
                  {({ className }) => (
                    <a className={classNames(className, 'mpcs-quiz-view-attempts')} href={getViewAssignmentSubmissionsUrl(assignment.id, post.id)}>
                      {__('View Submissions', 'memberpress-course-assignments')}
                    </a>
                  )}
                </Animate>
              )}

              {assignment.status && 'draft' == assignment.status && ! this.props.sidebar  && (
                <Animate options={{ origin: "bottom center" }} type="appear">
                    {({ className }) => (
                      <a
                        className={className + " mpcs-publish-lesson"}
                        href="#0"
                        onClick={() => this.publishOne(assignment.id)}
                      >
                        {__("Publish", "memberpress-courses")}
                      </a>
                    )}
                </Animate>
              )}
            </div>
          )}

          {isHovering && this.props.sidebar && this.props.assignment.courseId > 0 && (
            <div className="mepr-assignment-meta">
              {__("Course", "memberpress-courses")}:
              {this.props.assignment.courseTitle}
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
    const actions = dispatch("memberpress/course/curriculum");
    return {
      updateLesson: actions.updateLesson,
      deleteSectionLesson: actions.deleteSectionLesson,
      deleteLesson: actions.deleteLesson,
      refreshSidebarAssignments: actions.refreshSidebarAssignments,
      publishLesson: actions.publishLesson
    };
  }),
  withSelect((select, props) => {
    return {
      curriculum: select("memberpress/course/curriculum").getAll(),
      post: select("core/editor").getCurrentPost(),
    };
  }),
])(Assignment);
