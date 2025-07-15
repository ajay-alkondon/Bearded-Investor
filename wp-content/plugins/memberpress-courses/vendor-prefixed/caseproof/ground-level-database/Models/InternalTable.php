<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Database\Models;

use memberpress\courses\GroundLevel\Database\Service;

/**
 * Internal database table model.
 */
class InternalTable extends PersistedModel
{
    /**
     * The table name.
     */
    public const TABLE_NAME = 'tables';

    /**
     * The table's name.
     *
     * @var string
     */
    protected string $tableName = self::TABLE_NAME;

    /**
     * The name of the table's database.
     *
     * @var string
     */
    protected string $databaseName = Service::INTERNAL_DB;

    /**
     * The model's type.
     *
     * @var string
     */
    protected string $type = 'InternalTable';
}
