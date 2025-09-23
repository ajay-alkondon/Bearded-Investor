<?php

namespace MemberPress\PdfInvoice\Mpdf\Tag;

use MemberPress\PdfInvoice\Mpdf\Strict;

use MemberPress\PdfInvoice\Mpdf\Cache;
use MemberPress\PdfInvoice\Mpdf\Color\ColorConverter;
use MemberPress\PdfInvoice\Mpdf\CssManager;
use MemberPress\PdfInvoice\Mpdf\Form;
use MemberPress\PdfInvoice\Mpdf\Image\ImageProcessor;
use MemberPress\PdfInvoice\Mpdf\Language\LanguageToFontInterface;
use MemberPress\PdfInvoice\Mpdf\Mpdf;
use MemberPress\PdfInvoice\Mpdf\Otl;
use MemberPress\PdfInvoice\Mpdf\SizeConverter;
use MemberPress\PdfInvoice\Mpdf\TableOfContents;

abstract class Tag
{

	use Strict;

	/**
	 * @var \MemberPress\PdfInvoice\Mpdf\Mpdf
	 */
	protected $mpdf;

	/**
	 * @var \MemberPress\PdfInvoice\Mpdf\Cache
	 */
	protected $cache;

	/**
	 * @var \MemberPress\PdfInvoice\Mpdf\CssManager
	 */
	protected $cssManager;

	/**
	 * @var \MemberPress\PdfInvoice\Mpdf\Form
	 */
	protected $form;

	/**
	 * @var \MemberPress\PdfInvoice\Mpdf\Otl
	 */
	protected $otl;

	/**
	 * @var \MemberPress\PdfInvoice\Mpdf\TableOfContents
	 */
	protected $tableOfContents;

	/**
	 * @var \MemberPress\PdfInvoice\Mpdf\SizeConverter
	 */
	protected $sizeConverter;

	/**
	 * @var \MemberPress\PdfInvoice\Mpdf\Color\ColorConverter
	 */
	protected $colorConverter;

	/**
	 * @var \MemberPress\PdfInvoice\Mpdf\Image\ImageProcessor
	 */
	protected $imageProcessor;

	/**
	 * @var \MemberPress\PdfInvoice\Mpdf\Language\LanguageToFontInterface
	 */
	protected $languageToFont;

	const ALIGN = [
		'left' => 'L',
		'center' => 'C',
		'right' => 'R',
		'top' => 'T',
		'text-top' => 'TT',
		'middle' => 'M',
		'baseline' => 'BS',
		'bottom' => 'B',
		'text-bottom' => 'TB',
		'justify' => 'J'
	];

	public function __construct(
		Mpdf $mpdf,
		Cache $cache,
		CssManager $cssManager,
		Form $form,
		Otl $otl,
		TableOfContents $tableOfContents,
		SizeConverter $sizeConverter,
		ColorConverter $colorConverter,
		ImageProcessor $imageProcessor,
		LanguageToFontInterface $languageToFont
	) {

		$this->mpdf = $mpdf;
		$this->cache = $cache;
		$this->cssManager = $cssManager;
		$this->form = $form;
		$this->otl = $otl;
		$this->tableOfContents = $tableOfContents;
		$this->sizeConverter = $sizeConverter;
		$this->colorConverter = $colorConverter;
		$this->imageProcessor = $imageProcessor;
		$this->languageToFont = $languageToFont;
	}

	public function getTagName()
	{
		$tag = get_class($this);
		return strtoupper(str_replace('MemberPress\PdfInvoice\Mpdf\Tag\\', '', $tag));
	}

	protected function getAlign($property)
	{
		$property = strtolower($property);
		return array_key_exists($property, self::ALIGN) ? self::ALIGN[$property] : '';
	}

	abstract public function open($attr, &$ahtml, &$ihtml);

	abstract public function close(&$ahtml, &$ihtml);

}
