<?php

namespace MemberPress\PdfInvoice\Mpdf\PsrLogAwareTrait;

use MemberPress\PdfInvoice\Psr\Log\LoggerInterface;

trait MpdfPsrLogAwareTrait
{

	/**
	 * @var \MemberPress\PdfInvoice\Psr\Log\LoggerInterface
	 */
	protected $logger;

	public function setLogger(LoggerInterface $logger)
	{
		$this->logger = $logger;
		if (property_exists($this, 'services') && is_array($this->services)) {
			foreach ($this->services as $name) {
				if ($this->$name && $this->$name instanceof \MemberPress\PdfInvoice\Psr\Log\LoggerAwareInterface) {
					$this->$name->setLogger($logger);
				}
			}
		}
	}

}
