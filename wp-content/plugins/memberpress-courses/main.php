<?php
/*
Plugin Name: MemberPress Courses
Plugin URI: https://memberpress.com/
Description: Create Courses that work seamlessly with MemberPress.
Version: 1.4.2
Requires at least: 5.0
Requires Plugins: memberpress
Author: Caseproof LLC
Author URI: https://caseproof.com/
License: GPL v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: memberpress-courses
Domain Path: /i18n
Copyright: 2004-2024, Caseproof, LLC
*/

namespace memberpress\courses;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

/**
 * Returns current plugin version.
 *
 * @return string Plugin version
 */
function plugin_info($field) {
  static $plugin_folder, $plugin_file;

  if( !isset($plugin_folder) or !isset($plugin_file) ) {
    if( ! function_exists( 'get_plugins' ) ) {
      require_once( ABSPATH . '/wp-admin/includes/plugin.php' );
    }

    $plugin_folder = get_plugins( '/' . plugin_basename( dirname( __FILE__ ) ) );
    $plugin_file = basename( ( __FILE__ ) );
  }

  if(isset($plugin_folder[$plugin_file][$field])) {
    return $plugin_folder[$plugin_file][$field];
  }

  return '';
}

// Plugin Information from the plugin header declaration
define(__NAMESPACE__ . '\ROOT_NAMESPACE', __NAMESPACE__);
define(__NAMESPACE__ . '\VERSION', plugin_info('Version'));
define(__NAMESPACE__ . '\DISPLAY_NAME', plugin_info('Name'));
define(__NAMESPACE__ . '\AUTHOR', plugin_info('Author'));
define(__NAMESPACE__ . '\AUTHOR_URI', plugin_info('AuthorURI'));
define(__NAMESPACE__ . '\DESCRIPTION', plugin_info('Description'));

use \memberpress\courses\lib as lib;
use \memberpress\courses\controllers as ctrl;

// Requires MemberPress
if((defined('TESTS_RUNNING') && TESTS_RUNNING) || is_plugin_active('memberpress/memberpress.php')) {
  // Set all path / url variables
  define(__NAMESPACE__ . '\CTRLS_NAMESPACE', __NAMESPACE__ . '\controllers');
  define(__NAMESPACE__ . '\ADMIN_CTRLS_NAMESPACE', __NAMESPACE__ . '\controllers\admin');
  define(__NAMESPACE__ . '\HELPERS_NAMESPACE', __NAMESPACE__ . '\helpers');
  define(__NAMESPACE__ . '\MODELS_NAMESPACE', __NAMESPACE__ . '\models');
  define(__NAMESPACE__ . '\LIB_NAMESPACE', __NAMESPACE__ . '\lib');
  define(__NAMESPACE__ . '\EMAILS_NAMESPACE', __NAMESPACE__ . '\emails');
  define(__NAMESPACE__ . '\JOBS_NAMESPACE', __NAMESPACE__ . '\jobs');
  define(__NAMESPACE__ . '\PLUGIN_SLUG', 'memberpress-courses/main.php');
  define(__NAMESPACE__ . '\PLUGIN_NAME', 'memberpress-courses');
  define(__NAMESPACE__ . '\SLUG_KEY', 'mpcs');
  define(__NAMESPACE__ . '\EDITION', PLUGIN_NAME);
  define(__NAMESPACE__ . '\PATH', dirname(__DIR__) . '/' . PLUGIN_NAME);
  define(__NAMESPACE__ . '\MEPR_I18N', WP_PLUGIN_DIR . '/mepr-i18n');
  define(__NAMESPACE__ . '\CTRLS_PATH', PATH . '/app/controllers');
  define(__NAMESPACE__ . '\ADMIN_CTRLS_PATH', PATH . '/app/controllers/admin');
  define(__NAMESPACE__ . '\HELPERS_PATH', PATH . '/app/helpers');
  define(__NAMESPACE__ . '\MODELS_PATH', PATH . '/app/models');
  define(__NAMESPACE__ . '\LIB_PATH', PATH . '/app/lib');
  define(__NAMESPACE__ . '\EMAILS_PATH', PATH . '/app/emails');
  define(__NAMESPACE__ . '\JOBS_PATH', PATH . '/app/jobs');
  define(__NAMESPACE__ . '\CONFIG_PATH', PATH . '/app/config');
  define(__NAMESPACE__ . '\VIEWS_PATH', PATH . '/app/views');
  define(__NAMESPACE__ . '\BUILD_PATH', PATH . '/public/build');
  define(__NAMESPACE__ . '\IMAGES_PATH', PATH . '/public/images');
  define(__NAMESPACE__ . '\JS_PATH', PATH . '/public/js');
  define(__NAMESPACE__ . '\FONTS_PATH', PATH . '/public/fonts');
  define(__NAMESPACE__ . '\BRAND_PATH', PATH . '/brand');
  define(__NAMESPACE__ . '\URL', plugins_url('/' . PLUGIN_NAME));
  define(__NAMESPACE__ . '\JS_URL', URL . '/public/js');
  define(__NAMESPACE__ . '\CSS_URL', URL . '/public/css');
  define(__NAMESPACE__ . '\BUILD_URL', URL . '/public/build');
  define(__NAMESPACE__ . '\IMAGES_URL', URL . '/public/images');
  define(__NAMESPACE__ . '\FONTS_URL', URL . '/public/fonts');
  define(__NAMESPACE__ . '\BRAND_URL', URL . '/brand');
  define(__NAMESPACE__ . '\DB_VERSION', 16);

  // Autoload all the requisite classes
  function autoloader($class_name) {
    // Only load classes belonging to this plugin.
    if(0 === strpos($class_name, __NAMESPACE__)) {
      preg_match('/([^\\\]*)$/', $class_name, $m);

      $file_name = $m[1];
      $filepath = '';

      if(preg_match('/' . preg_quote(LIB_NAMESPACE) . '\\\.*Exception/', $class_name)) {
        $filepath = LIB_PATH."/Exception.php";
      }
      else if(0 === strpos($class_name, LIB_NAMESPACE . '\Validatable/')) {
        $filepath = LIB_PATH."/{$file_name}.php";
      }
      else if(0 === strpos($class_name, LIB_NAMESPACE . '\Base/')) {
        $filepath = LIB_PATH."/{$file_name}.php";
      }
      else if(0 === strpos($class_name, ADMIN_CTRLS_NAMESPACE)) {
        $filepath = ADMIN_CTRLS_PATH."/{$file_name}.php";
      }
      else if(0 === strpos($class_name, EMAILS_NAMESPACE)) {
        $filepath = EMAILS_PATH."/{$file_name}.php";
      }
      else if(0 === strpos($class_name, JOBS_NAMESPACE)) {
        $filepath = JOBS_PATH."/{$file_name}.php";
      }
      else if(0 === strpos($class_name, CTRLS_NAMESPACE)) {
        $filepath = CTRLS_PATH."/{$file_name}.php";
      }
      else if(0 === strpos($class_name, HELPERS_NAMESPACE)) {
        $filepath = HELPERS_PATH."/{$file_name}.php";
      }
      else if(0 === strpos($class_name, MODELS_NAMESPACE)) {
        $filepath = MODELS_PATH."/{$file_name}.php";
      }
      else if(0 === strpos($class_name, LIB_NAMESPACE)) {
        $filepath = LIB_PATH."/{$file_name}.php";

        // Handle classes under LIB_NAMESPACE
        if (preg_match('/' . preg_quote(LIB_NAMESPACE) . '\\\/', $class_name)) {
          // Extract the relative class name without the lib namespace
          $relative_class = substr($class_name, strlen(LIB_NAMESPACE));

          // Convert lib namespace separators to directory separators
          $relative_class_path = str_replace('\\', '/', $relative_class);

          // Only autoload if /lib/:subfolder is found.
          if( substr_count($relative_class_path, '/') > 1 ) {
            $sub_file_path = LIB_PATH . '/' . $relative_class_path . '.php';
            $sub_file_path = str_replace('//', '/', $sub_file_path); // remove double slashes
            if(file_exists($sub_file_path)) {
              require_once($sub_file_path);
              return;
            }
          }
        }
      }

      if(file_exists($filepath)) {
        require_once($filepath);
      }
    }
  }

  // if __autoload is active, put it on the spl_autoload stack
  if( is_array(spl_autoload_functions()) &&
    in_array('__autoload', spl_autoload_functions()) ) {
    spl_autoload_register('__autoload');
  }

  // Add the autoloader
  spl_autoload_register(__NAMESPACE__ . '\autoloader');

  // Load vendor-prefixed autoloader
  if(file_exists(PATH . '/vendor-prefixed/autoload.php')) {
    require_once(PATH . '/vendor-prefixed/autoload.php');
  }

  // Instansiate Ctrls
  lib\CtrlFactory::all();

  // Setup screens
  ctrl\App::setup_menus();

  register_activation_hook(PLUGIN_SLUG, function() { require_once(LIB_PATH . "/activation.php"); });
  register_deactivation_hook(PLUGIN_SLUG, function() { require_once(LIB_PATH . "/deactivation.php"); });

  // Load groundlevel serices bootstrap file
  require_once(LIB_PATH . '/groundlevel.php');
}
