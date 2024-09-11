const indicatorGroups = {
  population: [
    "SP.POP.TOTL", "SP.POP.GROW", 
    "SP.POP.1564.TO.ZS", "SP.POP.65UP.TO.ZS", "SP.POP.TOTL.FE.ZS", "SP.URB.TOTL.IN.ZS"
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

  // Filter the data by each indicator
  let populationData = data.filter(d => d.indicator === "SP.POP.TOTL");
  let growthData = data.filter(d => d.indicator === "SP.POP.GROW");
  let workingAgeData = data.filter(d => d.indicator === "SP.POP.1564.TO.ZS");
  let elderlyData = data.filter(d => d.indicator === "SP.POP.65UP.TO.ZS");
  let femalePopulationData = data.filter(d => d.indicator === "SP.POP.TOTL.FE.ZS");
  let urbanPopulationData = data.filter(d => d.indicator === "SP.URB.TOTL.IN.ZS");


  // Sort the data by date
  [populationData, growthData, workingAgeData, elderlyData, femalePopulationData, urbanPopulationData].forEach(dataset => {
    dataset.sort((a, b) => a.date - b.date);
  });

  // Downsample data if needed
  populationData = downsampleData(populationData);
  growthData = downsampleData(growthData);
  workingAgeData = downsampleData(workingAgeData);
  elderlyData = downsampleData(elderlyData);
  femalePopulationData = downsampleData(femalePopulationData);
  urbanPopulationData = downsampleData(urbanPopulationData);
  // console.log(urbanPopulationData);
  // Map the values
  const populationValues = populationData.map(d => d.value).filter(v => v !== null);
  const growthValues = growthData.map(d => d.value).filter(v => v !== null);
  const workingAgeValues = workingAgeData.map(d => d.value).filter(v => v !== null);
  const elderlyValues = elderlyData.map(d => d.value).filter(v => v !== null);
  const femalePopulationValues = femalePopulationData.map(d => d.value).filter(v => v !== null);
  const urbanPopulationValues = urbanPopulationData.map(d => d.value).filter(v => v !== null);

  // Calculate male population values as 100 - female percentage
  const malePopulationValues = femalePopulationValues.map(v => 100 - v);

  // Calculate rural population values as 100 - urban percentage
  const ruralPopulationValues = urbanPopulationValues.map(v => 100 - v);
  
  // Get dates for the charts
  const populationDates = populationData.map(d => d.date).filter((v, i) => populationValues[i]);
  const growthDates = growthData.map(d => d.date).filter((v, i) => growthValues[i]);
  const genderDates = femalePopulationData.map(d => d.date).filter((v, i) => femalePopulationValues[i]);
  const residenceDates = urbanPopulationData.map(d => d.date).filter((v, i) => urbanPopulationValues[i]);

  const workingAgeDates = workingAgeData.map(d => d.date);
  const elderlyDates = elderlyData.map(d => d.date);
  const childDates = elderlyDates; // Assuming children data is calculated indirectly

  // Calculate min/max for population, gender, and residence charts
  const minPopulation = Math.min(...populationValues) * 0.99;
  const maxPopulation = Math.max(...populationValues) * 1.01;
  const minGrowth = Math.min(...growthValues) * 0.999;
  const maxGrowth = Math.max(...growthValues) * 1.001;

  const allAgeValues = [...workingAgeValues, ...elderlyValues];
  const ageMinY = Math.min(...allAgeValues) * 0.99;
  const ageMaxY = Math.max(...allAgeValues) * 1.01;

  const allGenderValues = [...malePopulationValues, ...femalePopulationValues];
  const genderMinY = Math.min(...allGenderValues) * 0.99;
  const genderMaxY = Math.max(...allGenderValues) * 1.01;

  const allResidenceValues = [...urbanPopulationValues, ...ruralPopulationValues];
  const residenceMinY = Math.min(...allResidenceValues) * 0.99;
  const residenceMaxY = Math.max(...allResidenceValues) * 1.01;

  createLineChartWithKey(
    'totalPopulationChart', 
    [populationDates], [populationValues], 
    'Total Population Over Time', 
    ['#3e95cd'], 
    minPopulation, maxPopulation, true, false, false
  );

  createLineChartWithKey(
    'populationGrowthChart', 
    [growthDates], [growthValues], 
    'Population Growth (%)',
    ['#8e5ea2'], 
    minGrowth, maxGrowth, true, true, false
  );

  createLineChartWithKey(
    'ageDistributionChart', 
    [childDates, workingAgeDates, elderlyDates], 
    [workingAgeValues, elderlyValues], 
    'Age Distribution (%)', 
    ['#FF6384', '#36A2EB', '#FFCD56'], 
    ageMinY, ageMaxY, false, true, true, 
    ['(0-14)', '15-64', '(65+)']
  );

  createLineChartWithKey(
    'genderDistributionChart', 
    [genderDates, genderDates], 
    [femalePopulationValues, malePopulationValues], 
    'Gender Distribution (%)', 
    ['rgba(231, 74, 59, 0.6)', 'rgba(78, 115, 223, 0.6)'],
    genderMinY, genderMaxY, false, true, true, 
    ['Female', 'Male']
  );

  createLineChartWithKey(
    'urbanRuralHistChart', 
    [residenceDates, residenceDates], 
    [urbanPopulationValues, ruralPopulationValues], 
    'Urban vs Rural Distribution (%)', 
    ['rgba(164, 194, 212, 0.8)', 'rgba(100, 182, 118, 0.8)'], 
    residenceMinY, residenceMaxY, false, true, true, 
    ['Urban', 'Rural']
  );
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

