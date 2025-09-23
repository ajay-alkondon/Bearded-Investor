<?php

use MemberPress\PdfInvoice\Psr\Log\AbstractLogger;

class MePdfLogger extends AbstractLogger {
  public function log( $level, $message, array $context = array() ) {
    MeprUtils::debug_log( $message );
  }
}
