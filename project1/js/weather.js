import { toTitleCase } from './utils.js';
import { currentCountry } from './map.js';
import { weatherConfig } from './configs/modalConfigs.js';

const injectWeatherVals = (data, weatherConfig) => {
  weatherConfig.forEach((config) => {
    if (config.format === '') {
      $(`#${config.id}`).html(`${data[config.id]}<span class="text-muted"> ${config.unit}</span>`);
    } else {
      $(`#${config.id}`).html(`${toTitleCase(data[config.id])}`);
    };
  });
}

const format12HourTime = (time) => {
  return new Date(time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const updateWeatherUI = (data) => {
  injectWeatherVals(data, weatherConfig);
  
  const sunrise = format12HourTime(data.sunrise);
  const sunset = format12HourTime(data.sunset);

  $('#temperature').html(`${data.temperature}<span class="text-muted"> °C</span> <span class="text-muted small">(${data.feelsLike} °C)</span>`);
  $('#sunriseSunset').html(`${sunrise} | ${sunset}`);

};
  

export const fetchWeather = (lat, lon) => {
  $.getJSON('php/getWeather.php', { lat, lon })
    .done((response) => {
      if (response.error) {
        console.error('Error fetching weather data:', response.error);
      } else {
        updateWeatherUI(response);
      }
    })
    .fail(() => {
      console.error('Failed to fetch weather data.');
    });
};

$('#weatherModal').on('shown.bs.modal', () => {
  currentCountry.fetchWeather();
  updateWeatherUI(currentCountry.weather);
});


