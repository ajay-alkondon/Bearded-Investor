<?php

namespace memberpress\courses\controllers\admin;

if (!defined('ABSPATH')) {
    die('You are not allowed to call this page directly.');
}

use memberpress\courses as base;
use memberpress\courses\lib as lib;
use memberpress\courses\helpers as helpers;

class Addons extends lib\BaseCtrl {
    public function load_hooks()
    {
        add_action('admin_menu', [$this, 'admin_menu'], 89);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_action('wp_ajax_mpcs_addons_action', [$this, 'ajax_addons_action']);
        add_action('admin_notices', array($this, 'activated_admin_notice'));
    }

    public function activated_admin_notice()
    {
        if ( ! empty( $_GET['mpcs_gradebook_activated'] ) && 'true' === $_GET['mpcs_gradebook_activated'] && helpers\App::is_gradebook_addon_active() ) :
        ?>
          <div class="notice notice-success is-dismissible">
            <p><?php esc_html_e( 'MemberPress Course Gradebook has been activated successfully!', 'memberpress-courses' ) ?></p>
          </div>
        <?php endif;

        if ( ! empty( $_GET['mpcs_assignments_activated'] ) && 'true' === $_GET['mpcs_assignments_activated'] && helpers\App::is_assignments_addon_active()) :
        ?>
          <div class="notice notice-success is-dismissible">
            <p><?php esc_html_e( 'MemberPress Course Assignments has been activated successfully!', 'memberpress-courses' ) ?></p>
          </div>
        <?php endif;

        if ( ! empty( $_GET['mpcs_quizzes_activated'] ) && 'true' === $_GET['mpcs_quizzes_activated'] && helpers\App::is_quizzes_addon_active() ) :
        ?>
          <div class="notice notice-success is-dismissible">
            <p><?php esc_html_e( 'MemberPress Course Quizzes has been activated successfully!', 'memberpress-courses' ) ?></p>
          </div>
        <?php endif;
    }

    public function admin_menu()
    {
        if (isset($_GET['page']) && strpos($_GET['page'], base\PLUGIN_NAME . '-addon') !== false) {
            remove_all_actions( 'admin_notices' );
        }

        $capability = \MeprUtils::get_mepr_admin_capability();

        if(!helpers\App::is_gradebook_addon_active()){
            add_submenu_page(
              base\PLUGIN_NAME,
              __('Gradebook', 'memberpress-courses'),
              __('Gradebook', 'memberpress-courses'),
              $capability,
              base\PLUGIN_NAME .'-addon-gradebook',
              array($this,'route')
            );
        }

        if(!helpers\App::is_assignments_addon_active()){
            add_submenu_page(
              base\PLUGIN_NAME,
              __('Assignments', 'memberpress-courses'),
              __('Assignments', 'memberpress-courses'),
              $capability,
              base\PLUGIN_NAME .'-addon-assignments',
              array($this,'route')
            );
        }

        if(!helpers\App::is_quizzes_addon_active()){
            add_submenu_page(
              base\PLUGIN_NAME,
              __('Quizzes', 'memberpress-courses'),
              __('Quizzes', 'memberpress-courses'),
              $capability,
              base\PLUGIN_NAME .'-addon-quizzes',
              array($this,'route')
            );
        }
    }

    public function route()
    {
        $view_mapping = array(
            'memberpress-courses-addon-gradebook'   => '/admin/addons/gradebook',
            'memberpress-courses-addon-quizzes'     => '/admin/addons/quizzes',
            'memberpress-courses-addon-assignments' => '/admin/addons/assignments',
        );

        if( ! isset($_GET['page']) || ! isset($view_mapping[$_GET['page']]) ) {
            ?>
            <script>
              window.location.href="<?php echo Courses::fetch()->cpt_admin_url(); ?>";
            </script>
            <?php
            return;
        }

        $view = $view_mapping[sanitize_text_field($_GET['page'])];
        $plugins = get_plugins();

        \MeprView::render($view, get_defined_vars());
        \MeprView::render('/admin/addons/js-script');
    }

    public function enqueue_scripts($hook)
    {
        if (preg_match('/_page_memberpress-courses-addon/', $hook)) {
            wp_enqueue_style('mepr-sister-plugin-css', MEPR_CSS_URL . '/admin-sister-plugin.css', [], base\VERSION);
        }
    }

    /**
     * Handle actions for MemberPress Courses Addons
     * @todo
     *
     * @return void
     */
    public function ajax_addons_action()
    {
        if (empty($_POST['nonce']) || ! wp_verify_nonce($_POST['nonce'], 'mpcs_addons_action') || ! isset($_POST['type']) || ! isset($_POST['addon'])) {
            wp_send_json_success([
                'installed' => false,
                'activated' => false,
                'result'    => 'error',
                'message'   => esc_html__('Invalid request.', 'memberpress-courses'),
                'redirect'  => ''
            ]);
        }

        if (! current_user_can('activate_plugins')) {
            wp_send_json_success([
                'installed' => false,
                'activated' => false,
                'result'    => 'error',
                'message'   => esc_html__('Sorry, you don\'t have permission to do this.', 'memberpress-courses'),
                'redirect'  => ''
            ]);
        }

        $type       = sanitize_text_field($_POST['type']);
        $addon      = sanitize_text_field($_POST['addon']);
        $installed  = false;
        $activated  = false;
        $message    = esc_html__('Invalid request.', 'memberpress-courses');
        $result     = 'error';
        $addon_data = $this->get_addons_data();

        if( isset($addon_data[$addon]) && is_array($addon_data[$addon]) ) {

            $addon_slug  = $addon_data[$addon]['slug'];
            $addon_page  = $addon_data[$addon]['page'];
            $addon_key   = $addon_data[$addon]['key'];
            $redirect_to = $addon_data[$addon]['redirect_to'];

            switch ($type) {
                case 'install-activate': // Install and activate courses
                    $installed = $this->install_courses_addon($addon_key, $addon_page, $addon_slug, true);
                    $activated = $installed ? $installed : $activated;
                    $result = $installed ? 'success' : 'error';
                    $message = $installed ? esc_html__('Add-on has been installed and activated successfully. Enjoy!', 'memberpress-courses') : wp_kses_post( sprintf(
                        esc_html__('Add-on could not be installed. Please check your license settings, or %scontact%s MemberPress support for help.', 'memberpress-courses'),
                        '<a href="https://memberpress.com/support/">',
                        '</a>',
                    ));
                    break;
                case 'activate': // Just activate (already installed)
                    $activated = is_null(activate_plugin($addon_slug));
                    $result = 'success';
                    $message = esc_html__('Add-on has been activated successfully. Enjoy!', 'memberpress-courses');
                    break;
                default:
                    break;
            }

            $redirect = '';
            if ($activated) {
                $redirect = $redirect_to;
            }

            if ($activated) {
                delete_option('mepr_courses_flushed_rewrite_rules');
            }
        }

        wp_send_json_success([
            'installed' => $installed,
            'activated' => $activated,
            'result'    => $result,
            'message'   => $message,
            'redirect'  => $redirect
        ]);
    }

    /**
     * Install the MemberPress Courses addon
     *
     * @param string  $addon_key
     * @param string  $addon_page
     * @param string  $addon_main_file
     * @param boolean $activate Whether to activate after installing
     * @todo
     * @return boolean Whether the plugin was installed
     */
    public function install_courses_addon($addon_key, $addon_page, $addon_main_file, $activate = false)
    {
        $plugins = get_plugins();

        // If the add-on is already active, bailout.
        if (isset($plugins[$addon_main_file]) && is_plugin_active($addon_main_file)) {
            return true;
        }

        // Ensure the MeprOptions class is available
        if (!class_exists('MeprOptions')) {
            return false;
        }

        // Fetch the license key
        $mepr_options = \MeprOptions::fetch();
        $license = $mepr_options->mothership_license;

        if (empty($license)) {
            return false; // Exit if no license key is available
        }

        if (!function_exists('request_filesystem_credentials')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }

        try {

            $domain = urlencode(\MeprUtils::site_domain());
            $args = compact('domain');
            $slug = $addon_key;

            $addon = \MeprUpdateCtrl::send_mothership_request('/versions/info/' . $slug . "/{$license}", $args);

            // Set the current screen to avoid undefined notices
            set_current_screen("mp-courses_page_{$addon_key}");

            // Request filesystem credentials
            $plugin_url = esc_url_raw(
                add_query_arg(array(
                        'page' => $addon_page
                    ), admin_url('admin.php')
                )
            );
            $creds = request_filesystem_credentials($plugin_url, '', false, false, null);

            // Check for filesystem credentials and initialize WP Filesystem
            if (false === $creds || !WP_Filesystem($creds)) {
                throw new \Exception('Filesystem credentials are missing or invalid.');
            }

            // We do not need any extra credentials if we have gotten this far, so let's install the plugin
            require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

            // Do not allow WordPress to search/download translations, as this will break JS output
            remove_action('upgrader_process_complete', ['Language_Pack_Upgrader', 'async_upgrade'], 20);

            // Create the plugin upgrader with our custom skin
            $installer = new \Plugin_Upgrader(new \MeprAddonInstallSkin());

            $plugin = wp_unslash($addon['url']);
            $installer->install($plugin);

            // Flush the cache and return the newly installed plugin basename
            wp_cache_flush();

            if ($installer->plugin_info() && true === $activate) {
                activate_plugin($installer->plugin_info());
            }

            return $installer->plugin_info();

        } catch (\Exception $e) {
            // Log any errors
            \MeprUtils::error_log('install_courses_addon: ' . $e->getMessage());
        } finally {
            // Cleanup the temporary file
            if (isset($temp_file) && file_exists($temp_file)) {
                @unlink($temp_file);
            }
        }

        return false;
    }

    private function get_addons_data() {
        $addon_data = array(
            'gradebook'   => array(
                'key'         => 'memberpress-course-gradebook',
                'slug'        => 'memberpress-course-gradebook/main.php',
                'page'        => base\PLUGIN_NAME .'-addon-gradebook',
                'redirect_to' => add_query_arg([
                    'page' => 'memberpress-course-gradebook',
                    'mpcs_gradebook_activated' => 'true',
                ], esc_url(admin_url('admin.php')))
             ),
            'assignments'   => array(
                'key'  => 'memberpress-course-assignments',
                'slug' => 'memberpress-course-assignments/main.php',
                'page' => base\PLUGIN_NAME .'-addon-assignments',
                'redirect_to' => add_query_arg([
                    'post_type' => 'mpcs-assignment',
                    'mpcs_assignments_activated' => 'true',
                ], esc_url(admin_url('edit.php')))
             ),
            'quizzes'   => array(
                'key'  => 'memberpress-course-quizzes',
                'slug' => 'memberpress-course-quizzes/main.php',
                'page' => base\PLUGIN_NAME .'-addon-quizzes',
                'redirect_to' => add_query_arg([
                    'post_type' => 'mpcs-quiz',
                    'mpcs_quizzes_activated' => 'true',
                ], esc_url(admin_url('edit.php')))
             ),
        );

        return $addon_data;
    }
}
