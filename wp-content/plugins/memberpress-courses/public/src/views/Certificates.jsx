import {getSettingName} from "../lib/helpers.js";
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { 
  TextControl, 
  TextareaControl, 
  ToggleControl, 
  Button, 
  ColorPicker, 
  SelectControl, 
  CheckboxControl 
} from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { Component, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

class Certificates extends Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps) {
        const {settings, editPost} = this.props;
        if (settings !== prevProps.settings) {
            editPost({dirty: "true"}); // Activates 'beforeunload.edit-post'
        }
    }

    render() {
        const {settings, updateSettings} = this.props;

        return (
            <Fragment>
                <div className="form-group">
                    <label>{__("Enable certificate on this course", "memberpress-courses")}</label>
                    <ToggleControl
                        checked={settings.certificates.value === "enabled"}
                        onChange={() =>
                            updateSettings(
                                "certificates",
                                settings.certificates.value === "enabled" ? "disabled" : "enabled"
                            )
                        }
                    />
                    <TextControl
                        name={getSettingName("certificates")}
                        type="hidden"
                        value={settings.certificates.value}
                    />
                </div>
                <div className={settings.certificates.value === "enabled" ? undefined : 'hidden'}>
                    <div className="form-group">
                        <label>{__("Force PDF download", "memberpress-courses")}</label>
                        <ToggleControl
                            checked={settings.certificates_force_download_pdf.value === "enabled"}
                            onChange={() =>
                                updateSettings(
                                    "certificates_force_download_pdf",
                                    settings.certificates_force_download_pdf.value === "enabled" ? "disabled" : "enabled"
                                )
                            }
                        />
                        <TextControl
                            name={getSettingName("certificates_force_download_pdf")}
                            type="hidden"
                            value={settings.certificates_force_download_pdf.value}
                        />
                    </div>
                    <div className="form-group ">
                        <label>{__("Paper Size", "memberpress-courses")}</label>
                        <SelectControl
                            value={ settings.certificates_paper_size.value }
                            options={ [
                                { label: 'A4', value: 'A4' },
                                { label: 'Letter', value: 'letter' },
                            ] }
                            onChange={(newSize) => updateSettings(
                                "certificates_paper_size",
                                newSize
                            )}
                            __nextHasNoMarginBottom
                        />
                        <TextControl
                            name={getSettingName("certificates_paper_size")}
                            type="hidden"
                            value={settings.certificates_paper_size.value}
                        />
                    </div>
                    <div className="form-group">
                        <label>{__("Select style", "memberpress-courses")}</label>
                        <div className={"mpcs-certificate-style-selector"}>
                            <div
                                className={`mpcs-certificate-style ${settings.certificates_style.value === 'style_a' ? 'selected': ''}`}
                                onClick={() => {
                                    updateSettings(
                                        "certificates_style",
                                        "style_a"
                                    );
                                }}
                            >
                                <img src={`${settings.certificates_style.base_img_url}/Certificate_1-pdf.jpg`}/>
                            </div>
                            <div
                                className={`mpcs-certificate-style ${settings.certificates_style.value === 'style_b' ? 'selected': ''}`}
                                onClick={() => {
                                    updateSettings(
                                        "certificates_style",
                                        "style_b"
                                    );
                                }}
                            >
                                <img src={`${settings.certificates_style.base_img_url}/Certificate_2-pdf.jpg`}/>
                            </div>
                            <div
                                className={`mpcs-certificate-style ${settings.certificates_style.value === 'style_c' ? 'selected': ''}`}
                                onClick={() => {
                                    updateSettings(
                                        "certificates_style",
                                        "style_c"
                                    );
                                }}
                            >
                                <img src={`${settings.certificates_style.base_img_url}/Certificate_3-pdf.jpg`}/>
                            </div>
                        </div>
                        <TextControl
                            name={getSettingName("certificates_style")}
                            type="hidden"
                            value={settings.certificates_style.value}
                        />
                    </div>
                    <div className="form-group">
                        <label>{__("Upload a logo", "memberpress-courses")}</label>
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={(media) => {
                                    updateSettings(
                                        "certificates_logo",
                                        media.url
                                    );
                                }
                                }
                                allowedTypes={['image']}
                                value={settings.certificates_logo.value}
                                render={({open}) => (
                                    <Button onClick={open}>{__("Open Media Library", "memberpress-courses")}</Button>
                                )}
                            />
                        </MediaUploadCheck>
                        <img src={settings.certificates_logo.value} className={"preview-image"}/>
                        <span className="remove-button" hidden={settings.certificates_logo.value.length == 0} onClick={(media) => {
                            updateSettings(
                                "certificates_logo",
                                ""
                            );
                        }
                        }> {__("Remove", "memberpress-courses")}</span>

                        <TextControl
                            name={getSettingName("certificates_logo")}
                            type="hidden"
                            value={settings.certificates_logo.value}
                        />
                    </div>
                    <div className="form-group">
                        <label>{__("Bottom logo", "memberpress-courses")}</label>

                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={(media) => {
                                    updateSettings(
                                        "certificates_bottom_logo",
                                        media.url
                                    );
                                }
                                }
                                allowedTypes={['image']}
                                value={settings.certificates_bottom_logo.value}
                                render={({open}) => (
                                    <Button onClick={open}>{__("Open Media Library", "memberpress-courses")}</Button>
                                )}
                            />
                        </MediaUploadCheck>
                        <img src={settings.certificates_bottom_logo.value} className={"preview-image"}/>
                        <span className="remove-button" hidden={settings.certificates_bottom_logo.value.length == 0}
                              onClick={(media) => {
                                  updateSettings(
                                      "certificates_bottom_logo",
                                      ""
                                  );
                              }
                              }> {__("Remove", "memberpress-courses")}</span>
                        <TextControl
                            name={getSettingName("certificates_bottom_logo")}
                            type="hidden"
                            value={settings.certificates_bottom_logo.value}
                        />
                    </div>
                    <div className="form-group">
                        <label>{__("Instructor Signature", "memberpress-courses")}</label>

                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={(media) => {
                                    updateSettings(
                                        "certificates_instructor_signature",
                                        media.url
                                    );
                                }
                                }
                                allowedTypes={['image']}
                                value={settings.certificates_instructor_signature.value}
                                render={({open}) => (
                                    <Button onClick={open}>{__("Open Media Library", "memberpress-courses")}</Button>
                                )}
                            />
                        </MediaUploadCheck>
                        <img src={settings.certificates_instructor_signature.value} className={"preview-image"}/>
                        <span className="remove-button" hidden={settings.certificates_instructor_signature.value.length == 0}
                              onClick={(media) => {
                                  updateSettings(
                                      "certificates_instructor_signature",
                                      ""
                                  );
                              }
                              }> {__("Remove", "memberpress-courses")}</span>
                        <TextControl
                            name={getSettingName("certificates_instructor_signature")}
                            type="hidden"
                            value={settings.certificates_instructor_signature.value}
                        />
                    </div>
                    <div className="form-group">
                        <label>{__("Title", "memberpress-courses")}</label>
                        <TextControl
                            name={getSettingName("certificates_title")}
                            onChange={(value) => updateSettings(
                                "certificates_title",
                                value
                            )}
                            value={settings.certificates_title.value}
                        />
                    </div>
                    <div className="form-group">
                        <label>{__("Instructor Name", "memberpress-courses")}</label>
                        <TextControl
                            name={getSettingName("certificates_instructor_name")}
                            onChange={(value) => updateSettings(
                                "certificates_instructor_name",
                                value
                            )}
                            value={settings.certificates_instructor_name.value}
                        />
                    </div>
                    <div className="form-group">
                        <label>{__("Instructor Title", "memberpress-courses")}</label>
                        <TextControl
                            name={getSettingName("certificates_instructor_title")}
                            onChange={(value) => updateSettings(
                                "certificates_instructor_title",
                                value
                            )}
                            value={settings.certificates_instructor_title.value}
                        />
                    </div>
                    <div className="form-group">
                        <label>{__("Footer message", "memberpress-courses")}</label>
                        <TextareaControl
                            name={getSettingName("certificates_footer_message")}
                            onChange={(value) => updateSettings(
                                "certificates_footer_message",
                                value
                            )}
                            value={settings.certificates_footer_message.value}
                        />
                    </div>
                    <div className="form-group">
                        <label>{__("Text color", "memberpress-courses")}</label>

                        <ColorPicker
                            color={settings.certificates_text_color.value}
                            onChangeComplete={(color) => {
                                updateSettings(
                                    "certificates_text_color",
                                    color.hex
                                );
                            }
                            }
                            defaultValue="#000"
                        />

                        <TextControl
                            name={getSettingName("certificates_text_color")}
                            type="hidden"
                            value={settings.certificates_text_color.value}
                        />
                    </div>
                    <div className="form-group">
                        <label>{__("Completion Date", "memberpress-courses")}</label>

                        <ToggleControl
                            checked={settings.certificates_completion_date.value === "enabled"}
                            onChange={() =>
                                updateSettings(
                                    "certificates_completion_date",
                                    settings.certificates_completion_date.value === "enabled" ? "disabled" : "enabled"
                                )
                            }
                        />
                        <TextControl
                            name={getSettingName("certificates_completion_date")}
                            type="hidden"
                            value={settings.certificates_completion_date.value}
                        />
                    </div>
                    <div className="form-group">
                        <label>{__("Expiration Date", "memberpress-courses")}</label>

                        <ToggleControl
                            checked={settings.certificates_expiration_date.value === "enabled"}
                            onChange={() =>
                                updateSettings(
                                    "certificates_expiration_date",
                                    settings.certificates_expiration_date.value === "enabled" ? "disabled" : "enabled"
                                )
                            }
                        />
                        <TextControl
                            name={getSettingName("certificates_expiration_date")}
                            type="hidden"
                            value={settings.certificates_expiration_date.value}
                        />
                    </div>
                    <div
                        className="form-group"
                        style={settings.certificates_expiration_date.value === "enabled" ? {padding: "0 3%"} : {padding: "0 3%", display: "none"}}
                    >
                        <label>{__("Reset progress", "memberpress-courses")}</label>

                        <ToggleControl
                            label={__("Reset student’s course progress when certificate expire", "memberpress-courses")}
                            checked={settings.certificates_expires_reset.value === "enabled"}
                            onChange={() =>
                                updateSettings(
                                    "certificates_expires_reset",
                                    settings.certificates_expires_reset.value === "enabled" ? "disabled" : "enabled"
                                )
                            }
                        />
                    </div>
                    <div
                        className="form-group"
                        style={settings.certificates_expiration_date.value === "enabled" ? {padding: "0 3%"} : {padding: "0 3%", display: "none"}}
                    >
                        <label>{__("Expires", "memberpress-courses")}</label>

                        <div className={"mpcs-cert-expires"}>
                            <TextControl
                                name={getSettingName("certificates_expires_value")}
                                onChange={(value) => updateSettings(
                                    "certificates_expires_value",
                                    value
                                )}
                                type={"number"}
                                value={settings.certificates_expires_value.value}
                            />
                        </div>
                        <SelectControl
                            value={ settings.certificates_expires_unit.value }
                            options={ [
                                { label: 'Days', value: 'day' },
                                { label: 'Weeks', value: 'week' },
                                { label: 'Months', value: 'month' },
                                { label: 'Years', value: 'year' },
                            ] }
                            onChange={(newValue) => updateSettings(
                                "certificates_expires_unit",
                                newValue
                            )}
                            __nextHasNoMarginBottom
                        />

                        <TextControl
                            name={getSettingName("certificates_expires_value")}
                            type="hidden"
                            value={settings.certificates_expires_value.value}
                        />

                        <TextControl
                            name={getSettingName("certificates_expires_unit")}
                            type="hidden"
                            value={settings.certificates_expires_unit.value}
                        />

                        <TextControl
                            name={getSettingName("certificates_expires_reset")}
                            type="hidden"
                            value={settings.certificates_expires_reset.value}
                        />
                    </div>
                    <div className="form-group">
                        <label>{__("Enable Shareable Link", "memberpress-courses")}</label>

                        <ToggleControl
                            checked={settings.certificates_share_link.value === "enabled"}
                            onChange={() =>
                                updateSettings(
                                    "certificates_share_link",
                                    settings.certificates_share_link.value === "enabled" ? "disabled" : "enabled"
                                )
                            }
                        />
                        <TextControl
                            name={getSettingName("certificates_share_link")}
                            type="hidden"
                            value={settings.certificates_share_link.value}
                        />
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default compose([
    withDispatch((dispatch) => {
        const {updateSettings} = dispatch("memberpress/course/certificates");
        const {editPost} = dispatch("core/editor");

        return {
            updateSettings,
            editPost
        };
    }),
    withSelect((select) => {
        return {
            settings: select("memberpress/course/certificates").getAll(),
        };
    }),
])(Certificates);
