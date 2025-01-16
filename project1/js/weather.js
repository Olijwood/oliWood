import { toTitleCase } from './utils.js';
import {
  currentCountry,
  hideCustomOverlays,
  userLat,
  userLon,
  userCountryCode,
} from './map.js';

/**
 * Updates the weather UI with the provided data.
 * @param {Object} data - Weather data to update the UI.
 * @param {boolean} [isUser=false] - Indicates whether the weather is for the user or not.
 */
export const updateWeatherUI = (data, isUser = false) => {
  const locationName = isUser
    ? data.wStationName
    : currentCountry.capitalData.name;
  // Update weather details
  $('#temperature').html(`${Math.round(data.temperature)}`);
  $('#humidity').text(`Humidity: ${data.humidity}%`);
  $('#windSpeed').text(`Wind: ${Math.round(data.windSpeed)} mph`);
  $('#weatherLocation').text(locationName);
  $('#weatherTime').text('Today');
  $('#weatherDesc').text(toTitleCase(data.wDesc));
  $('#currentWeatherIcon').attr(
    'class',
    `bi bi-${getWeatherIconClass(data.wMain, data.wDesc)}`,
  );
};

/**
 * Toggles between Celsius and Fahrenheit.
 */
$('#tempToggleIcon').on('click', function () {
  const isCelsius = $('#tempToggle #unit').text() === '°C';

  let temp = parseFloat($('#temperature').text());
  temp = isCelsius ? (temp * 9) / 5 + 32 : (temp - 32) * (5 / 9);

  $('#temperature').text(`${Math.round(temp)}`);
  $('#tempToggle #unit').text(isCelsius ? '°F' : '°C');
});

/**
 * Closes the weather overlay.
 */
$('#wOverlayCloseBtn').on('click', () => {
  $('#weatherOverlay').hide();
});

/**
 * Fetches weather data for the given latitude and longitude.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 */
const fetchWeather = (lat, lon) => {
  $.getJSON('php/getWeather.php', { lat, lon })
    .done((response) => {
      if (!response.error) {
        updateWeatherUI(response, true);
        fetchWeatherForecast(lat, lon);
      } else {
        console.error('Error fetching weather data:', response.error);
      }
    })
    .fail(() => console.error('Failed to fetch weather data.'));
};

/**
 * Updates the hourly weather carousel with the provided hourly data.
 * @param {Array} hours - Array of hourly weather data.
 */
const updateHourlyCarousel = (hours) => {
  const hourlyCarousel = $('#hourlyCarousel');
  hourlyCarousel.empty(); // Clear previous content

  // Populate hourly cards
  hours.forEach((hourData) => {
    const iconClass = getWeatherIconClass(hourData.cMain, hourData.cDesc);
    const hourCard = `
      <div class="hour-card">
        <div class="hour">${hourData.hour}:00</div>
        <i class="bi bi-${iconClass} hourly-icon"></i>
        <div class="hour-temp">${Math.round(hourData.temp)}°</div>
      </div>
    `;
    hourlyCarousel.append(hourCard);
  });
};

/**
 * Updates the forecast UI with the provided weather data.
 * @param {Object} data - Forecast data.
 */
const updateForecastUI = (data) => {
  const forecastContainer = $('#dailyCarousel');
  forecastContainer.empty(); // Clear previous content
  const days = {};

  // Process each forecast entry
  data.list.forEach((entry) => {
    const date = new Date(entry.dt * 1000);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const hour = date.getHours();
    const { main, description } = entry.weather[0];
    const cMain = String(main) || main;
    const cDesc = String(description).toLowerCase();

    if (!days[day]) {
      days[day] = {
        date: day,
        temp: entry.main.temp,
        maxTemp: entry.main.temp_max,
        minTemp: entry.main.temp_min,
        cMain,
        cDesc,
        windSpeed: entry.wind.speed,
        humidity: entry.main.humidity,
        hours: [],
      };
    } else {
      days[day].maxTemp = Math.max(days[day].maxTemp, entry.main.temp_max);
      days[day].minTemp = Math.min(days[day].minTemp, entry.main.temp_min);
    }

    // Add hourly data
    days[day].hours.push({
      hour,
      temp: entry.main.temp,
      cMain,
      cDesc,
    });
  });

  // Create daily forecast cards
  Object.keys(days).forEach((day) => {
    const dayData = days[day];
    const iconClass = getWeatherIconClass(dayData.cMain, dayData.cDesc);

    const dayCard = `
      <div class="forecast-card" data-day="${day}">
        <div class="day">${dayData.date}</div>
        <i class="bi bi-${iconClass} forecast-icon"></i>
        <div class="temp">${Math.round(dayData.maxTemp)}° / <span class="text-muted">${Math.round(dayData.minTemp)}°</span></div>
      </div>
    `;
    forecastContainer.append(dayCard);
  });

  // Set the initial active day (first day)
  const firstDayCard = $('.forecast-card').first();
  firstDayCard.addClass('active-forecast');
  firstDayCard.children('.day').text('Today');
  updateHourlyCarousel(days[firstDayCard.data('day')].hours);

  // Add click event to daily cards to update hourly carousel and active state
  $('.forecast-card').on('click', function () {
    $('.forecast-card').removeClass('active-forecast');
    $(this).addClass('active-forecast');

    const day = $(this).data('day');
    updateHourlyCarousel(days[day].hours);
    updateSelectedDayWeather(days[day]);
  });
};

/**
 * Updates the main weather section with selected day's weather.
 * @param {Object} selectedDayData - The weather data for the selected day.
 */
const updateSelectedDayWeather = (selectedDayData) => {
  $('#temperature').html(`${Math.round(selectedDayData.temp)}`);
  $('#weatherDesc').text(toTitleCase(selectedDayData.cDesc));
  $('#humidity').text(`Humidity: ${selectedDayData.humidity}%`);
  $('#windSpeed').text(`Wind: ${Math.round(selectedDayData.windSpeed)} mph`);
  $('#weatherTime').text('Today'); // Set it to 'Today' for simplicity
  $('#currentWeatherIcon').attr(
    'class',
    `bi bi-${getWeatherIconClass(selectedDayData.cMain, selectedDayData.cDesc)}`,
  );
};

/**
 * Fetches the weather forecast for the given latitude and longitude.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 */
const fetchWeatherForecast = (lat, lon) => {
  $.getJSON('php/getWeatherForecast.php', { lat, lon })
    .done((response) => {
      if (!response.error) {
        updateForecastUI(response);
      } else {
        console.error('Error fetching weather forecast:', response.error);
      }
    })
    .fail(() => console.error('Failed to fetch weather forecast.'));
};

/**
 * Maps weather conditions to corresponding Bootstrap icons.
 * @param {string} cMain - Main weather condition.
 * @param {string} cDesc - Description of the weather condition.
 * @returns {string} - The Bootstrap icon class for the weather condition.
 */
const getWeatherIconClass = (cMain, cDesc) => {
  const iconMapping = {
    Clear: 'brightness-high',
    Clouds: {
      'few clouds': 'cloud-sun',
      'scattered clouds': 'cloud',
      'broken clouds': 'clouds',
      'overcast clouds': 'clouds',
    },
    Rain: cDesc.includes('light')
      ? 'cloud-drizzle'
      : cDesc.includes('heavy')
        ? 'cloud-rain-heavy'
        : 'cloud-rain',
    Snow: 'cloud-snow',
    Drizzle: 'cloud-drizzle',
    Thunderstorm: cDesc.includes('rain')
      ? 'cloud-lightning-rain'
      : 'cloud-lightning',
    Mist: 'cloud-haze2',
    Fog: 'cloud-haze2',
    Dust: 'cloud-haze2',
    Sand: 'cloud-haze2',
    Ash: 'cloud-haze2',
    Squall: 'cloud-hail',
    Tornado: 'tornado',
  };

  if (cMain === 'Clouds' && iconMapping['Clouds'][cDesc]) {
    return iconMapping['Clouds'][cDesc];
  }

  return iconMapping[cMain] || 'cloud'; // Default to 'cloud' if no match
};

let wIsExpanded = false;

/**
 * Toggles the advanced features in the weather overlay.
 */
$('#wAdvancedToggleBtn').on('click', function () {
  const overlay = $('#weatherOverlay');
  const advancedFeatures = $('#wAdvanced');
  const icon = $(this).find('i');

  if (wIsExpanded) {
    advancedFeatures.hide();
    overlay.animate({ height: '190px' }, 300);
    icon.removeClass('bi-chevron-down').addClass('bi-chevron-up');
  } else {
    advancedFeatures.css({ display: 'inline-flex' });
    overlay.animate({ height: '454px' }, 300);
    icon.removeClass('bi-chevron-up').addClass('bi-chevron-down');
  }

  wIsExpanded = !wIsExpanded;
});

/**
 * Displays the weather overlay and fetches weather data if necessary.
 */
export const showWeatherOverlay = () => {
  hideCustomOverlays();
  $('#weatherOverlay').css('display', 'flex');
  if (userCountryCode === currentCountry.countryCode) {
    fetchWeather(userLat, userLon);
    $('.o-load').addClass('fadeOut');
  } else if (currentCountry.weather) {
    updateWeatherUI(currentCountry.weather);
    fetchWeatherForecast(
      currentCountry.capitalData.lat,
      currentCountry.capitalData.lon,
    );
  } else {
    console.log('No weather data available.');
  }
};
