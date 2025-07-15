<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Database\Concerns;

use memberpress\courses\GroundLevel\Database\Models\Relationship;
use memberpress\courses\GroundLevel\Database\RelationshipType;
use memberpress\courses\GroundLevel\Support\Str;

/**
 * Trait enabling relationship management on an object.
 */
trait HasRelationships
{
    /**
     * Array of relationship definitions.
     *
     * @var array
     */
    protected array $relationships = [];

    /**
     * Retrieves the primary key used for the model.
     *
     * @return string
     */
    abstract public function getPrimaryKey(): string;

    /**
     * Retrieves the default foreign key used for the model.
     *
     * @return string
     */
    public function getForeignKey(): string
    {
        return Str::toSnakeCase($this->getModelType()) . '_' . $this->getPrimaryKey();
    }

    /**
     * Initializes a new relationship.
     *
     * @param  \memberpress\courses\GroundLevel\Database\RelationshipType $type         The type of the relationship.
     * @param  string                                 $relatedClass The class name of the related model.
     * @param  string                                 $foreignKey   The foreign key.
     * @param  string                                 $localKey     The local key.
     * @return \memberpress\courses\GroundLevel\Database\Models\Relationship The initialized relationship.
     */
    protected function initRelationship(RelationshipType $type, string $relatedClass, string $foreignKey, string $localKey): Relationship
    {
        $existing = $this->relationships[$relatedClass] ?? null;
        if ($existing) {
            return $existing;
        }
        return new Relationship($type, $this, $relatedClass, $foreignKey, $localKey);
    }

    /**
     * Returns a one-to-one relationship.
     *
     * @param  string $relatedClass The class name of the related model.
     * @param  string $foreignKey   The foreign key.
     * @param  string $localKey     The local key.
     * @return \memberpress\courses\GroundLevel\Database\Models\Relationship The initialized relationship.
     */
    public function hasOne(string $relatedClass, string $foreignKey = '', string $localKey = ''): Relationship
    {
        return $this->initRelationship(
            RelationshipType::HAS_ONE(),
            $relatedClass,
            $foreignKey,
            $localKey
        );
    }

    /**
     * Returns a one-to-many relationship.
     *
     * @param  string $relatedClass The class name of the related model.
     * @param  string $foreignKey   The foreign key.
     * @param  string $localKey     The local key.
     * @return \memberpress\courses\GroundLevel\Database\Models\Relationship The initialized relationship.
     */
    public function hasMany(string $relatedClass, string $foreignKey = '', string $localKey = ''): Relationship
    {
        return $this->initRelationship(
            RelationshipType::HAS_MANY(),
            $relatedClass,
            $foreignKey,
            $localKey
        );
    }

    /**
     * Returns a belongs-to (inverse of one-to-many) relationship.
     *
     * @param  string $relatedClass The class name of the related model.
     * @param  string $foreignKey   The foreign key.
     * @param  string $localKey     The local key.
     * @return \memberpress\courses\GroundLevel\Database\Models\Relationship The initialized relationship.
     */
    public function belongsTo(string $relatedClass, string $foreignKey = '', string $localKey = ''): Relationship
    {
        return $this->initRelationship(
            RelationshipType::BELONGS_TO(),
            $relatedClass,
            $foreignKey,
            $localKey
        );
    }

    /**
     * Returns a belongs-to-many (inverse of many-to-many) relationship.
     *
     * @param  string $relatedClass The class name of the related model.
     * @param  string $foreignKey   The foreign key.
     * @param  string $localKey     The local key.
     * @return \memberpress\courses\GroundLevel\Database\Models\Relationship The initialized relationship.
     */
    public function belongsToMany(string $relatedClass, string $foreignKey = '', string $localKey = ''): Relationship
    {
        return $this->initRelationship(
            RelationshipType::BELONGS_TO_MANY(),
            $relatedClass,
            $foreignKey,
            $localKey
        );
    }
}
