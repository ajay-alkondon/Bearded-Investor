<?php
/**
 * Template for a blank page layout.
 *
 * @since 7.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( '-1' );
}

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php
	wp_head();
	?>
</head>
<body <?php body_class(); ?>>
<?php
if ( function_exists( 'wp_body_open' ) ) {
	wp_body_open();
}

while ( have_posts() ) :
	the_post();
	?>
	<?php /* nectar addition */ ?>
	<div id="ajax-content-wrap">
		<div class="container-wrap wpb-content--blank" style="padding: 0;">
			<article id="post-<?php the_ID(); ?>" <?php post_class('container main-content'); ?>>
				<div class="entry-content row">
					<?php the_content(); ?>
				</div>
			</article>
		</div>
	</div>
	<?php /* nectar addition end */ ?>
	<?php

endwhile;
wp_footer();
/* nectar addition */
do_action('nectar_hook_before_body_close'); 
/* nectar addition end */
?>
</body>
</html>
