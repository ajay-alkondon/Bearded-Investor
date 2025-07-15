<?php
namespace memberpress\courses\helpers;
use memberpress\courses\helpers as helpers;
if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

class App {
  public static function info_tooltip($id, $title, $info) {
    ?>
    <span id="admin-tooltip-<?php echo esc_attr($id); ?>" class="admin-tooltip">
      <i class="mpcs-icon mpcs-info-circled mpcs-info-icon"></i>
      <span class="data-title hidden"><?php echo $title; ?></span>
      <span class="data-info hidden"><?php echo $info; ?></span>
    </span>
    <?php
  }

  /**
   * Checks if we are in Classroom Mode
   *
   * @return bool
   */
  public static function is_classroom(){
    $options = \get_option('mpcs-options');
    $classroom_mode = helpers\Options::val($options,'classroom-mode');
    return $classroom_mode == '1';
  }

  /**
   * Determine if current post uses Gutenberg
   *
   * @return bool
   */
  public static function is_gutenberg_page() {
    if ( function_exists( 'is_gutenberg_page' ) &&
      is_gutenberg_page()
    ) {
      // The Gutenberg plugin is on.
      return true;
    }
    $current_screen = get_current_screen();
    if ( method_exists( $current_screen, 'is_block_editor' ) &&
      $current_screen->is_block_editor()
    ) {
      // Gutenberg page on 5+.
      return true;
    }
    return false;
  }

  /**
   * Checks if we are in Classroom mode and WP Footer hook is enabled
   *
   * @return bool
   */
  public static function is_classroom_wp_footer(){

    if( ! self::is_classroom() ){
      return false; // bail.
    }

    $mepr_options = \MeprOptions::fetch();
    return \MeprHooks::apply_filters('mepr-classroom-enable-wp-footer', isset($mepr_options->rl_enable_wp_footer) && 'enabled' === $mepr_options->rl_enable_wp_footer);

  }

  public  static function is_downloads_addon_active(){
    return is_plugin_active('memberpress-downloads/main.php');
  }

  public static function is_gradebook_addon_active(){
    return defined('\memberpress\gradebook\CTRLS_NAMESPACE');
  }

  public static function is_assignments_addon_active(){
    return defined('\memberpress\assignments\CTRLS_NAMESPACE');
  }

  public static function is_quizzes_addon_active(){
    return defined('\memberpress\quizzes\CTRLS_NAMESPACE');
  }
}
