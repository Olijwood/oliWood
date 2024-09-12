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


const sortIndicatorData = (data, indicatorGroup) => {
  const sortedData = {};
  
  indicatorGroup.forEach(indicator => {
    sortedData[indicator] = data
      .filter(d => d.indicator === indicator)
      .sort((a, b) => a.date - b.date);
  });

  return sortedData;
};

const mapIndicatorData = (sortedIndicatorData, indicatorGroup) => {
  const mappedData = {};

  indicatorGroup.forEach(indicator => {
    const indicatorData = sortedIndicatorData[indicator];

    const filteredData = indicatorData.filter(d => d.value !== null);

    const downsampledData = downsampleData(filteredData);

    mappedData[indicator] = {
      values: downsampledData.map(d => d.value),
      dates: downsampledData.map(d => d.date)
    };
  });

  return mappedData;
};


async function fetchHistoricalData(type, countryCode, indicatorGroup) {
  
  const indicatorString = indicatorGroup.join(";");
  const response = await fetch(`php/demographics/getHistoricalData.php?country=${countryCode}&indicators=${indicatorString}`);
  const rawData = await response.json();
  const data = rawData[1];

  const sortedData = sortIndicatorData(data, indicatorGroup);
  const mappedData = mapIndicatorData(sortedData, indicatorGroup);

  if (type === 'population') {
    const population = mappedData['SP.POP.TOTL'];
    const growth = mappedData['SP.POP.GROW'];
    const workingAge = mappedData['SP.POP.1564.TO.ZS'];
    const elderly = mappedData['SP.POP.65UP.TO.ZS'];
    const femalePopulation = mappedData['SP.POP.TOTL.FE.ZS'];
    const urbanPopulation = mappedData['SP.URB.TOTL.IN.ZS'];

    const childPopulation = workingAge.values.map((w, i) => 100 - w - elderly.values[i]);
    const malePopulation = femalePopulation.values.map(v => 100 - v);

    const ruralPopulation = urbanPopulation.values.map(v => 100 - v);

    const populationDates = population.dates.filter((v, i) => population.values[i]);
    const growthDates = growth.dates.filter((v, i) => growth.values[i]);
    const genderDates = femalePopulation.dates.filter((v, i) => femalePopulation.values[i]);
    const residenceDates = urbanPopulation.dates.filter((v, i) => urbanPopulation.values[i]);

    const workingAgeDates = workingAge.dates;
    const elderlyDates = elderly.dates;
    const childDates = elderlyDates; // Assuming children data is calculated indirectly

    createLineChartWithKey(
      'totalPopulationChart', 
      [populationDates], [population.values], 
      'Total Population Over Time', 
      ['#3e95cd'], 
      true, false, false
    );

    createLineChartWithKey(
      'populationGrowthChart', 
      [growthDates], [growth.values], 
      'Population Growth (%)',
      ['#8e5ea2'], 
      true, true, false
    );

    createLineChartWithKey(
      'ageDistributionChart', 
      [childDates, workingAgeDates, elderlyDates], 
      [childPopulation, workingAge.values, elderly.values], 
      'Age Distribution (%)', 
      ['#FF6384', '#36A2EB', '#FFCD56'], 
      false, true, true, 
      ['(0-14)', '15-64', '(65+)']
    );

    createLineChartWithKey(
      'genderDistributionChart', 
      [genderDates, genderDates], 
      [femalePopulation.values, malePopulation], 
      'Gender Distribution (%)', 
      ['rgba(231, 74, 59, 0.6)', 'rgba(78, 115, 223, 0.6)'],
      false, true, true, 
      ['Female', 'Male']
    );

    createLineChartWithKey(
      'urbanRuralHistChart', 
      [residenceDates, residenceDates], 
      [urbanPopulation.values, ruralPopulation], 
      'Urban vs Rural Distribution (%)', 
      ['rgba(164, 194, 212, 0.8)', 'rgba(100, 182, 118, 0.8)'], 
      false, true, true, 
      ['Urban', 'Rural']
    );
  }

  if (type === 'economy') {
    const mappedGDP = mappedData['NY.GDP.MKTP.CD'];
    const mappedPerCapita = mappedData['NY.GDP.PCAP.CD'];
    const mappedInflation = mappedData['FP.CPI.TOTL.ZG'];
    
    createLineChartWithKey(
      'GDPChart',
      [mappedGDP.dates],
      [mappedGDP.values],
      'GDP Over Time (US$)',
      ['#3e95cd'],
      true, false, false
    );
    
    createLineChartWithKey(
      'GDPPerCapChart',
      [mappedPerCapita.dates],
      [mappedPerCapita.values],
      'GDP per Capita Over Time (US$)',
      ['#8e5ea2'],
      true, false, false
    );
    
    createLineChartWithKey(
      'InflationChart',
      [mappedInflation.dates],
      [mappedInflation.values],
      'Inflation Rate Over Time',
      ['#FF6384'],
      true, true, false
    );
  }

  if (type === 'environment') {
    const mappedFossilFuel = mappedData['EN.ATM.CO2E.PC'];
    console.log(mappedFossilFuel);
    createLineChartWithKey(
      'fossilFuelChart',
      [mappedFossilFuel.dates],
      [mappedFossilFuel.values],
      'Fossil Fuel Consumption Over Time (Tonnes per Capita)',
      ['#3e95cd'],
      true, false, false
    );
  }

  if (type === 'health') {
    const lifeExpectancy = mappedData['SP.DYN.LE00.IN'];
    const fertilityRate = mappedData['SP.DYN.TFRT.IN'];
    const healthExpenditure = mappedData['SH.XPD.CHEX.PC.CD'];
    
    createLineChartWithKey(
      'lifeExpectancyChart',
      [lifeExpectancy.dates],
      [lifeExpectancy.values],
      'Life Expectancy Over Time',
      ['#3e95cd'],
      true, false, false
    );

    createLineChartWithKey(
      'fertilityRateChart',
      [fertilityRate.dates],
      // round all fertility rate vals to 1 decimal place including int to be ie 1.0
      [fertilityRate.values.map(x => Math.round(x * 10) / 10)],
      'Fertility Rate Over Time',
      ['#8e5ea2'],
      true, false, false, null, false, false
    );

    createLineChartWithKey(
      'healthExpenditureChart',
      [healthExpenditure.dates],
      [healthExpenditure.values],
      'Health Expenditure per Capita Over Time',
      ['#FF6384'],
      true, false, false
    );
  }
}


$('#demographicsTabs button[data-bs-toggle="tab"]').on('shown.bs.tab', async function (e) {
  const targetId = $(e.target).attr('data-bs-target');
  const countryCode = $('#hiddenCountrySelected').val();

  if (targetId === '#populationDemoTab') {
    await fetchHistoricalData('population', countryCode, indicatorGroups.population);
  } else if (targetId === '#healthDemoTab') {
    await fetchHistoricalData('health', countryCode, indicatorGroups.health);
  } else if (targetId === '#economyDemoTab') {
    await fetchHistoricalData('economy', countryCode, indicatorGroups.economy);
  } else if (targetId === '#environmentDemoTab') {
    await fetchHistoricalData('environment', countryCode,   indicatorGroups.environment);
  }
});

