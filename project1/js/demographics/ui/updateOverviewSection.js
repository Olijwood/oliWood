import { createStackedHorizontalBarChart } from "../charts/chartDemographics.js";

export const updatePopulationSection = (population) => {
    const totalPopulation = formatNumber(population.totalPopulation);
    const popGrowthRate = formatPercentage(population.populationGrowth);
    const populationDensity = population.populationDensity;
    const popAged1564 = rndTwo(population.workingAgePopulation);
    const popAged65Plus = rndTwo(population.elderlyPopulation);
    const popAged014 = rndTwo(100 - population.workingAgePopulation - population.elderlyPopulation);
    const femalePopulation = rndTwo(population.femalePopulation);
    const malePopulation = rndTwo(100 - population.femalePopulation);
    const urbanPopulation = rndTwo(population.urbanPopulation);
    const ruralPopulation = rndTwo(100 - population.urbanPopulation);
    const housholdSize = population.housholdSize;
    const maleLifeExpectancy = population.maleLifeExpectancy;
    const femaleLifeExpectancy = population.femaleLifeExpectancy;
    const birthRate = population.birthRate;
    const deathRate = population.deathRate;

    // Inject population data into the UI
    $('#totalPopulation').text(totalPopulation);
    $('#populationGrowth').text(popGrowthRate);
    $('#populationDensity').text(populationDensity);
    $('#housholdSize').text(housholdSize);

    // Create charts
    createStackedHorizontalBarChart('populationAgeChart', [
      { label: '0-14', data: [popAged014], backgroundColor:  'rgba(100, 182, 118, 0.2)'},
      { label: '15-64', data: [popAged1564], backgroundColor: 'rgba(255, 217, 64, 0.2)' },
      { label: '65+', data: [popAged65Plus], backgroundColor: 'rgba(255, 204, 121, 0.7)' }
    ], 'Age distribution');

    createStackedHorizontalBarChart('genderChart', [
      { label: 'Female', data: [femalePopulation], backgroundColor: 'rgba(255, 192, 203, 0.5)' },
      { label: 'Male', data: [malePopulation], backgroundColor: 'rgba(135, 206, 235, 0.5)'}
    ], 'Gender distribution');

    createStackedHorizontalBarChart('urbanRuralChart', [
      { label: 'Rural', data: [ruralPopulation], backgroundColor: 'rgba(100, 182, 118, 0.5)' },
      { label: 'Urban', data: [urbanPopulation], backgroundColor: 'rgba(164, 194, 212, 0.5)' }
    ], 'Rural vs Urban population');

    createStackedHorizontalBarChart('sexLifeExpectancyChart', [
      
      { label: 'Female', data: [femaleLifeExpectancy], backgroundColor: 'rgba(255, 192, 203, 0.5)' },
      { label: 'Male', data: [maleLifeExpectancy], backgroundColor: 'rgba(135, 206, 235, 0.5)' },
    ], 'Life expectancy (Years)', false);
    
    createStackedHorizontalBarChart('birthDeathChart', [ 
      { label: 'Births', data: [birthRate], backgroundColor: 'rgba(255, 217, 64, 0.2)' },
      { label: 'Deaths', data: [deathRate], backgroundColor: 'rgba(201, 203, 207, 0.5)' },
    ], 'Births vs Deaths (per Capita / Year)', false);
};


  // Updates the Health section of the UI
export const updateHealthSection = (health) => {
  const lifeExpectancy = formatNumber(health.lifeExpectancy);
  const fertilityRate = strRoundTwo(health.fertilityRate);
  const healthExpenditure = strRoundTwo(health.healthExpenditure);
  
  $('#lifeExpectancy').text(lifeExpectancy);
  $('#fertilityRate').text(fertilityRate);
  $('#healthExpenditure').text(healthExpenditure);
};

// Updates the Economy section of the UI
export const updateEconomySection = (economy) => {
  const gdpCurrent = formatNumber(economy.gdpCurrent);
  const gdpPerCapita = formatNumber(economy.gdpPerCapita);
  const inflationRate = formatPercentage(economy.inflationRate);
  
  $('#gdpCurrent').text(gdpCurrent);
  $('#gdpPerCapita').text(gdpPerCapita);
  $('#inflationRate').text(inflationRate);
};

export const updateEnvironmentSection = (environment) => {
  const co2EmissionsPerCap = formatNumber(environment.co2EmissionsPerCapita);
  console.log(environment, co2EmissionsPerCap)
  $('#co2EmissionsPerCapita').text(co2EmissionsPerCap);

}