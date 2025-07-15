<?php
/**
 * @license LGPL-2.1
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */
namespace memberpress\courses\Dompdf\Css\Content;

abstract class ContentPart
{
    public function equals(self $other): bool
    {
        return $other instanceof static;
    }
}
