
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
    data: [
      { label: 'Population', id: 'totalPopulation', unit: '' },
      { label: 'Population Growth', id: 'populationGrowth', unit: '' },
      { label: 'Population Density', id: 'populationDensity', unit: 'per km&sup2;' },
      { label: 'Household Size', id: 'householdSize', unit: '' },
      { label: 'Net Migration', id: 'netMigration', unit: '' },
      { label: 'Dependency Ratio', id: 'dependencyRatio', unit: '' }
    ],
    charts: [
      { id: 'populationAgeChart', title: 'Age Distribution', unit: '' },
      { id: 'urbanRuralChart', title: 'Rural/Urban Distribution', unit: '' },
      { id: 'genderChart', title: 'Sex Distribution', unit: '' },
      { id: 'sexLifeExpectancyChart', title: 'Life Expectancy', unit: 'years' },
      { id: 'birthDeathChart', title: 'Births/Deaths', unit: 'per 1000/year' }
    ]
  },
  { 
    id: 'economicOverview-container', 
    title: 'Economic Data', 
    icon: 'fas fa-chart-line text-success',
    data: [
      { label: 'GDP', id: 'gdpCurrent', unit: 'USD' },
      { label: 'GDP Per Capita', id: 'gdpPerCapita', unit: 'USD' },
      { label: 'Inflation Rate', id: 'inflationRate', unit: '' },
      { label: 'Unemployment Rate', id: 'unemploymentRate', unit: '' },
      { label: 'Poverty', id: 'povertyPct', unit: '% of Pop' },
      { label: 'Government Expenditure', id: 'govermentExpenditure', unit: '% of GDP' },
      { label: 'Foreign Investment', id: 'foreignInvestment', unit: '% of GDP' },
      { label: 'Trade', id: 'trade', unit: '% of GDP' },
      { label: 'Total Reserves', id: 'totalReserves', unit: 'USD' },
      { label: 'Gini Index', id: 'giniIndex', unit: 'Income Inequality' }
    ],
    charts: []  // No charts for this section
  },
  { 
    id: 'healthOverview-container', 
    title: 'Health Data', 
    icon: 'fas fa-heartbeat text-danger', 
    data: [
      { label: 'Life Expectancy', id: 'lifeExpectancy', unit: 'years' },
      { label: 'Fertility Rate', id: 'fertilityRate', unit: 'births' },
      { label: 'Health Expenditure per Capita', id: 'healthExpenditure', unit: 'USD' }
    ],
    charts: []
  },
  { 
    id: 'enviromentOverview-container', 
    title: 'Environmental Data', 
    icon: 'fas fa-leaf text-success', 
    data: [
      { label: 'CO2 Emissions (Tons)', id: 'co2EmissionsPerCapita', unit: 'tons' }
    ],
    charts: []
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
