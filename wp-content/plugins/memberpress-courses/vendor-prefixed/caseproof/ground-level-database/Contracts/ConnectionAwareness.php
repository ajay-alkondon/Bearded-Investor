<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Database\Contracts;

interface ConnectionAwareness
{
    /**
     * Sets the database connection.
     *
     * @param  \wpdb|\memberpress\courses\GroundLevel\Database\Contracts\Connection $connection The database connection.
     * @return self
     */
    public function setConnection($connection);

    /**
     * Gets the database connection.
     *
     * @return null|\wpdb|\memberpress\courses\GroundLevel\Database\Contracts\Connection
     */
    public function getConnection();
}
