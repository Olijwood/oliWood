export const injectSection = (containerId, title, data = [], charts = [], icon='') => {
  let content = `
      <div class="card mb-3">
          <div class="card-header">
              <h6 class="text-center"><i class="${icon} me-2"></i>${title}</h6>
          </div>
          <div class="card-body">
              <table class="table table-bordered table-hover">
                  <tbody>
  `;

  // Inject data fields (as rows)
  data.forEach(item => {
    const unitCite = item.unit ? `<cite class="text-muted small">(${item.unit})</cite>` : '';
    content += `
        <tr>
            <td>${item.label} ${unitCite}</td>
            <td class="fw-bold text-end" id="${item.id}"></td>
        </tr>
    `;
  });

  // Inject charts (if any)
  charts.forEach(chart => {
    const unitCite = chart.unit ? `<cite class="text-muted small">(${chart.unit})</cite>` : '';
    content += `
        <tr>
            <td colspan="2" class="chart-td">
                <h6 class="text-center">${chart.title} ${unitCite}</h6>
                <div class="spinner-container">
                  <div class="spinner" id="spinner-${chart.id}"></div>
                </div>
                <div class="chart-container">
                    <div class="demographics-chart">
                        <canvas id="${chart.id}"></canvas>
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
