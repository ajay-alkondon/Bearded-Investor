<?php
/**
 * @license GPL-3.0
 *
 * Modified by Team Caseproof using {@see https://github.com/BrianHenryIE/strauss}.
 */

declare(strict_types=1);

namespace memberpress\courses\GroundLevel\Resque;

use memberpress\courses\GroundLevel\Resque\Models\Job;
use memberpress\courses\GroundLevel\Container\Container;
use memberpress\courses\GroundLevel\Container\Service as BaseService;
use memberpress\courses\GroundLevel\Container\Concerns\Configurable;
use memberpress\courses\GroundLevel\Container\Contracts\ConfiguresParameters;
use memberpress\courses\GroundLevel\Container\Contracts\ContainerAwareness;
use memberpress\courses\GroundLevel\Container\Contracts\LoadableDependency;
use memberpress\courses\GroundLevel\Resque\Enums\JobStatus;
use memberpress\courses\GroundLevel\Support\Concerns\Hookable;
use memberpress\courses\GroundLevel\Support\Models\Hook;
use memberpress\courses\GroundLevel\Support\Time;
use memberpress\courses\GroundLevel\Resque\Concerns\NormalizedPrefix;

/**
 * Worker class.
 */
class Cleaner extends BaseService implements ContainerAwareness, ConfiguresParameters, LoadableDependency
{
    use Configurable;
    use Hookable;
    use NormalizedPrefix;

    /**
     * Service ID.
     */
    public const ID = 'GRDLVL.RESQUE.CLEANER';

    /**
     * Returns a key=>value list of default parameters.
     *
     * @return array
     */
    public function getDefaultParameters(): array
    {
        $resquePrefix = $this->getNormalizedPrefix();
        return [
            Service::JOBS_CLEANUP_INTERVAL_NAME => "{$resquePrefix}_jobs_cleanup_interval",
            Service::JOBS_CLEANUP_ACTION        => "{$resquePrefix}_jobs_cleanup",
        ];
    }

    /**
     * Configures the service's hooks.
     *
     * @return array
     */
    protected function configureHooks(): array
    {
        return [
            new Hook(
                Hook::TYPE_FILTER,
                'cron_schedules',
                [$this, 'intervals']
            ),
            new Hook(
                Hook::TYPE_ACTION,
                $this->getContainer()->get(Service::JOBS_CLEANUP_ACTION),
                [$this, 'cleanup']
            ),
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

        $this->addHooks();
        $this->scheduleEvents();
    }

    /**
     * WP Cron Intervals definition.
     *
     * phpcs:disable -- Squiz.Commenting.DocCommentAlignment.SpaceAfterStar
     * @param array $schedules Schedules {
     *     An array of non-default cron schedules keyed by the schedule name. Default empty array.
     *
     * @type array ...$0 {
     *         Cron schedule information.
     *
     *         @type   integer $interval The schedule interval in seconds.
     *         @type   string  $display  The schedule display name.
     *     }
     * phpcs:enable -- Squiz.Commenting.DocCommentAlignment.SpaceAfterStar
     * }
     * @return array
     */
    public function intervals(array $schedules = []): array
    {
        $schedules[$this->getContainer()->get(Service::JOBS_CLEANUP_INTERVAL_NAME)] = [
            'interval' => $this->getContainer()->get(Service::JOBS_CLEANUP_INTERVAL),
            'display'  => \esc_html__('Resque Jobs Cleanup', 'ground-level'),
        ];

        return $schedules;
    }

    /**
     * Schedule events.
     */
    public function scheduleEvents(): void
    {
        $action = $this->getContainer()->get(Service::JOBS_CLEANUP_ACTION);
        if (!\wp_next_scheduled($action)) {
            \wp_schedule_event(
                Time::now(Time::FORMAT_TIMESTAMP, true) + $this->getContainer()->get(Service::JOBS_CLEANUP_INTERVAL),
                $this->getContainer()->get(Service::JOBS_CLEANUP_INTERVAL_NAME),
                $action
            );
        }
    }

    /**
     * Unschedule events.
     */
    public function unscheduleEvents(): void
    {
        $action = $this->getContainer()->get(Service::JOBS_CLEANUP_ACTION);
        \wp_unschedule_event(
            \wp_next_scheduled($action),
            $action
        );
    }

    /**
     * Clean up the jobs table.
     *
     * - Retries lingering jobs
     * - Deletes completed jobs that have been in the system for over a day
     * - Delete jobs that have been retried and are still in a working state
     */
    public function cleanup(): void
    {
        // Retry lingering jobs.
        $this->retryLingeringJobs();

        // Delete completed jobs that have been in the system for over a day?
        $this->deleteCompletedOldJobs();

        // Delete jobs that have been retried and are still in a working state.
        $this->deleteRetriedButStillOnWorkingJobs();
    }

    /**
     * Retry lingering jobs.
     */
    private function retryLingeringJobs(): void
    {
        $database      = $this->getContainer()->get(Service::DB_ID);
        $jobsTableName = Job::init()->getTable()->getPrefixedName();

        $query = 'UPDATE ' . $jobsTableName . '
                SET status = %s
                WHERE status IN (%s,%s)
                AND tries <= %d
                AND TIMESTAMPDIFF(SECOND,lastrun,%s) >= %d';

        // The `update` method doesn't allow for such complex where clauses, so we can't use the QueryBuilder.
        $database->query(
            $query,
            [
                JobStatus::PENDING()->getValue(), // Set status to pending.
                JobStatus::WORKING()->getValue(), // If status = working or.
                JobStatus::FAILED()->getValue(), // Status = failed and.
                $this->getContainer()->get(Service::JOBS_CLEANUP_NUM_RETRIES), // Number of tries <= num_retries.
                Time::now('mysql', true),
                $this->getContainer()->get(Service::JOBS_CLEANUP_RETRY_AFTER), // And the correct number of seconds since lastrun has elapsed.
            ]
        );
    }

    /**
     * Delete completed jobs that have been in the system for over `\GroundLevel\Resque\Service::JOBS_CLEANUP_DELETE_COMPLETED_AFTER` seconds.
     */
    private function deleteCompletedOldJobs(): void
    {
        $database      = $this->getContainer()->get(Service::DB_ID);
        $jobsTableName = Job::init()->getTable()->getPrefixedName();

        // Delete completed jobs that have been in the system for over a day?
        $query = 'DELETE FROM ' . $jobsTableName . '
                WHERE status = %s
                AND TIMESTAMPDIFF(SECOND,lastrun,%s) >= %d';

        // The `delete` method doesn't allow for such complex where clauses, so we can't use the QueryBuilder.
        $database->query(
            $query, // Delete jobs.
            [
                JobStatus::COMPLETE()->getValue(), // Which have a status = complete.
                Time::now('mysql', true),
                $this->getContainer()->get(Service::JOBS_CLEANUP_DELETE_COMPLETED_AFTER), // And the correct number of seconds since lastrun has elapsed.
            ]
        );
    }

    /**
     * Delete jobs that have been retried and are still in a working state.
     */
    private function deleteRetriedButStillOnWorkingJobs(): void
    {
        $database      = $this->getContainer()->get(Service::DB_ID);
        $jobsTableName = Job::init()->getTable()->getPrefixedName();

        $query = 'DELETE FROM ' . $jobsTableName . '
            WHERE tries > %d
            AND TIMESTAMPDIFF(SECOND,lastrun,%s) >= %d';

        // The `delete` method doesn't allow for such complex where clauses, so we can't use the QueryBuilder.
        $database->query(
            $query, // Delete jobs.
            [
                $this->getContainer()->get(Service::JOBS_CLEANUP_NUM_RETRIES), // Which have only been 'n' retries.
                Time::now('mysql', true),
                $this->getContainer()->get(Service::JOBS_CLEANUP_DELETE_FAILED_AFTER), // And the correct number of seconds since lastrun has elapsed.
            ]
        );
    }
}
