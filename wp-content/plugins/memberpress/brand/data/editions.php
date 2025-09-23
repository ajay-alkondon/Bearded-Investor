<?php

/**
 * MemberPress Editions.
 *
 * @returns array<string, array{
 *     priority: int,
 *     name: string,
 *     addons: array<string>
 * }>
 */

return [
    'business'                => [
        'priority' => 10,
        'name'     => 'MemberPress Business',
        'addons'   => [
            'memberpress-courses',
            'memberpress-downloads',
        ],
    ],
    'memberpress-basic'        => [
        'priority' => 20,
        'name'     => 'MemberPress Basic',
        'addons'   => [
            'memberpress-courses',
            'memberpress-downloads',
        ],
    ],
    'memberpress-plus'         => [
        'priority' => 30,
        'name'     => 'MemberPress Plus',
        'addons'   => [
            'memberpress-courses',
            'memberpress-downloads',
            'memberpress-buddypress',
            'memberpress-developer-tools',
            'memberpress-gifting',
        ],
    ],
    'memberpress-plus-2'       => [
        'priority' => 40,
        'name'     => 'MemberPress Plus',
        'addons'   => [
            'memberpress-courses',
            'memberpress-downloads',
            'memberpress-buddypress',
            'memberpress-developer-tools',
        ],
    ],
    'developer'               => [
        'priority' => 50,
        'name'     => 'MemberPress Developer',
        'addons'   => [
            'memberpress-courses',
            'memberpress-downloads',
            'memberpress-buddypress',
            'memberpress-developer-tools',
            'memberpress-gifting',
            'memberpress-corporate',
        ],
    ],
    'memberpress-pro'          => [
        'priority' => 60,
        'name'     => 'MemberPress Pro',
        'addons'   => [
            'memberpress-courses',
            'memberpress-downloads',
            'memberpress-buddypress',
            'memberpress-developer-tools',
            'memberpress-gifting',
            'memberpress-corporate',
        ],
    ],
    'memberpress-pro-5'        => [
        'priority' => 70,
        'name'     => 'MemberPress Pro',
        'addons'   => [
            'memberpress-courses',
            'memberpress-downloads',
            'memberpress-buddypress',
            'memberpress-developer-tools',
            'memberpress-gifting',
            'memberpress-corporate',
        ],
    ],
    'memberpress-reseller-nhw' => [
        'priority' => 70,
        'name'     => 'MemberPress Reseller',
        'addons'   => [
            'memberpress-courses',
            'memberpress-downloads',
            'memberpress-buddypress',
            'memberpress-developer-tools',
            'memberpress-gifting',
            'memberpress-corporate',
        ],
    ],
    'memberpress-reseller-sng' => [
        'priority' => 70,
        'name'     => 'MemberPress Reseller',
        'addons'   => [
            'memberpress-courses',
            'memberpress-downloads',
            'memberpress-buddypress',
            'memberpress-developer-tools',
            'memberpress-gifting',
            'memberpress-corporate',
        ],
    ],
    'memberpress-oem'          => [
        'priority' => 70,
        'name'     => 'MemberPress OEM',
        'addons'   => [
            'memberpress-courses',
            'memberpress-downloads',
            'memberpress-buddypress',
            'memberpress-developer-tools',
            'memberpress-gifting',
            'memberpress-corporate',
        ],
    ],
    'memberpress-elite'        => [
        'priority' => 80,
        'name'     => 'MemberPress Elite',
        'addons'   => [
            'memberpress-courses',
            'memberpress-downloads',
            'memberpress-buddypress',
            'memberpress-developer-tools',
            'memberpress-gifting',
            'memberpress-corporate',
            'memberpress-coachkit',
        ],
    ],
];
