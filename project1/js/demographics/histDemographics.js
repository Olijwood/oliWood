const indicatorGroups = {
  population: [
    "SP.POP.TOTL", "SP.POP.GROW"
  ],
  health: [
    "SP.DYN.LE00.IN", "SP.DYN.TFRT.IN", "SH.XPD.CHEX.PC.CD"
  ],
  economy: [
    "NY.GDP.MKTP.CD", "NY.GDP.PCAP.CD", "FP.CPI.TOTL.ZG"
  ],
  environment: [
    "EN.ATM.CO2E.PC"
  ]
};

const maxPoints = window.innerWidth < 768 ? 10 : 20;

function downsampleData(data) {
  if (data.length > maxPoints) {
    return data.filter((_, i) => i % Math.ceil(data.length / maxPoints) === 0);
  }
  return data;
}

async function fetchHistoricalData(type, countryCode) {
  const indicators = indicatorGroups[type].join(";");
  const response = await fetch(`php/demographics/getHistoricalData.php?country=${countryCode}&indicators=${indicators}`);
  const rawData = await response.json();

  const data = rawData[1];
  console.log("data", data);
  let totalPopulationData = data.filter(d => d.indicator === "SP.POP.TOTL");
  // let populationGrowthData = data.filter(d => d.indicator === "SP.POP.GROW");

  totalPopulationData.sort((a, b) => a.date - b.date);
  // populationGrowthData.sort((a, b) => a.date - b.date);

  totalPopulationData = downsampleData(totalPopulationData);
  // populationGrowthData = downsampleData(populationGrowthData);

  const totalPopulationValues = totalPopulationData.map(d => d.value).filter(v => v !== null);
  // const populationGrowthValues = populationGrowthData.map(d => d.value).filter(v => v !== null);

  const totalPopulationDates = totalPopulationData.map(d => d.date).filter((v, i) => totalPopulationValues[i] !== null);
  // const populationGrowthDates = populationGrowthData.map(d => d.date).filter((v, i) => populationGrowthValues[i] !== null);

  const minTotalPopulation = Math.min(...totalPopulationValues);
  const maxTotalPopulation = Math.max(...totalPopulationValues);
  // const minPopulationGrowth = Math.min(...populationGrowthValues);
  // const maxPopulationGrowth = Math.max(...populationGrowthValues);

  createLineChartWithKey('totalPopulationChart', 
    totalPopulationDates,
    totalPopulationValues,
    'Total Population Over Time', 
    '#3e95cd', 
    minTotalPopulation, maxTotalPopulation);

//   createLineChartWithKey('populationGrowthChart', 
//     populationGrowthDates,
//     populationGrowthValues, 
//     'Population Growth Rate (%)', 
//     '#8e5ea2',
//     minPopulationGrowth, maxPopulationGrowth);
// }
  }

$('#demographicsTabs button[data-bs-toggle="tab"]').on('shown.bs.tab', async function (e) {
  const targetId = $(e.target).attr('data-bs-target');
  const countryCode = $('#hiddenCountrySelected').val();

  if (targetId === '#populationDemoTab') {
    await fetchHistoricalData('population', countryCode);
  } else if (targetId === '#healthDemoTab') {
    await fetchHistoricalData('health', countryCode);
  } else if (targetId === '#economyDemoTab') {
    await fetchHistoricalData('economy', countryCode);
  } else if (targetId === '#environmentDemoTab') {
    await fetchHistoricalData('environment', countryCode);
  }
});

