import { defaultStackedHorizontalBarChartOptions, defaultHorizontalBarChartOptions, defaultLineChartOptions } from "./chartOptions.js";
import { destroyExistingChart, buildChartDatasets } from './chartUtils.js'; // Assuming you have this utility

// Helper to create horizontal bar charts (stacked or non-stacked)
export const createStackedHorizontalBarChart = (
  canvasId, datasets, chartTitle, isStacked = true, isPct = false, dataMaxD3 = 0
) => {
  

  // Destroy any existing chart before creating a new one
  destroyExistingChart(canvasId);
  const chartContainer = $(`#${canvasId}`);

  const ctx = chartContainer[0].getContext('2d');
  const spinnerId = `spinner-${canvasId}`;

  // find max data value in dataset s
  // Determine the correct options based on stacked or non-stacked configuration
  const chartOptions = isStacked
    ? defaultStackedHorizontalBarChartOptions
    : defaultHorizontalBarChartOptions;

  // Chart configuration with default options, merging in dynamic chart title
  const chartConfig = {
    type: 'bar',
    data: {
      labels: [''],
      datasets,
    },
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

  // Create the new chart
  const newChart = new Chart(ctx, chartConfig);

 
  // Store the chart instance on the canvas element for future cleanup
  chartContainer.chartInstance = newChart;
  $(`#${spinnerId}`).hide();  // Hide the spinner
  chartContainer.show();  // Show the chart canvas
};




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

  // Merge default options with dynamic scales and plugin settings
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

  // Store the chart instance on the canvas element for future cleanup
  chartContainer.chartInstance = newChart;
  $(`#${spinnerId}`).hide();  // Hide the spinner
  chartContainer.show();  // Show the chart canvas
};
