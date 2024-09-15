import { defaultHorizontalBarChartOptions, defaultLineChartOptions } from "./chartOptions.js";


// Helper to create stacked horizontal bar charts
export const createStackedHorizontalBarChart = (canvasId, datasets, chartTitle) => {
    const ctx = $(`#${canvasId}`)[0].getContext('2d');

    // Destroy any existing chart before creating a new one
    destroyExistingChart(canvasId);

    // Chart configuration with default options, merging in dynamic chart title
    const chartConfig = {
        type: 'bar',
        data: {
            labels: [''],  // Empty label to avoid label overflow
            datasets: datasets  // Dynamic datasets passed for gender, rural/urban, etc.
        },
        options: {
            ...defaultHorizontalBarChartOptions,  // Merge default options
            plugins: {
                ...defaultHorizontalBarChartOptions.plugins,
                title: {
                    ...defaultHorizontalBarChartOptions.plugins.title,
                    text: chartTitle  // Set dynamic chart title
                }
            }
        },
        plugins: [ChartDataLabels]
    };

    // Create the new chart
    const newChart = new Chart(ctx, chartConfig);

    // Store the chart instance on the canvas element for future cleanup
    $(`#${canvasId}`).chartInstance = newChart;
};


export const createLineChartWithKeyOLD = (
    canvasId, labels, data, title, borderColors = ['#3e95cd'], isFilled = false, isPercentage = false, 
    isMultiDataset = false, legendLabels = null, applyCustomTickFormat = true) => {
  
    // Destroy any existing chart before creating a new one
    destroyExistingChart(canvasId);
  
    const chartContainer = $(`#${canvasId}`);
    const ctx = chartContainer[0].getContext('2d');
    const spinnerId = `spinner-${canvasId}`;
  
    // Create the chart
    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels[0], // Assuming all datasets have the same labels (dates)
        datasets: Array.isArray(data) && Array.isArray(data[0])
          ? data.map((d, i) => ({
            label: legendLabels && legendLabels[i] ? legendLabels[i] : `Dataset ${i + 1}`,
            data: d,
            borderColor: borderColors[i] || '#3e95cd',
            fill: isFilled ? 'start' : false,
            tension: 0.4,
            pointBackgroundColor: borderColors[i] || '#3e95cd',
          }))
          : [{
            label: legendLabels && legendLabels[0] ? legendLabels[0] : title,
            data,
            borderColor: borderColors[0],
            backgroundColor: borderColors[0] || '#3e95cd',
            fill: isFilled ? 'start' : false,
            tension: 0.4,
            pointBackgroundColor: borderColors[0] || '#3e95cd',
          }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            font: {
              size: 8,
            },
          },
          y: {
            ticks: {
              callback: (value) => {
                if (!applyCustomTickFormat) {
                  return value;  // Return the value without formatting
                }
                const units = ['', 'K', 'M', 'B', 'T'];
                let i = 0;
                while (value >= 1000 && i < units.length) {
                  value /= 1000;
                  ++i;
                  if (value >= 100 && i === 3) {
                    value /= 1000;
                    return `${value.toFixed(1)}T`;
                  }
                }
                return isPercentage ? `${value}%` : `${value.toFixed(0)}${units[i]}`;
              },
            },
          },
        },
        plugins: {
          title: {
            display: false,
            text: title,
            font: {
              size: 18,
              weight: 'bold',
            },
            padding: {
              top: 10,
              bottom: 10,
            },
          },
          legend: {
            display: isMultiDataset,
            position: 'top',
            padding: 5,
            labels: {
              boxWidth: 8,
              font: {
                size: 12,
                weight: 'bold',
              },
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => isPercentage ? `${tooltipItem.formattedValue}%` : tooltipItem.formattedValue,
            },
          },
          hover: {
            mode: 'nearest',
            intersect: true,
          },
        },
        elements: {
          point: {
            radius: 3,
            hoverRadius: 6,
          },
        },
      },
    });
  
    // Store the chart instance on the canvas element for future cleanup
    chartContainer.chartInstance = newChart;
    // Hide the spinner and show the canvas
    $(`#${spinnerId}`).hide();
    chartContainer.show();
  }

import { destroyExistingChart, buildChartDatasets } from './chartUtils.js'; // Assuming you have this utility


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
