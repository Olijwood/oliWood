/**
 * Destroys any existing chart instance on a canvas to avoid memory leaks or conflicts.
 * @param {string} canvasId - The ID of the canvas element.
 */
export const destroyExistingChart = (canvasId) => {
  const canvas = $(`#${canvasId}`);
  if (canvas && canvas.chartInstance) {
    // Destroy existing chart instance and clear reference
    canvas.chartInstance.destroy();
    canvas.chartInstance = null;
  }
};

/**
 * Builds chart datasets for Chart.js by dynamically configuring dataset properties.
 * Supports multi-dataset and single dataset configurations.
 * 
 * @param {Array} data - Array of data points or multiple datasets.
 * @param {Array} borderColors - Array of border colors for datasets.
 * @param {boolean} isFilled - Whether the chart should be filled (line charts).
 * @param {Array} legendLabels - Labels for each dataset.
 * @param {boolean} isMultiDataset - If true, the function will handle multiple datasets.
 * @param {string} title - The title for the dataset (used when there is a single dataset).
 * 
 * @returns {Array} - Array of dataset configurations for Chart.js.
 */
export const buildChartDatasets = (data, borderColors, isFilled, legendLabels, isMultiDataset, title) => {
  // Handle multi-dataset chart configuration
  if (isMultiDataset && Array.isArray(data[0])) {
    return data.map((dataset, i) => ({
      label: legendLabels && legendLabels[i] ? legendLabels[i] : `Dataset ${i + 1}`,
      data: dataset,
      borderColor: borderColors[i] || '#3e95cd',
      fill: isFilled ? 'start' : false,
      tension: 0.4,
      pointBackgroundColor: borderColors[i] || '#3e95cd',
    }));
  }

  // Handle single dataset chart configuration
  return [{
    label: legendLabels && legendLabels[0] ? legendLabels[0] : title,
    data,
    borderColor: borderColors[0] || '#3e95cd',
    fill: isFilled ? 'start' : false,
    tension: 0.4,
    pointBackgroundColor: borderColors[0] || '#3e95cd',
  }];
};