<?php

namespace memberpress\courses\lib;

use memberpress\courses as base;
use memberpress\courses\lib\EmailManager;

if (! defined('ABSPATH')) {
  die('You are not allowed to call this page directly.');
}

if (! class_exists('WP_List_Table')) {
  require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

class EmailsTable extends \WP_List_Table
{
  public $_screen;
  public $_columns;
  public $_sortable;

  public $_searchable;
  public $db_search_cols;
  public $totalitems;

  public function __construct($screen, $columns = array())
  {
    if (is_string($screen)) {
      $screen = convert_to_screen($screen);
    }

    $this->_screen = $screen;

    if (! empty($columns)) {
      $this->_columns = $columns;
    }

    $this->_searchable = array(
      'title'   => __('Title', 'memberpress-courses'),
      'subject'      => __('subject', 'memberpress-courses')
    );

    parent::__construct(
      array(
        'singular' => 'wp_list_mpcs_emails', // Singular label
        'plural'   => 'wp_list_mpcs_emails', // plural label, also this will be one of the table css class
        'ajax'     => true, // false //We won't support Ajax for this table
      )
    );
  }

  /**
   * Gets a list of all, hidden, and sortable columns, with filter applied.
   *
   * @return array
   */
  public function get_column_info()
  {
    $columns = get_column_headers($this->_screen);
    $hidden  = get_hidden_columns($this->_screen);

    $sortable = apply_filters("manage_{$this->_screen->id}_sortable_columns", $this->get_sortable_columns());

    $primary = 'title';
    return array($columns, $hidden, $sortable, $primary);
  }


  /**
   * Gets a list of columns.
   *
   * @return array
   */
  public function get_columns()
  {
    return $this->_columns;
  }

  /**
   * Gets a list of sortable columns.
   *
   * @return array
   */
  public function get_sortable_columns()
  {
    return $sortable = array(
      'status'       => array('status', true),
      'type'       => array('type', true),
    );
  }


  /**
   * Prepares the list of items for displaying.
   *
   * @uses WP_List_Table::set_pagination_args()
   *
   * @abstract
   */
  public function prepare_items()
  {
    $emails = EmailManager::get_emails();
    $emails = EmailManager::transform_email_objects($emails);
    $this->items = array_map(function ($email) {
      return (object) $email;
    }, $emails);
  }


  /**
   * Get the list of submissions for the table
   *
   * @param  string  $order_by The column to order by.
   * @param  string  $order The order to sort by.
   * @param  string  $paged The current page.
   * @param  string  $search The search term.
   * @param  integer $perpage The number of items per page.
   * @param  integer $assignment_id The assignment ID to filter by.
   * @return array
   */
  public static function get_list_table($order_by = '', $order = '', $paged = '', $search = '', $search_field = '', $perpage = 10, $assignment_id = null)
  {
    global $wpdb;
    $db = Db::fetch();

    $cols = [
      'id' => 'email.id',
      'email_key' => 'email.email_key',
      'subject' => 'email.subject',
      'body' => 'email.body',
      'enabled' => 'email.enabled',
      'created_at' => 'email.created_at',
    ];

    $search_cols = [
      'um_first_name.meta_value',
      'um_last_name.meta_value',
      'usr.user_login',
      'user_email' => 'usr.user_email',
      'sub.score',
    ];

    $from = "{$db->emails} AS email";

    $joins = [];
    $args = [];
    return Db::list_table($cols, $from, $joins, $args, $order_by, $order, $paged, $search, $perpage, $search_cols);
  }

  /**
   * Generates the table rows.
   */
  public function display_rows()
  {
    $records = $this->items;
    require_once base\VIEWS_PATH . '/admin/emails/row.php';
  }

  /**
   * Gets the number of items to display.
   *
   * @return int
   */
  public function get_items()
  {
    return $this->items;
  }
}
