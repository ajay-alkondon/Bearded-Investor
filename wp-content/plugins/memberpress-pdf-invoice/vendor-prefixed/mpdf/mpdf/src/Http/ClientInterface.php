<?php

namespace MemberPress\PdfInvoice\Mpdf\Http;

use MemberPress\PdfInvoice\Psr\Http\Message\RequestInterface;

interface ClientInterface
{

	public function sendRequest(RequestInterface $request);

}
