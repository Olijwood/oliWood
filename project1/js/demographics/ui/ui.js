import { overviewConfig, tabChartConfig } from "../config/indicatorConfig.js";
import { injectOverviewSection, createChartContainer } from "./genHtml.js";
import DemographicsFetcher from "../data/fetchDemographics.js";
import DemographicsDataProcessor from "../data/dataProcessing.js";
import { updateEconomySection, updateEnvironmentSection, updateHealthSection, updatePopulationSection } from "./updateOverviewSection.js";
import { updateEconomyTab, updateEnvironmentTab, updateHealthTab, updatePopulationTab } from "./updateHistorical.js";
class DemographicsUI {
  constructor(countryCode) {
    this.countryCode = countryCode;
    this.fetcher = new DemographicsFetcher(countryCode);
  }
  
  injectOverview = () => {
    overviewConfig.forEach(config => {
      injectOverviewSection(config.id, config.title, config.icon, config.dataLabel, config.dataId, config.chartId, config.dataUnit);
    });
  }

  async handleCurrentDemographicsUi() {
    const recentData = await this.fetcher.fetchRecentDemographics();
    if (!recentData) {
      console.log('no recent overview data')
      return;
    } 
    
    const mappedRecentData = DemographicsDataProcessor.mapNotNullRecentData(recentData);
    updatePopulationSection(mappedRecentData.population);
    updateEconomySection(mappedRecentData.economy);
    updateHealthSection(mappedRecentData.health);
    updateEnvironmentSection(mappedRecentData.environment);
  }

  // Historical Demographics
  
  injectChartsForTab = (tabId) => {
    const tabConfig = tabChartConfig[tabId];
  
    if (!tabConfig || !tabConfig.charts) {
      console.error('No charts found for this tab:', tabId);
      return;
    }
  
    tabConfig.charts.forEach(chart => {
      $(`#${chart.id}-container`).html(createChartContainer(chart.id, chart.title));
    });
  }

  async handleHistoricDemographicsUi(indicatorGroup) {
    const historicalData = await this.fetcher.fetchHistoricalDemographics(indicatorGroup);
    if (!historicalData) {
      console.log('no historical overview data')
      return;
    } else {
      const mappedHistoricalData = DemographicsDataProcessor.mapHistoricalIndicatorData(historicalData, indicatorGroup); 
      if (indicatorGroup === 'population') {
        updatePopulationTab(mappedHistoricalData);
      } else if (indicatorGroup === 'health') {
        updateHealthTab(mappedHistoricalData);
      } else if (indicatorGroup === 'economy') {
        updateEconomyTab(mappedHistoricalData);
      } else if (indicatorGroup === 'environment') {
        updateEnvironmentTab(mappedHistoricalData);
      }
    }
  }

}

export default DemographicsUI;








