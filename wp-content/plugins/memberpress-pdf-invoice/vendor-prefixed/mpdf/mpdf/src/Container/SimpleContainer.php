<?php

namespace MemberPress\PdfInvoice\Mpdf\Container;

class SimpleContainer implements \MemberPress\PdfInvoice\Mpdf\Container\ContainerInterface
{

	private $services;

	public function __construct(array $services)
	{
		$this->services = $services;
	}

	public function get($id)
	{
		if (!$this->has($id)) {
			throw new \MemberPress\PdfInvoice\Mpdf\Container\NotFoundException(sprintf('Unable to find service of key "%s"', $id));
		}

		return $this->services[$id];
	}

	public function has($id)
	{
		return isset($this->services[$id]);
	}

	public function getServices()
	{
		return $this->services;
	}

}
