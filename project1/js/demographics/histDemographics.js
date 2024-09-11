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
    sortedData[indicator] = downsampleData(data.filter(d => d.indicator === indicator).sort((a, b) => a.date - b.date));
  });

  return sortedData;
};

const mapIndicatorData = (sortedIndicatorData, indicatorGroup) => {
  mappedData = {};

  indicatorGroup.forEach(indicator => {
    mappedData[indicator] = {
      values: sortedIndicatorData[indicator].map(d => d.value).filter(v => v !== null),
      dates: sortedIndicatorData[indicator].map(d => d.date)
    };
  });

  return mappedData;
}

async function fetchHistoricalData(type, countryCode, indicatorGroup) {
  
  const indicatorString = indicatorGroup.join(";");
  const response = await fetch(`php/demographics/getHistoricalData.php?country=${countryCode}&indicators=${indicatorString}`);
  const rawData = await response.json();
  const data = rawData[1];

  if (type === 'population') {
    
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

    // Calculate child population values as 100 - working age - elderly percentage
    const childPopulationValues = workingAgeValues.map((w, i) => 100 - w - elderlyValues[i]);
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

    

    createLineChartWithKey(
      'totalPopulationChart', 
      [populationDates], [populationValues], 
      'Total Population Over Time', 
      ['#3e95cd'], 
      true, false, false
    );

    createLineChartWithKey(
      'populationGrowthChart', 
      [growthDates], [growthValues], 
      'Population Growth (%)',
      ['#8e5ea2'], 
      true, true, false
    );

    createLineChartWithKey(
      'ageDistributionChart', 
      [childDates, workingAgeDates, elderlyDates], 
      [childPopulationValues, workingAgeValues, elderlyValues], 
      'Age Distribution (%)', 
      ['#FF6384', '#36A2EB', '#FFCD56'], 
      false, true, true, 
      ['(0-14)', '15-64', '(65+)']
    );

    createLineChartWithKey(
      'genderDistributionChart', 
      [genderDates, genderDates], 
      [femalePopulationValues, malePopulationValues], 
      'Gender Distribution (%)', 
      ['rgba(231, 74, 59, 0.6)', 'rgba(78, 115, 223, 0.6)'],
      false, true, true, 
      ['Female', 'Male']
    );

    createLineChartWithKey(
      'urbanRuralHistChart', 
      [residenceDates, residenceDates], 
      [urbanPopulationValues, ruralPopulationValues], 
      'Urban vs Rural Distribution (%)', 
      ['rgba(164, 194, 212, 0.8)', 'rgba(100, 182, 118, 0.8)'], 
      false, true, true, 
      ['Urban', 'Rural']
    );
  }
  if (type === 'economy') {
    const sortedEconomyData = sortIndicatorData(data, indicatorGroup);
    
    // Map the values and assign to destructured variables
    const mappedData = mapIndicatorData(sortedEconomyData, indicatorGroup);
    console.log(mappedData)
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
    const sortedEnvironmentData = sortIndicatorData(data, indicatorGroup);
    
    // Map the values and assign to destructured variables
    const mappedData = mapIndicatorData(sortedEnvironmentData, indicatorGroup);
    const mappedFossilFuel = mappedData['EN.ATM.CO2E.PC'];
    console.log(mappedFossilFuel);
    createLineChartWithKey(
      'fossilFuelChart ',
      [mappedFossilFuel.dates],
      [mappedFossilFuel.values],
      'Fossil Fuel Consumption Over Time (Tonnes per Capita)',
      ['#3e95cd'],
      true, false, false
    );
  }

  if (type === 'health') {
    const sortedHealthData = sortIndicatorData(data, indicatorGroup);
    const mappedData = mapIndicatorData(sortedHealthData, indicatorGroup);
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
      [fertilityRate.values],
      'Fertility Rate Over Time',
      ['#8e5ea2'],
      true, false, false
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

