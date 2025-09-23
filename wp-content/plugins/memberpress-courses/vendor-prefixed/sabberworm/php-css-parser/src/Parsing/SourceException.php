<?php
/**
 * @license MIT
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

namespace memberpress\courses\Sabberworm\CSS\Parsing;

use memberpress\courses\Sabberworm\CSS\Position\Position;
use memberpress\courses\Sabberworm\CSS\Position\Positionable;

class SourceException extends \Exception implements Positionable
{
    use Position;

    /**
     * @param string $sMessage
     * @param int $iLineNo
     */
    public function __construct($sMessage, $iLineNo = 0)
    {
        $this->setPosition($iLineNo);
        if (!empty($iLineNo)) {
            $sMessage .= " [line no: $iLineNo]";
        }
        parent::__construct($sMessage);
    }
}
