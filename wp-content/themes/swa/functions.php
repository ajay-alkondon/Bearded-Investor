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
 * Add a dynamic MemberPress user account button to the Salient header.
 * This single function adds the button to both desktop and mobile hooks.
 */
function swa_add_memberpress_user_button() {

    // Abort if MemberPress is not active to prevent fatal errors.
    if ( ! class_exists( 'MeprAccountCtrl' ) ) {
        return;
    }

    $account_page_url = get_permalink( MeprOptions::fetch()->account_page_id );
    $courses_page_url = get_permalink( get_page_by_path( 'courses' ) );

    // --- RENDER BUTTON LOGIC ---
    if ( is_user_logged_in() ) {
        // --- LOGGED-IN USER VIEW ---
        ?>
        <li class="menu-item menu-item-has-children swa-user-account-button">
            <a href="<?php echo esc_url( $account_page_url ); ?>">
                <i class="icon-salient-m-user"></i>
            </a>
            <ul class="sub-menu">
                <li class="menu-item"><a href="<?php echo esc_url( $account_page_url ); ?>">My Profile</a></li>
                <li class="menu-item"><a href="<?php echo esc_url( $account_page_url . '?action=payments' ); ?>">Payments</a></li>
                <li class="menu-item"><a href="<?php echo esc_url( $account_page_url . '?action=subscriptions' ); ?>">Subscriptions</a></li>
                <li class="menu-item swa-dark-mode-toggle-container">
                    <div class="swa-dark-mode-toggle">
                        <span>Light Mode</span>
                        <label class="switch"><input type="checkbox" id="swa-dark-mode-checkbox"><span class="slider"></span></label>
                    </div>
                </li>
                <li class="menu-item"><a href="<?php echo esc_url( wp_logout_url( home_url() ) ); ?>">Logout</a></li>
            </ul>
        </li>
        <?php
    } else {
        // --- LOGGED-OUT USER VIEW ---
        ?>
        <li class="swa-user-account-button menu-item">
            <a href="<?php echo esc_url( site_url( '/login/' ) ); ?>">Login</a>
        </li>
        <?php
    }
}
// Add the button to the desktop header's button area
add_action( 'nectar_hook_before_button_menu_items', 'swa_add_memberpress_user_button' );

/**
 * Add Google Ads Conversion Tracking script to the MemberPress Thank You page.
 */
function add_google_ads_conversion_tracking_for_mep($txn) {
    if( is_page ('thank-you-beard-baron') ) {
        // --- START: CONFIGURE YOUR TAG HERE ---

        //$conversion_id = 'AW-123456789'; // <-- REPLACE with your Conversion ID
        //$conversion_label = 'AbC-D_efG-h12i34j5k'; // <-- REPLACE with your Conversion Label
        //$currency = 'USD'; // <-- REPLACE with your store's currency code (e.g., 'EUR', 'GBP')

        // --- END: CONFIGURATION ---

        // Get dynamic data from the MemberPress transaction object
        //$transaction_id = $txn->trans_num;
        //$transaction_value = $txn->total;

        // Output the Google Ads event snippet
        ?>
            <!-- Google tag (gtag.js) event -->
            <script>
                gtag('event', 'conversion_event_subscribe_paid', {
                    // <event_parameters>
                });
            </script>
        <?php
    }
}
/**
 * Add Google Ads Conversion Tracking script to the MemberPress Thank You page.
*/
add_action('wp_head', 'add_google_ads_conversion_tracking_for_mep');


/**
 * Add the JavaScript for the dark mode toggle functionality.
 */
function swa_add_dark_mode_script() {
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        
        // Only run this script on the stock analysis page
        const analyzerWrapper = document.querySelector('.jtw-analyzer-wrapper');
        if (!analyzerWrapper) {
            return;
        }

        const themeToggles = document.querySelectorAll('input[id^="swa-dark-mode-checkbox"]');
        const body = document.body;
        const lightMode = 'light-mode';
        const darkMode = 'dark-mode';

        // Function to apply the theme and sync toggles
        function applyTheme(theme, syncToggles) {
            body.classList.remove(lightMode, darkMode);
            body.classList.add(theme);
            if (syncToggles) {
                // If the theme is light mode, the toggle should be checked.
                const isChecked = (theme === lightMode);
                themeToggles.forEach(toggle => {
                    if (toggle) toggle.checked = isChecked;
                });
            }
        }

        // Function to handle toggle click
        function handleToggle() {
            const isChecked = this.checked;
            // If checked, switch to light mode. If unchecked, switch to dark mode.
            const newTheme = isChecked ? lightMode : darkMode;
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme, true); 
        }

        // Apply saved theme on page load, defaulting to dark mode for the analysis page.
        const savedTheme = localStorage.getItem('theme') || darkMode;
        applyTheme(savedTheme, true);

        // Add event listeners to all found toggles
        themeToggles.forEach(toggle => {
            if (toggle) {
                toggle.addEventListener('change', handleToggle);
            }
        });

    });
    </script>
    <?php
}
add_action( 'wp_footer', 'swa_add_dark_mode_script' );

    function mepr_remove_redirect_params( $redirect_url ) {
        // Remove all query parameters from the URL
        $redirect_url = strtok( $redirect_url, '?' );
        return $redirect_url;
    }
    add_filter( 'mepr-unauthorized-redirect-url', 'mepr_remove_redirect_params' );