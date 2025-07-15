<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Container;

use memberpress\courses\GroundLevel\Container\Concerns\HasContainer;
use memberpress\courses\GroundLevel\Container\Contracts\ContainerAwareness;

class Service implements ContainerAwareness
{
    use HasContainer;

    /**
     * Service constructor.
     *
     * @param Container $container The container instance.
     */
    public function __construct(Container $container)
    {
        $this->setContainer($container);
    }
}
