<?php
/**
 * @package dompdf
 * @link    https://github.com/dompdf/dompdf
 * @license http://www.gnu.org/copyleft/lesser.html GNU Lesser General Public License
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */
namespace memberpress\courses\Dompdf\FrameDecorator;

use memberpress\courses\Dompdf\Dompdf;
use memberpress\courses\Dompdf\Frame;

/**
 * Decorates Frames for table row layout
 *
 * @package dompdf
 */
class TableRow extends AbstractFrameDecorator
{
    /**
     * TableRow constructor.
     * @param Frame $frame
     * @param Dompdf $dompdf
     */
    function __construct(Frame $frame, Dompdf $dompdf)
    {
        parent::__construct($frame, $dompdf);
    }
}
