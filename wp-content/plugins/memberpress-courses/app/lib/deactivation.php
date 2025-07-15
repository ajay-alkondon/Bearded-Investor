<?php
namespace memberpress\courses\lib;
use memberpress\courses\helpers as helpers;

if(!defined('ABSPATH')) { die('You are not allowed to call this page directly.'); }

global $wp_rewrite;
$wp_rewrite->add_permastruct( helpers\Lessons::get_permalink_base(), '' );
flush_rewrite_rules();
