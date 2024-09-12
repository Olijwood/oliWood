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