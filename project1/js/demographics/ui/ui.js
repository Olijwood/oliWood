import { indicatorGroups } from "../../configs/indicatorConfig.js";
import { healthSectionsConfig, populationSectionsConfig, economicSectionsConfig, environmentSectionsConfig, overviewSectionsConfig } from "../../configs/tabConfigs.js";
import { injectSection } from "./genHtml.js";
import DemographicsFetcher from "../data/fetchDemographics.js";
import DemographicsDataProcessor from "../data/dataProcessing.js";
import { updateHealthTab, updatePopulationTab, updateEconomicTab, updateEnvironmentTab, updateOverviewTab } from "./updateTab.js";
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

export default DemographicsUI;

