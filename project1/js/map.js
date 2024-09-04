// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

let map;

const toTitleCase = (str) => str.replace(
  /\w\S*/g,
  text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
);

// Tile layers for different map views
const streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
});

const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
});

const basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

// Info button for showing weather modal
const weatherBtn = L.easyButton("fa-solid fa-cloud-sun fa-lg", (btn, map) => {
  $("#weatherModal").modal("show");
});

// Info button for showing country info modal
const countryInfoBtn = L.easyButton("fa-solid fa-info-circle fa-lg", (btn, map) => {
  // Ensure there's a selected country before showing the info
  if ($("#countrySelect").val()) {
    $("#countryInfoModal").modal("show");
  } else {
    alert("Please select a country to view information.");
  }
});

// ---------------------------------------------------------
// WEATHER
// ---------------------------------------------------------

const updateWeatherUI = (data) => {
  const weatherDescription = toTitleCase(data.weather[0].description);
  const temperature = data.main.temp;
  const feelsLike = data.main.feels_like;
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;

  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  $('#weatherLocationName').html(`${data.name}, ${data.sys.country}`);
  $('#weatherVal').html(weatherDescription);
  $('#tempVal').html(`<span>${temperature} °C</span> <span class="text-muted small"> (Feels like ${feelsLike} °C)</span>`);
  $('#sunriseSunsetVal').html(`<span>${sunrise}</span> | <span>${sunset}</span>`);
  $('#humidityVal').html(`${humidity}%`);
  $('#windspeedVal').html(`${windSpeed} m/s`);

  // Fetch country information based on the country code from weather data
  fetchCountryInfo(data.sys.country);
};

const fetchWeather = (lat, lon) => {
  $.ajax({
    url: 'php/getWeather.php',
    type: 'GET',
    data: { lat, lon },
    success: (response) => {
      if (response.error) {
        console.error('Error fetching weather data:', response.error);
      } else {
        updateWeatherUI(response);
      }
    },
    error: () => {
      console.error('Failed to fetch weather data.');
    }
  });
};

// ---------------------------------------------------------
// COUNTRY INFO
// ---------------------------------------------------------

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

const updateCountryInfoUI = (data) => {
  $('#countryName').html(data.name);
  $('#populationVal').html(data.population.toLocaleString());
  $('#capitalCityVal').html(data.capital);
  $('#countryFlag').attr('src', data.flag);

  const currencies = data.currencies;
  $('#currencies').empty(); // Clear previous content

  Object.keys(currencies).forEach(currencyCode => {
    const cVals = currencies[currencyCode];
    $('#currencies').append(`
      <div class="currency-item">
        <span>${currencyCode} | </span>
        <span>${cVals.symbol} | </span>
        <span>${toTitleCase(cVals.name)}</span>
      </div>
    `);
  });
};



// ---------------------------------------------------------
// INITIALIZATION
// ---------------------------------------------------------

$(document).ready(() => {
  // Fetch countries and populate the dropdown
  $.ajax({
    url: 'php/getCountries.php',
    method: 'GET',
    dataType: 'json',
    success: (data) => {
      const select = $('#countrySelect');
      data.sort((a, b) => a.name.localeCompare(b.name));
      data.forEach(country => {
        select.append(new Option(country.name, country.code));
      });
    },
    error: (xhr, status, error) => {
      console.error("Failed to fetch countries:", status, error);
    }
  });

  map = L.map("map", {
    layers: [streets]
  }).setView([54.5, -4], 6);

  L.control.layers(basemaps).addTo(map);
  weatherBtn.addTo(map);
  countryInfoBtn.addTo(map);

  // Check for geolocation support
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        map.setView([lat, lon], 10);
        
        // Fetch weather based on user's location
        fetchWeather(lat, lon);
      },
      (error) => {
        console.error('Geolocation request failed');
      }
    );
  } else {
    console.warn('Geolocation is not supported by this browser.');
  }

  // Event handler for country selection
  $('#countrySelect').change(function() {
    const selectedCountryCode = $(this).val();

    $.ajax({
      url: `php/getCapitalCoordinates.php?code=${selectedCountryCode}`,
      method: 'GET',
      dataType: 'json',
      success: (capitalData) => {
        if (capitalData.error) {
          console.error('Error fetching capital data:', capitalData.error);
        } else {
          const { lat, lon } = capitalData;
          map.setView([lat, lon], 10);
          fetchWeather(lat, lon);
        }
      },
      error: (xhr, status, error) => {
        console.error('Failed to fetch capital coordinates:', status, error);
      }
    });

    $.ajax({
      url: `php/getCountryBorders.php?code=${selectedCountryCode}`,
      method: 'GET',
      dataType: 'json',
      success: (borderData) => {
        map.eachLayer((layer) => {
          if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
          }
        });

        const geoJsonLayer = L.geoJson(borderData).addTo(map);
        map.fitBounds(geoJsonLayer.getBounds());
      },
      error: (xhr, status, error) => {
        console.error("Failed to fetch country borders:", status, error);
      }
    });
  });
});
