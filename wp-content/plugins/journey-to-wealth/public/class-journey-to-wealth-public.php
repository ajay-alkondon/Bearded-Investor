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
    
// In class-journey-to-wealth-public.php, replace the existing enqueue_scripts function.

public function enqueue_scripts() {
    wp_enqueue_script( 'chartjs', 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js', array(), '4.4.1', true );
    wp_enqueue_script( 'chartjs-adapter-date-fns', 'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js', array('chartjs'), '1.1.0', true );
    wp_enqueue_script( 'chartjs-plugin-datalabels', 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js', array('chartjs'), '2.2.0', true );
    
    // --- START: CORRECTED SCRIPT ENQUEUE ---
    // Use the correct, modern CDN link for the annotation plugin
    wp_enqueue_script( 'chartjs-annotation', 'https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3.0.1/dist/chartjs-plugin-annotation.min.js', array('chartjs'), '3.0.1', true );
    // --- END: CORRECTED SCRIPT ENQUEUE ---

    $script_path = plugin_dir_path( __FILE__ ) . 'assets/js/public-scripts.js';
    $script_version = file_exists($script_path) ? $this->version . '.' . filemtime( $script_path ) : $this->version;

    // Ensure 'chartjs-annotation' is in the dependency array
    $dependencies = array( 'jquery', 'chartjs', 'chartjs-adapter-date-fns', 'chartjs-plugin-datalabels', 'chartjs-annotation' );
    
    wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'assets/js/public-scripts.js', $dependencies, $script_version, true );
    
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
                <main class="jtw-content-main">
                    <div id="jtw-currency-notice-placeholder"></div>
                    
                    <div id="section-overview" class="jtw-content-section-placeholder" data-section="overview"></div>
                    <div id="section-intrinsic-valuation" class="jtw-content-section-placeholder" data-section="intrinsic-valuation"></div>
                    <div id="section-performance" class="jtw-content-section-placeholder" data-section="earnings-revenue-forecasts"></div>
                    <div id="section-key-metrics-ratios" class="jtw-content-section-placeholder" data-section="key-metrics-ratios"></div>
                    <div id="section-historical-data" class="jtw-content-section-placeholder" data-section="historical-data"></div>
                    <div id="section-past-performance" class="jtw-content-section-placeholder" data-section="past-performance"></div>
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
    
// In class-journey-to-wealth-public.php, replace the existing `ajax_fetch_section_data` function with this updated version.

public function ajax_fetch_section_data() {
    check_ajax_referer('jtw_fetch_section_nonce', 'nonce');
    $ticker = isset($_POST['ticker']) ? sanitize_text_field(strtoupper($_POST['ticker'])) : '';
    $section = isset($_POST['section']) ? sanitize_key($_POST['section']) : '';

    if (empty($ticker) || empty($section)) {
        wp_send_json_error(['message' => 'Missing parameters.']);
        return;
    }

    $python_data = $this->call_python_calculation_engine($ticker);
    if (is_wp_error($python_data)) {
        wp_send_json_error(['message' => $python_data->get_error_message(), 'details' => $python_data->get_error_data()]);
        return;
    }

    $response_data = [];

    // --- START: CURRENCY NOTICE LOGIC ---
    if (isset($python_data['exchange_rate_data']['Realtime Currency Exchange Rate'])) {
        $rate_info = $python_data['exchange_rate_data']['Realtime Currency Exchange Rate'];
        $from_currency = $rate_info['2. From_Currency Name'];
        $rate = number_format((float)$rate_info['5. Exchange Rate'], 4);

        $notice_html = '<div class="jtw-currency-notice"><p><strong>Note:</strong> This company reports in ' . esc_html($from_currency) . '. All financial values have been converted to USD at a rate of ' . esc_html($rate) . '.</p></div>';

        $response_data['currency_notice'] = $notice_html;
    }
    // --- END: CURRENCY NOTICE LOGIC ---

    if ($section === 'intrinsic-valuation') {
        $calculated_data = $python_data['calculated_data'];
        $raw_data = $python_data['raw_data_subset'];
        $quote_data = $raw_data['quote']['Global Quote'] ?? $raw_data['quote']['Global Quote - DATA DELAYED BY 15 MINUTES'] ?? [];
        $latest_price = !empty($quote_data) ? (float)($quote_data['05. price'] ?? 0) : 0;
        $valuation_models = $calculated_data['valuations'] ?? [];
        
        $valuation_summary = [ 'current_price' => $latest_price, 'fair_value' => 0, 'percentage_diff' => 0 ];
        $valid_models = [];
        foreach ($valuation_models as $result) { if (isset($result['intrinsic_value_per_share']) && is_numeric($result['intrinsic_value_per_share'])) { $valid_models[] = $result['intrinsic_value_per_share']; } }
        if (!empty($valid_models)) { $valuation_summary['fair_value'] = array_sum($valid_models) / count($valid_models); }

        $response_data['html'] = $this->build_intrinsic_valuation_section_html($valuation_models, $valuation_summary, $raw_data['overview'], $calculated_data);
        wp_send_json_success($response_data);
        return;
    }

    // This part handles the other sections
    $calculated_data = $python_data['calculated_data'];
    $raw_data = $python_data['raw_data_subset'];

    switch ($section) {
        case 'overview':
            $this->store_and_map_discovered_company($ticker, $raw_data['overview']['Industry'], $raw_data['overview']['Sector']);
            $response_data['html'] = $this->build_overview_section_html($raw_data['overview'], $raw_data['quote']);
            break;
        case 'historical-data':
            $response_data['html'] = $this->build_historical_data_section_html($calculated_data['historical_table_data']);
            break;
        case 'past-performance':
            $response_data['html'] = $this->build_past_performance_section_html($calculated_data['historical_chart_data']);
            break;
        case 'key-metrics-ratios':
            $response_data['html'] = $this->build_key_metrics_ratios_section_html($ticker, $calculated_data['key_metrics']);
            break;
        case 'earnings-revenue-forecasts': // ADD THIS NEW CASE
            $response_data['html'] = $this->build_earnings_revenue_forecasts_html($calculated_data['earnings_revenue_forecasts']);
            break;
    }

    if (empty($response_data['html'])) {
        wp_send_json_error(['message' => 'Could not generate content for this section.']);
    } else {
        wp_send_json_success($response_data);
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

public function ajax_fetch_transcript() {
    check_ajax_referer('jtw_fetch_transcript_nonce', 'nonce');

    $ticker = isset($_POST['ticker']) ? sanitize_text_field(strtoupper($_POST['ticker'])) : '';
    $quarter = isset($_POST['quarter']) ? sanitize_text_field($_POST['quarter']) : '';

    if (empty($ticker) || empty($quarter)) {
        wp_send_json_error(['message' => 'Missing parameters.']);
        return;
    }

    $api_key = get_option('jtw_av_api_key');
    if (empty($api_key)) {
        wp_send_json_error(['message' => 'API Key is not configured.']);
        return;
    }

    $av_client = new Alpha_Vantage_Client($api_key);
    $transcript_data = $av_client->get_earnings_transcript($ticker, $quarter);

    if (is_wp_error($transcript_data)) {
        wp_send_json_error(['message' => $transcript_data->get_error_message()]);
        return;
    }

    ob_start();
    
    // Add a space between the year and the quarter for display
    $quarter_display = str_replace('Q', ' Q', $quarter);
    ?>
    <h4 class="jtw-modal-title">Earnings Call Transcript: <?php echo esc_html($ticker); ?> - <?php echo esc_html($quarter_display); ?></h4>
    <?php
    if (isset($transcript_data['transcript']) && is_array($transcript_data['transcript'])) {
        foreach ($transcript_data['transcript'] as $entry) {
            ?>
            <div class="jtw-transcript-entry">
                <div class="jtw-transcript-speaker">
                    <?php echo esc_html($entry['speaker']); ?>
                    <?php if (!empty($entry['title'])) : ?>
                        <span class="jtw-transcript-title"><?php echo esc_html($entry['title']); ?></span>
                    <?php endif; ?>
                </div>
                <div class="jtw-transcript-content">
                    <?php echo wp_kses_post(wpautop($entry['content'])); ?>
                </div>
            </div>
            <?php
        }
    } else {
        echo '<p>No transcript content available.</p>';
    }

    $html = ob_get_clean();
    wp_send_json_success(['html' => $html]);
}

public function ajax_recalculate_valuation() {
    check_ajax_referer('jtw_recalculate_valuation_nonce', 'nonce');
    $ticker = isset($_POST['ticker']) ? sanitize_text_field(strtoupper($_POST['ticker'])) : '';
    $all_assumptions = isset($_POST['assumptions']) ? $_POST['assumptions'] : [];
    if (empty($ticker)) {
        wp_send_json_error(['message' => 'Missing Ticker.']);
        return;
    }
    
    // --- START: SIMPLIFIED RECALCULATION ---
    // Make a single call to the Python backend with all three assumption sets.
    $python_data = $this->call_python_calculation_engine($ticker, $all_assumptions);

    if (is_wp_error($python_data)) {
        wp_send_json_error(['message' => $python_data->get_error_message()]);
        return;
    }

    $results = [];
    $all_valuations = $python_data['calculated_data']['valuations'] ?? [];

    // Loop through the results returned from Python and build the response.
    foreach ($all_valuations as $case_name => $valuation_result) {
        
        if (isset($valuation_result['error'])) {
             $results[$case_name] = ['error' => $valuation_result['error']];
             continue;
        }

        $model_key = $all_assumptions[$case_name]['model'] ?? 'dcf';
        $modal_html = '';
        if ($model_key === 'dcf') {
            $modal_html = $this->build_dcf_modal_content($valuation_result);
        } else {
            $modal_html = $this->build_simple_valuation_modal_content($valuation_result);
        }

        $results[$case_name] = [
            'fair_value' => $valuation_result['intrinsic_value_per_share'] ?? null,
            'valuation_label' => $valuation_result['calculation_breakdown']['model_name'] ?? 'N/A',
            'modal_html' => $modal_html
        ];
    }
    
    wp_send_json_success($results);
    // --- END: SIMPLIFIED RECALCULATION ---
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

private function call_python_calculation_engine($ticker, $all_assumptions = []) {
    $cloud_function_url = get_option('jtw_cloud_function_url');
    if (empty($cloud_function_url)) {
        return new WP_Error('config_error', 'The Cloud Function URL is not configured.');
    }

    // This function now only prepares and sends the request.
    // It's much simpler as it doesn't need to do its own data fetching anymore.
    
    $overrides = get_option('jtw_company_type_overrides', []);
    $company_type = $overrides[$ticker] ?? null;
    
    // The beta calculation still needs to happen in PHP before the call.
    $av_client = new Alpha_Vantage_Client(get_option('jtw_av_api_key'));
    $overview = $av_client->get_company_overview($ticker);
    $balance_sheet = $av_client->get_balance_sheet($ticker);
    if(is_wp_error($overview) || is_wp_error($balance_sheet)) {
        return new WP_Error('api_error', 'Could not fetch prerequisite data for beta calculation.');
    }
    $tax_rate_decimal = (float) get_option('jtw_tax_rate_setting', '21.0') / 100;
    $market_cap = (float)($overview['MarketCapitalization'] ?? 0);
    $beta_details = $this->calculate_levered_beta($ticker, $balance_sheet, $market_cap, $tax_rate_decimal);

    $payload = [
        'ticker'                => $ticker,
        'erp'                   => (float) get_option('jtw_erp_setting', '5.0') / 100,
        'tax_rate'              => $tax_rate_decimal,
        'beta_details'          => $beta_details,
        'all_assumptions'       => !empty($all_assumptions) ? $all_assumptions : new stdClass(),
        'company_type_override' => $company_type,
    ];

    $json_payload = json_encode($this->force_utf8_encode($payload));
    if (json_last_error() !== JSON_ERROR_NONE) {
        return new WP_Error('json_encode_error', 'Failed to encode payload for Cloud Function.');
    }

    $response = wp_remote_post($cloud_function_url, [
        'method'      => 'POST',
        'headers'     => ['Content-Type' => 'application/json; charset=utf-8'],
        'body'        => $json_payload,
        'timeout'     => 45,
    ]);

    if (is_wp_error($response)) {
        return new WP_Error('http_error', 'Error calling Cloud Function: ' . $response->get_error_message());
    }

    $body = wp_remote_retrieve_body($response);
    $python_data = json_decode($body, true);

    if (wp_remote_retrieve_response_code($response) >= 400 || json_last_error() !== JSON_ERROR_NONE) {
        return new WP_Error('response_error', 'Invalid response from Cloud Function.', ['response_body' => $body]);
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
        
        // --- START: ROBUST DEFAULTS FOR NEW COMPANIES ---
        // For new companies without a mapping, default to a beta of 1.0 and D/E of 0.0.
        $debug_data = [ 
            'levered_beta' => 1.0, 
            'unlevered_beta_avg' => 1.0, // Default unlevered beta
            'debt_to_equity' => 0.0,   // Default D/E ratio
            'tax_rate' => $tax_rate, 
            'mapped_damodaran_industries' => [], 
            'beta_source' => 'Default (Unmapped Company)' 
        ];
        // --- END: ROBUST DEFAULTS FOR NEW COMPANIES ---

        $mapping_table = $wpdb->prefix . 'jtw_company_mappings';
        $beta_table = $wpdb->prefix . 'jtw_industry_betas';
        
        $unlevered_betas = $wpdb->get_col($wpdb->prepare( "SELECT b.unlevered_beta FROM $mapping_table as m JOIN $beta_table as b ON m.damodaran_industry_id = b.id WHERE m.ticker = %s", $ticker ));
        
        // If a mapping exists, proceed with the detailed calculation.
        if (!empty($unlevered_betas)) {
            $debug_data['mapped_damodaran_industries'] = $wpdb->get_col($wpdb->prepare( "SELECT b.industry_name FROM $mapping_table as m JOIN $beta_table as b ON m.damodaran_industry_id = b.id WHERE m.ticker = %s", $ticker ));
            $average_unlevered_beta = array_sum($unlevered_betas) / count($unlevered_betas);
            $debug_data['unlevered_beta_avg'] = $average_unlevered_beta;
            
            if (!is_wp_error($balance_sheet) && !empty($balance_sheet['annualReports'])) {
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
            }
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
    // Extract and format data for the new layout
    $ticker = $overview['Symbol'] ?? 'N/A';
    $company_name = $overview['Name'] ?? 'Unknown Company';
    $description = $overview['Description'] ?? 'No company description available.';
    $exchange = $overview['Exchange'] ?? '';
    $website = $overview['Website'] ?? '';
    if ($website && strpos($website, 'http') !== 0) {
        $website = 'http://' . $website;
    }
    
    $quote_data = $quote['Global Quote'] ?? $quote['Global Quote - DATA DELAYED BY 15 MINUTES'] ?? [];
    $stock_price = !empty($quote_data['05. price']) ? (float)$quote_data['05. price'] : 0;
    $price_change = !empty($quote_data['09. change']) ? (float)$quote_data['09. change'] : 0;
    $change_percent = !empty($quote_data['10. change percent']) ? rtrim($quote_data['10. change percent'], '%') : 0;
    $change_class = ($price_change >= 0) ? 'positive' : 'negative';

    $details_col_1 = [
        'Previous Close' => !empty($quote_data['08. previous close']) ? number_format((float)$quote_data['08. previous close'], 2) : 'N/A',
        'Open' => !empty($quote_data['02. open']) ? number_format((float)$quote_data['02. open'], 2) : 'N/A',
        'Day\'s Range' => (!empty($quote_data['04. low']) && !empty($quote_data['03. high'])) ? number_format((float)$quote_data['04. low'], 2) . ' - ' . number_format((float)$quote_data['03. high'], 2) : 'N/A',
        '52 Week Range' => (!empty($overview['52WeekLow']) && !empty($overview['52WeekHigh'])) ? number_format((float)$overview['52WeekLow'], 2) . ' - ' . number_format((float)$overview['52WeekHigh'], 2) : 'N/A',
        'Volume' => !empty($quote_data['06. volume']) ? number_format((float)$quote_data['06. volume']) : 'N/A',
        'Market Cap' => !empty($overview['MarketCapitalization']) ? $this->format_large_number((float)$overview['MarketCapitalization'], '', 2) : 'N/A',
        'Beta (5Y Monthly)' => !empty($overview['Beta']) ? number_format((float)$overview['Beta'], 2) : 'N/A',
    ];
    
    $details_col_2 = [
        'PE Ratio (TTM)' => !empty($overview['PERatio']) ? number_format((float)$overview['PERatio'], 2) : 'N/A',
        'EPS (TTM)' => !empty($overview['EPS']) ? number_format((float)$overview['EPS'], 2) : 'N/A',
        'Shares Outstanding' => !empty($overview['SharesOutstanding']) ? $this->format_large_number((float)$overview['SharesOutstanding'], '', 2) : 'N/A',
        'Forward P/E Ratio' => !empty($overview['ForwardPE']) ? number_format((float)$overview['ForwardPE'], 2) : 'N/A',
        'Forward Dividend & Yield' => (!empty($overview['DividendPerShare']) && !empty($overview['DividendYield'])) ? '$' . number_format((float)$overview['DividendPerShare'], 2) . ' (' . number_format((float)$overview['DividendYield'] * 100, 2) . '%)' : 'N/A',
        'Ex-Dividend Date' => $overview['ExDividendDate'] ?? 'N/A',
        '1y Target Est' => !empty($overview['AnalystTargetPrice']) ? '$' . number_format((float)$overview['AnalystTargetPrice'], 2) : 'N/A',
    ];

    ob_start();
    ?>
    <div class="jtw-content-section" id="section-overview-content">
        
        <div class="jtw-overview-header">
            <div class="jtw-overview-title">
                <h1><?php echo esc_html($company_name); ?> (<?php echo esc_html($exchange . ': ' . $ticker); ?>)</h1>
            </div>
            <div class="jtw-price-info <?php echo esc_attr($change_class); ?>">
                <span class="jtw-price"><?php echo esc_html(number_format($stock_price, 2)); ?></span>
                <span class="jtw-change"><?php echo esc_html(sprintf('%+0.2f', $price_change)); ?> (<?php echo esc_html(sprintf('%+0.2f', $change_percent)); ?>%)</span>
            </div>
        </div>

        <div class="jtw-overview-main-grid">
            <div class="jtw-key-details-grid">
                <div class="jtw-key-details-col">
                    <?php foreach ($details_col_1 as $label => $value): ?>
                        <div class="jtw-detail-item">
                            <span class="jtw-detail-label"><?php echo esc_html($label); ?></span>
                            <span class="jtw-detail-value"><?php echo esc_html($value); ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
                <div class="jtw-key-details-col">
                    <?php foreach ($details_col_2 as $label => $value): ?>
                        <div class="jtw-detail-item">
                            <span class="jtw-detail-label"><?php echo esc_html($label); ?></span>
                            <span class="jtw-detail-value"><?php echo esc_html($value); ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <div class="jtw-ad-placeholder">
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9774689649229443"
                    crossorigin="anonymous"></script>
                <ins class="adsbygoogle"
                    style="display:block"
                    data-ad-client="ca-pub-9774689649229443"
                    data-ad-slot="7297578388"
                    data-ad-format="auto"
                    data-full-width-responsive="true"></ins>
                </div>
        </div>

        <div class="jtw-company-description-wrapper">
             <h4><?php echo esc_html($ticker); ?> Company Overview</h4>
             <div class="jtw-overview-footer-grid">
                <div class="jtw-overview-description-text">
                    <?php if (!empty($description) && strcasecmp(trim($description), 'none') !== 0) : ?>
                        <p><?php echo esc_html($description); ?></p>
                    <?php endif; ?>
                    <?php if ($website): ?>
                        <a href="<?php echo esc_url($website); ?>" target="_blank" rel="noopener noreferrer" class="jtw-website-link"><?php echo esc_url($website); ?></a>
                    <?php endif; ?>

                    <div class="jtw-footer-links">
                        <?php if (!empty($overview['CIK'])): ?>
                            <a href="<?php echo esc_url('https://www.sec.gov/edgar/browse/?CIK=' . $overview['CIK'] . '&owner=exclude'); ?>" target="_blank" rel="noopener noreferrer">Corporate Filings</a>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="jtw-overview-footer-details">
                    <div class="jtw-footer-detail-item">
                        <span class="jtw-detail-label">Sector</span>
                        <span class="jtw-detail-value"><?php echo esc_html($overview['Sector'] ?? 'N/A'); ?></span>
                    </div>
                    <div class="jtw-footer-detail-item">
                        <span class="jtw-detail-label">Industry</span>
                        <span class="jtw-detail-value"><?php echo esc_html($overview['Industry'] ?? 'N/A'); ?></span>
                    </div>
                    <div class="jtw-footer-detail-item">
                        <span class="jtw-detail-label">Latest Earnings Call</span>
                        <span class="jtw-detail-value">
                            <?php 
                                $latest_quarter_date = $overview['LatestQuarter'] ?? null;
                                if ($latest_quarter_date):
                                    $date = new DateTime($latest_quarter_date);
                                    $year = $date->format('Y');
                                    $month = (int)$date->format('m');
                                    $quarter_num = ceil($month / 3);
                                    $quarter_param = $year . 'Q' . $quarter_num;
                            ?>
                                <a href="#" class="jtw-modal-trigger jtw-transcript-trigger" data-modal-target="#jtw-transcript-modal" data-ticker="<?php echo esc_attr($ticker); ?>" data-quarter="<?php echo esc_attr($quarter_param); ?>">View Transcript</a>
                            <?php else: ?>
                                N/A
                            <?php endif; ?>
                        </span>
                    </div>
                    <div class="jtw-footer-detail-item">
                        <span class="jtw-detail-label">Fiscal Year Ends</span>
                        <span class="jtw-detail-value"><?php echo esc_html($overview['FiscalYearEnd'] ?? 'N/A'); ?></span>
                    </div>
                </div>
             </div>
        </div>
        
        <div id="jtw-transcript-modal" class="jtw-modal jtw-fullscreen-modal">
            <div class="jtw-modal-content">
                <span class="jtw-modal-close">&times;</span>
                <div id="jtw-transcript-content-target"></div>
            </div>
        </div>
        <div class="jtw-modal-overlay"></div>
        </div>
    <?php
    return ob_get_clean();
}

// In class-journey-to-wealth-public.php, replace the existing build_case_table_html function.

private function build_case_table_html($group, $args) {
    // Extract the arguments into variables
    extract($args);

    ob_start();
    ?>
    <table class="jtw-assumptions-table jtw-case-table jtw-assumptions-group-<?php echo esc_attr($group); ?>">
        <?php if ($group !== 'valuation'): // Only show the header for non-valuation tables ?>
        <thead>
            <tr>
                <th>Metric</th>
                <th><?php echo esc_html($current_year); ?></th>
                <th><?php echo esc_html($current_year + 1); ?></th>
                <th><?php echo esc_html($current_year + 2); ?></th>
                <th><?php echo esc_html($current_year + 3); ?></th>
                <th><?php echo esc_html($current_year + 4); ?></th>
            </tr>
        </thead>
        <?php endif; ?>
        <tbody>
            <?php if ($group === 'revenue'): ?>
                <tr class="jtw-project-5-year">
                    <td>Revenue Growth</td>
                    <td><?php echo is_numeric($current_year_revenue_growth) ? number_format($current_year_revenue_growth, 1) . '%' : '-'; ?></td>
                    <td><?php echo is_numeric($revenue_growth_next_year) ? number_format($revenue_growth_next_year, 1) . '%' : '-'; ?></td>
                    <?php for ($i = 2; $i < 5; $i++) :
                        $default_growth = is_numeric($revenue_growth_next_year) && $revenue_growth_next_year != 0 ? (float)$revenue_growth_next_year : (is_numeric($current_year_revenue_growth) ? (float)$current_year_revenue_growth : 0);
                    ?>
                    <td>
                        <input type="number" step="0.1" class="jtw-assumption-input jtw-yearly-input" data-metric="yearlyRevGrowth" data-year="<?php echo esc_attr($i); ?>" value="<?php echo esc_attr(number_format($default_growth, 1, '.', '')); ?>">
                    </td>
                    <?php endfor; ?>
                </tr>
                <tr class="jtw-project-5-year">
                    <td class="jtw-revenue-label">Revenue <?php echo esc_html($unit); ?></td>
                    <td class="jtw-revenue-result" data-year="0" data-raw-value="<?php echo esc_attr($analyst_revenue_current_year); ?>"><?php echo number_format($analyst_revenue_current_year / $divisor, 1); ?></td>
                    <td class="jtw-revenue-result" data-year="1" data-raw-value="<?php echo esc_attr($analyst_revenue_next_year); ?>"><?php echo number_format($analyst_revenue_next_year / $divisor, 1); ?></td>
                    <?php for ($i = 2; $i < 5; $i++) { echo '<td class="jtw-revenue-result" data-year="' . esc_attr($i) . '">-</td>'; } ?>
                </tr>
            <?php elseif ($group === 'earnings'): ?>
                <tr class="jtw-project-5-year">
                    <td>Net Income Growth</td>
                    <td><?php echo is_numeric($net_income_growth_current_year) ? number_format($net_income_growth_current_year, 1) . '%' : '-'; ?></td>
                    <td><?php echo is_numeric($net_income_growth_next_year) ? number_format($net_income_growth_next_year, 1) . '%' : '-'; ?></td>
                    <?php for ($i = 2; $i < 5; $i++) : ?>
                    <td>
                        <input type="number" step="0.1" class="jtw-assumption-input jtw-yearly-input" data-metric="yearlyNIGrowth" data-year="<?php echo esc_attr($i); ?>" value="<?php echo esc_attr(is_numeric($net_income_growth_next_year) ? number_format($net_income_growth_next_year, 1, '.', '') : '0.0'); ?>">
                    </td>
                    <?php endfor; ?>
                </tr>
                <tr class="jtw-project-5-year">
                    <td>Net Income <?php echo esc_html($unit); ?></td>
                    <td class="jtw-net-income-result" data-year="0" data-raw-value="<?php echo esc_attr($current_year_net_income); ?>"><?php echo number_format($current_year_net_income / $divisor, 1); ?></td>
                    <td class="jtw-net-income-result" data-year="1" data-raw-value="<?php echo esc_attr($net_income_next_year); ?>"><?php echo number_format($net_income_next_year / $divisor, 1); ?></td>
                    <?php for ($i = 2; $i < 5; $i++) { echo '<td class="jtw-net-income-result" data-year="' . esc_attr($i) . '">-</td>'; } ?>
                </tr>
                <tr class="jtw-project-5-year">
                    <td>Net Income Margin</td>
                    <td class="jtw-net-income-margin-result" data-year="0"><?php echo ($analyst_revenue_current_year > 0) ? number_format(($current_year_net_income / $analyst_revenue_current_year) * 100, 1) . '%' : '0.0%'; ?></td>
                    <td class="jtw-net-income-margin-result" data-year="1"><?php echo ($analyst_revenue_next_year > 0) ? number_format(($net_income_next_year / $analyst_revenue_next_year) * 100, 1) . '%' : '0.0%'; ?></td>
                    <?php for ($i = 2; $i < 5; $i++) { echo '<td class="jtw-net-income-margin-result" data-year="' . esc_attr($i) . '">-</td>'; } ?>
                </tr>
                <tr class="jtw-project-5-year">
                    <td>EPS</td>
                    <td class="jtw-eps-result" data-year="0"><?php echo number_format($current_year_eps, 2); ?></td>
                    <td class="jtw-eps-result" data-year="1"><?php echo number_format($analyst_eps_next_year, 2); ?></td>
                    <?php for ($i = 2; $i < 5; $i++) { echo '<td class="jtw-eps-result" data-year="' . esc_attr($i) . '">-</td>'; } ?>
                </tr>
                <tr class="jtw-project-5-year">
                    <td>P/E</td>
                    <td class="jtw-pe-result" data-year="0"><?php echo is_numeric($current_year_pe) ? number_format($current_year_pe, 1) : 'N/A'; ?></td>
                    <td class="jtw-pe-input-cell" data-year="1"><input type="number" step="0.1" class="jtw-assumption-input jtw-pe-input" data-year="1" value="<?php echo esc_attr(is_numeric($next_year_pe) ? number_format($next_year_pe, 1, '.', '') : '20.0'); ?>"></td>
                    <?php 
                    $default_pe = is_numeric($next_year_pe) ? number_format($next_year_pe, 1, '.', '') : '20.0';
                    for ($i = 2; $i < 5; $i++) { echo '<td class="jtw-pe-input-cell" data-year="' . esc_attr($i) . '"><input type="number" step="0.1" class="jtw-assumption-input jtw-pe-input" data-year="' . esc_attr($i) . '" value="' . esc_attr($default_pe) . '"></td>'; }
                    ?>
                </tr>
            <?php elseif ($group === 'valuation'): ?>
                 <tr class="jtw-metric-group-header jtw-result-header-row jtw-project-5-year">
                    <td>Multiple of Earnings Valuation</td>
                    <td class="jtw-moe-result-cell" data-year="0">
                        <?php
                            if (is_numeric($current_year_eps) && is_numeric($current_year_pe)) {
                                echo '$' . number_format($current_year_eps * $current_year_pe, 2);
                            } else {
                                echo '-';
                            }
                        ?>
                    </td>
                    <td class="jtw-moe-result-cell" data-year="1">-</td>
                    <?php for ($i = 2; $i < 5; $i++) { echo '<td class="jtw-moe-result-cell" data-year="' . esc_attr($i) . '">-</td>'; } ?>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
    <?php
    return ob_get_clean();
}

private function build_intrinsic_valuation_section_html($valuation_data, $valuation_summary, $details, $calculated_data) {
    // --- START: MODIFIED TO RECEIVE FULL $calculated_data OBJECT ---
    $dcf_result_for_ui = $calculated_data['ui_valuation_breakdown'] ?? null;
    $key_metrics = $calculated_data['key_metrics'] ?? [];
    $historical_ratios_data = $calculated_data['historical_ratios_data'] ?? []; // Get new data
    $analyst_estimates = $calculated_data['analyst_estimates'] ?? []; // <-- THIS LINE WAS MISSING
    // --- END: MODIFIED TO RECEIVE FULL $calculated_data OBJECT ---

    $dcf_result_data = $dcf_result_for_ui['calculation_breakdown'] ?? null;

    if (is_null($dcf_result_data)) {
        $first_model_key = key($valuation_data);
        $first_model_result = reset($valuation_data);
        if (!$first_model_result || isset($first_model_result['error'])) {
             return '<div class="jtw-content-section"><p>Could not generate valuation projection tables. Required data is missing or contains an error.</p></div>';
        }
        $dcf_result_data = $first_model_result['calculation_breakdown'];
    }
    
    $component_ratios_json = isset($dcf_result_for_ui['calculation_breakdown']['component_ratios']['projection_ratios']) ? esc_attr(json_encode($dcf_result_for_ui['calculation_breakdown']['component_ratios']['projection_ratios'])) : '[]';
    $shares_outstanding = $dcf_result_data['shares_outstanding'] ?? 0;
    $modal_id = 'jtw-assumptions-modal';

    ob_start();
    ?>
    <div id="section-intrinsic-valuation-content" class="jtw-content-section" data-ratios='<?php echo $component_ratios_json; ?>' data-current-price="<?php echo esc_attr($valuation_summary['current_price']); ?>" data-shares-outstanding="<?php echo esc_attr($shares_outstanding); ?>" data-ticker="<?php echo esc_attr($details['Symbol'] ?? ''); ?>">
        
        <div class="jtw-section-header">
            <h4><?php esc_html_e('1. Valuation', 'journey-to-wealth'); ?></h4>
            <div class="jtw-header-controls">
                <button class="jtw-modal-trigger jtw-view-assumptions-btn" data-modal-target="#<?php echo esc_attr($modal_id); ?>">View Assumptions</button>
            </div>
        </div>

        <div class="jtw-sws-header">
            <h2>1.1 Share Price vs Fair Value</h2>
            <p>What is the Fair Price of <span class="jtw-sws-ticker"></span> when looking at its future cash flows? For this estimate we use a <span class="jtw-sws-model-name">Discounted Cash Flow</span> model.</p>
        </div>

        <div class="jtw-valuation-tables-wrapper" style="display: none;">
            <?php
            // Create an arguments array to pass to the table builder
            $table_args = []; // Populate with all necessary variables
            $analyst_revenue_current_year = $dcf_result_for_ui['calculation_breakdown']['analyst_revenue_current_year'] ?? 0;
            $current_year_revenue_growth = ($dcf_result_for_ui['calculation_breakdown']['current_year_revenue_growth'] ?? 0) * 100;
            $net_income_growth_current_year = ($dcf_result_for_ui['calculation_breakdown']['net_income_growth_current_year'] ?? 0) * 100;
            $analyst_revenue_next_year = $dcf_result_for_ui['calculation_breakdown']['analyst_revenue_next_year'] ?? 0;
            $revenue_growth_next_year = ($dcf_result_for_ui['calculation_breakdown']['revenue_growth_next_year'] ?? 0) * 100;
            $net_income_next_year = $dcf_result_for_ui['calculation_breakdown']['net_income_next_year'] ?? 0;
            $net_income_growth_next_year = ($dcf_result_for_ui['calculation_breakdown']['net_income_growth_next_year'] ?? 0) * 100;
            $analyst_eps_next_year = $dcf_result_for_ui['calculation_breakdown']['analyst_eps_next_year'] ?? 0;
            $current_year_net_income = $dcf_result_for_ui['calculation_breakdown']['net_income_current_year'] ?? 0;
            $current_year_eps = $dcf_result_for_ui['calculation_breakdown']['analyst_eps_current_year'] ?? 0;
            $current_year = date('Y');
            $unit = ''; $divisor = 1;
            if (abs($analyst_revenue_current_year) >= 1.0e+9) { $unit = '(Billions)'; $divisor = 1.0e+9; } 
            elseif (abs($analyst_revenue_current_year) >= 1.0e+6) { $unit = '(Millions)'; $divisor = 1.0e+6; }
            $current_year_pe = ($current_year_eps > 0) ? $valuation_summary['current_price'] / $current_year_eps : 'N/A';
            $next_year_pe = ($analyst_eps_next_year > 0) ? $valuation_summary['current_price'] / $analyst_eps_next_year : 'N/A';
            $available_models = [ 'dcf' => 'Discounted Cash Flow', 'affo' => 'AFFO Model', 'excess_return' => 'Excess Return Model' ];
            if (isset($details['DividendPerShare']) && (float)$details['DividendPerShare'] > 0) { $available_models['ddm'] = 'Dividend Discount Model'; }
            $table_args = compact('current_year', 'current_year_revenue_growth', 'analyst_revenue_current_year', 'divisor', 'unit', 'current_year_net_income', 'net_income_growth_current_year', 'current_year_eps', 'current_year_pe', 'analyst_revenue_next_year', 'revenue_growth_next_year', 'net_income_next_year', 'net_income_growth_next_year', 'analyst_eps_next_year', 'next_year_pe');
            
            echo $this->build_case_table_html('revenue', $table_args);
            ?>
        </div>

        <div class="jtw-sws-valuation-container" style="display: none;">
            <div class="jtw-sws-main-metric">
                <div class="jtw-sws-percentage">-%</div>
                <div class="jtw-sws-status">Calculating...</div>
            </div>
            <div class="jtw-sws-chart">
                 <div class="jtw-sws-zone-bar-row">
                    <div class="jtw-sws-zone-bar">
                        <div class="jtw-sws-zone undervalued"><span class="jtw-zone-label">20% Undervalued</span></div>
                        <div class="jtw-sws-zone about-right"><span class="jtw-zone-label">About Right</span></div>
                        <div class="jtw-sws-zone overvalued"><span class="jtw-zone-label">20% Overvalued</span></div>
                    </div>
                </div>
                <div class="jtw-sws-bar-row current-price-row">
                    <div class="jtw-sws-bar-wrapper">
                        <div class="jtw-sws-label-group">
                            <span>Current Price</span>
                            <strong>$0.00</strong>
                        </div>
                    </div>
                </div>
                <div class="jtw-sws-bar-row fair-value-row">
                     <div class="jtw-sws-bar-wrapper">
                        <div class="jtw-sws-label-group">
                            <span>Fair Value</span>
                            <strong>$0.00</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="jtw-valuation-tables-wrapper" style="display: none;">
            <div class="jtw-sws-header">
                <h2>1.2 Multiple of Earnings</h2>
            </div>
            <?php
            echo $this->build_case_table_html('earnings', $table_args);
            echo $this->build_case_table_html('valuation', $table_args);
            ?>
        </div>
        <div class="jtw-sws-header">
             <h2>1.3 Analyst Forward Estimate</h2>
        </div>
        <?php
        if (!empty($analyst_estimates) && $analyst_estimates['total_analysts'] > 0) {
            $target_price = $analyst_estimates['analyst_target_price'];
            $total_analysts = $analyst_estimates['total_analysts'];
            $current_price = $valuation_summary['current_price'];
            
            $fair_value_text = '';
            $fair_value_class = '';
            if (is_numeric($target_price) && is_numeric($current_price) && $current_price > 0) {
                $difference_percent = (($target_price - $current_price) / $current_price) * 100;
                if ($difference_percent > 5) {
                    $fair_value_text = abs(round($difference_percent)) . '% undervalued';
                    $fair_value_class = 'jtw-fair-value-undervalued';
                } else if ($difference_percent < -5) {
                    $fair_value_text = abs(round($difference_percent)) . '% overvalued';
                    $fair_value_class = 'jtw-fair-value-overvalued';
                } else {
                    $fair_value_text = 'Fairly Valued';
                    $fair_value_class = 'jtw-fair-value-neutral';
                }
            }

            $strong_buy_percent = ($analyst_estimates['strong_buy'] / $total_analysts) * 100;
            $buy_percent = ($analyst_estimates['buy'] / $total_analysts) * 100;
            $hold_percent = ($analyst_estimates['hold'] / $total_analysts) * 100;
            $sell_percent = ($analyst_estimates['sell'] / $total_analysts) * 100;
            $strong_sell_percent = ($analyst_estimates['strong_sell'] / $total_analysts) * 100;
        ?>
        <div class="jtw-analyst-estimates-container">
            <div class="jtw-analyst-summary">
                <div class="jtw-analyst-target">
                    <div class="jtw-value"><?php echo esc_html($target_price ? '$' . number_format($target_price, 2) : 'N/A'); ?></div>
                    <div class="jtw-label">Analyst Fair Price</div>
                </div>
                <div class="jtw-analyst-count">
                    <div class="jtw-value"><?php echo esc_html($total_analysts); ?></div>
                    <div class="jtw-label">Number of Analysts</div>
                </div>
            </div>
            <?php if ($fair_value_text): ?>
                <div class="jtw-analyst-fair-value-text <?php echo esc_attr($fair_value_class); ?>">
                    <?php echo esc_html($fair_value_text); ?>
                </div>
            <?php endif; ?>
            <div class="jtw-analyst-ratings-bar">
                <div class="jtw-rating-segment strong-sell" style="width: <?php echo $strong_sell_percent; ?>%;" title="<?php echo esc_attr($analyst_estimates['strong_sell']); ?> Strong Sell"></div>
                <div class="jtw-rating-segment sell" style="width: <?php echo $sell_percent; ?>%;" title="<?php echo esc_attr($analyst_estimates['sell']); ?> Sell"></div>
                <div class="jtw-rating-segment hold" style="width: <?php echo $hold_percent; ?>%;" title="<?php echo esc_attr($analyst_estimates['hold']); ?> Hold"></div>
                <div class="jtw-rating-segment buy" style="width: <?php echo $buy_percent; ?>%;" title="<?php echo esc_attr($analyst_estimates['buy']); ?> Buy"></div>
                <div class="jtw-rating-segment strong-buy" style="width: <?php echo $strong_buy_percent; ?>%;" title="<?php echo esc_attr($analyst_estimates['strong_buy']); ?> Strong Buy"></div>
            </div>
        </div>
        <?php } else { ?>
            <div class="jtw-notice notice-info"><p>Analyst estimate data is not available for this stock.</p></div>
        <?php } ?>
        <div class="jtw-sws-header">
             <h2>1.4 Historical Price to Earnings Ratio</h2>
             <p>Historical Price to Earnings Ratio compares a stock’s price to its earnings over time. Higher ratios indicate that investors are willing to pay more for the stock.</p>
        </div>
        <div id="section-key-metric-valuations-content">
            <?php if (!empty($historical_ratios_data)):
                $metrics = [
                    'pe_ratio' => 'Price to Earnings', 'ps_ratio' => 'Price to Sales', 'pb_ratio' => 'Price to Book',
                    'ev_to_revenue' => 'EV/Revenue', 'ev_to_ebitda' => 'EV/EBITDA',
                ];
                $key_metric_map = [
                    'pe_ratio' => 'PERatio', 'ps_ratio' => 'PriceToSalesRatioTTM', 'pb_ratio' => 'PriceToBookRatio',
                    'ev_to_revenue' => 'EVToRevenue', 'ev_to_ebitda' => 'EVToEBITDA',
                ];
            ?>
                <div class="jtw-kmv-controls">
                    <div class="jtw-kmv-metric-selector-wrapper">
                        <select id="jtw-kmv-metric-selector">
                            <?php foreach ($metrics as $key => $label): ?>
                                <option value="<?php echo esc_attr($key); ?>" data-key-metric-key="<?php echo esc_attr($key_metric_map[$key]); ?>"><?php echo esc_html($label); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="jtw-kmv-current-value" style="display: none;">
                        <div class="jtw-sws-percentage">0.0x</div>
                        <div class="jtw-sws-status">Current P/E Ratio</div>
                    </div>
                    <div class="jtw-kmv-time-toggles">
                        <button class="jtw-kmv-time-btn" data-range="3M">3M</button>
                        <button class="jtw-kmv-time-btn active" data-range="1Y">1Y</button>
                        <button class="jtw-kmv-time-btn" data-range="3Y">3Y</button>
                        <button class="jtw-kmv-time-btn" data-range="5Y">5Y</button>
                    </div>
                </div>
                <div class="jtw-kmv-chart-container">
                    <canvas id="jtw-kmv-chart"></canvas>
                </div>
                <script type="application/json" id="jtw-historical-ratios-data"><?php echo json_encode($historical_ratios_data); ?></script>
                <script type="application/json" id="jtw-current-key-metrics-data"><?php echo json_encode($key_metrics); ?></script>
            <?php else: ?>
                <div class="jtw-notice notice-info"><p>Historical ratio data is not available for this stock.</p></div>
            <?php endif; ?>
        </div>

        <div class="jtw-valuation-loader" style="display: flex; justify-content: center; padding: 50px 0;"><div class="jtw-loading-spinner"></div></div>
        <div id="<?php echo esc_attr($modal_id); ?>" class="jtw-modal"><div class="jtw-modal-content"><span class="jtw-modal-close">&times;</span></div></div>
        <div class="jtw-modal-overlay"></div>
    </div>
    <?php
    return ob_get_clean();
}

private function build_key_metric_valuations_section_html($ratios_data, $key_metrics) {
    if (empty($ratios_data)) {
        return ''; // Don't render the section if there's no data
    }

    $metrics = [
        'pe_ratio' => 'Price to Earnings',
        'ps_ratio' => 'Price to Sales',
        'pb_ratio' => 'Price to Book',
        'ev_to_revenue' => 'EV/Revenue',
        'ev_to_ebitda' => 'EV/EBITDA',
    ];

    $key_metric_map = [
        'pe_ratio' => 'PERatio',
        'ps_ratio' => 'PriceToSalesRatioTTM',
        'pb_ratio' => 'PriceToBookRatio',
        'ev_to_revenue' => 'EVToRevenue',
        'ev_to_ebitda' => 'EVToEBITDA',
    ];

    ob_start();
    ?>
    <div id="section-key-metric-valuations-content" class="jtw-content-section">
        <div class="jtw-kmv-header">
            <div class="jtw-kmv-title">
                <h2>1.3 Historical Price to Earnings Ratio</h2>
                <p>Historical Price to Earnings Ratio compares a stock’s price to its earnings over time. Higher ratios indicate that investors are willing to pay more for the stock.</p>
            </div>
            <div class="jtw-kmv-current-value" style="display: none;">
                <div class="jtw-sws-percentage">0.0x</div>
                <div class="jtw-sws-status">Current P/E Ratio</div>
            </div>
        </div>
        <div class="jtw-kmv-controls">
            <div class="jtw-kmv-metric-selector-wrapper">
                <select id="jtw-kmv-metric-selector">
                    <?php foreach ($metrics as $key => $label): ?>
                        <option value="<?php echo esc_attr($key); ?>" data-key-metric-key="<?php echo esc_attr($key_metric_map[$key]); ?>"><?php echo esc_html($label); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="jtw-kmv-time-toggles">
                <button class="jtw-kmv-time-btn" data-range="3M">3M</button>
                <button class="jtw-kmv-time-btn active" data-range="1Y">1Y</button>
                <button class="jtw-kmv-time-btn" data-range="3Y">3Y</button>
                <button class="jtw-kmv-time-btn" data-range="5Y">5Y</button>
            </div>
        </div>
        <div class="jtw-kmv-chart-container">
            <canvas id="jtw-kmv-chart"></canvas>
        </div>
    </div>
    <script type="application/json" id="jtw-historical-ratios-data">
        <?php echo json_encode($ratios_data); ?>
    </script>
     <script type="application/json" id="jtw-current-key-metrics-data">
        <?php echo json_encode($key_metrics); ?>
    </script>
    <?php
    return ob_get_clean();
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
                    // --- START: UPDATED METRIC GROUPS ---
                    $metric_groups = [
                        'Relative Valuation' => [
                            'PERatio' => ['label' => 'TTM P/E Ratio', 'suffix' => 'x'], 
                            'ForwardPE' => ['label' => 'Forward P/E Ratio', 'suffix' => 'x'], 
                            'PriceToBookRatio' => ['label' => 'P/B Ratio', 'suffix' => 'x'], 
                            'PriceToSalesRatioTTM' => ['label' => 'P/S Ratio', 'suffix' => 'x'],
                            'pegRatio' => ['label' => 'PEG Ratio', 'suffix' => 'x'],
                            'pegyRatio' => ['label' => 'PEGY Ratio', 'suffix' => 'x']
                        ],
                        'Growth Analysis' => [ 
                            'ttmEpsGrowth' => ['label' => 'TTM EPS Growth', 'suffix' => '%'], 
                            'nextYearEpsGrowth' => ['label' => 'Next Year EPS Growth (Est)', 'suffix' => '%'],
                            'ttmRevenueGrowth' => ['label' => 'TTM Revenue Growth', 'suffix' => '%'],
                            'nextYearRevenueGrowth' => ['label' => 'Next Year Revenue Growth (Est)', 'suffix' => '%']
                        ],
                        'Profitability' => [
                            'grossMargin' => ['label' => 'Gross Margin', 'suffix' => '%'], 
                            'netMargin' => ['label' => 'Net Margin', 'suffix' => '%'], 
                            'returnOnEquityTTM' => ['label' => 'Return on Equity', 'suffix' => '%'], 
                            'returnOnCapitalTTM' => ['label' => 'Return on Capital', 'suffix' => '%']
                        ],
                    ];
                    // --- END: UPDATED METRIC GROUPS ---
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
                'revenue' => ['title' => 'Revenue', 'type' => 'bar', 'prefix' => '$', 'colors' => '["#ffd700"]'], // Example color added for consistency
                'net_income' => ['title' => 'Net Income', 'type' => 'bar', 'prefix' => '$', 'colors' => '["#ffd700"]'], // Example color added for consistency
                'ebitda' => ['title' => 'EBITDA', 'type' => 'bar', 'prefix' => '$', 'colors' => '["#7ed321"]'], // Example color added for consistency
                'fcf' => ['title' => 'Free Cash Flow', 'type' => 'bar', 'prefix' => '$', 'colors' => '["#4a90e2"]'], // Example color added for consistency
                'cash-and-debt' => ['title' => 'Cash & Debt', 'type' => 'bar', 'prefix' => '$', 'colors' => '["#f5a623", "#d0021b"]'], // Updated colors for Cash & Debt
                'expenses' => [
                    'title' => 'Expenses', 
                    'type' => 'bar', 
                    'prefix' => '$', 
                    'stacked' => true, // <-- NEW: This makes it a stacked bar chart
                    'colors' => '["#f5a623", "#f8e71c", "#d0021b"]' // <-- NEW: Specific colors from the image (orange, yellow, red)
                ],
                'dividend' => ['title' => 'Dividend Per Share', 'type' => 'bar', 'prefix' => '$', 'colors' => '["#bd10e0"]'], // Example color added for consistency
                'shares_outstanding' => ['title' => 'Shares Outstanding', 'type' => 'bar', 'prefix' => '', 'colors' => '["#50e3c2"]'], // Example color added for consistency
                'eps' => ['title' => 'EPS', 'type' => 'bar', 'prefix' => '$', 'colors' => '["#ffd700"]'] // Example color added for consistency
            ];
            foreach ($chart_configs as $key => $config) {
                $annual_data = $historical_data['annual'][$key] ?? [];
                $quarterly_data = $historical_data['quarterly'][$key] ?? [];
                $chart_id = 'chart-' . uniqid();
                
                // Set colors attribute if it exists in the config
                $colors_attr = isset($config['colors']) ? "data-colors='" . esc_attr($config['colors']) . "'" : '';
                $stacked_attr = isset($config['stacked']) && $config['stacked'] ? "data-stacked='true'" : ''; // <-- NEW: Add stacked attribute

                echo '<div class="jtw-chart-item">';
                echo '<h5>' . esc_html($config['title']) . '</h5><div class="jtw-chart-wrapper"><canvas id="' . esc_attr($chart_id) . '"></canvas></div>';
                echo "<script type='application/json' class='jtw-chart-data' data-chart-id='" . esc_attr($chart_id) . "' data-chart-type='" . esc_attr($config['type']) . "' data-prefix='" . esc_attr($config['prefix']) . "' " . $colors_attr . " " . $stacked_attr . " data-annual='" . esc_attr(json_encode($annual_data)) . "' data-quarterly='" . esc_attr(json_encode($quarterly_data)) . "'></script>";
                echo '</div>';
            }
            ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

private function build_earnings_revenue_forecasts_html($forecast_data) {
    ob_start();
    ?>
    <div class="jtw-content-section" id="section-performance-content">
        <div class="jtw-section-header">
            <h4>2. Performance</h4>
        </div>

        <div class="jtw-sws-header">
            <h2>2.1 Earnings and Revenue Growth Forecasts</h2>
        </div>
        
        <?php if (empty($forecast_data) || (empty($forecast_data['chart_points_revenue']) && empty($forecast_data['chart_points_earnings']))) { ?>
            <div class="jtw-notice notice-info"><p>Earnings and Revenue forecast data is not available for this stock.</p></div>
        <?php } else { 
            $latest_date_str = $forecast_data['latest_data_date'] ?? 'N/A';
            $latest_revenue = $forecast_data['latest_revenue'] ?? null;
            $latest_earnings = $forecast_data['latest_earnings'] ?? null;
        ?>
            <div class="jtw-chart-card">
                <div class="jtw-chart-header">
                    <div class="jtw-chart-latest-data">
                        <div class="jtw-chart-data-date"><?php echo esc_html(date('M d, Y', strtotime($latest_date_str))); ?></div>
                        <div class="jtw-chart-data-row">
                            <span class="jtw-label">Revenue</span>
                            <span class="jtw-value"><?php echo $latest_revenue !== null ? 'US$' . $this->format_large_number($latest_revenue, '', 2) . '/yr' : '-'; ?></span>
                        </div>
                        <div class="jtw-chart-data-row">
                            <span class="jtw-label">Earnings</span>
                            <span class="jtw-value"><?php echo $latest_earnings !== null ? 'US$' . $this->format_large_number($latest_earnings, '', 2) . '/yr' : '-'; ?></span>
                        </div>
                    </div>
                </div>
                <div class="jtw-chart-container jtw-revenue-earnings-chart-container">
                    <canvas id="jtw-earnings-revenue-forecast-chart"></canvas>
                    <script type="application/json" id="jtw-earnings-revenue-forecast-data">
                        <?php echo json_encode([
                            'revenue' => $forecast_data['chart_points_revenue'],
                            'earnings' => $forecast_data['chart_points_earnings'],
                        ]); ?>
                    </script>
                </div>
                <div class="jtw-chart-legend">
                    <span class="legend-item"><span class="legend-color revenue"></span> Revenue</span>
                    <span class="legend-item"><span class="legend-color earnings"></span> Earnings</span>
                </div>
            </div>
        <?php } ?>
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
        if(empty($data)) return '<p class="jtw-left-align">Detailed breakdown is not available.</p>';

        $intrinsic_value = $result['intrinsic_value_per_share'] ?? null;
        $current_price = $data['current_price'] ?? 0;
        
        $d_rate_calc = $data['discount_rate_calc'] ?? [];
        $beta_details = $d_rate_calc['beta_details'] ?? [];
        $inputs = $data['inputs'] ?? [];
        $ttm_components = $data['ttm_components'] ?? []; // This now contains the new structure
        $projection_table = $data['projection_table'] ?? [];
        $last_projection = !empty($projection_table) ? end($projection_table) : [];
        $last_projected_fcfe = $last_projection['cf'] ?? 0;
        $sum_of_pv_cfs = $data['sum_of_pv_cfs'] ?? 0;
        $terminal_value = $data['terminal_value'] ?? 0;
        $pv_of_terminal_value = $data['pv_of_terminal_value'] ?? 0;
        $total_equity_value = $data['total_equity_value'] ?? 0;
        $shares_outstanding = $data['shares_outstanding'] ?? 0;
        
        $discount_pct = 0;
        if (is_numeric($intrinsic_value) && $intrinsic_value > 0) {
            $discount_pct = (($intrinsic_value - $current_price) / $intrinsic_value) * 100;
        }

        ob_start();
        ?>
        <h4 class="jtw-modal-title">Intrinsic Value Calculation for <?php echo esc_html( $data['model_name'] ?? 'DCF' ); ?></h4>

        <div class="jtw-modal-stage">
            <h5 class="jtw-modal-subtitle">Stage 1: Inputs</h5>
            <table class="jtw-sws-modal-table">
                <thead><tr><th>Data Point</th><th>Source</th><th>Value</th></tr></thead>
                <tbody>
                    <tr><td>Valuation Model</td><td>2 Stage Free Cash Flow to Equity</td><td></td></tr>
                    <tr><td>Levered Free Cash Flow</td><td>Analyst Estimates & Model Projections</td><td>See below</td></tr>
                    <tr><td>Discount Rate (Cost of Equity)</td><td>See below</td><td><?php echo is_numeric($inputs['discount_rate']) ? number_format($inputs['discount_rate'] * 100, 1) . '%' : 'N/A'; ?></td></tr>
                    <tr><td>Perpetual Growth Rate</td><td><?php echo esc_html($d_rate_calc['risk_free_rate_source']); ?></td><td><?php echo is_numeric($inputs['terminal_growth_rate']) ? number_format($inputs['terminal_growth_rate'] * 100, 1) . '%' : 'N/A'; ?></td></tr>
                </tbody>
            </table>
        </div>

        <div class="jtw-modal-stage">
            <h5 class="jtw-modal-subtitle">Stage 2: Discount Rate (Cost of Equity) Calculation</h5>
            <table class="jtw-sws-modal-table">
                <thead><tr><th>Data Point</th><th>Calculation / Source</th><th>Result</th></tr></thead>
                <tbody>
                    <tr><td>Risk-Free Rate</td><td><?php echo esc_html($d_rate_calc['risk_free_rate_source']); ?></td><td><?php echo number_format(($d_rate_calc['risk_free_rate'] ?? 0) * 100, 1) . '%'; ?></td></tr>
                    <tr><td>Equity Risk Premium</td><td><?php echo esc_html($d_rate_calc['erp_source']); ?></td><td><?php echo number_format(($d_rate_calc['equity_risk_premium'] ?? 0) * 100, 2) . '%'; ?></td></tr>
                    <tr><td>Unlevered Beta</td><td>Damodaran Industry Data</td><td><?php echo number_format($beta_details['unlevered_beta_avg'] ?? 0, 3); ?></td></tr>
                    <tr><td>Re-levered Beta</td><td><div class="jtw-formula"><?php echo esc_html($beta_details['relevered_beta_calc'] ?? 'Formula Unavailable'); ?></div></td><td><?php echo number_format($beta_details['unconstrained_levered_beta'] ?? 0, 3); ?></td></tr>
                    <tr><td>Levered Beta</td><td>Levered Beta limited to 0.8 to 2.0</td><td><?php echo number_format($beta_details['levered_beta'] ?? 0, 3); ?></td></tr>
                    <tr>
                        <td>Discount Rate/ Cost of Equity</td>
                        <td><div class="jtw-formula">= Risk Free Rate + (Levered Beta * Equity Risk Premium)</div><div class="jtw-formula-vals">= <?php echo number_format(($d_rate_calc['risk_free_rate'] ?? 0) * 100, 2) . '% + (' . number_format($beta_details['levered_beta'] ?? 0, 3) . ' * ' . number_format(($d_rate_calc['equity_risk_premium'] ?? 0) * 100, 2) . '%)'; ?></div></td>
                        <td><?php echo number_format(($inputs['discount_rate'] ?? 0) * 100, 3) . '%'; ?></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="jtw-modal-stage">
            <h5 class="jtw-modal-subtitle">Stage 3: Base FCFE Calculation (Next Year Projection)</h5>
            <p class="jtw-formula-display"><strong>Formula:</strong> FCFE = Net Income + D&A - CapEx - Δ NWC + Net Borrowing</p>
            <table class="jtw-sws-modal-table">
                <thead>
                    <tr>
                        <th>Projected Component</th>
                        <th style="text-align: right;">Source / TTM Ratio</th>
                        <th style="text-align: right;">Value (USD, Millions)</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $component_map = [
                        'net_income' => 'Net Income',
                        'depreciation' => '(+) Depreciation & Amortization',
                        'capex' => '(-) Capital Expenditures (CapEx)',
                        'delta_nwc' => '(-) Change in Net Working Capital',
                        'net_borrowing' => '(+) Net Borrowing'
                    ];

                    foreach ($component_map as $key => $label) {
                        $component_data = $ttm_components[$key] ?? ['value' => 0, 'source' => 'N/A'];
                        $source_display = is_numeric($component_data['source']) ? number_format($component_data['source'] * 100, 1) . '%' : esc_html($component_data['source']);
                        ?>
                        <tr>
                            <td><?php echo esc_html($label); ?></td>
                            <td><?php echo $source_display; ?></td>
                            <td>$<?php echo number_format($component_data['value'] ?? 0, 2); ?></td>
                        </tr>
                        <?php
                    }
                    ?>
                    <tr class="jtw-table-total-row">
                        <td colspan="2"><strong>= Base FCFE for Projection</strong></td>
                        <td><strong>$<?php echo number_format($inputs['base_cash_flow'] ?? 0, 2); ?></strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="jtw-modal-stage">
             <h5 class="jtw-modal-subtitle">Stage 4: 10-Year Levered FCF Projections</h5>
             <table class="jtw-sws-modal-table">
                <thead><tr><th>Year</th><th>Levered FCF (USD, Millions)</th><th>Source</th><th>Present Value (Discounted @ <?php echo number_format(($inputs['discount_rate'] ?? 0) * 100, 2) . '%'; ?>)</th></tr></thead>
                <tbody>
                    <?php foreach ($projection_table as $index => $row): ?>
                    <tr>
                        <td><?php echo esc_html($row['year']); ?></td>
                        <td>$<?php echo number_format($row['cf'], 2); ?></td>
                        <td><?php echo esc_html($row['growth_rate']); ?></td>
                        <td>$<?php echo number_format($row['pv_cf'], 2); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
                <tfoot>
                    <tr class="jtw-table-total-row">
                        <td colspan="3"><strong>Sum of Present Values (Stage 1 Total)</strong></td>
                        <td><strong>$<?php echo number_format($sum_of_pv_cfs, 2); ?></strong></td>
                    </tr>
                </tfoot>
             </table>
        </div>

        <div class="jtw-modal-stage">
             <h5 class="jtw-modal-subtitle">Stage 5: Terminal Value Calculation</h5>
             <table class="jtw-sws-modal-table">
                 <thead><tr><th></th><th>Calculation</th><th>Result</th></tr></thead>
                 <tbody>
                    <tr>
                        <td>Terminal Value</td>
                        <td><div class="jtw-formula">= FCF<sub><?php echo esc_html($last_projection['year'] ?? 'Final'); ?></sub> &times; (1 + g) &divide; (r - g)</div><div class="jtw-formula-vals">= $<?php echo number_format($last_projected_fcfe, 0); ?>M &times; (1 + <?php echo number_format(($inputs['terminal_growth_rate'] ?? 0) * 100, 2); ?>%) &divide; (<?php echo number_format(($inputs['discount_rate'] ?? 0) * 100, 2) . '% - ' . number_format(($inputs['terminal_growth_rate'] ?? 0) * 100, 2); ?>%)</div></td>
                        <td>$<?php echo number_format($terminal_value, 2); ?></td>
                    </tr>
                    <tr>
                        <td>Present Value of Terminal Value</td>
                        <td><div class="jtw-formula">= Terminal Value &divide; (1 + r)<sup>10</sup></div><div class="jtw-formula-vals">= $<?php echo number_format($terminal_value, 0); ?>M &divide; (1 + <?php echo number_format(($inputs['discount_rate'] ?? 0) * 100, 2); ?>%)<sup>10</sup></div></td>
                        <td>$<?php echo number_format($pv_of_terminal_value, 2); ?></td>
                    </tr>
                 </tbody>
             </table>
        </div>

        <div class="jtw-modal-stage">
             <h5 class="jtw-modal-subtitle">Stage 6: Equity Value & Final Result</h5>
             <table class="jtw-sws-modal-table">
                <thead><tr><th></th><th>Calculation</th><th>Result</th></tr></thead>
                 <tbody>
                    <tr>
                        <td>Total Equity Value</td>
                        <td><div class="jtw-formula">= PV of 10Y FCF + PV of Terminal Value</div><div class="jtw-formula-vals">= $<?php echo number_format($sum_of_pv_cfs, 0); ?>M + $<?php echo number_format($pv_of_terminal_value, 0); ?>M</div></td>
                        <td>$<?php echo number_format($total_equity_value, 2); ?></td>
                    </tr>
                    <tr>
                        <td>Value per Share</td>
                        <td><div class="jtw-formula">= Total Equity Value &divide; Shares Outstanding</div><div class="jtw-formula-vals">= $<?php echo number_format($total_equity_value, 0); ?>M &divide; <?php echo number_format($shares_outstanding, 0); ?></div></td>
                        <td><?php echo is_numeric($intrinsic_value) ? '$' . number_format($intrinsic_value, 2) : 'N/A'; ?></td>
                    </tr>
                     <tr>
                        <td>Current <?php echo $discount_pct > 0 ? 'Discount' : 'Premium'; ?></td>
                        <td><div class="jtw-formula">= (Value per Share - Current Price) &divide; Value per Share</div>
                        <?php if (is_numeric($intrinsic_value) && $intrinsic_value > 0) : ?>
                            <div class="jtw-formula-vals">= ($<?php echo number_format($intrinsic_value, 2); ?> - $<?php echo number_format($current_price, 2); ?>) &divide; $<?php echo number_format($intrinsic_value, 2); ?></div>
                        <?php endif; ?>
                        </td>
                        <td><?php echo number_format(abs($discount_pct), 1) . '%'; ?></td>
                    </tr>
                 </tbody>
             </table>
        </div>
        <?php
        return ob_get_clean();
    }

    private function build_simple_valuation_modal_content($result) {
        $data = $result['calculation_breakdown'] ?? [];
        if (empty($data)) return '<p class="jtw-left-align">Detailed breakdown is not available for this model.</p>';

        $model_name = $data['model_name'] ?? 'Valuation Model';
        $intrinsic_value = $result['intrinsic_value_per_share'] ?? 'N/A';

        ob_start();
        ?>
        <h4 class="jtw-modal-title">Calculation for <?php echo esc_html($model_name); ?></h4>
        <div class="jtw-modal-stage">
            <h5 class="jtw-modal-subtitle">Summary</h5>
            <table class="jtw-sws-modal-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th style="text-align: right;">Value</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($data as $key => $value) :
                        if ($key === 'model_name') continue;
                        $label = ucwords(str_replace('_', ' ', $key));
                    ?>
                        <tr>
                            <td><?php echo esc_html($label); ?></td>
                            <td><?php
                                if (is_float($value)) {
                                    // Format percentages for rates, otherwise format as a number
                                    if (strpos($key, 'rate') !== false || strpos($key, 'premium') !== false) {
                                        echo number_format($value * 100, 2) . '%';
                                    } else {
                                        echo number_format($value, 2);
                                    }
                                } else {
                                    echo esc_html($value);
                                }
                            ?></td>
                        </tr>
                    <?php endforeach; ?>
                    <tr class="jtw-table-total-row">
                        <td><strong>Intrinsic Value per Share</strong></td>
                        <td><strong>$<?php echo esc_html($intrinsic_value); ?></strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <?php
        return ob_get_clean();
    }
}

