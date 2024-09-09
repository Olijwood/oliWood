const updateDemographicsUI = (data) => {
  console.log(data);
  const demographicsData = data[1]; // The second array contains the indicator data
  console.log(demographicsData);

  const totalPopulation = demographicsData.find(ind => ind.indicator.id === 'SP.POP.TOTL')?.value || null;
  const popGrowthRate = demographicsData.find(ind => ind.indicator.id === 'SP.POP.GROW')?.value || null;
  const popAged014 = demographicsData.find(ind => ind.indicator.id === 'SP.POP.0014.TO.ZS')?.value || null;
  const popAged65Plus = demographicsData.find(ind => ind.indicator.id === 'SP.POP.65UP.TO.ZS')?.value || null;
  const femalePopulation = demographicsData.find(ind => ind.indicator.id === 'SP.POP.TOTL.FE.ZS')?.value || null;
  const urbanPopulation = demographicsData.find(ind => ind.indicator.id === 'SP.URB.TOTL.IN.ZS')?.value || null;
  const ruralPopulation = demographicsData.find(ind => ind.indicator.id === 'SP.RUR.TOTL.ZS')?.value || null;
  const literacyRate = demographicsData.find(ind => ind.indicator.id === 'SE.ADT.LITR.ZS')?.value || null;
  const employmentRate = demographicsData.find(ind => ind.indicator.id === 'SL.EMP.TOTL.SP.ZS')?.value || null;

  // Helper function for formatting percentage values
  const formatPercentage = (value) => value !== null ? `${Number(value).toFixed(2)}%` : 'N/A';

  // Helper function for formatting numbers with commas
  const formatNumber = (value) => value !== null ? Number(value).toLocaleString() : 'N/A';

  // Update the Population section
  $('#totalPopulation').text(formatNumber(totalPopulation));
  $('#populationGrowth').text(formatPercentage(popGrowthRate));
  $('#populationUnder14').text(formatPercentage(popAged014));
  $('#populationOver65').text(formatPercentage(popAged65Plus));
  $('#femalePopulation').text(formatPercentage(femalePopulation));

  // Update the Urban vs. Rural Population section
  $('#urbanPopulation').text(formatPercentage(urbanPopulation));
  $('#ruralPopulation').text(formatPercentage(ruralPopulation));

  // Update the Education section
  $('#literacyRate').text(formatPercentage(literacyRate));

  // Update the Employment section
  $('#employmentRate').text(formatPercentage(employmentRate));
};

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

// Populate the demographics modal on page load
$('#demographicsModal').on('shown.bs.modal', function () {
  fetchDemographics();
});
