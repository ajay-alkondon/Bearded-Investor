import "../style.scss";
import Assignment from "../components/Assignment";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";

import { Container } from "@edorivai/react-smooth-dnd";
import { debounce } from "lodash";

import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

class Assignments extends React.Component {
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
    this.props.refreshSidebarAssignments(this.state.page);
  }

  getAssignmentPayload = (index) => {
    const { curriculum } = this.props;
    const sections = Object.values(curriculum.sections);
    let assignment = Object.values(curriculum.assignments.sidebar).reverse()[index];

    if (undefined == assignment.id) return;

    // If assignment exists in the current course section, return with the section ID
    for (let section of sections) {
      if (section.lessonIds.filter((l) => l == assignment.id)[0]) {
        return {
          external: true,
          sourceSectionId: section.id,
          sourceIndex: section.lessonIds.indexOf(assignment.id),
          lessonId: assignment.id,
          postType: 'mpcs-assignment',
        };
      }
    }

    return {
      external: true,
      sourceSectionId: null,
      lessonId: assignment.id,
      postType: 'mpcs-assignment',
      courseId: assignment.courseId,
      courseTitle: assignment.courseTitle,
    };
  };

  handleSearch = (search) => {
    this.setState({ search: search, isLoading: true });
    this.refreshSidebarAssignments(search);
  };

  refreshSidebarAssignments = debounce((search) => {
    this.props.refreshSidebarAssignments(1, search).then((resolve) => {
      this.setState({ isLoading: false });
    });
  }, 300);

  handlePaginate = (e, page) => {
    e.preventDefault();

    this.setState({ page: page });
    this.props.refreshSidebarAssignments(page, this.state.search);
  };

  render() {
    const { curriculum } = this.props;

    return (
      <div className="mepr-curriculum-panel mepr-curriculum-assignments">
        <PluginDocumentSettingPanel
          name="mpcs-assignments"
          title={__("Assignments", "memberpress-courses")}
          className="mepr-curriculum-panel mepr-curriculum-assignments"
          initialOpen={true}
        >
          {curriculum.assignments.sidebar && (
            <div className="mpcs-search-assignments">
              <input
                type="text"
                placeholder={__("Search Assignments", "memberpress-courses")}
                onChange={(e) => this.handleSearch(e.target.value)}
              />
              {this.state.isLoading && <Spinner />}
            </div>
          )}
          {curriculum.assignments.sidebar && (
            <Container
              groupName="lessons"
              dragHandleSelector=".mepr-lesson-drag-handle"
              getChildPayload={(index) => this.getAssignmentPayload(index)}
              dragClass="mepr-lesson-ghost"
              dropClass="mepr-lesson-ghost-drop"
            >
              {Object.entries(curriculum.assignments.sidebar)
                .reverse()
                .map(([key, assignment], index) => (
                  <Assignment
                    key={assignment.id}
                    assignment={assignment}
                    index={Object.keys(curriculum.assignments.sidebar).indexOf(key)}
                    sidebar={true}
                  />
                ))}

              <Pagination
                paged={curriculum.assignmentMeta.currentPage}
                maxPage={curriculum.assignmentMeta.totalPages}
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
    const { refreshSidebarAssignments } = dispatch("memberpress/course/curriculum");
    return {
      refreshSidebarAssignments,
    };
  }),
  withSelect((select, props) => {
    return {
      curriculum: select("memberpress/course/curriculum").getAll(),
    };
  }),
])(Assignments);
