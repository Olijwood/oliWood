import { currentCountry, hideCustomOverlays, map } from './map.js';
import { round1d, toTitleCase } from './utils.js';
import noUiSlider from 'nouislider';
import { pointsWithinPolygon, points } from '@turf/turf';

export let earthquakesGeoJSON = null;
let earthquakePointsArray = [];
let earthquakesVisible = true;

const earthquakeFilters = {
  text: '',
  range: []
};

const periodOpacities = {
  'day': 0.08,
  'week': 0.03,
  'month': 0.02
};

/**
 * Fetches earthquakes data for the specified period and magnitude.
 * @param {string} [period='day'] - The period for which to fetch earthquakes (day, week, month).
 * @param {string} [minMag='1.0'] - The minimum magnitude of earthquakes to fetch.
 * @returns {Promise<void>}
 */
export function fetchEarthquakes(period = 'day', minMag = '1.0') {
  if (period === 'month') {
    minMag = '2.5';
  }
  return $.getJSON(`php/fetchEarthquakes.php?period=${period}&mag=${minMag}`)
    .done(data => {
      earthquakePointsArray = data.features.map(earthquake => earthquake.geometry.coordinates);
      let min = 0, max = 0;
      earthquakesGeoJSON = L.geoJSON(data, {
        style: () => ({
          fillOpacity: periodOpacities[period],
          fillColor: '#000',
          color: '#000',
          opacity: 0.2
        }),
        pointToLayer: (geoJsonPoint, latlng) => {
          const { mag, place, time } = geoJsonPoint.properties;
          if (mag < min || min === 0) min = round1d(mag);
          if (mag > max) max = round1d(mag);

          const html = [
            mag ? `<strong>Magnitude</strong>: ${round1d(mag)}` : null,
            place ? `<strong>Place</strong>: ${toTitleCase(place)}` : null,
            time ? `<strong>Time</strong>: ${new Date(time).toLocaleString('en-GB')}` : null
          ].filter(Boolean).join('<br>');
          return L.circle(latlng, 75000 * mag).bindPopup(html);
        }
      }).addTo(map);
      map.fitBounds(earthquakesGeoJSON.getBounds());

      // Initialize slider for filtering based on magnitude range
      initializeSlider(min, max);
    })
    .fail((_, status, error) => console.error("Failed to fetch earthquakes:", error));
}

/**
 * Initializes the magnitude filter slider.
 * @param {number} min - Minimum magnitude.
 * @param {number} max - Maximum magnitude.
 */
function initializeSlider(min, max) {
  earthquakeFilters.range = [min, max];
  const slider = document.getElementById('slider');
  
  if (slider.noUiSlider) {
    slider.noUiSlider.destroy();
  }

  noUiSlider.create(slider, {
    start: [min, max],
    step: 0.1,
    tooltips: true,
    connect: true,
    range: { min, max }
  }).on('slide', (values) => {
    earthquakeFilters.range = values.map(parseFloat);
    filterAllEarthquakes();
  });
}

/**
 * Filters earthquakes based on search text and magnitude range.
 */
function filterAllEarthquakes() {
  earthquakesGeoJSON.eachLayer(layer => filterEarthquakes(layer));
}

/**
 * Filters individual earthquake layers based on the applied filters.
 * @param {L.Layer} layer - The Leaflet layer to filter.
 */
function filterEarthquakes(layer) {
  const { text, range } = earthquakeFilters;
  const { place, mag } = layer.feature.properties;

  const matchesText = place.toLowerCase().includes(text.toLowerCase());
  const matchesMagnitude = mag >= range[0] && mag <= range[1];

  if (matchesText && matchesMagnitude) {
    layer.addTo(map);
  } else {
    map.removeLayer(layer);
  }
}

/**
 * Calculates the number of earthquakes within the selected country's borders.
 */
export const calcEarthquakesInCountry = () => {
  if (!currentCountry || !currentCountry.borderData) {
    console.error('Border data is missing or not loaded properly.');
    return;
  }

  if (!Array.isArray(earthquakePointsArray) || earthquakePointsArray.length === 0) {
    console.error('Earthquake points array is invalid or empty.');
    return;
  }

  const coordinates = earthquakePointsArray.map(coord => [coord[0], coord[1]]);
  const pointsCollection = points(coordinates);
  const polygon = currentCountry.borderData;

  if (!polygon || (polygon.type !== 'MultiPolygon' && polygon.type !== 'Polygon')) {
    console.error('No valid polygon data in borderData.');
    return;
  }

  const ptsWithin = pointsWithinPolygon(pointsCollection, polygon);
  const nEarthquakes = ptsWithin.features.length;
  currentCountry.setNEarthQuakesDay(nEarthquakes);
  $('#earthquakeCount').text(`${currentCountry.countryCode}: ${nEarthquakes}`);
};

/**
 * Toggles the visibility of the earthquake layer on the map.
 */
$('#toggleEarthquakes').on('click', function() {
  if (earthquakesVisible) {
    map.removeLayer(earthquakesGeoJSON);
  } else if (!earthquakesGeoJSON) {
    fetchEarthquakes();
  } else {
    earthquakesGeoJSON.addTo(map);
  }
  earthquakesVisible = !earthquakesVisible;
});

// Handles the search input for filtering earthquakes by place name
$(document).on('keyup', '#search', function(e) {
  earthquakeFilters.text = e.target.value;
  filterAllEarthquakes();
});

/**
 * Handles closing of the earthquake overlay and removes the earthquake layer.
 */
$('#eOverlayCloseBtn').on('click', function() {
  if (earthquakesGeoJSON) {
    map.removeLayer(earthquakesGeoJSON);
    earthquakesGeoJSON = null;
    earthquakesVisible = false;
  }
  $('#earthquakeOverlay').hide();
});

/**
 * Toggles the advanced features in the earthquake overlay.
 */
let eIsExpanded = false;
$('#eAdvancedToggleBtn').on('click', function() {
  const overlay = $('#earthquakeOverlay');
  const advancedFeatures = $('#eAdvanced');
  const icon = $(this).find('i');

  if (eIsExpanded) {
    advancedFeatures.hide();
    overlay.animate({ height: '134px' }, 300);
    icon.removeClass('bi-chevron-down').addClass('bi-chevron-up');
  } else {
    advancedFeatures.css({ display: 'inline-flex' });
    overlay.animate({ height: '248px' }, 300);
    icon.removeClass('bi-chevron-up').addClass('bi-chevron-down');
  }

  eIsExpanded = !eIsExpanded;
});

// Handles radio button changes to fetch earthquakes for the selected period
$('input[name="inlineRadioOptions"]').on('change', function() {
  const selectedPeriod = $(this).val();
  map.removeLayer(earthquakesGeoJSON);
  earthquakesGeoJSON = null;
  fetchEarthquakes(selectedPeriod);
});

/**
 * Displays the earthquake overlay and fetches earthquakes if not already loaded.
 */
export const showEarthquakesOverlay = () => {
  hideCustomOverlays();
  $("#earthquakeOverlay").css("display", "flex");
  if (!earthquakesGeoJSON) {
    fetchEarthquakes();
  } else {
    earthquakesGeoJSON.addTo(map);
  }
};