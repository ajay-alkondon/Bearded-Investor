import Tooltip from "../components/Tooltip";
import { getSettingName } from "../lib/helpers.js";
import { TextControl, ToggleControl, __experimentalNumberControl as NumberControl, SelectControl, CheckboxControl, TextareaControl } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { Component, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

class Settings extends Component {
  constructor(props) {
    super(props);
  }

  handleShowAnswersChange() {
    const { settings, updateSettings } = this.props;
    const disabling = settings.showAnswers.value === "enabled";

    if (!disabling) {
      updateSettings(
        "showResults",
        "enabled"
      )
    }

    updateSettings(
      "showAnswers",
      disabling ? "disabled" : "enabled"
    )
  }

  componentDidUpdate(prevProps) {
    const { settings, isDirty, editPost } = this.props;
    if (settings !== prevProps.settings) {
      editPost({ dirty: "true" }); // Activates 'beforeunload.edit-post'
      isDirty(true); // Activates modal
    }
  }

  render() {
    const { settings, updateSettings } = this.props;

    return (
      <Fragment>
        <div className="form-group">
          <label>
            {__("Include in Course Listing", "memberpress-courses")}
            <Tooltip
              heading={__("Include in Course Listing", "memberpress-courses")}
              message={__(
                "When enabled, this course will be shown on your main courses page. Turn this setting off to hide this course from being found in the main course listing page.",
                "memberpress-courses"
              )}
            />
          </label>
          <ToggleControl
            checked={settings.status.value === "enabled"}
            onChange={() =>
              updateSettings(
                "status",
                settings.status.value === "enabled" ? "disabled" : "enabled"
              )
            }
          />
          <TextControl
            name={getSettingName("status")}
            type="hidden"
            value={settings.status.value}
          />
        </div>

        <div className="form-group">
          <label>
            {__("Lesson Title", "memberpress-courses")}
            <Tooltip
              heading={__("Lesson Title", "memberpress-courses")}
              message={__(
                "When enabled, the title of the lesson will appear above the content when a student is viewing a Lesson. This only applies when ReadyLaunch™ templates are in use.",
                "memberpress-courses"
              )}
            />
          </label>
          <ToggleControl
            checked={settings.lessonTitle.value === "enabled"}
            onChange={() =>
              updateSettings(
                "lessonTitle",
                settings.lessonTitle.value === "enabled" ? "disabled" : "enabled"
              )
            }
          />
          <TextControl
            name={getSettingName("lessonTitle")}
            type="hidden"
            value={settings.lessonTitle.value}
          />
        </div>

        <div className="form-group">
          <label>
            <span>{__("Sales Page", "memberpress-courses")}</span>
            <Tooltip
              heading={__("Sales Page", "memberpress-courses")}
              message={__(
                "If the Sales page URL is set for the course then the course URL will simply redirect to the Sales page.",
                "memberpress-courses"
              )}
            />
          </label>
          <TextControl
            value={settings.salesUrl.value}
            className="regular-text"
            onChange={(value) => updateSettings("salesUrl", value)}
            name={getSettingName("salesUrl")}
          />
        </div>

        <div className="form-group">
          <label>
            <span>{__("Require Previous Lesson/Quiz", "memberpress-courses")}</span>
            <Tooltip
              heading={__("Require Previous Lesson/Quiz", "memberpress-courses")}
              message={__(
                "Enable this option to require the previous lesson/quiz to be complete before the next lesson/quiz can be started. Note: The first lesson of a section will require the last lesson/quiz of the previous section to be completed.",
                "memberpress-courses"
              )}
            />
          </label>
          <ToggleControl
            disabled={settings.quiz_requires_passing_score === true || 'enabled' == settings.dripping.value}
            checked={settings.requirePrevious.value === "enabled"}
            onChange={() =>
              updateSettings(
                "requirePrevious",
                settings.requirePrevious.value === "enabled" ? "disabled" : "enabled"
              )
            }
          />
          <TextControl
            name={getSettingName("requirePrevious")}
            type="hidden"
            value={settings.requirePrevious.value}
          />
        </div>

        <div className="form-group">
          <label>
            <span>{__("Show Question Results", "memberpress-courses")}</span>
            <Tooltip
              heading={__("Show Question Results", "memberpress-courses")}
              message={__(
                "Selecting this option will show students whether the answer they provided was correct or incorrect. Disable this option if you do not want students to know which questions they answered correctly.",
                "memberpress-courses"
              )}
            />
          </label>
          <ToggleControl
            checked={settings.showResults.value === "enabled"}
            disabled={settings.showAnswers.value === "enabled"}
            onChange={() =>
              updateSettings(
                "showResults",
                settings.showResults.value === "enabled" ? "disabled" : "enabled"
              )
            }
          />
          <TextControl
            name={getSettingName("showResults")}
            type="hidden"
            value={settings.showResults.value}
          />
        </div>

        <div className="form-group">
          <label>
            <span>{__("Show Question Answers", "memberpress-courses")}</span>
            <Tooltip
              heading={__("Show Question Answers", "memberpress-courses")}
              message={__(
                "Select this option if you want to show students the correct answers after they complete the quiz.",
                "memberpress-courses"
              )}
            />
          </label>
          <ToggleControl
            checked={settings.showAnswers.value === "enabled"}
            onChange={ () => this.handleShowAnswersChange() }
          />
          <TextControl
            name={getSettingName("showAnswers")}
            type="hidden"
            value={settings.showAnswers.value}
          />
        </div>

        <div className="form-group">
          <label>
            <span>{__("Show Accordion on Course Page", "memberpress-courses")}</span>
            <Tooltip
                heading={__("Show Accordion on Course Page", "memberpress-courses")}
                message={__(
                    "Select this option if you have a lot of lessons and want to display them on course page in accordion.",
                    "memberpress-courses"
                )}
            />
          </label>
          <ToggleControl
              checked={settings.accordionCourse.value === "enabled"}
              onChange={ () =>
                  updateSettings(
                      "accordionCourse",
                      settings.accordionCourse.value === "enabled" ? "disabled" : "enabled"
                  )
              }
          />
          <TextControl
              name={getSettingName("accordionCourse")}
              type="hidden"
              value={settings.accordionCourse.value}
          />
        </div>

        <div className="form-group">
          <label>
            <span>{__("Show Accordion on Sidebar", "memberpress-courses")}</span>
            <Tooltip
                heading={__("Show Accordion on Sidebar", "memberpress-courses")}
                message={__(
                    "Select this option if you have a lot of lessons and want to show lessons in the sidebar of lesson pages in accordion.",
                    "memberpress-courses"
                )}
            />
          </label>
          <ToggleControl
              checked={settings.accordionSidebar.value === "enabled"}
              onChange={ () =>
                  updateSettings(
                      "accordionSidebar",
                      settings.accordionSidebar.value === "enabled" ? "disabled" : "enabled"
                  )
              }
          />
          <TextControl
              name={getSettingName("accordionSidebar")}
              type="hidden"
              value={settings.accordionSidebar.value}
          />
        </div>

        <div className="form-group">
          <label>
            <span>{__("Enable Dripping", "memberpress-courses")}</span>
            <Tooltip
                heading={__("Enable Dripping", "memberpress-courses")}
                message={__(
                    "When enabled, Lessons and Quizzes can be dripped on a fixed schedule after a user starts the course. It will also enable 'Require Previous Lesson/Quiz' feature.",
                    "memberpress-courses"
                )}
            />
          </label>
          <ToggleControl
              checked={settings.dripping.value === "enabled"}
              onChange={() => {
                const newValue = settings.dripping.value === "enabled" ? "disabled" : "enabled";
                updateSettings("dripping", newValue);

                if (newValue === "enabled") {
                  updateSettings("requirePrevious", "enabled");
                }
              }}
          />
          <TextControl
              name={getSettingName("dripping")}
              type="hidden"
              value={settings.dripping.value}
          />
        </div>


        {settings.dripping.value === "enabled" && (
        <div className="form-group-dripping">
          <div className="form-group">
              <label>
                <span>{__("Drip Type", "memberpress-courses")}</span>
              </label>
              <SelectControl
                name={getSettingName("drip_type")}
                options={[
                  { label: __("By Section", "memberpress-courses"), value: 'section' },
                  { label: __("By Item", "memberpress-courses"), value: 'item' },
                ]}
                value={ settings.drip_type.value }
                onChange={(value) => updateSettings("drip_type", value)}
              />
          </div>
          {settings.drip_type.value === "item" && (
          <div className="mpcs-items-to-drip-wrapper">
            <div className="form-group">
                <label>
                  <span>{__("Items to Drip", "memberpress-courses")}</span>
                </label>
                <CheckboxControl
                  className="mpcs-dripping-checkbox-control"
                  label={__("Lessons", "memberpress-courses")}
                  checked={settings.drip_lessons.value == '1'}
                  name={getSettingName("drip_lessons")}
                  onChange={(newValue) => updateSettings('drip_lessons', newValue)}
                />
                {MPCS_Course_Data.activePlugins.quizzes && (
                  <CheckboxControl
                    className="mpcs-dripping-checkbox-control"
                    label={__("Quizzes", "memberpress-courses")}
                    checked={settings.drip_quizzes.value == '1'}
                    name={getSettingName("drip_quizzes")}
                    onChange={(newValue) => updateSettings('drip_quizzes', newValue)}
                  />
                )}
                {MPCS_Course_Data.activePlugins.assignments && (
                  <CheckboxControl
                    className="mpcs-dripping-checkbox-control"
                    label={__("Assignments", "memberpress-courses")}
                    checked={settings.drip_assignments.value == '1'}
                    name={getSettingName("drip_assignments")}
                    onChange={(newValue) => updateSettings('drip_assignments', newValue)}
                  />
                )}
            </div>
          </div>
          )}
          <div className="form-group">
              <label>
                <span>{__("Not Dripped Message", "memberpress-courses")}</span>
                <Tooltip
                  heading={__("Not Dripped Message", "memberpress-courses")}
                  message={<div dangerouslySetInnerHTML={{ __html: __(
                    "<p>This message is shown when a user attempts to view a Lesson, Quiz or Assignment that is not yet available to them. You can use the following parameters in this message to show dynamic content such as dates or schedules. <strong>{mpcs_drip_date}</strong> - The date the item will be available to the current user.<br> <strong>{mpcs_drip_schedule}</strong> - The dripping schedule. Ex: 1 week(s) <br /> <strong>{mpcs_drip_timezone}</strong> The dripping timezone.<br> <strong>{mpcs_drip_time}</strong> - The dripping time<br> <strong>{mpcs_item_type}</strong> - The type of item being viewed. Could be Lesson or Quiz.</p>",
                    "memberpress-courses"
                  )}} />}
                  edge="right"
              />
              </label>
            
              <TextareaControl
                className="mpcs-dripping-textarea"
                name={getSettingName("not_dripped_message")}
                value={ settings.not_dripped_message.value }
                onChange={(newValue) => updateSettings('not_dripped_message', newValue)}
              />
          </div>
          <div className="form-group">
              <label>
                <span>{__("Drip Frequency", "memberpress-courses")}</span>
                <Tooltip
                  heading={__("Drip Frequency", "memberpress-courses")}
                  message={<div dangerouslySetInnerHTML={{ __html: __(
                  "<p>This setting controls how often content is released to users. <br /><strong>Drip Amount:</strong> Specify the number of units. <br><strong>Frequency:</strong> Choose the frequency at which content should be dripped: daily, weekly, or monthly. <br><strong>Types:</strong> Select the basis for the frequency: course start date, fixed date, or completion of the previous item.</p>",
                  "memberpress-courses"
                  )}} />}
                  edge="right"
              />
              </label>
              <NumberControl
                className="mpcs-dripping-amount-control"
                isShiftStepEnabled={true}
                min="1"
                max="365"
                name={getSettingName("drip_amount")}
                onChange={(value) =>
                  updateSettings('drip_amount', value)
                }
                value={settings.drip_amount.value}
              />

              <SelectControl
                name={getSettingName("drip_frequency")}
                className="mpcs-dripping-frequency-control"
                value={ settings.drip_frequency.value }
                options={[
                  { label: __("Daily", "memberpress-courses"), value: 'daily' },
                  { label: __("Weekly", "memberpress-courses"), value: 'weekly' },
                  { label: __("Monthly", "memberpress-courses"), value: 'monthly' },
                ]}
                onChange={(newValue) => updateSettings('drip_frequency', newValue)}
              />

              <label className="mpcs-drip-frequency-type-label">
                <span>{__("from", "memberpress-courses")}</span>
              </label>

              <SelectControl
                name={getSettingName("drip_frequency_type")}
                className="mpcs-dripping-frequency-control"
                value={ settings.drip_frequency_type.value }
                options={[
                  { label: __("Course Start Date", "memberpress-courses"), value: 'course_start_date' },
                  { label: __("Fixed Date", "memberpress-courses"), value: 'fixed_date' },
                  {
                    label: settings.drip_type.value === 'section'
                      ? __("Previous Section Completed", "memberpress-courses")
                      : __("Previous Item Completed", "memberpress-courses"),
                    value: 'previous_item_completed'
                  },
                ]}
                onChange={(newValue) => updateSettings('drip_frequency_type', newValue)}
              />

              {settings.drip_frequency_type.value === "fixed_date" && (
                <TextControl
                  className="mpcs-dripping-fixed-date-control"
                  name={getSettingName("drip_frequency_fixed_date")}
                  type="date"
                  value={settings.drip_frequency_fixed_date.value}
                  onChange={(newValue) => updateSettings('drip_frequency_fixed_date', newValue)}
                />
              )}

          </div>
          
           <div className="form-group">
              <label>
                <span>{__("Drip Time", "memberpress-courses")}</span>
              </label>
              <SelectControl
                className="mpcs-dripping-time-control"
                name={getSettingName("drip_time")}
                value={ settings.drip_time.value }
                options={ JSON.parse( MPCS_Course_Data.dripping_time_intervals )}
                onChange={(newValue) => updateSettings('drip_time', newValue)}
              />
              <SelectControl
                className="mpcs-dripping-timezone-control"
                name={getSettingName("drip_timezone")}
                value={ settings.drip_timezone.value }
                options={ JSON.parse( MPCS_Course_Data.dripping_drip_timezones ) }
                onChange={(newValue) => updateSettings('drip_timezone', newValue)}
              />
          </div>
        </div>
        )}
      </Fragment>
    );
  }
}

export default compose([
  withDispatch((dispatch) => {
    const { updateSettings } = dispatch("memberpress/course/settings");
    const { isDirty } = dispatch("memberpress/course/curriculum");
    const { editPost } = dispatch("core/editor");

    return {
      updateSettings,
      editPost,
      isDirty
    };
  }),
  withSelect((select) => {
    return {
      settings: select("memberpress/course/settings").getAll(),
    };
  }),
])(Settings);
