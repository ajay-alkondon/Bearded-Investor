<?php
/**
 * @package php-svg-lib
 * @link    http://github.com/dompdf/php-svg-lib
 * @license GNU LGPLv3+ http://www.gnu.org/copyleft/lesser.html
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

namespace memberpress\courses\Svg\Tag;

use memberpress\courses\Svg\Style;

class Group extends AbstractTag
{
    protected function before($attributes)
    {
        $surface = $this->document->getSurface();

        $surface->save();

        $style = $this->makeStyle($attributes);

        $this->setStyle($style);
        $surface->setStyle($style);

        $this->applyTransform($attributes);
    }

    protected function after()
    {
        $this->document->getSurface()->restore();
    }
} 
