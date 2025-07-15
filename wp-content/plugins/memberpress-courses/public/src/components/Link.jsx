import { Draggable } from "@edorivai/react-smooth-dnd";
import React, { useState } from 'react';
import icons from "../lib/icons";
import { getPostUrl } from "../lib/helpers.js";
import { Fragment } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { Icon, Animate } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const Link = ({ index, link, sectionId, onAddFileToSection }) => {
  const [isHovering, setIsHovering] = useState(false);
  const resources = useSelect('memberpress/course/resources').getAll();
  const { removeResource } = useDispatch('memberpress/course/resources');

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  /**
   * Deletes a lesson
   * @param {type} lessonId
   * @param {type} index
   */
  const removeOne = (downloadId, index) => {
    removeResource(index, downloadId, sectionId, resources);
  }


  return (
    <Draggable className="mpcs-card-wrapper" key={index}>
      <div
        className={
          isHovering ? "mepr-lesson mpcs-card" : "mepr-lesson"
        }
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-post={link.id}
      >
        <a className="mepr-lesson-drag-handle">
          {isHovering && (
            <Fragment>
              <Icon icon={icons.draggable} size="16" />
            </Fragment>
          )}
        </a>
        <i className="mpcs-link"></i>
        <div className="editable-input"><span className="content">{link.label || link.url}</span></div>

        {isHovering && (
          <div className="mepr-actions">
            <Animate options={{ origin: "middle center" }} type="appear">
              {({ className }) => (
                <a
                  className={className}
                  href={getPostUrl(link.url)}
                >
                  <Icon icon={icons.view} size="14" />
                </a>
              )}
            </Animate>
            <Animate options={{ origin: "bottom center" }} type="appear">
              {({ className }) => (
                <a
                  className={className}
                  href="#0"
                  onClick={() => removeOne(link.id, index)}
                >
                  <Icon icon={icons.close} size="14" />{" "}
                </a>
              )}
            </Animate>
          </div>
        )}


      </div>
    </Draggable>
  );
};

export default Link;
