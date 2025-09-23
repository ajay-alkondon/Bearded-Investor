<?php

namespace MemberPress\PdfInvoice\Mpdf\Language;

interface ScriptToLanguageInterface
{

	public function getLanguageByScript($script);

	public function getLanguageDelimiters($language);

}
