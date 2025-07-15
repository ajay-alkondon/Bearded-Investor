<?php
namespace memberpress\courses\lib\Drip;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

/**
 * Class ItemInfoProviderFactory
 *
 */
class ItemInfoProviderFactory {
  public static function create($drip_type) {
    $drip_type = strtolower($drip_type);
    switch ($drip_type) {
      case 'item':
        return new ItemDripInfoProvider();
      case 'section':
        return new SectionDripInfoProvider();
      default:
        throw new \InvalidArgumentException(__('Invalid drip type.', 'memberpress-courses'));
    }
  }
}
