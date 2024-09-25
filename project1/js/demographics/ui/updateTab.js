import { healthSectionsConfig, populationSectionsConfig, economicSectionsConfig, environmentSectionsConfig, overviewSectionsConfig } from "../../configs/tabConfigs.js";
import { createStackedHorizontalBarChart } from "../charts/chartDemographics.js";
import { injectNumericDataForTab, labelPlacementMax, chartColours, rndTwo} from "../../utils.js";

export const updateOverviewTab = (overview) => {
  injectNumericDataForTab(overview, overviewSectionsConfig);

  const birthRate = overview.birthRateO;
  const deathRate = overview.deathRateO;

  createStackedHorizontalBarChart('birthDeathRateChart', [
    { label: 'Birth Rate', data: [birthRate], backgroundColor: chartColours.births },
    { label: 'Death Rate', data: [deathRate], backgroundColor: chartColours.deaths },
  ], 'Birth and Death Rates', false, true, labelPlacementMax(birthRate, deathRate));
}

export const updateHealthTab = (health) => {
  injectNumericDataForTab(health, healthSectionsConfig);

  const smokingPct = health.smokingPct;
  const smokingPctMale = health.smokingPctMale;
  const smokingPctFemale = health.smokingPctFemale;
  const smokingMaxD3= Math.max(smokingPctMale, smokingPctFemale, smokingPct)/3;

  createStackedHorizontalBarChart('smokingSexDistribution', [
    { label: 'Smoking Rate', data: [smokingPct], backgroundColor: chartColours.deaths },
    { label: 'Male', data: [smokingPctMale], backgroundColor: chartColours.male },
    { label: 'Female', data: [smokingPctFemale], backgroundColor: chartColours.female },
  ], 'Distribution of Population who Smoke', false, true, smokingMaxD3);
};

export const updatePopulationTab = (population) => {
  injectNumericDataForTab(population, populationSectionsConfig);
  
  const workingAgePopulation = rndTwo(population.workingAgePopulation);
  const elderlyPopulation = population.elderlyPopulation;
  const childPopulation = 100 - workingAgePopulation - elderlyPopulation;
  createStackedHorizontalBarChart('populationAgeChart', [
    { label: '0-14', data: [childPopulation], backgroundColor:  'rgba(100, 182, 118, 0.2)'},
    { label: '15-64', data: [workingAgePopulation], backgroundColor: 'rgba(255, 217, 64, 0.2)' },
    { label: '65+', data: [elderlyPopulation], backgroundColor: 'rgba(255, 204, 121, 0.7)' }
  ], 'Age distribution', true, true);

  const femalePopulation = rndTwo(population.femalePopulation);
  const malePopulation = 100 - femalePopulation;
  createStackedHorizontalBarChart('genderChart', [
    { label: 'Female', data: [femalePopulation], backgroundColor: chartColours.female },
    { label: 'Male', data: [malePopulation], backgroundColor: chartColours.male},
  ], 'Gender distribution', true, true);

  const urbanPopulation = rndTwo(population.urbanPopulation);
  const ruralPopulation = 100 - urbanPopulation;
  createStackedHorizontalBarChart('urbanRuralChart', [
    { label: 'Rural', data: [ruralPopulation], backgroundColor: 'rgba(100, 182, 118, 0.5)' },
    { label: 'Urban', data: [urbanPopulation], backgroundColor: 'rgba(164, 194, 212, 0.5)' }
  ], 'Rural vs Urban population', true, true);

  const womenInParliamentPct = rndTwo(population.womenInParliamentPct);
  const menInParliamentPct = 100 - womenInParliamentPct;
  createStackedHorizontalBarChart('parliamentChart', [
    { label: 'Female', data: [womenInParliamentPct], backgroundColor: chartColours.female },
    { label: 'Male', data: [menInParliamentPct], backgroundColor: chartColours.male }
  ], 'Women in Parliament (%)', true, true);

  const womenInManagementPct = rndTwo(population.womenInManagementPct);
  const menInManagementPct = 100 - womenInManagementPct;
  createStackedHorizontalBarChart('managementChart', [
    { label: 'Female', data: [womenInManagementPct], backgroundColor: chartColours.female },
    { label: 'Male', data: [menInManagementPct], backgroundColor: chartColours.male }
  ], 'Women in Management (%)', true, true);


  const maleLifeExpectancy = population.maleLifeExpectancy;
  const femaleLifeExpectancy = population.femaleLifeExpectancy;
  const lifeExpD3 =labelPlacementMax(maleLifeExpectancy, femaleLifeExpectancy);
  createStackedHorizontalBarChart('sexLifeExpectancyChart', [
    { label: 'Female', data: [femaleLifeExpectancy], backgroundColor: 'rgba(255, 192, 203, 0.5)' },
    { label: 'Male', data: [maleLifeExpectancy], backgroundColor: 'rgba(135, 206, 235, 0.5)' },
  ], 'Life expectancy (Years)', false, false, lifeExpD3);

  const birthRate = population.birthRate;
  const deathRate = population.deathRate;
  const birthDeathD3 = labelPlacementMax(birthRate, deathRate);
  createStackedHorizontalBarChart('birthDeathChart', [ 
    { label: 'Births', data: [birthRate], backgroundColor: 'rgba(255, 217, 64, 0.2)' },
    { label: 'Deaths', data: [deathRate], backgroundColor: chartColours.deaths },
  ], 'Births vs Deaths (per Capita / Year)', false, false, birthDeathD3);


};

export const updateEconomicTab = (economic) => {
  injectNumericDataForTab(economic, economicSectionsConfig);
};

export const updateEnvironmentTab = (environment) => {
  injectNumericDataForTab(environment, environmentSectionsConfig);
};