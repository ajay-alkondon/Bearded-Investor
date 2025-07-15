<?php
/**
 * Navigation menu related helper functions
 *
 * @package Salient WordPress Theme
 * @subpackage helpers
 * @version 12.1.0
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}



/**
 * Register theme menu locations.
 *
 * @since 1.0
 */
if ( function_exists( 'register_nav_menus' ) ) {

    function nectar_add_theme_menu_locations() {

        global $nectar_options;

        $sideWidgetArea                = ( isset($nectar_options['header-slide-out-widget-area']) &&  ! empty( $nectar_options['header-slide-out-widget-area'] ) ) ? $nectar_options['header-slide-out-widget-area'] : 'off';
        $usingPRCompatLayout           = false;
        $usingTopLeftRightCompatLayout = false;

        if( isset( $nectar_options['header_format'] ) ) {

            if ( ! empty( $nectar_options['header_format'] ) && $nectar_options['header_format'] === 'menu-left-aligned'
            || $nectar_options['header_format'] === 'centered-menu'
            || $nectar_options['header_format'] === 'centered-logo-between-menu' ) {
                $usingPRCompatLayout = true;
            }

            if ( ! empty( $nectar_options['header_format'] ) && $nectar_options['header_format'] === 'centered-menu-bottom-bar' ) {
                $usingTopLeftRightCompatLayout = true;
            }

        }

        if ( $sideWidgetArea == '1' ) {

            if( isset( $nectar_options['header_format'] ) && 'centered-logo-between-menu-alt' === $nectar_options['header_format'] ) {
                $nectar_menu_arr = array(
                    'top_nav_pull_right' => 'Top Navigation Menu Pull Right',
                    'top_nav_pull_left'  => 'Top Navigation Menu Pull Left',
                    'secondary_nav'      => 'Secondary Navigation Menu',
                    'off_canvas_nav'     => 'Off Canvas Navigation Menu',
                );
            }

            else if ( $usingPRCompatLayout == true ) {

                $nectar_menu_arr = array(
                    'top_nav'            => 'Top Navigation Menu',
                    'top_nav_pull_right' => 'Top Navigation Menu Pull Right',
                    'secondary_nav'      => 'Secondary Navigation Menu',
                    'off_canvas_nav'     => 'Off Canvas Navigation Menu',
                );

            } elseif ( $usingTopLeftRightCompatLayout == true ) {

                $nectar_menu_arr = array(
                    'top_nav'           => 'Top Navigation Menu',
                    'top_nav_pull_right' => 'Top Navigation Menu Pull Right',
                    'top_nav_pull_left' => 'Top Navigation Menu Pull Left',
                    'off_canvas_nav'    => 'Off Canvas Navigation Menu',
                );

            } else {
                $nectar_menu_arr = array(
                    'top_nav'        => 'Top Navigation Menu',
                    'secondary_nav'  => 'Secondary Navigation Menu',
                    'off_canvas_nav' => 'Off Canvas Navigation Menu',
                );
            }
        } else {

            if( isset( $nectar_options['header_format'] ) && 'centered-logo-between-menu-alt' === $nectar_options['header_format'] ) {
                $nectar_menu_arr = array(
                    'top_nav_pull_right' => 'Top Navigation Menu Pull Right',
                    'top_nav_pull_left'  => 'Top Navigation Menu Pull Left',
                    'secondary_nav'      => 'Secondary Navigation Menu',
                    'off_canvas_nav'    => 'Off Canvas Navigation Menu',
                );
            }
            else if ( $usingPRCompatLayout == true ) {

                $nectar_menu_arr = array(
                    'top_nav'            => 'Top Navigation Menu',
                    'top_nav_pull_right' => 'Top Navigation Menu Pull Right',
                    'secondary_nav'      => 'Secondary Navigation Menu',
                    'off_canvas_nav'    => 'Off Canvas Navigation Menu',
                );

            } elseif ( $usingTopLeftRightCompatLayout == true ) {

                $nectar_menu_arr = array(
                    'top_nav'           => 'Top Navigation Menu',
                    'top_nav_pull_right' => 'Top Navigation Menu Pull Right',
                    'top_nav_pull_left' => 'Top Navigation Menu Pull Left',
                    'off_canvas_nav'    => 'Off Canvas Navigation Menu',
                );

            } else {
                $nectar_menu_arr = array(
                    'top_nav'       => 'Top Navigation Menu',
                    'secondary_nav' => 'Secondary Navigation Menu',
                    'off_canvas_nav'    => 'Off Canvas Navigation Menu',
                );
            }
        }

        register_nav_menus( $nectar_menu_arr );

    }

    add_action( 'after_setup_theme', 'nectar_add_theme_menu_locations' );

}





/**
 * Walker for adding in dropdown arrows, button style and modern megamenu structure.
 *
 * @since 5.0
 */
if ( ! function_exists( 'nectar_walker_nav_menu' ) ) {
    function nectar_walker_nav_menu() {

        class Nectar_Arrow_Walker_Nav_Menu extends Walker_Nav_Menu {

            // Used to skip default children when a global section is attached.
            public function walk( $elements, $max_depth, ...$args ) {
                
                global $nectar_options;

                $output = '';

                // Invalid parameter or nothing to walk.
                if ( $max_depth < -1 || empty( $elements ) ) {
                    return $output;
                }
        
                $parent_field = $this->db_fields['parent'];

                // Flat display.
                if ( -1 === $max_depth ) {
                    $empty_array = [];
                    foreach ( $elements as $e ) {
                        $this->display_element( $e, $empty_array, 1, 0, $args, $output );
                    }
                    return $output;
                }
                
                /*
                    * Need to display in hierarchical order.
                    * Separate elements into two buckets: top level and children elements.
                    * Children_elements is two dimensional array. Example:
                    * Children_elements[10][] contains all sub-elements whose parent is 10.
                    */
                $top_level_elements = [];
                $children_elements  = [];
                foreach ( $elements as $e ) {
                    if ( empty( $e->$parent_field ) ) {
                        $top_level_elements[] = $e;
                    } else {
                        $children_elements[ $e->$parent_field ][] = $e;
                    }
                }
                
                /*
                    * When none of the elements is top level.
                    * Assume the first one must be root of the sub elements.
                    */
                if ( empty( $top_level_elements ) ) {
        
                    $first = array_slice( $elements, 0, 1 );
                    $root  = $first[0];
        
                    $top_level_elements = [];
                    $children_elements  = [];
                    foreach ( $elements as $e ) {
                        if ( $root->$parent_field === $e->$parent_field ) {
                            $top_level_elements[] = $e;
                        } else {
                            $children_elements[ $e->$parent_field ][] = $e;
                        }
                    }
                }
        
                /* Determine if sub menu items should be skipped when a global section
                      is attached as the display output.
                  */
                $this->top_level_count = count( $top_level_elements );
                foreach ( $top_level_elements as $index => $e ) {

                    $menu_item_options = maybe_unserialize( get_post_meta( $e->ID, 'nectar_menu_options', true ) );
                    if( !empty($menu_item_options) && $nectar_options['header_format'] != 'left-header') {
                        $using_mega_menu = isset($menu_item_options['enable_mega_menu']) && 'on' === $menu_item_options['enable_mega_menu'];
                        $has_global_section = isset($menu_item_options['mega_menu_global_section']) && '-' !== $menu_item_options['mega_menu_global_section'];
                        if( $using_mega_menu && $has_global_section) {
                            $this->unset_children( $e, $children_elements );
                        }
                        
                    }

                    
                    $this->display_element( $e, $children_elements, $max_depth, 0, $args, $output );
                }
                // Reset the count.
                $this->top_level_count = 0;
        
                if ( ( 0 === $max_depth ) && count( $children_elements ) > 0 ) {
                    $empty_array = [];
                    foreach ( $children_elements as $orphans ) {
                        foreach ( $orphans as $op ) {
                            $this->display_element( $op, $empty_array, 1, 0, $args, $output );
                        }
                    }
                }
        
                return $output;
            }

            public function start_el( &$output, $data_object, $depth = 0, $args = null, $current_object_id = 0 ) {

                global $nectar_options;

                // Restores the more descriptive, specific name for use within this method.
                $menu_item = $data_object;
            
                if ( isset( $args->item_spacing ) && 'discard' === $args->item_spacing ) {
                    $t = '';
                    $n = '';
                } else {
                    $t = "\t";
                    $n = "\n";
                }
                $indent = ( $depth ) ? str_repeat( $t, $depth ) : '';
            
                $classes   = empty( $menu_item->classes ) ? array() : (array) $menu_item->classes;
                $classes[] = 'menu-item-' . $menu_item->ID;
            
                /**
                 * Filters the arguments for a single nav menu item.
                 *
                 * @since 4.4.0
                 *
                 * @param stdClass $args      An object of wp_nav_menu() arguments.
                 * @param WP_Post  $menu_item Menu item data object.
                 * @param int      $depth     Depth of menu item. Used for padding.
                 */
                $args = apply_filters( 'nav_menu_item_args', $args, $menu_item, $depth );
            
                /**
                 * Filters the CSS classes applied to a menu item's list item element.
                 *
                 * @since 3.0.0
                 * @since 4.1.0 The `$depth` parameter was added.
                 *
                 * @param string[] $classes   Array of the CSS classes that are applied to the menu item's `<li>` element.
                 * @param WP_Post  $menu_item The current menu item object.
                 * @param stdClass $args      An object of wp_nav_menu() arguments.
                 * @param int      $depth     Depth of menu item. Used for padding.
                 */
                $class_names = implode( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $menu_item, $args, $depth ) );
            
                /**
                 * Filters the ID attribute applied to a menu item's list item element.
                 *
                 * @since 3.0.1
                 * @since 4.1.0 The `$depth` parameter was added.
                 *
                 * @param string   $menu_item_id The ID attribute applied to the menu item's `<li>` element.
                 * @param WP_Post  $menu_item    The current menu item.
                 * @param stdClass $args         An object of wp_nav_menu() arguments.
                 * @param int      $depth        Depth of menu item. Used for padding.
                 */
                $id = apply_filters( 'nav_menu_item_id', 'menu-item-' . $menu_item->ID, $menu_item, $args, $depth );
            
                $li_atts          = array();
                $li_atts['id']    = ! empty( $id ) ? $id : '';
                $li_atts['class'] = ! empty( $class_names ) ? $class_names : '';
            
                /**
                 * Filters the HTML attributes applied to a menu's list item element.
                 *
                 * @since 6.3.0
                 *
                 * @param array $li_atts {
                 *     The HTML attributes applied to the menu item's `<li>` element, empty strings are ignored.
                 *
                 *     @type string $class        HTML CSS class attribute.
                 *     @type string $id           HTML id attribute.
                 * }
                 * @param WP_Post  $menu_item The current menu item object.
                 * @param stdClass $args      An object of wp_nav_menu() arguments.
                 * @param int      $depth     Depth of menu item. Used for padding.
                 */
                $li_atts       = apply_filters( 'nav_menu_item_attributes', $li_atts, $menu_item, $args, $depth );
                $li_attributes = $this->build_atts( $li_atts );
            
                $output .= $indent . '<li' . $li_attributes . '>';
            
                $atts           = array();
                $atts['title']  = ! empty( $menu_item->attr_title ) ? $menu_item->attr_title : '';
                $atts['target'] = ! empty( $menu_item->target ) ? $menu_item->target : '';
                if ( '_blank' === $menu_item->target && empty( $menu_item->xfn ) ) {
                    $atts['rel'] = 'noopener';
                } else {
                    $atts['rel'] = $menu_item->xfn;
                }
            
                if ( ! empty( $menu_item->url ) ) {
                    if ( get_privacy_policy_url() === $menu_item->url ) {
                        $atts['rel'] = empty( $atts['rel'] ) ? 'privacy-policy' : $atts['rel'] . ' privacy-policy';
                    }
            
                    $atts['href'] = $menu_item->url;
                } else {
                    $atts['href'] = '';
                }
            
                $atts['aria-current'] = $menu_item->current ? 'page' : '';
            
                /**
                 * Filters the HTML attributes applied to a menu item's anchor element.
                 *
                 * @since 3.6.0
                 * @since 4.1.0 The `$depth` parameter was added.
                 *
                 * @param array $atts {
                 *     The HTML attributes applied to the menu item's `<a>` element, empty strings are ignored.
                 *
                 *     @type string $title        Title attribute.
                 *     @type string $target       Target attribute.
                 *     @type string $rel          The rel attribute.
                 *     @type string $href         The href attribute.
                 *     @type string $aria-current The aria-current attribute.
                 * }
                 * @param WP_Post  $menu_item The current menu item object.
                 * @param stdClass $args      An object of wp_nav_menu() arguments.
                 * @param int      $depth     Depth of menu item. Used for padding.
                 */
                $atts       = apply_filters( 'nav_menu_link_attributes', $atts, $menu_item, $args, $depth );
                $attributes = $this->build_atts( $atts );
            
                /** This filter is documented in wp-includes/post-template.php */
                $title = apply_filters( 'the_title', $menu_item->title, $menu_item->ID );
            
                /**
                 * Filters a menu item's title.
                 *
                 * @since 4.4.0
                 *
                 * @param string   $title     The menu item's title.
                 * @param WP_Post  $menu_item The current menu item object.
                 * @param stdClass $args      An object of wp_nav_menu() arguments.
                 * @param int      $depth     Depth of menu item. Used for padding.
                 */
                $title = apply_filters( 'nav_menu_item_title', $title, $menu_item, $args, $depth );
            
                $item_output  = $args->before;
                $item_output .= '<a' . $attributes . '>';
                $item_output .= $args->link_before . $title . $args->link_after;
                $item_output .= '</a>';
                $item_output .= $args->after;
                    
                
                // If a global section is attached to display as the megamenu
                $nectar_menu_options_enabled = apply_filters('nectar_menu_options_enabled', true);
                $menu_item_options = maybe_unserialize( get_post_meta( $menu_item->ID, 'nectar_menu_options', true ) );
                
                $compatible_menu_locations = array('top_nav', 'top_nav_pull_left', 'top_nav_pull_right', 'secondary_nav');
                $header_format  = ( ! empty( $nectar_options['header_format'] ) ) ? $nectar_options['header_format'] : 'default';

                // Has options saved.
                if( !empty($menu_item_options) && 
                    false !== $nectar_menu_options_enabled &&
                    $header_format != 'left-header' ) {

                    if(isset($args->theme_location) ) {
                    $using_mega_menu = isset($menu_item_options['enable_mega_menu']) && 'on' === $menu_item_options['enable_mega_menu'];
                    $attached_global_section = isset($menu_item_options['mega_menu_global_section']) && '-' !== $menu_item_options['mega_menu_global_section'] ? $menu_item_options['mega_menu_global_section'] : false;
                        
                        if( $using_mega_menu && 
                        $attached_global_section &&
                        in_array($args->theme_location, $compatible_menu_locations) ) {

                            // Add global section to menu output.
                            $item_output .= '<div class="nectar-global-section-megamenu nectar-global-section force-contained-rows">
                            <div class="inner">
                                '.do_shortcode('[nectar_global_section id="'.esc_attr($attached_global_section).'"]').'
                                </div>
                            </div>';

                            // Also generate dynamic CSS for global section
                            if( class_exists('NectarElDynamicStyles') ) {

                                if( 0 !== $attached_global_section  ) {
                                    $global_section_query = get_post($attached_global_section);
                        
                                    if( isset($global_section_query->post_content) && !empty($global_section_query->post_content) ) {
                                        $global_section_content = $global_section_query->post_content;
                                    }
                                }
                                NectarElDynamicStyles::$element_css = array();
                                $global_section_css = NectarElDynamicStyles::generate_styles($global_section_content);
                                if( $global_section_css ) {
                                    $item_output .= '<style>'.$global_section_css.'</style>';
                                }
                            }
                        }  // end attached and compatible check.
                    
                    } // end check for theme location.

                } // end item has menu options saved.

                
                /**
                 * Filters a menu item's starting output.
                 *
                 * The menu item's starting output only includes `$args->before`, the opening `<a>`,
                 * the menu item's title, the closing `</a>`, and `$args->after`. Currently, there is
                 * no filter for modifying the opening and closing `<li>` for a menu item.
                 *
                 * @since 3.0.0
                 *
                 * @param string   $item_output The menu item's starting HTML output.
                 * @param WP_Post  $menu_item   Menu item data object.
                 * @param int      $depth       Depth of menu item. Used for padding.
                 * @param stdClass $args        An object of wp_nav_menu() arguments.
                 */
                $output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $menu_item, $depth, $args );
            }
            


            // Display Element.
            function display_element( $element, &$children_elements, $max_depth, $depth, $args, &$output ) {
                
                if( !isset($depth) ) {
                    $depth = 0;
                }

                $id_field = $this->db_fields['id'];
                
                global $nectar_options;

                if( isset($element->post_type) && 'nav_menu_item' !== $element->post_type ) {
                    return;
                }
                
                $theme_skin     = NectarThemeManager::$skin;
                $header_format  = ( ! empty( $nectar_options['header_format'] ) ) ? $nectar_options['header_format'] : 'default';
                $dropdownArrows = ( ! empty( $nectar_options['header-dropdown-arrows'] ) && $header_format != 'left-header' ) ? $nectar_options['header-dropdown-arrows'] : 'inherit';

                // Left header dropdown functionality.
                $forced_arrows = false;
                if( isset($nectar_options['left-header-dropdown-func']) && 'separate-dropdown-parent-link' === $nectar_options['left-header-dropdown-func']) {
                    $dropdownArrows = 'show';
                    $forced_arrows = true;
                }

                if ( $theme_skin === 'material' ) {
                    $theme_skin = 'ascend';
                }

                $header_format = ( ! empty( $nectar_options['header_format'] ) ) ? $nectar_options['header_format'] : 'default';

              
                // Nectar Menu Options.
                $nectar_menu_options_enabled = apply_filters('nectar_menu_options_enabled', true);
                $item_icon_output = '';
                $menu_label = '';
                $custom_typography_class = '';
                $attached_global_section = false;
                $is_button_style = false;

                if( isset($element->ID) ) {

                    $menu_item_options = maybe_unserialize( get_post_meta( $element->ID, 'nectar_menu_options', true ) );

                    // Has options saved.
                    if( !empty($menu_item_options) && false !== $nectar_menu_options_enabled ) {

                        // Parent.
                        if( 0 == $depth ) {

                            if( isset($menu_item_options['enable_mega_menu']) && 'on' === $menu_item_options['enable_mega_menu'] ) {

                                // Remove manual megamenu class
                                if( in_array('megamenu', $element->classes) ) {
                                    $index = array_search('megamenu', $element->classes);
                                    if( $index !== false ) {
                                         unset($element->classes[$index]);
                                         $element->classes = array_values( $element->classes );
                                    }
                                }

                                // track whether global section is attached to menu item.
                                if( isset($menu_item_options['mega_menu_global_section']) && 
                                    '-' !== $menu_item_options['mega_menu_global_section'] && 
                                    $header_format != 'left-header') {
                                    $attached_global_section = true;
                                }

                                // Add nectar megamenu class.
                                $element->classes[] = 'megamenu';
                                $element->classes[] = 'nectar-megamenu-menu-item';

                                // Alignment.
                                if( isset($menu_item_options['mega_menu_alignment']) && !empty($menu_item_options['mega_menu_alignment']) ) {
                                    $element->classes[] = 'align-' . esc_attr($menu_item_options['mega_menu_alignment']);
                                }
                                // Width.
                                if( isset($menu_item_options['mega_menu_width']) && !empty($menu_item_options['mega_menu_width']) ) {
                                    $element->classes[] = 'width-' . esc_attr($menu_item_options['mega_menu_width']);
                                }

                                // Bg img.
                                if( isset($menu_item_options['mega_menu_bg_img']) && isset($menu_item_options['mega_menu_bg_img']['id']) && !empty($menu_item_options['mega_menu_bg_img']['id']) ) {

                                    $megamenu_bg_align = 'center';
                                    if( isset($menu_item_options['mega_menu_bg_img_alignment']) && !empty($menu_item_options['mega_menu_bg_img_alignment']) ) {
                                        $megamenu_bg_align = $menu_item_options['mega_menu_bg_img_alignment'];
                                    }

                                    $image_source = wp_get_attachment_image_src($menu_item_options['mega_menu_bg_img']['id'], 'large');

                                    if( $image_source ) {
                                        $element->title = $element->title . '<span class="megamenu-bg-lazy" data-align="'.esc_attr($megamenu_bg_align).'" data-bg-src="'.esc_attr($image_source[0]).'"></span>';
                                    }

                                }



                            } // Megamenu Enabled End.

                            // Button style
                            if( isset($menu_item_options['menu_item_link_link_style']) && 'default' !== $menu_item_options['menu_item_link_link_style'] ) {
                                $element->classes[] = 'menu-item-btn-style-'.esc_attr($menu_item_options['menu_item_link_link_style']);
                                $is_button_style = true;
                            }
                            if( isset($menu_item_options['menu_item_link_link_text_style']) && 'default' !== $menu_item_options['menu_item_link_link_text_style'] ) {

                                $element->classes[] = 'menu-item-hover-'.esc_attr($menu_item_options['menu_item_link_link_text_style']);

                                if( 'text-reveal-wave' === $menu_item_options['menu_item_link_link_text_style'] ) {
                                    $element->title = preg_replace("/([^\\s>])(?!(?:[^<>]*)?>)/u","<span class=\"char\">$1</span>",$element->title);
                                } else if ( 'text-reveal' === $menu_item_options['menu_item_link_link_text_style'] ) {
                                    $element->title = '<span class="nectar-text-reveal-button"><span class="nectar-text-reveal-button__text" data-text="'.esc_attr($element->title).'">'.$element->title.'</span></span>';
                                }
                                
                            }

                        } //  Parent End.

                      //Megamenu Direct Child.
                        if( 1 == $depth ) {

                            $parent_menu_item_options = maybe_unserialize( get_post_meta( $element->menu_item_parent, 'nectar_menu_options', true ) );

                            // Parent is using megamenu.
                            if( isset($parent_menu_item_options['enable_mega_menu']) && 'on' === $parent_menu_item_options['enable_mega_menu'] ) {

                                // Megamenu child title.
                                if( isset($menu_item_options['disable_mega_menu_title']) && 'on' === $menu_item_options['disable_mega_menu_title'] ) {
                                    $element->classes[] = 'hide-title';
                                }

                                // Megamenu column width.
                                if( isset($menu_item_options['menu_item_column_width']) && !empty($menu_item_options['menu_item_column_width']) ) {
                                    $element->classes[] = 'megamenu-column-width-' . esc_attr(intval($menu_item_options['menu_item_column_width']));
                                }
                                // Megamenu column padding.
                                if( isset($menu_item_options['menu_item_column_padding']) && !empty($menu_item_options['menu_item_column_padding']) ) {
                                    $element->classes[] = 'megamenu-column-padding-' . esc_attr($menu_item_options['menu_item_column_padding']);
                                }
                                // Megamenu column Bg img.
                                if( isset($menu_item_options['menu_item_bg_img']) && isset($menu_item_options['menu_item_bg_img']['id']) && !empty($menu_item_options['menu_item_bg_img']['id']) ) {

                                    $item_bg_align = 'center';
                                    if( isset($menu_item_options['menu_item_bg_img_alignment']) && !empty($menu_item_options['menu_item_bg_img_alignment']) ) {
                                        $item_bg_align = $menu_item_options['menu_item_bg_img_alignment'];
                                    }

                                    $image_source = wp_get_attachment_image_src($menu_item_options['menu_item_bg_img']['id'], 'large');
                                    if( $image_source ) {
                                        $element->title = $element->title . '<span class="megamenu-col-bg-lazy" data-align="'.esc_attr($item_bg_align).'" data-bg-src="'.esc_attr($image_source[0]).'"></span>';
                                    }

                                }


                            }

                        } //Megamenu Direct Child End.

                        // Menu Item Label.
                        if( isset($menu_item_options['menu_item_link_label']) &&
                              !empty($menu_item_options['menu_item_link_label']) ) {

                            $menu_label = '<span class="nectar-menu-label nectar-pseudo-expand">'.esc_html($menu_item_options['menu_item_link_label']).'</span>';

                        }


                        // Icon.
                        if( isset($menu_item_options['menu_item_icon_type']) &&
                                'font_awesome' === $menu_item_options['menu_item_icon_type'] &&
                                isset($menu_item_options['menu_item_icon']) ) {

                                    // Add font awesome icon.
                                    $item_icon_output = '<i class="nectar-menu-icon fa '.esc_attr( $menu_item_options['menu_item_icon'] ).'" role="presentation"></i>';
                                    $element->classes[] = 'menu-item-has-icon';
                                    wp_enqueue_style( 'font-awesome' );

                        } 
                        else if( isset($menu_item_options['menu_item_icon_type']) &&
                        'nectarbrands' === $menu_item_options['menu_item_icon_type'] &&
                        isset($menu_item_options['menu_item_icon_nectarbrands']) ) {

                            // Add font awesome icon.
                            $item_icon_output = '<i class="nectar-menu-icon '.esc_attr( $menu_item_options['menu_item_icon_nectarbrands'] ).'" role="presentation"></i>';
                            $element->classes[] = 'menu-item-has-icon';
                            wp_enqueue_style('nectar-brands');

                        } 	
                        else if( isset($menu_item_options['menu_item_icon_type']) &&
                                'iconsmind' === $menu_item_options['menu_item_icon_type'] &&
                                isset($menu_item_options['menu_item_icon_iconsmind']) && 
                                defined('SALIENT_CORE_ROOT_DIR_PATH') && 
                                file_exists(SALIENT_CORE_ROOT_DIR_PATH.'includes/icons/class-nectar-icon.php') ) {

                                    // Add iconsmind icons.
                                    include_once( SALIENT_CORE_ROOT_DIR_PATH.'includes/icons/class-nectar-icon.php' );

                                    if( class_exists('Nectar_Icon') ) {
                                        $nectar_icon_class = new Nectar_Icon(array(
                                        'icon_name' => str_replace('iconsmind-','',$menu_item_options['menu_item_icon_iconsmind']),
                                        'icon_library' => 'iconsmind',
                                        ));
                                    
                                        $item_icon_output = '<span class="nectar-menu-icon svg-icon">'.$nectar_icon_class->render_icon().'</span>';
                            
                                        $element->classes[] = 'menu-item-has-icon';
                                    }

                        }
                        else if ( isset($menu_item_options['menu_item_icon_type']) &&
                                    'custom_text' === $menu_item_options['menu_item_icon_type'] &&
                                                isset($menu_item_options['menu_item_icon_custom_text']) &&
                                                !empty($menu_item_options['menu_item_icon_custom_text']) ) {

                                    $item_icon_output = '<span class="nectar-menu-icon">'.sanitize_text_field( urldecode($menu_item_options['menu_item_icon_custom_text']) ) . '</span>';
                                    $element->classes[] = 'menu-item-has-icon';
                        }
                        else if( isset($menu_item_options['menu_item_icon_type']) &&
                                'custom' === $menu_item_options['menu_item_icon_type'] &&
                                isset($menu_item_options['menu_item_icon_custom']) &&
                                isset($menu_item_options['menu_item_icon_custom']['id']) ) {

                                    // Image icon.
                                    $image_markup = '';

                                    if( $depth > 0 ) {
                                        // Lazy load submenu image icons.
                                        $image_markup_src = wp_get_attachment_image_src( $menu_item_options['menu_item_icon_custom']['id'], 'large' );
                                        $image_meta       = wp_get_attachment_metadata( $menu_item_options['menu_item_icon_custom']['id'] );
                                        $image_alt_tag    = get_post_meta( $menu_item_options['menu_item_icon_custom']['id'], '_wp_attachment_image_alt', true );

                                        $image_height = '20px';
                                        $image_width = '20px';

                                        if(isset($image_meta['width']) && !empty($image_meta['width'])) {
                                            $image_width = $image_meta['width'];
                                        }
                                        if(isset($image_meta['height']) && !empty($image_meta['height'])) {
                                            $image_height = $image_meta['height'];
                                        }

                                        if( isset($image_markup_src[0]) && !empty($image_markup_src[0]) ) {
                                            $placeholder_img_src = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20".esc_attr($image_width).'%20'.esc_attr($image_height)."'%2F%3E";
                                            $image_markup = '<img src="'.$placeholder_img_src.'" class="nectar-menu-icon-img" alt="'.esc_attr($image_alt_tag).'" width="'.esc_attr($image_height).'" height="'.esc_attr($image_width).'" data-menu-img-src="'.esc_url($image_markup_src[0]).'" />';
                                        }
                                    }
                                    else {
                                        $image_markup = wp_get_attachment_image($menu_item_options['menu_item_icon_custom']['id'], 'large',false,array('class'=>'nectar-menu-icon-img'));
                                    }

                                    if( $image_markup ) {
                                        $item_icon_output = $image_markup;
                                        $element->classes[] = 'menu-item-has-icon';
                                    }


                        }

                        // Custom Typography.
                        if( $depth > 0 ) {

                            $ext_menu_item = false;

                            if( isset($menu_item_options['menu_item_link_bg_type']) &&
                            'none' !== $menu_item_options['menu_item_link_bg_type'] ) {
                                $ext_menu_item =  true;
                            }

                            $custom_type = (isset($menu_item_options['menu_item_link_typography'])) ? $menu_item_options['menu_item_link_typography'] : 'default';

                            if( $ext_menu_item == false && 'default' !== $custom_type ) {
                                $custom_typography_class = ' nectar-inherit-'.esc_attr($custom_type);
                            }
                            
                        } // End custom typography.
                        

                        // Hide menu title text.
                        if( isset($menu_item_options['menu_item_hide_menu_title']) &&
                                'on' === $menu_item_options['menu_item_hide_menu_title'] ) {
                            $element->classes[] = 'menu-item-hidden-text';
                        }
                        if( isset($menu_item_options['menu_item_hide_menu_title_modifier']) &&
                                'mobile-only' === $menu_item_options['menu_item_hide_menu_title_modifier'] ) {
                            $element->classes[] = 'menu-item-hidden-text--mobile-only';
                        }

                    } // End has options saved.

                }

                // legacy button styling
                $button_style = get_post_meta( $element->$id_field, 'menu-item-nectar-button-style', true );
                if ( ! empty( $button_style ) && !$is_button_style ) {
                    $element->classes[] = $button_style;
                } else {
                    $element->classes[] = 'nectar-regular-menu-item';
                }
                
                // Text reveal hover effect.
                $menu_item_title = $element->title;
                $theme_location = isset($args[0]) && property_exists($args[0], 'theme_location') ? $args[0]->theme_location : false;
                if (!$is_button_style &&
                    0 == $depth &&
                    in_array($theme_location, array('top_nav', 'top_nav_pull_left', 'top_nav_pull_right')) &&
                    isset($nectar_options['header-hover-effect']) && 
                    'text_reveal' === $nectar_options['header-hover-effect']) {
                    $menu_item_title = '<span class="nectar-text-reveal-button"><span class="nectar-text-reveal-button__text" data-text="'.esc_attr(strip_tags($element->title)).'">'.$element->title.'</span></span>';
                }

                $element->title = '<span class="nectar-text-reveal-button"><span class="nectar-text-reveal-button__text" data-text="'.esc_attr(strip_tags($element->title)).'">'.$element->title.'</span></span>';
                // Item is a widget area
                if( in_array('widget-area-active', $element->classes)  ) {
                    $element->title = $element->title;
                }
                // Dropdown arrows
                else if ( ! empty( $children_elements[ $element->$id_field ] ) && $element->menu_item_parent == 0 && $theme_skin != 'ascend' && $header_format != 'left-header' && $dropdownArrows != 'dont_show' ||
                         ! empty( $children_elements[ $element->$id_field ] ) && $element->menu_item_parent == 0 && $dropdownArrows === 'show' || 
                         $attached_global_section && $dropdownArrows === 'show' ||
                         $attached_global_section && $dropdownArrows != 'dont_show' && $header_format !== 'left-header' && $theme_skin == 'original' ) {
                    $element->title     = $item_icon_output.'<span class="menu-title-text">' .$menu_item_title . '</span>'.$menu_label.'<span class="sf-sub-indicator"><i class="fa fa-angle-down icon-in-menu" aria-hidden="true"></i></span>';
                    $element->classes[] = 'sf-with-ul';
                }

                else if ( ! empty( $children_elements[ $element->$id_field ] ) && $element->menu_item_parent != 0 && $header_format != 'left-header') {
                    $dropdown_icon = (is_rtl()) ? 'fa-angle-left' : 'fa-angle-right';
                    $element->title = $item_icon_output.'<span class="menu-title-text'.esc_attr($custom_typography_class).'">'.$menu_item_title . '</span>'.$menu_label.'<span class="sf-sub-indicator"><i class="fa '.$dropdown_icon.' icon-in-menu" aria-hidden="true"></i></span>';
                }
                else if ( ! empty( $children_elements[ $element->$id_field ] ) && $element->menu_item_parent != 0 && true === $forced_arrows ) {
                    $element->title = $item_icon_output.'<span class="menu-title-text'.esc_attr($custom_typography_class).'">'.$menu_item_title . '</span>'.$menu_label.'<span class="sf-sub-indicator"><i class="fa fa-angle-down icon-in-menu" aria-hidden="true"></i></span>';
                }
                else {
                    $element->title = $item_icon_output.'<span class="menu-title-text'.esc_attr($custom_typography_class).'">'.$menu_item_title . '</span>'.$menu_label;
                }

                // Left Header.
                if ( empty( $button_style ) && $header_format === 'left-header' ) {
                    $element->title = '<span>' . $element->title . '</span>';
                }

                Walker_Nav_Menu::display_element( $element, $children_elements, $max_depth, $depth, $args, $output );
            }


        }

    }
}


nectar_walker_nav_menu();



/**
 * OCM specific icon rendering from nectar menu options.
 *
 * @since 13.0
 */

if( !class_exists('Nectar_OCM_Icon_Walker') ) {
    class Nectar_OCM_Icon_Walker extends Walker_Nav_Menu {

        function display_element( $element, &$children_elements, $max_depth, $depth, $args, &$output ) {
            
            $render_item = true;

            if( !isset($depth) ) {
                $depth = 0;
            }

            $id_field = $this->db_fields['id'];
            
            global $nectar_options;

            // Nectar Menu Options.
            $nectar_menu_options_enabled = apply_filters('nectar_menu_options_enabled', true);
            $item_icon_output = '';
            $menu_label = '';
            $ext_menu_item = false;
            $attached_global_section = false;
            
            if( isset($element->ID) ) {

                $menu_item_options = maybe_unserialize( get_post_meta( $element->ID, 'nectar_menu_options', true ) );

                // Has options saved.
                if( !empty($menu_item_options) && false !== $nectar_menu_options_enabled ) {
                    
                    // track whether global section is attached to menu item.
                    $attached_global_section_mobile = isset($menu_item_options['mega_menu_global_section_mobile']) && '-' !== $menu_item_options['mega_menu_global_section_mobile'] ? $menu_item_options['mega_menu_global_section_mobile'] : false;
                    if( isset($menu_item_options['mega_menu_global_section']) && 
                    '-' !== $menu_item_options['mega_menu_global_section']) {
                        $attached_global_section = true;
                    }

                    // Flag to skip mobile item.
                    if( isset($menu_item_options['menu_item_persist_mobile_header']) &&
                    'on' == $menu_item_options['menu_item_persist_mobile_header'] &&
                    $depth == 0) {
                        $render_item = false;
                    }

                    // See if the menu item will be an extended item.
                    if( isset($menu_item_options['menu_item_link_bg_type']) &&
                    'none' !== $menu_item_options['menu_item_link_bg_type'] ) {
                        $ext_menu_item = true;
                    }
                    
                    // Menu Item Label.
                    if( isset($menu_item_options['menu_item_link_label']) &&
                            !empty($menu_item_options['menu_item_link_label']) ) {

                        $menu_label = '<span class="nectar-menu-label nectar-pseudo-expand">'.esc_html($menu_item_options['menu_item_link_label']).'</span>';

                    }

                    // Icon.
                    if( isset($menu_item_options['menu_item_icon_type']) &&
                            'font_awesome' === $menu_item_options['menu_item_icon_type'] &&
                            isset($menu_item_options['menu_item_icon']) ) {

                                // Add font awesome icon.
                                wp_enqueue_style( 'font-awesome' );
                                $item_icon_output = '<i class="nectar-menu-icon fa '.esc_attr( $menu_item_options['menu_item_icon'] ).'"></i>';
                    }
                    else if( isset($menu_item_options['menu_item_icon_type']) &&
                        'nectarbrands' === $menu_item_options['menu_item_icon_type'] &&
                        isset($menu_item_options['menu_item_icon_nectarbrands']) ) {

                        // Add font awesome icon.
                        $item_icon_output = '<i class="nectar-menu-icon '.esc_attr( $menu_item_options['menu_item_icon_nectarbrands'] ).'" role="presentation"></i>';
                        $element->classes[] = 'menu-item-has-icon';
                        wp_enqueue_style('nectar-brands');

                    } 	
                    else if( isset($menu_item_options['menu_item_icon_type']) &&
                                        'iconsmind' === $menu_item_options['menu_item_icon_type'] &&
                                        isset($menu_item_options['menu_item_icon_iconsmind']) && 
                        defined('SALIENT_CORE_ROOT_DIR_PATH') && 
                        file_exists(SALIENT_CORE_ROOT_DIR_PATH.'includes/icons/class-nectar-icon.php') ) {

                                            // Add iconsmind icons.
                        include_once( SALIENT_CORE_ROOT_DIR_PATH.'includes/icons/class-nectar-icon.php' );

                        if( class_exists('Nectar_Icon') ) {
                            $nectar_icon_class = new Nectar_Icon(array(
                            'icon_name' => str_replace('iconsmind-','',$menu_item_options['menu_item_icon_iconsmind']),
                            'icon_library' => 'iconsmind',
                            ));
                        
                            $item_icon_output = '<span class="nectar-menu-icon svg-icon">'.$nectar_icon_class->render_icon().'</span>';
        
                        }

                    }
                    else if ( isset($menu_item_options['menu_item_icon_type']) &&
                                            'custom_text' === $menu_item_options['menu_item_icon_type'] &&
                                            isset($menu_item_options['menu_item_icon_custom_text']) &&
                                            !empty($menu_item_options['menu_item_icon_custom_text']) ) {

                                $item_icon_output = '<span class="nectar-menu-icon">'.sanitize_text_field( urldecode($menu_item_options['menu_item_icon_custom_text']) ) . '</span>';

                    }
                    else if( isset($menu_item_options['menu_item_icon_type']) &&
                                         'custom' === $menu_item_options['menu_item_icon_type'] &&
                                         isset($menu_item_options['menu_item_icon_custom']) &&
                                         isset($menu_item_options['menu_item_icon_custom']['id']) ) {

                                             // Image icon.
                                             $image_markup = wp_get_attachment_image($menu_item_options['menu_item_icon_custom']['id'], 'large',false,array('class'=>'nectar-menu-icon-img'));
                                             if( $image_markup ) {
                                                 $item_icon_output = $image_markup;
                                             }

                    }
                    
                    // Disable megamenu column title.
                    if( 1 == $depth &&
                        isset($menu_item_options['disable_mega_menu_title']) && 
                        'on' === $menu_item_options['disable_mega_menu_title'] ) {
                        $element->classes[] = 'hide-title';
                    }
                    
                    // Hide menu title text
                    if( isset($menu_item_options['menu_item_hide_menu_title']) &&
                            'on' === $menu_item_options['menu_item_hide_menu_title'] ) {
                        $element->classes[] = 'menu-item-hidden-text';
                    }

                } // options are set

            } // element ID is set

            if( !empty($item_icon_output) ) {
                  $element->classes[] = 'menu-item-has-icon';
                    $element->title = $item_icon_output.'<span class="menu-title-text">'.$element->title . '</span>'.$menu_label;
            }
            else if( !empty($menu_label) || true === $ext_menu_item ) {
                $element->title = '<span class="menu-title-text">'.$element->title . '</span>'.$menu_label;
            }

            // Add menu-item-has-children class for megamneus
            if( $attached_global_section && $attached_global_section_mobile ) {
                $element->classes[] = 'menu-item-has-children';
            }

            if( $render_item === true ) {
                Walker_Nav_Menu::display_element( $element, $children_elements, $max_depth, $depth, $args, $output );
            }
        } // end display_element

        public function start_el(&$output, $data_object, $depth = 0, $args = null, $current_object_id = 0 ) {
            $menu_item = $data_object;
            // Call the parent method to get the default output.
            parent::start_el($output, $menu_item, $depth, $args);

            // If a global section is attached to display as the megamenu
            $nectar_menu_options_enabled = apply_filters('nectar_menu_options_enabled', true);
            $menu_item_options = maybe_unserialize( get_post_meta( $menu_item->ID, 'nectar_menu_options', true ) );
            
            $compatible_menu_locations = array('top_nav', 'top_nav_pull_left', 'top_nav_pull_right', 'secondary_nav');
            
            // Has options saved.
            if( !empty($menu_item_options) && 
                false !== $nectar_menu_options_enabled ) {

                if(isset($args->theme_location) ) {
                $using_mega_menu = isset($menu_item_options['enable_mega_menu']) && 'on' === $menu_item_options['enable_mega_menu'];
                $attached_global_section_mobile = isset($menu_item_options['mega_menu_global_section_mobile']) && '-' !== $menu_item_options['mega_menu_global_section_mobile'] ? $menu_item_options['mega_menu_global_section_mobile'] : false;
                    
                if( $using_mega_menu && 
                    $attached_global_section_mobile &&
                    in_array($args->theme_location, $compatible_menu_locations) ) {

                        // Add global section to menu output.
                        $item_output = '<div class="nectar-global-section-megamenu nectar-global-section force-contained-rows sub-menu">
                        <div class="inner">
                            '.do_shortcode('[nectar_global_section id="'.esc_attr($attached_global_section_mobile).'"]').'
                            </div>
                        </div>';

                        // Also generate dynamic CSS for global section
                        if( class_exists('NectarElDynamicStyles') ) {

                            if( 0 !== $attached_global_section_mobile  ) {
                                $global_section_query = get_post($attached_global_section_mobile);
                    
                                if( isset($global_section_query->post_content) && !empty($global_section_query->post_content) ) {
                                    $global_section_content = $global_section_query->post_content;
                                    NectarElDynamicStyles::$element_css = array();
                                    $global_section_css = NectarElDynamicStyles::generate_styles($global_section_content);
                                    if( $global_section_css ) {
                                        $item_output .= '<style>'.$global_section_css.'</style>';
                                    }
                                }
                            }
                            
                        }

                        $output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $menu_item, $depth, $args );

                    }  // end attached and compatible check.
                
                } // end check for theme location.

            } // end item has menu options saved.

            // Add the custom class to the current item.
        }
            

    }
}


if( !class_exists('Nectar_Walker_Mobile_Header_Items') ) {
    class Nectar_Walker_Mobile_Header_Items extends Walker_Nav_Menu {

        function display_element( $element, &$children_elements, $max_depth, $depth, $args, &$output ) {
            
            $nectar_menu_options_enabled = apply_filters('nectar_menu_options_enabled', true);
            $render_item = false;
            $item_icon_output = '';
            $menu_label = '';
      
            if( !isset($depth) ) {
                $depth = 0;
            }

            if( isset($element->ID) && !$element->menu_item_parent ) {

                $menu_item_options = maybe_unserialize( get_post_meta( $element->ID, 'nectar_menu_options', true ) );

                // Has options saved.
                if( !empty($menu_item_options) && false !== $nectar_menu_options_enabled ) {

                    // Flag to skip mobile item.
                    if( isset($menu_item_options['menu_item_persist_mobile_header']) &&
                    'on' == $menu_item_options['menu_item_persist_mobile_header'] ) {
                        $render_item = true;
                    }

                    // Hide menu title text.
                    if( isset($menu_item_options['menu_item_hide_menu_title']) &&
                    'on' === $menu_item_options['menu_item_hide_menu_title'] ) {
                        $element->classes[] = 'menu-item-hidden-text';
                    }

                    // Button style
                    if( isset($menu_item_options['menu_item_link_link_style']) && 'default' !== $menu_item_options['menu_item_link_link_style'] ) {
                        $element->classes[] = 'menu-item-btn-style-'.esc_attr($menu_item_options['menu_item_link_link_style']);
                    }

                    // Menu Item Label.
                    if( isset($menu_item_options['menu_item_link_label']) &&
                            !empty($menu_item_options['menu_item_link_label']) ) {

                        $menu_label = '<span class="nectar-menu-label nectar-pseudo-expand">'.esc_html($menu_item_options['menu_item_link_label']).'</span>';

                    }

                    // Icon.
                    if( isset($menu_item_options['menu_item_icon_type']) &&
                            'font_awesome' === $menu_item_options['menu_item_icon_type'] &&
                            isset($menu_item_options['menu_item_icon']) ) {

                                            // Add font awesome icon.
                            wp_enqueue_style( 'font-awesome' );
                                            $item_icon_output = '<i class="nectar-menu-icon fa '.esc_attr( $menu_item_options['menu_item_icon'] ).'"></i>';
                            $element->classes[] = 'menu-item-has-icon';
                    }
                    else if( isset($menu_item_options['menu_item_icon_type']) &&
                        'iconsmind' === $menu_item_options['menu_item_icon_type'] &&
                        isset($menu_item_options['menu_item_icon_iconsmind']) && 
                        defined('SALIENT_CORE_ROOT_DIR_PATH') && 
                        file_exists(SALIENT_CORE_ROOT_DIR_PATH.'includes/icons/class-nectar-icon.php') ) {

                            // Add iconsmind icons.
                            include_once( SALIENT_CORE_ROOT_DIR_PATH.'includes/icons/class-nectar-icon.php' );
                          $element->classes[] = 'menu-item-has-icon';

                        if( class_exists('Nectar_Icon') ) {
                            $nectar_icon_class = new Nectar_Icon(array(
                            'icon_name' => str_replace('iconsmind-','',$menu_item_options['menu_item_icon_iconsmind']),
                            'icon_library' => 'iconsmind',
                            ));
                        
                            $item_icon_output = '<span class="nectar-menu-icon svg-icon">'.$nectar_icon_class->render_icon().'</span>';
        
                        }

                    }
                    else if ( isset($menu_item_options['menu_item_icon_type']) &&
                                'custom_text' === $menu_item_options['menu_item_icon_type'] &&
                                isset($menu_item_options['menu_item_icon_custom_text']) &&
                                !empty($menu_item_options['menu_item_icon_custom_text']) ) {
                
                                $element->classes[] = 'menu-item-has-icon';
                                $item_icon_output = '<span class="nectar-menu-icon">'.sanitize_text_field( urldecode($menu_item_options['menu_item_icon_custom_text']) ) . '</span>';

                    }
                    else if( isset($menu_item_options['menu_item_icon_type']) &&
                            'custom' === $menu_item_options['menu_item_icon_type'] &&
                            isset($menu_item_options['menu_item_icon_custom']) &&
                            isset($menu_item_options['menu_item_icon_custom']['id']) ) {

                                // Image icon.
                                $image_markup = wp_get_attachment_image($menu_item_options['menu_item_icon_custom']['id'], 'large',false,array('class'=>'nectar-menu-icon-img'));
                                if( $image_markup ) {
                                    $item_icon_output = $image_markup;
                                      $element->classes[] = 'menu-item-has-icon';
                                }

                    }

                }
            }

            if( $render_item === true ) {
                
                $element->title = $item_icon_output.'<span class="menu-title-text">'.$element->title . '</span>'.$menu_label;
                
                Walker_Nav_Menu::display_element( $element, $children_elements, $max_depth, $depth, $args, $output );
            }
            
        }
    }
}

/**
 * Add in description field into OCM menu link output.
 *
 * @since 5.0
 */
if ( ! function_exists( 'nectar_menu_options_walker_nav_menu' ) ) {

    function nectar_menu_options_walker_nav_menu( $item_output, $item, $depth, $args ) {

        global $nectar_options;

        $ocm_style = ( ! empty( $nectar_options['header-slide-out-widget-area-style'] ) ) ? $nectar_options['header-slide-out-widget-area-style'] : 'slide-out-from-right';

        // Get Descriptions.
        $display_dropdown_desc = false;
        if( isset($nectar_options['header-dropdown-display-desc']) &&
            !empty($nectar_options['header-dropdown-display-desc']) &&
          '1' === $nectar_options['header-dropdown-display-desc']) {
            $display_dropdown_desc = true;
        }

        // If it's an ext menu item, skip since it'll already be added.
        if( false === strpos($item_output,'nectar-ext-menu-item') ) {

            // OCM.
            if ( 'off_canvas_nav' === $args->theme_location && $item->description ) {

                if( 'fullscreen' === $ocm_style || 'fullscreen-alt' === $ocm_style) {
                    $item_output = str_replace( $args->link_after . '</a>', $args->link_after . '</a><small class="nav_desc">' . wp_kses_post($item->description) . '</small>', $item_output );
                } else {
                    $item_output = str_replace( $args->link_after . '</a>', $args->link_after . '<small class="nav_desc">' . wp_kses_post($item->description) . '</small></a>', $item_output );
                }

            }

            // Regular Dropdowns.
            else if( in_array( $args->theme_location, array('top_nav','secondary_nav','top_nav_pull_right','top_nav_pull_left')) && $item->description ) {

                        if( true === $display_dropdown_desc && $depth > 0 ) {
                            $item_output = str_replace( $args->link_after . '</a>', $args->link_after . '<small class="item_desc">' . wp_kses_post($item->description) . '</small></a>', $item_output );
                        }
            }

        }

        return $item_output;

    }
}

add_filter( 'walker_nav_menu_start_el', 'nectar_menu_options_walker_nav_menu', 10, 4 );


if( !function_exists('salient_wcag_nav_menu_link_attributes') ) {
    function salient_wcag_nav_menu_link_attributes( $atts, $item, $args, $depth ) {

        // Add [aria-haspopup] and [aria-expanded] to menu items that have children
        if ( property_exists($item, 'classes') ) {
            $item_has_children = in_array( 'menu-item-has-children', $item->classes );
            if ( $item_has_children ) {
                $atts['aria-haspopup'] = "true";
                $atts['aria-expanded'] = "false";
            }
        }

        return $atts;
    }
}
add_filter( 'nav_menu_link_attributes', 'salient_wcag_nav_menu_link_attributes', 10, 4 );




/**
 * OCM SVG output
 *
 * @since 13.1
 */
if ( ! function_exists( 'nectar_ocm_svg_bg' ) ) {

    function nectar_ocm_svg_bg() {

    if( !in_array(NectarThemeManager::$ocm_style, array('fullscreen-inline-images')) ) {
      return;
    }

    echo '<svg class="mask-transition" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
    <clipPath id="nectarCircularWipeMask" clipPathUnits="objectBoundingBox">
    <path class="path" stroke="#000" vector-effect="non-scaling-stroke" d="M 0 0 V 0 Q 0.5 0 1 0 V 0 z"/>
    </clipPath>
    </defs>
    </svg>';

  }

}

/**
 * OCM background images.
 *
 * @since 13.1
 */
if ( ! function_exists( 'nectar_ocm_menu_images' ) ) {

    function nectar_ocm_menu_images() {
    
    global $nectar_options;

    if( !in_array(NectarThemeManager::$ocm_style, array('fullscreen-inline-images')) ) {
      return;
    }

    echo '<div class="nectar-ocm-image-wrap-outer"><div class="nectar-ocm-image-wrap">';
      // Default
      if( isset($nectar_options['fullscreen-inline-images-default']) && isset($nectar_options['fullscreen-inline-images-default']['url']) && !empty($nectar_options['fullscreen-inline-images-default']['url']) ) {
        echo '<div class="nectar-ocm-image current default" data-nectar-img-src="'.esc_attr(nectar_options_img($nectar_options['fullscreen-inline-images-default']['url'])).'"></div>'; 
      }

      // Loop
      $args = array(
        'post_type'	=> 'nav_menu_item',
        'posts_per_page' => -1,
        'meta_query' => array(
          array(
            'key'     => 'nectar_menu_options',
            'compare' => 'EXISTS' 
          )
        )
      );
    
      $menu_item_query = new WP_Query( $args );
    
      if( $menu_item_query->have_posts() ) : while( $menu_item_query->have_posts() ) : $menu_item_query->the_post();
        
        global $post;
        
        $menu_item_options = maybe_unserialize( get_post_meta( $post->ID, 'nectar_menu_options', true ) );
        
        if( isset($menu_item_options['menu_item_ocm_image']) &&
            isset($menu_item_options['menu_item_ocm_image']['id']) ) {
            
            $image_url = wp_get_attachment_image_url($menu_item_options['menu_item_ocm_image']['id'], 'full');
            
            if( $image_url ) { 
              $classes = 'menu-item-' . $post->ID;
              echo '<div class="'.$classes.' nectar-ocm-image" data-nectar-img-src="'.esc_attr($image_url).'"></div>';
            }
        }

        endwhile; endif;

        echo '</div></div>';
    

  }

}


/**
 * Menu item style.
 *
 * @since 5.0
 */
if ( ! function_exists( 'nectar_nav_button_style' ) ) {

    function nectar_nav_button_style( $output, $item, $depth, $args ) {

        $item_id = $item->ID;
        $name    = 'menu-item-nectar-button-style';
        $value   = get_post_meta( $item_id, $name, true );

        ?>

      <p class="description description-wide">
            <label for="<?php echo esc_attr( $name ) . '-' . esc_attr( $item_id ); ?>">
                <?php echo __( 'Menu Item Style', 'salient' ); ?> <br />
                <select id="<?php echo esc_attr( $name ) . '-' . esc_attr( $item_id ); ?>" class="widefat edit-menu-item-target" name="<?php echo esc_attr( $name ) . '[' . esc_attr( $item_id ) . ']'; ?>">
                    <option value="" <?php selected( $value, '' ); ?>><?php echo esc_html__( 'Standard', 'salient' ); ?> </option>
                    <option value="button_solid_color" <?php selected( $value, 'button_solid_color' ); ?>><?php echo esc_html__( 'Button Accent Color', 'salient' ); ?> </option>
                    <option value="button_solid_color_2" <?php selected( $value, 'button_solid_color_2' ); ?>><?php echo esc_html__( 'Button Extra Color #1', 'salient' ); ?> </option>
                    <option value="button_bordered" <?php selected( $value, 'button_bordered' ); ?>><?php echo esc_html__( 'Button Bordered Accent Color', 'salient' ); ?> </option>
                    <option value="button_bordered_2" <?php selected( $value, 'button_bordered_2' ); ?>><?php echo esc_html__( 'Button Bordered Extra Color #1', 'salient' ); ?> </option>
                </select>
            </label>
        </p>

        <?php
    }
}

add_action( 'wp_nav_menu_item_custom_fields', 'nectar_nav_button_style', 10, 4 );






$nectar_custom_menu_fields = array(
    'menu-item-nectar-button-style' => '',
);

/**
 * Menu item style update.
 *
 * @since 5.0
 */
function nectar_nav_button_style_update( $menu_id, $menu_item_db_id, $menu_item_args ) {

    if( !function_exists('get_current_screen') ) {
        return;
    }

    $current_screen = get_current_screen();
    
    // Only run this when editing menus in Apperaence > Menus
    if( $current_screen && isset( $current_screen->base ) && $current_screen->base !== 'nav-menus' ) {
        return;
    }

    // fix auto add new pages to top nav
    $on_post_type = ( $current_screen && isset( $current_screen->post_type ) && ! empty( $current_screen->post_type ) ) ? true : false;

    global $nectar_custom_menu_fields;

    if ( defined( 'DOING_AJAX' ) && DOING_AJAX || $on_post_type ) {
        return;
    }
    check_admin_referer( 'update-nav_menu', 'update-nav-menu-nonce' );

    foreach ( $nectar_custom_menu_fields as $key => $label ) {

        // Sanitize
        if ( ! empty( $_POST[ $key ][ $menu_item_db_id ] ) ) {
            // Do some checks here...
            $value = sanitize_text_field( $_POST[ $key ][ $menu_item_db_id ] );
        } else {
            $value = null;
        }

        // Update
        if ( ! is_null( $value ) ) {
            update_post_meta( $menu_item_db_id, $key, $value );
        } else {
            delete_post_meta( $menu_item_db_id, $key );
        }
    }
}

add_action( 'wp_update_nav_menu_item', 'nectar_nav_button_style_update', 10, 3 );
