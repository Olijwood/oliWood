import { currentCountry, map } from './map.js';
import { round1d, toTitleCase } from './utils.js';
import noUiSlider from 'nouislider';

export let earthquakesGeoJSON = null;
var earthquakeFilters = {
  text: '',
  range: []
};
var earthquakePointsArray = [];
const periodOpacities = {
  'day': 0.08,
  'week': 0.03,
  'month': 0.02
};

export function fetchEarthquakes(period = 'day', minMag = '1.0') {
  if (period === 'month') {
    minMag = '2.5'
  }
  return $.getJSON(`php/fetchEarthquakes.php?period=${period}&mag=${minMag}`, data => {
      earthquakePointsArray = [];

      data.features.forEach(earthquake => {
        earthquakePointsArray.push(earthquake.geometry.coordinates);
      });
      var min = 0;
      var max = 0;
      earthquakesGeoJSON = L.geoJSON(data, {
      style: function (feature) {
        return {
          fillOpacity: periodOpacities[period],
          fillColor: '#000',
          color: '#000',
          opacity: 0.2
        };
      },
      pointToLayer: function (geoJsonPoint, latlng) {
        // Get min max
        if (geoJsonPoint.properties.mag < min || min === 0) min = round1d(geoJsonPoint.properties.mag);
        if (geoJsonPoint.properties.mag > max) max = round1d(geoJsonPoint.properties.mag);
        // Add tooltip popup
        const { mag, place, time } = geoJsonPoint.properties;
        const html = [
         
          mag ? `<strong>${toTitleCase('mag')}</strong>: ${round1d(mag)}` : null,
          place ? `<strong>${toTitleCase('place')}</strong>: ${toTitleCase(place)}` : null,
          time ? `<strong>${toTitleCase('time')}</strong>: ${new Date(time).toLocaleString('en-GB')}` : null
        ].filter(Boolean).join('<br>');
        return L.circle(latlng, 75000 * mag).bindPopup(html);
      },
  }).addTo(map);
  map.fitBounds(earthquakesGeoJSON.getBounds());

  // Make slider
  earthquakeFilters.range = [min, max];
  var slider = document.getElementById('slider');
  if (slider.noUiSlider) {
    slider.noUiSlider.destroy();
  }
  noUiSlider.create(slider, {
      start: [min, max],
      step: 0.1,
      tooltips: true,
      connect: true,
      range: {
          'min': min,
          'max': max
      }
  }).on('slide', (e) => {
    earthquakeFilters.range = [parseFloat(e[0]), parseFloat(e[1])];
    earthquakesGeoJSON.eachLayer(function(layer) {
      filterEarthquakes(layer);
    });
  });
})
  .fail((_, status, error) => console.error("Failed to fetch earthquakes:", error));
}
$(document).on('keyup', '#search', function(e) {
  earthquakeFilters.text = e.target.value;
  earthquakesGeoJSON.eachLayer(function(layer) {
    filterEarthquakes(layer);
  });
});

let earthquakesVisible = true;
$('#toggleEarthquakes').on('click', function() {
  if (earthquakesVisible) {
    map.removeLayer(earthquakesGeoJSON);
    earthquakesVisible = false;
  } else {
    if (!earthquakesGeoJSON) {
      fetchEarthquakes();
    } else {
      earthquakesGeoJSON.addTo(map);
    }
    earthquakesVisible = true;
}});

function filterEarthquakes(layer) {
  var numberOfTrue = 0;
  if (layer.feature.properties.place.toLowerCase().includes(earthquakeFilters.text.toLowerCase())) {
    numberOfTrue++;
  }
  if (layer.feature.properties.mag >= earthquakeFilters.range[0] && layer.feature.properties.mag <= earthquakeFilters.range[1]) {
    numberOfTrue++;
  }
  if (numberOfTrue === 2) {
    layer.addTo(map);
  } else {
    map.removeLayer(layer);
  }
}
import { pointsWithinPolygon, points } from '@turf/turf';
export const calcEarthquakesInCountry = () => {
  
  if (!currentCountry || !currentCountry.borderData) {
    console.error('Border data is missing or not loaded properly.');
    return;
  }

  // Check if the earthquake points array is valid
  if (!Array.isArray(earthquakePointsArray) || earthquakePointsArray.length === 0) {
    console.error('Earthquake points array is invalid or empty.');
    return;
  }

  // Map to [longitude, latitude] format for Turf.js
  const coordinates = earthquakePointsArray.map(coord => [coord[0], coord[1]]);
  const pointsCollection = points(coordinates);

  // Get the border data polygon directly
  const polygon = currentCountry.borderData;

  // Ensure the polygon is of valid type (MultiPolygon or Polygon)
  if (!polygon || (polygon.type !== 'MultiPolygon' && polygon.type !== 'Polygon')) {
    console.error('No valid polygon data in borderData.');
    return;
  }

  // Find points that are within the polygon
  const ptsWithin = pointsWithinPolygon(pointsCollection, polygon);
  const nEarthquakes = ptsWithin.features.length;
  currentCountry.setNEarthQuakesDay(nEarthquakes);
  $('#earthquakeCount').text(`${currentCountry.countryCode}: ${nEarthquakes}`);
};

let eIsExpanded = false;

// Toggle the visibility of the overlay
$('#eOverlayCloseBtn').on('click', function() {
  if (earthquakesGeoJSON) {
    map.removeLayer(earthquakesGeoJSON);
    earthquakesGeoJSON = null;
    earthquakesVisible = false; // Reset the visibility state
  }
  $('#earthquakeOverlay').hide();
});

// Handle advanced features toggle button
$('#eAdvancedToggleBtn').on('click', function() {
  const overlay = $('#earthquakeOverlay');
  const advancedFeatures = $('#eAdvanced');
  const icon = $(this).find('i');

  if (eIsExpanded) {
    // Collapse the overlay
    advancedFeatures.css({ display: 'none' });
    overlay.animate({ height: '130px' }, 300); // Adjust this height to fit non-advanced content
    icon.removeClass('bi-chevron-down').addClass('bi-chevron-up');
  } else {
    // Expand the overlay
    advancedFeatures.css({ display: 'inline-flex' });
    overlay.animate({ height: '220px' }, 300); // Adjust to the original size you want
    icon.removeClass('bi-chevron-up').addClass('bi-chevron-down');
  }

  eIsExpanded = !eIsExpanded;
});

// Handle radio button changes to call fetchEarthquakes
$('input[name="inlineRadioOptions"]').on('change', function() {
  const selectedPeriod = $(this).val();
  map.removeLayer(earthquakesGeoJSON);
  earthquakesGeoJSON = null;
  fetchEarthquakes(selectedPeriod);
});

