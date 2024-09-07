const updateCountryInfo = (countryData) => {
  const {
    name,
    officialName,
    capital,
    continent,
    subcontinent,
    population,
    languages,
    currencies,
    flag,
    alt,
    borders,
    driveSide,
    landlocked,
    area,
    demonyms,
    independent,
    unm49,
  } = countryData;

  // Set country flag
  $('#countryFlag').attr('src', flag).attr('alt', alt || `${name} Flag`);

  // General Info
  $('#cNameVal').text(name);
  $('#officialNameVal').text(officialName);
  $('#capitalCityVal').text(capital);
  $('#continentVal').text(continent);
  $('#subcontinentVal').text(subcontinent);
  $('#populationVal').text(population.toLocaleString());

  // Bordering countries
  $('#borderCs').empty();
  if (borders && borders.length) {
    borders.forEach((border) => {
      $('#borderCs').append(`<li>${border}</li>`);
    });
  } else {
    $('#borderCs').append(`<li>No bordering countries</li>`);
  }

  // Driving side
  $('#driveSideVal').text(toTitleCase(driveSide));

  // Languages
  $('#languagesTable').empty();
  if (languages && Object.keys(languages).length) {
    Object.entries(languages).forEach(([code, language]) => {
      $('#languagesTable').append(`<li>${language}</li>`);
    });
  } else {
    $('#languagesTable').html('<li>N/A</li>');
  }

  // Currencies
  $('#currenciesVal').empty();
  if (currencies && Object.keys(currencies).length) {
    Object.entries(currencies).forEach(([code, currency]) => {
      $('#currenciesVal').append(`<li>${currency.name}</li>`);
    });
  } else {
    $('#currenciesVal').html('<li>N/A</li>');
  }

  // More Info
  $('#areaVal').text(`${area.toLocaleString()} km²`);
  $('#landlockedVal').text(landlocked ? 'Yes' : 'No');
  $('#independentVal').text(independent ? 'Yes' : 'No');
  $('#unm49Val').text(unm49 ? 'Yes' : 'No');

  // Demonyms
  $('#demonymsTable').empty();
  if (demonyms && Object.keys(demonyms).length) {
    Object.entries(demonyms).forEach(([lang, { m, f }]) => {
      $('#demonymsTable').append(`<tr><td>${lang}</td><td>${m} / ${f}</td></tr>`);
    });
  } else {
    $('#demonymsTable').html('<tr><td colspan="2">N/A</td></tr>');
  }
};

// Fetch country info via AJAX
const fetchCountryInfo = (countryCode) => {
  $.ajax({
    url: 'php/getCountryInfo.php',
    type: 'GET',
    data: { code: countryCode },
    success: (response) => {
      if (response.error) {
        alert(response.error);
      } else {
        updateCountryInfo(response);
      }
    },
    error: (xhr, status, error) => {
      console.error('Error fetching country info:', error);
    },
  });
};
