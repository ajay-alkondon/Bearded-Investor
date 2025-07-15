import "../style.scss";
import Quiz from "../components/Quiz";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";

import { Container } from "@edorivai/react-smooth-dnd";
import { debounce } from "lodash";

import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

class Quizzes extends React.Component {
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
    this.props.refreshSidebarQuizzes(this.state.page);
  }

  getQuizPayload = (index) => {
    const { curriculum } = this.props;
    const sections = Object.values(curriculum.sections);
    let quiz = Object.values(curriculum.quizzes.sidebar).reverse()[index];

    if (undefined == quiz.id) return;

    // If quiz exists in the current course section, return with the section ID
    for (let section of sections) {
      if (section.lessonIds.filter((l) => l == quiz.id)[0]) {
        return {
          external: true,
          sourceSectionId: section.id,
          sourceIndex: section.lessonIds.indexOf(quiz.id),
          lessonId: quiz.id,
          postType: 'mpcs-quiz',
        };
      }
    }

    return {
      external: true,
      sourceSectionId: null,
      lessonId: quiz.id,
      postType: 'mpcs-quiz',
      quizId: quiz.id,
      courseId: quiz.courseId,
      courseTitle: quiz.courseTitle,
    };
  };

  handleSearch = (search) => {
    this.setState({ search: search, isLoading: true });
    this.refreshSidebarQuizzes(search);
  };

  refreshSidebarQuizzes = debounce((search) => {
    this.props.refreshSidebarQuizzes(1, search).then((resolve) => {
      this.setState({ isLoading: false });
    });
  }, 300);

  handlePaginate = (e, page) => {
    e.preventDefault();

    this.setState({ page: page });
    this.props.refreshSidebarQuizzes(page, this.state.search);
  };

  render() {
    const { curriculum } = this.props;

    return (
      <div className="mepr-curriculum-panel mepr-curriculum-quizzes">
        <PluginDocumentSettingPanel
          name="mpcs-quizzes"
          title={__("Quizzes", "memberpress-courses")}
          className="mepr-curriculum-panel mepr-curriculum-quizzes"
          initialOpen={true}
        >
          {curriculum.quizzes.sidebar && (
            <div className="mpcs-search-quizzes">
              <input
                type="text"
                placeholder={__("Search Quizzes", "memberpress-courses")}
                onChange={(e) => this.handleSearch(e.target.value)}
              />
              {this.state.isLoading && <Spinner />}
            </div>
          )}
          {curriculum.quizzes.sidebar && (
            <Container
              groupName="lessons"
              dragHandleSelector=".mepr-lesson-drag-handle"
              getChildPayload={(index) => this.getQuizPayload(index)}
              dragClass="mepr-lesson-ghost"
              dropClass="mepr-lesson-ghost-drop"
            >
              {Object.entries(curriculum.quizzes.sidebar)
                .reverse()
                .map(([key, quiz], index) => (
                  <Quiz
                    key={quiz.id}
                    quiz={quiz}
                    index={Object.keys(curriculum.quizzes.sidebar).indexOf(key)}
                    sidebar={true}
                  />
                ))}

              <Pagination
                paged={curriculum.quizMeta.currentPage}
                maxPage={curriculum.quizMeta.totalPages}
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
    const { refreshSidebarQuizzes } = dispatch("memberpress/course/curriculum");
    return {
      refreshSidebarQuizzes,
    };
  }),
  withSelect((select, props) => {
    return {
      curriculum: select("memberpress/course/curriculum").getAll(),
    };
  }),
])(Quizzes);
