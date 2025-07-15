<?php
namespace memberpress\courses\lib\Drip;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

/**
 * Class ItemInfoProviderInterface
 *
 */
interface ItemInfoProviderInterface {
  public function get_info($course, $current_post, $lesson);
}