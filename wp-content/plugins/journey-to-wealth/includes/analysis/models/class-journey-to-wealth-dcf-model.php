<?php
/**
 * Discounted Cash Flow (DCF) Valuation Model for Journey to Wealth plugin.
 * Implements a 2-stage FCFE model. Growth rates are now determined externally based on beta.
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
    
    const MIN_YEARS_FOR_GROWTH_CALC = 3;
    
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
    $component_ratios = $this->calculate_ttm_ratios($overview_data, $income_statement_data['quarterlyReports'], $cash_flow_data['quarterlyReports'], $balance_sheet_data['quarterlyReports'], $earnings_estimates); 
    
    // --- Determine Base Revenue and Initial Growth Rate ---
    $base_revenue = $this->get_av_value($income_statement_data['annualReports'][0], 'totalRevenue');
    $base_revenue_source = 'Last Reported Annual Revenue';

    $initial_growth_rate = $custom_assumptions['initial_growth_rate'] ?? $this->terminal_growth_rate;
    $growth_rate_source = 'User Input';
    
    // --- Projection Logic ---
    $yearly_fcfe_inputs = $custom_assumptions['yearlyFcfe'] ?? [];
    $yearly_growth_inputs = $custom_assumptions['yearlyRevGrowth'] ?? [];
    $initial_fcfe_override = $custom_assumptions['initial_fcfe_override'] ?? null;
    
    $fcfe_projections = [];
    $growth_projections = [];

    if (!empty($yearly_fcfe_inputs)) {
        // Manual FCFE Mode: FCFE values are provided directly. Growth rates are ignored for calculation.
        for ($i = 1; $i <= $projection_years; $i++) {
            $fcfe_projections[$i] = isset($yearly_fcfe_inputs[$i]) && is_numeric($yearly_fcfe_inputs[$i]) ? (float)$yearly_fcfe_inputs[$i] : 0;
            // For display purposes, calculate the implied growth rate.
            if ($i > 1 && isset($fcfe_projections[$i - 1]) && $fcfe_projections[$i - 1] != 0) {
                $growth_projections[$i] = ($fcfe_projections[$i] - $fcfe_projections[$i - 1]) / $fcfe_projections[$i - 1];
            } else {
                $growth_projections[$i] = 0; // Growth cannot be calculated for the first year.
            }
        }
    } else {
        // Growth Rate Mode: FCFE is projected based on growth rates.
        $fcfe_year_1 = 0;
        if ($initial_fcfe_override !== null) {
            $fcfe_year_1 = $initial_fcfe_override;
        } else {
            $projected_revenue = $base_revenue * (1 + $initial_growth_rate);
            $ratios = $component_ratios['projection_ratios'];
            $fcfe_year_1 = ($projected_revenue * $ratios['net_income_of_revenue'])
                         + ($projected_revenue * $ratios['depreciation_of_revenue'])
                         - ($projected_revenue * $ratios['capex_of_revenue'])
                         - ($projected_revenue * $ratios['delta_nwc_of_revenue'])
                         + ($projected_revenue * $ratios['net_borrowing_of_revenue']);
        }
        
        $current_growth_rate = $initial_growth_rate;
        $decay_is_setup = false;
        $growth_decay_rate = 0;

        for ($i = 1; $i <= $projection_years; $i++) {
            // First, determine the growth rate for the current year.
            if (!empty($yearly_growth_inputs) && isset($yearly_growth_inputs[$i]) && is_numeric($yearly_growth_inputs[$i])) {
                $growth_projections[$i] = (float)$yearly_growth_inputs[$i] / 100;
                // Update current growth rate to the manual input for subsequent decay calculations.
                $current_growth_rate = $growth_projections[$i];
                // Reset decay calculation if a new manual growth rate is entered mid-projection.
                $decay_is_setup = false;
            } else {
                if ($i == 1) {
                    $growth_projections[$i] = $initial_growth_rate;
                } else {
                    if (!$decay_is_setup) {
                        if ($projection_years > ($i - 1)) {
                             // Correctly calculate decay over remaining years
                            $growth_decay_rate = ($current_growth_rate - $this->terminal_growth_rate) / ($projection_years - ($i - 1));
                        } else {
                            $growth_decay_rate = 0;
                        }
                        $decay_is_setup = true;
                    }
                    $current_growth_rate -= $growth_decay_rate;
                    $growth_projections[$i] = max($current_growth_rate, $this->terminal_growth_rate);
                }
            }

            // Second, determine FCFE for the current year based on the growth rate.
            if ($i == 1) {
                $fcfe_projections[$i] = $fcfe_year_1;
            } else {
                $fcfe_projections[$i] = $fcfe_projections[$i - 1] * (1 + $growth_projections[$i]);
            }
         }
     }
    
    $projection_table = [];
    $sum_of_pv_cfs = 0;
    for ($i = 1; $i <= $projection_years; $i++) {
        $projected_fcfe = $fcfe_projections[$i];
        $period_growth_rate = $growth_projections[$i];
        $pv_cf = $projected_fcfe / pow(1 + $this->cost_of_equity, $i);
        $sum_of_pv_cfs += $pv_cf;
        $projection_table[] = [ 'year' => date('Y') + $i, 'cf' => $projected_fcfe, 'growth_rate' => $period_growth_rate, 'pv_cf' => $pv_cf ];
    }
    
    // --- Final Valuation ---
    $last_projected_fcfe = end($projection_table)['cf'];
    if ($this->cost_of_equity <= $this->terminal_growth_rate) {
        return new WP_Error('dcf_terminal_value_error', __('Terminal value error.', 'journey-to-wealth'));
    }
    $terminal_value = ($last_projected_fcfe * (1 + $this->terminal_growth_rate)) / ($this->cost_of_equity - $this->terminal_growth_rate);
    
    $pv_of_terminal_value = $terminal_value / pow(1 + $this->cost_of_equity, $projection_years);
    $total_equity_value = $sum_of_pv_cfs + $pv_of_terminal_value;
    $shares_outstanding = $this->get_av_value($overview_data, 'SharesOutstanding');
    if ($shares_outstanding == 0) return new WP_Error('dcf_shares_error', __('Shares outstanding is zero.', 'journey-to-wealth'));
    
    $intrinsic_value_per_share = $total_equity_value / $shares_outstanding;

    return [
        'intrinsic_value_per_share' => $intrinsic_value_per_share,
        'calculation_breakdown' => [
            'model_name' => 'DCF Model (FCFE)', 'current_price' => $current_price, 'shares_outstanding' => $shares_outstanding,
            'sum_of_pv_cfs' => $sum_of_pv_cfs, 'terminal_value' => $terminal_value, 'pv_of_terminal_value' => $pv_of_terminal_value,
            'total_equity_value' => $total_equity_value, 'projection_table' => $projection_table,
            'inputs' => [
                'base_cash_flow' => $fcfe_projections[1], 'initial_growth_rate' => $initial_growth_rate,
                'growth_rate_source' => $growth_rate_source, 'terminal_growth_rate' => $this->terminal_growth_rate,
                'discount_rate' => $this->cost_of_equity,
            ],
            'discount_rate_calc' => [
                'risk_free_rate' => $risk_free_rate, 'risk_free_rate_source' => 'Avg 3-Month Treasury Yield (60 days)',
                'equity_risk_premium' => $this->equity_risk_premium, 'erp_source' => 'Plugin Setting', 'beta' => $beta,
                'beta_details' => $beta_details, 'cost_of_equity_calc' => 'Risk-Free Rate + (Beta * Equity Risk Premium)',
            ],
            'component_ratios' => $component_ratios, 'base_revenue' => $base_revenue, 'base_revenue_source' => $base_revenue_source,
        ]
    ];
}

    private function calculate_ttm_ratios($overview_data, $income_quarterly, $cash_flow_quarterly, $balance_quarterly, $earnings_estimates) {
        $fallback_ratios = [
            'projection_ratios' => [
                'net_income_of_revenue' => 0.10, 'depreciation_of_revenue' => 0.05,
                'capex_of_revenue' => 0.05, 'delta_nwc_of_revenue' => 0.02,
                'net_borrowing_of_revenue' => 0.01,
            ], 'ttm_data' => []
        ];

        if (count($income_quarterly) < 4 || count($cash_flow_quarterly) < 4 || count($balance_quarterly) < 5) {
            return $fallback_ratios;
        }

        // --- TTM Calculation from last 4 quarters ---
        $last_4_income = array_slice($income_quarterly, 0, 4);
        $last_4_cash_flow = array_slice($cash_flow_quarterly, 0, 4);

        // **FIX START**: Prioritize Analyst Estimate for TTM Revenue
        $revenue_ttm = $this->get_av_value($overview_data, 'RevenueTTM'); // Start with AV's TTM
        if ($revenue_ttm <= 0) { $revenue_ttm = array_sum(array_column($last_4_income, 'totalRevenue')); } // Fallback to summing quarters

        if (!is_wp_error($earnings_estimates) && !empty($earnings_estimates['estimates'])) {
            foreach ($earnings_estimates['estimates'] as $estimate) {
                if (isset($estimate['horizon']) && $estimate['horizon'] === 'current fiscal year' && isset($estimate['revenue_estimate_average']) && is_numeric($estimate['revenue_estimate_average'])) {
                    $analyst_revenue = (float)$estimate['revenue_estimate_average'];
                    if ($analyst_revenue > 0) {
                        $revenue_ttm = $analyst_revenue; // Override with more current analyst estimate
                        break;
                    }
                }
            }
        }
        // **FIX END**
        
        $profit_margin = $this->get_av_value($overview_data, 'ProfitMargin');
        $net_income_ttm = ($profit_margin !== 0 && $revenue_ttm > 0) ? $revenue_ttm * $profit_margin : array_sum(array_column($last_4_income, 'netIncome'));

        $depreciation_ttm = array_sum(array_column($last_4_cash_flow, 'depreciationDepletionAndAmortization'));
        $capex_ttm = abs(array_sum(array_column($last_4_cash_flow, 'capitalExpenditures')));
        
        $changeInInventory_ttm = array_sum(array_column($last_4_cash_flow, 'changeInInventory'));
        $changeInReceivables_ttm = array_sum(array_column($last_4_cash_flow, 'changeInReceivables'));
        $changeInOpLiabilities_ttm = array_sum(array_column($last_4_cash_flow, 'changeInOperatingLiabilities'));
        $delta_nwc_ttm = $changeInReceivables_ttm + $changeInInventory_ttm - $changeInOpLiabilities_ttm;

        $debt_current = $this->get_av_value($balance_quarterly[0], 'longTermDebt', 0) + $this->get_av_value($balance_quarterly[0], 'shortTermDebt', 0);
        $debt_previous = $this->get_av_value($balance_quarterly[4], 'longTermDebt', 0) + $this->get_av_value($balance_quarterly[4], 'shortTermDebt', 0);
        $net_borrowing_ttm = $debt_current - $debt_previous;
        
        if ($revenue_ttm <= 0) { return $fallback_ratios; }

        return [
            'projection_ratios' => [
                'net_income_of_revenue' => $net_income_ttm / $revenue_ttm,
                'depreciation_of_revenue' => $depreciation_ttm / $revenue_ttm,
                'capex_of_revenue' => $capex_ttm / $revenue_ttm,
                'delta_nwc_of_revenue' => $delta_nwc_ttm / $revenue_ttm,
                'net_borrowing_of_revenue' => $net_borrowing_ttm / $revenue_ttm,
            ],
            'ttm_data' => [
                'revenue' => $revenue_ttm, 'net_income' => $net_income_ttm,
                'depreciation' => $depreciation_ttm, 'capex' => $capex_ttm,
                'delta_nwc' => $delta_nwc_ttm, 'net_borrowing' => $net_borrowing_ttm
            ]
        ];
    }
}
