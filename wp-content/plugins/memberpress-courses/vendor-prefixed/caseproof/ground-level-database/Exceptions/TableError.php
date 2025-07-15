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
 * Errors related to database tables.
 */
class TableError extends Exception
{
    /**
     * Error code: The table's database was not found.
     */
    public const E_DB_NOT_FOUND = 100;

    /**
     * Error code: Table creation error.
     */
    public const E_TABLE_CREATE = 200;

    /**
     * Error code: Table drop error.
     */
    public const E_TABLE_DROP = 205;

    /**
     * Error code: Table truncate error.
     */
    public const E_TABLE_TRUNCATE = 210;
}
