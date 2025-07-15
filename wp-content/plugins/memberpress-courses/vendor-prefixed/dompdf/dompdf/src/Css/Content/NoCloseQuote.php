<?php
/**
 * @license LGPL-2.1
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */
namespace memberpress\courses\Dompdf\Css\Content;

final class NoCloseQuote extends ContentPart
{
    public function __toString(): string
    {
        return "no-close-quote";
    }
}
