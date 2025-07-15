<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Resque\Enums;

use memberpress\courses\GroundLevel\Support\Enum;

/**
 * Relationship type enum.
 *
 * @method static JobStatus PENDING() Returns the {@see JobStatus::PENDING} enum case.
 * @method static JobStatus WORKING() Returns the {@see JobStatus::WORKING} enum case.
 * @method static JobStatus COMPLETE() Returns the {@see JobStatus::COMPLETE} enum case.
 * @method static JobStatus FAILED() Returns the {@see JobStatus::FAILED} enum case.
 */
class JobStatus extends Enum
{
    /**
     * Type: Pending.
     */
    public const PENDING = 'pending';

    /**
     * Type: Working.
     */
    public const WORKING = 'working';

    /**
     * Type: Completed.
     */
    public const COMPLETE = 'complete';

    /**
     * Type: Failed.
     */
    public const FAILED = 'failed';
}
