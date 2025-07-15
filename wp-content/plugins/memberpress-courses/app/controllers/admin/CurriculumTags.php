<?php
namespace memberpress\courses\controllers\admin;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

use memberpress\courses as base;
use memberpress\courses\lib as lib;
use memberpress\courses\models as models;

class CurriculumTags extends lib\BaseCtaxCtrl  {
  public static $tax = 'mpcs-curriculum-tags';

  public function load_hooks() {
    add_action('parent_file', array($this, 'parent_menu_expand'));
  }

  /**
  * Register custom taxonomy
  * @see BaseCtaxCtrl add_action('init')
  * @return void
  */
  public function register_taxonomy() {
    $this->ctax = array(
      'label' => __('Curriculum Tags', 'memberpress-courses'),
      'labels' => array(
        'name' => __('Curriculum Tags', 'memberpress-courses'),
        'singular_name' => __('Curriculum Tag', 'memberpress-courses'),
        'add_new_item' => __('Add New Tag', 'memberpress-courses'),
        'search_items' => __('Search Tag', 'memberpress-courses'),
        'edit_item' => __('Edit Tag', 'memberpress-courses'),
        'view_item' => __('View Tag', 'memberpress-courses'),
        'update_item' => __('Update Tag', 'memberpress-courses'),
        'back_to_items' => __('Back to Curriculum Tags', 'memberpress-courses')
      ),
      'public' => true,
      'hierarchical' => false,
      'show_ui' => true,
      'show_in_menu' => true,
      'show_in_nav_menus' => true,
      'rewrite' => array(
        'slug' => 'curriculum-tag',
        'with_front' => true,
      ),
      'show_admin_column' => true,
      'show_in_rest' => true,
      'rest_base' => '',
      'show_in_quick_edit' => true,
    );
    $cpts = models\Lesson::lesson_cpts();
    register_taxonomy('mpcs-curriculum-tags', $cpts, $this->ctax);
  }

  /**
  * Expand the parent menu
  * @see add_action('parent_file')
  * @param string $parent_file Name of the current parent menu
  * @return void
  */
  public function parent_menu_expand($parent_file) {
    global $current_screen;
    if($current_screen->taxonomy === 'mpcs-curriculum-tags') {
      $parent_file = base\PLUGIN_NAME;
    }
    return $parent_file;
  }
}
