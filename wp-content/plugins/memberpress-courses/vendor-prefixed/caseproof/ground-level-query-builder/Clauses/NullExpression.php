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
use memberpress\courses\GroundLevel\QueryBuilder\Format;

class NullExpression extends Clause implements ClauseContract, Language
{
    /**
     * The column name
     *
     * @var string
     */
    protected string $column;

    /**
     * The operator.
     *
     * Valid operators are {@see self::IS_NULL} and {@see self::IS_NOT_NULL}.
     *
     * @var string
     */
    protected string $operator;

    /**
     * Constructor
     *
     * @param string  $column The column name.
     * @param boolean $not    If true, the operator will be IS NOT NULL. Otherwise, IS NULL.
     */
    public function __construct(string $column, bool $not = false)
    {
        $this->column   = $column;
        $this->operator = $not ? self::IS_NOT_NULL : self::IS_NULL;
    }

    /**
     * Builds the SQL string for the clause.
     *
     * @return string
     */
    public function getSql(): string
    {
        return implode(
            ' ',
            [
                Format::backtick($this->column),
                $this->operator,
            ]
        );
    }
}
