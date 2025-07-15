<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

use memberpress\courses\GroundLevel\Database\Models\InternalTable;
use memberpress\courses\GroundLevel\Database\Service;
use memberpress\courses\GroundLevel\Database\Table;

return [
    'name'        => InternalTable::TABLE_NAME,
    'database'    => Service::INTERNAL_DB,
    'description' => 'Stores meta data about tables registered and managed by GroundLevel\Database component.',
    'version'     => '20230714.1',
    'columns'     => [
        'name' => [
            'description' => 'The full name of the table, including prefixes.',
            'type'        => 'varchar',
            'length'      => 64,
            'allowNull'   => false,
        ],
        'database' => [
            'description' => "The ID of the table's parent database.",
            'type'        => 'varchar',
            'length'      => 64,
            'allowNull'   => false,
        ],
        'version' => [
            'description' => 'The current version of the table.',
            'type'        => 'varchar',
            'length'      => 20,
            'allowNull'   => false,
        ],
        'created' => [
            'description' => 'The initial table creation date and time (in UTC).',
            'type'        => 'datetime',
            'allowNull'   => false,
        ],
        'updated' => [
            'description' => 'The date and time (in UTC) of the last update to the table.',
            'type'        => 'datetime',
            'allowNull'   => false,
        ],
    ],
    'keys'        => [
        'name'         => Table::KEY_PRIMARY,
        'database'     => Table::KEY_DEFAULT,
        'version'      => Table::KEY_DEFAULT,
        'name_database' => [
            'parts' => [
                'name'     => null,
                'database' => null,
            ],
        ],
    ],
];
