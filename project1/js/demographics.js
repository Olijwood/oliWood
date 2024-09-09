const fetchDemographics = () => {
  const countryCode = $('#hiddenCountrySelected').val();

  $.ajax({
    url: `php/demographics/getDemographics.php`,
    type: 'GET',
    dataType: 'json',
    data: { country: countryCode },
    success: (response) => {
      if (response.error) {
        console.error('Error fetching demographics data:', response.error);
      } else {
        updateDemographicsUI(response);
      }
    },
    error: () => {
      console.error('Failed to fetch demographics data.');
    }
  });
};

// Helper function to get the most recent non-null value from the list
const getMostRecentNonNullValue = (indicatorData) => {
  for (let i = 0; i < indicatorData.length; i++) {
    if (indicatorData[i].value !== null) {
      return indicatorData[i].value;
    }
  }
  return 'N/A'; // Return 'N/A' if no valid value is found
};

const updateDemographicsUI = (data) => {
  const demographicsData = data[1]; // The second array contains the indicator data

  // Population Section
  const totalPopulation = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'SP.POP.TOTL'));
  const popGrowthRate = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'SP.POP.GROW'));
  const popAged014 = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'SP.POP.0014.TO.ZS'));
  const popAged65Plus = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'SP.POP.65UP.TO.ZS'));
  const femalePopulation = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'SP.POP.TOTL.FE.ZS'));
  console.log(femalePopulation);
  const malePopulation = femalePopulation ? (100 - Number(femalePopulation)).toFixed(2) : 'N/A';
  console.log(malePopulation);

  // const malePopulation = femalePopulation !== 'N/A' ? (100 - Number(femalePopulation)).toFixed(2) + '%' : 'N/A';
  const urbanPopulation = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'SP.URB.TOTL.IN.ZS'));
  const ruralPopulation = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'SP.RUR.TOTL.ZS'));

  // Economic Data
  const gdpCurrent = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'NY.GDP.MKTP.CD'));
  const gdpPerCapita = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'NY.GDP.PCAP.CD'));
  const inflationRate = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'FP.CPI.TOTL.ZG'));

  // Health and Life Section
  const lifeExpectancy = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'SP.DYN.LE00.IN'));
  const fertilityRate = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'SP.DYN.TFRT.IN'));
  const healthExpenditure = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'SH.XPD.CHEX.PC.CD'));

  // Environment Section
  const co2Emissions = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'EN.ATM.CO2E.PC'));

  // Employment Section
  const employmentRate = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'SL.EMP.TOTL.SP.ZS'));

  // Education Section
  const literacyRate = getMostRecentNonNullValue(demographicsData.filter(ind => ind.indicator.id === 'SE.ADT.LITR.ZS'));

  // Update the Population section
  $('#totalPopulation').text(totalPopulation !== 'N/A' ? Number(totalPopulation).toLocaleString() : 'N/A');
  $('#populationGrowth').text(popGrowthRate !== 'N/A' ? `${Number(popGrowthRate).toFixed(2)}%` : 'N/A');
  $('#populationUnder14').text(popAged014 !== 'N/A' ? `${Number(popAged014).toFixed(2)}%` : 'N/A');
  $('#populationOver65').text(popAged65Plus !== 'N/A' ? `${Number(popAged65Plus).toFixed(2)}%` : 'N/A');
  $('#femalePopulation').text(femalePopulation !== 'N/A' ? `${Number(femalePopulation).toFixed(2)}%` : 'N/A');
  $('#malePopulation').text(malePopulation !== 'N/A' ? `${Number(malePopulation).toFixed(2)}%` : 'N/A');
  $('#urbanPopulation').text(formatPercentage(urbanPopulation));
  $('#ruralPopulation').text(formatPercentage(ruralPopulation));

  // Economic Data Section
  $('#gdpCurrent').text(gdpCurrent !== 'N/A' ? `$${Number(gdpCurrent).toLocaleString()}` : 'N/A');
  $('#gdpPerCapita').text(gdpPerCapita !== 'N/A' ? `$${Number(gdpPerCapita).toLocaleString()}` : 'N/A');
  $('#inflationRate').text(inflationRate !== 'N/A' ? `${Number(inflationRate).toFixed(2)}%` : 'N/A');
  
  // Health and Life Section
  $('#lifeExpectancy').text(lifeExpectancy !== 'N/A' ? `${Number(lifeExpectancy).toFixed(1)} years` : 'N/A');
  $('#fertilityRate').text(fertilityRate !== 'N/A' ? `${Number(fertilityRate).toFixed(2)}` : 'N/A');
  $('#healthExpenditure').text(healthExpenditure !== 'N/A' ? `$${Number(healthExpenditure).toLocaleString()}` : 'N/A');

  // Environment Section
  $('#co2Emissions').text(co2Emissions !== 'N/A' ? `${Number(co2Emissions).toFixed(2)} metric tons` : 'N/A');

  // Update the Education section
  $('#literacyRate').text(formatPercentage(literacyRate));

  // Update the Employment section
  $('#employmentRate').text(formatPercentage(employmentRate));
};

// Populate the demographics modal on page load
$('#demographicsModal').on('shown.bs.modal', function () {
  fetchDemographics();
});

