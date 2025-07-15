<?php

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

return array(
	"name" => esc_html__("Sticky Media Section", "salient-core"),
	"base" => "nectar_sticky_media_section",
    "icon" => "icon-wpb-recent-projects",
    "content_element" => true,
    "is_container" => true,
    "js_view" => 'VcColumnView',
    "as_child" => array('only' => 'nectar_sticky_media_sections'), 
	"category" => esc_html__('Content', 'salient-core'),
	"description" => esc_html__('Sticky Videos and Images', 'salient-core'),
	"params" => array(

        array(
            "type" => "dropdown",
            "heading" => esc_html__("Section Type", "salient-core"),
            "param_name" => "section_type",
            'save_always' => true,
            "value" => array(
              esc_html__( "Image", "salient-core") => "image",
              esc_html__( "Video", "salient-core") => "video", 
              esc_html__( "Color", "salient-core") => "color",  
            ),
            "description" => esc_html__("Select what type of media to display for this section.", "salient-core")
          ),

      array(
        "type" => "fws_image",
        "class" => "",
        "heading" => "Image",
        "value" => "",
              "param_name" => "image",
              "dependency" => Array('element' => "section_type", 'value' => array('image')),
        "description" => esc_html__("Specify the image to display for this section.", "salient-core")
      ),

      array(
        'type' => 'colorpicker',
        'heading' => __( 'Section Color', 'salient-core' ),
        'value' => '',
        'save_always' => true,
        'param_name' => 'section_color',
        'dependency' => array( 'element' => 'section_type', 'value' => array( 'color' ) ),
        'description' => esc_html__( 'Choose a background color for your section.', 'salient-core' ),
      ),

          

        array(
            "type" => "nectar_attach_video",
            "class" => "",
            "heading" => esc_html__("WebM File URL", "salient-core"),
            "value" => "",
            "param_name" => "video_webm",
            "description" => esc_html__("You must include this format & the mp4 format to render your video with cross browser compatibility. OGV is optional.
        Video must be in a 16:9 aspect ratio.", "salient-core"),
            "dependency" => Array('element' => "section_type", 'value' => array('video'))
        ),

        array(
            "type" => "nectar_attach_video",
            "class" => "",
            "heading" => esc_html__("MP4 File URL", "salient-core"),
            "value" => "",
            "param_name" => "video_mp4",
            "description" => esc_html__("Enter the URL for your mp4 video file here.", "salient-core"),
            "dependency" => Array('element' => "section_type", 'value' => array('video'))
        ),

        array(
            "type" => "dropdown",
            "heading" => esc_html__("Video Functionality", "salient-core"),
            "param_name" => "video_functionality",
            'save_always' => true,
            "dependency" => Array('element' => "section_type", 'value' => array('video')),
            "value" => array(
              esc_html__( "Loop Video", "salient-core") => "loop",
              esc_html__( "Do Not Loop Video", "salient-core") => "no-loop",     
            ),
            "description" => esc_html__("Determines how your video will playback.", "salient-core")
          ),

        array(
            "type" => "dropdown",
            "heading" => esc_html__("Video Fit", "salient-core"),
            "param_name" => "video_fit",
            'save_always' => true,
            "dependency" => Array('element' => "section_type", 'value' => array('video')),
            "value" => array(
              esc_html__( "Cover", "salient-core") => "cover",
              esc_html__( "Contain", "salient-core") => "contain",      
            ),
            "description" => esc_html__("Cover will crop the video to fit the media area, where as contain will ensure the full video always displays. ", "salient-core")
          ),
  
          array(
            "type" => "dropdown",
            "heading" => esc_html__("Video Alignment", "salient-core"),
            "param_name" => "video_alignment",
            'save_always' => true,
            "dependency" => Array('element' => "video_fit", 'value' => array('cover')),
            "value" => array(
              esc_html__("Default (Center Center)", "salient-core" ) => "default",
              esc_html__("Left Top", "salient-core" ) => "left-top",
              esc_html__("Left Center", "salient-core" ) => "left-center",
              esc_html__("Left Bottom", "salient-core" ) => "left-bottom",
              esc_html__("Center Top", "salient-core" ) => "center-top",
              esc_html__("Center Center", "salient-core" ) => "center-center",
              esc_html__("Center Bottom", "salient-core" ) => "center-bottom",
              esc_html__("Right Top", "salient-core" ) => "right-top",
              esc_html__("Right Center", "salient-core" ) => "right-center",
              esc_html__("Right Bottom", "salient-core" ) => "right-bottom"   
            ),
            "description" => esc_html__("Select your desired video alignment.", "salient-core")
          ),

          array(
            "type" => "textfield",
            'group' => esc_html__('Link', 'salient-core'),
            "heading" => esc_html__("Link URL", "salient-core"),
            "param_name" => "link_href",
            "description" => esc_html__("The URL that will be used for the link", "salient-core")
          ),
          array(
            "type" => "dropdown",
            "class" => "",
            "heading" => esc_html__("Link Functionality", "salient-core"),
            "param_name" => "link_target",
            'save_always' => true,
            'group' => esc_html__('Link', 'salient-core'),
            'value' => array(
              esc_html__("Open in same window", "salient-core") => "_self",
              esc_html__("Open in new window", "salient-core") => "_blank"
            )
          ),
          array(
            "type" => "checkbox",
            "class" => "",
            'edit_field_class' => 'vc_col-xs-12 salient-fancy-checkbox',
            "heading" => esc_html__("Link Mouse Indicator", "salient-core"),
            "param_name" => "link_indicator",
            'group' => esc_html__('Link', 'salient-core'),
            "value" => array(esc_html__("Yes", "salient-core") => 'true'),
          ),
          array(
            "type" => "colorpicker",
            "class" => "",
            "heading" => "Link Indicator BG Color",
            "param_name" => "link_indicator_color",
            "value" => "",
            "dependency" => array('element' => "link_indicator", 'not_empty' => true),
            'group' => esc_html__('Link', 'salient-core'),
            "description" => esc_html__("The color of the background of your link indicator button.", "salient-core")
          ),
          array(
            "type" => "colorpicker",
            "class" => "",
            "heading" => "Link Indicator Text Color",
            "param_name" => "link_indicator_text_color",
            "value" => "",
            'group' => esc_html__('Link', 'salient-core'),
            "dependency" => array('element' => "link_indicator", 'not_empty' => true),
            "description" => esc_html__("The color of your touch link button text.", "salient-core")
          ),
          array(
            "type" => "textfield",
            "class" => "",
            "heading" => "Link Indicator Text",
            "param_name" => "link_indicator_text",
            "value" => '',
            "dependency" => array('element' => "link_indicator", 'not_empty' => true),
            'group' => esc_html__('Link', 'salient-core'),
            "description" => esc_html__("The text that will be displayed on your link indicator button.", "salient-core")
          ),

        
		
	)
);

?>