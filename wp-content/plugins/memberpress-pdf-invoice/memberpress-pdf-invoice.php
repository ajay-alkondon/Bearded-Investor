<?php
/*
Plugin Name: MemberPress PDF Invoice
Plugin URI: https://memberpress.com/
Description: Allows your customers to download PDF Invoice of their Payments
Version: 1.2.0
Author: Caseproof, LLC
Author URI: https://caseproof.com/
Text Domain: memberpress-pdf-invoice
Copyright: 2004-2024, Caseproof, LLC
*/

if ( ! defined( 'ABSPATH' ) ) {
  die( 'You are not allowed to call this page directly.' );}

// Let's run the addon
add_action( 'plugins_loaded', function() {
  if ( ! function_exists( 'is_plugin_active' ) ) {
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
  }

  // Bail if MemberPress is not active
  if ( ! is_plugin_active( 'memberpress/memberpress.php' ) && ! defined( 'MEPR_PLUGIN_NAME' ) ) {
    return;
  }

  $plugin_data = get_plugin_data(__FILE__, false, false);

  // Define useful stuffs
  define( 'MPDFINVOICE_VERSION', $plugin_data['Version'] ?? '');
  define( 'MPDFINVOICE_SLUG', 'memberpress-pdf-invoice' );
  define( 'MPDFINVOICE_FILE', MPDFINVOICE_SLUG . '/memberpress-pdf-invoice.php' );
  define( 'MPDFINVOICE_PATH', plugin_dir_path( __FILE__ ) );
  define( 'MPDFINVOICE_APP', MPDFINVOICE_PATH . 'app/' );
  define( 'MPDFINVOICE_URL', plugin_dir_url( __FILE__ ) );
  define( 'MPDFINVOICE_EMAILS', MPDFINVOICE_APP . 'emails');

  // if __autoload is active, put it on the spl_autoload stack
  if ( is_array( spl_autoload_functions() ) && in_array( '__autoload', spl_autoload_functions() ) ) {
    spl_autoload_register( '__autoload' );
  }
  spl_autoload_register( 'mpdfinvoice_autoloader' );

  require_once __DIR__ . '/vendor-prefixed/autoload.php';

  // Run Addon
  new MePdfInvoicesCtrl();
  new MePdfRenewalCtrl();
} );


/**
 * Autoload all the requisite classes
 *
 * @param string $class_name
 */
function mpdfinvoice_autoloader( $class_name ) {
  // Only load classes belonging to this plugin.
  if ( preg_match( '/^MePdf.+$/', $class_name ) ) {
    $filepath = '';
    $filename = "$class_name.php";
    if ( preg_match( '/^.+Ctrl$/', $class_name ) ) {
      $filepath = MPDFINVOICE_APP . 'controllers/' . $filename;
    } elseif ( preg_match( '/^.+Helper$/', $class_name ) ) {
      $filepath = MPDFINVOICE_APP . 'helpers/' . $filename;
    } else {
      if ( file_exists( MPDFINVOICE_APP . 'models/' . $filename ) ) {
        $filepath = MPDFINVOICE_APP . 'models/' . $filename;
      } elseif ( file_exists( MPDFINVOICE_APP . 'lib/' . $filename ) ) {
        $filepath = MPDFINVOICE_APP . 'lib/' . $filename;
      }
    }

    if ( file_exists( $filepath ) ) {
      require_once $filepath;
    }
  }
}

/**
 * It is recommended to set custom temporary directory for MPDF - https://mpdf.github.io/installation-setup/installation-v7-x.html
 *
 * @return void
 */
function mpdfinvoice_activate() {
  $upload = wp_upload_dir();
  $upload_dir = $upload['basedir'];
  $upload_dir = $upload_dir . '/mepr/mpdf';
  if (! is_dir($upload_dir)) {
    mkdir( $upload_dir, 0700, true );
  }
}
register_activation_hook( __FILE__, 'mpdfinvoice_activate' );
