<?php
/**
* Plugin Name: Salient Custom Branding
* Plugin URI: https://themenectar.com
* Description: Adds the ability to modify the Salient theme and WordPress admin with custom branding.
* Author: ThemeNectar
* Author URI: https://themenectar.com
* Version: 1.0.0
* Text Domain: salient-custom-branding
*/

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'SALIENT_CUSTOM_BRANDING_ROOT_DIR_PATH', plugin_dir_path( __FILE__ ) );
define( 'SALIENT_CUSTOM_BRANDING_PLUGIN_PATH', plugins_url( 'salient-core' ) );

if ( ! defined( 'SALIENT_CUSTOM_BRANDING_VERSION' ) ) {
    define( 'SALIENT_CUSTOM_BRANDING_VERSION', '1.0.0' );
}

class Salient_Custom_Branding {

    static $instance = false;

    public $plugin_version = SALIENT_CUSTOM_BRANDING_VERSION;

    private function __construct() {


        // Admin assets.
        add_action( 'admin_enqueue_scripts',  array( $this, 'admin_scripts' ) );
        add_action( 'admin_print_styles', array( $this, 'admin_styles' ) );

        // Text domain.
        add_action( 'init', array( $this, 'load_textdomain' ) );

        // Start it up.
        add_action( 'after_setup_theme', array( $this, 'init' ), 0 );

    }

    public static function get_instance() {
        if ( !self::$instance ) {
            self::$instance = new self;
        }
        return self::$instance;
    }

    public function admin_styles() {
        global $pagenow;
        if (is_admin() && 
            $pagenow === 'admin.php' &&
            isset($_GET['page']) && $_GET['page'] === 'salient-custom-branding') {
            wp_enqueue_style( 'wp-color-picker' );
            wp_enqueue_style( 'salient-custom-branding-app', plugins_url( 'assets/build/app.css', __FILE__ ), '', $this->plugin_version );        }
        
    }

    public function admin_scripts() {
        global $pagenow;
        if (is_admin() && 
            $pagenow === 'admin.php' &&
            isset($_GET['page']) && $_GET['page'] === 'salient-custom-branding') {
            wp_enqueue_script( 'wp-color-picker');
            wp_enqueue_script( 'salient-custom-branding-app', plugins_url( 'assets/build/app.js', __FILE__ ), ['wp-color-picker', 'jquery'], $this->plugin_version, true );
        }
       
    }

    public function load_textdomain() {
        load_plugin_textdomain( 'salient-custom-branding', false, plugin_basename( dirname( __FILE__ ) ) . '/languages' );
    }

    public function init() {

        if ( ! defined( 'NECTAR_THEME_NAME' ) ) {
            return;
        }

        // Before init.
        do_action( 'before_salient_custom_branding_init' );

        require_once( SALIENT_CUSTOM_BRANDING_ROOT_DIR_PATH.'includes/class-admin-panel.php' );

        // After init.
        do_action( 'salient_custom_branding_init' );

    }

}

// Plugin init.
global $Salient_Custom_Branding;
$Salient_Custom_Branding = Salient_Custom_Branding::get_instance();