<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Resque\Exceptions;

use memberpress\courses\GroundLevel\Support\Exceptions\Exception;

/**
 * Errors related to Job status table.
 */
class InvalidJobStatusTableError extends Exception
{
    /**
     * Error code: When an operation was attempted on a Job instance not on the runnable jobs table.
     */
    public const E_INVALID = 200;

    /**
     * Error encountered when an operation was attempted on a Job instance not on the runnable jobs table.
     *
     * @param  string $tableName The job's table name.
     * @param  array  $data      Additional data to add to the exception.
     * @return self
     */
    public static function create(string $tableName, array $data = []): self
    {
        return new self(
            "This action cannot be performed for jobs on the '{$tableName}' table.",
            self::E_INVALID,
            null,
            $data
        );
    }
}
