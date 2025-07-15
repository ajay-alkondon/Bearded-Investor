<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Resque;

use memberpress\courses\GroundLevel\Container\Concerns\Configurable;
use memberpress\courses\GroundLevel\Container\Container;
use memberpress\courses\GroundLevel\Container\Contracts\ConfiguresParameters;
use memberpress\courses\GroundLevel\Container\Contracts\ContainerAwareness;
use memberpress\courses\GroundLevel\Container\Contracts\LoadableDependency;
use memberpress\courses\GroundLevel\Container\Service as BaseService;
use memberpress\courses\GroundLevel\Resque\Database;
use memberpress\courses\GroundLevel\Database\Service as DatabaseService;
use memberpress\courses\GroundLevel\Support\Models\Hook;
use memberpress\courses\GroundLevel\Support\Str;
use memberpress\courses\GroundLevel\Support\Concerns\Hookable;
use memberpress\courses\GroundLevel\Support\Time;

class Service extends BaseService implements ContainerAwareness, ConfiguresParameters, LoadableDependency
{
    use Configurable;
    use Hookable;

    /**
     * The Service ID.
     */
    public const ID = 'GRDLVL.RESQUE';

    /**
     * The DB Service ID.
     */
    public const DB_ID = 'GRDLVL.RESQUE.DB';

    /**
     * The parameter key for the Resque database prefix.
     */
    public const DB_PREFIX = 'GRDLVL.RESQUE.DB.PREFIX';

    /**
     * The parameter key for the Resque prefix.
     */
    public const PREFIX = 'GRDLVL.RESQUE';

    /**
     * Jobs retry after key.
     */
    public const JOBS_RETRY_AFTER = 'GRDLVL.RESQUE.JOBS.RETRY_AFTER';

    /**
     * Jobs wp cron interval key.
     */
    public const JOBS_INTERVAL = 'GRDLVL.RESQUE.JOBS.INTERVAL';

    /**
     * Jobs wp cron interval name key.
     */
    public const JOBS_INTERVAL_NAME = 'GRDLVL.RESQUE.JOBS.INTERVAL_NAME';

    /**
     * Jobs wp cron action key.
     */
    public const JOBS_ACTION = 'GRDLVL.RESQUE.JOBS.ACTION';

    /**
     * Jobs cleanup "retries number" key.
     */
    public const JOBS_CLEANUP_NUM_RETRIES = 'GRDLVL.RESQUE.JOBS_CLEANUP.NUM_RETRIES';

    /**
     * Jobs cleanup "retry after" key.
     */
    public const JOBS_CLEANUP_RETRY_AFTER = 'GRDLVL.RESQUE.JOBS_CLEANUP.RETRY_AFTER';

    /**
     * Jobs cleanup "delete completed after" key.
     */
    public const JOBS_CLEANUP_DELETE_COMPLETED_AFTER = 'GRDLVL.RESQUE.JOBS_CLEANUP.DELETE_COMPLETED_AFTER';

    /**
     * Jobs cleanup "delete failed after" key.
     */
    public const JOBS_CLEANUP_DELETE_FAILED_AFTER = 'GRDLVL.RESQUE.JOBS_CLEANUP.DELETE_FAILED_AFTER';

    /**
     * Jobs cleanup wp cron interval key.
     */
    public const JOBS_CLEANUP_INTERVAL_NAME = 'GRDLVL.RESQUE.JOBS_CLEANUP.INTERVAL_NAME';

    /**
     * Jobs cleanup wp cron interval.
     */
    public const JOBS_CLEANUP_INTERVAL = 'GRDLVL.RESQUE.JOBS_CLEANUP.INTERVAL';

    /**
     * Jobs cleanup wp cron action key.
     */
    public const JOBS_CLEANUP_ACTION = 'GRDLVL.RESQUE.JOBS_CLEANUP.ACTION';

    /**
     * Configures the service's hooks.
     *
     * @return array
     */
    protected function configureHooks(): array
    {
        return [
            new Hook(
                Hook::TYPE_ACTION,
                'plugins_loaded',
                [$this->getDatabase(), 'install'],
                5 // After the DB module which installs at 3.
            ),
        ];
    }

    /**
     * Retrieves the main Resque database instance from the service's container.
     *
     * This method will throw an error if it's used before the service is loaded.
     *
     * @return \memberpress\courses\GroundLevel\Resque\Database
     * @throws \memberpress\courses\GroundLevel\Container\NotFoundException When the database is not found.
     */
    public function getDatabase(): Database
    {
        return $this->getContainer()->get(self::DB_ID);
    }

    /**
     * Retrieves the worker instance.
     *
     * This method will throw an error if it's used before the service is loaded.
     *
     * @return \memberpress\courses\GroundLevel\Resque\Worker
     * @throws \memberpress\courses\GroundLevel\Container\NotFoundException When the Worker is not found.
     */
    public function getWorker(): Worker
    {
        return $this->getContainer()->get(Worker::ID);
    }

    /**
     * Retrieves the cleaner instance.
     *
     * This method will throw an error if it's used before the service is loaded.
     *
     * @return \memberpress\courses\GroundLevel\Resque\Cleaner
     * @throws \memberpress\courses\GroundLevel\Container\NotFoundException When the Cleaner is not found.
     */
    public function getCleaner(): Cleaner
    {
        return $this->getContainer()->get(Cleaner::ID);
    }

    /**
     * Returns a key=>value list of default parameters.
     *
     * @return array
     */
    public function getDefaultParameters(): array
    {
        return [
            self::DB_PREFIX                           => 'resque_',
            self::PREFIX                              => 'resque_',
            self::JOBS_CLEANUP_NUM_RETRIES            => 5, // "num_retries" before transactions fail.
            self::JOBS_CLEANUP_RETRY_AFTER            => Time::hours(1), // Purely for zombie jobs left in a bad state.
            self::JOBS_CLEANUP_DELETE_COMPLETED_AFTER => Time::days(2),
            self::JOBS_CLEANUP_DELETE_FAILED_AFTER    => Time::days(30),
            self::JOBS_CLEANUP_INTERVAL               => Time::hours(1),
            self::JOBS_RETRY_AFTER                    => Time::minutes(30),
            self::JOBS_INTERVAL                       => Time::minutes(1),
        ];
    }

    /**
     * Loads the dependency.
     *
     * This method is called automatically when the dependency is instantiated.
     *
     * @param \memberpress\courses\GroundLevel\Container\Container $container The container.
     */
    public function load(Container $container): void
    {
        $container->addService(
            DatabaseService::class,
            static function () use ($container): DatabaseService {
                return new DatabaseService($container);
            },
            true
        );

        $container->addService(
            self::DB_ID,
            static function () use ($container): Database {
                $database = new Database(Service::DB_ID);
                if ($container->has(DatabaseService::DB_CONNECTION)) {
                    $database->setConnection($container->get(DatabaseService::DB_CONNECTION));
                }
                return $database
                    ->setPrefix($container->get(self::DB_PREFIX))
                    ->registerSchemaPath(
                        Str::trailingslashit(dirname(__FILE__)) . 'schemas'
                    )
                    ->autoRegisterSchemas();
            }
        );

        // Register Worker Service.
        $container->addService(
            Worker::ID,
            static function () use ($container): Worker {
                return new Worker($container);
            },
            true
        );

        // Register Cleaner Service.
        $container->addService(
            Cleaner::ID,
            static function () use ($container): Cleaner {
                return new Cleaner($container);
            },
            true
        );

        $this->addHooks();
    }

    /**
     * Jobs Table name.
     *
     * @return string
     */
    public function jobsTableName(): string
    {
        return $this->getDatabase()->jobsTableName();
    }

    /**
     * Completed jobs Table name.
     *
     * @return string
     */
    public function completedJobsTableName(): string
    {
        return $this->getDatabase()->completedJobsTableName();
    }

    /**
     * Failed jobs Table name.
     *
     * @return string
     */
    public function failedJobsTableName(): string
    {
        return $this->getDatabase()->failedJobsTableName();
    }

    /**
     * Schedule events.
     */
    public function scheduleEvents(): void
    {
        $this->getWorker()->scheduleEvents();
        $this->getCleaner()->scheduleEvents();
    }

    /**
     * Unschedule events.
     */
    public function unscheduleEvents(): void
    {
        $this->getWorker()->unscheduleEvents();
        $this->getCleaner()->unscheduleEvents();
    }
}
