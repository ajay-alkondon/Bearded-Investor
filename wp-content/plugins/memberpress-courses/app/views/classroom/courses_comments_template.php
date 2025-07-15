<?php
/*
 * If the current post is protected by a password and
 * the visitor has not yet entered the password we will
 * return early without loading the comments.
 */
if ( post_password_required() ) {
  return;
}
?>

<div id="comments" class="comments-area">

  <?php
  if ( have_comments() ) :
    ?>
    <h3 class="comments-title">
      <?php
      $comments_title = apply_filters(
        'mpcs_comment_form_title',
        sprintf(
          esc_html( _n( '%1$s thought on &ldquo;%2$s&rdquo;', '%1$s thoughts on &ldquo;%2$s&rdquo;', get_comments_number(), 'memberpress-courses' ) ),
          number_format_i18n( get_comments_number() ),
          get_the_title()
        )
      );
      echo esc_html( $comments_title );
      ?>
    </h3>

    <ol class="comment-list">
      <?php
      wp_list_comments(
        array(
          'callback' => array('memberpress\courses\controllers\App', 'course_comments'),
          'style'    => 'ol'
        )
      );
      ?>
    </ol>
  <?php endif; ?>

  <?php
  // If comments are closed and there are comments, let's leave a little note, shall we?
  if ( ! comments_open() && get_comments_number() && post_type_supports( get_post_type(), 'comments' ) ) :
    ?>
    <p class="no-comments"><?php echo __( 'Comments are closed', 'memberpress-courses' ); ?></p>
  <?php endif; ?>

  <?php comment_form(); ?>

</div>
