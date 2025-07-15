<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Resque\Concerns;

use memberpress\courses\GroundLevel\Support\Str;
use memberpress\courses\GroundLevel\Resque\Service;
use memberpress\courses\GroundLevel\Container\Container;

/**
 * Trait containing prefixes related utils.
 */
trait NormalizedPrefix
{
    /**
     * Returns the normalized Service prefix.
     *
     * @return string
     */
    private function getNormalizedPrefix(): string
    {
        return Str::untrailingUnderscoreIt($this->getContainer()->get(Service::PREFIX));
    }

    /**
     * Retrieves a container.
     *
     * @return Container
     */
    abstract public function getContainer(): Container;
}
