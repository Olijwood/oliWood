import { overviewConfig } from "../config/indicatorConfig.js";

// Generates table row HTML for displaying demographic data
export const generateTableRow = (dataLabel, dataId) => `
  <tr>
    <td>${dataLabel}</td>
    <td class="fw-bold text-end" id="${dataId}"></td>
  </tr>
`;

// Generates chart row HTML for displaying charts
export const generateChartRow = (chartId) => {`
  <tr>
    <td colspan="2" >
      <div class="chart-container">
        <div class="demographics-chart">
          <canvas id="${chartId}"></canvas>
        </div>
      </div>
    </td>
  </tr>
`};

export const injectOverviewSection = (containerId, title, icon, dataLabels = [], 
  dataIds = [], chartIds = [], dataUnits = [], chartTitles = [], chartUnits = []) => {
  let content = `
      <div class="card mb-3">
          <div class="card-header">
              <h6 class="text-center"><i class="${icon} me-2"></i>${title}</h6>
          </div>
          <div class="card-body">
              <table class="table table-bordered table-hover">
                  <tbody>
  `;

  // Inject data fields
  dataIds.forEach((dataId, i) => {
      const dataLabel = dataLabels[i];
      const dataUnit = dataUnits[i];
      const unitCite = dataUnit != '' ? `<cite class="text-muted small">(${dataUnit})</cite>` : '';

      
      content += `
          <tr>
              <td>${dataLabel} ${unitCite}</td>
              <td class="fw-bold text-end" id="${dataId}"></td>
          </tr>
      `;
  });

  // Inject chart placeholders if any
  chartIds.forEach((chartId, i) => {
      const chartUnit = chartUnits[i];
      const unitCite = chartUnit != '' ? `<cite class="text-muted small">(${chartUnit})</cite>` : '';
      content += `
          <tr>
              <td colspan="2" class="chart-td">
                  <h4 class="text-center">${chartTitles[i]} ${unitCite}</h4>
                  <div class="chart-container">
                      <div class="demographics-chart">
                          <canvas id="${chartId}"></canvas>
                      </div>
                  </div>
              </td>
          </tr>
      `;
  });

  content += `
                  </tbody>
              </table>
          </div>
      </div>
  `;

  $(`#${containerId}`).html(content);
};


export const createChartContainer = (chartId, title) => {
  // Create the card structure with a spinner and canvas
  return `
    <div class="card mb-3">
      <div class="card-header">
        <h6>${title}</h6>
      </div>
      <div class="card-body">
        <div class="spinner-container">
          <div class="spinner" id="spinner-${chartId}"></div>
        </div>
        <canvas id="${chartId}" width="965" height="482" style="display: none;"></canvas>
      </div>
    </div>`;
};


// export const injectChartsForTab = (tabId) => {
//   const tabConfig = tabChartConfig[tabId];

//   if (!tabConfig || !tabConfig.charts) {
//     console.error('No charts found for this tab:', tabId);
//     return;
//   }

//   tabConfig.charts.forEach(chart => {
//     $(`#${chart.id}-container`).html(createChartContainer(chart.id, chart.title));
//   });
// }