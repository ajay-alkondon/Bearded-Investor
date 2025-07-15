import { registerPlugin } from '@wordpress/plugins';
import domReady from '@wordpress/dom-ready';

import "./style.scss";
import "./store/store";
import Assignments from "./views/Assignments";
import Curriculum from "./views/Curriculum";
import Lessons from "./views/Lessons";
import Quizzes from "./views/Quizzes";
import Header from "./views/Header";
import Settings from "./views/Settings";
import Resources from "./views/Resources";
import Certificates from "./views/Certificates";
import render from "./lib/render";


domReady(() => {
  render(<Header />, document.getElementById('mpcs-admin-header-wrapper'));
  render(<Curriculum />, document.getElementById('curriculum-builder'));
  render(<Resources />, document.getElementById('mpcs-resources-settings'));
  render(<Settings />, document.getElementById('mpcs-admin-settings'));
  render(<Certificates />, document.getElementById('mpcs-certificates-settings'));
});

registerPlugin("mpcs-lesson-panel", {
  render() {
    const postType = wp.data.select("core/editor").getCurrentPostType();
    if ("mpcs-course" !== postType) {
      return null;
    }
    return <Lessons />;
  },
  icon: "",
});

if (MPCS_Course_Data.activePlugins.quizzes) {
  registerPlugin("mpcs-quiz-panel", {
    render() {
      const postType = wp.data.select("core/editor").getCurrentPostType();
      if ("mpcs-course" !== postType) {
        return null;
      }
      return <Quizzes />;
    },
    icon: "",
  });
}

if (MPCS_Course_Data.activePlugins.assignments) {
  registerPlugin("mpcs-assignment-panel", {
    render() {
      const postType = wp.data.select("core/editor").getCurrentPostType();
      if ("mpcs-course" !== postType) {
        return null;
      }
      return <Assignments />;
    },
    icon: "",
  });
}
