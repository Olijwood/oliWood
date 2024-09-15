
export const destroyExistingChart = (canvasId) => {
  const canvas = $(`#${canvasId}`);
  if (canvas && canvas.chartInstance) {
      canvas.chartInstance.destroy();  // Destroy any existing chart instance
      canvas.chartInstance = null;     // Clear the reference to avoid memory leaks
  }
};

// helpers.js
export const buildChartDatasets = (data, borderColors, isFilled, legendLabels, isMultiDataset, title) => {
  return Array.isArray(data[0])
    ? data.map((d, i) => ({
        label: legendLabels && legendLabels[i] ? legendLabels[i] : `Dataset ${i + 1}`,
        data: d,
        borderColor: borderColors[i] || '#3e95cd',
        fill: isFilled ? 'start' : false,
        tension: 0.4,
        pointBackgroundColor: borderColors[i] || '#3e95cd'
      }))
    : [{
        label: legendLabels && legendLabels[0] ? legendLabels[0] : title,
        data,
        borderColor: borderColors[0],
        fill: isFilled ? 'start' : false,
        tension: 0.4,
        pointBackgroundColor: borderColors[0] || '#3e95cd'
      }];
};
