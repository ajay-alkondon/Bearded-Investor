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

    const fillMissingPoints = (data, dates) => {
        const filledData = [];
        const dataMap = new Map(data.map(d => [d.x, d.y]));
        for (const date of dates) {
            filledData.push({ x: date, y: dataMap.has(date) ? dataMap.get(date) : null });
        }
        return filledData;
    };

    const createGradient = (ctx, area, color) => {
        if (!area) return null;
        const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
        const colorRGB = {
            '#007bff': '0, 122, 255',
            '#2ecc71': '46, 204, 113',
            '#ffc107': '255, 193, 7',
            '#fd7e14': '253, 126, 20'
        }[color] || '0, 122, 255';
        gradient.addColorStop(0, `rgba(${colorRGB}, 0)`);
        gradient.addColorStop(1, `rgba(${colorRGB}, 0.4)`);
        return gradient;
    };

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

        // --- START: AD FIX ---
        // Manually push the ad after a short delay. This gives the browser's
        // rendering engine time to calculate the container's width.
        const $adPlaceholder = $container.find('.jtw-ad-placeholder .adsbygoogle');
        if ($adPlaceholder.length) {
            setTimeout(function() {
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                } catch (e) {
                    console.error("Adsbygoogle push error:", e);
                }
            }, 150); // A 150ms delay is usually sufficient
        }
        // --- END: AD FIX ---
    }

    function initializeValuationSection($container) {
        const $contentDiv = $container.find('#section-intrinsic-valuation-content');
        if (!$contentDiv.length) {
            console.error("Intrinsic valuation content div not found.");
            return;
        }

        const $valuationWrapper = $contentDiv.find('.jtw-valuation-tables-wrapper');
        const $loader = $contentDiv.find('.jtw-valuation-loader');
        $loader.hide();
        $valuationWrapper.show();

        const componentRatios = $contentDiv.data('ratios');
        const currentPrice = $contentDiv.data('current-price');
        const sharesOutstanding = parseFloat($contentDiv.data('shares-outstanding'));
        const ticker = $contentDiv.data('ticker');

        const $swsContainer = $contentDiv.find('.jtw-sws-valuation-container');
        $swsContainer.find('.jtw-sws-ticker').text(ticker);

        $container.on('click', '.jtw-model-selector', function(e) {
            e.stopPropagation();
            const $selector = $(this);
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
            $row.attr('data-selected-model', modelKey);
            $selector.removeClass('open');
            recalculateValuation();
        });

        $(document).on('click', function() {
            $('.jtw-model-selector').removeClass('open');
        });

        function formatNumberForDisplay(num, unitLabel = '', decimals = 1) {
            if (typeof num !== 'number' || isNaN(num)) return '-';
            let divisor = 1;
            if (unitLabel.includes('(Billions)')) divisor = 1e9;
            else if (unitLabel.includes('(Millions)')) divisor = 1e6;
            else if (unitLabel.includes('(Thousands)')) divisor = 1e3;
            return (num / divisor).toFixed(decimals);
        }

        function updateSwsValuationGraphic(fairValue, currentPrice, modelName) {
            if (typeof fairValue !== 'number' || isNaN(fairValue) || fairValue <= 0) {
                $swsContainer.hide();
                return;
            }
            $swsContainer.show();
            $swsContainer.find('.jtw-sws-model-name').text(modelName);

            const diff = fairValue - currentPrice;
            const pctDiff = (diff / currentPrice) * 100;

            const $statusContainer = $swsContainer.find('.jtw-sws-main-metric');
            const $statusPct = $statusContainer.find('.jtw-sws-percentage');
            const $statusText = $statusContainer.find('.jtw-sws-status');

            $statusContainer.removeClass('jtw-sws-status-positive jtw-sws-status-negative jtw-sws-status-neutral');
            $statusPct.text(Math.abs(pctDiff).toFixed(1) + '%');

            if (pctDiff > 20) {
                $statusText.text('Undervalued');
                $statusContainer.addClass('jtw-sws-status-positive');
            } else if (pctDiff < -20) {
                $statusText.text('Overvalued');
                $statusContainer.addClass('jtw-sws-status-negative');
            } else {
                $statusText.text('Fairly Valued');
                $statusContainer.addClass('jtw-sws-status-neutral');
            }

            const undervaluedBoundary = fairValue * 0.8;
            const overvaluedBoundary = fairValue * 1.2;
            const rangeMax = Math.max(currentPrice, overvaluedBoundary) * 1.2;
            
            // --- START: MODIFIED ZONE WIDTH CALCULATION ---
            const undervaluedWidthPct = (undervaluedBoundary / rangeMax) * 100;
            const aboutRightWidthPct = ((overvaluedBoundary - undervaluedBoundary) / rangeMax) * 100;
            const overvaluedWidthPct = 100 - undervaluedWidthPct - aboutRightWidthPct; // Explicitly calculate the remainder

            $swsContainer.find('.jtw-sws-zone.undervalued').css('width', undervaluedWidthPct + '%');
            $swsContainer.find('.jtw-sws-zone.about-right').css('width', aboutRightWidthPct + '%');
            $swsContainer.find('.jtw-sws-zone.overvalued').css('width', overvaluedWidthPct + '%'); // Apply the width to the overvalued zone
            // --- END: MODIFIED ZONE WIDTH CALCULATION ---
            
            const currentPriceWidthPct = (currentPrice / rangeMax) * 100;
            const fairValueWidthPct = (fairValue / rangeMax) * 100;

            const $currentPriceRow = $swsContainer.find('.current-price-row');
            const $fairValueRow = $swsContainer.find('.fair-value-row');

            $currentPriceRow.find('strong').text(' ' + '$' + currentPrice.toFixed(2));
            $fairValueRow.find('strong').text(' ' + '$' + fairValue.toFixed(2));
            
            $currentPriceRow.find('.jtw-sws-bar-wrapper').css('width', currentPriceWidthPct + '%');
            $fairValueRow.find('.jtw-sws-bar-wrapper').css('width', fairValueWidthPct + '%');
        }

        const recalculateValuation = debounce(function() {
            if (!componentRatios || $.isEmptyObject(componentRatios)) {
                return;
            }
            if (!sharesOutstanding || sharesOutstanding === 0) {
                return;
            }

            const assumptions = { 
                yearlyRevGrowth: {},
                yearlyNIGrowth: {}
            };
            let hasAllInputs = true;
            const $tablesContainer = $container.find('.jtw-valuation-tables-wrapper');

            $tablesContainer.find('input[data-metric="yearlyRevGrowth"]').each(function() {
                const $input = $(this);
                const year = $input.data('year');
                const growthRateValue = parseFloat($input.val());
                if (!isNaN(growthRateValue)) {
                    assumptions.yearlyRevGrowth[year] = growthRateValue;
                } else {
                    hasAllInputs = false;
                }
            });

            $tablesContainer.find('input[data-metric="yearlyNIGrowth"]').each(function() {
                const $input = $(this);
                const year = $input.data('year');
                const growthRateValue = parseFloat($input.val());
                if (!isNaN(growthRateValue)) {
                    assumptions.yearlyNIGrowth[year] = growthRateValue;
                } else {
                    hasAllInputs = false;
                }
            });
            
            assumptions.model = 'dcf';

            const revenueUnitLabel = $tablesContainer.find('.jtw-revenue-label').first().text();
            let previousRevenue = parseFloat($tablesContainer.find('.jtw-revenue-result[data-year="1"]').data('raw-value'));
            let previousNetIncome = parseFloat($tablesContainer.find('.jtw-net-income-result[data-year="1"]').data('raw-value'));

            const epsYear0 = parseFloat($tablesContainer.find('.jtw-eps-result[data-year="0"]').text());
            const peYear0 = parseFloat($tablesContainer.find('.jtw-pe-result[data-year="0"]').text());
            if (!isNaN(epsYear0) && !isNaN(peYear0)) {
                $tablesContainer.find('.jtw-moe-result-cell[data-year="0"]').text('$' + (epsYear0 * peYear0).toFixed(2));
            }

            const epsYear1 = parseFloat($tablesContainer.find('.jtw-eps-result[data-year="1"]').text());
            const peYear1 = parseFloat($tablesContainer.find('.jtw-pe-input[data-year="1"]').val());
            if (!isNaN(epsYear1) && !isNaN(peYear1)) {
                $tablesContainer.find('.jtw-moe-result-cell[data-year="1"]').text('$' + (epsYear1 * peYear1).toFixed(2));
            }

            for (let i = 2; i <= 4; i++) {
                const growthRateInput = $tablesContainer.find('input[data-metric="yearlyRevGrowth"][data-year="' + i + '"]');
                const niGrowthRateInput = $tablesContainer.find('input[data-metric="yearlyNIGrowth"][data-year="' + i + '"]');
                const peInput = $tablesContainer.find('.jtw-pe-input[data-year="' + i + '"]');
                
                if (peInput.length && peInput.val() === '') {
                    hasAllInputs = false;
                }
                
                const growthRate = parseFloat(growthRateInput.val()) / 100 || 0;
                const projectedRevenue = previousRevenue * (1 + growthRate);
                $tablesContainer.find('.jtw-revenue-result[data-year="' + i + '"]').text(formatNumberForDisplay(projectedRevenue, revenueUnitLabel));
                previousRevenue = projectedRevenue;

                const niGrowthRate = parseFloat(niGrowthRateInput.val()) / 100 || 0;
                let projectedNetIncome = previousNetIncome * (1 + niGrowthRate);

                if (projectedNetIncome > projectedRevenue) {
                    projectedNetIncome = projectedRevenue;
                }
                
                $tablesContainer.find('.jtw-net-income-result[data-year="' + i + '"]').text(formatNumberForDisplay(projectedNetIncome, revenueUnitLabel));
                previousNetIncome = projectedNetIncome;

                const netIncomeMargin = (projectedRevenue > 0) ? (projectedNetIncome / projectedRevenue) * 100 : 0;
                $tablesContainer.find('.jtw-net-income-margin-result[data-year="' + i + '"]').text(netIncomeMargin.toFixed(1) + '%');

                const eps = Number(sharesOutstanding) > 0 ? projectedNetIncome / Number(sharesOutstanding) : 0;
                $tablesContainer.find('.jtw-eps-result[data-year="' + i + '"]').text(eps.toFixed(2));
                
                if (peInput.length) {
                    const peRatio = parseFloat(peInput.val()) || 0;
                    const sharePrice = eps * peRatio;
                    $tablesContainer.find('.jtw-moe-result-cell[data-year="' + i + '"]').text('$' + sharePrice.toFixed(2));
                }
            }

            if (!hasAllInputs) {
                return;
            }

            const ticker = new URLSearchParams(window.location.search).get('jtw_selected_symbol');
            $swsContainer.css('opacity', 0.5);

            $.ajax({
                url: jtw_public_params.ajax_url,
                type: 'POST',
                data: {
                    action: 'jtw_recalculate_valuation',
                    nonce: jtw_public_params.recalculate_nonce,
                    ticker: ticker,
                    assumptions: { base: assumptions } 
                },
                dataType: 'json',
                success: function(response) {
                    if (response.success && response.data) {
                        const caseData = response.data.base;
                        if (caseData.error) {
                            $swsContainer.hide();
                            console.error('Valuation Error:', caseData.error);
                        } else {
                            updateSwsValuationGraphic(caseData.fair_value, currentPrice, caseData.valuation_label);
                            const modalId = '#jtw-assumptions-modal';
                            if ($(modalId).length && caseData.modal_html) {
                                $(modalId).find('.jtw-modal-content').html(caseData.modal_html);
                            }
                        }
                    } else {
                        $swsContainer.hide();
                        console.error("Recalculation failed:", response.data ? response.data.message : 'No data in response');
                    }
                },
                error: function() {
                    $swsContainer.hide();
                    console.error("AJAX error during recalculation.");
                },
                complete: function() {
                    $swsContainer.css('opacity', 1);
                }
            });
        }, 500);
        
        recalculateValuation();
        $container.on('input', '.jtw-assumption-input', recalculateValuation);
        initializeKeyMetricValuationsChart($container);
    }

    function initializePerformanceSection($container) {
function initializeRevenueChart() {
    const $chartCanvas = $container.find('#jtw-earnings-revenue-forecast-chart');
    if (!$chartCanvas.length) return;

    const chartDataRaw = $container.find('#jtw-earnings-revenue-forecast-data').html();
    if (!chartDataRaw) return;

    const parsedData = JSON.parse(chartDataRaw);
    let revenueChart;

    function drawRevenueChart(period) {
        if (revenueChart) {
            revenueChart.destroy();
        }

        const periodKey = period === 'annual' ? 'chart_points_annual' : 'chart_points_quarterly';
        const periodData = parsedData[periodKey] || {};
        const forecast_start_date = period === 'annual' 
            ? parsedData.forecast_start_date 
            : parsedData.forecast_start_date_quarterly;

        const isValidDate = (d) => d && d.x && !isNaN(new Date(d.x).getTime());
        const revenue = (periodData.revenue || []).filter(isValidDate);
        const earnings = (periodData.earnings || []).filter(isValidDate);
        const fcf = (periodData.fcf || []).filter(isValidDate);
        const op_cash = (periodData.op_cash || []).filter(isValidDate);

        const getOrCreateTooltip = (chart) => {
            let tooltipEl = chart.canvas.parentNode.querySelector('div.jtw-chart-tooltip');
            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.className = 'jtw-chart-tooltip';
                chart.canvas.parentNode.appendChild(tooltipEl);
            }
            return tooltipEl;
        };

        const externalTooltipHandler = (context) => {
            const { chart, tooltip } = context;
            const tooltipEl = getOrCreateTooltip(chart);

            if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
            }

            const date = new Date(tooltip.dataPoints[0].parsed.x);
            let innerHtml = '<div class="tooltip-header">' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</div>';
            innerHtml += '<div class="tooltip-body">';

            tooltip.body.forEach((body, i) => {
                if (chart.isDatasetVisible(tooltip.dataPoints[i].datasetIndex)) {
                    const colors = tooltip.labelColors[i];
                    const label = body.lines[0].split(':')[0];
                    const value = body.lines[0].split(':')[1];
                    const style = `background: ${colors.backgroundColor}; border-color: ${colors.borderColor};`;
                    const colorSpan = `<span class="tooltip-color-box" style="${style}"></span>`;
                    innerHtml += `<div class="tooltip-line">${colorSpan} ${label}: <strong>${value}</strong></div>`;
                }
            });

            innerHtml += '</div>';
            tooltipEl.innerHTML = innerHtml;

            const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
            tooltipEl.style.opacity = 1;
            tooltipEl.style.left = positionX + tooltip.caretX + 'px';
            tooltipEl.style.top = positionY + tooltip.caretY + 'px';
        };

        const allDates = [...new Set([...revenue.map(d => d.x), ...earnings.map(d => d.x), ...fcf.map(d => d.x), ...op_cash.map(d => d.x)])].sort();

        let minDate, maxDate;
        if (allDates.length > 0) {
            minDate = new Date(allDates[0]);
            minDate.setMonth(minDate.getMonth() - 1);
            maxDate = new Date(allDates[allDates.length - 1]);
            maxDate.setMonth(maxDate.getMonth() + 1);
        }

        const datasets = [
            { label: 'Revenue', data: revenue, color: '#007bff' },
            { label: 'Earnings', data: earnings, color: '#2ecc71' },
            { label: 'Free Cash Flow', data: fcf, color: '#ffc107' },
            { label: 'Cash From Op', data: op_cash, color: '#fd7e14' },
        ].map(ds => ({
            label: ds.label,
            data: fillMissingPoints(ds.data, allDates),
            borderColor: ds.color,
            backgroundColor: (context) => createGradient(context.chart.ctx, context.chart.chartArea, ds.color),
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3,
            fill: 'start'
        }));

        const annotationsAreVisible = !!forecast_start_date;

        const ctx = $chartCanvas[0].getContext('2d');
        revenueChart = new Chart(ctx, {
            type: 'line',
            data: { labels: allDates, datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: period === 'annual' ? 'year' : 'quarter' },
                        grid: { display: false },
                        min: minDate ? minDate.toISOString() : undefined,
                        max: maxDate ? maxDate.toISOString() : undefined
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { callback: (val) => formatLargeNumber(val, 'US$', 1) }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: false,
                        external: externalTooltipHandler
                    },
                    annotation: {
                        annotations: {
                            forecastLine: {
                                display: annotationsAreVisible,
                                type: 'line',
                                scaleID: 'x',
                                value: forecast_start_date,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                borderWidth: 1,
                                borderDash: [6, 6],
                            },
                            forecastBox: {
                                display: annotationsAreVisible,
                                type: 'box',
                                scaleID: 'x',
                                xMin: forecast_start_date,
                                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            },
                            // --- FIX: Use explicit getTime() for correct coordinate calculation ---
                            pastLabel: {
                                display: annotationsAreVisible,
                                type: 'label',
                                xValue: forecast_start_date,
                                yValue: 0,
                                content: 'Past',
                                color: '#aaa',
                                font: { size: 12 },
                                xAdjust: -100,
                                yAdjust: 0,
                                textAlign: 'right',
                            },
                            forecastLabel: {
                                display: annotationsAreVisible,
                                type: 'label',
                                xValue: forecast_start_date,
                                yValue: 0,
                                content: 'Analysts Forecasts',
                                color: '#aaa',
                                font: { size: 12 },
                                xAdjust: 100,
                                yAdjust: 0,
                                textAlign: 'left',
                            }
                        }
                    }
                }
            }
        });
    }

    drawRevenueChart('annual');

    $container.find('.jtw-revenue-period-toggle .jtw-period-button').on('click', function() {
        const $button = $(this);
        if ($button.hasClass('active')) return;
        $container.find('.jtw-revenue-period-toggle .jtw-period-button').removeClass('active');
        $button.addClass('active');
        drawRevenueChart($button.data('period'));
    });

    $container.find('.jtw-chart-legend').on('click', '.jtw-legend-item[data-chart-id="jtw-earnings-revenue-forecast-chart"]', function() {
        const $item = $(this);
        const datasetIndex = $item.data('dataset-index');
        
        $item.toggleClass('active');
        if (revenueChart) {
            const isVisible = revenueChart.isDatasetVisible(datasetIndex);
            revenueChart.setDatasetVisibility(datasetIndex, !isVisible);
            revenueChart.update();
        }
    });
}

function initializeEpsChart() {
    const $chartCanvas = $container.find('#jtw-eps-growth-forecast-chart');
    if (!$chartCanvas.length) return;

    const chartDataRaw = $container.find('#jtw-eps-growth-forecast-data').html();
    if (!chartDataRaw) return;
    const parsedData = JSON.parse(chartDataRaw);
    
    let epsChart;

    const getOrCreateTooltip = (chart) => {
        let tooltipEl = chart.canvas.parentNode.querySelector('div.jtw-chart-tooltip');
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'jtw-chart-tooltip';
            chart.canvas.parentNode.appendChild(tooltipEl);
        }
        return tooltipEl;
    };

    const externalTooltipHandler = (context) => {
        const { chart, tooltip } = context;
        const tooltipEl = getOrCreateTooltip(chart);

        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
        }

        const date = new Date(tooltip.dataPoints[0].parsed.x);
        let innerHtml = '<div class="tooltip-header">' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</div>';
        innerHtml += '<div class="tooltip-body">';

        tooltip.body.forEach((body, i) => {
            const dataPoint = tooltip.dataPoints[i];
            if (chart.isDatasetVisible(dataPoint.datasetIndex) && dataPoint.datasetIndex > 1) { 
                const colors = tooltip.labelColors[i];
                const label = body.lines[0].split(':')[0];
                const value = body.lines[0].split(':')[1];
                const style = `background: ${colors.backgroundColor}; border-color: ${colors.borderColor};`;
                const colorSpan = `<span class="tooltip-color-box" style="${style}"></span>`;
                innerHtml += `<div class="tooltip-line">${colorSpan} ${label}: <strong>${value}</strong></div>`;
            }
        });

        innerHtml += '</div>';
        tooltipEl.innerHTML = innerHtml;

        const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
        tooltipEl.style.opacity = 1;
        tooltipEl.style.left = positionX + tooltip.caretX + 'px';
        tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    };

    function drawEpsChart(period) {
        if (epsChart) {
            epsChart.destroy();
        }

        const periodData = parsedData[period] || {};
        const actual_eps = periodData.actual_eps || [];
        const estimated_eps = periodData.estimated_eps || [];
        const estimate_range_low = periodData.estimate_range_low || [];
        const estimate_range_high = periodData.estimate_range_high || [];
        
        const forecast_start_date = period === 'annual' 
            ? parsedData.forecast_start_date_annual
            : parsedData.forecast_start_date_quarterly;
        
        const annotationsAreVisible = !!forecast_start_date;

        const ctx = $chartCanvas[0].getContext('2d');
        epsChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Estimate Range', data: estimate_range_high,
                        borderColor: 'transparent', backgroundColor: 'rgba(0, 122, 255, 0.2)',
                        pointRadius: 0, hoverRadius: 0, fill: '+1',
                    },
                    {
                        label: 'Low Estimate', data: estimate_range_low,
                        borderColor: 'transparent', backgroundColor: 'rgba(0, 122, 255, 0.2)',
                        pointRadius: 0, hoverRadius: 0, fill: false,
                    },
                    {
                        label: 'Estimated EPS', data: estimated_eps,
                        borderColor: '#007bff', borderWidth: 2, pointRadius: 3,
                        hoverRadius: 6, hoverBorderWidth: 2, tension: 0.3, fill: false,
                    },
                    {
                        label: 'Actual EPS', data: actual_eps,
                        borderColor: '#2ecc71', borderWidth: 2, pointRadius: 3,
                        hoverRadius: 6, hoverBorderWidth: 2, tension: 0.3, fill: false,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                // --- START: CORRECTED HOVER LOGIC ---
                onHover: (event, chartElement, chart) => {
                    // First, reset all points on all relevant datasets to their default radius.
                    chart.data.datasets.forEach((dataset, datasetIndex) => {
                        if (datasetIndex > 1) { // Skip the transparent range-filler datasets
                            const meta = chart.getDatasetMeta(datasetIndex);
                            meta.data.forEach(point => point.options.radius = 3);
                        }
                    });

                    // Then, if hovering over a point, enlarge only the points at that specific index.
                    if (chartElement.length > 0) {
                        const activeIndex = chartElement[0].index;
                        chart.data.datasets.forEach((dataset, datasetIndex) => {
                            if (datasetIndex > 1) {
                                const activeMetaPoint = chart.getDatasetMeta(datasetIndex).data[activeIndex];
                                if (activeMetaPoint) {
                                    activeMetaPoint.options.radius = 6;
                                }
                            }
                        });
                    }
                    
                    chart.update();
                },
                // --- END: CORRECTED HOVER LOGIC ---
                scales: {
                    x: { type: 'time', time: { unit: period === 'annual' ? 'year' : 'quarter' }, grid: { display: false } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { callback: (val) => '$' + val.toFixed(2) } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: false,
                        external: externalTooltipHandler
                    },
                    annotation: {
                        annotations: {
                            forecastLine: {
                                display: annotationsAreVisible,
                                type: 'line',
                                scaleID: 'x',
                                value: forecast_start_date,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                borderWidth: 1,
                                borderDash: [6, 6]
                            },
                            forecastBox: {
                                display: annotationsAreVisible,
                                type: 'box',
                                scaleID: 'x',
                                xMin: forecast_start_date,
                                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            },
                            // --- FIX: Use explicit getTime() for correct coordinate calculation ---
                            pastLabel: {
                                display: annotationsAreVisible,
                                type: 'label',
                                xValue: forecast_start_date,
                                yValue: 0,
                                content: 'Past',
                                color: '#aaa',
                                font: { size: 12 },
                                xAdjust: -100,
                                yAdjust: 0,
                                textAlign: 'right',
                            },
                            forecastLabel: {
                                display: annotationsAreVisible,
                                type: 'label',
                                xValue: forecast_start_date,
                                yValue: 0,
                                content: 'Analysts Forecasts',
                                color: '#aaa',
                                font: { size: 12 },
                                xAdjust: 50,
                                yAdjust: 0,
                                textAlign: 'left',
                            }
                        }
                    }
                }
            }
        });
    }

    drawEpsChart('annual');

    $container.find('.jtw-eps-period-toggle .jtw-period-button').on('click', function() {
        const $button = $(this);
        if ($button.hasClass('active')) return;
        $container.find('.jtw-eps-period-toggle .jtw-period-button').removeClass('active');
        $button.addClass('active');
        drawEpsChart($button.data('period'));
    });

    $container.find('.jtw-chart-legend').on('click', '.jtw-legend-item[data-chart-id="jtw-eps-growth-forecast-chart"]', function() {
        const $item = $(this);
        const datasetIndex = $item.data('dataset-index');
        
        $item.toggleClass('active');
        if (epsChart) {
            const isVisible = epsChart.isDatasetVisible(datasetIndex);
            epsChart.setDatasetVisibility(datasetIndex, !isVisible);

            if (datasetIndex === 2) {
                epsChart.setDatasetVisibility(0, !isVisible);
                epsChart.setDatasetVisibility(1, !isVisible);
            }

            epsChart.update();
        }
    });
}

// In journey-to-wealth/public/assets/js/public-scripts.js,
// replace the entire initializeSankeyChart function with this final version.

function initializeSankeyChart($container) {
    const $chartContainer = $container.find('#jtw-sankey-chart-container');
    const $dataScript = $container.find('#jtw-sankey-chart-data');
    if (!$chartContainer.length || !$dataScript.length) return;

    const sankeyDataByYear = JSON.parse($dataScript.html());
    const availableYears = Object.keys(sankeyDataByYear).sort();
    if (availableYears.length === 0) return;

    const latestYear = availableYears[availableYears.length - 1];
    
    // --- START: SLIDER HTML GENERATION ---
    const $sliderContainer = $container.find('#jtw-sankey-year-slider-container');
    let sliderHtml = '<div class="jtw-year-slider-labels">';
    availableYears.forEach(year => {
        sliderHtml += `<span class="jtw-year-label" data-year="${year}">${year}</span>`;
    });
    sliderHtml += '</div>';
    sliderHtml += `<input type="range" min="0" max="${availableYears.length - 1}" value="${availableYears.length - 1}" class="jtw-year-slider" id="jtw-sankey-year-slider">`;
    $sliderContainer.html(sliderHtml);
    // --- END: SLIDER HTML GENERATION ---

    const formatSankeyTooltip = function() {
        if (this.point.isNode) {
            return `<b>${this.point.name}</b><br/>Total: ${formatLargeNumber(this.point.sum, '$', 2)}`;
        }
        const { from, to, weight, custom: percentage } = this.point;
        let tooltipText = `<b>${from} → ${to}</b><br/>Value: ${formatLargeNumber(weight, '$', 2)}`;
        if (percentage) {
            tooltipText += `<br/>${percentage} of ${from}`;
        }
        return tooltipText;
    };
    
    const sankeyChart = Highcharts.chart($chartContainer[0], {
        chart: { backgroundColor: 'transparent' },
        title: { text: null },
        plotOptions: {
            sankey: {
                link: {
                    borderRadius: 0
                }
            }
        },
        series: [{
            keys: ['from', 'to', 'weight', 'custom'],
            data: sankeyDataByYear[latestYear],
            type: 'sankey',
            link: { borderRadius: 0 },
            name: 'Financial Flow',
            nodeWidth: 30,
            nodePadding: 120,
            dataLabels: {
                enabled: true,
                nodeFormatter: function() { return `<b>${this.point.id}</b><br/>${formatLargeNumber(this.point.sum, '$', 2)}`; },
                style: { color: '#e2e8f0', textOutline: 'none', fontWeight: '500', fontSize: '13px' }
            },
            nodes: [
                { id: 'Revenue Streams', color: '#3b82f6' }, { id: 'Revenue', color: '#60a5fa' },
                { id: 'Gross Profit', color: '#2dd4bf' }, { id: 'Cost of Sales', color: '#f59e0b' },
                { id: 'Expenses', color: '#d97706' }, { id: 'Earnings', color: '#10b981' },
                { id: 'Sales & Marketing', color: '#8b5cf6' }, { id: 'Research & Development', color: '#a855f7' },
                { id: 'General & Admin', color: '#d8b4fe' }, { id: 'Non-Operating Expenses', color: '#fca5a5' }
            ]
        }],
        tooltip: {
            formatter: formatSankeyTooltip,
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            style: { color: '#FFFFFF' }
        },
        credits: { enabled: false }
    });

    // --- START: SLIDER EVENT LISTENER ---
    $sliderContainer.on('input', '#jtw-sankey-year-slider', function() {
        const selectedYear = availableYears[$(this).val()];
        if (sankeyDataByYear[selectedYear]) {
            sankeyChart.series[0].setData(sankeyDataByYear[selectedYear], true);
        }
        $sliderContainer.find('.jtw-year-label').removeClass('active');
        $sliderContainer.find(`.jtw-year-label[data-year="${selectedYear}"]`).addClass('active');
    });
    // --- END: SLIDER EVENT LISTENER ---

    $sliderContainer.find(`.jtw-year-label[data-year="${latestYear}"]`).addClass('active');
}

        // --- Main execution ---
        initializeRevenueChart();
        initializeEpsChart();
        initializeSankeyChart($container);
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

        $container.on('change', '#jtw-peer-toggle', function() {
            if ($(this).is(':checked')) {
                fetchPeerData();
            } else {
                $container.find('#jtw-peer-1-input').val('');
                $container.find('#jtw-peer-2-input').val('');
                $table.find('.jtw-peer-1-value, .jtw-peer-2-value').text('-');
                peerDataFetched = false;
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
            
            $('#jtw-peer-toggle').prop('checked', false);

            fetchPeerData(peersToFetch);
        });
    }

    function initializeKeyMetricValuationsChart($container) {
        const $chartCanvas = $container.find('#jtw-kmv-chart');
        const $historicalDataScript = $container.find('#jtw-historical-ratios-data');
        
        if (!$chartCanvas.length || !$historicalDataScript.length) {
            return;
        }

        // --- FIX: Destroy the existing chart before creating a new one ---
        const existingChart = Chart.getChart($chartCanvas[0]);
        if (existingChart) {
            existingChart.destroy();
        }
        // --- END FIX ---

        const historicalData = JSON.parse($historicalDataScript.html());
        const currentMetrics = JSON.parse($container.find('#jtw-current-key-metrics-data').html());
        let chartInstance;

        const createGradient = (ctx, area) => {
            const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
            gradient.addColorStop(0, 'rgba(0, 122, 255, 0)');
            gradient.addColorStop(1, 'rgba(0, 122, 255, 0.4)');
            return gradient;
        };

        function updateChart() {
            const selectedMetric = $container.find('#jtw-kmv-metric-selector').val();
            const selectedRange = $container.find('.jtw-kmv-time-btn.active').data('range');
            const data = historicalData[selectedMetric] || [];
            const endDate = new Date();
            let startDate = new Date();
            switch(selectedRange) {
                case '3M': startDate.setMonth(endDate.getMonth() - 3); break;
                case '1Y': startDate.setFullYear(endDate.getFullYear() - 1); break;
                case '3Y': startDate.setFullYear(endDate.getFullYear() - 3); break;
                case '5Y': startDate.setFullYear(endDate.getFullYear() - 5); break;
            }
            const filteredData = data.filter(point => new Date(point.x) >= startDate && point.y !== null);

            if (chartInstance) {
                chartInstance.data.labels = filteredData.map(d => d.x);
                chartInstance.data.datasets[0].data = filteredData.map(d => d.y);
                chartInstance.update();
            } else {
                const ctx = $chartCanvas[0].getContext('2d');
                chartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: filteredData.map(d => d.x),
                        datasets: [{
                            label: 'Ratio',
                            data: filteredData.map(d => d.y),
                            borderColor: 'rgba(0, 122, 255, 1)',
                            backgroundColor: (context) => {
                                const chart = context.chart;
                                const {ctx, chartArea} = chart;
                                if (!chartArea) return null;
                                return createGradient(ctx, chartArea);
                            },
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0.1,
                            fill: 'start',
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { type: 'time', time: { unit: 'month' }, grid: { display: false } },
                            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: { mode: 'index', intersect: false, callbacks: { label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}x` } }
                        }
                    }
                });
            }
            
            const $currentValueDisplay = $container.find('.jtw-kmv-current-value');
            const currentMetricKey = $container.find('#jtw-kmv-metric-selector option:selected').data('key-metric-key');
            const currentValue = currentMetrics[currentMetricKey];
            const currentLabel = $container.find('#jtw-kmv-metric-selector option:selected').text();
            
            if (typeof currentValue === 'number') {
                $currentValueDisplay.find('.jtw-sws-percentage').text(currentValue.toFixed(1) + 'x');
                $currentValueDisplay.find('.jtw-sws-status').text(`Current ${currentLabel}`);
                $currentValueDisplay.show();
            } else {
                $currentValueDisplay.hide();
            }
        }

        $container.on('change', '#jtw-kmv-metric-selector', updateChart);
        $container.on('click', '.jtw-kmv-time-btn', function() {
            $container.find('.jtw-kmv-time-btn').removeClass('active');
            $(this).addClass('active');
            updateChart();
        });

        updateChart();
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
                    
                    // Prevent reloading if already loaded
                    if ($placeholder.data('loaded')) {
                        observer.unobserve(entry.target);
                        return;
                    }
                    
                    $placeholder.data('loaded', true).html('<div class="jtw-loading-spinner"></div>');
                    
                    // --- AJAX Call Logic is now directly inside the observer ---
                    $.ajax({
                        url: jtw_public_params.ajax_url,
                        type: 'POST',
                        data: { 
                            action: 'jtw_fetch_section_data', 
                            nonce: jtw_public_params.section_nonce, 
                            ticker: ticker.toUpperCase(), 
                            section: section 
                        },
                        dataType: 'json',
                        success: function(response) {
                            if (response.success && response.data) {
                                if (response.data.currency_notice) {
                                    $('#jtw-currency-notice-placeholder').html(response.data.currency_notice).show();
                                }

                                if (response.data.html) {
                                    $placeholder.html(response.data.html);
                                }
                                
                                // Call the appropriate initializer function for the loaded section
                                if (section === 'overview') {
                                    initializeOverviewSection($placeholder);
                                } else if (section === 'intrinsic-valuation') {
                                    // This now correctly calls the renamed function
                                    initializeValuationSection($placeholder); 
                                } else if (section === 'performance') {
                                    initializePerformanceSection($placeholder);
                                } else if (section === 'key-metrics-ratios') {
                                    initializeKeyMetricsRatiosSection($placeholder);
                                }

                            } else {
                                $placeholder.html('<div class="jtw-error notice notice-error inline"><p>' + (response.data ? response.data.message : getLocalizedText('text_error', 'An error occurred.')) + '</p></div>');
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

            if ($button.hasClass('jtw-transcript-trigger')) {
                const ticker = $button.data('ticker');
                const quarter = $button.data('quarter');
                const $modalContent = $('#jtw-transcript-content-target');

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