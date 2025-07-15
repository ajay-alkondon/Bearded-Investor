<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\QueryBuilder\Contracts;

interface Clause
{
    /**
     * Retrieves the SQL for the clause.
     *
     * @return string
     */
    public function getSql(): string;

    /**
     * Retrieves the bindings present in the clause.
     *
     * @return mixed[]
     */
    public function getBindings(): array;
}
