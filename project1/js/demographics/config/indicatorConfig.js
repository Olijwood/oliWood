
export const indicatorGroups = {
    population: {
        totalPopulation: "SP.POP.TOTL",
        populationGrowth: "SP.POP.GROW",
        workingAgePopulation: "SP.POP.1564.TO.ZS",
        elderlyPopulation: "SP.POP.65UP.TO.ZS",
        femalePopulation: "SP.POP.TOTL.FE.ZS",
        urbanPopulation: "SP.URB.TOTL.IN.ZS"
    },
    economy: {
        gdpCurrent: "NY.GDP.MKTP.CD",
        gdpPerCapita: "NY.GDP.PCAP.CD",
        inflationRate: "FP.CPI.TOTL.ZG"
    },
    health: {
        lifeExpectancy: "SP.DYN.LE00.IN",
        fertilityRate: "SP.DYN.TFRT.IN",
        healthExpenditure: "SH.XPD.CHEX.PC.CD"
    },
    environment: {
        co2EmissionsPerCapita: "EN.ATM.CO2E.PC"
    }
};

export const overviewConfig = [
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
      title: 'Health Data', 
      icon: 'fas fa-heartbeat text-danger', 
      dataLabel: ['Life Expectancy', 'Fertility Rate', 'Health Expenditure per Capita'],
      dataId: ['lifeExpectancy', 'fertilityRate', 'healthExpenditure'], 
      chartId: [] 
    },
    { 
      id: 'enviromentOverview-container', 
      title: 'Enviromental Data', 
      icon: 'fas fa-heartbeat text-danger', 
      dataLabel: ['CO2 emittions (Tons)'],
      dataId: ['co2EmissionsPerCapita'], 
      chartId: [] 
    }
  ];

export const tabChartConfig = {
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
      { id: 'gdpChart', title: 'GDP Over Time ($)' },
      { id: 'gdpPerCapChart', title: 'GDP per Capita ($)' },
      { id: 'inflationChart', title: 'Inflation Rate (%)' }
    ],
    indicatorGroup: 'economy'
  },
  '#environmentDemoTab': {
    charts: [
      { id: 'co2EmissionsChart', title: 'CO2 Emisisons (Tonnes per Capita)' }
    ],
    indicatorGroup: 'environment'
  }
};
