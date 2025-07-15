<?php

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
  exit;
}


/**
* Nectar Theme Manager.
*/


if( !class_exists('NectarThemeManager') ) {

  class NectarThemeManager {

    private static $instance;
    
    public static $options                = '';
    public static $skin                   = '';
    public static $ocm_style              = '';
    public static $woo_product_filters    = false;
    public static $colors                 = array();
    public static $available_theme_colors = array();
    public static $header_format          = '';
    public static $header_remove_fixed    = false;
    public static $body_border_func       = 'default';
    public static $column_gap             = '';
    public static $theme_name             = 'Salient';
    public static $theme_author           = 'ThemeNectar';

    public static $custom_theme_name        = false;
    public static $custom_theme_author      = false;
    public static $custom_theme_author_uri  = 'https://themenectar.com';
    public static $custom_theme_description = false;
    public static $custom_theme_screenshot  = false;
    public static $custom_theme_logo        = false;
    public static $hide_theme_version       = false;

    public static $global_seciton_options = array(
      'global-section-after-header-navigation',
      'global-section-above-footer' 
    );
    
    private function __construct() {

      self::setup();
      self::custom_theme_branding();
      
      $this->hooks();

    }

    /**
     * Initiator.
     */
    public static function get_instance() {
      if ( !self::$instance ) {
        self::$instance = new self;
      }
      return self::$instance;
    }

    public function hooks() {
      add_action('after_setup_theme', array( $this, 'localization'));
    }

    public function localization() {

      // i18n related strings
      $custom_theme_name = get_option( 'salient_custom_branding_theme_name', false );
      if ( $custom_theme_name ) {
        self::$custom_theme_name = $custom_theme_name;
        self::$theme_name = $custom_theme_name;
      } else {
        self::$theme_name = esc_html__( 'Salient', 'salient' );
      }

    }

    /**
     * Adds custom branding to the theme.
     */
    public static function custom_theme_branding() {

      $custom_theme_name        = get_option( 'salient_custom_branding_theme_name', false );
      $custom_theme_author      = get_option( 'salient_custom_branding_theme_author', false );
      $custom_theme_author_uri  = get_option( 'salient_custom_branding_theme_author_uri', false );
      $custom_theme_description = get_option( 'salient_custom_branding_theme_description', false );
      $custom_theme_screenshot  = get_option( 'salient_custom_branding_theme_image', false );
      $custom_theme_logo        = get_option( 'salient_custom_branding_theme_logo', false );
      $hide_theme_version       = get_option( 'salient_custom_branding_hide_theme_version', false );
      if ( $custom_theme_name ) {
        self::$custom_theme_name = $custom_theme_name;
        self::$theme_name = $custom_theme_name;
      } else {
        self::$theme_name = 'Salient';
      }

      if ( $custom_theme_author ) {
        self::$custom_theme_author = $custom_theme_author;
        self::$theme_author = $custom_theme_author;
      }
      if ( $custom_theme_author_uri ) {
        self::$custom_theme_author_uri = $custom_theme_author_uri;
      }
      if ( $custom_theme_description ) {
        self::$custom_theme_description = $custom_theme_description;
      }
      if ( $custom_theme_screenshot ) {
        self::$custom_theme_screenshot = $custom_theme_screenshot;
      }
      if ( $custom_theme_logo ) {
        self::$custom_theme_logo = $custom_theme_logo;
      }

      if ( $hide_theme_version && $hide_theme_version === 'on') {
        self::$hide_theme_version = true;
      }

      add_filter( 'wp_prepare_themes_for_js', ['NectarThemeManager', 'prepare_themes_for_js']);
    
    }

    public static function prepare_themes_for_js( $themes ) {
      if ( isset($themes['salient']) ) {
          
        if ( self::$custom_theme_screenshot && 
            isset(self::$custom_theme_screenshot['url']) &&
            !empty(self::$custom_theme_screenshot['url']) ) {
            $themes['salient']['screenshot'][0] = esc_url(self::$custom_theme_screenshot['url']);
        }

        if ( self::$custom_theme_description ) {
          $themes['salient']['description'] = esc_html(self::$custom_theme_description);
        }

        if ( self::$custom_theme_name ) {
          $themes['salient']['name'] = esc_html(self::$custom_theme_name);
        }

        if ( self::$custom_theme_author ) {
          $themes['salient']['author'] = esc_attr(self::$custom_theme_author);
          $themes['salient']['authorAndUri'] = '<a href="'. esc_attr(self::$custom_theme_author_uri) .'">'. esc_attr(self::$custom_theme_author) .'</a>';
        }
        
      }
    
      return $themes;
    }
    /**
     * Determines all theme settings
     * which are conditionally forced.
     */
    public static function setup() {
      
      self::$options = get_nectar_theme_options();

      // Theme Skin.
      $theme_skin          = ( isset(self::$options['theme-skin']) && !empty(self::$options['theme-skin']) ) ? self::$options['theme-skin'] : 'material';
      $header_format       = ( isset(self::$options['header_format']) ) ? self::$options['header_format'] : 'default';
      $search_enabled      = ( isset(self::$options['header-disable-search']) && '1' === self::$options['header-disable-search'] ) ? false : true;
      $ajax_search         = ( isset(self::$options['header-disable-ajax-search']) && '1' === self::$options['header-disable-ajax-search'] ) ? false : true;
      $ajax_search_style   = ( isset(self::$options['header-ajax-search-style']) ) ? self::$options['header-ajax-search-style'] : 'default';
      $header_remove_fixed = ( isset(self::$options['header-remove-fixed'])) ? self::$options['header-remove-fixed'] : '0';
      $body_border         = ( isset(self::$options['body-border']) && '1' === self::$options['body-border'] ) ? true : false;
      $body_border_type    = ( isset(self::$options['body-border-functionality']) && $body_border) ? self::$options['body-border-functionality'] : 'default';
      $boxed_layout        = ( isset(self::$options['boxed_layout']) && '1' === self::$options['boxed_layout'] ) ? true : false;

      if ( $header_format === 'left-header' || $boxed_layout ) {
        $body_border_type = 'default';
      }
      self::$body_border_func = $body_border_type;

      self::$header_remove_fixed = ( '1' === $header_remove_fixed ) ? '1' : '0';
      

      self::$header_format = $header_format;

    	if( 'centered-menu-bottom-bar' === $header_format ) {
    		$theme_skin = 'material';
    	}
      if( true === $ajax_search && 'extended' === $ajax_search_style && true === $search_enabled ) {
    		$theme_skin = 'material';
    	}

      self::$skin = esc_html($theme_skin);
      
      
      // OCM style.
      $theme_ocm_style    = ( isset( self::$options['header-slide-out-widget-area-style'] ) && !empty( self::$options['header-slide-out-widget-area-style'] ) ) ? self::$options['header-slide-out-widget-area-style'] : 'slide-out-from-right';
      $legacy_double_menu = ( function_exists('nectar_legacy_mobile_double_menu') ) ? nectar_legacy_mobile_double_menu() : false;
      
      if( true === $legacy_double_menu && in_array($theme_ocm_style, array('slide-out-from-right-hover', 'simple')) ) {
         $theme_ocm_style = 'slide-out-from-right';
      }
      
      self::$ocm_style = esc_html($theme_ocm_style);
      
      
      // Woo filter area.
      $product_filter_trigger = ( isset( self::$options['product_filter_area']) && '1' === self::$options['product_filter_area'] ) ? true : false;
			$main_shop_layout       = ( isset( self::$options['main_shop_layout'] ) ) ? self::$options['main_shop_layout'] : 'no-sidebar';
			
			if( $main_shop_layout != 'right-sidebar' && $main_shop_layout != 'left-sidebar' ) {
				$product_filter_trigger = false;
			}
      
      self::$woo_product_filters = $product_filter_trigger;


      // Column Gap.
      self::$column_gap = ( isset( self::$options['column-spacing']) ) ? self::$options['column-spacing'] : 'default';
      

      // Theme Colors.
      self::$available_theme_colors = array(
        'accent-color' => 'Salient Accent Color',
        'extra-color-1' => 'Salient Extra Color #1',
        'extra-color-2' => 'Salient Extra Color #2',
        'extra-color-3' => 'Salient Extra Color #3'
      );

      $custom_colors = apply_filters('nectar_additional_theme_colors', array());
      if( $custom_colors && !empty($custom_colors) ) {
        $custom_colors = array_flip($custom_colors);
      }

      self::$available_theme_colors = array_merge(self::$available_theme_colors, $custom_colors);
      

      foreach( self::$available_theme_colors as $color => $display_name ) {
        
          self::$colors[$color] = array(
            'display_name' => $display_name,
            'value' => ''
          );

          if( isset( self::$options[$color]) && !empty( self::$options[$color]) ) {
            self::$colors[$color]['value'] = self::$options[$color];
          }
        
      }

      // Overall Colors.
      $overall_font_color = ( isset(self::$options['overall-font-color']) ) ? self::$options['overall-font-color'] : false;
      if( $overall_font_color ) {
        self::$colors['overall_font_color'] = $overall_font_color;
      }


    }

    public static function get_active_special_locations() {
      $special_locations = get_option( 'salient_global_section_special_locations', array() );
      return $special_locations;
    }

   /**
    * Determines if a special location is active.
    * @param string $location
    * @return mixed
    */
    public static function is_special_location_active($location) {
        $special_locations = self::get_active_special_locations();
        return isset($special_locations[$location]) ? $special_locations[$location] : false;
    }


  }
  

  /**
	 * Initialize the NectarThemeManager class
	 */
	NectarThemeManager::get_instance();
}
