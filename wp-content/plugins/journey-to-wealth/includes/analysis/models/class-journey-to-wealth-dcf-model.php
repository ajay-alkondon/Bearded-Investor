<?php
/**
 * Discounted Cash Flow (DCF) Valuation Model for Journey to Wealth plugin.
 * Implements a 2-stage FCFE model and uses a hierarchical growth rate model.
 *
 * @link       https://example.com/journey-to-wealth/
 * @since      3.5.0
 *
 * @package    Journey_To_Wealth
 * @subpackage Journey_To_Wealth/includes/analysis/models
 */

if ( ! defined( 'WPINC' ) ) {
    die;
}

class Journey_To_Wealth_DCF_Model {

    private $cost_of_equity;
    private $terminal_growth_rate;
    private $equity_risk_premium;
    private $levered_beta;
    private $projection_years = 10;

    const DEFAULT_COST_OF_EQUITY = 0.085;
    const DEFAULT_RISK_FREE_RATE = 0.045;
    
    const MAX_YEARS_FOR_HISTORICAL_CALCS = 6;
    const MIN_YEARS_FOR_GROWTH_CALC = 3;
    
    const HIGH_CAPEX_THRESHOLD = 0.70;

    public function __construct($equity_risk_premium = null, $levered_beta = null) {
        $this->equity_risk_premium = is_numeric($equity_risk_premium) ? $equity_risk_premium : 0.055;
        $this->levered_beta = is_numeric($levered_beta) ? $levered_beta : null;
    }

    private function get_av_value($report, $key, $default = 0) {
        return isset($report[$key]) && is_numeric($report[$key]) && $report[$key] !== 'None' ? (float)$report[$key] : $default;
    }

    public function calculate_average_risk_free_rate($treasury_yield_data) {
        if (is_wp_error($treasury_yield_data) || empty($treasury_yield_data['data'])) {
            return self::DEFAULT_RISK_FREE_RATE;
        }
        $yields = array_slice($treasury_yield_data['data'], 0, 60);
        $sum = 0;
        $count = 0;
        foreach ($yields as $yield_entry) {
            if (isset($yield_entry['value']) && is_numeric($yield_entry['value'])) {
                $sum += (float)$yield_entry['value'];
                $count++;
            }
        }
        return ($count > 0) ? ($sum / $count) / 100 : self::DEFAULT_RISK_FREE_RATE;
    }

    private function calculate_cost_of_equity($beta, $risk_free_rate) {
        return ($beta > 0) ? $risk_free_rate + ($beta * $this->equity_risk_premium) : self::DEFAULT_COST_OF_EQUITY;
    }

    private function get_historical_fcfe_and_breakdown($income_reports, $balance_reports, $cash_flow_reports) {
        $fcfe_breakdown = [];
        $income_map = [];
        foreach($income_reports as $report) { $income_map[substr($report['fiscalDateEnding'], 0, 4)] = $report; }
        $balance_map = [];
        foreach($balance_reports as $report) { $balance_map[substr($report['fiscalDateEnding'], 0, 4)] = $report; }
        $cash_flow_map = [];
        foreach($cash_flow_reports as $report) { $cash_flow_map[substr($report['fiscalDateEnding'], 0, 4)] = $report; }
        $sorted_years = array_keys($income_map);
        rsort($sorted_years);

        for ($i = 0; $i < count($sorted_years) - 1; $i++) {
            $year_curr = $sorted_years[$i];
            $year_prev = $sorted_years[$i+1];
            $is_curr = $income_map[$year_curr] ?? null;
            $cf_curr = $cash_flow_map[$year_curr] ?? null;
            $bs_curr = $balance_map[$year_curr] ?? null;
            $bs_prev = $balance_map[$year_prev] ?? null;
            if (!$is_curr || !$cf_curr || !$bs_curr || !$bs_prev) continue;
            $op_cash_flow = $this->get_av_value($cf_curr, 'operatingCashflow');
            $capex = abs($this->get_av_value($cf_curr, 'capitalExpenditures'));
            $debt_curr = $this->get_av_value($bs_curr, 'longTermDebt') + $this->get_av_value($bs_curr, 'shortTermDebt');
            $debt_prev = $this->get_av_value($bs_prev, 'longTermDebt') + $this->get_av_value($bs_prev, 'shortTermDebt');
            $net_borrowing = $debt_curr - $debt_prev;
            $fcfe = $op_cash_flow - $capex + $net_borrowing;
            $fcfe_breakdown[] = [
                'year' => $year_curr,
                'operating_cash_flow' => $op_cash_flow,
                'capex' => -$capex,
                'net_debt_issued' => $net_borrowing,
                'fcfe' => $fcfe,
            ];
        }
        return array_reverse($fcfe_breakdown);
    }
    
    private function calculate_historical_cagr($reports, $key) {
        if (empty($reports) || count($reports) < self::MIN_YEARS_FOR_GROWTH_CALC) {
            return null;
        }

        $series = array_map(function($r) use ($key) {
            return $this->get_av_value($r, $key);
        }, $reports);

        $beginning_value = $series[0];
        $ending_value = end($series);

        if ($beginning_value <= 0) return null;

        $num_periods = count($series) - 1;
        if ($num_periods <= 0) return null;

        return pow(($ending_value / $beginning_value), (1 / $num_periods)) - 1;
    }

    private function prepare_reports_for_cagr($reports) {
        if (empty($reports)) {
            return [];
        }
    
        $current_calendar_year = (int)date('Y');
        $processed_reports = [];
    
        foreach ($reports as $report) {
            $fiscal_date = new DateTime($report['fiscalDateEnding']);
            $report_year = (int)$fiscal_date->format('Y');
            $report_month = (int)$fiscal_date->format('m');
    
            $calendar_year = ($report_month <= 3) ? $report_year - 1 : $report_year;
    
            if ($calendar_year < $current_calendar_year) {
                $processed_reports[] = $report;
            }
        }
    
        $sliced_reports = array_slice($processed_reports, 0, self::MAX_YEARS_FOR_HISTORICAL_CALCS);
    
        return array_reverse($sliced_reports);
    }

    public function get_initial_growth_rate($earnings_estimates, $income_reports, $terminal_growth_rate, $beta_details) {
        if (!is_wp_error($earnings_estimates) && !empty($earnings_estimates['estimates'])) {
            $estimates = $earnings_estimates['estimates'];
            
            $annual_estimates = array_filter($estimates, function($e) {
                return isset($e['horizon']) && ($e['horizon'] === 'current fiscal year' || $e['horizon'] === 'next fiscal year');
            });

            if (!empty($annual_estimates)) {
                usort($annual_estimates, function($a, $b) {
                    return strtotime($b['date']) - strtotime($a['date']);
                });

                $next_year_estimate = null;
                $current_year_estimate = null;

                foreach ($annual_estimates as $estimate) {
                    if ($next_year_estimate === null && $estimate['horizon'] === 'next fiscal year') {
                        $next_year_estimate = $estimate;
                    }
                    if ($current_year_estimate === null && $estimate['horizon'] === 'current fiscal year') {
                        $current_year_estimate = $estimate;
                    }
                    if ($next_year_estimate !== null && $current_year_estimate !== null) {
                        break;
                    }
                }
        
                if ($next_year_estimate && $current_year_estimate) {
                    $beta = $beta_details['unlevered_beta_avg'] ?? 1.0;
                    $revenue_key = 'revenue_estimate_average';
                    $source_suffix = '(Average Beta)';

                    if ($beta <= 0.9) {
                        $revenue_key = 'revenue_estimate_low';
                        $source_suffix = '(Low Beta)';
                    } elseif ($beta > 1.1) {
                        $revenue_key = 'revenue_estimate_high';
                        $source_suffix = '(High Beta)';
                    }

                    $next_year_revenue = $this->get_av_value($next_year_estimate, $revenue_key);
                    $current_year_revenue = $this->get_av_value($current_year_estimate, $revenue_key);

                    if ($current_year_revenue > 0 && $next_year_revenue > 0) {
                        $growth_rate = ($next_year_revenue / $current_year_revenue) - 1;
                        if ($growth_rate > 0) {
                            return ['rate' => $growth_rate, 'source' => 'Analyst Revenue Estimate ' . $source_suffix];
                        }
                    }
                }
            }
        }
    
        $prepared_reports = $this->prepare_reports_for_cagr($income_reports);
        $historical_cagr = $this->calculate_historical_cagr($prepared_reports, 'totalRevenue');
        if ($historical_cagr !== null && $historical_cagr > 0) {
            return ['rate' => $historical_cagr, 'source' => 'Historical Revenue CAGR (5-Year)'];
        }
    
        return ['rate' => $terminal_growth_rate, 'source' => 'Risk-Free Rate (Fallback)'];
    }
    
    public function calculate($overview_data, $income_statement_data, $balance_sheet_data, $cash_flow_data, $treasury_yield_data, $earnings_estimates, $current_price, $beta_details = [], $custom_assumptions = []) {
        $datasets = [$income_statement_data, $balance_sheet_data, $cash_flow_data];
        foreach($datasets as $dataset) {
            if (is_wp_error($dataset) || (empty($dataset['annualReports']) && empty($dataset['annualEarnings'])) || count($dataset['annualReports'] ?? []) < self::MIN_YEARS_FOR_GROWTH_CALC) {
                return new WP_Error('dcf_missing_financials', __('DCF Error: At least 3 years of financial statements are required.', 'journey-to-wealth'));
            }
        }

        $income_reports = array_slice($income_statement_data['annualReports'], 0, self::MAX_YEARS_FOR_HISTORICAL_CALCS);
        $balance_reports = array_slice($balance_sheet_data['annualReports'], 0, self::MAX_YEARS_FOR_HISTORICAL_CALCS);
        $cash_flow_reports = array_slice($cash_flow_data['annualReports'], 0, self::MAX_YEARS_FOR_HISTORICAL_CALCS);
        
        $cagr_calculation_table = $this->get_historical_fcfe_and_breakdown($income_reports, $balance_reports, $cash_flow_reports);
        if(empty($cagr_calculation_table)) return new WP_Error('dcf_calc_error', __('Could not calculate historical FCFE.', 'journey-to-wealth'));
        
        $risk_free_rate = $this->calculate_average_risk_free_rate($treasury_yield_data);
        $beta = $this->levered_beta ?? $beta_details['levered_beta'] ?? $this->get_av_value($overview_data, 'Beta');
        $this->cost_of_equity = $this->calculate_cost_of_equity($beta, $risk_free_rate);
        $this->terminal_growth_rate = $risk_free_rate;

        // --- Start of default calculations ---
        $growth_rate_info = $this->get_initial_growth_rate($earnings_estimates, $income_statement_data['annualReports'], $this->terminal_growth_rate, $beta_details);
        $initial_growth_rate = $growth_rate_info['rate'];
        $growth_rate_source = $growth_rate_info['source'];

        $base_fcfe_data = end($cagr_calculation_table);
        $base_cash_flow = $base_fcfe_data['fcfe'];
        $base_cash_flow_source = 'FCFE';

        $high_capex_year_count = 0;
        $historical_years_for_capex = array_slice($cagr_calculation_table, -3);

        if(count($historical_years_for_capex) >= 3) {
            foreach ($historical_years_for_capex as $year_data) {
                $op_cash_flow = $year_data['operating_cash_flow'];
                $capex = abs($year_data['capex']);
                if ($op_cash_flow > 0 && ($capex / $op_cash_flow) >= self::HIGH_CAPEX_THRESHOLD) {
                    $high_capex_year_count++;
                }
            }
        }

        if ($high_capex_year_count >= 2) {
            $base_cash_flow = $base_fcfe_data['operating_cash_flow'];
            $base_cash_flow_source = 'Operating Cash Flow (Majority High CapEx - 3Y)';
        }

        if ($base_cash_flow <= 0) {
            $positive_cash_flows = array_filter(array_column($cagr_calculation_table, 'fcfe'), function($cf) { return $cf > 0; });
            if (empty($positive_cash_flows)) return new WP_Error('dcf_negative_inputs', __('Company has no history of positive cash flows, cannot create valuation.', 'journey-to-wealth'));
            $base_cash_flow = end($positive_cash_flows);
            $base_cash_flow_source = 'Last Positive FCFE';
        }
        // --- End of default calculations ---

        // --- NEW: Override with custom assumptions ---
        if (!empty($custom_assumptions)) {
            if (isset($custom_assumptions['initial_growth_rate']) && is_numeric($custom_assumptions['initial_growth_rate'])) {
                $initial_growth_rate = (float)$custom_assumptions['initial_growth_rate'];
                $growth_rate_source = 'User Input';
            }

            if (isset($custom_assumptions['profit_margin']) && is_numeric($custom_assumptions['profit_margin'])) {
                $latest_income_report = $income_statement_data['annualReports'][0] ?? null;
                if ($latest_income_report) {
                    $latest_revenue = $this->get_av_value($latest_income_report, 'totalRevenue');
                    if ($latest_revenue > 0) {
                        // Approximate FCFE as Net Income (a common simplification)
                        $base_cash_flow = $latest_revenue * ((float)$custom_assumptions['profit_margin'] / 100);
                        $base_cash_flow_source = 'User Input (from Profit Margin)';
                    }
                }
            }
            
            if (isset($custom_assumptions['initial_fcfe']) && is_numeric($custom_assumptions['initial_fcfe'])) {
                 $base_cash_flow = (float)$custom_assumptions['initial_fcfe'];
                 $base_cash_flow_source = 'User Input (Direct FCFE)';
            }
        }
        // --- End of overrides ---

        if ($this->cost_of_equity <= $this->terminal_growth_rate) $this->terminal_growth_rate = $this->cost_of_equity - 0.005;

        $projection_table = [];
        $sum_of_pv_cfs = 0;
        $future_cf = $base_cash_flow;
        for ($year = 1; $year <= $this->projection_years; $year++) {
            $decay_factor = ($year - 1) / ($this->projection_years - 1);
            $current_growth_rate = $initial_growth_rate * (1 - $decay_factor) + $this->terminal_growth_rate * $decay_factor;
            $future_cf *= (1 + $current_growth_rate);
            $discount_factor = pow((1 + $this->cost_of_equity), $year);
            $pv_of_cf = $future_cf / $discount_factor;
            $sum_of_pv_cfs += $pv_of_cf;
            $projection_table[] = ['year' => date('Y') + $year, 'cf' => $future_cf, 'pv_cf' => $pv_of_cf, 'growth_rate' => $current_growth_rate];
        }

        $terminal_value = ($future_cf * (1 + $this->terminal_growth_rate)) / ($this->cost_of_equity - $this->terminal_growth_rate);
        $pv_of_terminal_value = $terminal_value / pow((1 + $this->cost_of_equity), $this->projection_years);
        $total_equity_value = $sum_of_pv_cfs + $pv_of_terminal_value;
        
        $shares_outstanding = $this->get_av_value($overview_data, 'SharesOutstanding');
        if (empty($shares_outstanding)) return new WP_Error('dcf_missing_shares', __('DCF Error: Shares outstanding data not found.', 'journey-to-wealth'));

        $intrinsic_value_per_share = $total_equity_value / $shares_outstanding;
        
        return [
            'intrinsic_value_per_share' => round($intrinsic_value_per_share, 2),
            'calculation_breakdown' => [
                'model_name' => 'DCF Model (FCFE)',
                'inputs' => [ 
                    'discount_rate' => $this->cost_of_equity, 
                    'terminal_growth_rate' => $this->terminal_growth_rate, 
                    'initial_growth_rate' => $initial_growth_rate,
                    'growth_rate_source' => $growth_rate_source,
                    'base_cash_flow_source' => $base_cash_flow_source,
                    'base_cash_flow' => $base_cash_flow,
                ],
                'cagr_calculation_table' => $cagr_calculation_table,
                'discount_rate_calc' => [ 'risk_free_rate' => $risk_free_rate, 'risk_free_rate_source' => '5Y Average of 10Y Treasury', 'equity_risk_premium' => $this->equity_risk_premium, 'erp_source' => 'Plugin Setting', 'beta' => $beta, 'beta_source' => $beta_details['beta_source'] ?? 'Alpha Vantage', 'beta_details' => $beta_details, 'cost_of_equity_calc' => 'Risk-Free Rate + (Levered Beta * Equity Risk Premium)', 'wacc_details' => null, ],
                'projection_table' => $projection_table, 'sum_of_pv_cfs' => $sum_of_pv_cfs, 'terminal_value' => $terminal_value, 'pv_of_terminal_value' => $pv_of_terminal_value, 'total_equity_value' => $total_equity_value, 'shares_outstanding' => $shares_outstanding, 'current_price' => $current_price,
            ]
        ];
    }
}
