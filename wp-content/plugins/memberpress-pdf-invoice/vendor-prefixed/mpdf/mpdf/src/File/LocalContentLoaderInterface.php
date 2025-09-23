<?php

namespace MemberPress\PdfInvoice\Mpdf\File;

interface LocalContentLoaderInterface
{

	/**
	 * @return string|null
	 */
	public function load($path);

}
