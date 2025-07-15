<?php

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

$responsive_text_params = array(

    array(
        "type" => "textarea_html",
        "heading" => esc_html__("Text", "salient-core"),
        "param_name" => "content",
        "admin_label" => true,
        "description" => ''
    ),

    array(
		"type" => "dropdown",
		"class" => "",
		'save_always' => true,
		"heading" => "Font Style",
		"description" => esc_html__("Optionally have your text inherit styling from a specific tag.", "salient-core"),
		"param_name" => "inherited_font_style",
		"value" => array(
            'Default' => 'default',
			"H1" => "h1",
			"H2" => "h2",
			"H3" => "h3",
			"H4" => "h4",
			"H5" => "h5",
			"H6" => "h6",
			"Paragraph" => "p",
			"Italic" => "i",
		)
	),

);



$font_size_group = SalientWPbakeryParamGroups::font_sizing_group();
$imported_groups = array($font_size_group);

foreach ($imported_groups as $group) {

    foreach ($group as $option) {
        $responsive_text_params[] = $option;
    }
}


$responsive_text_params[] = array(
    "type" => "colorpicker",
    "class" => "",
    "heading" => "Text Color",
    "param_name" => "text_color",
    "value" => "",
    "description" => esc_html__("Defaults to light or dark based on the current row text color.", "salient-core")
);
$responsive_text_params[] = array(
    "type" => "textfield",
    "heading" => esc_html__("Max Width", "salient-core"),
    "param_name" => "max_width",
    "admin_label" => false,
    "description" => esc_html__("Optionally enter your desired max width.", "salient-core")
);
$responsive_text_params[] = array(
    "type" => "textfield",
    "heading" => esc_html__("Link URL", "salient-core"),
    "param_name" => "link_href",
    "description" => esc_html__("The URL that will be used for the link", "salient-core")
);

$responsive_text_params[] = array(
    "type" => "nectar_radio_tab_selection",
    "class" => "",
    'save_always' => true,
    "heading" => esc_html__("Text Direction", "salient-core"),
    "param_name" => "text_direction",
    "options" => array(
        esc_html__("Auto", "salient-core") => "default",
        esc_html__("Left", "salient-core") => "ltr",
		esc_html__("Right", "salient-core") => "rtl",
    ),
);

$responsive_text_params[] = array(
    'type' => 'textfield',
    'heading' => esc_html__('CSS Class Name', 'salient-core'),
    'param_name' => 'class_name',
    'description' => ''
);

return array(
    "name" => esc_html__("Responsive Text", "salient-core"),
    "base" => "nectar_responsive_text",
    "icon" => "icon-wpb-split-line-heading",
    "allowed_container_element" => 'vc_row',
    "weight" => 8,
    "category" => esc_html__('Typography', 'salient-core'),
    "description" => esc_html__('Responsive text', 'salient-core'),
    "params" => $responsive_text_params,
);
