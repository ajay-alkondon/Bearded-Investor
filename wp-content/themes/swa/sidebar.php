<?php
/**
 * The template for the sidebar.
 *
 * @package Salient WordPress Theme
 * @version 9.0.2
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( function_exists( 'dynamic_sidebar' ) ) {

	global $post;
	global $woocommerce;

	$posttype = get_post_type( $post );

	if ( ( is_archive() ) || ( is_author() ) || ( is_category() ) || ( is_home() ) || ( is_single() ) || ( is_tag() ) || ( $posttype === 'dictionary' ) || ( $posttype === 'post' ) ) {
		dynamic_sidebar( 'Blog Sidebar' );
	} else {
		dynamic_sidebar( 'Page Sidebar' );
	}
}

