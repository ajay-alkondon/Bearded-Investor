<?php

/**
 * @package Salient Custom Branding
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

if ( !class_exists('Salient_Custom_Branding_Admin_Panel') ) {
    class Salient_Custom_Branding_Admin_Panel {

        public function __construct() {
            add_action('admin_menu', [$this, 'add_menu_page'], '99');
            add_action('admin_init', [$this, 'register_settings']);
        }

        public function add_menu_page() {

            $theme = wp_get_theme();
            $options = [
                sanitize_html_class($theme->get( 'Name' )),
                __('Custom Branding', 'salient-custom-branding'),
                __('Custom Branding', 'salient-custom-branding'),
                'manage_options',
                'salient-custom-branding',
                [$this,'admin_page'],
                '99'
            ];

            call_user_func_array('add_submenu_page', $options);

        }

        public function admin_page() {
            ?>
            <div class="wrap">
                <div class="salient__options-panel">
                    <h1><?php echo __('Salient Custom Branding Options', 'salient-custom-branding') ?></h1>
                    <?php
                    $tabs = array(
                        'branding' => 'Branding',
                        'theme_features' => 'Theme Features',
                        'wp_login' => 'WordPress Login',
                    ); 
                    $current_tab = isset( $_GET[ 'tab' ] ) && isset( $tabs[ $_GET[ 'tab' ] ] ) ? $_GET[ 'tab' ] : array_key_first( $tabs );
                    ?>
                    <form method="post" action="options.php">
                        <nav class="nav-tab-wrapper">
                            <?php
                            foreach( $tabs as $tab => $name ){
                                // CSS class for a current tab
                                $current = $tab === $current_tab ? ' nav-tab-active' : '';
                                // URL
                                $url = add_query_arg( array( 'page' => 'salient-custom-branding', 'tab' => $tab ), '' );
                                // printing the tab link
                                echo "<a class=\"nav-tab{$current}\" href=\"{$url}\">{$name}</a>";
                            }
                            ?>
                        </nav>
                        <?php
                        settings_fields("salient_custom_branding_{$current_tab}_settings");
                        do_settings_sections("salient_custom_branding_{$current_tab}");
                        submit_button();
                        ?>
                    </form>
                </div>
            </div>
            <?php
        }

        public function salient_custom_branding_section_callback($args) {
            if ( isset($args['section_desc']) ) {
                echo '<p>'.$args['section_desc'].'</p>';
            }
        }

        public function sanitize_callback($value) {
            return sanitize_text_field($value);
        }

        public function array_sanitize_callback($value) {
            if ( is_array($value) ) {
                foreach ($value as $key => $val) {
                    $value[$key] = sanitize_text_field($val);
                }
                return $value;
            } else {
                return sanitize_text_field($value);
            }
        }

        public function textarea_field_render($args) {
            $option_name = $args['option_name'];
            $option_value = get_option($option_name);
            echo '<textarea name="' . esc_attr($option_name) . '">' . esc_attr($option_value) . '</textarea>';
            if ( isset($args['description']) ) {
                echo '<p class="description">'.$args['description'].'</p>';
            }
        }

        public function text_field_render($args) {
            $option_name = $args['option_name'];
            $option_value = get_option($option_name);
            echo '<input type="text" name="' . esc_attr($option_name) . '" value="' . esc_attr($option_value) . '" />';
            if ( isset($args['description']) ) {
                echo '<p class="description">'.$args['description'].'</p>';
            }
        }

        public function toggle_field_render($args) {
            $option_name = $args['option_name'];
            $option_value = get_option($option_name);

            $selected_enable = '';
            $selected_disable = ' selected';
            $activated = '';

            if( 'on' === $option_value ) {
                $selected_enable = ' selected';
                $selected_disable = '';
                $activated = ' activated';
            }

            echo '<div class="salient-toggle-switch'.$activated.'">
            <label class="cb-enable'.$selected_enable.'"><span>On</span></label>
            <label class="cb-disable'.$selected_disable.'"><span>Off</span></label>
            <input type="hidden" name="' . esc_attr($option_name) . '" value="' . esc_attr($option_value) . '">
          </div>';
        }

        public function image_field_render($args) {
            $option_name = $args['option_name'];
            $option_value = get_option($option_name);

            if( is_array($option_value) && isset($option_value['url']) && !empty($option_value['url']) ) {
                $remove_class = '';
            } else {
                $remove_class = ' hidden-option';
            }

            $url = (is_array($option_value) && isset($option_value['url'])) ? $option_value['url'] : '';
            $id = (is_array($option_value) && isset($option_value['id'])) ? $option_value['id'] : '';

            echo '<div class="media-preview-wrap'.$remove_class.'">
                <div class="media-preview-wrap__img-wrap">
                    <img class="media-preview" id="'.esc_attr($option_name).'-preview" src="' . esc_attr($url) . '" />
                </div>
                <button rel-id="'.esc_attr($option_name).'" class="salient-custom-branding-remove-image button-secondary"><span class="dashicons dashicons-no-alt"></span> ' . esc_html__('Remove', 'salient-core') . '</button>
            </div>';

            echo '<div class="salient-custom-branding-media__wrap">';
            echo '<input type="hidden" id="'.esc_attr($option_name).'-id" name="'.esc_attr($option_name).'[id]" value="' . esc_attr($id)  . '" />';
            echo '<input rel-id="'.esc_attr($option_name).'" type="text" id="'.esc_attr($option_name).'-url" name="' . esc_attr($option_name) . '[url]" value="' . esc_attr($url) . '" class="salient-custom-branding-media__input" />';

            echo '<input rel-id="'.esc_attr($option_name).'" type="button" data-update="' . esc_html__('Select Image', 'salient-custom-branding') . '" data-title="'.esc_attr__('Choose Your Image','salient-custom-branding').'" class="button button-secondary salient-custom-branding-media__button-add" value="'.__('Upload Image', 'salient-custom-branding').'"/>';
            echo '</div">';
            if ( isset($args['description']) ) {
                echo '<p class="description">'.$args['description'].'</p>';
            }
        }

        public function color_field_render($args) {
            $option_name = $args['option_name'];
            $option_value = get_option($option_name);
            echo '<div class="salient-custom-branding-color-picker"><input type="text" name="' . esc_attr($option_name) . '" value="' . esc_attr($option_value) . '" class="salient-custom-branding-color-field" />';
            if ( isset($args['description']) ) {
                echo '<p class="description">'.$args['description'].'</p>';
            }
            echo '</div>';
        }

        public function register_settings() {

            add_settings_section(
                'salient_custom_branding_branding_section', 
                '', 
                [$this, 'salient_custom_branding_section_callback'],
                'salient_custom_branding_branding',
                ['section_desc' => '']
            );

            add_settings_section(
                'salient_custom_branding_features_section', 
                '', 
                [$this, 'salient_custom_branding_section_callback'],
                'salient_custom_branding_theme_features',
                ['section_desc' => '']
            );

            add_settings_section(
                'salient_custom_branding_wp_login_section', 
                '', 
                [$this, 'salient_custom_branding_section_callback'],
                'salient_custom_branding_wp_login',
                ['section_desc' => '']
            );

            $settings = [

                'salient_custom_branding_theme_name' => [
                    'type' => 'text',
                    'label' => __('Theme Name', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_branding_section',
                    'tab' => 'branding',
                    'sanitize_callback' => 'sanitize_callback',
                    'description' => esc_html__('Defaults to "Salient".', 'salient-custom-branding')
                ],
                'salient_custom_branding_theme_author' => [
                    'type' => 'text',
                    'label' => __('Theme Author', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_branding_section',
                    'tab' => 'branding',
                    'sanitize_callback' => 'sanitize_callback',
                    'description' => esc_html__('Defaults to "ThemeNectar".', 'salient-custom-branding')
                ],
                'salient_custom_branding_theme_author_uri' => [
                    'type' => 'text',
                    'label' => __('Theme Author URI', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_branding_section',
                    'tab' => 'branding',
                    'sanitize_callback' => 'sanitize_callback',
                    'description' => esc_html__('Defaults to "https://themenectar.com".', 'salient-custom-branding')
                ],

                'salient_custom_branding_theme_description' => [
                    'type' => 'textarea',
                    'label' => __('Theme Description', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_branding_section',
                    'tab' => 'branding',
                    'sanitize_callback' => 'sanitize_callback',
                    'description' => esc_html__('The text that will show when inspecting the theme in Appearance > Themes. Defaults to "An Ultra Responsive Multi-Purpose Theme."                    ', 'salient-custom-branding')
                ],
                'salient_custom_branding_theme_image' => [
                    'type' => 'image',
                    'label' => __('Theme Image', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_branding_section',
                    'tab' => 'branding',
                    'sanitize_callback' => 'array_sanitize_callback',
                    'description' => esc_html__('Must be a 4:3 aspect ratio.','salient-custom-branding') . '<br/>' . esc_html__('Recommended size: 1200×900px','salient-custom-branding')
                ],

                'salient_custom_branding_theme_logo' => [
                    'type' => 'image',
                    'label' => __('Theme Logo', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_branding_section',
                    'tab' => 'branding',
                    'sanitize_callback' => 'array_sanitize_callback',
                    'description' => esc_html__('Defaults to the Salient crown logo.', 'salient-custom-branding') .'<br/>' . esc_html__('Recommended size: 100x100px','salient-custom-branding'). '<br/><strong>' .  esc_html__('Must be a .png with transparency, as filters will be applied to make it light/dark where needed.','salient-custom-branding') . '</strong>'
                ],


                'salient_custom_branding_hide_studio' => [
                    'type' => 'toggle',
                    'label' => __('Hide Salient Studio Template Library', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_features_section',
                    'tab' => 'theme_features',
                    'sanitize_callback' => 'sanitize_callback'
                ],
                'salient_custom_branding_hide_theme_version' => [
                    'type' => 'toggle',
                    'label' => __('Hide Salient Theme Version', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_features_section',
                    'tab' => 'theme_features',
                    'sanitize_callback' => 'sanitize_callback'
                ],
                'salient_custom_branding_hide_theme_footer_links' => [
                    'type' => 'toggle',
                    'label' => __('Hide Salient Options Footer Links', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_features_section',
                    'tab' => 'theme_features',
                    'sanitize_callback' => 'sanitize_callback'
                ],

                'salient_custom_branding_login_logo' => [
                    'type' => 'image',
                    'label' => __('Login Logo', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_wp_login_section',
                    'tab' => 'wp_login',
                    'sanitize_callback' => 'array_sanitize_callback',
                    'description' => esc_html__('Defaults to the WordPress logo.', 'salient-custom-branding') 
                ],
                'salient_custom_branding_login_rounded_edges' => [
                    'type' => 'toggle',
                    'label' => __('Rounded Edges Login Box', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_wp_login_section',
                    'tab' => 'wp_login',
                    'sanitize_callback' => 'sanitize_callback'
                ],
                'salient_custom_branding_login_remove_border' => [
                    'type' => 'toggle',
                    'label' => __('Remove Border on Login Box', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_wp_login_section',
                    'tab' => 'wp_login',
                    'sanitize_callback' => 'sanitize_callback'
                ],
                'salient_custom_branding_login_full_width_button' => [
                    'type' => 'toggle',
                    'label' => __('Full Width Login Button', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_wp_login_section',
                    'tab' => 'wp_login',
                    'sanitize_callback' => 'sanitize_callback'
                ],
                'salient_custom_branding_login_background_color' => [
                    'type' => 'color',
                    'label' => __('Page Background Color', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_wp_login_section',
                    'tab' => 'wp_login',
                    'sanitize_callback' => 'sanitize_callback',
                    'description' => esc_html__('Replaces the default WordPress gray.', 'salient-custom-branding') 
                ],
                'salient_custom_branding_login_accent_color' => [
                    'type' => 'color',
                    'label' => __('Accent Color', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_wp_login_section',
                    'tab' => 'wp_login',
                    'sanitize_callback' => 'sanitize_callback',
                    'description' => esc_html__('Replaces the default WordPress blue.', 'salient-custom-branding') 
                ],
                'salient_custom_branding_login_secondary_color' => [
                    'type' => 'color',
                    'label' => __('Secondary Color', 'salient-custom-branding'),
                    'section' => 'salient_custom_branding_wp_login_section',
                    'tab' => 'wp_login',
                    'sanitize_callback' => 'sanitize_callback',
                    'description' => esc_html__('Replaces the text color which sits directly against the background color. i.e. "Lost your password?", "Go to Site etc."', 'salient-custom-branding') 
                ],
            ];
            foreach ($settings as $setting => $args) {
                register_setting(
                    'salient_custom_branding_'.$args['tab'].'_settings',
                    $setting,
                    [$this, $args['sanitize_callback']]
                );

                add_settings_field(
                    $setting, 
                    $args['label'],
                    [$this, $args['type'].'_field_render'],
                    'salient_custom_branding_'.$args['tab'],
                    $args['section'],
                    [
                        'option_name' => $setting,
                        'description' => isset($args['description']) ? $args['description'] : ''
                    ]
                );
            }

        
        }
    }
}

new Salient_Custom_Branding_Admin_Panel();