<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\QueryBuilder\Clauses;

class WhereLike implements WhereClause
{
    /**
     * The column name
     *
     * @var string
     */
    private string $column;

    /**
     * The search term
     *
     * @var string
     */
    private string $searchTerm;

    /**
     * Constructs a new instance of the WhereLikeClause class.
     *
     * @param string $column     The name of the column to search in.
     * @param string $searchTerm The search term to look for.
     */
    public function __construct(string $column, string $searchTerm)
    {
        $this->column = $column;
        $this->searchTerm = '%' . addcslashes($searchTerm, '_%\\') . '%';
    }

    /**
     * Returns the SQL statement for the WHERE LIKE clause.
     *
     * @return string The SQL statement.
     */
    public function getSql()
    {
        return implode(' ', [$this->column, 'LIKE', '%s']);
    }

    /**
     * Retrieves the bindings for this instance.
     *
     * @return array The array of bindings.
     */
    public function getBindings()
    {
        return [$this->searchTerm];
    }
}
