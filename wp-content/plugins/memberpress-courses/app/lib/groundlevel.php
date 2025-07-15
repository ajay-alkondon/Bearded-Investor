<?php
namespace memberpress\courses\lib;
use memberpress\courses as base;
use memberpress\courses\GroundLevel\Container\Container;
use memberpress\courses\GroundLevel\Resque\Service as ResqueService;
use memberpress\courses\GroundLevel\Database\Service as DatabaseService;


$container = new Container();
$container->addParameter(DatabaseService::PREFIX, base\SLUG_KEY . '_grdlvl_');
// $container->addParameter(EventsService::PREFIX, 'grdlvl_sample');
$container->addParameter(ResqueService::PREFIX, base\SLUG_KEY . '_');
$container->addParameter(ResqueService::DB_PREFIX, base\SLUG_KEY . '_');

$container->addService(
  DatabaseService::DB_CONNECTION,
  static function (): \wpdb {
      global $wpdb;
      return $wpdb;
  }
);

$container->addService(
  ResqueService::class,
  static function () use ($container): ResqueService {
    return new ResqueService($container);
  },
  true
);
