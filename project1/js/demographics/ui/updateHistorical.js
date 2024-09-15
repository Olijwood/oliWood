import { createLineChartWithKey } from "../charts/chartDemographics.js";
import { mapRelPct } from "../utils.js";

export const updatePopulationTab = (population) => {
 // total population
  const totalPopulationVals = population.totalPopulation.values;
  const totalPopulationDates = population.totalPopulation.dates;
  
  // population growth
  const growthVals = population.populationGrowth.values;
  const growthDates = population.populationGrowth.dates;
  
  // age distribution
  const workingAgeVals = population.workingAgePopulation.values;
  const workingAgeDates = population.workingAgePopulation.dates;
  
  const elderlyVals = population.elderlyPopulation.values;
  const elderlyDates = population.elderlyPopulation.dates;
  
  const childVals = workingAgeVals.map((v, i) => 100 - v - elderlyVals[i]);
  const childDates = elderlyDates
  
  // male / female
  const femaleVals = population.femalePopulation.values;
  const femaleDates = population.femalePopulation.dates;
  
  const maleVals = mapRelPct(femaleVals);
  const maleDates = femaleDates;
  
  // urban / rural
  const urbanVals = population.urbanPopulation.values;
  const urbanDates = population.urbanPopulation.dates;
  
  const ruralVals = mapRelPct(urbanVals);
  const ruralDates = urbanDates;

  createLineChartWithKey(
    'totalPopulationChart', 
    [totalPopulationDates], [totalPopulationVals], 
    'Total Population Over Time', 
    ['#3e95cd'], 
    true, false, false
  );

  createLineChartWithKey(
    'populationGrowthChart', 
    [growthDates], [growthVals], 
    'Population Growth (%)',
    ['#8e5ea2'], 
    true, true, false
  );
  
  createLineChartWithKey(
    'ageDistributionChart', 
    [childDates, workingAgeDates, elderlyDates], 
    [childVals, workingAgeVals, elderlyVals], 
    'Age Distribution (%)', 
    ['#FF6384', '#36A2EB', '#FFCD56'], 
    false, true, true, 
    ['(0-14)', '15-64', '(65+)']
  );
  
  createLineChartWithKey(
    'genderDistributionChart', 
    [femaleDates, maleDates], 
    [femaleVals, maleVals], 
    'Gender Distribution (%)', 
    ['rgba(231, 74, 59, 0.6)', 'rgba(78, 115, 223, 0.6)'],
    false, true, true, 
    ['Female', 'Male']
  );
  
  createLineChartWithKey(
    'urbanRuralHistChart', 
    [ruralDates, urbanDates], 
    [ruralVals, urbanVals], 
    'Urban vs Rural Distribution (%)', 
    ['rgba(164, 194, 212, 0.8)', 'rgba(100, 182, 118, 0.8)'], 
    false, true, true, 
    ['Rural', 'Urban']
  );
};

export const updateEconomyTab = (economy) => {
  // GDP
  const gdpVals = economy.gdpCurrent.values;
  const gdpDates = economy.gdpCurrent.dates;
  
  // GDP per Capita
  const gdpPerCapitaVals = economy.gdpPerCapita.values;
  const gdpPerCapitaDates = economy.gdpPerCapita.dates;
  
  // Inflation Rate
  const inflationRateVals = economy.inflationRate.values;
  const inflationRateDates = economy.inflationRate.dates;
  
  createLineChartWithKey(
    'gdpChart', 
    [gdpDates], [gdpVals], 
    'GDP Over Time', 
    ['#3e95cd'], 
    true, false, false
  );
  
  createLineChartWithKey(
    'gdpPerCapChart', 
    [gdpPerCapitaDates], [gdpPerCapitaVals], 
    'GDP per Capita Over Time', 
    ['#8e5ea2'], 
    true, true, false
  );
  
  createLineChartWithKey(
    'inflationChart', 
    [inflationRateDates], 
    [inflationRateVals],
    'Inflation Rate Over Time', 
    ['#FF6384'], 
    true, true, false
  );
};

export const updateHealthTab = (health) => {
  // Life Expectancy
  const lifeExpectancyVals = health.lifeExpectancy.values;
  const lifeExpectancyDates = health.lifeExpectancy.dates;
  
  createLineChartWithKey(
    'lifeExpectancyChart', 
    [lifeExpectancyDates], [lifeExpectancyVals], 
    'Life Expectancy Over Time', 
    ['#FF6384'], 
    true, false, false
  );

  // fertility rate
  const fertilityRateVals = health.fertilityRate.values.map(x => Math.round(x * 10) / 10);
  const fertilityRateDates = health.fertilityRate.dates;

  createLineChartWithKey(
    'fertilityRateChart', 
    [fertilityRateDates], [fertilityRateVals], 
    'Fertility Rate Over Time', 
    ['#36A2EB'], 
    true, true, false
  );

  // health expenditure
  const healthExpenditureVals = health.healthExpenditure.values;
  const healthExpenditureDates = health.healthExpenditure.dates;
  createLineChartWithKey( 
    'healthExpenditureChart', 
    [healthExpenditureDates], [healthExpenditureVals], 
    'Health Expenditure Over Time', 
    ['#FFCD56'], 
    true, false, false
  );
};

export const updateEnvironmentTab = (environment) => {
  // Fossil Fuel Consumption
  const co2EmissionVals = environment.co2EmissionsPerCapita.values;
  const co2EmissionDates = environment.co2EmissionsPerCapita.dates;
  createLineChartWithKey(
    'co2EmissionsChart', 
    [co2EmissionDates], [co2EmissionVals], 
    'CO2 Emissions Per Capita', 
    ['#3e95cd'], 
    true, false, false
  );
};
