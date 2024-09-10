
const updateWeatherUI = (data) => {
  // Update weather elements
  const weatherDescription = toTitleCase(data.weather[0].description);
  const temperature = data.main.temp;
  const feelsLike = data.main.feels_like;
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;

  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  $('#weatherVal').html(weatherDescription);
  $('#tempVal').html(`${temperature} °C (Feels like ${feelsLike} °C)`);
  $('#sunriseSunsetVal').html(`${sunrise} | ${sunset}`);
  $('#humidityVal').html(`${humidity}%`);
  $('#windspeedVal').html(`${windSpeed} m/s`);

  userCountryCode = data.sys.country;
  userCountryCodeInput.val(userCountryCode).trigger('change');
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
