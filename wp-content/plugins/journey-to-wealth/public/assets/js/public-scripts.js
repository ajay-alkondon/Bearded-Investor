/**
 * Public-facing JavaScript for Journey to Wealth plugin.
 *
 * This script powers:
 * 1. The header lookup form, which handles live search and redirects to the analysis page.
 * 2. The main analyzer page, which now uses IntersectionObserver to lazy-load section content.
 * 3. The new Historical Data "Value Line" style chart.
 * 4. The redesigned Company Overview section with animated bars.
 * 5. The peer comparison feature in the Key Metrics section.
 * 6. The interactive Fair Value Analysis section with a stacked bar graphic.
 *
 * @link       https://example.com/journey-to-wealth/
 * @since      1.0.0
 *
 * @package    Journey_To_Wealth
 * @subpackage Journey_To_Wealth/public/assets/js
 */

(function ($) {
    'use strict';

    // Register Chart.js plugins globally and only once.
    if (window.ChartDataLabels) {
        Chart.register(ChartDataLabels);
        Chart.defaults.plugins.datalabels.display = false;
    }

    function getLocalizedText(key, fallbackText) {
        return (typeof jtw_public_params !== 'undefined' && jtw_public_params[key]) ? jtw_public_params[key] : fallbackText;
    }
    
    function debounce(func, delay) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    function formatLargeNumber(num, decimals = 1) {
        if (typeof num !== 'number' || num === 0) return '0';
        const absNum = Math.abs(num);
        const sign = num < 0 ? "-" : "";

        if (absNum >= 1.0e+12) return sign + (absNum / 1.0e+12).toFixed(decimals) + 'T';
        if (absNum >= 1.0e+9) return sign + (absNum / 1.0e+9).toFixed(decimals) + 'B';
        if (absNum >= 1.0e+6) return sign + (absNum / 1.0e+6).toFixed(decimals) + 'M';
        if (absNum >= 1.0e+3) return sign + (absNum / 1.0e+3).toFixed(decimals) + 'K';
        return sign + num.toFixed(decimals);
    }

    function formatMetricValue(value, suffix = '') {
        if (typeof value === 'number') {
            return value.toFixed(1) + suffix;
        }
        return 'N/A';
    }

    /**
     * Initializes the interactive elements in the Company Overview section.
     * Specifically handles the animation for all progress bars.
     * @param {jQuery} $container The jQuery object for the section's container.
     */
    function initializeOverviewSection($container) {
        // Animate the 52-Week Price Range indicator and fill
        const $priceRangeBar = $container.find('.jtw-price-range-bar');
        if ($priceRangeBar.length) {
            const low = parseFloat($priceRangeBar.data('low'));
            const high = parseFloat($priceRangeBar.data('high'));
            const current = parseFloat($priceRangeBar.data('current'));

            if (!isNaN(low) && !isNaN(high) && !isNaN(current) && high > low) {
                const percentage = Math.max(0, Math.min(100, ((current - low) / (high - low)) * 100));
                const $fill = $priceRangeBar.find('.jtw-progress-fill');
                
                setTimeout(() => {
                    $fill.css('width', `${percentage}%`);
                }, 100);
            }
        }
    }

function initializeKeyMetricsRatiosSection($container) {
        // PEG/PEGY Calculator Logic
        const $calculator = $container.find('.jtw-peg-pegy-calculator');
        if ($calculator.length) {
            const $stockPriceInput = $('#jtw-sim-stock-price');
            const $epsInput = $('#jtw-sim-eps');
            const $growthInput = $('#jtw-sim-growth-rate');
            const $dividendInput = $('#jtw-sim-dividend-yield');
            const $pegValueEl = $('#jtw-peg-value');
            const $pegyValueEl = $('#jtw-pegy-value');
            const $pegBar = $('#jtw-peg-bar');
            const $pegyBar = $('#jtw-pegy-bar');
        
            function updateRatios() {
                const stockPrice = parseFloat($stockPriceInput.val());
                const eps = parseFloat($epsInput.val());
                const growthRate = parseFloat($growthInput.val());
                const dividendYield = parseFloat($dividendInput.val());
        
                let pe = NaN;
                if (stockPrice > 0 && eps > 0) {
                    pe = stockPrice / eps;
                }
        
                function updateBar($bar, $valueEl, value) {
                    if (isNaN(value) || value === null || !isFinite(value)) {
                        $valueEl.text('-');
                        $bar.css('width', '0%').removeClass('good fair poor');
                        return;
                    }
                    $valueEl.text(value.toFixed(1) + 'x');
                    const max_val = 2.0;
                    const width_percent = Math.min((Math.abs(value) / max_val) * 100, 100);
                    $bar.css('width', width_percent + '%').removeClass('good fair poor');
                    if (value < 1.0 && value >= 0) $bar.addClass('good');
                    else if (value >= 1.0 && value <= 1.2) $bar.addClass('fair');
                    else $bar.addClass('poor');
                }

                let peg = NaN;
                if (!isNaN(pe) && growthRate > 0) peg = pe / growthRate;
                updateBar($pegBar, $pegValueEl, peg);
        
                let pegy = NaN;
                if (!isNaN(pe) && (growthRate + dividendYield) > 0) pegy = pe / (growthRate + dividendYield);
                updateBar($pegyBar, $pegyValueEl, pegy);
            }
        
            $container.on('input', '.jtw-sim-input', debounce(updateRatios, 250));
            updateRatios(); // Initial calculation
        }

        // Peer Comparison Logic
        let peerDataFetched = false;
        const $table = $container.find('.jtw-metrics-table');
        const $spinner = $container.find('.jtw-peer-loading-spinner');
        const $errorMsg = $container.find('.jtw-peer-error-message');
        const $compareBtn = $container.find('#jtw-compare-peers-btn');

        function fetchPeerData(tickers = []) {
            $spinner.show();
            $errorMsg.hide();
            $table.find('.jtw-peer-1-value, .jtw-peer-2-value').text('-');

            const primaryTicker = new URLSearchParams(window.location.search).get('jtw_selected_symbol');

            $.ajax({
                url: jtw_public_params.ajax_url,
                type: 'POST',
                data: {
                    action: 'jtw_fetch_peer_data',
                    nonce: jtw_public_params.peer_nonce,
                    ticker: primaryTicker.toUpperCase(),
                    peers: tickers 
                },
                dataType: 'json',
                success: function(response) {
                    $spinner.hide();
                    if (response.success && response.data) {
                        peerDataFetched = true;
                        const peers = Object.keys(response.data);
                        const peerData = response.data;

                        $container.find('#jtw-peer-1-input').val(peers.length > 0 ? peers[0] : '');
                        $container.find('#jtw-peer-2-input').val(peers.length > 1 ? peers[1] : '');
                        
                        $table.find('td[data-metric]').each(function() {
                            const $cell = $(this);
                            const metricKey = $cell.data('metric');
                            const suffix = {
                                trailingPeRatio: 'x', forwardPeRatio: 'x', psRatio: 'x', pbRatio: 'x', evToRevenue: 'x', evToEbitda: 'x',
                                ttmEpsGrowth: '%', currentYearEpsGrowth: '%', nextYearEpsGrowth: '%', ttmRevenueGrowth: '%', currentYearRevenueGrowth: '%', nextYearRevenueGrowth: '%',
                                grossMargin: '%', netMargin: '%'
                            }[metricKey] || '';

                            if ($cell.hasClass('jtw-peer-1-value') && peers.length > 0) {
                                $cell.text(formatMetricValue(peerData[peers[0]][metricKey], suffix));
                            }
                            if ($cell.hasClass('jtw-peer-2-value') && peers.length > 1) {
                                $cell.text(formatMetricValue(peerData[peers[1]][metricKey], suffix));
                            }
                        });

                        $table.find('td[data-metric-peg]').each(function() {
                            const $cell = $(this);
                            if ($cell.hasClass('jtw-peer-1-value') && peers.length > 0) {
                                const peg = formatMetricValue(peerData[peers[0]]['pegRatio'], 'x');
                                const pegy = formatMetricValue(peerData[peers[0]]['pegyRatio'], 'x');
                                $cell.text(`${peg} / ${pegy}`);
                            }
                            if ($cell.hasClass('jtw-peer-2-value') && peers.length > 1) {
                                const peg = formatMetricValue(peerData[peers[1]]['pegRatio'], 'x');
                                const pegy = formatMetricValue(peerData[peers[1]]['pegyRatio'], 'x');
                                $cell.text(`${peg} / ${pegy}`);
                            }
                        });

                    } else {
                        $errorMsg.text(response.data.message || getLocalizedText('text_error')).show();
                    }
                },
                error: function(jqXHR) {
                    $spinner.hide();
                    $errorMsg.text('AJAX request failed. ' + (jqXHR.responseText || '')).show();
                }
            });
        }

        // **FIX**: Updated toggle logic
        $container.on('change', '#jtw-peer-toggle', function() {
            if ($(this).is(':checked')) {
                // Fetch and populate auto-suggested peers
                fetchPeerData();
            } else {
                // Clear the auto-suggested peers
                $container.find('#jtw-peer-1-input').val('');
                $container.find('#jtw-peer-2-input').val('');
                $table.find('.jtw-peer-1-value, .jtw-peer-2-value').text('-');
                peerDataFetched = false; // Reset flag
            }
        });

        $container.on('keypress', '.jtw-peer-input', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                $compareBtn.trigger('click');
            }
        });

        $container.on('click', '#jtw-compare-peers-btn', function(e) {
            e.preventDefault();
            const peer1 = $container.find('#jtw-peer-1-input').val().trim().toUpperCase();
            const peer2 = $container.find('#jtw-peer-2-input').val().trim().toUpperCase();
            const peersToFetch = [];
            if (peer1) peersToFetch.push(peer1);
            if (peer2) peersToFetch.push(peer2);
            
            // Uncheck the toggle if user is doing a manual search
            $('#jtw-peer-toggle').prop('checked', false);

            fetchPeerData(peersToFetch);
        });
    }

function initializeFairValueAnalysisSection($container) {
    const $contentDiv = $container.find('#section-intrinsic-valuation-content');
    if (!$contentDiv.length) {
        console.error("Intrinsic valuation content div not found.");
        return;
    }

    // --- START: INITIAL LOAD LOGIC ---
    const $valuationWrapper = $contentDiv.find('.jtw-valuation-tables-wrapper');
    const $loader = $contentDiv.find('.jtw-valuation-loader');
    // Hide the loader and show the tables now that the section's JS is initialized.
    $loader.hide();
    $valuationWrapper.show();
    // --- END: INITIAL LOAD LOGIC ---

    const componentRatios = $contentDiv.data('ratios');
    const currentPrice = $contentDiv.data('current-price');
    const sharesOutstanding = parseFloat($contentDiv.data('shares-outstanding'));

    // --- Event Listeners for Model Selector ---
    $container.on('click', '.jtw-model-selector', function(e) {
        e.stopPropagation();
        const $selector = $(this);
        // Close other selectors when one is opened
        $('.jtw-model-selector').not($selector).removeClass('open');
        $selector.toggleClass('open');
    });

    $container.on('click', '.jtw-model-options li', function(e) {
        e.stopPropagation();
        const $li = $(this);
        const $selector = $li.closest('.jtw-model-selector');
        const $row = $selector.closest('.jtw-terminal-value-row');
        const modelKey = $li.data('model-key');
        const modelLabel = $li.text();

        $selector.find('.jtw-selected-model').text(modelLabel);
        // Use an attribute to store the selected model key for the AJAX call
        $row.attr('data-selected-model', modelKey);
        $selector.removeClass('open');
        recalculateValuation(); // Trigger recalculation when a new model is selected
    });

    // Close dropdowns if clicking anywhere else on the page
    $(document).on('click', function() {
        $('.jtw-model-selector').removeClass('open');
    });
    // --- End Event Listeners ---

    function formatNumberForDisplay(num, unitLabel = '', decimals = 1) {
        if (typeof num !== 'number' || isNaN(num)) return '-';
        
        let divisor = 1;
        if (unitLabel.includes('(Billions)')) divisor = 1e9;
        else if (unitLabel.includes('(Millions)')) divisor = 1e6;
        else if (unitLabel.includes('(Thousands)')) divisor = 1e3;

        return (num / divisor).toFixed(decimals);
    }

    function parseFormattedNumber(str, unitLabel = '') {
        let num = parseFloat(str);
        if (isNaN(num)) return 0;
        
        if (unitLabel.includes('(Billions)')) return num * 1e9;
        if (unitLabel.includes('(Millions)')) return num * 1e6;
        if (unitLabel.includes('(Thousands)')) return num * 1e3;
        
        return num;
    }

function updateInTableValuationGraphic($table, fairValue, currentPrice) {
    const $barContainer = $table.find('.jtw-in-table-bar-container');
    const $errorMessage = $table.find('.jtw-dcf-error-message');
    const $fairValueBar = $table.find('.jtw-fair-value-bar');
    const $currentPriceBar = $table.find('.jtw-current-price-bar');

    // Check if the selectors found the elements. If not, log an error.
    if (!$fairValueBar.length || !$currentPriceBar.length) {
        console.error("Could not find the valuation bar elements. Check your HTML selectors.");
        return;
    }

    // Immediately hide the bars to prevent a "flash" of the old state.
    $fairValueBar.css('transition', 'none');
    $currentPriceBar.css('transition', 'none');

    // Check for a valid fair value. If not, show an error.
    if (typeof fairValue !== 'number' || isNaN(fairValue) || fairValue <= 0) {
        $barContainer.hide();
        $errorMessage.show();
        return;
    }

    $barContainer.show();
    $errorMessage.hide();

    // Determine the maximum value for the bar's scale.
    const rangeMax = Math.max(currentPrice, fairValue) * 1.5;
    if (rangeMax <= 0) return;

    // Calculate the percentage width for the bars and background zones.
    const fairValueWidthPct = (fairValue / rangeMax) * 100;
    const currentPriceWidthPct = (currentPrice / rangeMax) * 100;
    const undervaluedBoundary = fairValue * 0.8;
    const overvaluedBoundary = fairValue * 1.2;
    const undervaluedWidthPct = (undervaluedBoundary / rangeMax) * 100;
    const aboutRightWidthPct = ((overvaluedBoundary - undervaluedBoundary) / rangeMax) * 100;

    // Update text labels and background zones.
    $table.find('.jtw-fair-value-label').text('Fair Value: $' + fairValue.toFixed(2));
    $table.find('.jtw-current-price-label').text('Current Price: $' + currentPrice.toFixed(2));
    $table.find('.jtw-in-table-zone.undervalued').css('width', undervaluedWidthPct + '%');
    $table.find('.jtw-in-table-zone.about-right').css('width', aboutRightWidthPct + '%');

    // --- ANIMATION FIX ---
    // Use a timeout of 0 milliseconds. This pushes the next part of the code to the end of the browser's
    // execution queue, giving it time to render the bars at 0% width before the animation starts.
    setTimeout(function() {
        // Re-enable the CSS transition.
        $fairValueBar.css('transition', 'width 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)');
        $currentPriceBar.css('transition', 'width 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)');
        
        // Set the final target width, which will now animate correctly from 0%.
        $fairValueBar.css('width', fairValueWidthPct + '%');
        $currentPriceBar.css('width', currentPriceWidthPct + '%');
    }, 0);
    // --- END ANIMATION FIX ---
}

const recalculateValuation = debounce(function() {
    // Check for essential data embedded in the HTML. If missing, stop.
    if (!componentRatios || $.isEmptyObject(componentRatios)) {
        console.error('Component ratios not found or are empty on the page. Aborting recalculation.');
        return;
    }
    if (!sharesOutstanding || sharesOutstanding === 0) {
        console.error('Shares outstanding not found or is zero. Aborting recalculation.');
        return;
    }

    const assumptions = { bear: {}, base: {}, bull: {} };
    let hasAllInputs = true;
    
    // Loop through each of the three cases (bear, base, bull) to gather its assumptions.
    ['bear', 'base', 'bull'].forEach(function(caseType) {
        const $table = $container.find('.jtw-case-table[data-case="' + caseType + '"]');
        
        // Gather the user-inputted yearly revenue growth rates for this case.
        assumptions[caseType].yearlyRevGrowth = {};
        $table.find('input[data-metric="yearlyRevGrowth"]').each(function() {
            const $input = $(this);
            const year = $input.data('year');
            const growthRateValue = parseFloat($input.val());
            if (!isNaN(growthRateValue)) {
                assumptions[caseType].yearlyRevGrowth[year] = growthRateValue;
            } else {
                hasAllInputs = false; // If any growth input is not a valid number, flag it.
            }
        });
        
        // Get the selected valuation model (e.g., DCF, DDM) for this case.
        const selectedModel = $table.find('.jtw-terminal-value-row').attr('data-selected-model') || 'auto';
        assumptions[caseType].model = selectedModel;

        // --- START: RESTORED UI CALCULATION LOGIC ---
        const revenueUnitLabel = $table.find('.jtw-revenue-label').first().text();
        let previousRevenue = parseFormattedNumber($table.find('.jtw-revenue-result[data-year="0"]').text(), revenueUnitLabel);

        // Loop through the projection years (1 to 4) to update the UI locally.
        for (let i = 1; i <= 4; i++) {
            const growthRateInput = $table.find('input[data-metric="yearlyRevGrowth"][data-year="' + i + '"]');
            const peInput = $table.find('.jtw-pe-input[data-year="' + i + '"]');
            
            if (peInput.length && peInput.val() === '') {
                hasAllInputs = false;
            }
            
            const growthRate = parseFloat(growthRateInput.val()) / 100 || 0;
            const projectedRevenue = previousRevenue * (1 + growthRate);
            $table.find('.jtw-revenue-result[data-year="' + i + '"]').text(formatNumberForDisplay(projectedRevenue, revenueUnitLabel));
            previousRevenue = projectedRevenue;

            const projectedNetIncome = projectedRevenue * componentRatios.net_income_of_revenue;
            $table.find('.jtw-net-income-result[data-year="' + i + '"]').text(formatNumberForDisplay(projectedNetIncome, revenueUnitLabel));

            const eps = Number(sharesOutstanding) > 0 ? projectedNetIncome / Number(sharesOutstanding) : 0;
            $table.find('.jtw-eps-result[data-year="' + i + '"]').text(eps.toFixed(2));
            
            if (peInput.length) {
                const peRatio = parseFloat(peInput.val()) || 0;
                const sharePrice = eps * peRatio;
                $table.find('.jtw-moe-result-cell[data-year="' + i + '"]').text('$' + sharePrice.toFixed(2));
            }
        }
    });

    // If any of the essential inputs were missing, stop before making the AJAX call.
    if (!hasAllInputs) {
        console.warn("Calculation paused: Not all growth inputs have valid numbers.");
        return;
    }

    const ticker = new URLSearchParams(window.location.search).get('jtw_selected_symbol');

    // --- START: MODIFIED RECALCULATION VISUALS ---
    // Instead of hiding the tables, just dim them to indicate a refresh.
    $container.find('.jtw-case-table').css('opacity', 0.5);
    // --- END: MODIFIED RECALCULATION VISUALS ---

    // --- AJAX call to the backend ---
    $.ajax({
        url: jtw_public_params.ajax_url,
        type: 'POST',
        data: {
            action: 'jtw_recalculate_valuation',
            nonce: jtw_public_params.recalculate_nonce,
            ticker: ticker,
            assumptions: assumptions
        },
        dataType: 'json',
        success: function(response) {
            $container.find('.jtw-case-table').css('opacity', 1); // Restore UI opacity.
            if (response.success && response.data) {
                const data = response.data;
                // Loop through the response and update each case's UI.
                for (const caseType in data) {
                    if (data.hasOwnProperty(caseType)) {
                        const caseData = data[caseType];
                        const $table = $container.find('.jtw-case-table[data-case="' + caseType + '"]');
                        
                        if (caseData.error) {
                            console.error(`Error for ${caseType} case:`, caseData.error);
                            updateInTableValuationGraphic($table, null, currentPrice); // Show error in bar.
                            continue;
                        }
                        
                        // Update the animated valuation bar and the modal content.
                        updateInTableValuationGraphic($table, caseData.fair_value, currentPrice);
                        const modalId = `#jtw-assumptions-modal-${caseType}`;
                        if ($(modalId).length && caseData.modal_html) {
                            $(modalId).find('.jtw-modal-content').html(caseData.modal_html);
                        }
                    }
                }
            } else {
                console.error("Recalculation failed:", response.data ? response.data.message : 'No data in response');
            }
        },
        error: function(jqXHR) {
            $container.find('.jtw-case-table').css('opacity', 1);
            console.error("AJAX error during recalculation.", jqXHR.responseText);
        },
        complete: function() {
            // --- START: RESTORE UI ON COMPLETION ---
            // Restore full opacity to the tables once the AJAX call is finished.
            $container.find('.jtw-case-table').css('opacity', 1);
            // --- END: RESTORE UI ON COMPLETION ---
        }
    });
}, 500);

    $container.on('input', '.jtw-assumption-input', recalculateValuation);
    recalculateValuation();
}

    function initializeSwsValuationGraphic($container) {
        const $swsContainer = $container.find('.jtw-sws-valuation-container');
        if (!$swsContainer.length) return;
    
        const $chart = $swsContainer.find('.jtw-sws-chart');
        const $barRows = $chart.find('.jtw-sws-bar-row');
        const $barWrappers = $chart.find('.jtw-sws-bar-wrapper');
        const $zoneBarRow = $chart.find('.jtw-sws-zone-bar-row');
    
        $barWrappers.css('height', '60px');
    
        $barRows.each(function() {
            const $row = $(this);
            const $labelGroup = $row.find('.jtw-sws-label-group');
            const $barWrapper = $row.find('.jtw-sws-bar-wrapper');
            if ($labelGroup.length && $barWrapper.length) {
                $labelGroup.appendTo($barWrapper);
            }
        });
    
        if ($barRows.length > 1 && $zoneBarRow.length) {
            const verticalPadding = 40; 
            setTimeout(() => {
                if (!$chart.length || !$barRows.length) return;
                
                const chartHeight = $chart.innerHeight();
                const firstBarTop = $barRows.first().position().top;
                const lastBarRow = $barRows.last();
                const lastBarBottom = lastBarRow.position().top + lastBarRow.outerHeight();
    
                const newZoneTop = firstBarTop - verticalPadding;
                const newZoneBottom = chartHeight - lastBarBottom - verticalPadding;
    
                $zoneBarRow.css({
                    'top': newZoneTop + 'px',
                    'bottom': newZoneBottom + 'px'
                });
            }, 50);
        }
    
        // **NEW**: Hide labels initially and add hover/click functionality
        $barWrappers.each(function() {
            const $wrapper = $(this);
            const $label = $wrapper.find('.jtw-sws-label-group');
            //$label.hide(); // Hide initially
    
            /*$wrapper.on('mouseenter', function() {
                const $currentWrapper = $(this);
                const $currentLabel = $currentWrapper.find('.jtw-sws-label-group');
                
                // Check position before fading in to prevent flash of misplaced content
                const wrapperWidth = $currentWrapper.width();
                // Temporarily show to get width, then hide again before fade
                const labelWidth = $currentLabel.show().width(); 
                $currentLabel.hide();
    
                if (wrapperWidth < (labelWidth + 30)) { // 30px is for padding
                    $currentLabel.addClass('outside');
                } else {
                    $currentLabel.removeClass('outside');
                }
                
                $currentLabel.stop(true, true).fadeIn(150);
    
            }).on('mouseleave', function() {
                $(this).find('.jtw-sws-label-group').stop(true, true).fadeOut(150);
            });*/
        });
    }

    function initializeHistoricalCharts($container) {
        const $chartDataScripts = $container.find('.jtw-chart-data');
        if (!$chartDataScripts.length) return;

        let charts = {}; 

        const hasData = (data) => {
            if (!data || !data.labels || data.labels.length === 0) return false;
            if (data.datasets && data.datasets.length > 0) {
                return data.datasets.some(ds => ds.data && ds.data.some(v => v !== null && v !== 0));
            }
             return data.data && data.data.some(v => v !== null && v !== 0);
        };

        $chartDataScripts.each(function() {
            const $script = $(this);
            const $chartItem = $script.closest('.jtw-chart-item');
            const chartId = $script.data('chart-id');
            const chartType = $script.data('chart-type');
            const prefix = $script.data('prefix');
            let annualData;

            let colors = ['rgba(0, 122, 255, 0.6)', 'rgba(0, 122, 255, 1)'];
            const colorsAttr = $script.attr('data-colors');
            if (colorsAttr) {
                try {
                    const parsedColors = JSON.parse(colorsAttr);
                    if(Array.isArray(parsedColors) && parsedColors.length > 0) {
                        colors = parsedColors;
                    }
                } catch (e) {
                    console.error("Failed to parse colors JSON for chart:", chartId, e);
                }
            }

            try {
                annualData = JSON.parse($script.attr('data-annual'));
            } catch (e) {
                console.error("Failed to parse annual data for chart:", chartId, e);
                $chartItem.hide();
                return; 
            }
            
            if (!hasData(annualData)) {
                $chartItem.hide();
            }

            const ctx = document.getElementById(chartId);
            if (!ctx) return;
            
            let datasets;
            const options = {
                responsive: true,
                maintainAspectRatio: false, 
                plugins: {
                    datalabels: {
                        display: false
                    },
                    legend: { 
                        display: !!annualData.datasets,
                        position: 'top',
                        labels: { boxWidth: 12, font: { size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed.y !== null) {
                                    label += prefix + formatLargeNumber(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: false,
                        ticks: { autoSkip: true, maxRotation: 0, font: { size: 10 } },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        stacked: false,
                        ticks: {
                            maxTicksLimit: 5, 
                            callback: function(value) { return prefix + formatLargeNumber(value).replace('.00',''); },
                            font: { size: 10 }
                        }
                    }
                }
            };
            
            if (chartId.includes('price')) {
                options.elements = { point: { radius: 0, hoverRadius: 4 }, line: { tension: 0.1 } };
                options.scales.x.type = 'time';
                options.scales.x.time = { unit: 'year' };
                options.scales.x.grid = { display: false };
            } else if (chartId.includes('cash-and-debt') || chartId.includes('expenses')) {
                options.scales.x.stacked = true;
                options.scales.y.stacked = true;
            }
            
            if (annualData.datasets) {
                 datasets = annualData.datasets.map((dataset, index) => ({
                    label: dataset.label, data: dataset.data,
                    backgroundColor: colors[index] || 'rgba(0, 122, 255, 0.6)',
                }));
            } else { 
                datasets = [{
                    label: 'Value', data: annualData.data,
                    borderColor: colors[0],
                    backgroundColor: chartType === 'line' ? colors[1] : colors[0],
                    fill: chartType === 'line',
                }];
            }

            const config = { type: chartType, data: { labels: annualData.labels, datasets: datasets }, options: options };
            charts[chartId] = new Chart(ctx, config);
        });

        function updateAndFilterCharts() {
            const activePeriod = $container.find('.jtw-period-button.active').data('period');
            const activeCategory = $container.find('.jtw-category-button.active').data('category');

            $container.find('.jtw-chart-item').hide().promise().done(function() {
                $chartDataScripts.each(function() {
                    const $script = $(this);
                    const $chartItem = $script.closest('.jtw-chart-item');
                    const chartCategory = $chartItem.data('category');
                    const chartId = $script.data('chart-id');
                    const chart = charts[chartId];
                    if (!chart) return;

                    const shouldBeVisible = (activeCategory === 'all' || chartCategory === activeCategory);

                    if (shouldBeVisible) {
                        let dataToUse;
                        try {
                            dataToUse = JSON.parse($script.attr('data-' + activePeriod));
                        } catch (e) {
                            return; 
                        }

                        if (hasData(dataToUse)) {
                            chart.data.labels = dataToUse.labels;
                            if (dataToUse.datasets) {
                                chart.data.datasets.forEach((dataset, index) => {
                                    if (dataToUse.datasets[index]) {
                                        dataset.data = dataToUse.datasets[index].data;
                                        dataset.label = dataToUse.datasets[index].label;
                                    }
                                });
                            } else {
                                chart.data.datasets[0].data = dataToUse.data;
                            }
                            
                            $chartItem.show();
                            chart.update();
                        }
                    }
                });
            });
        }

        $container.on('click', '.jtw-period-button', function() {
            const $button = $(this);
            if ($button.hasClass('active')) return;
            $container.find('.jtw-period-button').removeClass('active');
            $button.addClass('active');
            updateAndFilterCharts();
        });

        $container.on('click', '.jtw-category-button', function() {
            const $button = $(this);
            if ($button.hasClass('active')) return;
            $container.find('.jtw-category-button').removeClass('active');
            $button.addClass('active');
            updateAndFilterCharts();
        });
    }

    function initializeHistoricalDataSection($container) {
        const $dataScript = $container.find('#jtw-historical-data-json');
        if (!$dataScript.length) return;

        const chartId = 'jtw-historical-chart-canvas';
    
        const ctx = document.getElementById(chartId);
        const $tableWrapper = $container.find('.jtw-historical-table-wrapper');

        if (!ctx || !$tableWrapper.length) {
             console.error("Historical data chart/table elements not found.");
             return;
        }
    
        let fullHistoricalData;
        try {
            fullHistoricalData = JSON.parse($dataScript.html());
        } catch (e) {
            console.error("Failed to parse historical data JSON:", e);
            return;
        }
    
        if (!fullHistoricalData || fullHistoricalData.length === 0) {
            $container.find('.jtw-historical-combined-wrapper').html('<p>No historical data available to display.</p>');
            return;
        }

        let chart; // Keep a reference to the chart instance
        let activeMetricKey = 'price'; // Default to price chart

        const yAxisAlignPlugin = {
            id: 'yAxisAlignPlugin',
            afterLayout: (chart) => {
                if (!chart.options.plugins.yAxisAlignPlugin.enabled) return;
                const firstColumnWidth = $container.find('.jtw-historical-table thead th:first-child').outerWidth();
                const yAxisWidth = chart.scales.y.width;
                const requiredPadding = firstColumnWidth - yAxisWidth;
                if (requiredPadding > 0 && chart.options.layout.padding.left !== requiredPadding) {
                    chart.options.layout.padding.left = requiredPadding;
                    chart.update();
                }
            }
        };

        const verticalStripesPlugin = {
            id: 'verticalStripes',
            beforeDraw(chart, args, options) {
                const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
                if (x.ticks.length < 2) return;
                const bandWidth = x.getPixelForTick(1) - x.getPixelForTick(0);
                for (let i = 0; i < x.ticks.length; i++) {
                    if (i % 2 !== 0) {
                        const xStart = x.getPixelForTick(i) - (bandWidth / 2);
                        ctx.save();
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
                        ctx.fillRect(xStart, top, bandWidth, bottom - top);
                        ctx.restore();
                    }
                }
            }
        };

        function buildTable(data) {
            const metrics = {
                'price': { 'label': 'Price / Share', 'prefix': '$' },
                'revenue_ps': { 'label': 'Revenue / Share', 'prefix': '$' },
                'eps': { 'label': 'EPS', 'prefix': '$' },
                'cash_flow_ps': { 'label': 'FCF / Share', 'prefix': '$' },
                'book_value_ps': { 'label': 'Book Value / Share', 'prefix': '$' },
                'net_profit_margin': { 'label': 'Net Profit Margin', 'prefix': '%' },
                'return_on_equity': { 'label': 'Return on Equity', 'prefix': '%' },
                'return_on_capital': { 'label': 'Return on Capital', 'prefix': '%' },
            };

            let tableHtml = '<table class="jtw-historical-table"><thead><tr><th>Metric</th>';
            data.forEach(dp => tableHtml += `<th>${dp.year}</th>`);
            tableHtml += '</tr></thead><tbody>';

            Object.entries(metrics).forEach(([key, details]) => {
                tableHtml += `<tr data-metric-key="${key}" data-metric-label="${details.label}" data-metric-prefix="${details.prefix}">`;
                tableHtml += `<td>${details.label}</td>`;
                data.forEach(dp => {
                    const valueKey = (key === 'price') ? 'avg_price' : key;
                    const value = dp[valueKey];
                    let formattedValue = 'N/A';
                    if (isFinite(value)) {
                        if (details.prefix === '%') {
                            formattedValue = Number(value).toFixed(1) + '%';
                        } else {
                            formattedValue = '$' + Number(value).toFixed(1);
                        }
                    }
                    tableHtml += `<td>${formattedValue}</td>`;
                });
                tableHtml += '</tr>';
            });
            tableHtml += '</tbody></table>';
            $tableWrapper.html(tableHtml);
        }

        function updateChartAndTable() {
            const containerWidth = $container.width();
            const yearsToShow = Math.max(3, Math.min(10, Math.floor((containerWidth - 120) / 70))); 
            const slicedData = fullHistoricalData.slice(-yearsToShow);

            buildTable(slicedData);

            $container.find('.jtw-historical-table tbody tr').removeClass('active');
            $container.find(`.jtw-historical-table tbody tr[data-metric-key="${activeMetricKey}"]`).addClass('active');

            if (chart) {
                chart.destroy();
            }

            let config;
            if (activeMetricKey === 'price') {
                config = {
                    type: 'bar',
                    data: {
                        labels: slicedData.map(d => d.year),
                        datasets: [
                            { type: 'bar', label: 'Price Range (High-Low)', yAxisID: 'y', data: slicedData.map(d => (d.price_low && d.price_high) ? [d.price_low, d.price_high] : [null, null]), backgroundColor: 'rgba(0, 122, 255, 0.2)', borderColor: 'rgba(0, 122, 255, 0.5)', borderWidth: 1, barPercentage: 0.5, categoryPercentage: 0.7, borderSkipped: false },
                            { type: 'line', label: 'Average Price', yAxisID: 'y', data: slicedData.map(d => d.avg_price), borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 1)', borderWidth: 2, pointRadius: 0, tension: 0.1 }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, layout: { padding: { left: 0, right: 0 } },
                        scales: { x: { ticks: { display: false }, grid: { display: true, drawOnChartArea: true, color: 'rgba(0, 0, 0, 0.05)', offset: true }, offset: true }, y: { type: 'logarithmic', position: 'left', grid: { display: true, drawOnChartArea: true, color: 'rgba(0, 0, 0, 0.05)' }, title: { display: true, text: 'Price (Log Scale)' }, ticks: { callback: function(value) { return '$' + formatLargeNumber(value, 0); } } } },
                        plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) label += ': '; if (context.dataset.type === 'bar' && Array.isArray(context.raw)) { label += '$' .concat(formatLargeNumber(context.raw[0]), ' - $', formatLargeNumber(context.raw[1])); } else if (context.parsed.y !== null) { label += '$' .concat(formatLargeNumber(context.parsed.y)); } return label; } } }, yAxisAlignPlugin: { enabled: true } }
                    },
                    plugins: [yAxisAlignPlugin, verticalStripesPlugin]
                };
            } else {
                const $activeRow = $container.find(`.jtw-historical-table tbody tr[data-metric-key="${activeMetricKey}"]`);
                const metricLabel = $activeRow.data('metric-label');
                const metricPrefix = $activeRow.data('metric-prefix');
                const newData = slicedData.map(d => d[activeMetricKey]);

                config = {
                    type: 'bar',
                    data: {
                        labels: slicedData.map(d => d.year),
                        datasets: [{
                            label: metricLabel,
                            data: newData,
                            backgroundColor: 'rgba(0, 122, 255, 0.6)'
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, layout: { padding: { left: 0, right: 0 } },
                        scales: { x: { ticks: { display: false }, grid: { display: true, drawOnChartArea: true, color: 'rgba(0, 0, 0, 0.05)', offset: true }, offset: true }, y: { type: 'linear', position: 'left', grid: { display: true, drawOnChartArea: true, color: 'rgba(0, 0, 0, 0.05)' }, title: { display: true, text: metricLabel }, ticks: { callback: function(value) { if (metricPrefix === '%') { return value.toFixed(0) + '%'; } return metricPrefix + formatLargeNumber(value).replace('.00',''); } } } },
                        plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) label += ': '; if (context.parsed.y !== null) { if (metricPrefix === '%') { label += context.parsed.y.toFixed(1) + '%'; } else { label += metricPrefix + formatLargeNumber(context.parsed.y); } } return label; } } }, yAxisAlignPlugin: { enabled: true } }
                    },
                    plugins: [yAxisAlignPlugin, verticalStripesPlugin]
                };
            }
            chart = new Chart(ctx, config);
        }

        $container.on('click', '.jtw-historical-table tbody tr', function() {
            const $row = $(this);
            activeMetricKey = $row.data('metric-key');
            updateChartAndTable();
        });

        const resizeObserver = new ResizeObserver(debounce(updateChartAndTable, 150));
        resizeObserver.observe($container[0]);
        updateChartAndTable(); 
    }

    function initializeHeaderSearch() {
        const $headerForms = $('.jtw-header-lookup-form');
        if (!$headerForms.length) return;

        $headerForms.each(function() {
            const $form = $(this);
            const $input = $form.find('.jtw-header-ticker-input');
            const $button = $form.find('.jtw-header-fetch-button');
            const $resultsContainer = $form.find('.jtw-header-search-results');
            let searchRequest;

            function redirectToAnalysisPage(ticker) {
                window.location.href = jtw_public_params.analysis_page_url + '?jtw_selected_symbol=' + ticker;
            }
            
            $button.on('click', function() {
                const ticker = $input.val().toUpperCase().trim();
                if (ticker) redirectToAnalysisPage(ticker);
            });

            $input.on('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    $button.trigger('click');
                }
            });

            $input.on('keyup', debounce(function(event) {
                if (event.key === "Enter") return;
                const keywords = $input.val().trim();
                if (keywords.length < 1) {
                    $resultsContainer.empty().hide();
                    return;
                }
                $resultsContainer.html('<div class="jtw-search-loading">' + getLocalizedText('text_searching', 'Searching...') + '</div>').show();
                if (searchRequest) searchRequest.abort();
                searchRequest = $.ajax({
                    url: jtw_public_params.ajax_url,
                    type: 'POST',
                    data: { action: 'jtw_symbol_search', jtw_symbol_search_nonce: jtw_public_params.symbol_search_nonce, keywords: keywords },
                    dataType: 'json',
                    success: function(response) {
                        $resultsContainer.empty(); 
                        if (response.success && response.data.matches && response.data.matches.length > 0) {
                            const $ul = $('<ul>').addClass('jtw-symbol-results-list');
                            response.data.matches.forEach(function(match) {
                                let flagHtml = (match.locale && match.locale.toLowerCase() !== 'us') ? `<img class="jtw-result-flag" src="https://flagcdn.com/w20/${match.locale.toLowerCase()}.png" alt="${match.locale.toUpperCase()} flag">` : '';
                                const $li = $('<li>').addClass('jtw-header-result-item').attr('data-symbol', match.ticker);
                                $li.html(`<div class="jtw-result-details"><div class="jtw-result-name">${match.name}</div><div class="jtw-result-meta">${flagHtml}<span class="jtw-result-exchange">${match.exchange}:${match.ticker}</span></div></div>`);
                                $ul.append($li);
                            });
                            $resultsContainer.append($ul).show();
                        } else {
                            $resultsContainer.html('<div class="jtw-no-results">' + getLocalizedText('text_no_results', 'No symbols found.') + '</div>').show();
                        }
                    },
                    error: function(jqXHR, textStatus) {
                        if (textStatus !== 'abort') { 
                            $resultsContainer.html('<div class="jtw-error notice notice-error inline"><p>' + getLocalizedText('text_error', 'Search request failed.') + '</p></div>').show();
                        }
                    }
                });
            }, 500));

            $form.on('click', '.jtw-header-result-item', function() {
                redirectToAnalysisPage($(this).data('symbol'));
            });
        });
        
        $(document).on('click', function(event) {
            if (!$(event.target).closest('.jtw-header-lookup-form').length) {
                $('.jtw-header-search-results').empty().hide();
            }
        });
    }

function initializeAnalyzerPage() {
    const $container = $('.jtw-analyzer-wrapper').first();
    if (!$container.length) return;

    const ticker = new URLSearchParams(window.location.search).get('jtw_selected_symbol');
    if (!ticker) return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const $placeholder = $(entry.target);
                const section = $placeholder.data('section');
                if ($placeholder.data('loaded')) {
                    observer.unobserve(entry.target);
                    return;
                }
                $placeholder.data('loaded', true).html('<div class="jtw-loading-spinner"></div>');
                $.ajax({
                    url: jtw_public_params.ajax_url,
                    type: 'POST',
                    data: { action: 'jtw_fetch_section_data', nonce: jtw_public_params.section_nonce, ticker: ticker.toUpperCase(), section: section },
                    dataType: 'json',
                    success: function(response) {
                        if (response.success && response.data) {
                            // --- START: CURRENCY NOTICE DISPLAY ---
                            // If the response includes a currency notice, display it in the placeholder div.
                            if (response.data.currency_notice) {
                                $('#jtw-currency-notice-placeholder').html(response.data.currency_notice).show();
                            }
                            // --- END: CURRENCY NOTICE DISPLAY ---

                            if (response.data.html) $placeholder.html(response.data.html);
                            
                            if (section === 'intrinsic-valuation' && response.data.modal_html) {
                                for (const caseType in response.data.modal_html) {
                                    const modalId = `#jtw-assumptions-modal-${caseType}`;
                                    $(modalId).find('.jtw-modal-content').html(response.data.modal_html[caseType]);
                                }
                            }

                            // Call the specific initializer function for the loaded section
                            if (section === 'overview') initializeOverviewSection($placeholder);
                            else if (section === 'historical-data') initializeHistoricalDataSection($placeholder);
                            else if (section === 'past-performance') initializeHistoricalCharts($placeholder);
                            else if (section === 'intrinsic-valuation') initializeFairValueAnalysisSection($placeholder);
                            else if (section === 'key-metrics-ratios') initializeKeyMetricsRatiosSection($placeholder);

                        } else {
                            $placeholder.html('<div class="jtw-error notice notice-error inline"><p>' + (response.data.message || getLocalizedText('text_error')) + '</p></div>');
                        }
                    },
                    error: function(jqXHR) {
                        $placeholder.html('<div class="jtw-error notice notice-error inline"><p>AJAX request failed. Server responded: <br><small><code>' + (jqXHR.responseText || getLocalizedText('text_error')) + '</code></small></p></div>');
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: "200px" });

    document.querySelectorAll('.jtw-content-section-placeholder').forEach(p => observer.observe(p));
}

    $(document).ready(function() {
        initializeHeaderSearch();
        initializeAnalyzerPage();

        $('body').on('click', '.jtw-modal-trigger', function(e) {
            e.preventDefault();
            const $button = $(this);
            const targetModal = $button.data('modal-target');
            
            $('.jtw-modal-overlay').fadeIn(200);
            $(targetModal).fadeIn(200);

            // Check if this is the transcript trigger
            if ($button.hasClass('jtw-transcript-trigger')) {
                const ticker = $button.data('ticker');
                const quarter = $button.data('quarter');
                const $modalContent = $('#jtw-transcript-content-target');

                // Show loading spinner
                $modalContent.html('<div class="jtw-loading-spinner"></div>');

                $.ajax({
                    url: jtw_public_params.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'jtw_fetch_transcript',
                        nonce: jtw_public_params.transcript_nonce,
                        ticker: ticker,
                        quarter: quarter
                    },
                    dataType: 'json',
                    success: function(response) {
                        if (response.success && response.data.html) {
                            $modalContent.html(response.data.html);
                        } else {
                            $modalContent.html('<div class="jtw-error"><p>' + (response.data.message || getLocalizedText('text_error')) + '</p></div>');
                        }
                    },
                    error: function() {
                        $modalContent.html('<div class="jtw-error"><p>' + getLocalizedText('text_error') + '</p></div>');
                    }
                });
            }
        });

        const closeModal = () => {
            $('.jtw-modal').fadeOut(200);
            $('.jtw-modal-overlay').fadeOut(200);
        };

        $('body').on('click', '.jtw-modal-close, .jtw-modal-overlay', closeModal);

        $('body').on('click', '.jtw-read-more', function(e) {
            e.preventDefault();
            const $this = $(this);
            const $moreText = $this.siblings('.jtw-description-more');
            const $shortText = $this.siblings('.jtw-description-content');
            $moreText.toggle();
            if ($moreText.is(':visible')) {
                $shortText.html($shortText.html().replace('...', ''));
                $this.text($this.data('less-text'));
            } else {
                $shortText.html($shortText.html() + '...');
                $this.text($this.data('more-text'));
            }
        });
    });

})( jQuery );
