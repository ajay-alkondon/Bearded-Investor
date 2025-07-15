import BrandLogo from "../../../brand/components/BrandLogo.jsx";
import icons from "../lib/icons";
import { debounce } from "lodash";

import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { Component, Fragment } from '@wordpress/element';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "course",
      activePanels: [],
      activeMetaBoxes: [],
      width: window.innerWidth,
    };
    this.courseEditor = new meprCourseEditor();
    this.className = "#mpcs-admin-header";
  }

  componentDidMount() {
    // Check if we have hash params & redirect
    if (window.location.hash) {
      const tab = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
      this.setState({ activeTab: tab });
    }

    this.resetEditor(this.state.activeTab);
    window.addEventListener("resize", this.handleResize);
  }

  componentDidUpdate(prevProps) {
    this.resetEditor(this.state.activeTab, prevProps);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = debounce(() => {
    this.setState({ width: window.innerWidth });
  }, 1000);

  resetEditor(tabIndex = null, prev = {}) {
    const {
      openGeneralSidebar,
      isEditorSidebarOpened,
      isPublishSidebarOpened,
      isFullscreenMode,
      isDistractionFreeMode,
      toggleFeature,
      activeGeneralSidebarName,
    } = this.props;

    if(isDistractionFreeMode){
      console.log('You cannot enable "Distraction Free Mode" in courses');
      toggleFeature('distractionFree')
    }

    const isTabletOrSmaller = this.getCanvasWidth("Tablet");
    const bringToFront = activeGeneralSidebarName === 'mpcs-questions-sidebar/mpcs-questions-sidebar' && isTabletOrSmaller;

    // Dynamically set the height of the admin header.
    this.courseEditor.setHeaderHeight();

    // Hide the admin header when on mobile and the sidebar is opened.
    this.courseEditor.maybeHideHeader(isEditorSidebarOpened, isTabletOrSmaller);

    // Hide the Block Inserter if viewing a tab other than the main Course page.
    this.courseEditor.maybeHideBlockInserter(tabIndex);

    // Replace WP logo with the brand logo.
    if (isFullscreenMode) {
      setTimeout(() => {
        this.courseEditor.updateFullscreenLogoLink();
        this.courseEditor.setHeaderHeight();
      }, 100);

      setTimeout(() => {
        this.courseEditor.updateFullscreenLogoLink();
      }, 5000);
    }else{
      setTimeout(() => {
        this.courseEditor.setHeaderHeight();
      }, 100);
    }

    // Bring publishable sidebar above header if publishable sidebar is opened
    if (isPublishSidebarOpened || bringToFront) {
      this.courseEditor.addCSS(this.className, { "z-index": "0" });
    } else {
      this.courseEditor.addCSS(this.className, { "z-index": "999" });
    }

    // Show the right view, always show Lessons panel if tab is not course
    if (
      null !== activeGeneralSidebarName &&
      "edit-post/document" !== activeGeneralSidebarName &&
      "course" != this.state.activeTab
    ) {
      tabIndex = this.state.activeTab;
      openGeneralSidebar("edit-post/document").then((resolve) => {
        this.showView(tabIndex);
      });
    } else {
      this.showView(tabIndex);
    }
  }

  // Show appropriate view
  showView(tabIndex) {
    if (tabIndex == "curriculum") {
      this.courseEditor.showCurriculumView();
    } else if (tabIndex == "settings") {
      this.courseEditor.showSettingsView();
    } else if (tabIndex == "resources") {
      this.courseEditor.showResourcesView();
    } else if (tabIndex == "certificates") {
      this.courseEditor.showCertificatesView();
    } else {
      this.courseEditor.showDefaultView();
    }
  }

  // Toggle currently active tab
  handleTabClick = (tabIndex) => {
    if (tabIndex === this.state.activeTab) return;

    this.setState({
      activeTab: tabIndex,
    });

    this.resetEditor(tabIndex);
  };

  // Determine screen width
  getCanvasWidth = (device, actualWidth = this.state.width) => {
    let deviceWidth;

    switch (device) {
      case "Tablet":
        deviceWidth = 780;
        break;
      case "Mobile":
        deviceWidth = 360;
        break;
      default:
        return null;
    }

    return deviceWidth >= actualWidth;
  };

  tabClassName(tabName) {
    return "list-item " + (this.state.activeTab == tabName ? "active" : "");
  }

  // Returns edited post title or saved post title
  getPostTitle = () => {
    return this.props.postTitle;
  };

  render() {
    const { post } = this.props;
    return (
      <Fragment>
        <div id="mpcs-admin-header">
          <div className="logo">
            <BrandLogo />
            {!this.getCanvasWidth("Tablet") && (
              <span className="mpcs-header-title inline">
                {this.getPostTitle()}
              </span>
            )}
          </div>

          {this.getCanvasWidth("Tablet") && (
            <p className="mpcs-header-title block">{post.title}</p>
          )}

          {this.getCanvasWidth("Tablet") && null != MPCS_Course_Data.back_cta_label && (
            <p className="mpcs-header-title block">
              <a href={MPCS_Course_Data.back_cta_url} className="align-children" target="_self">
                <Icon icon={icons.arrowBack} size="14" />
                {"mpcs-course" == post.type && (
                  <span>{__("Back to Courses", "memberpress-courses")}</span>
                )}
                {(("mpcs-lesson" == post.type || "mpcs-quiz" == post.type)) && (
                  <span>
                    { MPCS_Course_Data.back_cta_label }
                  </span>
                )}
              </a>
            </p>
          )}

          <div className="mpcs-header-nav">
            {!this.getCanvasWidth("Tablet") && null != MPCS_Course_Data.back_cta_label && (
              <a href={MPCS_Course_Data.back_cta_url} className="align-children" target="_self">
                <Icon icon={icons.arrowBack} size="14" />
                {"mpcs-course" == post.type && (
                  <span className="mpcs-header-back-text">{__("Back to Courses", "memberpress-courses")}</span>
                )}
                {("mpcs-lesson" == post.type || "mpcs-quiz" == post.type) && (
                  <span className="mpcs-header-back-text">
                    { MPCS_Course_Data.back_cta_label }
                  </span>
                )}
              </a>
            )}

            {"mpcs-course" == post.type && (
              <ul>
                <li className={this.tabClassName("course")} data-index="course">
                  <a onClick={(e) => this.handleTabClick("course")} href="#">
                    {__("Course Page", "memberpress-courses")}
                  </a>
                </li>
                <li
                  className={this.tabClassName("curriculum")}
                  data-index="curriculum"
                >
                  <a
                    onClick={(e) => this.handleTabClick("curriculum")}
                    href="#"
                  >
                    {__("Curriculum", "memberpress-courses")}
                  </a>
                </li>
                {/* <li className={this.tabClassName("pricing")}>
                <a onClick={(e) => this.handleTabClick("pricing")} href="#">
                  {__("Pricing", "memberpress-courses")}
                </a>
              </li> */}
                <li
                  className={this.tabClassName("resources")}
                  data-index="resources"
                >
                  <a onClick={(e) => this.handleTabClick("resources")} href="#">
                    {__("Resources", "memberpress-courses")}
                  </a>
                </li>
                <li
                  className={this.tabClassName("settings")}
                  data-index="settings"
                >
                  <a onClick={(e) => this.handleTabClick("settings")} href="#">
                    {__("Settings", "memberpress-courses")}
                  </a>
                </li>
                <li
                  className={this.tabClassName("certificates")}
                  data-index="certificates"
                >
                  <a onClick={(e) => this.handleTabClick("certificates")} href="#">
                    {__("Certificate", "memberpress-courses")}
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default compose([
  withDispatch((dispatch, props) => {
    const { openGeneralSidebar } = dispatch("core/edit-post");
    const { toggleFeature } = dispatch("core/edit-post");

    return {
      openGeneralSidebar,
      toggleFeature,
    };
  }),
  withSelect((select, props) => {
    return {
      post: select("core/editor").getCurrentPost(),
      isFullscreenMode: select("core/edit-post").isFeatureActive(
        "fullscreenMode"
      ),
      isDistractionFreeMode: select("core/edit-post").isFeatureActive(
        "distractionFree"
      ),
      isPublishSidebarOpened: select("core/edit-post").isPublishSidebarOpened(),
      activeGeneralSidebarName: select(
        "core/edit-post"
      ).getActiveGeneralSidebarName(),
      isEditorSidebarOpened: select("core/edit-post").isEditorSidebarOpened(),
      postTitle: select('core/editor').getEditedPostAttribute('title'),
    };
  }),
])(Header);
