<?php if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

class MePdfProformaInvoiceNumber extends MeprBaseModel {
  public function __construct($obj = null) {
    $this->initialize(
      array(
        'invoice_number'  => 0,
        'parent_transaction_id'  => 0,
        'transaction_id'  => 0,
        'created_at'  => null,
        'due_date'  => null
      ),
      $obj
    );
  }

  public static function get_invoice_num($transaction_id){
    $db = MePdfDB::fetch();
    $invoice = $db->get_one_record($db->pf_invoices, array('transaction_id' => $transaction_id));
    if($invoice){
      return $invoice->invoice_number;
    }
    return false;
  }

  public static function get_starting_number(){
    $mepr_options = MeprOptions::fetch();
    $starting_no = absint($mepr_options->attr( 'pf_inv_starting_number' ));
    return $starting_no;
  }

  public static function next_invoice_num() {
    $starting_num = absint(MePdfProformaInvoiceNumber::get_starting_number());
    $last_invoice_num = absint(MePdfProformaInvoiceNumber::get_last_invoice_num());
    $invoice_num = ($last_invoice_num == NULL || $last_invoice_num <= 0 || $last_invoice_num < $starting_num) ? absint($starting_num) + 1: absint($last_invoice_num) + 1 ;
    return $invoice_num;
  }

  public static function get_last_invoice_num() {
    global $wpdb;
    $db = MePdfDB::fetch();
    $last_invoice_no = $wpdb->get_var(
      "SELECT `invoice_number` FROM {$db->pf_invoices} ORDER BY `invoice_number` DESC LIMIT 1"
    );

    return absint($last_invoice_no);
  }

  public static function find_invoice_num($invoice_num){
    global $wpdb;
    $db = MePdfDB::fetch();
    $query = $wpdb->prepare("SELECT id FROM {$db->pf_invoices} WHERE invoice_number = %d LIMIT 1", (int) $invoice_num);

    return $wpdb->get_var($query);
  }

  public static function find_by_txn_id($txn_id){
    global $wpdb;
    $db = MePdfDB::fetch();
    $query = $wpdb->prepare("SELECT * FROM {$db->pf_invoices} WHERE transaction_id = %d LIMIT 1", (int) $txn_id);

    return $wpdb->get_row($query);
  }

  public static function find_invoice_num_by_txn_id($txn_id){
    global $wpdb;
    $db = MePdfDB::fetch();
    $query = $wpdb->prepare("SELECT invoice_number FROM {$db->pf_invoices} WHERE transaction_id = %d LIMIT 1", (int) $txn_id);

    return absint($wpdb->get_var($query));
  }

  public function store(){
    $db = MePdfDB::fetch();

    if(absint($this->invoice_number) <= 0 || absint($this->transaction_id) <= 0){
      return;
    }

    if(is_null($this->created_at) || empty($this->created_at)) {
      $this->created_at = MeprUtils::ts_to_mysql_date(time());
    }

    $args = (array)$this->get_values();
    return $db->create_record($db->pf_invoices, $args, false);
  }

  public function destroy (){}

}
