import { adjustColorBrightness, toTitleCase } from "./utils";

class SelectedCountry {
  constructor(countryCode) {
    this.countryCode = countryCode.toUpperCase();
    this.name = "";
    this.lat = 0;
    this.lon = 0;
    this.flag = { src: "", alt: "" };
    this.capitalData = {};
    this.info = {};
    this.weather = {};
    this.cities = [];
    this.airports = [];
    this.hotels = [];
    this.museums = [];

    // Create marker cluster groups
    this.cityLayer = createClusterGroup();
    this.airportLayer = createClusterGroup();
    this.hotelLayer = createCustomClusterGroup('#f08080', 40, 15); // Custom clustering for hotels
    this.museumLayer = createCustomClusterGroup('#dccd8b', 20, 14); // Custom clustering for museums
  }

  setCountryDetails(name, lat, lon, flag, alt) {
    this.name = name;
    this.lat = lat;
    this.lon = lon;
    this.flag.src = flag;
    this.flag.alt = alt || `${name}: Flag`;
  }

  fetchInfo() {
    return $.getJSON('php/getCountryInfo.php', { code: this.countryCode })
      .done(response => {
        if (response.error) {
          alert(response.error);
        } else {
          this.setCountryDetails(response.countryName, response.lat, response.lon, response.flag, response.alt);
          this.info = response;
        }
      })
      .fail((_, status, error) => console.error('Error fetching country info:', error));
  }

  fetchWeather() {
    return $.getJSON('php/getWeather.php', { lat: this.lat, lon: this.lon })
      .done(response => {
        if (response.error) {
          console.error('Error fetching weather data:', response.error);
        } else {
          this.weather = response;
        }
      })
      .fail(() => console.error('Failed to fetch weather data.'));
  }

  fetchCities() {
    return Promise.all([
      this.fetchData('data/cities.json', 'cities'), // Fetch cities
      $.getJSON(`php/getCapitalCoordinates.php?code=${this.countryCode}`) // Fetch capital coordinates
    ])
    .then(([cities, capitalData]) => {
      this.cities = cities[this.countryCode] || [];
  
      if (!capitalData.error) {
        // Add the capital to the cities array with a special property to identify it as capital
        const capitalCity = {
          name: capitalData.name,
          lat: capitalData.lat,
          lon: capitalData.lon,
          isCapital: true
        };
        this.cities.push(capitalCity); // Add capital city to the list of cities
      }
  
      // Populate cityLayer with both cities and the capital
      this.populateLayer(this.cityLayer, this.cities, 'fa-city', '#8f8f8f', 'marker-city');
    })
    .catch(err => console.error('Error fetching cities or capital:', err));
  }
  

  fetchAirports() {
    return this.fetchData(`php/fetchAirports.php?code=${this.countryCode}`, 'airports')
      .then(airports => {
        this.airports = airports;
        this.populateLayer(this.airportLayer, this.airports, 'fa-plane-departure', '#78bfeb', 'marker-airport');
      });
  }

  fetchPOIs(featureCode, layer, iconClass, markerColor) {
    return this.fetchData(`php/fetchPOIs.php?code=${this.countryCode}&fCode=${featureCode}`, 'POIs')
      .then(pois => {
        this.populateLayer(layer, pois.results, iconClass, markerColor, `marker-${featureCode.toLowerCase()}`);
      });
  }

  fetchData(url, type) {
    return $.getJSON(url)
      .then(data => {
        if (data) return data;
        throw new Error(`No ${type} found for this country.`);
      })
      .fail((_, status, error) => {
        throw new Error(`Failed to fetch ${type}: ${status}, ${error}`);
      });
  }

  populateLayer(layer, data, iconClass, color, className = 'custom-div-icon') {
    layer.clearLayers();
    
    data.forEach(item => {
      let markerIconClass = iconClass;
      let markerColor = color;
  
      // If the item is the capital, use a different marker color and icon
      if (item.isCapital) {
        markerIconClass = 'fa-star'; // Different icon for capital
        markerColor = 'black';
        className = 'marker-capital'; // Different color for capital
      }
  
      const icon = createCustomIcon(markerIconClass, markerColor, className);
      const marker = L.marker([item.lat, item.lon], { icon })
        .bindPopup(`<strong>${toTitleCase(item.name)}</strong>`);
      layer.addLayer(marker);
    });
  }
  

  getLayers() {
    return {
      'Cities': this.cityLayer,
      'Airports': this.airportLayer,
      'Hotels': this.hotelLayer,
      'Museums': this.museumLayer
    };
  }

  removeLayersFromMap() {
    [this.cityLayer, this.airportLayer, this.hotelLayer, this.museumLayer].forEach(layer => {
      map.removeLayer(layer);
    });
  }
}

// Factory functions for creating marker clusters and custom icons
function createClusterGroup() {
  return L.markerClusterGroup({
    maxClusterRadius: 22,
    disableClusteringAtZoom: 8,
    iconCreateFunction: cluster => {
      return L.divIcon({
        html: '',
        className: 'c-cluster-icon',
        iconSize: [28, 28]
      });
    }
  });
}

function createCustomClusterGroup(markerColor, maxRadius = 30, disZoomAt = 16) {
  return L.markerClusterGroup({
    maxClusterRadius: maxRadius,
    disableClusteringAtZoom: disZoomAt,
    iconCreateFunction: cluster => {
      const count = cluster.getChildCount();
      const adjustedColor = adjustColorBrightness(markerColor, -Math.min(100, count * 2));
      return L.divIcon({
        html: `<div style="background-color: ${adjustedColor}; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center;">${count}</div>`,
        className: 'custom-cluster-icon',
        iconSize: [30, 30],
        popupAnchor: [0, -20]
      });
    }
  });
}

function createCustomIcon(iconClass, backgroundColor = 'gray', className = 'custom-div-icon', size = '28px') {
  return L.divIcon({
    html: `<div style="border-radius: 50%; display: flex; align-items: center; justify-content: center;">
             <i class="fa ${iconClass}"></i>
           </div>`,
    className: className,
    iconSize: [parseInt(size) * 0.8, parseInt(size) * 0.8],
    popupAnchor: [0, -15]
  });
}

// Global map variables and functions
let map;
export let currentCountry = null;
let currentControlLayers = null;
export let userlat;
export let userlon;

const labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  attribution: '&copy; CartoDB'
});
const terrainLines = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_lines/{z}/{x}/{y}{r}.png', {
  maxZoom: 20,
  attribution: '&copy; Stadia Maps &copy; Stamen Design &copy; OpenMapTiles &copy; OpenStreetMap'
});

// Initialize the map and base layers
function initializeMap() {
  const basemaps = createBaseMaps();
  const overlays = createOverlays();
  
  map = L.map('map').fitWorld();
  basemaps['Streets'].addTo(map);
  L.control.layers(basemaps, overlays).addTo(map);
  handleBaseLayerChange(map);

  map.locate({ setView: true, maxZoom: 12 });
  map.on('locationfound', handleLocationFound);
  map.on('locationerror', handleLocationError);
}

function createBaseMaps() {
  return {
    "Streets": L.tileLayer.provider('Esri.WorldStreetMap'),
    "Satellite": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri ..."
    }),
    "Physical": L.tileLayer.provider('Esri.WorldPhysical')
  };
}

function handleBaseLayerChange(map) {
  map.on('baselayerchange', ({ name }) => {
    const isSatelliteOrPhysical = name === "Satellite" || name === "Physical";
    [labels, terrainLines].forEach(layer => {
      if (isSatelliteOrPhysical) {
        map.addLayer(layer);
      } else {
        map.removeLayer(layer);
      }
    });
  });
}

function createOverlays() {
  return {
    'Names': labels,
    'Borders': terrainLines
  };
}

// Handle map events
function handleLocationFound(e) {
  const { latlng, accuracy } = e;
  userlat = latlng.lat;
  userlon = latlng.lng;

  L.marker(latlng).addTo(map).bindPopup("You are here").openPopup();
  L.circle(latlng, accuracy).addTo(map);

  $.getJSON(`php/reverseGeocode.php?lat=${latlng.lat}&lon=${latlng.lng}`, data => {
    if (data.countryCode) {
      initializeSelectedCountry(data.countryCode);
      $('#hiddenCountrySelected').val(data.countryCode).trigger('change');
    }
  }).fail((_, status, error) => console.error("Failed to reverse geocode:", error));
}

function handleLocationError(e) {
  console.error('Location error: ', e.message);
}

// Initialize the selected country
function initializeSelectedCountry(countryCode) {
  if (currentCountry) currentCountry.removeLayersFromMap();

  currentCountry = new SelectedCountry(countryCode);
  // showCapitalIcon(countryCode);
  currentCountry.fetchInfo();
  currentCountry.fetchWeather();
  currentCountry.fetchCities();
  currentCountry.fetchAirports();
  currentCountry.fetchPOIs('HTL', currentCountry.hotelLayer, 'fa-bell-concierge', '#dc4d8d');
  currentCountry.fetchPOIs('MUS', currentCountry.museumLayer, 'fa-landmark', '#dccd8b');

  if (currentControlLayers) map.removeControl(currentControlLayers);
  currentControlLayers = L.control.layers(null, currentCountry.getLayers()).addTo(map);
}

// Load countries into dropdown
function loadCountries() {
  $.getJSON('php/getCountries.php', data => {
    const select = $('#countrySelect');
    select.append(data.sort((a, b) => a.name.localeCompare(b.name)).map(country => new Option(country.name, country.code)));
  }).fail((_, status, error) => console.error("Failed to fetch countries:", error));
}

const showCapitalIcon = (countryCode) => {
  $.getJSON(`php/getCapitalCoordinates.php?code=${countryCode}`, capitalData => {
    if (!capitalData.error) {
      let capitalIcon = createCustomIcon('fa-city', 'black', 'marker-capital');
      L.marker([capitalData.lat, capitalData.lon], { icon: capitalIcon }).addTo(map).bindPopup(`<strong>Capital City:<br> ${toTitleCase(capitalData.name)}</strong>`);
    }
  });
}
// Handle country selection changes
function handleCountrySelection() {
  $('#countrySelect').change(function () {
    const selectedCountryCode = $(this).val();
    initializeSelectedCountry(selectedCountryCode);

    $.getJSON(`php/getCountryBorders.php?code=${selectedCountryCode}`, borderData => {
      const geoJsonLayer = L.geoJson(borderData, {
        style: { color: "#ff7800", weight: 5, opacity: 0.65, fillOpacity: 0.125 }
      }).addTo(map);
      map.fitBounds(geoJsonLayer.getBounds());
    });
  });
}

// Initialize modals for buttons
const modalBtns = [
  L.easyButton("bi-cloud-sun", () => $("#weatherModal").modal("show")),
  L.easyButton("bi-info-circle", () => $("#infoModal").modal("show")),
  L.easyButton("bi-bar-chart", () => $("#demographicsModal").modal("show")),
  L.easyButton("bi-cash", () => $("#currencyModal").modal("show"))
];

function showModalBtns() {
  modalBtns.forEach(btn => btn.addTo(map));
}

// Document ready function
$(document).ready(function() {
  initializeMap();
  loadCountries();
  handleCountrySelection();
  showModalBtns();
});
