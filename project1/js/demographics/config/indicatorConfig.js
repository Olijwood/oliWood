
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
      unemploymentRate: "SL.UEM.TOTL.ZS",
      povertyPct: "SI.POV.NAHC",
      govermentExpenditure: "NE.CON.GOVT.ZS",
      foreignInvestment: "BX.KLT.DINV.WD.GD.ZS",
      trade: "NE.TRD.GNFS.ZS",
      totalReserves: "FI.RES.TOTL.CD",
      giniIndex: "SI.POV.GINI" 
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
      dataLabel: ['Population', 'Population Growth', 'Population Density', 'Household Size', 'Net Migration', 'Dependency Ratio'],
      dataId: ['totalPopulation', 'populationGrowth', 'populationDensity', 'householdSize', 'netMigration', 'dependencyRatio'], 
      chartId: ['populationAgeChart', 'urbanRuralChart', 'genderChart', 
        'sexLifeExpectancyChart', 'birthDeathChart'],
      dataUnit: ['', '', 'per km&sup2;', '', '', ''],
      chartTitle: ['Age Distribution', 'Rural/Urban Distribution', 'Sex Distribution', 'Life Expectancy', 'Births/Deaths'],
      chartUnit: ['', '', '', 'years', 'per 1000/year']
    },
    { 
      id: 'economicOverview-container', 
      title: 'Economic Data', 
      icon: 'fas fa-chart-line text-success',
      dataLabel: ['GDP', 'GDP Per Capita', 'Inflation Rate', 'Unemployment Rate', 'Poverty', 'Government Expenditure', 'Foreign Investment', 'Trade', 'Total Reserves', 'Gini Index'],
      dataId: ['gdpCurrent', 'gdpPerCapita', 'inflationRate', 'unemploymentRate', 'povertyPct', 'govermentExpenditure', 'foreignInvestment', 'trade', 'totalReserves', 'giniIndex'], 
      chartId: [],
      
      
      dataUnit: ['USD', 'USD', '', '', '% of Pop', '% of GDP', '% of GDP', '% of GDP', 'USD', 'Income Inequality']
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
