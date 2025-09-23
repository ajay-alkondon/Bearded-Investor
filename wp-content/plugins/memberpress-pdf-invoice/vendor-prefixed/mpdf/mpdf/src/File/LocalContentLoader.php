<?php

namespace MemberPress\PdfInvoice\Mpdf\File;

class LocalContentLoader implements \MemberPress\PdfInvoice\Mpdf\File\LocalContentLoaderInterface
{

	public function load($path)
	{
		return file_get_contents($path);
	}

}
