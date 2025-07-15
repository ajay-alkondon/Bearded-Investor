<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\QueryBuilder\Clauses;

use memberpress\courses\GroundLevel\QueryBuilder\Contracts\Clause as ClauseContract;
use memberpress\courses\GroundLevel\QueryBuilder\Contracts\Language;

abstract class Clause implements ClauseContract, Language
{
    /**
     * Array of raw bindings found within the clause.
     *
     * @var mixed[]
     */
    protected array $bindings = [];

    /**
     * Retrieves the SQL for the clause.
     *
     * @return string
     */
    abstract public function getSql(): string;

    /**
     * Retrieves the bindings present in the clause.
     *
     * @return mixed[]
     */
    public function getBindings(): array
    {
        return $this->bindings;
    }

    /**
     * Retrieves the placeholder for the given binding value.
     *
     * @param  integer|float|string $value The value.
     * @return string
     */
    protected function getPlaceholder($value): string
    {
        $placeholder = '%s';
        if (is_int($value)) {
            $placeholder = '%d';
        } elseif (is_float($value)) {
            $placeholder = '%f';
        }
        return $placeholder;
    }
}
