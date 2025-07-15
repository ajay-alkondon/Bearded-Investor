Ground Level Resque
====================

The Ground Level Resque package is a set service module that provides a model
and underlying database table for storing arbitrary jobs in an application,
and manage a job queue.

---

## Installation

```bash
composer config repositories.caseproof composer https://pkgs.cspf.co
composer require caseproof/ground-level-resque
```


## Usage

### Registering the Service Provider

```php
<?php

use GroundLevel\Container\Container;
use GroundLevel\Resque\Service as ResqueService;

$container = new Container();
$container->addService(
    ResqueService::class,
    static function () use ($container): ResqueService {
        return new ResqueService($container);
    },
    true
);
```

### Parameter Customizations.

The following parameters can be customized, by defining them on the Resque service container,
either via the application's dependency injection container method `addParameter()` or, better,
when bootstrapping the application via the configuration parameters.

- `GroundLevel\Resque\Service::DB_PREFIX`: the Resque's tables prefix, defaults to the string `resque_`;
- `GroundLevel\Resque\Service::PREFIX`: the Resque's service prefix, used to prefix hooks etc., defaults to the string `resque_`;
- `GroundLevel\Resque\Service::JOBS_CLEANUP_NUM_RETRIES`: the number of retries before failing a transaction, defaults to `5`;
- `GroundLevel\Resque\Service::JOBS_CLEANUP_RETRY_AFTER`: the number seconds a job can be left in zombie state, defaults to `3600` seconds, one hour;
- `GroundLevel\Resque\Service::JOBS_CLEANUP_DELETE_COMPLETED_AFTER`: the number seconds after which a completed job is removed from the jobs table, defaults to `172800` seconds (two days);
- `GroundLevel\Resque\Service::JOBS_CLEANUP_DELETE_FAILED_AFTER`: the number seconds after which a failed job is removed from the jobs table, defaults to `2592000` seconds (thirty days);
- `GroundLevel\Resque\Service::JOBS_CLEANUP_INTERVAL`: the clean-up frequency, defaults to `3600` seconds (one hour);
- `GroundLevel\Resque\Service::JOBS_RETRY_AFTER`: the number a seconds a job can be retried after a failure, defaults to `1800` seconds (thirty minutes),
- `GroundLevel\Resque\Service::JOBS_INTERVAL`: the worker run frequency, defaults to `60` seconds (one minute).

### Creating Jobs

First of all you need to define a class that extends the Resque Job class,
and that implements the protected method `perform()`. This method is, in fact, 
the one that is called when the job runs.

```php
<?php

use GroundLevel\Resque\Models\Job;

class SimpleJob extends Job {

    protected function perform() 
    {
        // Maybe save something in the args (payload).
        $args = json_decode($this->getAttribute('args'), true);
        $args['someProp'] = 'Hey Dude!';
        $this->setAttribute('args', json_encode($args));
        $this->save();
        // Or retrieve something from the job args (payload).
        $interestingProp = $args['interestingProp'] ?? '';
        // Do something!
    }
}
```

Additionally you can define the `onRetry`, `onFail` and `onComplete` methods that will
be executed respectively when the job is retried, failed or completed. 
They take no input parameters, and return void.

```php
<?php

use GroundLevel\Resque\Models\Job;

class SimpleJob extends Job {

    protected function perform() 
    {
        // Maybe save something in the args (payload).
        $args = json_decode($this->getAttribute('args'), true);
        $args['someProp'] = 'Hey Dude!';
        $this->setAttribute('args', json_encode($args));
        $this->save();
        // Or retrieve something from the job args (payload).
        $interestingProp = $args['interestingProp'] ?? '';
        // Do something!
    }

    public function onComplete() 
    {
        // Do something when the job is completed.
    }

    public function onFail() 
    {
        // Do something when the job fails.
    }

    public function onRetry() 
    {
        // Do something when the job is retried.
    }
}
```

Then instantiate the `SimpleJob` and enqueue it, e.g. when a WordPress user is updated.

```php
<?php

use GroundLevel\Support\Time;

add_action(
    'wp_user_updated',
    function (int $userId, array $userData) {
        $job = new SimpleJob([
            'args' => json_encode($userData),
        ])->save();
        $job->enqueue();

        // Or.
        $job = new SimpleJob();
        $job->enqueue( // The enqueue method takes care of the `args` encoding and saving.
            $userData
        );

        // Or enqueue a job to be worked in 10 minutes.
        $job = new SimpleJob();
        $job->enqueueIn(
            10,
            Time:UNIT_MINUTES,
            'args' => $userData
        );
    }
    10,
    2
);
```

### Dequeue a Job

```php
<?php

use GroundLevel\Resque\Service as ResqueService;

// Dequeuing a job with id 12.
$job = new SimpleJob(12);
$job->dequeue();

// Or assuming the app container where you registered the Resque service is stored in `$container`.
$worker = $container->get(Resque::class)->getWorker();
$worker->dequeue(12);
```
