<?php

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

extract(shortcode_atts(array(
    'text_color' => '',
    'link_href' => '',
    'class_name' => '',
    'max_width' => '',
    'inherited_font_style' => '',
), $atts));

$styles = '';


// style classes.
$el_classes = array('nectar-responsive-text');

// Custom class.
if( !empty($class_name) ) {
    $el_classes[] = esc_attr($class_name);
}

// Custom coloring.
if( !empty($text_color )) {
    $styles .= 'color: ' . esc_attr($text_color) . ';';
}

// Max width  
if( !empty($max_width) ) {
        
    if( strpos($max_width,'vh') !== false ) {
        $styles  .= 'max-width: '. intval($max_width) .'vh;';
    } 
    else if( strpos($max_width,'vw') !== false ) {
        $styles  .= 'max-width: '. intval($max_width) .'vw;';
    } 
    else if( strpos($max_width,'%') !== false ) {
        $styles  .= 'max-width: '. intval($max_width) .'%;';
    } 
    else {
        $styles  .= 'max-width: '. intval($max_width) .'px;';
    }

}

// Collect styles and prep for output..
if(!empty($styles)) {
    $styles = ' style="' . $styles . '"';
}

// Dyanmic classes.
if( function_exists('nectar_el_dynamic_classnames') ) {
	$el_classes[] = nectar_el_dynamic_classnames('nectar_responsive_text', $atts);
} else {
	$el_classes[] = '';
}

$el_attrs = '';
if ( !empty($inherited_font_style) && 'default' !== $inherited_font_style ) {
  $el_attrs .= ' data-inherit-heading-family="'.$inherited_font_style.'"';
}


// Output.
echo '<div class="'.nectar_clean_classnames(implode(' ',$el_classes)).'"'.$styles.$el_attrs.'>';

if (!empty($link_href)) {
    echo '<a href="'.esc_url($link_href).'">'.wpb_js_remove_wpautop( wp_kses_post( $content ), true ).'</a>';
} 
else {
    echo wpb_js_remove_wpautop( wp_kses_post( $content ), true );
}

echo '</div>';