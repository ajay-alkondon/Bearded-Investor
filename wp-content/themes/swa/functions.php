<?php 

add_action( 'wp_enqueue_scripts', 'salient_child_enqueue_styles', 100);

function salient_child_enqueue_styles() {
		
		$nectar_theme_version = nectar_get_theme_version();
		wp_enqueue_style( 'salient-child-style', get_stylesheet_directory_uri() . '/style.css', '', $nectar_theme_version );
		
    if ( is_rtl() ) {
   		wp_enqueue_style(  'salient-rtl',  get_template_directory_uri(). '/rtl.css', array(), '1', 'screen' );
		}
}

/**
 * Add a dynamic user account button to the Salient header button area.
 * This method hooks into the theme's dedicated button hook for proper placement and alignment.
 */
function swa_add_memberpress_user_button_to_header_buttons() {
    
    // Abort if MemberPress is not active to prevent fatal errors.
    if ( ! class_exists( 'MeprAccountCtrl' ) ) {
        return;
    }
    
    // Get MemberPress account page URL.
    $account_page_url = get_permalink( MeprOptions::fetch()->account_page_id );

    if ( is_user_logged_in() ) {
        // Logged-in user icon and dropdown.
        ?>
        <li class="menu-item menu-item-has-children swa-user-account-button">
            <a href="<?php echo esc_url( $account_page_url ); ?>">
                <i class="icon-salient-m-user"></i>
                <span class="sf-sub-indicator"><i class="icon-angle-down"></i></span>
            </a>
            <ul class="sub-menu">
                <li class="menu-item"><a href="<?php echo esc_url( $account_page_url ); ?>">My Profile</a></li>
                <li class="menu-item"><a href="<?php echo esc_url( $account_page_url . '?action=payments' ); ?>">Payments</a></li>
                <li class="menu-item"><a href="<?php echo esc_url( $account_page_url . '?action=subscriptions' ); ?>">Subscriptions</a></li>
                <li class="menu-item"><a href="<?php echo esc_url( get_permalink( get_page_by_path( 'courses' ) ) ); ?>">Courses</a></li>
                <li class="menu-item"><a href="<?php echo esc_url( wp_logout_url( home_url() ) ); ?>">Logout</a></li>
            </ul>
        </li>
        <?php
    } else {
        // Logged-out user "Login" button.
        ?>
        <li class="swa-user-account-button menu-item">
            <a href="<?php echo esc_url( site_url( '/login/' ) ); ?>">Login</a>
        </li>
        <?php
    }
}
// This hook correctly places the button in the header's button area.
add_action( 'nectar_hook_before_button_menu_items', 'swa_add_memberpress_user_button_to_header_buttons' );


/**
 * Add the MemberPress user account links to the mobile off-canvas menu.
 */
function swa_add_memberpress_user_button_to_mobile_header() {

    // Abort if MemberPress is not active.
    if ( ! class_exists( 'MeprAccountCtrl' ) ) {
        return;
    }

    // Get MemberPress account page URL.
    $account_page_url = get_permalink( MeprOptions::fetch()->account_page_id );

    echo '<ul class="swa-mobile-user-account-items">';
    if ( is_user_logged_in() ) {
        $current_user = wp_get_current_user();
        ?>
        <li class="menu-item menu-item-has-children">
            <a href="<?php echo esc_url( $account_page_url ); ?>">
                <?php echo esc_html( $current_user->display_name ); ?>
            </a>
            <ul class="sub-menu">
                <li class="menu-item"><a href="<?php echo esc_url( $account_page_url ); ?>">My Profile</a></li>
                <li class="menu-item"><a href="<?php echo esc_url( $account_page_url . '?action=payments' ); ?>">Payments</a></li>
                <li class="menu-item"><a href="<?php echo esc_url( $account_page_url . '?action=subscriptions' ); ?>">Subscriptions</a></li>
                <li class="menu-item"><a href="<?php echo esc_url( get_permalink( get_page_by_path( 'courses' ) ) ); ?>">Courses</a></li>
                <li class="menu-item"><a href="<?php echo esc_url( wp_logout_url( home_url() ) ); ?>">Logout</a></li>
            </ul>
        </li>
        <?php
    } else {
        ?>
        <li class="menu-item">
            <a href="<?php echo esc_url( site_url( '/login/' ) ); ?>">
                Login
            </a>
        </li>
        <?php
    }
    echo '</ul>';
}
add_action( 'nectar_hook_ocm_bottom_meta', 'swa_add_memberpress_user_button_to_mobile_header' );

?>
