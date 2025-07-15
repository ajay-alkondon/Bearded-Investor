<?php
namespace memberpress\courses\lib\Drip;

if(!defined('ABSPATH')) {die('You are not allowed to call this page directly.');}

/**
 * Interface DateCalculatorInterface
 *
 */
interface DateCalculatorInterface {
   public function calculate();
}