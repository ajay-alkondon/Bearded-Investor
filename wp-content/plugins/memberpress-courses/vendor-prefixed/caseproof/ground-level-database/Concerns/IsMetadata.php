<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Database\Concerns;

use memberpress\courses\GroundLevel\Database\Models\Relationship;
use memberpress\courses\GroundLevel\QueryBuilder\Query;

trait IsMetadata
{
    use HasRelationships;

    /**
     * Retrieves the model's parent class.
     *
     * @return string
     */
    protected function getParentClass(): string
    {
        return rtrim(static::class, 'Meta');
    }

    /**
     * Retrieves a Relationship model for the models's meta data.
     *
     * @return \memberpress\courses\GroundLevel\Database\Models\Relationship
     */
    public function parent(): Relationship
    {
        return $this->belongsToOne($this->getParentClass());
    }

    /**
     * Retrieves the parent model.
     *
     * @return array
     */
    public function getParent(): array
    {
        $id = $this->getAttribute($this->getForeignKey());
        return $this
            ->parent()
            ->select(
                function (Query $query) use ($id): void {
                    $query->where('id', $id);
                }
            );
    }

    /**
     * Retrieves meta data values for the model.
     *
     * @param  string|null $key The meta key.
     * @return array
     */
    public function getMetaValues(?string $key = null): array
    {
        $values = [];
        foreach ($this->getMetas($key) as $meta) {
            $values[] = $meta->getAttribute('meta_value');
        }
        return $values;
    }
}
