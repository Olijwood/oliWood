import { toTitleCase } from './utils.js';
import { currentCountry } from './map.js';

export const updateWeatherUI = (data, isUser = false) => {
  let locName = !isUser ? currentCountry.capitalData.name : data.wStationName;
  // Update the main weather details
  $('#temperature').html(`${Math.round(data.temperature)}`);
  $('#humidity').text(`Humidity: ${data.humidity}%`);
  $('#windSpeed').text(`Wind: ${Math.round(data.windSpeed)} mph`);
  $('#weatherLocation').text(locName);
  $('#weatherTime').text('Now');
  $('#weatherDesc').text(toTitleCase(data.wDesc));
  $('#currentWeatherIcon').attr('class', `bi bi-${getWeatherIconClass(data.wMain, data.wDesc)}`);

};

// Toggle between Celsius and Fahrenheit
$('#tempToggleIcon').on('click', function() {
  const isCelsius = $('#tempToggle #unit').text() == ('°C');

  // Update temperature
  let temp = parseFloat($('#temperature').text());
  if (isCelsius) {
    temp = (temp - 32) * (5 / 9);
  } else {
    temp = (temp * 9 / 5) + 32;
  }
  $('#temperature').text(`${Math.round(temp)}`);

  // Update unit
  $('#tempToggle #unit').text(isCelsius ? '°F' : '°C');
});

// Close weather overlay
$('#wOverlayCloseBtn').on('click', () => {
  $('#weatherOverlay').hide();
});


// Handle forecast selection
$('.forecast-card').on('click', function() {
  const day = $(this).data('day');
  updateWeatherUI(days[day]);
});

// Initialize overlay when weather data is ready
export const fetchWeather = (lat, lon) => {
  $.getJSON('php/getWeather.php', { lat, lon })
    .done((response) => {
      if (!response.error) {
        updateWeatherUI(response, true);
        fetchWeatherForecast(lat, lon);
      } else {
        console.error('Error fetching weather data:', response.error);
      }
    })
    .fail(() => {
      console.error('Failed to fetch weather data.');
    });
};


const updateHourlyCarousel = (hours) => {
  const hourlyCarousel = $('#hourlyCarousel');
  hourlyCarousel.empty(); // Clear previous content

  // Create hourly cards
  hours.forEach(hourData => {
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

const updateForecastUI = (data) => {
  const forecastContainer = $('#dailyCarousel');
  forecastContainer.empty(); // Clear previous content
  const days = {};

  // Process each forecast entry
  data.list.forEach(entry => {
    const date = new Date(entry.dt * 1000);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const hour = date.getHours();
    const cMain = String(entry.weather[0].main) || entry.weather[0].main;
    const cDesc = String(entry.weather[0].description).toLowerCase();

    if (!days[day]) {
      days[day] = {
        date: day,
        temp: entry.main.temp,
        maxTemp: entry.main.temp_max,
        minTemp: entry.main.temp_min,
        cMain: cMain,
        cDesc: cDesc,
        windSpeed: entry.wind.speed,
        humidity: entry.main.humidity,
        hours: []
      };
    } else {
      days[day].maxTemp = Math.max(days[day].maxTemp, entry.main.temp_max);
      days[day].minTemp = Math.min(days[day].minTemp, entry.main.temp_min);
    }

    // Add hourly data
    days[day].hours.push({
      hour: hour,
      temp: entry.main.temp,
      cMain: cMain,
      cDesc: cDesc
    });
  });

  // Create daily forecast cards
  for (const day in days) {
    const dayData = days[day];
    const iconClass = getWeatherIconClass(dayData.cMain, dayData.cDesc);

    // Daily card
    const dayCard = `
      <div class="forecast-card" data-day="${day}">
        <div class="day">${dayData.date}</div>
        <i class="bi bi-${iconClass} forecast-icon"></i>
        <div class="temp">${Math.round(dayData.maxTemp)}° / <span class="text-muted">${Math.round(dayData.minTemp)}°</span></div>
      </div>
    `;
    forecastContainer.append(dayCard);
  }

  // Set the initial active day (first day)
  const firstDayCard = $('.forecast-card').first();
  firstDayCard.addClass('active-forecast');
  updateHourlyCarousel(days[firstDayCard.data('day')].hours);

  // Add click event to daily cards to update the hourly carousel and active state
  $('.forecast-card').on('click', function() {
    // Remove the active class from all cards
    $('.forecast-card').removeClass('active-forecast');

    // Add the active class to the clicked card
    $(this).addClass('active-forecast');

    // Update the hourly carousel
    const day = $(this).data('day');
    updateHourlyCarousel(days[day].hours);

    // Update the weather-content section with the selected day's weather
    const selectedDayData = days[day];
    $('#temperature').html(`${Math.round(selectedDayData.temp)}`);
    $('#weatherDesc').text(toTitleCase(selectedDayData.cDesc));
    $('#humidity').text(`Humidity: ${selectedDayData.humidity}%`);
    $('#windSpeed').text(`Wind: ${Math.round(selectedDayData.windSpeed)} mph`);
    $('#weatherTime').text(day); // Update the time to the selected day
    $('#currentWeatherIcon').attr('class', `bi bi-${getWeatherIconClass(selectedDayData.cMain, selectedDayData.cDesc)}`);
  });
};



export const fetchWeatherForecast = (lat, lon) => {
  $.getJSON('php/getWeatherForecast.php', { lat, lon })
    .done((response) => {
      if (response.error) {
        console.error('Error fetching weather forecast:', response.error);
      } else {
        updateForecastUI(response);
      }
    })
    .fail(() => {
      console.error('Failed to fetch weather forecast.');
    });
};

// Mapping function for weather conditions to Bootstrap icons
const getWeatherIconClass = (cMain, cDesc) => {
  // Main condition to icon mapping
  const iconMapping = {
    'Clear': 'brightness-high',
    'Clouds': {
      'few clouds': 'cloud-sun',
      'scattered clouds': 'cloud',
      'broken clouds': 'clouds',
      'overcast clouds': 'clouds'
    },
    'Rain': (cDesc.includes('light')) ? 'cloud-drizzle' : 
            (cDesc.includes('heavy')) ? 'cloud-rain-heavy' : 
            'cloud-rain',
    'Snow': 'cloud-snow',
    'Drizzle': 'cloud-drizzle',
    'Thunderstorm': (cDesc.includes('rain')) ? 'cloud-lightning-rain' : 'cloud-lightning',
    'Mist': 'cloud-haze2',
    'Smoke': 'cloud-haze2',
    'Haze': 'cloud-haze2',
    'Dust': 'cloud-haze2',
    'Fog': 'cloud-haze2',
    'Sand': 'cloud-haze2',
    'Ash': 'cloud-haze2',
    'Squall': 'cloud-hail',
    'Tornado': 'tornado'
  };

  // Handle cloud-specific cases
  if (cMain === 'Clouds' && iconMapping['Clouds'][cDesc]) {
    return iconMapping['Clouds'][cDesc];
  }

  // Return icon based on main weather condition
  return iconMapping[cMain] || 'cloud'; // Default to 'cloud' if no match found
};

let wIsExpanded = false;

// Handle advanced features toggle button
$('#wAdvancedToggleBtn').on('click', function() {
  const overlay = $('#weatherOverlay');
  const advancedFeatures = $('#wAdvanced');
  const icon = $(this).find('i');

  if (wIsExpanded) {
    // Collapse the overlay
    advancedFeatures.css({ display: 'none' });
    overlay.animate({ height: '190px' }, 300); // Adjust this height to fit non-advanced content
    icon.removeClass('bi-chevron-down').addClass('bi-chevron-up');
  } else {
    // Expand the overlay
    advancedFeatures.css({ display: 'inline-flex' });
    overlay.animate({ height: '474px' }, 300); // Adjust to the original size you want
    icon.removeClass('bi-chevron-up').addClass('bi-chevron-down');
  }

  wIsExpanded = !wIsExpanded;
});

