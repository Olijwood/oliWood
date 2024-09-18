import { getGroupIndicatorIdsString } from '../utils.js';
import { indicatorGroups } from '../config/indicatorConfig.js';

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

export default DemographicsFetcher;
