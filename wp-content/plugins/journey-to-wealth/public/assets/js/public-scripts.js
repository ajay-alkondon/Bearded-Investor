/**
 * Public-facing JavaScript for Journey to Wealth plugin.
 *
 * This script powers:
 * 1. The header lookup form, which handles live search and redirects to the analysis page.
 * 2. The main analyzer page, which now uses IntersectionObserver to lazy-load section content.
 * 3. The new Historical Data "Value Line" style chart.
 * 4. The redesigned Company Overview section with animated bars.
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
                const $indicator = $priceRangeBar.find('.jtw-price-range-indicator');
                const $fill = $priceRangeBar.find('.jtw-progress-fill');
                
                setTimeout(() => {
                    $indicator.css('left', `calc(${percentage}% - 1.5px)`); // Adjust for half the indicator's width
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
        const $calculatorWrapper = $container.find('.jtw-peg-pegy-calculator-container');
        const $donutWrapper = $container.find('.jtw-interactive-donut-container');
        const $interactiveCards = $container.find('.is-interactive');
        const $peToggle = $container.find('#jtw-pe-toggle');

        const $calculator = $container.find('.jtw-peg-pegy-calculator');
        let updateRatios = () => {}; 

        if ($calculator.length) {
            const $stockPriceInput = $('#jtw-sim-stock-price');
            const $epsInput = $('#jtw-sim-eps');
            const $growthInput = $('#jtw-sim-growth-rate');
            const $dividendInput = $('#jtw-sim-dividend-yield');
            const $pegValueEl = $('#jtw-peg-value');
            const $pegyValueEl = $('#jtw-pegy-value');
            const $pegBar = $('#jtw-peg-bar');
            const $pegyBar = $('#jtw-pegy-bar');
        
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
            updateRatios();
        }
        
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

        $peToggle.on('change', function() {
            const isForward = $(this).is(':checked');
            const type = isForward ? 'forward' : 'trailing';

            const $peCard = $container.find('[data-metric="pe"]');
            const peValue = $peCard.data(`${type}-value`);
            $peCard.find('.jtw-metric-value').text(isFinite(peValue) ? `${parseFloat(peValue).toFixed(1)}x` : 'N/A');

            const $pegCard = $container.find('[data-metric="peg-pegy"]');
            const pegValue = $pegCard.data(`${type}-peg`);
            const pegyValue = $pegCard.data(`${type}-pegy`);
            const pegDisplay = isFinite(pegValue) ? `${parseFloat(pegValue).toFixed(1)}x` : 'N/A';
            const pegyDisplay = isFinite(pegyValue) ? `${parseFloat(pegyValue).toFixed(1)}x` : 'N/A';
            $pegCard.find('.jtw-metric-value').text(`${pegDisplay} / ${pegyDisplay}`);
            
            if ($peCard.hasClass('active')) {
                updateDonutChart($peCard);
            }

            const $epsInput = $('#jtw-sim-eps');
            if ($epsInput.length) {
                const epsValue = $epsInput.data(`${type}-eps`);
                $epsInput.val(isFinite(epsValue) ? parseFloat(epsValue).toFixed(1) : 0);
            }

            const $growthInput = $('#jtw-sim-growth-rate');
            if ($growthInput.length) {
                let newGrowthRate = 5.0; 
                if (isFinite(peValue) && isFinite(pegValue) && pegValue > 0) {
                    newGrowthRate = (peValue / pegValue);
                }
                $growthInput.val(parseFloat(newGrowthRate).toFixed(1));
            }

            if ($calculator.length) {
                updateRatios();
            }
        });

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

        function lightenColor(hex, percent) {
            hex = hex.replace(/^#/, '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const p = percent / 100;
            const newR = Math.min(255, r + (255 - r) * p);
            const newG = Math.min(255, g + (255 - g) * p);
            const newB = Math.min(255, b + (255 - b) * p);
            return `rgb(${parseInt(newR)}, ${parseInt(newG)}, ${parseInt(newB)})`;
        }
        
        const gradientBlack = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradientBlack.addColorStop(0, '#888'); // Lighter grey start
        gradientBlack.addColorStop(1, '#212529'); // Darker end
        
        const gradientVerdict = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradientVerdict.addColorStop(0, lightenColor(verdictColor, 75)); // Lighter start for a steeper gradient
        gradientVerdict.addColorStop(1, verdictColor); // Darker end

    
        const centerTextPlugin = {
            id: 'centerText',
            afterDraw: (chart) => {
                const config = chart.options.plugins.centerText;
                if (!config) return;
                const { top, left, width, height } = chart.chartArea;
                if (width <= 0 || height <= 0) return;
                const x = left + width / 2;
                const y = top + height / 2;

                const baseFontSize = Math.min(width, height) / 14;

                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                ctx.font = `bold ${baseFontSize * 1.2}px sans-serif`;
                ctx.fillStyle = config.color;
                ctx.fillText(config.verdict, x, y - (baseFontSize * 1.5));
                
                ctx.font = `bold ${baseFontSize * 0.9}px sans-serif`;
                ctx.fillStyle = "#333";
                ctx.fillText('Fair Value:', x, y + (baseFontSize * 0.5));
                
                ctx.font = `bold ${baseFontSize * 1.2}px sans-serif`;
                ctx.fillStyle = config.color;
                ctx.fillText('$' + Math.abs(fairValue).toFixed(1), x, y + (baseFontSize * 2));
                
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
                ctx.strokeStyle = verdictColor;
                ctx.lineWidth = 15;
                ctx.beginPath();
                ctx.arc(left + width / 2, top + height / 2, arcRadius, startAngle, endAngle);
                ctx.stroke();
                
                const drawCap = (angle) => {
                    const capLength = 1;
                    const x = (left + width / 2) + arcRadius * Math.cos(angle);
                    const y = (top + height / 2) + arcRadius * Math.sin(angle);
                    ctx.beginPath();
                    ctx.moveTo(x - capLength / 2 * Math.sin(angle), y + capLength / 2 * Math.cos(angle));
                    ctx.lineTo(x + capLength / 2 * Math.sin(angle), y - capLength / 2 * Math.cos(angle));
                    ctx.stroke();
                };
                
                drawCap(startAngle);
                drawCap(endAngle);

                const text = Math.abs(discountPercent).toFixed(1) + '% ' + (discountPercent > 0 ? 'Discount' : 'Premium');
                const textRadius = arcRadius + 18;
                const midAngle = (startAngle - endAngle) / 2;
                drawArcText(chart, ctx, text, left + width / 2, top + height / 2, textRadius, midAngle);
                ctx.restore();
            }
        };

        function drawArcText(chart, ctx, str, centerX, centerY, radius, angle) {
            ctx.save();
            ctx.translate(centerX, centerY);
            
            const baseFontSize = Math.min(chart.chartArea.width, chart.chartArea.height) / 25;
            ctx.font = `${baseFontSize}px sans-serif`;
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const totalWidth = ctx.measureText(str).width;
            const totalAngle = totalWidth / radius;

            let currentAngle = angle - totalAngle / 2;

            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                const charWidth = ctx.measureText(char).width;
                const charAngle = charWidth / radius;
                
                const rotation = currentAngle + charAngle / 2;

                ctx.save();
                ctx.rotate(rotation);
                ctx.fillText(char, 0, -radius);
                ctx.restore();
                
                currentAngle += charAngle;
            }
            ctx.restore();
        }
    
        window.jtwFairValueChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    label: 'Current Price',
                    data: [currentPrice, fairValue - currentPrice],
                    backgroundColor: [gradientBlack, 'transparent'],
                    borderWidth: 0,
                }, {
                    label: 'Fair Value',
                    data: [fairValue, 0],
                    backgroundColor: [gradientVerdict, 'transparent'],                    
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                spacing: 0.5,
                layout: { padding: 40 },
                animation: { animateScale: true, animateRotate: true },
                animationDelay: 500,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                    centerText: { verdict: verdict, discountPercent: discountPercent, color: verdictColor },
                    datalabels: {
                        display: true,
                        formatter: (value, context) => {
                           if (context.dataIndex === 1) return null;
                           return `${context.dataset.label}: $${value.toFixed(1)}`;
                        },
                        color: '#fff',
                        backgroundColor: '#333',
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

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (window.jtwFairValueChart) {
                    window.jtwFairValueChart.resize();
                }
            }
        });

        resizeObserver.observe(canvas.parentElement);
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
            const docHeight = $(document).height();
            
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
                    activeLink.parent().addClass('active');
                    if (activeLink.closest('.jtw-nav-group-single').length > 0) {
                         activeLink.addClass('active');
                    }
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
