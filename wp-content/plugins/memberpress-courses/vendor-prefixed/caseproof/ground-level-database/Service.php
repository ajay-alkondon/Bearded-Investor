<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Database;

use memberpress\courses\GroundLevel\Container\Concerns\Configurable;
use memberpress\courses\GroundLevel\Container\Contracts\ConfiguresParameters;
use memberpress\courses\GroundLevel\Container\Container;
use memberpress\courses\GroundLevel\Container\Contracts\ContainerAwareness;
use memberpress\courses\GroundLevel\Container\Contracts\LoadableDependency;
use memberpress\courses\GroundLevel\Container\Service as ContainerService;
use memberpress\courses\GroundLevel\Database\Models\PersistedModel;
use memberpress\courses\GroundLevel\Support\Models\Hook;
use memberpress\courses\GroundLevel\Support\Concerns\Hookable;
use memberpress\courses\GroundLevel\Support\Str;

/**
 * Base module class
 */
class Service extends ContainerService implements ContainerAwareness, ConfiguresParameters, LoadableDependency
{
    use Configurable;
    use Hookable;

    /**
     * Service ID for the internal database.
     */
    public const INTERNAL_DB = 'GRDLVL.DB';

    /**
     * Service ID for the global database connection service.
     */
    public const DB_CONNECTION = 'GRDLVL.DB.CONNECTION';

    /**
     * Parameter key for the internal database prefix.
     */
    public const PREFIX = 'GRDLVL.DB.PREFIX';

    /**
     * Retrieves the service's default parameters.
     *
     * If these parameters are defined on the container prior to the service being
     * loaded the values will not be overwritten, otherwise the default values
     * will be used.
     *
     * @return array
     */
    public function getDefaultParameters(): array
    {
        return [
            self::PREFIX  => 'grdlvl_',
        ];
    }

    /**
     * Method run when the module is loaded.
     *
     * @param Container $container The container.
     */
    public function load(Container $container): void
    {
        Table::setContainer($container);
        PersistedModel::setContainer($container);

        $container->addService(
            self::INTERNAL_DB,
            static function (Container $container): Database {
                $database = new Database(Service::INTERNAL_DB);
                if ($container->has(Service::DB_CONNECTION)) {
                    $database->setConnection($container->get(Service::DB_CONNECTION));
                }
                return $database
                    ->setPrefix($container->get(self::PREFIX))
                    ->registerSchemaPath(
                        Str::trailingslashit(dirname(__FILE__)) . 'schemas'
                    )
                    ->autoRegisterSchemas();
            }
        );

        $this->addHooks();
    }

    /**
     * Returns an array of Hooks that should be added by the class.
     *
     * @return array
     */
    protected function configureHooks(): array
    {
        return [
            new Hook(
                Hook::TYPE_ACTION,
                'plugins_loaded',
                [
                    $this->container->get(self::INTERNAL_DB),
                    'install',
                ],
                3
            ),
        ];
    }
}
