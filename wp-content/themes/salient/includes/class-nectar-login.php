<?php
/**
 * Nectar Login Branding.
 *
 * 
 * @package Salient WordPress Theme
 * @version 17.0
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


/**
 * Nectar Lazy Images.
 */
if( !class_exists('NectarLoginBranding') ) { 
	
	class NectarLoginBranding {
	  
	    private static $instance;
	    public static $global_option_active = false;
        public static $css_output = '';
        
        public function __construct() {
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
            add_action( 'login_head', array($this, 'custom_login_styling_gather') );
            add_action( 'login_head', array($this, 'custom_login_styling_render') );
            add_filter( 'login_headerurl', array($this, 'login_logo_url') );
        }

        public function custom_login_styling_gather() {
            $this->custom_login_logo();
            $this->background_color();
            $this->accent_color();
            $this->secondary_color();
            $this->rounded_edges();
            $this->remove_border();
            $this->full_width_button();
        }

        public function custom_login_logo() {
            $custom_theme_logo = get_option( 'salient_custom_branding_login_logo', false );
            if (isset($custom_theme_logo['url']) &&
                !empty($custom_theme_logo['url']) ) { 
                    self::$css_output .= 'body.login h1 a, body.login .wp-login-logo a {
                        background-image: url(' . esc_url( $custom_theme_logo['url'] ) .')!important;
                        background-size: contain;
                        background-position: bottom;
                        width: 100%;
                        height: 100px;
                    }';
                
            }
        }

        public function rounded_edges() {
            $rounded_edges = get_option( 'salient_custom_branding_login_rounded_edges', false );
            if (isset($rounded_edges) &&
                $rounded_edges === 'on' ) { 
                    self::$css_output .= 'body.login form {
                        border-radius: 15px;
                        box-shadow: 
                            0 1px 2px -1px rgba(0, 0, 0, 0.02),
                            0 2px 6px -2px rgba(0, 0, 0, 0.03),
                            0 6px 12px -3px rgba(0, 0, 0, 0.03),
                            0 15px 30px -3px rgba(0, 0, 0, 0.02);
                    }
                    #login form input[type="text"] {
                        padding-top: 6px;
                        padding-bottom: 6px;
                        padding-left: 6px;
                        border-radius: 6px;
                        line-height: 1;
                    }
                    #login form input[type="password"] {
                        padding-top: 4px;
                        padding-bottom: 4px;
                        padding-left: 6px;
                        border-radius: 6px;
                        line-height: 1;
                    }
                    #login form p.submit input[type="submit"] {
                        min-height: 41px;
                        border-radius: 10px;
                    }';
                
            }
        }

        public function full_width_button() {
            $full_width_button = get_option( 'salient_custom_branding_login_full_width_button', false );
            if (isset($full_width_button) &&
                $full_width_button === 'on' ) { 
                    self::$css_output .= 'body.login form .forgetmenot {
                        display: block;
                        float: none;   
                    }
                    #login form p.submit input[type="submit"] {
                        width: 100%;   
                        margin-top: 10px;
                        border: none;
                    }';
                
            }
        }

        public function remove_border() {
            $remove_border = get_option( 'salient_custom_branding_login_remove_border', false );
            if (isset($remove_border) &&
                $remove_border === 'on' ) { 
                    self::$css_output .= 'body.login form {
                        border: none;
                    }';
                
            }
        }
        
        public function background_color() {
            $custom_background_color = get_option( 'salient_custom_branding_login_background_color', false );
            if (isset($custom_background_color) &&
                !empty($custom_background_color) ) { 
                    self::$css_output .= 'body.login, #wp-auth-check-wrap #wp-auth-check:has(#wp-auth-check-frame) {
                        background-color: ' . esc_attr( $custom_background_color ) . ';
                    }';
                
            }
        }

        public function accent_color() {
            $custom_accent_color = get_option( 'salient_custom_branding_login_accent_color', false );
            if (isset($custom_accent_color) &&
                !empty($custom_accent_color) ) { 
                    self::$css_output .= 'body.login .button-primary,
                    body.login .button-primary:hover,
                    body.login .button-primary:focus {
                        background-color: ' . esc_attr( $custom_accent_color ) . ';
                    } 
                    body.login .button-primary {
                        transition: filter 0.25s;
                    }
                    body.login .button-primary:hover {
                        filter: brightness(90%);
                    }
                    .wp-core-ui .button-secondary {
                        color: ' . esc_attr( $custom_accent_color ) . ';
                    }
                    body.login input[type]:focus,
                    body.login .button.wp-hide-pw:focus,
                    body.login #backtoblog a:focus,
                    body.login .privacy-policy-link:focus,
                    body.login #nav a:focus,
                    body.login h1 a:focus,
                    body.login select:focus {
                        border-color: ' . esc_attr( $custom_accent_color ) . ';
                        box-shadow: 0 0 0 1px ' . esc_attr( $custom_accent_color ) . ';
                    }
                    
                    #language-switcher input[type="submit"],
                    #language-switcher select {
                        color: inherit;   
                    }';
                
            }
        }

        public function secondary_color() {
            $custom_secondary_color = get_option( 'salient_custom_branding_login_secondary_color', false );
            if (isset($custom_secondary_color) &&
                !empty($custom_secondary_color) ) { 
                    self::$css_output .= '.login #backtoblog a, .login #nav a, #language-switcher .dashicons, .login .privacy-policy-link {
                        color: ' . esc_attr( $custom_secondary_color ) . ';
                        transition: opacity 0.25s;
                    }
                    #language-switcher input[type="submit"] {
                        background-color: #fff;
                        border-color: ' . esc_attr( $custom_secondary_color ) . ';
                    }
                    .login #backtoblog a:hover, .login #nav a:hover, .login .privacy-policy-link:hover {
                        opacity: 0.8;
                        color: inherit;
                    }';
                
            }
        }
        public function login_logo_url($url) {
            $custom_theme_logo = get_option( 'salient_custom_branding_login_logo', false );
            if (isset($custom_theme_logo['url']) &&
                !empty($custom_theme_logo['url']) ) { 
                return home_url();
            } 
            return $url;
        }

        public function custom_login_styling_render() {
            if (!empty(self::$css_output)) {
                echo '<style>' . self::$css_output . '</style>';
            }
        }
	}


	/**
	 * Initialize the NectarLoginBranding class
	 */
	NectarLoginBranding::get_instance();

}