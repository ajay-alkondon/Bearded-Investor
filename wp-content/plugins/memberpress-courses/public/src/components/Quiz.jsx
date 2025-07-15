import { Draggable } from "@edorivai/react-smooth-dnd";
import Editable from "./Editable";
import icons from "../lib/icons";
import Spinner from "../components/Spinner";
import { getPostEditUrl, getPostUrl, getViewQuizAttemptsUrl } from "../lib/helpers.js";
import { debounce } from "lodash";
import classNames from "classnames";
import { compose } from '@wordpress/compose';
import { Fragment, createRef } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { Icon, Animate } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

class Quiz extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovering: false,
      title: "",
      isEditing: false,
      loading: false,
    };

    this.type = "mpcs-quiz";
    this.inputRef = createRef();
  }

  /**
   * Deletes a Quiz
   * @param {type} quizId
   * @param {type} index
   */
  deleteOne(quizId, index) {
    const {
      curriculum,
      sectionId,
      sidebar,
      deleteLesson,
      deleteSectionLesson,
      refreshSidebarQuizzes,
    } = this.props;

    // Show loader
    this.setState({ loading: true });

    // Remove Quiz from lessonIds
    if (true == sidebar) {
      // Remove Quiz from course lessons and create a new object named newLessons

      // Loop through sections and remove the Quiz
      for (let [key, section] of Object.entries(curriculum.sections)) {
        const sectionLessonIds = section.lessonIds;
        const index = sectionLessonIds.indexOf(quizId);
        if (index >= 0) sectionLessonIds.splice(index, 1);

        const newSection = {
          ...section,
          lessonIds: sectionLessonIds,
        };

        deleteSectionLesson(newSection);
      }

      deleteLesson(quizId, this.type, curriculum.quizzes.sidebar).then((resolve) => {
        refreshSidebarQuizzes(curriculum.quizMeta.currentPage);
        this.setState({ loading: false });
      });

      return;
    }

    // Remove Quiz from Sections
    const sectionLessonIds = curriculum.sections[sectionId].lessonIds;
    sectionLessonIds.splice(index, 1);

    const newSection = {
      ...curriculum.sections[this.props.sectionId],
      lessonIds: sectionLessonIds,
    };

    deleteSectionLesson(newSection);
  }

  publishOne = debounce((quizId) => {
    const { publishLesson, refreshSidebarQuizzes, curriculum } = this.props;

    this.setState({ loading: true });

    publishLesson(curriculum, quizId, this.type).then((resolve) => {
      refreshSidebarQuizzes(curriculum.quizMeta.currentPage);
      this.setState({ loading: false });
    });
  }, 1000);

  updateOne = debounce((title, quizId) => {
    const { updateLesson, refreshSidebarQuizzes, curriculum } = this.props;
    updateLesson(curriculum, quizId, title, this.type).then((resolve) => {
      refreshSidebarQuizzes(curriculum.quizMeta.currentPage);
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
    const { quiz, post } = this.props;
    const isHovering = this.state.isHovering;
    const hasCourse = quiz.courseId > 0;
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
            isHovering && hasCourse ? "mepr-quiz mpcs-card" : "mepr-quiz"
          }
          onMouseEnter={() => this.handleMouseEnter(this.props.index)}
          onMouseLeave={() => this.handleMouseLeave(this.props.index)}
          data-post={quiz.id}
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

          {!this.props.sidebar && quiz.status && quiz.status == 'draft' && (
            <i className="mpcs-lesson-draft-icon"></i>
          )}

          {!this.props.sidebar && quiz.status && quiz.status != 'draft' && (
            <i className="mpcs-quiz-icon"></i>
          )}

          <Editable
            lesson={quiz}
            text={quiz.title}
            placeholder={__("Quiz title", "memberpress-courses")}
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
              name={quiz.id}
              placeholder={__("Quiz title", "memberpress-courses")}
              value={this.state.title}
              onChange={(e) => this.handleChange(e.target.value, quiz.id)}
            />
          </Editable>

          {isHovering && (
            <div className="mepr-actions">
              <Animate options={{ origin: "middle center" }} type="appear">
                {({ className }) => (
                  <a
                    className={className}
                    href={getPostUrl(quiz.href)}
                    title={__("View Quiz", "memberpress-courses")}
                  >
                    <Icon icon={icons.view} size={iconSize} />
                  </a>
                )}
              </Animate>
              <Animate options={{ origin: "middle left" }} type="appear">
                {({ className }) => (
                  <a className={className} href={getPostEditUrl(quiz.id)} target="_self" title={__("Edit Quiz", "memberpress-courses")}
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
                    title={__("Delete Quiz", "memberpress-courses")}
                    onClick={() => this.deleteOne(quiz.id, this.props.index)}
                  >
                    <Icon icon={deleteIcon} size={iconSize} />{" "}
                  </a>
                )}
              </Animate>
              {!this.props.sidebar && quiz.hasAttempts && (
                <Animate options={{ origin: "bottom center" }} type="appear">
                  {({ className }) => (
                    <a className={classNames(className, 'mpcs-quiz-view-attempts')} href={getViewQuizAttemptsUrl(quiz.id, post.id)}>
                      {__('View Attempts', 'memberpress-courses')}
                    </a>
                  )}
                </Animate>
              )}


              {quiz.status && 'draft' == quiz.status && !this.props.sidebar && (
                <Animate options={{ origin: "bottom center" }} type="appear">
                  {({ className }) => (
                    <a
                      className={className + " mpcs-publish-lesson"}
                      href="#0"
                      onClick={() => this.publishOne(quiz.id)}
                    >
                      {__("Publish", "memberpress-courses")}
                    </a>
                  )}
                </Animate>
              )}
            </div>
          )}

          {isHovering && this.props.sidebar && this.props.quiz.courseId > 0 && (
            <div className="mepr-quiz-meta">
              {__("Course", "memberpress-courses")}:
              {this.props.quiz.courseTitle}
            </div>
          )}

          {this.state.loading && <Spinner />}

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
      refreshSidebarQuizzes,
      publishLesson
    } = dispatch("memberpress/course/curriculum");
    return {
      updateLesson,
      deleteSectionLesson,
      deleteLesson,
      refreshSidebarQuizzes,
      publishLesson
    };
  }),
  withSelect((select, props) => {
    return {
      curriculum: select("memberpress/course/curriculum").getAll(),
      post: select("core/editor").getCurrentPost(),
    };
  }),
])(Quiz);
