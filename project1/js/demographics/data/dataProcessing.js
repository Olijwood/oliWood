// DemographicsDataProcessor.js

import { downsampleData } from '../utils.js';
import { indicatorGroups } from '../config/indicatorConfig.js';

class DemographicsDataProcessor {
  
  // Helper: Find the first non-null value for a given indicator data
  static findFirstNonNullValue(indicatorData) {
    const firstNonNull = indicatorData.find(d => d.value !== null && d.date !== null);
    return firstNonNull ? firstNonNull.value : 'N/A';
  }

  // Process and downsample indicator data (filters out null values and dates)
  static processIndicatorData(data, indicatorId) {
    const filteredData = data.filter(d => d.indicator === indicatorId && d.value !== null && d.date !== null);
    const sortedData = filteredData.sort((a, b) => b.date - a.date);
    const downsampledData = downsampleData(sortedData);
    return downsampledData;
  }

  // Map recent data with the first non-null value
  static mapNotNullRecentData2(data) {
    return Object.fromEntries(
      Object.entries(indicatorGroups).map(([section, sectionData]) => [
        section,
        Object.fromEntries(
          Object.entries(sectionData).map(([indicator, indicatorId]) => {
            const indicatorData = this.processIndicatorData(data, indicatorId);
            return [indicator, this.findFirstNonNullValue(indicatorData)];
          })
        )
      ])
    );
  }

  static mapNotNullRecentData(data) {
    return Object.fromEntries(
      Object.entries(indicatorGroups).map(([section, sectionData]) => [
        section,
        Object.fromEntries(
          Object.entries(sectionData).map(([indicator, indicatorId]) => {
            // Find the corresponding entry directly using find()
            const indicatorData = data.find(d => d.indicator === indicatorId && d.value !== null);
            return [indicator, indicatorData ? indicatorData.value : 'N/A'];
          })
        )
      ])
    );
  }

  // Map sorted historical data and downsample if necessary
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

export default DemographicsDataProcessor;
