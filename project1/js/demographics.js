import { getGroupIndicatorIdsString, downsampleData, injectNumericDataForTab, labelPlacementMax, chartColours, rndTwo} from './utils.js';
import { indicatorGroups } from './configs/indicatorConfig.js';
import { healthSectionsConfig, populationSectionsConfig, economicSectionsConfig, environmentSectionsConfig, overviewSectionsConfig } from "./configs/tabConfigs.js";
import { createStackedHorizontalBarChart } from "./charts/chartDemographics.js";
import { currentCountry, hideCustomOverlays } from './map.js';
const DEMOGRAPHICS_ENDPOINT = 'php/demographics/getDemographics.php';
const HISTORICAL_DATA_ENDPOINT = 'php/demographics/getHistoricalData.php';

class DemographicsFetcher {
  constructor(countryCode) {
    this.countryCode = countryCode;
  }

  // Construct API URL for fetching data
  constructUrl(endpoint, indicatorIds) {
    return `${endpoint}?country=${this.countryCode}&indicators=${indicatorIds}`;
  }

  // Generic fetch method for making API requests
  async fetchData(endpoint, indicatorIds) {
    const url = this.constructUrl(endpoint, indicatorIds);
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      return null;
    }
  }
  

  // Fetch recent demographics data for a specific indicator group
  async fetchRecentDemographicsByGroup(type) {
    const indicatorIds = getGroupIndicatorIdsString(indicatorGroups[type]);
    return this.fetchData(DEMOGRAPHICS_ENDPOINT, indicatorIds);
  }

  // Fetch historical demographics data for a specific indicator group
  async fetchHistoricalDemographics(indicatorGroup) {
    const indicatorIds = getGroupIndicatorIdsString(indicatorGroups[indicatorGroup]);
    return this.fetchData(HISTORICAL_DATA_ENDPOINT, indicatorIds);
  }
}


class DemographicsDataProcessor {

  static mapRecentData(data, indicatorGroup) {
    const mappedData = {};
    const dataByIndicator = data.reduce((acc, entry) => {
      acc[entry.indicator] = entry.value;
      return acc;
    }, {});

    Object.keys(indicatorGroup).forEach((key) => {
      const indicator = indicatorGroup[key];
      mappedData[key] = dataByIndicator[indicator];
    });

    return mappedData;
  }


  static mapHistoricalIndicatorData(data, section) {
    const indicatorGroup = indicatorGroups[section];
    
    const mappedData = Object.fromEntries(
      Object.entries(indicatorGroup).map(([indicatorKey, indicatorId]) => {
        // Process data for this indicator
        const indicatorData = data
          .filter(d => d.indicator === indicatorId && d.value !== null && d.date !== null)
          .sort((a, b) => a.date - b.date);  // Ascending order by date

        const downsampledData = downsampleData(indicatorData);

        // Map the values and dates
        return [
          indicatorKey,
          {
            values: downsampledData.map(d => d.value),
            dates: downsampledData.map(d => d.date)
          }
        ];
      })
    );
    return mappedData;
  }
}

const injectSection = (containerId, title, data = [], charts = [], icon='') => {
  let content = `
      <div class="card mb-3">
          <div class="card-header">
              <h6 class="text-center demo-subtitle"><i class="${icon} me-2"></i>${title}</h6>
          </div>
          <div class="card-body">
              <table class="table table-bordered table-hover">
                  <tbody>
  `;

  // Inject data fields (as rows)
  data.forEach(item => {
    const unitCite = item.unit ? `<cite class="text-muted small">(${item.unit})</cite>` : '';
    content += `
        <tr>
            <td>${item.label} ${unitCite}</td>
            <td class="fwbold text-end" id="${item.id}"></td>
        </tr>
    `;
  });

  // Inject charts (if any)
  charts.forEach(chart => {
    const unitCite = chart.unit ? `<cite class="text-muted small">(${chart.unit})</cite>` : '';
    content += `
        <tr>
            <td colspan="2" class="chart-td">
                <h6 class="text-center demo-subtitle" >${chart.title} ${unitCite}</h6>
                <div class="spinner-container">
                  <div class="spinner" id="spinner-${chart.id}"></div>
                </div>
                <div class="chart-container">
                    <div class="demographics-chart">
                        <canvas id="${chart.id}"></canvas>
                    </div>
                </div>
            </td>
        </tr>
    `;
  });

  content += `
                  </tbody>
              </table>
          </div>
      </div>
  `;

  $(`#${containerId}`).html(content);
};

const updateOverviewTab = (overview) => {
  injectNumericDataForTab(overview, overviewSectionsConfig);

  const birthRate = overview.birthRateO;
  const deathRate = overview.deathRateO;

  createStackedHorizontalBarChart('birthDeathRateChart', [
    { label: 'Birth Rate', data: [birthRate], backgroundColor: chartColours.births },
    { label: 'Death Rate', data: [deathRate], backgroundColor: chartColours.deaths },
  ], 'Birth and Death Rates', false, true, labelPlacementMax(birthRate, deathRate));
}
const updateHealthTab = (health) => {
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

const updatePopulationTab = (population) => {
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

const updateEconomicTab = (economic) => {
  injectNumericDataForTab(economic, economicSectionsConfig);
};

const updateEnvironmentTab = (environment) => {
  injectNumericDataForTab(environment, environmentSectionsConfig);
};

class DemographicsUI {
  constructor(countryCode) {
    this.countryCode = countryCode;
    this.fetcher = new DemographicsFetcher(countryCode);
    this.processor = DemographicsDataProcessor.mapRecentData;
    this.tabMap = {
      overview: { updater: updateOverviewTab },
      health: { updater: updateHealthTab },
      population: { updater: updatePopulationTab },
      economy: { updater: updateEconomicTab },
      environment: { updater: updateEnvironmentTab },
    };
  }

  injectTab = (sectionsConfig) => sectionsConfig.forEach(({ id, title, data, charts, icon }) => injectSection(id, title, data, charts, icon));

  injectOverviewTab = () => this.injectTab(overviewSectionsConfig);
  injectHealthTab = () => this.injectTab(healthSectionsConfig);
  injectPopulationTab = () => this.injectTab(populationSectionsConfig);
  injectEcomomicTab = () => this.injectTab(economicSectionsConfig);
  injectEnvironmentTab = () => this.injectTab(environmentSectionsConfig);
  
  async injectDataForTab(tabName) {
    const tabConfig = this.tabMap[tabName];
    if (!tabConfig) {
      console.error(`Unknown tab name: ${tabName}`);
      return;
    }
    const data = await this.fetcher.fetchRecentDemographicsByGroup(tabName);
    const mappedData = this.processor(data, indicatorGroups[tabName]);
    tabConfig.updater(mappedData);
  }
}


$('.d-tabs-link').on('click', function () {
  // Remove the active class from all tabs
  $('.d-tabs-link').removeClass('tab-active');
  
  // Add the active class to the clicked tab
  $(this).addClass('tab-active');

   // Get the target content ID from the clicked tab
  const targetContentId = $(this).data('target');
   // Hide all tab content sections
   $('.tab-content').css({
     display: 'none'
   });
   $('.tab-content').removeClass('show');
 
   // Show the target content section
   $(`#${targetContentId}`).css(
     {
       display: 'block'
     }
   );

   const countryCode = $('#hiddenCountrySelected').val();

  if (!countryCode) {
    console.log('no country selected');
    return;
  }
  let targetId = '#' + targetContentId.slice(0, -7)
  const demographicsUI = new DemographicsUI(countryCode);
  switch (targetId) {
    case '#populationDemo':
      demographicsUI.injectPopulationTab();
      demographicsUI.injectDataForTab('population');
      break;
    case '#healthDemo':
      demographicsUI.injectHealthTab();
      demographicsUI.injectDataForTab('health');
      break;
    case '#environmentDemo':
      demographicsUI.injectEnvironmentTab();
      demographicsUI.injectDataForTab('environment');
      break;
    case '#economyDemo':
      demographicsUI.injectEcomomicTab();
      demographicsUI.injectDataForTab('economy');
      break;
    case '#currentDemo':
      demographicsUI.injectOverviewTab();
      demographicsUI.injectDataForTab('overview');
      break;
    default:
      break;
  }
  });

$('#dOverlayCloseBtn').on('click', () => {
  $('#demoContainer').hide();
});
export const showDemographicsOverlay = () => {
  hideCustomOverlays();
  
  // Get the current country code
  const countryCode = currentCountry.countryCode;
  if (!countryCode) {
    console.log('No country selected.');
    return;
  }

  // Create the DemographicsUI instance
  const demographicsUI = new DemographicsUI(countryCode);
  
  // Inject the overview tab content and data before displaying the tab
  demographicsUI.injectOverviewTab();
  demographicsUI.injectDataForTab('overview');

  // Hide all tab contents
  $('.tab-content').hide();

  // Show the Overview tab content
  $('#currentDemoContent').show();

  // Set the 'Overview' tab as active
  $('.d-tabs-link').removeClass('tab-active');
  $('#currentDemo-tab').addClass('tab-active');

  // Show the demographics overlay
  $('#demoContainer').show();
};


// $tabs.on('shown.bs.tab', async function (e) {
//   const targetId = $(e.target).attr('data-bs-target');
//   const countryCode = $('#hiddenCountrySelected').val();

//   if (!countryCode) {
//     console.log('no country selected');
//     return;
//   }

//   const demographicsUI = new DemographicsUI(countryCode);
//   switch (targetId) {
//     case '#populationDemo':
//       demographicsUI.injectPopulationTab();
//       demographicsUI.injectDataForTab('population');
//       break;
//     case '#healthDemo':
//       demographicsUI.injectHealthTab();
//       demographicsUI.injectDataForTab('health');
//       break;
//     case '#environmentDemo':
//       demographicsUI.injectEnvironmentTab();
//       demographicsUI.injectDataForTab('environment');
//       break;
//     case '#economyDemo':
//       demographicsUI.injectEcomomicTab();
//       demographicsUI.injectDataForTab('economy');
//       break;
//     default:
//       break;
//   }
// });