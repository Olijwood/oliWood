import Chart from 'chart.js/auto';  
import ChartDataLabels from 'chartjs-plugin-datalabels'; 

// Register plugins
Chart.register(ChartDataLabels);

import { defaultStackedHorizontalBarChartOptions, defaultHorizontalBarChartOptions, defaultLineChartOptions } from './chartOptions.js';
import { destroyExistingChart, buildChartDatasets } from './chartUtils.js'; 

/* ---------------------------------------------------------------------------
    STACKED HORIZONTAL BAR CHART
--------------------------------------------------------------------------- */

/**
 * Creates a stacked or non-stacked horizontal bar chart.
 * @param {string} canvasId - ID of the canvas element to render the chart.
 * @param {Array} datasets - Data to display in the chart.
 * @param {string} chartTitle - Title of the chart.
 * @param {boolean} isStacked - Determines if the chart is stacked.
 * @param {boolean} isPct - Determines if values should be displayed as percentages.
 * @param {number} dataMaxD3 - Maximum data value for alignment adjustment.
 */
export const createStackedHorizontalBarChart = (
  canvasId, datasets, chartTitle, isStacked = true, isPct = false, dataMaxD3 = 0
) => {
  // Destroy any existing chart before creating a new one
  destroyExistingChart(canvasId);

  const chartContainer = $(`#${canvasId}`);
  const ctx = chartContainer[0].getContext('2d');
  const spinnerId = `spinner-${canvasId}`;

  // Determine the correct chart options based on whether the chart is stacked
  const chartOptions = isStacked
    ? defaultStackedHorizontalBarChartOptions
    : defaultHorizontalBarChartOptions;

  // Configure chart settings
  const chartConfig = {
    type: 'bar',
    data: { labels: [''], datasets },
    options: {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        datalabels: {
          ...chartOptions.plugins.datalabels,
          align: isStacked ? 'center' : (context) => context.dataset.data[0] < dataMaxD3 ? 'end' : 'center',
          anchor: isStacked ? 'center' : (context) => context.dataset.data[0] < dataMaxD3 ? 'end' : 'center',
          formatter: (value) => (isPct ? `${Number(value).toFixed(2)}%` : value),
        },
        tooltip: {
          ...chartOptions.tooltip,     
          callbacks: {
            label: (tooltipItem) =>
              isPct ? `${tooltipItem.formattedValue}%` : tooltipItem.formattedValue,
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  };

  // Create the chart
  const newChart = new Chart(ctx, chartConfig);

  // Store the chart instance for future cleanup and hide spinner
  chartContainer.chartInstance = newChart;
  $(`#${spinnerId}`).hide();  
  chartContainer.show();  
};

/* ---------------------------------------------------------------------------
    LINE CHART WITH KEY
--------------------------------------------------------------------------- */

/**
 * Creates a line chart with customizable options for displaying percentage values, multiple datasets, etc.
 * @param {string} canvasId - ID of the canvas element to render the chart.
 * @param {Array} labels - Labels for the chart (e.g., dates).
 * @param {Array} data - Data to display in the chart.
 * @param {string} title - Title of the chart.
 * @param {Array} borderColors - Colors for the chart lines.
 * @param {boolean} isFilled - Determines if the area under the lines should be filled.
 * @param {boolean} isPercentage - Determines if values should be displayed as percentages.
 * @param {boolean} isMultiDataset - Determines if multiple datasets are being displayed.
 * @param {Array} legendLabels - Labels for the datasets.
 * @param {boolean} applyCustomTickFormat - Whether to apply custom tick formatting.
 */
export const createLineChartWithKey = (
  canvasId, labels, data, title, borderColors = ['#3e95cd'], isFilled = false, 
  isPercentage = false, isMultiDataset = false, legendLabels = null, applyCustomTickFormat = true
) => {
  // Destroy any existing chart before creating a new one
  destroyExistingChart(canvasId);

  const chartContainer = $(`#${canvasId}`);
  const ctx = chartContainer[0].getContext('2d');
  const spinnerId = `spinner-${canvasId}`;

  // Prepare datasets
  const datasets = buildChartDatasets(data, borderColors, isFilled, legendLabels, isMultiDataset, title);

  // Configure chart options with dynamic settings
  const options = {
    ...defaultLineChartOptions,
    scales: {
      ...defaultLineChartOptions.scales,
      y: {
        ticks: {
          callback: (value) => {
            if (!applyCustomTickFormat) return value;

            // Format large numbers with suffixes like K, M, B
            const units = ['', 'K', 'M', 'B', 'T'];
            let i = 0;
            while (value >= 1000 && i < units.length) {
              value /= 1000;
              i++;
              if (value >= 100 && i === 3) {
                // If the value is greater than or equal to 100B, display as X.XT
                value /= 1000;
                return `${value.toFixed(1)}T`;
              }
            }
            return isPercentage ? `${value}%` : `${value.toFixed(0)}${units[i]}`;
          }
        }
      }
    },
    plugins: {
      ...defaultLineChartOptions.plugins,
      legend: {
        display: isMultiDataset,
        ...defaultLineChartOptions.plugins.legend,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => isPercentage ? `${tooltipItem.formattedValue}%` : tooltipItem.formattedValue
        }
      }
    }
  };

  // Create the chart
  const newChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels[0], // Assuming all datasets have the same labels (dates)
      datasets
    },
    options
  });

  // Store the chart instance for future cleanup and hide spinner
  chartContainer.chartInstance = newChart;
  $(`#${spinnerId}`).hide();  
  chartContainer.show();  
};