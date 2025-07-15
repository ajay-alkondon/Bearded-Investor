<?php

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return array(
	"name" => esc_html__("Sticky Content Sections", "salient-core"),
	"base" => "nectar_sticky_media_sections",
    "icon" => "icon-wpb-recent-projects",
    "show_settings_on_create" => false,
    "is_container" => true,
    "as_parent" => array('only' => 'nectar_sticky_media_section'), 
	"category" => esc_html__('Content', 'salient-core'),
    "description" => esc_html__('Sticky Videos and Images', 'salient-core'),
    "js_view" => 'VcColumnView',
	"params" => array(
        
        array(
            "type" => "dropdown",
            "heading" => esc_html__("Type", "salient-core"),
            "param_name" => "type",
            "admin_label" => false,
            "value" => array(
                "Sticky Media, Scrolling Content" => "default",
                "Sticky Scroll Pinned Sections" => "scroll-pinned-sections",
            ),
            'save_always' => true,
        ),

        array(
            "type" => "dropdown",
            "heading" => esc_html__("Effect", "salient-core"),
            "param_name" => "effect",
            "admin_label" => false,
            "value" => array(
                "None" => "default",
                "Scale" => "scale",
                "Blurred Scale" => "scale_blur"
            ),
            'save_always' => true,
            "dependency" => Array('element' => "type", 'value' => 'scroll-pinned-sections'),
        ),

        array(
			"type" => 'checkbox',
			"heading" => esc_html__("Stacking Effect", "salient-core"),
			"param_name" => "stacking_effect",
			'edit_field_class' => 'vc_col-xs-12 salient-fancy-checkbox',
			"description" => esc_html__("Keeps the top edges of all sections slightly visible to create a visual stack.", "salient-core"),
			"value" => Array(esc_html__("Yes, please", "salient-core") => 'yes'),
			"dependency" => Array('element' => "effect", 'value' => 'default'),
		),

        array(
			"type" => "dropdown",
			"heading" => esc_html__("Section Height", "salient-core"),
            "dependency" => Array('element' => "type", 'value' => 'scroll-pinned-sections'),
            "param_name" => "section_height",
			"admin_label" => false,
			"value" => array(
                "50%" => "50vh",
                "55%" => "55vh",
                "60%" => "60vh",
                "65%" => "65vh",
                "70%" => "70vh",
                "75%" => "75vh",
                "80%" => "80vh",
                "85%" => "85vh",
                "90%" => "90vh",
                "95%" => "95vh",
                "100%" => "100vh",    
			),
			'save_always' => true,
        ),
        
        array(
			"type" => 'checkbox',
			"heading" => esc_html__("Subtract Navigation Height from Section Height", "salient-core"),
			"param_name" => "subtract_nav_height",
			'edit_field_class' => 'vc_col-xs-12 salient-fancy-checkbox',
			"description" => '',
			"value" => Array(esc_html__("Yes, please", "salient-core") => 'yes'),
			"dependency" => Array('element' => "type", 'value' => 'scroll-pinned-sections'),
		),
        array(
			"type" => "dropdown",
			"heading" => esc_html__("Content Alignment", "salient-core"),
            "dependency" => Array('element' => "type", 'value' => 'scroll-pinned-sections'),
            "param_name" => "content_alignment",
			"admin_label" => false,
			"value" => array(
                esc_html__("Middle", "salient-core") => "middle",
                esc_html__("Stretch", "salient-core") => "stretch", 
                esc_html__("Top", "salient-core") => "top",
                esc_html__("Bottom", "salient-core") => "bottom", 
			),
			'save_always' => true,
        ),
        array(
			"type" => 'checkbox',
			"heading" => esc_html__("Section Navigation", "salient-core"),
			"param_name" => "navigation",
			'edit_field_class' => 'vc_col-xs-12 salient-fancy-checkbox',
			"value" => Array(esc_html__("Yes, please", "salient-core") => 'yes'),
			"dependency" => Array('element' => "type", 'value' => 'scroll-pinned-sections'),
		),

        array(
            "type" => "colorpicker",
            "class" => "",
            "heading" => esc_html__("Navigation Color", "salient-core"),
            "param_name" => "navigation_color",
            "value" => "",
            "dependency" => Array('element' => "navigation", 'not_empty' => true),
            "description" => esc_html__("Select the color that your navigation will display in.", "salient-core"),
          ),


        array(
			"type" => "dropdown",
			"heading" => esc_html__("Content Position", "salient-core"),
			"param_name" => "content_position",
			"admin_label" => false,
            "dependency" => Array('element' => "type", 'value' => 'default'),
			"value" => array(
                "Right" => "right",
                "Left" => "left",
			),
			'save_always' => true,
        ),
        
        array(
			"type" => "dropdown",
			"heading" => esc_html__("Content Spacing", "salient-core"),
            "dependency" => Array('element' => "type", 'value' => 'default'),
			"param_name" => "content_spacing",
			"admin_label" => false,
			"value" => array(
                "20%" => "20vh",
                "25%" => "25vh",
                "30%" => "30vh",
                "35%" => "35vh",
                "40%" => "40vh",
                "45%" => "45vh",
                "50%" => "50vh",
                "55%" => "55vh"
			),
			'save_always' => true,
		),
        
        
		array(
			"type" => "dropdown",
			"heading" => esc_html__("Media Width", "salient-core"),
            "dependency" => Array('element' => "type", 'value' => 'default'),
			"param_name" => "media_width",
            "admin_label" => false,
            "edit_field_class" => "nectar-one-half",
			"value" => array(
                "75%" => "75%",
                "70%" => "70%",
				"65%" => "65%",
                "60%" => "60%",
                "55%" => "55%",
                "50%" => "50%",
                "45%" => "45%",
                "40%" => "40%",
			),
			'save_always' => true,
        ),
        array(
			"type" => "dropdown",
			"heading" => esc_html__("Media Height", "salient-core"),
            "dependency" => Array('element' => "type", 'value' => 'default'),
            "param_name" => "media_height",
            "edit_field_class" => "nectar-one-half nectar-one-half-last",
			"admin_label" => false,
			"value" => array(
                "50%" => "50vh",
                "55%" => "55vh",
                "60%" => "60vh",
                "65%" => "65vh",
                "70%" => "70vh",
                "75%" => "75vh",
                "80%" => "80vh",
                "85%" => "85vh",
                "90%" => "90vh",
                "95%" => "95vh",
                "100%" => "100vh",    
			),
			'save_always' => true,
        ),

        array(
          "type" => "dropdown",
          "heading" => esc_html__("Mobile Media Aspect Ratio", "salient-core"),
          "dependency" => Array('element' => "type", 'value' => 'default'),
              "param_name" => "mobile_aspect_ratio",
              "admin_label" => false,
              "value" => array(
                "16:9" => "16-9",
                "1:1" => "1-1",
                "3:2" =>  "3-2",
                "4:3" => "4-3",
                "4:5" => "4-5",
              ),
            'save_always' => true,
          ),

          array(
            "type" => "dropdown",
            "heading" => esc_html__("Border Radius", "salient-core"),
            'save_always' => true,
            "param_name" => "border_radius",
            "value" => array(
                esc_html__("0px", "salient-core") => "none",
                esc_html__("3px", "salient-core") => "3px",
                esc_html__("5px", "salient-core") => "5px", 
                esc_html__("10px", "salient-core") => "10px", 
                esc_html__("15px", "salient-core") => "15px", 
                esc_html__("20px", "salient-core") => "20px",
                esc_html__("30px", "salient-core") => "30px"
            ),
         ),	
        
        
	)
);

?>