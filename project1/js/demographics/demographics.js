const indicatorGroups = {
  population: {
      "totalPopulation": "SP.POP.TOTL",
      "populationGrowth": "SP.POP.GROW",
      "workingAgePopulation": "SP.POP.1564.TO.ZS",
      "elderlyPopulation": "SP.POP.65UP.TO.ZS",
      "femalePopulation": "SP.POP.TOTL.FE.ZS",
      "urbanPopulation": "SP.URB.TOTL.IN.ZS"
  },
  economy: {
      "gdpCurrent": "NY.GDP.MKTP.CD",
      "gdpPerCapita": "NY.GDP.PCAP.CD",
      "inflationRate": "FP.CPI.TOTL.ZG"
  },
  health: {
      "lifeExpectancy": "SP.DYN.LE00.IN",
      "fertilityRate": "SP.DYN.TFRT.IN",
      "healthExpenditure": "SH.XPD.CHEX.PC.CD"
  },
  environment: {
    "fossilFuelConsumption": "EN.ATM.CO2E.PC"
  }
};

const fetchDemographics = () => {
  const countryCode = $('#hiddenCountrySelected').val();

  $.ajax({
    url: `php/demographics/getDemographics.php`,
    type: 'GET',
    dataType: 'json',
    data: { country: countryCode },
    success: (response) => {
      if (response.error) {
        console.error('Error fetching demographics data:', response.error);
      } else {
        updateDemographicsUI(response);
      }
    },
    error: () => {
      console.error('Failed to fetch demographics data.');
    }
  });
};


const mappedNotNullOverviewData = (demographicsData, indicatorGroups) => {
  const mappedData = {};

  // Iterate over each section (population, economy, health, environment)
  Object.keys(indicatorGroups).forEach(section => {
    const sectionData = indicatorGroups[section];    
    mappedData[section] = {};

    // Iterate over each indicator in the section
    Object.keys(sectionData).forEach(indicator => {
      const indicatorId = sectionData[indicator];
      
      // Find the first non-null value for this indicator in the demographicsData
      const indicatorData = demographicsData.filter(d => d.indicator.id === indicatorId);
      
      const firstNonNullValue = indicatorData.find(data => data.value !== null);
      
      if (firstNonNullValue && firstNonNullValue.value !== null) {
        mappedData[section][indicator] = firstNonNullValue.value;
      } else {
        mappedData[section][indicator] = 'N/A'; // Assign 'N/A' if no valid value is found
      }
    });
  });

  console.log(mappedData); // Debugging to check the mapped data
  return mappedData;
};

const updateDemographicsUI = (data) => {
  console.log(data[1]);
  const mappedNotNullData = mappedNotNullOverviewData(data[1], indicatorGroups);
  
  // Update population section 
  const population = mappedNotNullData.population;
  const totalPopulation = formatNumber(population.totalPopulation);
  const popGrowthRate = formatPercentage(population.populationGrowth);
  
  const popAged1564 = rndTwo(population.workingAgePopulation);
  const popAged65Plus = rndTwo(population.elderlyPopulation);
  const popAged014 = rndTwo(100 - population.workingAgePopulation - population.elderlyPopulation);
  
  const femalePopulation = rndTwo(population.femalePopulation);
  const malePopulation = rndTwo(100 - population.femalePopulation);
 
  const urbanPopulation = rndTwo(population.urbanPopulation);
  const ruralPopulation = rndTwo(100 - population.urbanPopulation);

  $('#totalPopulation').text(totalPopulation);
  $('#populationGrowth').text(popGrowthRate);

  createStackedHorizontalBarChart('populationAgeChart', [
    {
      label: '0-14',
      data: [popAged014],
      backgroundColor: 'rgba(144, 238, 144, 0.8)'  // Softer green      
    }, 
    {
      label: '15-64',
      data: [popAged1564],
      backgroundColor: 'rgba(0, 128, 0, 0.8)'  // Darker green  
    },
    {
      label: '65+',
      data: [popAged65Plus],
      backgroundColor: 'rgba(255, 165, 0, 0.8)'  // Orange
    }
  ],  'Age distribution');

  createStackedHorizontalBarChart('genderChart', [
    {
      label: 'Female',
      data: [femalePopulation],
      backgroundColor: 'rgba(255, 0, 0, 0.8)'  // Red
    },
    { 
      label: 'Male',
      data: [malePopulation],
      backgroundColor: 'rgba(0, 0, 255, 0.8)'  // Blue
    }
  ], 'Gender distribution');

  createStackedHorizontalBarChart('urbanRuralChart', [
    {
      label: 'Rural',
      data: [ruralPopulation],
      backgroundColor: 'rgba(100, 182, 118, 0.8)'  // Leafy green 
    },
    {
      label: 'Urban',
      data: [urbanPopulation],
      backgroundColor: 'rgba(164, 194, 212, 0.8)'  // Light blue grey
    }
  ], 'Rural vs Urban population');

  // Health section
  const health = mappedNotNullData.health;
  const lifeExpectancy = formatNumber(health.lifeExpectancy);
  const fertilityRate = strRoundTwo(health.fertilityRate);
  const healthExpenditure = strRoundTwo(health.healthExpenditure);

  /* populate rest using this config datIds for jquery.text const overviewConfig = [
  { 
    id: 'populationOverview-container', 
    title: 'Population', 
    icon: 'fas fa-users text-info', 
    dataId: ['totalPopulation', 'populationGrowth'], 
    chartId: ['populationAgeChart', 'genderChart', 'urbanRuralChart'] 
  },
  { 
    id: 'economicOverview-container', 
    title: 'Economic Data', 
    icon: 'fas fa-chart-line text-success', 
    dataId: ['gdpCurrent', 'gdpPerCapita', 'inflationRate'], 
    chartId: [] 
  },
  { 
    id: 'healthOverview-container', 
    title: 'Health and Life', 
    icon: 'fas fa-heartbeat text-danger', 
    dataId: ['lifeExpectancy', 'fertilityRate', 'healthExpenditure'], 
    chartId: [] 
  }
]; */

  $('#lifeExpectancy').text(lifeExpectancy);
  $('#fertilityRate').text(fertilityRate);
  $('#healthExpenditure').text(healthExpenditure);

  // Economy section
  const economy = mappedNotNullData.economy;
  const gdpCurrent = formatNumber(economy.gdpCurrent);
  const gdpPerCapita = formatNumber(economy.gdpPerCapita);
  const inflationRate = formatPercentage(economy.inflationRate);

  $('#gdpCurrent').text(gdpCurrent);
  $('#gdpPerCapita').text(gdpPerCapita);
  $('#inflationRate').text(inflationRate);
  
};




// Populate the demographics modal on page load
$('#demographicsModal').on('shown.bs.modal', function () {
  injectOverview();
  fetchDemographics();
});







