/**
 * Public-facing JavaScript for Journey to Wealth plugin.
 *
 * This script powers:
 * 1. The header lookup form, which handles live search and redirects to the analysis page.
 * 2. The main analyzer page, which now uses IntersectionObserver to lazy-load section content.
 * 3. The new Historical Data "Value Line" style chart.
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

    function formatLargeNumber(num, decimals = 2) {
        if (typeof num !== 'number' || num === 0) return '0';
        const absNum = Math.abs(num);
        const sign = num < 0 ? "-" : "";

        if (absNum >= 1.0e+12) return sign + (absNum / 1.0e+12).toFixed(decimals) + 'T';
        if (absNum >= 1.0e+9) return sign + (absNum / 1.0e+9).toFixed(decimals) + 'B';
        if (absNum >= 1.0e+6) return sign + (absNum / 1.0e+6).toFixed(decimals) + 'M';
        if (absNum >= 1.0e+3) return sign + (absNum / 1.0e+3).toFixed(decimals) + 'K';
        return sign + num.toFixed(decimals);
    }

    function initializeKeyMetricsRatiosSection($container) {
        const $calculatorWrapper = $container.find('.jtw-peg-pegy-calculator-container');
        const $donutWrapper = $container.find('.jtw-interactive-donut-container');
        const $interactiveCards = $container.find('.is-interactive');
        const $peToggle = $container.find('#jtw-pe-toggle');

        // --- PEG/PEGY Calculator Logic ---
        const $calculator = $container.find('.jtw-peg-pegy-calculator');
        let updateRatios = () => {}; // Define in outer scope to be accessible by toggle handler

        if ($calculator.length) {
            const $stockPriceInput = $('#jtw-sim-stock-price');
            const $epsInput = $('#jtw-sim-eps');
            const $growthInput = $('#jtw-sim-growth-rate');
            const $dividendInput = $('#jtw-sim-dividend-yield');
            const $pegValueEl = $('#jtw-peg-value');
            const $pegyValueEl = $('#jtw-pegy-value');
            const $pegBar = $('#jtw-peg-bar');
            const $pegyBar = $('#jtw-pegy-bar');
        
            // Assign the actual function logic now that elements are found
            updateRatios = function() {
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
                    $valueEl.text(value.toFixed(2) + 'x');
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
            updateRatios();
        }
        
        // --- Donut Chart Logic ---
        const $donutCards = $interactiveCards.filter('[data-interactive-type="donut"]');
        const ctx = document.getElementById('jtw-key-metrics-donut-chart');
        if (!ctx) return;
        
        const $centerText = $container.find('.jtw-donut-center-text');
        const $topText = $container.find('.jtw-donut-top-text');

        const donutChart = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: [], datasets: [{ data: [], backgroundColor: ['#007aff', '#dee2e6'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
        });

        function updateDonutChart($card) {
            const isForward = $peToggle.is(':checked');
            const data = $card.data();
            let numeratorValue = data.numeratorValue;

            if (data.metric === 'pe') {
                numeratorValue = isForward ? data.forwardNumeratorValue : data.trailingNumeratorValue;
            }
            
            donutChart.data.labels = [data.numeratorLabel, data.denominatorLabel];
            donutChart.data.datasets[0].data = [numeratorValue, data.denominatorValue];
            donutChart.update();

            $topText.html(`<div class="numerator-label">${data.numeratorLabel}</div><div class="numerator-value">US$${formatLargeNumber(numeratorValue)}</div>`);
            $centerText.html(`<div class="denominator-label">${data.denominatorLabel}</div><div class="denominator-value">US$${formatLargeNumber(data.denominatorValue)}</div>`);
        }

        $interactiveCards.on('click', function() {
            const $card = $(this);
            $interactiveCards.removeClass('active');
            $card.addClass('active');

            if ($card.data('interactive-type') === 'donut') {
                $calculatorWrapper.hide();
                $donutWrapper.show();
                updateDonutChart($card);
            } else if ($card.data('interactive-type') === 'calculator') {
                $donutWrapper.hide();
                $calculatorWrapper.show();
            }
        });

        // --- P/E Toggle Logic ---
        $peToggle.on('change', function() {
            const isForward = $(this).is(':checked');
            const type = isForward ? 'forward' : 'trailing';

            // Update P/E card
            const $peCard = $container.find('[data-metric="pe"]');
            const peValue = $peCard.data(`${type}-value`);
            $peCard.find('.jtw-metric-value').text(isFinite(peValue) ? `${parseFloat(peValue).toFixed(1)}x` : 'N/A');

            // Update PEG/PEGY card
            const $pegCard = $container.find('[data-metric="peg-pegy"]');
            const pegValue = $pegCard.data(`${type}-peg`);
            const pegyValue = $pegCard.data(`${type}-pegy`);
            const pegDisplay = isFinite(pegValue) ? `${parseFloat(pegValue).toFixed(1)}x` : 'N/A';
            const pegyDisplay = isFinite(pegyValue) ? `${parseFloat(pegyValue).toFixed(1)}x` : 'N/A';
            $pegCard.find('.jtw-metric-value').text(`${pegDisplay} / ${pegyDisplay}`);
            
            // Update active donut chart if it's the P/E one
            if ($peCard.hasClass('active')) {
                updateDonutChart($peCard);
            }

            // Update EPS in calculator
            const $epsInput = $('#jtw-sim-eps');
            if ($epsInput.length) {
                const epsValue = $epsInput.data(`${type}-eps`);
                $epsInput.val(isFinite(epsValue) ? parseFloat(epsValue).toFixed(2) : 0);
            }

            // **FIX START**: Update Growth Rate in calculator
            const $growthInput = $('#jtw-sim-growth-rate');
            if ($growthInput.length) {
                let newGrowthRate = 5.0; // Default fallback growth rate
                // Recalculate growth rate from the current P/E and PEG values
                if (isFinite(peValue) && isFinite(pegValue) && pegValue > 0) {
                    newGrowthRate = (peValue / pegValue);
                }
                $growthInput.val(parseFloat(newGrowthRate).toFixed(2));
            }
            // **FIX END**

            // Re-run calculator with all updated values
            if ($calculator.length) {
                updateRatios();
            }
        });

        // Initialize with the first interactive card
        if ($donutCards.length > 0) {
            $donutCards.first().trigger('click');
        }
    }

    function initializeValuationChart($container) {
        if (window.jtwFairValueChart instanceof Chart) {
            window.jtwFairValueChart.destroy();
        }
    
        const $chartContainer = $container.find('#jtw-valuation-chart-container');
        if (!$chartContainer.length) return;
    
        const canvas = $container.find('#jtw-valuation-chart')[0];
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const currentPrice = parseFloat($chartContainer.data('current-price'));
        const fairValue = parseFloat($chartContainer.data('fair-value'));
        
        if (isNaN(currentPrice) || isNaN(fairValue) || fairValue <= 0) {
            $chartContainer.html('<p>Valuation data not available.</p>');
            return;
        }
        
        const discountPercent = ((fairValue - currentPrice) / currentPrice) * 100;

        let verdict = 'Fairly Valued';
        let verdictColor = '#d97706';
        
        if (discountPercent > 15) {
            verdict = 'Undervalued';
            verdictColor = '#16a34a';
        } else if (discountPercent < -15) {
            verdict = 'Overvalued';
            verdictColor = '#dc2626';
        }
    
        const centerTextPlugin = {
            id: 'centerText',
            afterDraw: (chart) => {
                const config = chart.options.plugins.centerText;
                if (!config) return;
                const { top, left, width, height } = chart.chartArea;
                const x = left + width / 2;
                const y = top + height / 2;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 1.75rem sans-serif';
                ctx.fillStyle = config.color;
                ctx.fillText(config.verdict, x, y - 30);
                ctx.font = 'bold 1.25rem sans-serif';
                ctx.fillStyle = "#333";
                ctx.fillText('Fair Value:', x, y + 10);
                ctx.font = 'bold 1.75rem sans-serif';
                ctx.fillStyle = config.color;
                ctx.fillText('$' + Math.abs(fairValue).toFixed(1), x, y + 40);
                ctx.restore();
            }
        };
        
        const smallerValue = Math.min(currentPrice, fairValue);
        const largerValue = Math.max(currentPrice, fairValue);
    
        const differenceArcPlugin = {
            id: 'differenceArcPlugin',
            afterDraw: (chart) => {
                const { ctx, chartArea } = chart;
                const { top, left, width, height } = chart.chartArea;
                if (width <= 0) return;
    
                const innerMeta = chart.getDatasetMeta(1);
                const outerMeta = chart.getDatasetMeta(0);
                if (!innerMeta.data.length || !outerMeta.data.length) return;
    
                const arcRadius = outerMeta.data[0].outerRadius + 15;
                const startAngle = outerMeta.data[0].endAngle;
                const endAngle = innerMeta.data[0].endAngle;
                
                ctx.save();
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(left + width / 2, top + height / 2, arcRadius, startAngle, endAngle);
                ctx.stroke();
                
                const drawCap = (angle) => {
                    const capLength = 8;
                    const capRadius = arcRadius - (capLength / 2);
                    const x1 = (left + width / 2) + capRadius * Math.cos(angle);
                    const y1 = (top + height / 2) + capRadius * Math.sin(angle);
                    const x2 = x1 + capLength * Math.cos(angle);
                    const y2 = y1 + capLength * Math.sin(angle);
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                };
                
                ctx.beginPath();
                ctx.lineWidth = 1.5;
                drawCap(startAngle);
                drawCap(endAngle);
                ctx.stroke();

                const text = Math.abs(discountPercent).toFixed(1) + '% ' + (discountPercent > 0 ? 'Discount' : 'Premium');
                const textRadius = arcRadius + 15;
                const midAngle = (startAngle - endAngle) / 2;
                drawArcText(ctx, text, left + width / 2, top + height / 2, textRadius, midAngle);
                ctx.restore();
            }
        };

        function drawArcText(ctx, str, centerX, centerY, radius, angle) {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.font = '16px sans-serif';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            const textWidth = ctx.measureText(str).width;
            const angularWidth = textWidth / radius;
            let currentAngle = angle - angularWidth / 2;
            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                const charWidth = ctx.measureText(char).width;
                const charAngle = currentAngle + (charWidth / 2) / radius;
                ctx.rotate(charAngle);
                ctx.fillText(char, 0, -radius);
                ctx.rotate(-charAngle);
                currentAngle += (charWidth / radius);
            }
            ctx.restore();
        }
    
        window.jtwFairValueChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    label: currentPrice < fairValue ? 'Current Price' : 'Fair Value',
                    data: [smallerValue, largerValue - smallerValue],
                    backgroundColor: ['#212529', 'transparent'],
                    borderColor: '#fff',
                    borderWidth: 0,
                }, {
                    label: currentPrice > fairValue ? 'Current Price' : 'Fair Value',
                    data: [largerValue, 0],
                    backgroundColor: [verdictColor, 'transparent'],                    
                    borderColor: '#fff',
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                spacing: 0.5,
                layout: { padding: 45 },
                animation: { animateScale: true, animateRotate: true },
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                    centerText: { verdict: verdict, discountPercent: discountPercent, color: verdictColor },
                    datalabels: {
                        display: true,
                        formatter: (value, context) => {
                           if (context.dataIndex === 1) return null;
                           return `${context.dataset.label}: $${value.toFixed(2)}`;
                        },
                        color: '#fff',
                        backgroundColor: (context) => context.dataset.backgroundColor[context.dataIndex],
                        borderRadius: 4,
                        padding: { top: 4, bottom: 4, left: 6, right: 6 },
                        font: { weight: '600', size: 11 },
                        align: 'center',
                        anchor: 'center',
                    }
                }
            },
            plugins: [centerTextPlugin, differenceArcPlugin, ChartDataLabels]
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
    
        const chartId = $dataScript.data('chart-id');
        const ctx = document.getElementById(chartId);
        const $table = $container.find('.jtw-historical-table');

        if (!ctx || !$table.length) {
             console.error("Historical data chart/table elements not found.");
             return;
        }
    
        let historicalData;
        try {
            historicalData = JSON.parse($dataScript.html());
        } catch (e) {
            console.error("Failed to parse historical data JSON:", e);
            return;
        }
    
        if (!historicalData || historicalData.length === 0) {
            $container.find('.jtw-historical-combined-wrapper').html('<p>No historical data available to display.</p>');
            return;
        }
    
        const labels = historicalData.map(d => d.year);
        
        const yAxisAlignPlugin = {
            id: 'yAxisAlignPlugin',
            afterLayout: (chart) => {
                if (chart.myAlignPluginHasRun) return;
                const firstColumnWidth = $table.find('thead th:first-child').outerWidth();
                const yAxisWidth = chart.scales.yPrice.width;
                const requiredPadding = firstColumnWidth - yAxisWidth;
                if (requiredPadding > 0) {
                    chart.options.layout.padding.left = requiredPadding;
                    chart.myAlignPluginHasRun = true;
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
            data: {
                labels: labels,
                datasets: [{
                    type: 'bar',
                    label: 'Price Range (High-Low)',
                    data: historicalData.map(d => (d.price_low && d.price_high) ? [d.price_low, d.price_high] : [null, null]),
                    backgroundColor: 'rgba(0, 122, 255, 0.2)',
                    borderColor: 'rgba(0, 122, 255, 0.5)',
                    borderWidth: 1,
                    barPercentage: 0.5,
                    categoryPercentage: 0.7,
                    borderSkipped: false
                }, {
                    type: 'line',
                    label: 'Average Price',
                    data: historicalData.map(d => d.avg_price),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                layout: { padding: { left: 120, right: 0 } },
                scales: {
                    x: {
                        ticks: { display: false },
                        grid: { display: true, drawOnChartArea: true, color: 'rgba(0, 0, 0, 0.05)', offset: true },
                        offset: true
                    },
                    yPrice: {
                        type: 'logarithmic',
                        position: 'left',
                        grid: { display: true, drawOnChartArea: true, color: 'rgba(0, 0, 0, 0.05)' },
                        title: { display: true, text: 'Price (Log Scale)' },
                        ticks: { callback: function(value) { return '$' + formatLargeNumber(value, 0); } }
                    }
                },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.dataset.type === 'bar' && Array.isArray(context.raw)) {
                                     label += '$' .concat(formatLargeNumber(context.raw[0]), ' - $', formatLargeNumber(context.raw[1]));
                                } else if (context.parsed.y !== null) {
                                    label += '$' .concat(formatLargeNumber(context.parsed.y));
                                }
                                return label;
                            }
                        }
                    }
                }
            },
            plugins: [yAxisAlignPlugin, verticalStripesPlugin]
        });
    }

    function setupSWSLayoutInteractivity($contentArea) {
        const $anchorNav = $contentArea.find('.jtw-anchor-nav');
        if (!$anchorNav.length) return;

        const $navLinks = $anchorNav.find('a.jtw-anchor-link');
        const $contentMain = $contentArea.find('.jtw-content-main');
        const $sections = $contentMain.find('.jtw-content-section-placeholder');
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
            const scrollPos = $(document).scrollTop() + offsetTop + 1;
            let activeLink = null;
            $sections.each(function() {
                const top = $(this).offset().top;
                const height = $(this).height();
                const sectionContentHeight = $(this).children().first().height() || height;
                if (top <= scrollPos && (top + sectionContentHeight) > scrollPos) {
                    activeLink = $navLinks.filter('[href="#' + $(this).attr('id') + '"]');
                }
            });
            $navLinks.removeClass('active');
            if (activeLink && activeLink.length > 0) {
                activeLink.addClass('active');
            } else if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
                 $navLinks.last().addClass('active');
            }
        }
        
        $(document).off('scroll.jtw').on('scroll.jtw', onScroll);
        onScroll();
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
                                if (section === 'historical-data') initializeHistoricalDataSection($placeholder);
                                else if (section === 'past-performance') initializeHistoricalCharts($placeholder);
                                else if (section === 'intrinsic-valuation') initializeValuationChart($placeholder);
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
