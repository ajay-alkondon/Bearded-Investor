<?php
/**
 * @license MIT
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

namespace memberpress\courses\Sabberworm\CSS\Value;

abstract class PrimitiveValue extends Value
{
    /**
     * @param int $iLineNo
     */
    public function __construct($iLineNo = 0)
    {
        parent::__construct($iLineNo);
    }
}
