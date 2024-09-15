
export const indicatorGroups = {
    population: {
        totalPopulation: "SP.POP.TOTL",
        populationGrowth: "SP.POP.GROW",
        populationDensity: "EN.POP.DNST",
        workingAgePopulation: "SP.POP.1564.TO.ZS",
        elderlyPopulation: "SP.POP.65UP.TO.ZS",
        femalePopulation: "SP.POP.TOTL.FE.ZS",
        dependencyRatio: "SP.POP.DPND.YG",
        urbanPopulation: "SP.URB.TOTL.IN.ZS",
        netMigration: "SM.POP.NETM",
        birthRate: "SP.DYN.CBRT.IN",
        deathRate: "SP.DYN.CDRT.IN",
        householdSize: "SL.UEM.TOTL.ZS",
        maleLifeExpectancy: "SP.DYN.LE00.MA.IN",
        femaleLifeExpectancy: "SP.DYN.LE00.FE.IN"

    },
    economy: {
        gdpCurrent: "NY.GDP.MKTP.CD",
        gdpPerCapita: "NY.GDP.PCAP.CD",
        inflationRate: "FP.CPI.TOTL.ZG",
        // unemploymentRate: "SL.UEM.TOTL.ZS",
        // govermentExpenditure: "NE.CON.GOVT.ZS",
        // externalDebt: "DT.DOD.TOTL.GD.ZS",

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
      // use boostrap class for way smalle text
      dataLabel: ['Population', 'Population Growth', 'Population Density '],
      
      dataId: ['totalPopulation', 'populationGrowth', 'populationDensity'], 
      chartId: ['populationAgeChart', 'genderChart', 'urbanRuralChart'],
      dataUnit: ['', '', 'per km&sup2;']
    },
    { 
      id: 'economicOverview-container', 
      title: 'Economic Data', 
      icon: 'fas fa-chart-line text-success',
      dataLabel: ['GDP', 'GDP Per Capita', 'Inflation Rate'],
      dataId: ['gdpCurrent', 'gdpPerCapita', 'inflationRate'], 
      chartId: [],
      dataUnit: ['USD', 'USD', '']
    },
    { 
      id: 'healthOverview-container', 
      title: 'Health Data', 
      icon: 'fas fa-heartbeat text-danger', 
      dataLabel: ['Life Expectancy', 'Fertility Rate', 'Health Expenditure per Capita'],
      dataId: ['lifeExpectancy', 'fertilityRate', 'healthExpenditure'], 
      chartId: [],
      dataUnit: ['years', 'births', 'USD']
    },
    { 
      id: 'enviromentOverview-container', 
      title: 'Enviromental Data', 
      icon: 'fas fa-heartbeat text-danger', 
      dataLabel: ['CO2 emittions (Tons)'],
      dataId: ['co2EmissionsPerCapita'], 
      chartId: [],
      dataUnit: ['tons']
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
