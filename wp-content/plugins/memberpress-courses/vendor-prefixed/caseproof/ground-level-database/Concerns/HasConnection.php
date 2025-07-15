<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Database\Concerns;

use memberpress\courses\GroundLevel\Database\Contracts\Connection;
use memberpress\courses\GroundLevel\Database\Exceptions\ConnectionError;

trait HasConnection
{
    /**
     * Database connection.
     *
     * @var Connection|\wpdb
     */
    protected $connection;

    /**
     * Gets the database connection.
     *
     * @return null|\wpdb|\memberpress\courses\GroundLevel\Database\Contracts\Connection
     */
    public function getConnection()
    {
        return isset($this->connection) ? $this->connection : null;
    }

    /**
     * Sets the instance's database connection.
     *
     * @param  \wpbd|Connection $connection An instance of \wpdb or a class that implements
     *                                     the Connection interface.
     * @return self
     * @throws \memberpress\courses\GroundLevel\Database\Exceptions\ConnectionError If the connection is invalid.
     */
    public function setConnection($connection): self
    {
        if (! $connection instanceof \wpdb && ! $connection instanceof Connection) {
            throw ConnectionError::invalid();
        }
        $this->connection = $connection;
        return $this;
    }
}
