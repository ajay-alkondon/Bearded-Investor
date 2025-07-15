import "../style.scss";
import Lesson from "../components/Lesson";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";

import { Container } from "@edorivai/react-smooth-dnd";
import { debounce } from "lodash";

import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

class Lessons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAddingSection: false,
      search: "",
      isLoading: false,
      page: 1,
    };
    this.isSavingFlag = true;
  }
  componentDidMount() {
    this.props.refreshSidebarLessons(this.state.page);
  }

  getLessonPayload = (index) => {
    const { curriculum } = this.props;
    const sections = Object.values(curriculum.sections);
    let lesson = Object.values(curriculum.lessons.sidebar).reverse()[index];

    if (undefined == lesson.id) return;

    // If lesson exists in the current course section, return with the section ID
    for (let section of sections) {
      if (section.lessonIds.filter((l) => l == lesson.id)[0]) {
        return {
          external: true,
          sourceSectionId: section.id,
          sourceIndex: section.lessonIds.indexOf(lesson.id),
          lessonId: lesson.id,
          postType: 'mpcs-lesson',
        };
      }
    }

    return {
      external: true,
      sourceSectionId: null,
      lessonId: lesson.id,
      postType: 'mpcs-lesson',
      courseId: lesson.courseId,
      courseTitle: lesson.courseTitle,
    };
  };

  handleSearch = (search) => {
    this.setState({ search: search, isLoading: true });
    this.refreshSidebarLessons(search);
  };

  refreshSidebarLessons = debounce((search) => {
    this.props.refreshSidebarLessons(1, search).then((resolve) => {
      this.setState({ isLoading: false });
    });
  }, 300);

  handlePaginate = (e, page) => {
    e.preventDefault();

    this.setState({ page: page });
    this.props.refreshSidebarLessons(page, this.state.search);
  };

  render() {
    const { curriculum } = this.props;
    return (
      <div className="mepr-curriculum-panel mepr-curriculum-lessons">
        <PluginDocumentSettingPanel
          name="mpcs-lessons"
          title={__("Lessons", "memberpress-courses")}
          className="mepr-curriculum-panel mepr-curriculum-lessons"
          initialOpen={true}
        >
          {curriculum.lessons.sidebar && (
            <div className="mpcs-search-lessons">
              <input
                type="text"
                placeholder={__("Search Lessons", "memberpress-courses")}
                onChange={(e) => this.handleSearch(e.target.value)}
              />
              {this.state.isLoading && <Spinner />}
            </div>
          )}
          {curriculum.lessons.sidebar && (
            <Container
              groupName="lessons"
              dragHandleSelector=".mepr-lesson-drag-handle"
              getChildPayload={(index) => this.getLessonPayload(index)}
              dragClass="mepr-lesson-ghost"
              dropClass="mepr-lesson-ghost-drop"
            >
              {Object.entries(curriculum.lessons.sidebar)
                .reverse()
                .map(([key, lesson], index) => (
                  <Lesson
                    key={lesson.id}
                    lesson={lesson}
                    index={Object.keys(curriculum.lessons.sidebar).indexOf(key)}
                    sidebar={true}
                  />
                ))}

              {/* {Object.entries(curriculum.lessons.sidebar).map(
                ([key, lesson], index) => (
                  <Lesson
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    sidebar={true}
                  />
                )
              )} */}
              <Pagination
                paged={curriculum.lessonMeta.currentPage}
                maxPage={curriculum.lessonMeta.totalPages}
                handlePaginate={this.handlePaginate}
              />
            </Container>
          )}
        </PluginDocumentSettingPanel>
      </div>
    );
  }
}

export default compose([
  withDispatch((dispatch, props) => {
    const { refreshSidebarLessons } = dispatch("memberpress/course/curriculum");
    return {
      refreshSidebarLessons,
    };
  }),
  withSelect((select, props) => {
    return {
      curriculum: select("memberpress/course/curriculum").getAll(),
    };
  }),
])(Lessons);
