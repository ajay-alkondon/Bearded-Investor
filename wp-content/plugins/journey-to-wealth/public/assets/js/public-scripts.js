/**
 * Public-facing JavaScript for Journey to Wealth plugin.
 *
 * This script powers:
 * 1. The header lookup form, which handles live search and redirects to the analysis page.
 * 2. The main analyzer page, which now uses IntersectionObserver to lazy-load section content.
 * 3. The new Historical Data "Value Line" style chart.
 * 4. The redesigned Company Overview section with animated bars.
 * 5. The peer comparison feature in the Key Metrics section.
 * 6. The interactive Fair Value Analysis section with a dual-chart layout.
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

        // Animate all other progress bars
        $container.find('.jtw-progress-bar-container').each(function() {
            const $barContainer = $(this);
            const value = parseFloat($barContainer.data('value'));
            const max = parseFloat($barContainer.data('max'));

            if (!isNaN(value) && !isNaN(max) && max > 0) {
                const percentage = Math.max(0, Math.min(100, (value / max) * 100));
                const $fill = $barContainer.find('.jtw-progress-fill');
                
                setTimeout(() => {
                    $fill.css('width', `${percentage}%`);
                }, 100);
            }
        });
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
        $container.on('change', '#jtw-peer-toggle', function() {
            const $toggle = $(this);
            const $table = $container.find('.jtw-metrics-table');
            const $peerCols = $table.find('.jtw-peer-col');
            const $spinner = $container.find('.jtw-peer-loading-spinner');
            const $errorMsg = $container.find('.jtw-peer-error-message');

            if ($toggle.is(':checked')) {
                if (peerDataFetched) {
                    $peerCols.show();
                    $table.addClass('peer-view');
                    return;
                }
                
                $spinner.show();
                $errorMsg.hide();
                const ticker = new URLSearchParams(window.location.search).get('jtw_selected_symbol');

                $.ajax({
                    url: jtw_public_params.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'jtw_fetch_peer_data',
                        nonce: jtw_public_params.peer_nonce,
                        ticker: ticker.toUpperCase(),
                    },
                    dataType: 'json',
                    success: function(response) {
                        $spinner.hide();
                        if (response.success && response.data) {
                            peerDataFetched = true;
                            const peers = Object.keys(response.data);
                            const peerData = response.data;

                            // Update headers
                            if (peers.length > 0) {
                                $table.find('.jtw-peer-1-header').text(peers[0]).show();
                            }
                            if (peers.length > 1) {
                                $table.find('.jtw-peer-2-header').text(peers[1]).show();
                            }
                            
                            // Update regular metric values
                            $table.find('td[data-metric]').each(function() {
                                const $cell = $(this);
                                const metricKey = $cell.data('metric');
                                const suffix = {
                                    trailingPeRatio: 'x', forwardPeRatio: 'x', psRatio: 'x', pbRatio: 'x', evToRevenue: 'x', evToEbitda: 'x',
                                    ttmEpsGrowth: '%', currentYearEpsGrowth: '%', nextYearEpsGrowth: '%', ttmRevenueGrowth: '%', currentYearRevenueGrowth: '%', nextYearRevenueGrowth: '%',
                                    grossMargin: '%', netMargin: '%'
                                }[metricKey] || '';

                                if ($cell.hasClass('jtw-peer-1-value') && peers.length > 0) {
                                    $cell.text(formatMetricValue(peerData[peers[0]][metricKey], suffix)).show();
                                }
                                if ($cell.hasClass('jtw-peer-2-value') && peers.length > 1) {
                                    $cell.text(formatMetricValue(peerData[peers[1]][metricKey], suffix)).show();
                                }
                            });

                             // Update special PEG/PEGY values
                            $table.find('td[data-metric-peg]').each(function() {
                                const $cell = $(this);
                                if ($cell.hasClass('jtw-peer-1-value') && peers.length > 0) {
                                    const peg = formatMetricValue(peerData[peers[0]]['pegRatio'], 'x');
                                    const pegy = formatMetricValue(peerData[peers[0]]['pegyRatio'], 'x');
                                    $cell.text(`${peg} / ${pegy}`).show();
                                }
                                if ($cell.hasClass('jtw-peer-2-value') && peers.length > 1) {
                                    const peg = formatMetricValue(peerData[peers[1]]['pegRatio'], 'x');
                                    const pegy = formatMetricValue(peerData[peers[1]]['pegyRatio'], 'x');
                                    $cell.text(`${peg} / ${pegy}`).show();
                                }
                            });

                            $table.addClass('peer-view');

                        } else {
                            $errorMsg.text(response.data.message || getLocalizedText('text_error')).show();
                            $toggle.prop('checked', false);
                        }
                    },
                    error: function(jqXHR) {
                        $spinner.hide();
                        $errorMsg.text('AJAX request failed. ' + (jqXHR.responseText || '')).show();
                        $toggle.prop('checked', false);
                    }
                });

            } else {
                $peerCols.hide();
                $table.removeClass('peer-view');
            }
        });
    }

    function initializeFairValueAnalysisSection($container) {
        const interactiveChart = initializeInteractiveBarChart($container);
    
        const recalculateValuation = debounce(function() {
            const assumptions = { bear: {}, base: {}, bull: {} };
            let hasAllInputs = true;
    
            $container.find('.jtw-assumption-input').each(function() {
                const $input = $(this);
                const caseType = $input.data('case');
                const metric = $input.data('metric');
                let value = $input.val();
    
                if (value === '') {
                    hasAllInputs = false;
                }
                
                if (metric === 'initialFcfe') {
                    // For the base case, always use the precise raw value to ensure it matches the analyst value
                    if (caseType === 'base') {
                        value = parseFloat($input.data('raw-value'));
                    } else {
                        const multiplier = parseFloat($input.data('multiplier')) || 1;
                        value = parseFloat(value) * multiplier;
                    }
                }

                assumptions[caseType][metric] = value;
            });
    
            if (!hasAllInputs) {
                return; // Don't run calculation if any input is empty
            }
    
            const ticker = new URLSearchParams(window.location.search).get('jtw_selected_symbol');
    
            $container.find('.jtw-assumptions-table').css('opacity', 0.5);
    
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
                    $container.find('.jtw-assumptions-table').css('opacity', 1);
                    if (response.success && response.data) {
                        const data = response.data;
                        // Update table
                        $container.find('.jtw-bear-fv').text('$' + data.bear.fair_value.toFixed(2));
                        $container.find('.jtw-base-fv').text('$' + data.base.fair_value.toFixed(2));
                        $container.find('.jtw-bull-fv').text('$' + data.bull.fair_value.toFixed(2));
                        $container.find('.jtw-bear-buy').text('$' + data.bear.buy_price.toFixed(2));
                        $container.find('.jtw-base-buy').text('$' + data.base.buy_price.toFixed(2));
                        $container.find('.jtw-bull-buy').text('$' + data.bull.buy_price.toFixed(2));
    
                        // Update interactive bar chart
                        if (interactiveChart) {
                            interactiveChart.data.datasets[0].data[1] = data.bull.fair_value;
                            interactiveChart.data.datasets[0].data[2] = data.base.fair_value;
                            interactiveChart.data.datasets[0].data[3] = data.bear.fair_value;
                            interactiveChart.update();
                        }
                    } else {
                        console.error("Recalculation failed:", response.data.message);
                    }
                },
                error: function() {
                    $container.find('.jtw-assumptions-table').css('opacity', 1);
                    console.error("AJAX error during recalculation.");
                }
            });
    
        }, 500);
    
        $container.on('input', '.jtw-assumption-input', recalculateValuation);
        
        // Trigger the initial calculation on load
        recalculateValuation();
    }

    function initializeInteractiveBarChart($container) {
        const $chartContainer = $container.find('#jtw-interactive-chart-container');
        if (!$chartContainer.length) return null;
    
        const canvas = $container.find('#jtw-interactive-valuation-chart')[0];
        if (!canvas) return null;
    
        const currentPrice = parseFloat($chartContainer.data('current-price'));
        const analystFv = parseFloat($chartContainer.data('analyst-fv'));
    
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Analyst FV', 'Bull Case FV', 'Base Case FV', 'Bear Case FV'],
                datasets: [{
                    data: [analystFv, 0, 0, 0], // Analyst value is static, others start at 0
                    backgroundColor: '#82ca9d',
                    borderRadius: 0,
                    borderSkipped: false,
                    maxBarThickness: 40,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                animation: {
                    delay: (context) => {
                        let delay = 0;
                        if (context.type === 'data' && context.mode === 'default') {
                            delay = context.dataIndex * 300;
                        }
                        return delay;
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                    datalabels: {
                        display: true,
                        anchor: 'start',
                        align: 'start',
                        color: 'white',
                        offset: 10,
                        font: {
                            weight: 'bold',
                            size: 12
                        },
                        formatter: function(value, context) {
                            const label = context.chart.data.labels[context.dataIndex];
                            if (value > 0) {
                                const formattedValue = '$' + value.toFixed(2);
                                return `${label}: ${formattedValue}`;
                            }
                            return null;
                        }
                    },
                    annotation: {
                        annotations: {
                            currentPriceLine: {
                                type: 'line',
                                xMin: currentPrice,
                                xMax: currentPrice,
                                borderColor: '#6c757d',
                                borderWidth: 2,
                                borderDash: [6, 6],
                                label: {
                                    content: 'Current Price: $' + currentPrice.toFixed(2),
                                    enabled: true,
                                    position: 'start',
                                    backgroundColor: 'rgba(108, 117, 125, 0.8)',
                                    font: {
                                        size: 10
                                    }
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: { display: false, grid: { display: false } },
                    y: { 
                        grid: { display: false },
                        ticks: {
                            display: false
                        }
                    }
                }
            }
        });
        return chart;
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
    
        const chartId = $dataScript.data('chart-id');
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

        const yAxisAlignPlugin = {
            id: 'yAxisAlignPlugin',
            afterLayout: (chart) => {
                if (!chart.options.plugins.yAxisAlignPlugin.enabled) return;
                const firstColumnWidth = $container.find('.jtw-historical-table thead th:first-child').outerWidth();
                const yAxisWidth = chart.scales.yPrice.width;
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

        const chart = new Chart(ctx, {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                layout: { padding: { left: 0, right: 0 } },
                scales: {
                    x: { ticks: { display: false }, grid: { display: true, drawOnChartArea: true, color: 'rgba(0, 0, 0, 0.05)', offset: true }, offset: true },
                    yPrice: { type: 'logarithmic', position: 'left', grid: { display: true, drawOnChartArea: true, color: 'rgba(0, 0, 0, 0.05)' }, title: { display: true, text: 'Price (Log Scale)' }, ticks: { callback: function(value) { return '$' + formatLargeNumber(value, 0); } } }
                },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) label += ': '; if (context.dataset.type === 'bar' && Array.isArray(context.raw)) { label += '$' .concat(formatLargeNumber(context.raw[0]), ' - $', formatLargeNumber(context.raw[1])); } else if (context.parsed.y !== null) { label += '$' .concat(formatLargeNumber(context.parsed.y)); } return label; } } },
                    yAxisAlignPlugin: { enabled: true }
                }
            },
            plugins: [yAxisAlignPlugin, verticalStripesPlugin]
        });

        function buildTable(data) {
            const metrics = { 'revenue_ps': 'Revenue / Share', 'eps': 'EPS', 'cash_flow_ps': 'FCF / Share', 'book_value_ps': 'Book Value / Share', 'shares_outstanding': 'Shares (M)', 'net_profit_margin': 'Net Profit Margin', 'return_on_equity': 'Return on Equity', 'return_on_capital': 'Return on Capital', 'shareholder_equity': 'Shareholder Equity' };
            let tableHtml = '<table class="jtw-historical-table"><thead><tr><th>Metric</th>';
            data.forEach(dp => tableHtml += `<th>${dp.year}</th>`);
            tableHtml += '</tr></thead><tbody>';
            Object.entries(metrics).forEach(([key, label]) => {
                tableHtml += `<tr><td>${label}</td>`;
                data.forEach(dp => {
                    const value = dp[key];
                    let formattedValue = 'N/A';
                    if (isFinite(value)) {
                        switch (key) {
                            case 'shares_outstanding': formattedValue = formatLargeNumber(value, 0); break;
                            case 'shareholder_equity': formattedValue = (value != 0) ? formatLargeNumber(value) : 'N/A'; break;
                            case 'net_profit_margin': case 'return_on_equity': case 'return_on_capital': formattedValue = `${Number(value).toFixed(1)}%`; break;
                            default: formattedValue = `$${Number(value).toFixed(1)}`;
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

            chart.data.labels = slicedData.map(d => d.year);
            chart.data.datasets = [
                { type: 'bar', label: 'Price Range (High-Low)', yAxisID: 'yPrice', data: slicedData.map(d => (d.price_low && d.price_high) ? [d.price_low, d.price_high] : [null, null]), backgroundColor: 'rgba(0, 122, 255, 0.2)', borderColor: 'rgba(0, 122, 255, 0.5)', borderWidth: 1, barPercentage: 0.5, categoryPercentage: 0.7, borderSkipped: false },
                { type: 'line', label: 'Average Price', yAxisID: 'yPrice', data: slicedData.map(d => d.avg_price), borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 1)', borderWidth: 2, pointRadius: 0, tension: 0.1 }
            ];
            chart.options.plugins.yAxisAlignPlugin.enabled = true; 
            chart.update();
        }

        const resizeObserver = new ResizeObserver(debounce(updateChartAndTable, 150));
        resizeObserver.observe($container[0]);
        updateChartAndTable(); 
    }

    function setupSWSLayoutInteractivity($contentArea) {
        const $dotNavContainer = $contentArea.find('.jtw-mobile-dot-nav');
        const $majorSections = $contentArea.find('.jtw-major-content-group');

        if ($dotNavContainer.length && $majorSections.length) {
            $dotNavContainer.empty();
            $majorSections.each(function() {
                const $section = $(this);
                const sectionId = $section.find('.jtw-content-section-placeholder').attr('id');
                const sectionTitle = $section.find('h2').text();
                if (sectionId && sectionTitle) {
                    $dotNavContainer.append(`<a class="jtw-dot-link" href="#${sectionId}" data-tooltip="${sectionTitle}"></a>`);
                }
            });

            $dotNavContainer.on('click', '.jtw-dot-link', function(e) {
                e.preventDefault();
                const targetId = $(this).attr('href');
                const $targetSection = $(targetId);
                if ($targetSection.length) {
                    $('html, body').animate({ scrollTop: $targetSection.offset().top - 80 }, 500);
                }
            });
        }
        
        const $anchorNav = $contentArea.find('.jtw-anchor-nav');
        const $navLinks = $anchorNav.find('a.jtw-anchor-link');
        const $contentSections = $contentArea.find('.jtw-content-section-placeholder');
        const offsetTop = 150; 

        $navLinks.off('click').on('click', function(e) {
            e.preventDefault();
            const targetId = $(this).attr('href');
            const $targetSection = $(targetId);
            if ($targetSection.length) {
                $('html, body').animate({ scrollTop: $targetSection.offset().top - offsetTop }, 500);
            }
        });

        function onScroll() {
            const scrollPos = $(document).scrollTop();
            const windowHeight = $(window).height();
            
            if ($(window).width() <= 1024) {
                let activeDot = null;
                $majorSections.each(function() {
                    const $section = $(this);
                    const top = $section.offset().top - 100;
                    if (top < scrollPos + windowHeight / 2) {
                        activeDot = $dotNavContainer.find('a[href="#' + $section.find('.jtw-content-section-placeholder').attr('id') + '"]');
                    }
                });
                $dotNavContainer.find('.jtw-dot-link').removeClass('active');
                if(activeDot) activeDot.addClass('active');

            } else {
                let activeLink = null;
                $contentSections.each(function() {
                    const top = $(this).offset().top;
                    const sectionContentHeight = $(this).children().first().height() || $(this).height();
                    if (top <= scrollPos + offsetTop + 1 && (top + sectionContentHeight) > scrollPos + offsetTop + 1) {
                        activeLink = $navLinks.filter('[href="#' + $(this).attr('id') + '"]');
                    }
                });
                
                $navLinks.removeClass('active');
                if (activeLink && activeLink.length > 0) {
                    activeLink.addClass('active');
                    $navLinks.closest('.jtw-nav-group').find('.jtw-nav-major-section').removeClass('active');
                    activeLink.closest('.jtw-nav-group').find('.jtw-nav-major-section').addClass('active');
                }
            }
        }
        
        $(document).off('scroll.jtw').on('scroll.jtw', debounce(onScroll, 50));
        onScroll();
        $(window).on('resize', debounce(onScroll, 100));
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

        setupSWSLayoutInteractivity($container);

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
                                if (response.data.currency_notice) $('#jtw-currency-notice-placeholder').html(response.data.currency_notice).show();
                                if (response.data.html) $placeholder.html(response.data.html);
                                
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
            const targetModal = $(this).data('modal-target');
            $('.jtw-modal-overlay').fadeIn(200);
            $(targetModal).fadeIn(200);
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
