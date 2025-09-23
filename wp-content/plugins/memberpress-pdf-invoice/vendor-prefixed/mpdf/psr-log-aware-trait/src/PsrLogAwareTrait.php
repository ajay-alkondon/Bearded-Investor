<?php

namespace MemberPress\PdfInvoice\Mpdf\PsrLogAwareTrait;

use MemberPress\PdfInvoice\Psr\Log\LoggerInterface;

trait PsrLogAwareTrait 
{

	/**
	 * @var \MemberPress\PdfInvoice\Psr\Log\LoggerInterface
	 */
	protected $logger;

	public function setLogger(LoggerInterface $logger)
	{
		$this->logger = $logger;
	}
	
}
