<?php
/**
 * @license MIT
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

namespace memberpress\courses\Sabberworm\CSS\Parsing;

/**
 * @internal since 8.7.0
 */
class Anchor
{
    /**
     * @var int
     */
    private $iPosition;

    /**
     * @var \memberpress\courses\Sabberworm\CSS\Parsing\ParserState
     */
    private $oParserState;

    /**
     * @param int $iPosition
     * @param \memberpress\courses\Sabberworm\CSS\Parsing\ParserState $oParserState
     */
    public function __construct($iPosition, ParserState $oParserState)
    {
        $this->iPosition = $iPosition;
        $this->oParserState = $oParserState;
    }

    /**
     * @return void
     */
    public function backtrack()
    {
        $this->oParserState->setPosition($this->iPosition);
    }
}
