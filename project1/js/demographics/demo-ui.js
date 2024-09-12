const overviewConfig = [
  { 
    id: 'populationOverview-container', 
    title: 'Population', 
    icon: 'fas fa-users text-info', 
    dataLabel: ['Population', 'Population Growth'],
    dataId: ['totalPopulation', 'populationGrowth'], 
    chartId: ['populationAgeChart', 'genderChart', 'urbanRuralChart'] 
  },
  { 
    id: 'economicOverview-container', 
    title: 'Economic Data', 
    icon: 'fas fa-chart-line text-success',
    dataLabel: ['GDP', 'GDP Per Capita', 'Inflation Rate'],
    dataId: ['gdpCurrent', 'gdpPerCapita', 'inflationRate'], 
    chartId: [] 
  },
  { 
    id: 'healthOverview-container', 
    title: 'Health and Life', 
    icon: 'fas fa-heartbeat text-danger', 
    dataLabel: ['Life Expectancy', 'Fertility Rate', 'Health Expenditure per Capita'],
    dataId: ['lifeExpectancy', 'fertilityRate', 'healthExpenditure'], 
    chartId: [] 
  }
];

function injectOverviewSection(containerId, title, icon, dataIds = [], chartIds = []) {
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
        content += `
            <tr>
                <td>${overviewConfig.find(c => c.dataId.includes(dataId)).dataLabel[i]}</td>
                <td class="fw-bold text-end" id="${dataId}"></td>
            </tr>
        `;
    });

    // Inject chart placeholders if any
    chartIds.forEach(chartId => {
        content += `
            <tr>
                <td colspan="2">
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
}

function injectOverview() {
    overviewConfig.forEach(config => {
        injectOverviewSection(config.id, config.title, config.icon, config.dataId, config.chartId);
    });
}


const tabChartConfig = {
  '#populationDemoTab': {
    charts: [
      { id: 'totalPopulationChart', title: 'Total Population Over Time' },
      { id: 'populationGrowthChart', title: 'Population Growth (%)' },
      { id: 'ageDistributionChart', title: 'Age Distribution (%)' },
      { id: 'genderDistributionChart', title: 'Gender Distribution (%)' },
      { id: 'urbanRuralHistChart', title: 'Urban vs Rural Distribution (%)' }
    ],
    indicatorGroup: 'population'
  },
  '#healthDemoTab': {
    charts: [
      { id: 'lifeExpectancyChart', title: 'Life Expectancy Over Time (Y)' },
      { id: 'fertilityRateChart', title: 'Fertility Rate Over Time (Births per Woman)' },
      { id: 'healthExpenditureChart', title: 'Health Expenditure per Capita' }
    ],
    indicatorGroup: 'health'
  },
  '#economyDemoTab': {
    charts: [
      { id: 'GDPChart', title: 'GDP Over Time ($)' },
      { id: 'GDPPerCapChart', title: 'GDP per Capita ($)' },
      { id: 'InflationChart', title: 'Inflation Rate (%)' }
    ],
    indicatorGroup: 'economy'
  },
  '#environmentDemoTab': {
    charts: [
      { id: 'fossilFuelChart', title: 'Fossil Fuel Consumption (Tonnes per Capita)' }
    ],
    indicatorGroup: 'environment'
  }
};

function createChartContainer(chartId, title) {
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
  }
  
  
function injectChartsForTab(tabId) {
  const tabConfig = tabChartConfig[tabId];
  
  if (!tabConfig || !tabConfig.charts) {
    console.error('No charts found for this tab:', tabId);
    return;
  }

  tabConfig.charts.forEach(chart => {
    $(`#${chart.id}-container`).html(createChartContainer(chart.id, chart.title));
  });
}