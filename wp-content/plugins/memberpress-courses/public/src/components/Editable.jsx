import icons from "../lib/icons";

import { Fragment, useEffect, useState } from '@wordpress/element';
import { Icon, Animate } from '@wordpress/components';

const Editable = ({
  lesson,
  text,
  type,
  placeholder,
  children,
  childRef,
  isSidebar,
  refKey,
  element,
  setEditing,
  isEditing,
  ...props
}) => {
  useEffect(() => {
    if (childRef && childRef.current && isEditing === true) {
      childRef.current.value = text;
      childRef.current.focus();
    }
  }, [isEditing, childRef]);

  const handleKeyDown = (event, type) => {
    const { key } = event;
    const keys = ["Escape", "Tab", "Space"];
    const enterKey = "Enter";
    const allKeys = [...keys, enterKey];

    if (
      (type === "textarea" && keys.indexOf(key) > -1) ||
      (type !== "textarea" && allKeys.indexOf(key) > -1)
    ) {
      setEditing(false);
    }
  };

  return (
    <Fragment>
      {isEditing ? (
        <div
          className={`editable-${type}` + (isEditing ? " active" : "")}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => handleKeyDown(e, type)}
        >
          {children}
        </div>
      ) : (
        <div className={`editable-${type}`} onClick={() => setEditing(true)}>
          {wp.element.createElement(
            element,
            { className: `${text ? "content" : "text-gray-500"}` },
            text || placeholder || __("Editable content", "memberpress-courses")
          )}
          {(isSidebar && lesson.courseId > 0) && <Icon icon={icons.link} size={11} />}
        </div>
      )}
    </Fragment>
  );
};

export default Editable;
