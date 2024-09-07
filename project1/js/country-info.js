// import { toTitleCase } from './utils.js';

const updateCountryInfoUI = (data) => {
  // Update country info UI logic
  $('#countryFlag').attr('src', data.flag);
  $('#countryFlag').attr('alt', `${data.name} Flag`);

  $('#genericModalLabel').text(data.name);
  $('#capitalCityVal').text(data.capital);
  $('#continentVal').text(data.subcontinent);
  $('#populationVal').text(data.population.toLocaleString());

  

  // Populate Bordering Countries
  const borders = data.borders;
  $('#borderCs').empty();
  borders.forEach(countryCode => {
    $('#borderCs').append(`${countryCode}, `);
  });
  $('#borderCs').html($('#borderCs').html().slice(0, -2)); // Remove trailing comma and space

  // Populate Driving Side
  $('#driveSide').text(toTitleCase(data.driveSide));
};

const fetchCountryInfo = (countryCode) => {
  $.ajax({
    url: 'php/getCountryInfo.php',
    type: 'GET',
    data: { code: countryCode },
    success: (response) => {
      if (response.error) {
        alert(response.error);
      } else {
        updateCountryInfoUI(response);
      }
    },
    error: (xhr, status, error) => {
      console.error('Error fetching country info:', error);
    }
  });
};
