import { downsampleData } from '../utils.js';
import { indicatorGroups } from '../config/indicatorConfig.js';

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

export default DemographicsDataProcessor;
