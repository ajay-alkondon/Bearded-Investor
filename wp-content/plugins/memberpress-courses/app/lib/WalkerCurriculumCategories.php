<?php
namespace memberpress\courses\lib;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

use memberpress\courses as base;

class WalkerCurriculumCategories extends \Walker_CategoryDropdown {
  private $post_type;

  public function __construct($post_type) {
    $this->post_type = $post_type;
  }

  public function start_el( &$output, $category, $depth = 0, $args = array(), $id = 0 ) {
    $pad = str_repeat('&nbsp;', $depth * 3);

    $cat_name =  $category->name;

    $output .= "\t<option class=\"level-$depth\" value=\"" . esc_attr($category->term_id) . "\"";
    if ( $category->term_id == $args['selected'] ) {
      $output .= ' selected="selected"';
    }
    $output .= '>';
    $output .= $pad . esc_html( $cat_name );
    if ( isset($args['show_count']) && true === $args['show_count'] ) {
      $count = $this->get_post_type_count($category->term_id, $this->post_type);
      $output .= '&nbsp;(' . number_format_i18n( $count ) . ')';
    }
    $output .= "</option>\n";
  }

  private function get_post_type_count($term_id, $post_type) {
    $args = array(
      'post_type' => $post_type,
      'tax_query' => array(
        array(
          'taxonomy' => 'mpcs-curriculum-categories',
          'field'    => 'term_id',
          'terms'    => $term_id,
        ),
      ),
      'fields' => 'ids',
      'posts_per_page' => 1
    );

    $query = new \WP_Query($args);
    return $query->found_posts;
  }
}
