<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Database\Exceptions;

use memberpress\courses\GroundLevel\Support\Exceptions\Exception;

/**
 * Errors encountered when working with {@see \GroundLevel\Database\Models\Relationship}.
 */
class InvalidRelationshipError extends Exception
{
    /**
     * Error code: The relationship classes must be unique.
     */
    public const E_INVALID_IDENTICAL = 10005;

    /**
     * Error code: The relationship class could not be found.
     */
    public const E_INVALID_NOT_FOUND = 100010;

    /**
     * Error code: The relationship class must be a subclass of {@see \GroundLevel\Database\Models\PersistedModel}.
     */
    public const E_INVALID_SUBCLASS = 10015;
}
