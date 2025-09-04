<?php
/**
 * The public-facing functionality of the plugin.
 * This class handles the shortcode and AJAX request for the analyzer tool.
 * It now acts as a presentation layer, offloading all calculations to a Python Cloud Function.
 */
class Journey_To_Wealth_Public {

    private $plugin_name;
    private $version;

    public function __construct( $plugin_name, $version ) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        // The Alpha Vantage client is still needed for beta calculation and peer data fetching.
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/api/class-alpha-vantage-client.php';

        // Register AJAX endpoints
        add_action('wp_ajax_jtw_fetch_section_data', array($this, 'ajax_fetch_section_data'));
        add_action('wp_ajax_nopriv_jtw_fetch_section_data', array($this, 'ajax_fetch_section_data'));
        add_action('wp_ajax_jtw_symbol_search', array($this, 'ajax_symbol_search'));
        add_action('wp_ajax_jtw_fetch_peer_data', array($this, 'ajax_fetch_peer_data'));
        add_action('wp_ajax_nopriv_jtw_fetch_peer_data', array($this, 'ajax_fetch_peer_data'));
        add_action('wp_ajax_jtw_recalculate_valuation', array($this, 'ajax_recalculate_valuation'));
        add_action('wp_ajax_nopriv_jtw_recalculate_valuation', array($this, 'ajax_recalculate_valuation'));
        add_action('wp_ajax_jtw_fetch_transcript', array($this, 'ajax_fetch_transcript'));
        add_action('wp_ajax_nopriv_jtw_fetch_transcript', array($this, 'ajax_fetch_transcript'));
    }

    public function enqueue_styles() {
        $style_path = plugin_dir_path( __FILE__ ) . 'assets/css/public-styles.css';
        $style_version = file_exists($style_path) ? $this->version . '.' . filemtime( $style_path ) : $this->version;
        wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'assets/css/public-styles.css', array(), $style_version, 'all' );
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script( 'chartjs', 'https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.min.js', array(), '4.5.0', true );
        wp_enqueue_script( 'chartjs-adapter-date-fns', 'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js', array('chartjs'), '1.1.0', true );
        wp_enqueue_script( 'chartjs-plugin-datalabels', 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.1.0/dist/chartjs-plugin-datalabels.min.js', array('chartjs'), '2.1.0', true );
        
        $script_path = plugin_dir_path( __FILE__ ) . 'assets/js/public-scripts.js';
        $script_version = file_exists($script_path) ? $this->version . '.' . filemtime( $script_path ) : $this->version;
        wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'assets/js/public-scripts.js', array( 'jquery', 'chartjs', 'chartjs-adapter-date-fns', 'chartjs-plugin-datalabels' ), $script_version, true );
        
        $analysis_page_slug = get_option('jtw_analysis_page_slug', 'stock-valuation-analysis');
        $analysis_page_url = site_url( '/' . $analysis_page_slug . '/' );

        wp_localize_script( $this->plugin_name, 'jtw_public_params', array(
                'ajax_url' => admin_url( 'admin-ajax.php' ),
                'section_nonce' => wp_create_nonce('jtw_fetch_section_nonce'),
                'peer_nonce' => wp_create_nonce('jtw_fetch_peer_nonce'),
                'recalculate_nonce' => wp_create_nonce('jtw_recalculate_valuation_nonce'),
                'transcript_nonce' => wp_create_nonce('jtw_fetch_transcript_nonce'),
                'symbol_search_nonce' => wp_create_nonce('jtw_symbol_search_nonce_action'),
                'analysis_page_url' => $analysis_page_url,
                'text_loading' => __('Fetching data...', 'journey-to-wealth'),
                'text_error' => __('An error occurred. Please check the ticker and try again.', 'journey-to-wealth'),
            )
        );
    }

    public function render_header_lookup_shortcode( $atts ) {
        if (!is_user_logged_in()) return '';
        ob_start();
        ?>
        <div class="jtw-header-lookup-form jtw-header-lookup-container">
            <div class="jtw-input-group-seamless">
                <input type="text" class="jtw-header-ticker-input" placeholder="Search Ticker...">
                <button type="button" class="jtw-header-fetch-button" title="Analyze Stock">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
            </div>
            <div class="jtw-header-search-results"></div>
        </div>
        <?php
        return ob_get_clean();
    }

    public function render_mobile_header_lookup_shortcode( $atts ) {
        if (!is_user_logged_in()) return '';
        // This mobile version can simply call the main header lookup's rendering logic.
        // The difference in appearance can be handled via CSS.
        ob_start();
        ?>
        <div class="jtw-mobile-header-lookup-container">
            <?php echo $this->render_header_lookup_shortcode( $atts ); ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    public function render_analyzer_layout_shortcode( $atts ) {
        if (!is_user_logged_in()) {
            return '<p>' . esc_html__('You must be logged in to use the stock analyzer.', 'journey-to-wealth') . '</p>';
        }

        ob_start();
        if ( !isset($_GET['jtw_selected_symbol']) || empty($_GET['jtw_selected_symbol']) ) {
            echo '<p class="jtw-initial-prompt">' . esc_html__('Please use the search bar in the header to analyze a stock.', 'journey-to-wealth') . '</p>';
        } else {
            ?>
            <div class="jtw-analyzer-wrapper">
                <div class="jtw-content-container">
                    <nav class="jtw-anchor-nav">
                        <ul>
                            <li class="jtw-nav-group jtw-nav-group-single"><a href="#section-overview" class="jtw-anchor-link jtw-nav-major-section active"><?php esc_html_e('Company Overview', 'journey-to-wealth'); ?></a></li>
                            <li class="jtw-nav-group"><span class="jtw-nav-major-section"><?php esc_html_e('Valuation', 'journey-to-wealth'); ?></span><div class="jtw-nav-minor-group"><a href="#section-intrinsic-valuation" class="jtw-anchor-link jtw-nav-minor-section"><?php esc_html_e('Value Projections', 'journey-to-wealth'); ?></a><a href="#section-key-metrics-ratios" class="jtw-anchor-link jtw-nav-minor-section"><?php esc_html_e('Comparative Company Analysis', 'journey-to-wealth'); ?></a></div></li>
                            <li class="jtw-nav-group"><span class="jtw-nav-major-section"><?php esc_html_e('Past Performance', 'journey-to-wealth'); ?></span><div class="jtw-nav-minor-group"><a href="#section-historical-data" class="jtw-anchor-link jtw-nav-minor-section"><?php esc_html_e('Shareholder Metrics', 'journey-to-wealth'); ?></a><a href="#section-past-performance" class="jtw-anchor-link jtw-nav-minor-section"><?php esc_html_e('Visual Data Trends', 'journey-to-wealth'); ?></a></div></li>
                        </ul>
                    </nav>
                    <div class="jtw-mobile-dot-nav"></div>
                    <main class="jtw-content-main">
                        <div id="jtw-currency-notice-placeholder"></div>
                        <div class="jtw-major-content-group"><h2><?php esc_html_e('Company Overview', 'journey-to-wealth'); ?></h2><div id="section-overview" class="jtw-content-section-placeholder" data-section="overview"></div></div>
                        <div class="jtw-major-content-group"><h2><?php esc_html_e('Valuation', 'journey-to-wealth'); ?></h2><div id="section-intrinsic-valuation" class="jtw-content-section-placeholder" data-section="intrinsic-valuation"></div><div id="section-key-metrics-ratios" class="jtw-content-section-placeholder" data-section="key-metrics-ratios"></div></div>
                        <div class="jtw-major-content-group"><h2><?php esc_html_e('Past Performance', 'journey-to-wealth'); ?></h2><div id="section-historical-data" class="jtw-content-section-placeholder" data-section="historical-data"></div><div id="section-past-performance" class="jtw-content-section-placeholder" data-section="past-performance"></div></div>
                    </main>
                </div>
            </div>
            <?php
        }
        return ob_get_clean();
    }

    public function ajax_symbol_search() {
        check_ajax_referer('jtw_symbol_search_nonce_action', 'jtw_symbol_search_nonce');
        $keywords = isset($_POST['keywords']) ? sanitize_text_field($_POST['keywords']) : '';
        if (empty($keywords)) { wp_send_json_error(['matches' => []]); return; }
        $api_key = get_option('jtw_av_api_key');
        if (empty($api_key)) { wp_send_json_error(['message' => 'API Key not configured.']); return; }
        $av_client = new Alpha_Vantage_Client($api_key);
        $results = $av_client->search_symbols($keywords);
        if (is_wp_error($results) || empty($results)) { wp_send_json_success(['matches' => []]); return; }
        $matches = array_map(function($item) {
            return [ 'ticker' => $item['1. symbol'], 'name' => $item['2. name'], 'exchange' => $item['4. region'], 'locale' => strtolower(substr($item['8. currency'], 0, 2)), 'icon_url' => '', ];
        }, $results);
        wp_send_json_success(['matches' => array_slice($matches, 0, 3)]);
    }
    
    public function ajax_fetch_section_data() {
        check_ajax_referer('jtw_fetch_section_nonce', 'nonce');
        $ticker = isset($_POST['ticker']) ? sanitize_text_field(strtoupper($_POST['ticker'])) : '';
        $section = isset($_POST['section']) ? sanitize_key($_POST['section']) : '';

        if (empty($ticker) || empty($section)) { wp_send_json_error(['message' => 'Missing parameters.']); return; }

        $python_data = $this->call_python_calculation_engine($ticker);
        if (is_wp_error($python_data)) {
            wp_send_json_error(['message' => $python_data->get_error_message(), 'details' => $python_data->get_error_data()]);
            return;
        }
        
        $html = '';
        $json_response = [];
        $calculated_data = $python_data['calculated_data'];
        $raw_data = $python_data['raw_data_subset'];

        switch ($section) {
            case 'overview':
                $this->store_and_map_discovered_company($ticker, $raw_data['overview']['Industry'], $raw_data['overview']['Sector']);
                $html = $this->build_overview_section_html($raw_data['overview'], $raw_data['quote']);
                break;
            case 'historical-data':
                $html = $this->build_historical_data_section_html($calculated_data['historical_table_data']);
                break;
            case 'past-performance':
                $html = $this->build_past_performance_section_html($calculated_data['historical_chart_data']);
                break;
            case 'key-metrics-ratios':
                $html = $this->build_key_metrics_ratios_section_html($ticker, $calculated_data['key_metrics']);
                break;
            case 'intrinsic-valuation':
                $latest_price = (float)($raw_data['quote']['05. price'] ?? 0);
                $valuation_models = $calculated_data['valuations'] ?? [];
                $valuation_summary = [ 'current_price' => $latest_price, 'fair_value' => 0, 'percentage_diff' => 0 ];
                $valid_models = [];
                foreach ($valuation_models as $result) { if (isset($result['intrinsic_value_per_share']) && is_numeric($result['intrinsic_value_per_share'])) { $valid_models[] = $result['intrinsic_value_per_share']; } }
                if (!empty($valid_models)) {
                    $valuation_summary['fair_value'] = array_sum($valid_models) / count($valid_models);
                    if ($latest_price > 0 && $valuation_summary['fair_value'] > 0) { $valuation_summary['percentage_diff'] = (($latest_price - $valuation_summary['fair_value']) / $valuation_summary['fair_value']) * 100; }
                }
                $dcf_result_for_ui = $calculated_data['ui_valuation_breakdown'] ?? null;

                if (isset($dcf_result_for_ui['error'])) {
                    wp_send_json_error(['message' => 'Valuation Error: ' . esc_html($dcf_result_for_ui['error']) . ' This can happen if a company has limited historical financial data.']);
                    return;
                }

                if (is_null($dcf_result_for_ui)) { wp_send_json_error(['message' => 'Valuation breakdown data not received from the calculation engine.']); return; }
                $html = $this->build_intrinsic_valuation_section_html($valuation_models, $valuation_summary, $raw_data['overview'], $dcf_result_for_ui);
                break;
        }

        if (empty($html)) {
            wp_send_json_error(['message' => 'Could not generate content for this section.']);
        } else {
            $json_response['html'] = $html;
            wp_send_json_success($json_response);
        }
    }

    public function ajax_fetch_peer_data() {
        check_ajax_referer('jtw_fetch_peer_nonce', 'nonce');
        $primary_ticker = isset($_POST['ticker']) ? sanitize_text_field(strtoupper($_POST['ticker'])) : '';
        $manual_peers = isset($_POST['peers']) && is_array($_POST['peers']) ? array_map('sanitize_text_field', $_POST['peers']) : [];

        if (empty($primary_ticker)) { wp_send_json_error(['message' => 'Missing primary ticker.']); return; }
    
        $top_peers = [];
        if (!empty($manual_peers)) {
            $top_peers = array_slice($manual_peers, 0, 2);
        } else {
            global $wpdb;
            $mapping_table = $wpdb->prefix . 'jtw_company_mappings';
            $damodaran_ids = $wpdb->get_col($wpdb->prepare("SELECT damodaran_industry_id FROM $mapping_table WHERE ticker = %s", $primary_ticker));
            if (empty($damodaran_ids)) { wp_send_json_error(['message' => 'No industry mapping found. Peer comparison is unavailable.']); return; }
            $id_placeholders = implode(',', array_fill(0, count($damodaran_ids), '%d'));
            $query = $wpdb->prepare("SELECT DISTINCT ticker FROM $mapping_table WHERE damodaran_industry_id IN ($id_placeholders) AND ticker != %s", array_merge($damodaran_ids, [$primary_ticker]));
            $all_peers = $wpdb->get_col($query);
            if (empty($all_peers)) { wp_send_json_error(['message' => 'No direct peers found based on industry mapping.']); return; }
            
            $av_client = new Alpha_Vantage_Client(get_option('jtw_av_api_key'));
            $peers_with_details = [];
            foreach ($all_peers as $peer_ticker) {
                $overview = $av_client->get_company_overview($peer_ticker);
                if (!is_wp_error($overview) && isset($overview['MarketCapitalization'], $overview['Name']) && is_numeric($overview['MarketCapitalization'])) {
                    $peers_with_details[] = [ 'ticker' => $peer_ticker, 'name' => $overview['Name'], 'market_cap' => (float)$overview['MarketCapitalization'] ];
                }
            }
            if (empty($peers_with_details)) { wp_send_json_error(['message' => 'No suitable peers found after filtering.']); return; }
            usort($peers_with_details, function($a, $b) { return $b['market_cap'] <=> $a['market_cap']; });
            $top_peers = array_slice(array_column($peers_with_details, 'ticker'), 0, 2);
        }
    
        if (empty($top_peers)) { wp_send_json_error(['message' => 'Could not find any valid peers to compare.']); return; }
    
        $peer_metrics_data = [];
        foreach ($top_peers as $peer_ticker) {
            $python_data = $this->call_python_calculation_engine($peer_ticker);
            if (!is_wp_error($python_data)) {
                $peer_metrics_data[$peer_ticker] = $python_data['calculated_data']['key_metrics'];
            }
        }
    
        if (empty($peer_metrics_data)) { wp_send_json_error(['message' => 'Failed to fetch detailed metrics for the selected peers.']); return; }
    
        wp_send_json_success($peer_metrics_data);
    }

    public function ajax_recalculate_valuation() {
        check_ajax_referer('jtw_recalculate_valuation_nonce', 'nonce');
        $ticker = isset($_POST['ticker']) ? sanitize_text_field(strtoupper($_POST['ticker'])) : '';
        $assumptions = isset($_POST['assumptions']) ? $_POST['assumptions'] : [];
        if (empty($ticker)) { wp_send_json_error(['message' => 'Missing Ticker.']); return; }
        
        $python_data = $this->call_python_calculation_engine($ticker, $assumptions);
        if (is_wp_error($python_data)) {
            wp_send_json_error(['message' => $python_data->get_error_message()]);
            return;
        }
        
        wp_send_json_success($python_data['calculated_data']['valuations']);
    }

    private function force_utf8_encode($array) {
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $array[$key] = $this->force_utf8_encode($value);
            } elseif (is_string($value)) {
                // mb_convert_encoding is more reliable than utf8_encode
                $array[$key] = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
            }
        }
        return $array;
    }

// Replace the existing call_python_calculation_engine function with this updated version.

private function call_python_calculation_engine($ticker, $custom_assumptions = []) {
    $cloud_function_url = get_option('jtw_cloud_function_url');
    if (empty($cloud_function_url)) {
        return new WP_Error('config_error', 'The Cloud Function URL is not configured.');
    }

    // It's good practice to have the Alpha_Vantage_Client instantiated here
    // as it's needed for the data preparation before the call.
    require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/api/class-alpha-vantage-client.php';
    $av_client = new Alpha_Vantage_Client(get_option('jtw_av_api_key'));

    // Fetch necessary data for beta calculation
    $overview = $av_client->get_company_overview($ticker);
    $balance_sheet = $av_client->get_balance_sheet($ticker);

    if (is_wp_error($overview) || is_wp_error($balance_sheet)) {
        // You can combine the error messages for better debugging
        $error_message = 'Could not fetch prerequisite data. ';
        if (is_wp_error($overview)) $error_message .= 'Overview Error: ' . $overview->get_error_message() . ' ';
        if (is_wp_error($balance_sheet)) $error_message .= 'Balance Sheet Error: ' . $balance_sheet->get_error_message();
        return new WP_Error('api_error', $error_message);
    }

    $tax_rate_decimal = (float) get_option('jtw_tax_rate_setting', '21.0') / 100;
    $market_cap = (float)($overview['MarketCapitalization'] ?? 0);

    // Calculate beta details to include in the payload
    $beta_details = $this->calculate_levered_beta($ticker, $balance_sheet, $market_cap, $tax_rate_decimal);

    // Construct the payload array
    $payload = [
        'ticker'             => $ticker,
        'erp'                => (float) get_option('jtw_erp_setting', '5.0') / 100,
        'tax_rate'           => $tax_rate_decimal,
        'beta_details'       => $beta_details,
        'custom_assumptions' => !empty($custom_assumptions) ? $custom_assumptions : new stdClass(),
    ];

    // Sanitize and encode the payload to JSON
    // The force_utf8_encode function you have is important, so we keep it.
    $sanitized_payload = $this->force_utf8_encode($payload);
    $json_payload = json_encode($sanitized_payload);

    // CRITICAL: Check if json_encode failed.
    if (json_last_error() !== JSON_ERROR_NONE) {
        return new WP_Error('json_encode_error', 'Failed to encode payload for Cloud Function.', ['error_message' => json_last_error_msg(), 'payload_data' => $sanitized_payload]);
    }

    // Make the POST request to the Python Cloud Function
    $response = wp_remote_post($cloud_function_url, [
        'method'      => 'POST',
        'headers'     => [
            'Content-Type' => 'application/json; charset=utf-8'
        ],
        'body'        => $json_payload, // The body must be the JSON string
        'timeout'     => 45,
        'data_format' => 'body', // This tells WordPress not to alter the body
    ]);

    // Handle the response from the Cloud Function
    if (is_wp_error($response)) {
        return new WP_Error('http_error', 'Error calling Cloud Function: ' . $response->get_error_message());
    }

    $body = wp_remote_retrieve_body($response);
    $response_code = wp_remote_retrieve_response_code($response);

    // Decode the JSON response from Python
    $python_data = json_decode($body, true);

    if ($response_code >= 400 || json_last_error() !== JSON_ERROR_NONE || !isset($python_data['calculated_data'])) {
        return new WP_Error('response_error', 'Invalid response from Cloud Function.', [
            'status_code' => $response_code,
            'response_body' => $body
        ]);
    }

    return $python_data;
}

    private function format_large_number($number, $prefix = '$', $decimals = 1) {
        if (!is_numeric($number) || $number == 0) { return $prefix === '$' ? '$0' : '0'; }
        $abs_number = abs($number); $formatted_number = '';
        if ($abs_number >= 1.0e+12) { $formatted_number = round($number / 1.0e+12, $decimals) . 'T'; } 
        elseif ($abs_number >= 1.0e+9) { $formatted_number = round($number / 1.0e+9, $decimals) . 'B'; } 
        elseif ($abs_number >= 1.0e+6) { $formatted_number = round($number / 1.0e+6, $decimals) . 'M'; } 
        elseif ($abs_number >= 1.0e+3) { $formatted_number = round($number / 1.0e+3, $decimals) . 'K'; }
        else { $formatted_number = number_format($number, $decimals); }
        return $prefix . $formatted_number;
    }

    private function format_metric_value($value, $suffix = '') {
        if (is_numeric($value)) {
            return number_format((float)$value, 1) . $suffix;
        }
        return 'N/A';
    }
    
    private function store_and_map_discovered_company($ticker, $industry_name, $sector_name) {
        if (empty($ticker) || empty($industry_name)) { return; }
        $discovered = get_option('jtw_discovered_companies', []);
        if (!is_array($discovered)) { $discovered = []; }
        if (!array_key_exists($ticker, $discovered)) {
            $discovered[$ticker] = $industry_name;
            update_option('jtw_discovered_companies', $discovered);
        }
    }

    private function calculate_levered_beta($ticker, $balance_sheet, $market_cap, $tax_rate) {
        global $wpdb;
        $debug_data = [ 'levered_beta' => 1.0, 'unlevered_beta_avg' => null, 'debt_to_equity' => null, 'tax_rate' => $tax_rate, 'mapped_damodaran_industries' => [], 'beta_source' => 'Default' ];
        $mapping_table = $wpdb->prefix . 'jtw_company_mappings';
        $beta_table = $wpdb->prefix . 'jtw_industry_betas';
        $unlevered_betas = $wpdb->get_col($wpdb->prepare( "SELECT b.unlevered_beta FROM $mapping_table as m JOIN $beta_table as b ON m.damodaran_industry_id = b.id WHERE m.ticker = %s", $ticker ));
        if (empty($unlevered_betas)) { return $debug_data; }
        $debug_data['mapped_damodaran_industries'] = $wpdb->get_col($wpdb->prepare( "SELECT b.industry_name FROM $mapping_table as m JOIN $beta_table as b ON m.damodaran_industry_id = b.id WHERE m.ticker = %s", $ticker ));
        $average_unlevered_beta = array_sum($unlevered_betas) / count($unlevered_betas);
        $debug_data['unlevered_beta_avg'] = $average_unlevered_beta;
        $debug_data['levered_beta'] = $average_unlevered_beta;
        $debug_data['beta_source'] = 'Calculated from Industry Beta';
        if (is_wp_error($balance_sheet) || empty($balance_sheet['annualReports'])) { return $debug_data; }
        $latest_report = $balance_sheet['annualReports'][0];
        $total_debt = (float)($latest_report['shortTermDebt'] ?? 0) + (float)($latest_report['longTermDebtNoncurrent'] ?? 0);
        if ($market_cap > 0) {
            $debt_to_equity = $total_debt / $market_cap;
            $debug_data['debt_to_equity'] = $debt_to_equity;
            $levered_beta = 0.33 + ((0.66 * $average_unlevered_beta) * (1 + (1 - $tax_rate) * $debt_to_equity));
            $debug_data['unconstrained_levered_beta'] = $levered_beta;
            $debug_data['relevered_beta_calc'] = '0.33 + [(0.66 * ' . number_format($average_unlevered_beta, 3) . ') * (1 + (1 - ' . number_format($tax_rate * 100, 1) . '%) * ' . number_format($debt_to_equity, 3) . ')]';
            $levered_beta = max(0.8, min(2.0, $levered_beta));
            $debug_data['levered_beta'] = $levered_beta;
            $debug_data['beta_source'] = 'Re-levered from Industry Beta (capped 0.8-2.0)';
        }
        return $debug_data;
    }

    private function create_metric_card($title, $value, $prefix = '', $custom_class = '', $use_large_number_format = false, $suffix = '') {
        $formatted_value = 'N/A';
        if (is_numeric($value)) {
            if ($use_large_number_format) {
                $final_prefix = ($title === 'Shares Outstanding') ? '' : $prefix;
                $formatted_value = $this->format_large_number($value, $final_prefix, 1);
            } else {
                $temp_val = number_format((float)$value, 1);
                $formatted_value = $prefix . $temp_val . $suffix;
            }
        } elseif (!empty($value) && strcasecmp(trim($value), 'none') !== 0) { 
            $formatted_value = $value; 
        }
        return '<div class="jtw-metric-card ' . esc_attr($custom_class) . '"><h3 class="jtw-metric-title">' . esc_html($title) . '</h3><p class="jtw-metric-value">' . esc_html($formatted_value) . '</p></div>';
    }

    private function build_overview_section_html($overview, $quote) {
        $ticker = $overview['Symbol'] ?? 'N/A';
        $description = $overview['Description'] ?? 'No company description available.';
        $stock_price = !is_wp_error($quote) ? (float)($quote['05. price'] ?? 0) : 0;

        $quote_data = $quote['Global Quote'] ?? $quote['Global Quote - DATA DELAYED BY 15 MINUTES'] ?? [];
        $stock_price = !empty($quote_data) ? (float)($quote_data['05. price'] ?? 0) : 0;

        $week_high = (float)($overview['52WeekHigh'] ?? 0);
        $week_low = (float)($overview['52WeekLow'] ?? 0);
        $cik = $overview['CIK'] ?? null;
        $latest_quarter_date = $overview['LatestQuarter'] ?? null;
        $quarter_param = '';
        if ($latest_quarter_date) {
            $date = new DateTime($latest_quarter_date);
            $year = $date->format('Y');
            $month = (int)$date->format('m');
            $quarter_num = ceil($month / 3);
            $quarter_param = $year . 'Q' . $quarter_num;
        }

        ob_start();
        ?>
        <div class="jtw-content-section" id="section-overview-content">
            <div class="jtw-section-header">
                <h4><?php echo esc_html($ticker); ?> <?php esc_html_e('Company Overview', 'journey-to-wealth'); ?></h4>
                <button class="jtw-modal-trigger jtw-details-button" data-modal-target="#jtw-company-details-modal"><?php esc_html_e('View Full Company Details', 'journey-to-wealth'); ?></button>
            </div>
            <div class="jtw-price-range-bar" data-low="<?php echo esc_attr($week_low); ?>" data-high="<?php echo esc_attr($week_high); ?>" data-current="<?php echo esc_attr($stock_price); ?>">
                <h5>52-Week Price Range</h5>
                <div class="jtw-progress-track"><div class="jtw-progress-fill" style="width: 0%;"></div></div>
                <div class="jtw-price-range-labels">
                    <span><strong>$<?php echo esc_attr(number_format($week_low, 1)); ?></strong></span>
                    <span><strong>Current: $<?php echo esc_attr(number_format($stock_price, 1)); ?></strong></span>
                    <span><strong>$<?php echo esc_attr(number_format($week_high, 1)); ?></strong></span>
                </div>
            </div>
            <div class="jtw-overview-header-grid">
                <?php
                echo $this->create_metric_card('Current Price', $stock_price, '$');
                echo $this->create_metric_card('Market Capitalization', $overview['MarketCapitalization'] ?? 0, '$', '', true);
                echo $this->create_metric_card('Shares Outstanding', $overview['SharesOutstanding'] ?? 0, '', '', true);
                ?>
            </div>
            <?php if (!empty($description) && strcasecmp(trim($description), 'none') !== 0) : ?>
                <div class="jtw-company-description"><p><?php echo esc_html($description); ?></p></div>
            <?php endif; ?>
            <div class="jtw-link-cards-grid">
                <?php if ($cik) : ?>
                    <a href="<?php echo esc_url('https://www.sec.gov/edgar/browse/?CIK=' . $cik . '&owner=exclude'); ?>" target="_blank" rel="noopener noreferrer" class="jtw-sec-filings-card"><span>View All SEC Filings</span></a>
                <?php endif; ?>
                <?php if ($quarter_param) : ?>
                    <a href="#" class="jtw-sec-filings-card jtw-modal-trigger jtw-transcript-trigger" data-modal-target="#jtw-transcript-modal" data-ticker="<?php echo esc_attr($ticker); ?>" data-quarter="<?php echo esc_attr($quarter_param); ?>"><span><?php echo esc_html($quarter_param); ?> Earnings Transcript</span></a>
                <?php endif; ?>
            </div>
            <div id="jtw-company-details-modal" class="jtw-modal"><div class="jtw-modal-content"><span class="jtw-modal-close">&times;</span><h4><?php esc_html_e('Company Details', 'journey-to-wealth'); ?></h4><div class="jtw-details-grid">
                <?php
                $details_map = [ 'Exchange' => 'Exchange', 'Sector' => 'Sector', 'Industry' => 'Industry', 'FiscalYearEnd' => 'Fiscal Year End', 'LatestQuarter' => 'Latest Quarter' ];
                foreach ($details_map as $key => $title) { echo $this->create_metric_card($title, $overview[$key] ?? 'N/A'); }
                ?>
            </div></div></div>
            <div id="jtw-transcript-modal" class="jtw-modal jtw-fullscreen-modal"><div class="jtw-modal-content"><span class="jtw-modal-close">&times;</span><div id="jtw-transcript-content-target"></div></div></div>
            <div class="jtw-modal-overlay"></div>
        </div>
        <?php
        return ob_get_clean();
    }

    private function build_case_table_html($case, $current_year, $current_year_revenue_growth, $analyst_revenue_current_year, $divisor, $unit, $current_year_net_income, $current_year_eps, $current_year_pe, $available_models, $dcf_result_for_ui) {
        $case_title = ucfirst($case) . ' Case';
        $modal_id = 'jtw-assumptions-modal-' . $case;
        ob_start();
        ?>
        <table class="jtw-assumptions-table jtw-case-table" data-case="<?php echo esc_attr($case); ?>">
            <thead>
                <tr><th colspan="6"><div class="jtw-case-header-cell"><span><?php echo esc_html($case_title); ?></span><button class="jtw-modal-trigger jtw-view-assumptions-btn" data-modal-target="#<?php echo esc_attr($modal_id); ?>">View Assumptions</button></div></th></tr>
                <tr><th>Metric</th><th><?php echo $current_year; ?></th>
                <?php for ($i = 1; $i < 5; $i++) { echo '<th>' . ($current_year + $i) . '</th>'; } ?>
                </tr>
            </thead>
            <tbody class="jtw-assumptions-table-body">
                <tr class="jtw-metric-group-header"><td colspan="6">Top Line</td></tr>
                <tr class="jtw-project-5-year"><td class="jtw-indented-metric">Revenue Growth</td>
                    <td><?php echo is_numeric($current_year_revenue_growth) ? number_format($current_year_revenue_growth, 1) . '%' : '-'; ?></td>
                    <?php for ($i = 1; $i < 5; $i++) :
                        $default_growth = $current_year_revenue_growth;
                        if ($case === 'bear') { $default_growth -= $i * 1.0; } 
                        elseif ($case === 'bull') { $default_growth += $i * 1.0; }
                    ?>
                    <td><input type="number" step="0.1" class="jtw-assumption-input jtw-yearly-input" data-metric="yearlyRevGrowth" data-year="<?php echo $i; ?>" value="<?php echo esc_attr(number_format($default_growth, 1)); ?>"></td>
                    <?php endfor; ?>
                </tr>
                <tr class="jtw-project-5-year"><td class="jtw-indented-metric jtw-revenue-label">Revenue <?php echo esc_html($unit); ?></td>
                    <td class="jtw-revenue-result" data-year="0"><?php echo number_format($analyst_revenue_current_year / $divisor, 1); ?></td>
                    <?php for ($i = 1; $i < 5; $i++) { echo '<td class="jtw-revenue-result" data-year="' . $i . '">-</td>'; } ?>
                </tr>
                 <tr class="jtw-metric-group-header"><td colspan="6">Bottom Line</td></tr>
                <tr class="jtw-project-5-year"><td class="jtw-indented-metric">Net Income <?php echo esc_html($unit); ?></td>
                    <td class="jtw-net-income-result" data-year="0"><?php echo number_format($current_year_net_income / $divisor, 1); ?></td>
                    <?php for ($i = 1; $i < 5; $i++) { echo '<td class="jtw-net-income-result" data-year="' . $i . '">-</td>'; } ?>
                </tr>
                <tr class="jtw-project-5-year"><td class="jtw-indented-metric">EPS</td>
                    <td class="jtw-eps-result" data-year="0"><?php echo number_format($current_year_eps, 2); ?></td>
                    <?php for ($i = 1; $i < 5; $i++) { echo '<td class="jtw-eps-result" data-year="' . $i . '">-</td>'; } ?>
                </tr>
                <tr class="jtw-project-5-year"><td class="jtw-indented-metric">P/E</td>
                    <td class="jtw-pe-result" data-year="0"><?php echo is_numeric($current_year_pe) ? number_format($current_year_pe, 1) : 'N/A'; ?></td>
                    <?php 
                    $default_pe = is_numeric($current_year_pe) ? number_format($current_year_pe, 1, '.', '') : '20.0';
                    for ($i = 1; $i < 5; $i++) { echo '<td><input type="number" step="0.1" class="jtw-assumption-input jtw-pe-input" data-year="' . $i . '" value="' . esc_attr($default_pe) . '"></td>'; }
                    ?>
                </tr>
                <tr class="jtw-metric-group-header jtw-result-header-row jtw-project-5-year">
                    <td>Multiple of Earnings Valuation</td>
                    <td class="jtw-moe-result-cell" data-year="0">-</td>
                    <?php for ($i = 1; $i < 5; $i++) { echo '<td class="jtw-moe-result-cell" data-year="' . $i . '">-</td>'; } ?>
                </tr>
                <tr class="jtw-metric-group-header jtw-result-header-row jtw-terminal-value-row" data-selected-model="dcf">
                    <td>
                        <div class="jtw-model-selector" tabindex="0">
                            <span class="jtw-selected-model">Discounted Cash Flow</span>
                            <svg class="jtw-chevron-down" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            <ul class="jtw-model-options">
                            <?php foreach ($available_models as $key => $label) { echo '<li data-model-key="' . esc_attr($key) . '">' . esc_html($label) . '</li>'; } ?>
                            </ul>
                        </div>
                    </td>
                    <td class="jtw-dcf-result-final-cell jtw-terminal-value-cell" colspan="5">
                        <div class="jtw-in-table-bar-container">
                            <div class="jtw-in-table-zone-bar"><div class="jtw-in-table-zone undervalued"></div><div class="jtw-in-table-zone about-right"></div><div class="jtw-in-table-zone overvalued"></div></div>
                            <div class="jtw-in-table-bar-wrapper jtw-fair-value-bar-wrapper"><div class="jtw-in-table-bar jtw-fair-value-bar"><span class="jtw-in-table-bar-label jtw-fair-value-label">Fair Value: $-</span></div></div>
                            <div class="jtw-in-table-bar-wrapper jtw-current-price-bar-wrapper"><div class="jtw-in-table-bar jtw-current-price-bar"><span class="jtw-in-table-bar-label jtw-current-price-label">Current Price: $-</span></div></div>
                        </div>
                        <span class="jtw-dcf-error-message" style="display:none;">Valuation could not be run.</span>
                    </td>
                </tr>
            </tbody>
        </table>
        <div id="<?php echo esc_attr($modal_id); ?>" class="jtw-modal"><div class="jtw-modal-content"><span class="jtw-modal-close">&times;</span>
            <?php echo $this->build_dcf_modal_content($dcf_result_for_ui); ?>
        </div></div>
        <?php
        return ob_get_clean();
    }

    private function build_intrinsic_valuation_section_html($valuation_data, $valuation_summary, $details, $dcf_result_for_ui) {
        // This function is now purely for presentation, using pre-calculated data.
        $dcf_result_data = $dcf_result_for_ui['calculation_breakdown'] ?? null;
        if (is_null($dcf_result_data)) { return '<div class="jtw-content-section"><p>Could not generate valuation projection tables. Required data is missing.</p></div>'; }
        
        $component_ratios_json = isset($dcf_result_data['component_ratios']['projection_ratios']) ? esc_attr(json_encode($dcf_result_data['component_ratios']['projection_ratios'])) : '[]';
        $shares_outstanding = $dcf_result_data['shares_outstanding'] ?? 0;

        $output = '<div id="section-intrinsic-valuation-content" class="jtw-content-section" data-ratios=\'' . $component_ratios_json . '\' data-current-price="' . esc_attr($valuation_summary['current_price']) . '" data-shares-outstanding="' . esc_attr($shares_outstanding) . '">';
        $output .= '<div class="jtw-section-header"><h4>' . esc_html__('Value Projections', 'journey-to-wealth') . '</h4></div>';

        $base_revenue = $dcf_result_data['base_revenue'];
        $current_year = date('Y');
        $unit = ''; $divisor = 1;
        if (abs($base_revenue) >= 1.0e+9) { $unit = '(Billions)'; $divisor = 1.0e+9; } 
        elseif (abs($base_revenue) >= 1.0e+6) { $unit = '(Millions)'; $divisor = 1.0e+6; }
        
        $analyst_revenue_current_year = $dcf_result_data['base_revenue'] ?? 0;
        $current_year_revenue_growth = ($dcf_result_data['inputs']['initial_growth_rate'] ?? 0) * 100;
        $net_income_to_revenue_ratio = $dcf_result_data['component_ratios']['projection_ratios']['net_income_of_revenue'] ?? 0;
        $current_year_net_income = $analyst_revenue_current_year * $net_income_to_revenue_ratio;
        $current_year_eps = ($shares_outstanding > 0) ? $current_year_net_income / $shares_outstanding : 0;
        $current_year_pe = ($current_year_eps > 0) ? $valuation_summary['current_price'] / $current_year_eps : 'N/A';
        
        $available_models = [ 'dcf' => 'Discounted Cash Flow Valuation', 'affo' => 'AFFO Valuation', 'excess_return' => 'Excess Return Valuation' ];
        if (isset($details['DividendPerShare']) && (float)$details['DividendPerShare'] > 0) { $available_models['ddm'] = 'Dividend Discount Model'; }

        foreach (['bear', 'base', 'bull'] as $case) {
            // This loop builds the table structure; JS will handle the interactive recalculations.
            $output .= $this->build_case_table_html($case, $current_year, $current_year_revenue_growth, $analyst_revenue_current_year, $divisor, $unit, $current_year_net_income, $current_year_eps, $current_year_pe, $available_models, $dcf_result_for_ui);
        }
        $output .= '<div class="jtw-modal-overlay"></div></div>';
        return $output;
    }

    private function build_key_metrics_ratios_section_html($ticker, $primary_metrics) {
        ob_start();
        ?>
        <div id="section-key-metrics-ratios-content" class="jtw-content-section">
            <div class="jtw-section-header">
                <h4><?php esc_html_e('Comparative Company Analysis', 'journey-to-wealth'); ?></h4>
                <div class="jtw-peer-controls-container">
                    <span><?php esc_html_e('Auto-suggest Peers', 'journey-to-wealth'); ?></span>
                    <label class="jtw-switch"><input type="checkbox" id="jtw-peer-toggle"><span class="jtw-slider round"></span></label>
                    <button id="jtw-compare-peers-btn" class="jtw-compare-button"><?php esc_html_e('Compare', 'journey-to-wealth'); ?></button>
                </div>
            </div>
            <div class="jtw-metrics-table-container">
                <table class="jtw-metrics-table peer-view">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th class="jtw-primary-col"><?php echo esc_html($ticker); ?></th>
                            <th class="jtw-peer-col"><input type="text" id="jtw-peer-1-input" class="jtw-peer-input" placeholder="Enter Ticker..."></th>
                            <th class="jtw-peer-col"><input type="text" id="jtw-peer-2-input" class="jtw-peer-input" placeholder="Enter Ticker..."></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $metric_groups = [
                            'Relative Valuation' => ['PERatio' => ['label' => 'TTM P/E Ratio', 'suffix' => 'x'], 'ForwardPE' => ['label' => 'Forward P/E Ratio', 'suffix' => 'x'], 'PriceToBookRatio' => ['label' => 'P/B Ratio', 'suffix' => 'x'], 'PriceToSalesRatioTTM' => ['label' => 'P/S Ratio', 'suffix' => 'x']],
                            'Growth Analysis' => [ 'ttmEpsGrowth' => ['label' => 'TTM EPS Growth', 'suffix' => '%'], 'nextYearEpsGrowth' => ['label' => 'Next Year EPS Growth (Est)', 'suffix' => '%'] ],
                            'Profitability' => ['grossMargin' => ['label' => 'Gross Margin', 'suffix' => '%'], 'netMargin' => ['label' => 'Net Margin', 'suffix' => '%'], 'returnOnEquityTTM' => ['label' => 'Return on Equity', 'suffix' => '%'], 'returnOnCapitalTTM' => ['label' => 'Return on Capital', 'suffix' => '%']],
                        ];
                        foreach ($metric_groups as $group_name => $metrics) :
                        ?>
                            <tr class="jtw-metric-group-header"><td colspan="4"><?php echo esc_html($group_name); ?></td></tr>
                            <?php foreach ($metrics as $key => $details) : ?>
                                <tr>
                                    <td><?php echo esc_html($details['label']); ?></td>
                                    <td class="jtw-primary-col"><?php echo $this->format_metric_value($primary_metrics[$key] ?? 'N/A', $details['suffix']); ?></td>
                                    <td class="jtw-peer-col jtw-peer-1-value" data-metric="<?php echo esc_attr($key); ?>">-</td>
                                    <td class="jtw-peer-col jtw-peer-2-value" data-metric="<?php echo esc_attr($key); ?>">-</td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <div class="jtw-peer-loading-spinner" style="display:none;"><div class="jtw-loading-spinner"></div></div>
                <div class="jtw-peer-error-message" style="display:none;"></div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    private function build_past_performance_section_html($historical_data) {
        ob_start();
        ?>
        <div id="section-past-performance-content" class="jtw-content-section">
            <h4><?php esc_html_e('Visual Data Trends', 'journey-to-wealth'); ?></h4>
            <div class="jtw-chart-controls">
                <div class="jtw-period-toggle">
                    <button class="jtw-period-button active" data-period="annual">Annual</button>
                    <button class="jtw-period-button" data-period="quarterly">Quarterly</button>
                </div>
            </div>
            <div class="jtw-historical-charts-grid">
                <?php
                $chart_configs = [
                    'revenue' => ['title' => 'Revenue', 'type' => 'bar', 'prefix' => '$'], 'net_income' => ['title' => 'Net Income', 'type' => 'bar', 'prefix' => '$'],
                    'ebitda' => ['title' => 'EBITDA', 'type' => 'bar', 'prefix' => '$'], 'fcf' => ['title' => 'Free Cash Flow', 'type' => 'bar', 'prefix' => '$'],
                    'eps' => ['title' => 'EPS', 'type' => 'bar', 'prefix' => '$'], 'dividend' => ['title' => 'Dividend Per Share', 'type' => 'bar', 'prefix' => '$'],
                ];
                foreach ($chart_configs as $key => $config) {
                    $annual_data = $historical_data['annual'][$key] ?? [];
                    $quarterly_data = $historical_data['quarterly'][$key] ?? [];
                    $chart_id = 'chart-' . uniqid();
                    echo '<div class="jtw-chart-item">';
                    echo '<h5>' . esc_html($config['title']) . '</h5><div class="jtw-chart-wrapper"><canvas id="' . esc_attr($chart_id) . '"></canvas></div>';
                    echo "<script type='application/json' class='jtw-chart-data' data-chart-id='" . esc_attr($chart_id) . "' data-chart-type='" . esc_attr($config['type']) . "' data-prefix='" . esc_attr($config['prefix']) . "' data-annual='" . esc_attr(json_encode($annual_data)) . "' data-quarterly='" . esc_attr(json_encode($quarterly_data)) . "'></script>";
                    echo '</div>';
                }
                ?>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    private function build_historical_data_section_html($table_data) {
        if (empty($table_data)) { return '<div class="jtw-content-section"><p>Historical data is not available for this company.</p></div>'; }
        ob_start();
        ?>
        <div class="jtw-content-section" id="section-historical-data-content">
            <h4><?php esc_html_e('Shareholder Metrics', 'journey-to-wealth'); ?></h4>
            <div class="jtw-historical-combined-wrapper">
                <div class="jtw-historical-chart-container"><canvas id="jtw-historical-chart-canvas"></canvas></div>
                <div class="jtw-historical-table-wrapper">
                    <table class="jtw-historical-table">
                        <thead><tr><th>Metric</th><?php foreach ($table_data as $dp) { echo '<th>' . esc_html($dp['year']) . '</th>'; } ?></tr></thead>
                        <tbody>
                            <?php
                            $metrics = [ 'price' => ['label' => 'Price / Share', 'prefix' => '$'], 'revenue_ps' => ['label' => 'Revenue / Share', 'prefix' => '$'], 'eps' => ['label' => 'EPS', 'prefix' => '$'], 'cash_flow_ps' => ['label' => 'FCF / Share', 'prefix' => '$'], 'book_value_ps' => ['label' => 'Book Value / Share', 'prefix' => '$'], 'net_profit_margin' => ['label' => 'Net Profit Margin', 'prefix' => '%'], 'return_on_equity' => ['label' => 'Return on Equity', 'prefix' => '%'], 'return_on_capital' => ['label' => 'Return on Capital', 'prefix' => '%'] ];
                            foreach ($metrics as $key => $details) : ?>
                                <tr data-metric-key="<?php echo esc_attr($key); ?>">
                                    <td><?php echo esc_html($details['label']); ?></td>
                                    <?php foreach ($table_data as $dp) {
                                        $val_key = ($key === 'price') ? 'avg_price' : $key;
                                        echo '<td>' . $this->format_metric_value($dp[$val_key] ?? 'N/A', $details['prefix']) . '</td>';
                                    } ?>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
            <script type='application/json' id='jtw-historical-data-json'><?php echo json_encode($table_data); ?></script>
        </div>
        <?php
        return ob_get_clean();
    }

    private function build_dcf_modal_content($result) {
        $data = $result['calculation_breakdown'] ?? [];
        if(empty($data)) return '<p>Detailed breakdown is not available.</p>';
        ob_start();
        ?>
        <h4>Valuation Details</h4>
        <p>This modal provides a breakdown of the assumptions and calculations used in the valuation model.</p>
        <pre><?php print_r($data); ?></pre>
        <?php
        return ob_get_clean();
    }
}

