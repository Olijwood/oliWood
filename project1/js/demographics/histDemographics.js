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

const maxPoints = window.innerWidth < 768 ? 15 : 30;

function downsampleData(data) {
  if (data.length > maxPoints) {
    const firstDate = data[0];
    const lastDate = data[data.length - 1];
    const middleDates = data.slice(1, -1);
    const step = Math.ceil(middleDates.length / (maxPoints - 2));
    const sampledMiddleDates = middleDates.filter((_, i) => i % step === 0);
    return [firstDate, ...sampledMiddleDates, lastDate];
  }
  return data;
}

async function fetchHistoricalData(type, countryCode) {
  const indicators = indicatorGroups[type].join(";");
  const response = await fetch(`php/demographics/getHistoricalData.php?country=${countryCode}&indicators=${indicators}`);
  const rawData = await response.json();
  const data = rawData[1];

  let populationData = data.filter(d => d.indicator === "SP.POP.TOTL");
  let growthData = data.filter(d => d.indicator === "SP.POP.GROW");

  populationData.sort((a, b) => a.date - b.date);
  growthData.sort((a, b) => a.date - b.date);

  populationData = downsampleData(populationData);
  growthData = downsampleData(growthData);
  
  const populationValues = populationData.map(d => d.value).filter(v => v !== null);
  const growthValues = growthData.map(d => d.value).filter(v => v !== null);

  const populationDates = populationData.map(d => d.date).filter((v, i) => populationValues[i]);
  const growthDates = growthData.map(d => d.date).filter((v, i) => growthValues[i]);
  const minPopulation = Math.min(...populationValues) * 0.99;
  const maxPopulation = Math.max(...populationValues) * 1.01;
  const minGrowth = Math.min(...growthValues) * 0.999;
  const maxGrowth = Math.max(...growthValues) * 1.001;

  createLineChartWithKey('totalPopulationChart', populationDates, populationValues, 'Total Population Over Time', '#3e95cd', minPopulation, maxPopulation, true);

  createLineChartWithKey('populationGrowthChart', growthDates, growthValues, 'Population Growth Rate (%)', '#8e5ea2', minGrowth, maxGrowth, isPct=true, isFill=false);
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

