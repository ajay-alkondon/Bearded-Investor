<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Database;

use memberpress\courses\GroundLevel\Support\Enum;

/**
 * Database formats.
 *
 * @method static DataFormat STRING() Returns the {@see DataFormat::STRING} enum case.
 * @method static DataFormat INTEGER() Returns the {@see DataFormat::INTEGER} enum case.
 * @method static DataFormat FLOAT() Returns the {@see DataFormat::FLOAT} enum case.
 */
class DataFormat extends Enum
{
    /**
     * String format: %s.
     */
    public const STRING = '%s';

    /**
     * Integer format: %d.
     */
    public const INTEGER = '%d';

    /**
     * Float format: %f.
     */
    public const FLOAT = '%f';
}
