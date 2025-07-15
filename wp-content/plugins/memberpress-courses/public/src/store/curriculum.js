import apiFetch from '@wordpress/api-fetch';
import { select } from '@wordpress/data';

const initialState = MPCS_Course_Data.curriculum;

const reducer = (state = initialState, action) => {
  // console.log(action.type);
  switch (action.type) {
    case "ADD_SECTION":
      return Object.assign({}, state, {
        sections: { ...state.sections, ...action.section },
        sectionOrder: state.sectionOrder.concat(Object.keys(action.section)[0]),
      });

    case "UPDATE_SECTION":
      return Object.assign({}, state, {
        sections: action.newSections,
      });

    case "DELETE_SECTION":
      return Object.assign({}, state, {
        sections: action.newSections,
        sectionOrder: action.newSectionOrder,
      });

    case "REORDER_SECTION":
      return Object.assign({}, state, {
        sectionOrder: action.newSectionOrder,
      });

    case "MOVE_LESSONS_IN_SECTION":
      return Object.assign({}, state, {
        sections: {
          ...state.sections,
          [action.newSection.id]: action.newSection,
        },
      });

    case "MOVE_LESSONS_BTW_APPS":
      return Object.assign({}, state, {
        sections: {
          ...state.sections,
          [action.newSection.id]: action.newSection,
        },
        lessons: {
          ...state.lessons,
          section: action.newSectionLessons,
        },
      });

    case "MOVE_LESSONS_BTW_SECTIONS":
      return Object.assign({}, state, {
        sections: {
          ...state.sections,
          [action.newStart.id]: action.newStart,
          [action.newFinish.id]: action.newFinish,
        },
      });

    case "DELETE_SECTION_LESSON":
      return Object.assign({}, state, {
        sections: {
          ...state.sections,
          [action.newSection.id]: action.newSection,
        },
      });

    case "ADD_LESSON":
      return Object.assign({}, state, {
        lessons: action.newLessons,
        sections: {
          ...state.sections,
          [action.newSection.id]: action.newSection,
        },
      });

    case "UPDATE_LESSON":
      return Object.assign({}, state, {
        lessons: action.newLessons,
      });

    case "DELETE_LESSON":
      return Object.assign({}, state, {
        lessons: {
          ...state.lessons,
          sections: action.newLessons,
        },
      });

    case "FILTER_LESSONS":
      return Object.assign({}, state, {
        filtered: action.newLessons,
      });

    case "UNSAVED_CHANGES":
      return Object.assign({}, state, {
        unSavedChanges: action.status,
      });

    case "FETCH_LESSONS":
      return Object.assign({}, state, {
        lessons: {
          ...state.lessons,
          sidebar: action.lessons,
        },
        lessonMeta: {
          ...state.lessonMeta,
          totalPages: action.totalPages,
          currentPage: action.page,
        },
      });

    case "FETCH_QUIZZES":
      return Object.assign({}, state, {
        quizzes: {
          ...state.quizzes,
          sidebar: action.quizzes,
        },
        quizMeta: {
          ...state.quizMeta,
          totalPages: action.totalPages,
          currentPage: action.page,
        },
      });

    case "FETCH_ASSIGNMENTS":
      return Object.assign({}, state, {
        assignments: {
          ...state.assignments,
          sidebar: action.assignments,
        },
        assignmentMeta: {
          ...state.assignmentMeta,
          totalPages: action.totalPages,
          currentPage: action.page,
        },
      });

    case "DUPLICATE_LESSON":
      return state;

    case "REFRESH_CURRICULUM":
      return Object.assign({}, state, { ...action.curriculum });

    case "UPDATE_SECTION_LESSONS":
      return Object.assign({}, state, {
        lessons: {
          ...state.lessons,
          SECTION: action.lessons,
        },
      });

    case "UPDATE_SECTION_QUIZZES":
      return Object.assign({}, state, {
        quizzes: {
          ...state.quizzes,
          SECTION: action.quizzes,
        },
      });

    case "UPDATE_SECTION_ASSIGNMENTS":
      return Object.assign({}, state, {
        assignments: {
          ...state.assignments,
          SECTION: action.assignments,
        },
      });

    default:
      return state;
  }
};

const actions = {
  addSection(section) {
    return {
      type: "ADD_SECTION",
      section,
    };
  },
  reOrderSection(newSectionOrder) {
    return {
      type: "REORDER_SECTION",
      newSectionOrder,
    };
  },
  reorderLessons(newSection) {
    return {
      type: "MOVE_LESSONS_IN_SECTION",
      newSection,
    };
  },

  moveLessonsBtwApps(newSection, newSectionLessons) {
    return {
      type: "MOVE_LESSONS_BTW_APPS",
      newSection,
      newSectionLessons,
    };
  },

  moveLessonsBtwSections(newStart, newFinish) {
    return {
      type: "MOVE_LESSONS_BTW_SECTIONS",
      newStart,
      newFinish,
    };
  },
  *addLesson(curriculum, section, title, type) {
    const post = yield actions.pushToApi("wp/v2/" + type, {
      title,
      content: "",
      status: "draft",
    });

    if (post) {
      const newLesson = {
        [post.id]: {
          id: post.id,
          title: post.title.raw,
          href: post.link,
          status: post.status,
          type: type,
        },
      };

      const newLessons = {
        ...curriculum.lessons,
        section: {
          ...curriculum.lessons.section,
          ...newLesson,
        },
      };

      const sectionLessonIds = curriculum.sections[section.id].lessonIds;
      sectionLessonIds.push(post.id);

      const newSection = {
        ...curriculum.sections[section.id],
        lessonIds: sectionLessonIds,
      };

      return {
        type: "ADD_LESSON",
        newLessons,
        newSection,
      };
    }
  },

  *updateLesson(courses, lessonId, title, type) {
    const post = yield actions.pushToApi("wp/v2/" + type + "/" + lessonId, {
      title,
    });

    // Update lesson
    const newLessons = {
      ...courses.lessons,
      section: {
        ...courses.lessons.section,
        [lessonId]: {
          id: lessonId,
          title: post.title.raw,
          href: post.link,
          status: post.status,
          type
        },
      },
    };

    return {
      type: "UPDATE_LESSON",
      newLessons,
    };
  },

  *deleteLesson(lessonId, type, sidebar) {
    yield actions.deleteFromApi("wp/v2/" + type + "/" + lessonId);
    const curriculum = yield select(StoreKey).getAll();
    const { [lessonId]: value, ...newLessons } = sidebar;
    return {
      type: "DELETE_LESSON",
      newLessons,
    };
  },

  *publishLesson(courses, lessonId, type) {
    const post = yield actions.pushToApi("wp/v2/" + type + "/" + lessonId, {
      status : 'publish',
    });

    // Update lesson
    const newLessons = {
      ...courses.lessons,
      section: {
        ...courses.lessons.section,
        [lessonId]: {
          id: lessonId,
          title: post.title.raw,
          href: post.link,
          status: post.status,
          type
        },
      },
    };

    return {
      type: "UPDATE_LESSON",
      newLessons,
    };
  },
  deleteSectionLesson(newSection) {
    return {
      type: "DELETE_SECTION_LESSON",
      newSection,
    };
  },
  updateSection(newSections) {
    return {
      type: "UPDATE_SECTION",
      newSections,
    };
  },
  deleteSection(newSections, newSectionOrder) {
    return {
      type: "DELETE_SECTION",
      newSections,
      newSectionOrder,
    };
  },
  filterLessons(newLessons) {
    return {
      type: "FILTER_LESSONS",
      newLessons,
    };
  },

  isDirty(status) {
    return {
      type: "UNSAVED_CHANGES",
      status,
    };
  },

  *refreshSidebarLessons(page = 1, search = "") {
    const args = {
      paged: page,
      s: search,
      post_status: ['publish', 'draft', 'future']
    }
    const path = getPathString(MPCS_Course_Data.api.lessons, args);

    const posts = yield actions.fetchFromAPI({ path });
    posts.lessons = posts.lessons || {};
    const lessons = Object.values(posts.lessons)
      .map((post) => {
        return post;
      })
      .reduce((obj, post) => {
        obj[post.ID] = {
          id: post.ID,
          title: post.title,
          href: post.permalink,
          type: post.type,
          status: post.post_status,
          courseId: post.courseID,
          courseTitle: post.courseTitle,
        };
        return obj;
      }, {});

    return {
      type: "FETCH_LESSONS",
      lessons,
      page,
      totalPages: posts.meta.max,
    };
  },

  *refreshSidebarQuizzes(page = 1, search = "") {
    const args = {
      paged: page,
      s: search,
      post_status: ['publish', 'draft', 'future']
    }
    const path = getPathString(MPCS_Course_Data.api.quizzes, args);

    const posts = yield actions.fetchFromAPI({ path });
    posts.quizzes = posts.quizzes || {};
    const quizzes = Object.values(posts.quizzes)
      .map((post) => {
        return post;
      })
      .reduce((obj, post) => {
        obj[post.ID] = {
          id: post.ID,
          title: post.title,
          href: post.permalink,
          type: post.type,
          status: post.post_status,
          courseId: post.courseID,
          courseTitle: post.courseTitle,
        };

        return obj;
      }, {});

    return {
      type: "FETCH_QUIZZES",
      quizzes,
      page,
      totalPages: posts.meta.max,
    };
  },

  *refreshSidebarAssignments(page = 1, search = "") {
    const args = {
      paged: page,
      s: search,
      post_status: ['publish', 'draft', 'future']
    }
    const path = getPathString(MPCS_Course_Data.api.assignments, args);

    const posts = yield actions.fetchFromAPI({ path });
    posts.assignments = posts.assignments || {};
    const assignments = Object.values(posts.assignments)
      .map((post) => {
        return post;
      })
      .reduce((obj, post) => {
        obj[post.ID] = {
          id: post.ID,
          title: post.title,
          href: post.permalink,
          type: post.type,
          status: post.post_status,
          courseId: post.courseID,
          courseTitle: post.courseTitle,
        };

        return obj;
      }, {});

    return {
      type: "FETCH_ASSIGNMENTS",
      assignments,
      page,
      totalPages: posts.meta.max,
    };
  },

  *duplicateLesson(lessonId, courseId, lessonPostType) {
    let endpoint;

    if (lessonPostType === 'mpcs-quiz') {
      endpoint = 'quizzes';
    } else if (lessonPostType === 'mpcs-assignment') {
      endpoint = 'assignments';
    } else {
      endpoint = 'lessons';
    }

    const path = MPCS_Course_Data.api[endpoint] + lessonId;
    const newPost = yield actions.pushToApi(path, { courseId });

    return {
      type: "DUPLICATE_LESSON",
      newPost,
      courseId,
    };
  },

  *refreshCurriculum(courseId) {
    const path = MPCS_Course_Data.api.curriculum + courseId;
    const curriculum = yield actions.fetchFromAPI({ path });

    return {
      type: "REFRESH_CURRICULUM",
      curriculum,
    };
  },

  updateSectionLessons(lessons) {
    // const path = MPCS_Course_Data.api.curriculum + courseId;
    // const curriculum = yield actions.fetchFromAPI({path});
    return {
      type: "UPDATE_SECTION_LESSONS",
      lessons,
    };
  },

  updateSectionQuizzes(quizzes) {
    // const path = MPCS_Course_Data.api.curriculum + courseId;
    // const curriculum = yield actions.fetchFromAPI({path});
    return {
      type: "UPDATE_SECTION_QUIZZES",
      quizzes,
    };
  },

  updateSectionAssignments(assignments) {
    return {
      type: "UPDATE_SECTION_ASSIGNMENTS",
      assignments,
    };
  },

  // API Utilities Control Actions
  fetchFromAPI(args) {
    return {
      type: "FETCH_FROM_API",
      args,
    };
  },

  pushToApi(path, data) {
    return {
      type: "PUSH_TO_API",
      path,
      data,
    };
  },

  deleteFromApi(path, data) {
    return {
      type: "DELETE_FROM_API",
      path,
      data,
    };
  },

  fetchCurrentPost() {
    return {
      type: "FETCH_CURRENT_POST",
    };
  },
};

const controls = {
  FETCH_FROM_API(action) {
    return apiFetch(action.args);
  },
  PUSH_TO_API(action) {
    return apiFetch({ path: action.path, data: action.data, method: "POST" });
  },
  DELETE_FROM_API(action) {
    return apiFetch({ path: action.path, data: action.data, method: "DELETE" });
  },
  FETCH_CURRENT_POST() {
    return wp.data.select("core/editor").getCurrentPostId();
  },
};

const selectors = {
  getAll(state) {
    return state;
  },

  // Get latest added section. First filter to return only newly added sections and then reduce it to the latest
  getNewlyAddedSection(state) {
    const newlyAdded = Object.values(state.sections)
      .filter((section) => section.added > 0)
      .reduce(function (latest, section) {
        return (latest.added || 0) > section.added ? latest : section;
      }, {});
    return newlyAdded;
  },
};

const resolvers = {
  *getAll() {
    return;
  },
};

const getPathString = (path, args) => {
  args = Object.keys(args).map(function(key) {
    return key + '=' + args[key];
  }).join('&');
  return path+'?'+args;
};

export const StoreKey = "memberpress/course/curriculum";
export const StoreConfig = {
  selectors,
  actions,
  reducer,
  resolvers,
  controls: { ...wp.data.controls, ...controls },
};

// Sample Initial State
// ----
// const initialState = {
//   lessons: {
//     section: {
//       "lesson-1": { id: "lesson-1", title: "What is gender representation" },
//       "lesson-2": { id: "lesson-2", title: "A little history" },
//       "lesson-3": {
//         id: "lesson-3",
//         title: "Media monitoring in fact and fiction",
//       },
//       "lesson-4": { id: "lesson-4", title: "Need for gender representation" },
//       "lesson-5": { id: "lesson-5", title: "What is COVID-19" },
//       "lesson-6": { id: "lesson-6", title: "Key concepts and definitions" },
//     },
//     sidebar: {},
//   },
//   sections: {
//     "section-1": {
//       id: "section-1",
//       title: "Gender Representation in the Media",
//       lessonIds: ["lesson-1", "lesson-2", "lesson-3", "lesson-4"],
//     },
//     "section-2": {
//       id: "section-2",
//       title: "COVID-19: Understanding & Application",
//       lessonIds: ["lesson-5", "lesson-6"],
//     },
//   },
//   sectionOrder: ["section-1", "section-2"], // reordering of the sections
//   lessonMeta: { totalPages: "", currentPage: 0 },
// };
