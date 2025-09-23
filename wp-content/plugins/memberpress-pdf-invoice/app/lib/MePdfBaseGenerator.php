<?php
abstract class MePdfBaseGenerator {

  protected $paper_size;
  protected $paper_orientation;

  public function get_filename( $txn ) {
    return MeprHooks::apply_filters( 'mepr_pdf_invoice_filename', $txn->trans_num . '_invoice.pdf', $txn );
  }

  public function fetch_content( $invoice, $txn ) {
    $html = MePdfInvoicesCtrl::get_html_content( $invoice, $txn );
    return $html;
  }

  abstract protected function set_defaults();
  abstract protected function render( stdClass $invoice, $txn);
}
