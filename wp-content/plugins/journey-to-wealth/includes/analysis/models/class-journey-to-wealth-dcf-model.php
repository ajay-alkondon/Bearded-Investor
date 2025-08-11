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

    const DEFAULT_COST_OF_EQUITY = 0.085;
    const DEFAULT_RISK_FREE_RATE = 0.045;
    
    const MAX_YEARS_FOR_HISTORICAL_CALCS = 6;
    const MIN_YEARS_FOR_GROWTH_CALC = 3;
    
    public function __construct($equity_risk_premium = null, $levered_beta = null) {
        $this->equity_risk_premium = is_numeric($equity_risk_premium) ? $equity_risk_premium : 0.055;
        $this->levered_beta = is_numeric($levered_beta) ? $levered_beta : null;
    }

    private function get_av_value($report, $key, $default = 0) {
        // This function correctly handles "none" values by treating them as the default (0).
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
    
    public function calculate($overview_data, $income_statement_data, $balance_sheet_data, $cash_flow_data, $treasury_yield_data, $earnings_estimates, $current_price, $beta_details = [], $custom_assumptions = [], $projection_years = 10) {
        $datasets = [$income_statement_data, $balance_sheet_data, $cash_flow_data];
        foreach($datasets as $dataset) {
            if (is_wp_error($dataset) || (empty($dataset['annualReports']) && empty($dataset['annualEarnings'])) || count($dataset['annualReports'] ?? []) < self::MIN_YEARS_FOR_GROWTH_CALC) {
                return new WP_Error('dcf_missing_financials', __('DCF Error: At least 3 years of financial statements are required.', 'journey-to-wealth'));
            }
        }

        // --- Setup initial parameters ---
        $risk_free_rate = $this->calculate_average_risk_free_rate($treasury_yield_data);
        $beta = $this->levered_beta ?? $beta_details['levered_beta'] ?? $this->get_av_value($overview_data, 'Beta');
        $this->cost_of_equity = $this->calculate_cost_of_equity($beta, $risk_free_rate);
        $this->terminal_growth_rate = $risk_free_rate;
        $historical_ratios = $this->calculate_historical_ratios($income_statement_data['annualReports'], $cash_flow_data['annualReports'], $balance_sheet_data['annualReports'], $overview_data);
        
        // --- Determine Base Revenue and Initial Growth Rate ---
        $last_revenue = null;
        $growth_rate_info = $this->get_initial_growth_rate($earnings_estimates, $income_statement_data['annualReports'], $this->terminal_growth_rate, $beta_details);
        $initial_growth_rate = $growth_rate_info['rate'];
        $growth_rate_source = $growth_rate_info['source'];

        if (!is_wp_error($earnings_estimates) && !empty($earnings_estimates['estimates'])) {
            $estimates = $earnings_estimates['estimates'];
            
            $current_year_estimates = array_filter($estimates, function($e) {
                return isset($e['horizon']) && $e['horizon'] === 'current fiscal year';
            });

            $latest_current_year_estimate = null;
            if (!empty($current_year_estimates)) {
                usort($current_year_estimates, function($a, $b) {
                    return strtotime($b['date']) - strtotime($a['date']);
                });
                $latest_current_year_estimate = $current_year_estimates[0];
            }

            if ($latest_current_year_estimate) {
                $beta_for_growth = $beta_details['unlevered_beta_avg'] ?? 1.0;
                $revenue_key = 'revenue_estimate_average';
                if ($beta_for_growth <= 0.9) {
                    $revenue_key = 'revenue_estimate_low';
                } elseif ($beta_for_growth > 1.1) {
                    $revenue_key = 'revenue_estimate_high';
                }
                $last_revenue = $this->get_av_value($latest_current_year_estimate, $revenue_key);
            }
        }

        if ($last_revenue === null || $last_revenue == 0) {
            $last_revenue = $this->get_av_value($income_statement_data['annualReports'][0], 'totalRevenue');
        }
        
        $base_revenue = $last_revenue;

        // --- Projection Logic ---
        $projection_table = [];
        $sum_of_pv_cfs = 0;
        $current_calendar_year = (int)date('Y');
        $start_projection_year = $current_calendar_year + 1;
        
        $current_growth_rate = $initial_growth_rate; 

        if (isset($custom_assumptions['initial_growth_rate']) && is_numeric($custom_assumptions['initial_growth_rate'])) {
            $current_growth_rate = (float)$custom_assumptions['initial_growth_rate'];
            $initial_growth_rate = $current_growth_rate;
            $growth_rate_source = 'User Input';
        }

        $growth_decay_rate = 0;
        $decay_is_setup = false;
        $first_projected_fcfe = null;
        $last_fcfe = 0;
        $ratios_for_projection = $historical_ratios['projection_ratios'];

        for ($i = 1; $i <= $projection_years; $i++) {
            $projection_year = $start_projection_year + $i - 1;
            $projected_revenue = 0;
            $period_growth_rate = 0;
            
            if ($i == 1) {
                $period_growth_rate = $initial_growth_rate;
            } else {
                if (!$decay_is_setup) {
                    $remaining_years = $projection_years - 1;
                    if ($remaining_years > 0) {
                        $growth_decay_rate = ($current_growth_rate - $this->terminal_growth_rate) / $remaining_years;
                    }
                    $decay_is_setup = true;
                }
                $current_growth_rate -= $growth_decay_rate;
                $period_growth_rate = $current_growth_rate;
            }
            
            $projected_revenue = $last_revenue * (1 + $period_growth_rate);
            
            $projected_fcfe = 0;
            if ($i == 1) {
                if (isset($custom_assumptions['initial_fcfe_override']) && is_numeric($custom_assumptions['initial_fcfe_override'])) {
                    $projected_fcfe = (float)$custom_assumptions['initial_fcfe_override'];
                } else {
                    $projected_net_income = $projected_revenue * $ratios_for_projection['net_income_of_revenue'];
                    $projected_depreciation = $projected_revenue * $ratios_for_projection['depreciation_of_revenue'];
                    $projected_capex = $projected_revenue * $ratios_for_projection['capex_of_revenue'];
                    $projected_change_in_nwc = $projected_revenue * $ratios_for_projection['nwc_of_revenue'];
                    $projected_net_borrowing = $projected_revenue * $ratios_for_projection['net_borrowing_of_revenue'];
                    $projected_fcfe = $projected_net_income + $projected_depreciation - $projected_capex - $projected_change_in_nwc + $projected_net_borrowing;
                }
                $first_projected_fcfe = $projected_fcfe;
            } else {
                if ($last_fcfe < 0) {
                    $improvement = abs($last_fcfe) * $period_growth_rate;
                    $projected_fcfe = $last_fcfe + $improvement;
                } else {
                    $projected_fcfe = $last_fcfe * (1 + $period_growth_rate);
                }
            }

            $pv_cf = $projected_fcfe / pow(1 + $this->cost_of_equity, $i);
            $sum_of_pv_cfs += $pv_cf;

            $projection_table[] = [
                'year' => $projection_year,
                'cf' => $projected_fcfe,
                'growth_rate' => $period_growth_rate,
                'pv_cf' => $pv_cf
            ];

            $last_revenue = $projected_revenue;
            $last_fcfe = $projected_fcfe;
        }

        $last_projected_fcfe = end($projection_table)['cf'];
        $terminal_value = ($last_projected_fcfe * (1 + $this->terminal_growth_rate)) / ($this->cost_of_equity - $this->terminal_growth_rate);
        if ($this->cost_of_equity <= $this->terminal_growth_rate) {
            return new WP_Error('dcf_terminal_value_error', __('Terminal value cannot be calculated, cost of equity is not greater than terminal growth rate.', 'journey-to-wealth'));
        }
        
        $pv_of_terminal_value = $terminal_value / pow(1 + $this->cost_of_equity, $projection_years);
        $total_equity_value = $sum_of_pv_cfs + $pv_of_terminal_value;
        $shares_outstanding = $this->get_av_value($overview_data, 'SharesOutstanding');
        if ($shares_outstanding == 0) return new WP_Error('dcf_shares_error', __('Shares outstanding is zero, cannot calculate per-share value.', 'journey-to-wealth'));
        
        $intrinsic_value_per_share = $total_equity_value / $shares_outstanding;

        return [
            'intrinsic_value_per_share' => $intrinsic_value_per_share,
            'calculation_breakdown' => [
                'model_name' => 'DCF Model (FCFE)',
                'current_price' => $current_price,
                'shares_outstanding' => $shares_outstanding,
                'sum_of_pv_cfs' => $sum_of_pv_cfs,
                'terminal_value' => $terminal_value,
                'pv_of_terminal_value' => $pv_of_terminal_value,
                'total_equity_value' => $total_equity_value,
                'projection_table' => $projection_table,
                'inputs' => [
                    'base_cash_flow' => $first_projected_fcfe,
                    'base_cash_flow_source' => 'Projected from Component Ratios',
                    'initial_growth_rate' => $initial_growth_rate,
                    'growth_rate_source' => $growth_rate_source,
                    'terminal_growth_rate' => $this->terminal_growth_rate,
                    'discount_rate' => $this->cost_of_equity,
                ],
                'discount_rate_calc' => [
                    'risk_free_rate' => $risk_free_rate,
                    'risk_free_rate_source' => 'Avg 3-Month Treasury Yield (60 days)',
                    'equity_risk_premium' => $this->equity_risk_premium,
                    'erp_source' => 'Plugin Setting',
                    'beta' => $beta,
                    'beta_details' => $beta_details,
                    'cost_of_equity_calc' => 'Risk-Free Rate + (Beta * Equity Risk Premium)',
                ],
                'component_ratios' => $historical_ratios,
                'base_revenue' => $base_revenue,
            ]
        ];
    }

    private function calculate_historical_ratios($income_reports, $cash_flow_reports, $balance_reports, $overview_data, $num_years = 5) {
        $income_reports = array_slice($income_reports, 0, $num_years);
        $cash_flow_reports = array_slice($cash_flow_reports, 0, $num_years);
        $balance_reports = array_slice($balance_reports, 0, $num_years + 1); // Need one extra year for debt calculation

        $ratios = [
            'net_income_of_revenue' => [],
            'depreciation_of_revenue' => [],
            'capex_of_revenue' => [],
            'nwc_of_revenue' => [],
            'net_borrowing_of_revenue' => [],
        ];
        
        $yearly_data = [];

        $income_map = [];
        foreach($income_reports as $report) { $income_map[substr($report['fiscalDateEnding'], 0, 4)] = $report; }
        $cash_flow_map = [];
        foreach($cash_flow_reports as $report) { $cash_flow_map[substr($report['fiscalDateEnding'], 0, 4)] = $report; }
        $balance_map = [];
        foreach($balance_reports as $report) { $balance_map[substr($report['fiscalDateEnding'], 0, 4)] = $report; }
        
        $sorted_years = array_keys($income_map);
        rsort($sorted_years);

        foreach ($sorted_years as $year) {
            $previous_year = $year - 1;
            $income = $income_map[$year] ?? null;
            $cash_flow = $cash_flow_map[$year] ?? null;
            $balance_current = $balance_map[$year] ?? null;
            $balance_previous = $balance_map[$previous_year] ?? null;

            if (!$income || !$cash_flow || !$balance_current || !$balance_previous) continue;

            $revenue = $this->get_av_value($income, 'totalRevenue');
            if ($revenue > 0) {
                // Calculate individual components
                $net_income = $this->get_av_value($income, 'netIncome');
                $depreciation = $this->get_av_value($cash_flow, 'depreciationDepletionAndAmortization');
                $capex = abs($this->get_av_value($cash_flow, 'capitalExpenditures'));
                
                $changeInInventory = $this->get_av_value($cash_flow, 'changeInInventory');
                $changeInReceivables = $this->get_av_value($cash_flow, 'changeInReceivables');
                $changeInOpLiabilities = $this->get_av_value($cash_flow, 'changeInOperatingLiabilities');
                $changeInWorkingCapital = -$changeInReceivables - $changeInInventory + $changeInOpLiabilities;

                $proceeds_long_term = $this->get_av_value($cash_flow, 'proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet');
                $ltd_current = $this->get_av_value($balance_current, 'longTermDebt');
                $ltd_previous = $this->get_av_value($balance_previous, 'longTermDebt');
                $change_in_ltd = $ltd_current - $ltd_previous;
                $repayment_long_term = $proceeds_long_term - $change_in_ltd;
                $proceeds_short_term = $this->get_av_value($cash_flow, 'proceedsFromRepaymentsOfShortTermDebt');
                $net_borrowing = $proceeds_short_term + $proceeds_long_term - $repayment_long_term;

                // Add to ratios array for averaging
                $ratios['net_income_of_revenue'][] = $net_income / $revenue;
                $ratios['depreciation_of_revenue'][] = $depreciation / $revenue;
                $ratios['capex_of_revenue'][] = $capex / $revenue;
                $ratios['nwc_of_revenue'][] = $changeInWorkingCapital / $revenue;
                $ratios['net_borrowing_of_revenue'][] = $net_borrowing / $revenue;
                
                // Store detailed data for this year
                $yearly_data[$year] = [
                    'revenue' => $revenue,
                    'net_income' => $net_income,
                    'depreciation' => $depreciation,
                    'capex' => $capex,
                    'change_in_nwc' => $changeInWorkingCapital,
                    'net_borrowing' => $net_borrowing
                ];
            }
        }

        $averages = [];
        foreach ($ratios as $key => $values) {
            if (count($values) >= 3) {
                sort($values);
                $trimmed_values = array_slice($values, 1, -1);
                $averages[$key] = array_sum($trimmed_values) / count($trimmed_values);
            } elseif (count($values) > 0) {
                $averages[$key] = array_sum($values) / count($values);
            } else {
                $averages[$key] = ($key === 'net_income_of_revenue') ? 0.10 : 0.05;
            }
        }
        
        $projection_ratios = $averages; // Start with averages as a fallback.
        $most_recent_year = $sorted_years[0] ?? null;

        if ($most_recent_year && isset($yearly_data[$most_recent_year])) {
            $most_recent_data = $yearly_data[$most_recent_year];
            $most_recent_revenue = $most_recent_data['revenue'];

            if ($most_recent_revenue > 0) {
                $last_year_ratios = [
                    'net_income_of_revenue' => $most_recent_data['net_income'] / $most_recent_revenue,
                    'depreciation_of_revenue' => $most_recent_data['depreciation'] / $most_recent_revenue,
                    'capex_of_revenue' => $most_recent_data['capex'] / $most_recent_revenue,
                    'nwc_of_revenue' => $most_recent_data['change_in_nwc'] / $most_recent_revenue,
                    'net_borrowing_of_revenue' => $most_recent_data['net_borrowing'] / $most_recent_revenue,
                ];

                foreach ($last_year_ratios as $key => $last_year_value) {
                    $is_outlier = false;

                    if (($key === 'capex_of_revenue' || $key === 'depreciation_of_revenue') && $last_year_value <= 0) {
                        $is_outlier = true;
                    }

                    if (!$is_outlier) {
                        $projection_ratios[$key] = $last_year_value;
                    }
                }
            }
        }
        
        // **FIX**: Removed the TTM profit margin override to ensure the last full year's ratio is used.
        // $ttm_profit_margin = $this->get_av_value($overview_data, 'ProfitMargin');
        // if (is_numeric($ttm_profit_margin)) {
        //     $projection_ratios['net_income_of_revenue'] = $ttm_profit_margin;
        // }

        return [
            'averages' => $averages,
            'yearly_data' => $yearly_data,
            'projection_ratios' => $projection_ratios
        ];
    }
}
