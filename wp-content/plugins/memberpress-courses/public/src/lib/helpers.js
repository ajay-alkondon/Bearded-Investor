import { __ } from '@wordpress/i18n';
const Url = require('url-parse');

export function randomNumber(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const applyDrag = (arr, dragResult) => {
  const { removedIndex, addedIndex, payload } = dragResult;
  if (removedIndex === null && addedIndex === null) return arr;

  const result = [...arr];
  let itemToAdd = undefined == payload ? payload : payload.lessonId;

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0];
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd);
  }

  return result;
};


export const getPostEditUrl = (postId) => {
  const parsed = new Url( MPCS_Course_Data.posts_url )
  parsed.set('query', {post: postId, action: "edit", curriculum: "1"});
  return parsed.href;
};

export const getViewQuizAttemptsUrl = (quizId, courseId) => {
  const parsed = new Url(MPCS_Course_Data.viewQuizAttemptsUrl);
  if(parsed.query.includes('gradebook')) {
    parsed.set('query', { page: 'memberpress-course-gradebook', id: courseId, quiz: quizId });
  }
  else {
    parsed.set('query', { page: 'mpcs-quiz-attempts', id: quizId, curriculum: "1" });
  }

  return parsed.href;

};

export const getViewAssignmentSubmissionsUrl = (assignmentId, courseId) => {
  const parsed = new Url(MPCS_Course_Data.viewAssignmentSubmissionsUrl);
  if(parsed.query.includes('gradebook')) {
    parsed.set('query', { page: 'memberpress-course-gradebook', id: courseId, assignment: assignmentId });
  }
  else {
    parsed.set('query', {  page: 'mpcs-assignment-submissions', id: assignmentId, curriculum: "1" });
  }

  return parsed.href;
};

export const getPostUrl = (href) => {
  const parsed = new Url( href );
  return parsed.href;
};

export const getSettingName = (string) => {
  return MPCS_Course_Data.settings[string].name
};

export const getDuplicateModalHtml = (payload) => {
  var associated_str = __("This lesson is associated with the", "memberpress-courses");
  if( payload.quizId ) {
    associated_str = __("This quiz is associated with the", "memberpress-courses");
  }

  return `<div class="mpcs-vex-dialog">
    <h2>` + __("Duplicate", "memberpress-courses") + `?</h2>
    <p>` + associated_str + `</br>
    <strong><em>` + payload.courseTitle + __(" course", "memberpress-courses") + `</em></strong></br>
    ` + __("Do you want to duplicate it and add it to", "memberpress-courses") + `</br>
    ` + __("the content course", "memberpress-courses") + `?</p>
  </div>`;
}
