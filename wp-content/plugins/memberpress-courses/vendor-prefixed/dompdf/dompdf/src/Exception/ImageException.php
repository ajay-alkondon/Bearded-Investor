<?php
/**
 * @package dompdf
 * @link    https://github.com/dompdf/dompdf
 * @license http://www.gnu.org/copyleft/lesser.html GNU Lesser General Public License
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */
namespace memberpress\courses\Dompdf\Exception;

use memberpress\courses\Dompdf\Exception;

/**
 * Image exception thrown by DOMPDF
 *
 * @package dompdf
 */
class ImageException extends Exception
{

    /**
     * Class constructor
     *
     * @param string $message Error message
     * @param int $code       Error code
     */
    function __construct($message = null, $code = 0)
    {
        parent::__construct($message, $code);
    }

}
