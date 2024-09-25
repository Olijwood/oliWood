import { formatNumber } from "../../utils";

export const overviewSectionsConfig = [
  { 
    id: 'populationOverview', 
    title: 'Population', 
    icon: 'fas fa-users text-info',
    data: [
      { label: 'Population', id: 'totalPopulationO', unit: '', format:'' },
      { label: 'Population Growth', id: 'populationGrowthO', unit: '%', format:'pct' },
      { label: 'Population Density', id: 'populationDensityO', unit: 'per km&sup2;', format:'' },
      { label: 'Population in Poverty', id: 'povertyPctO', unit: '%', format:'pct' },
    ],
    charts: [] 
  },
  { 
    id: 'economicOverview', 
    title: 'Economic Data', 
    icon: 'fas fa-chart-line text-success',
    data: [
      { label: 'GDP', id: 'gdpCurrentO', unit: 'USD', format:'usd' },
      { label: 'Inflation Rate', id: 'inflationRateO', unit: '%', format:'pct'},
      { label: 'GDP Per Capita', id: 'gdpPerCapitaO', unit: 'USD', format:'usd' },
      { label: 'Tax Revenue', id: 'taxRevenueO', unit: '% of GDP', format:'pct' },
      { label: 'GDP per Person Employed', id: 'gdpPerPersonEmployedO', unit: 'USD', format:'usd' },
      { label: 'Unemployment Rate', id: 'unemploymentRateO', unit: '%', format:'pct'},
    ],
    charts: [] 
  },
  { 
    id: 'healthOverview', 
    title: 'Health Data', 
    icon: 'fas fa-heartbeat text-danger', 
    data: [
      { label: 'Life Expectancy', id: 'lifeExpectancyO', unit: 'years', format:'' },
      { label: 'Fertility Rate', id: 'fertilityRateO', unit: 'births', format:'' },
      { label: 'Health Expenditure per Capita', id: 'healthExpenditureO', unit: 'USD', format:'usd' },
    ],
    charts: [
      { id: 'birthDeathRateChart', title: 'Birth and Death Rate (%)' },
    ]
  },
  { 
    id: 'environmentOverview', 
    title: 'Environmental Data', 
    icon: 'fas fa-leaf text-success', 
    data: [
      { label: 'CO2 Emissions (Tons)', id: 'co2PerCapO', unit: 'tons', format:'' },
      { label: 'Population Exposed to Pollution (PM2.5)', id: 'popExposedPolutionO', unit: '% of pop', format: 'pct' },
      { label: 'Protected Total Area', id: 'protectedTotalAreaO', unit: '% of total territory', format: 'pct' },
    ],
    charts: []
  }
];

export const healthSectionsConfig = [
  {
    id: 'mortalityLifeExpectancy',
    title: 'Mortality & Life Expectancy',
    data: [
      { label: 'Life Expectancy', id: 'lifeExpectancy', unit: 'years', format: '' },
      { label: 'Fertility Rate', id: 'fertilityRate', unit: 'births', format: '' },
      { label: 'Infant Mortality', id: 'infantMortality', unit: 'Per 1000 live births', format: 'pct1k'},
      { label: 'Mortality Rate', id: 'mortalityRate', unit: 'Per Capita', format: 'pct1k' },
      { label: 'Mortality from Non-Communicable Diseases', id: 'mortalityNonCommunicable', unit: '% of Pop', format: 'pct'}
    ],
    charts: []
  },
  {
    id: 'healthcareAccess',
    title: 'Healthcare Access',
    data: [
      { label: 'Physicians', id: 'physiciansPerCap', unit: 'per Capita', format: '' },
      { label: 'Nurses/Midwives', id: 'nurseMidwirePerCap', unit: 'per Capita', format: '' },
      { label: 'Hospital Beds', id: 'hospitalBedsperCap', unit: 'per Capita', format: '' },
    ],
    charts: []
  },
  {
    id: 'immunizationCoverage',
    title: 'Immunization Coverage',
    data: [
      { label: 'Measles Immunization Coverage', id: 'measlesImmunizationCov', unit: '% of children ages 12-23 months', format: 'pctInt' },
      { label: 'DPT Immunization Coverage', id: 'dptImmunizationCov', unit: '% of children ages 12-23 months', format: 'pctInt' },
    ],
    charts: []
  },
  {
    id: 'healthPrevelance',
    title: 'Health issues in Population',
    data: [
      { label: 'HIV Prevalence', id: 'hivPrevelance', unit: '', format: 'pct' },
      { label: 'Diabetes Prevalence', id: 'diabetesPct', unit: '', format: 'pct' },
      { label: 'Obesity Prevalence', id: 'obesityPct', unit: '', format: 'pct' },
      { label: 'Smoking Rate', id: 'smokingPct', unit: '', format: 'pct' },
      { label: 'Malnutrition Rate', id: 'malnuritionPct', unit: '', format: 'pct' },
      { label: 'Suicide Rate', id: 'suicidePct', unit: '', format: 'pct' },
    ],
    charts: [
      { id: 'smokingSexDistribution', title: 'Population who Smoke'}
    ]
  }
];

export const populationSectionsConfig = [
  {
    id: 'popGeneral',
    title: 'General Population Statistics',
    data: [
      { label: 'Total Population', id: 'totalPopulation', unit: '', format: '' },
      { label: 'Population Growth', id: 'populationGrowth', unit: '%', format: 'pct' },
      { label: 'Population Density', id: 'populationDensity', unit: 'per km²', format: '' },
      { label: 'Net Migration', id: 'netMigration', unit: '', format: '' },
      { label: 'Labor Force Participation Rate', id: 'laborParticipation', unit: '%', format: 'pct' }
      
    ],
    charts: []
  },
  {
    id: 'popDistributions',
    title: 'Population Distribution',
    data: [
      { label: 'Dependency Ratio (Elderly)', id: 'dependencyRatioOld', unit: '%', format: 'pct' },
      { label: 'Dependency Ratio (Young)', id: 'dependencyRatioYoung', unit: '%', format: 'pct' },
    ],
    charts: [
      { id: 'populationAgeChart', title: 'Age Distribution', unit: '%' },
      { id: 'urbanRuralChart', title: 'Rural/Urban Distribution', unit: '%' },
      { id: 'genderChart', title: 'Total Population Sex Distribution', unit: '%' },
      { id: 'parliamentChart', title: 'Parliament Sex Distribution', unit: '%' },
      { id: 'managementChart', title: 'Management Sex Distribution', unit: '%' },
    ]
  },
  {
    id: 'popEducation',
    title: 'Education Statistics',
    data: [
      { label: 'Primary School Enrollment', id: 'schoolEnrollPctPrimary', unit: '%', format: 'pct' },
      { label: 'Secondary School Enrollment', id: 'schoolEnrollPctSecondary', unit: '%', format: 'pct' },
      { label: 'Tertiary School Enrollment', id: 'schoolEnrollPctTertiary', unit: '%', format: 'pct' },
      { label: 'Progress to Secondary School', id: 'progressToSecondaryPct', unit: '%', format: 'pct' },
      { label: 'Adolescents Out of School', id: 'adolescentOutOfSchoolPct', unit: '%', format: 'pct' }
    ],
    charts: []
  },
  {
    id: 'popMoreInfo',
    title: 'More Information',
    data: [
      { id: 'intentMurder', label: 'Intentional Homicides', unit: 'per 100,000', format: 'int'},
      { id: 'useInternetPct', label: 'Internet Use', unit: '% of Population', format: 'pct'},
      { id: 'wMarriedU18', label: 'Married Women Under 18', unit: '%', format: 'pct'},
    ],
    charts: [
      { id: 'sexLifeExpectancyChart', title: 'Life Expectancy by Sex', unit: 'years' },
      { id: 'birthDeathChart', title: 'Births/Deaths', unit: 'per 1000/year' }
    ]
  }
];

const countryInfoConfig = [
  { id: 'countryName', label: 'Country Name', format: ''},
  { id: 'officalName', label: 'Official Name', format: ''},
  { id: 'capitalCity', label: 'Capital City', format: ''},
  { id: 'continent', label: 'Continent', format: ''},
  { id: 'subcontinent', label: 'Sub-Continent', format: ''},
  { id: 'populationVal', label: 'Population', format: 'int'},
  { id: 'driveSide', label: 'Driving Side', format: 'title'},
  { id: 'area', label: 'Area km²', format: 'int'},
  { id: 'landlocked', label: 'Land-Locked', format: 'yesNo'},
  { id: 'independant', label: 'Independant', format: 'yesNo'},
  { id: 'umn49', label: 'UMN Member', format: 'yesNo'},
]

export const economicSectionsConfig = [
  {
    id: 'econGeneral',
    title: 'General Economic Statistics',
    data: [
      { label: 'GDP', id: 'gdpCurrent', unit: 'USD', format: 'usd' },
      { label: 'GDP Per Capita', id: 'gdpPerCapita', unit: 'USD', format: 'usd' },
      { label: 'Inflation Rate', id: 'inflationRate', unit: '%', format: 'pct' },
      { label: 'Unemployment Rate', id: 'unemploymentRate', unit: '%', format: 'pct' }
    ],
    charts: []
  }, 
  { id: 'incomeInequality', 
    title: 'Income Inequality', 
    data: [
      { label: 'Gini Index', id: 'giniIndex', unit: '', format: '' },
      { label: 'Poverty Rate', id: 'povertyPct', unit: '% of Population', format: 'pct' }
    ], 
    charts: []
  },
  { id: 'econMoreInfo', 
    title: 'More Economic Info', 
    data: [
      { label: 'Government Expenditure', id: 'governmentExpenditure', unit: '% of GDP', format: 'pct' },
      { label: 'Foreign Investment', id: 'foreignInvestment', unit: '% of GDP', format: 'pct' },
      { label: 'Trade', id: 'trade', unit: '% of GDP', format: 'pct' },
      { label: 'Total Reserves', id: 'totalReserves', unit: 'USD', format: 'usd' }
    ], 
    charts: []
  }
];

export const environmentSectionsConfig = [
  {
    id: 'airQuality',
    title: 'Air Quality',
    data: [
      { label: 'Greenhouse Gas Emissions', id: 'greenhouseGasEmissions', unit: 'kt of CO2 equivalent', format: '' },
      { label: 'CO2 Emissions per Capita', id: 'co2EmissionsPerCapita', unit: 'metric tons per capita', format: '' },
      { label: 'Methane Emissions', id: 'methaneEmissions', unit: 'kt of CO2 equivalent', format: '' },
      { label: 'Nitrous Oxide Emissions', id: 'nitrousOxideEmissions', unit: 'kt of CO2 equivalent', format: '' },
      { label: 'Particulate Matter Emissions (PM2.5)', id: 'particulateMatterEmissions', unit: 'micrograms per cubic meter', format: '' },
      { label: 'Population Exposed to Pollution (PM2.5)', id: 'popExposedPolution', unit: '% of pop', format: 'pct' }
    ],
    charts: []
  },
  {
    id: 'energySustainability',
    title: 'Energy & Sustainability',
    data: [
      { label: 'Renewable Energy Consumption', id: 'renewableEnergyConsumption', unit: '% of total energy consumption', format: 'pct' },
      { label: 'Renewable Energy Output', id: 'renewableEnergyOutput', unit: '% of total energy output', format: 'pct' },
      { label: 'Access to Electricity', id: 'accessToElectricity', unit: '% of population', format: 'pct' },
      { label: 'Energy Use per Capita', id: 'energyUsePerCap', unit: 'kg of oil equivalent', format: '' }
    ],
    charts: [ ]
  },
  {
    id: 'landUse',
    title: 'Land Use & Protection',
    data: [
      { label: 'Agricultural Land', id: 'agriculturalLand', unit: '% of land area', format: 'pct' },
      { label: 'Forest Area', id: 'forestArea', unit: '% of land area', format: 'pct' },
      { label: 'Protected Total Area', id: 'protectedTotalArea', unit: '% of total territory', format: 'pct' },
      { label: 'Protected Marine Area', id: 'protectedMarineArea', unit: '% of total marine area', format: 'pct' },
      { label: 'Protected Land Area', id: 'protectedLandArea', unit: '% of total land area', format: 'pct' }
    ],
    charts: []
  },
  {
    id: 'waterResources',
    title: 'Water Resources',
    data: [
      { label: 'Freshwater Availability', id: 'freshwaterAvailability', unit: 'm³ per capita', format: '' },
      { label: 'Water Stress', id: 'waterStress', unit: '% of renewable water resources withdrawn', format: 'pct' },

    ],
    charts: []
  }
];