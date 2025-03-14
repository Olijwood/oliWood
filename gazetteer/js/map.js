import { adjustColorBrightness, toTitleCase } from "./utils";
import { showEarthquakesOverlay } from "./earthquakes.js";
import { showCurrencyOverlay, loadCurrenciesForCountry } from "./currency.js";
import { showWeatherOverlay, updateWeatherUI } from "./weather.js";
import { showDemographicsOverlay } from "./demographics.js";
import { showGeneralInfoOverlay } from "./country-info.js";

/* ------------------------------------------------------------------------------
    SELECTED COUNTRY CLASS
    Handles fetching country info, borders, weather, and POIs (Points of Interest).
------------------------------------------------------------------------------ */

class SelectedCountry {
  constructor(countryCode) {
    this.countryCode = countryCode.toUpperCase();
    this.name = "";
    this.lat = 0;
    this.lon = 0;
    this.flag = { src: "", alt: "Country Flag" };
    this.capitalData = {};
    this.info = {};
    this.weather = {};
    this.cities = [];
    this.airports = [];
    this.hotels = [];
    this.museums = [];
    this.railwayStations = [];
    this.borderData = {};
    this.nEarthquakesDay = 0;

    // Flags to track if POI data has been fetched
    this.hasFetchedHotels = false;
    this.hasFetchedMuseums = false;
    this.hasFetchedRailwayStations = false;

    // Create marker cluster groups
    this.borderLayer = null;
    this.cityLayer = createCustomClusterGroup('#919090', 38, 15, 30, false);
    this.airportLayer = createCustomClusterGroup('#9eceec', 40, 15, 30, false);
    this.railwayStationLayer = createCustomClusterGroup('#ff3131', 60, 16, 30, false, 0.88);
    this.hotelLayer = createCustomClusterGroup('#ff177f', 50, 15, 30, true);
    this.museumLayer = createCustomClusterGroup('#dccd8b', 26, 14, 30, true);
  }

  /* Fetch country info, borders, and weather */
  async fetchInfo() {
    try {
      const response = await $.getJSON('php/getCountryInfo.php', { code: this.countryCode });
      if (response.error) {
        alert(response.error);
        return;
      }
      const { name, lat, lon, flag, alt } = response;
      this.setCountryDetails(name, lat, lon, flag, alt);
      this.info = response;
    } catch (error) {
      console.error(`Error fetching country info for ${this.countryCode}: ${error.message}`);
    }
  }

  setCountryDetails(name, lat, lon, flag, alt) {
    Object.assign(this, { name, lat, lon });
    this.flag.src = flag;
    this.flag.alt = alt || `${name}: Flag`;
  }

  async fetchCountryBorderData() {
    try {
      const response = await $.getJSON(`php/getCountryBorders.php?code=${this.countryCode}`);
      this.borderData = response;
    } catch (error) {
      console.error(`Failed to fetch country border data for ${this.countryCode}: ${error.message}`);
    }
  }

  async fetchCountryWeather() {
    const { lat, lon } = this.capitalData;
    try {
      const response = await $.getJSON('php/getWeather.php', { lat, lon });
      if (response.error) throw new Error(response.error);
      this.weather = response;
    } catch (error) {
      console.error(`Failed to fetch weather data for ${this.countryCode}: ${error.message}`);
    }
  }

  /* Fetch Points of Interest (POIs) like Hotels, Museums, etc. */
  async fetchPOIs(featureCode, layer, iconClass, markerColor, bgColor='#fff', borderColor='') {
    try {
      const pois = await this.fetchData(`php/fetchPOIs.php?code=${this.countryCode}&fCode=${featureCode}`, 'POIs');
      layer.clearLayers();
      const markers = pois.results.map(item => {
        const icon = createCustomIcon(iconClass, markerColor, bgColor, borderColor);
        return L.marker([item.lat, item.lon], { icon })
          .bindPopup(`<strong>${toTitleCase(item.name)}</strong>`);
      });
      layer.addLayers(markers); // Add markers in batch
    } catch (error) {
      console.error(`Error fetching POIs (${featureCode}) for ${this.countryCode}: ${error.message}`);
    }
  }

  fetchPOIsOnce(featureCode, flagName, layer, iconClass, markerColor, bgColor='#fff', borderColor='') {
    if (!this[flagName]) {
      this.fetchPOIs(featureCode, layer, iconClass, markerColor, bgColor, borderColor)
        .then(() => { this[flagName] = true; })
        .catch(error => console.error(`Error fetching ${featureCode}:`, error));
    }
  }

  /* Fetch capital coordinates */
  async getCapitalCoordinates() {
    if (this.capitalData.lat && this.capitalData.lon) return this.capitalData;

    try {
      const response = await $.getJSON(`php/getCapitalCoordinates.php?code=${this.countryCode}`);
      if (response.error) throw new Error(response.error);
      Object.assign(this.capitalData, response);
      return this.capitalData;
    } catch (error) {
      console.error(`Error fetching capital coordinates for ${this.countryCode}: ${error.message}`);
    }
  }

  /* Fetch and populate cities, airports, etc. */
  async fetchCities() {
    try {
      const [cities, capital] = await Promise.all([
        this.fetchData('data/cities.json', 'cities'),
        this.getCapitalCoordinates()
      ]);

      const cityData = cities[this.countryCode] || [];
      if (capital) {
        cityData.push({
          name: capital.name,
          lat: capital.lat,
          lon: capital.lon,
          isCapital: true
        });
      }

      this.cities = cityData;
      this.populateLayer(this.cityLayer, cityData, 'city', '#8f8f8f');
    } catch (error) {
      console.error(`Error fetching cities for ${this.countryCode}: ${error.message}`);
    }
  }

  fetchAirports() {
    return this.fetchData(`php/fetchAirports.php?code=${this.countryCode}`, 'airports')
      .then(airports => {
        this.airports = airports;
        this.populateLayer(this.airportLayer, this.airports, 'plane-departure', '#78bfeb');
      })
      .catch(error => console.error(`Error fetching airports for ${this.countryCode}: ${error.message}`));
  }

  fetchHotels() {
    this.fetchPOIsOnce('HTL', 'hasFetchedHotels', this.hotelLayer, 'bell-concierge', '#dc4d8d');
  }

  fetchMuseums() {
    this.fetchPOIsOnce('MUS', 'hasFetchedMuseums', this.museumLayer, 'landmark', '#8d8149', '#fff');
  }

  fetchRailwayStations() {
    this.fetchPOIsOnce('RSTN', 'hasFetchedRailwayStations', this.railwayStationLayer, 'train', '#ff0000');
  }

  /* Populate map layers */
  getLayers() {
    const layers = {
      'Cities': this.cityLayer,
      'Airports': this.airportLayer,
      'Train Stations': this.railwayStationLayer,
      'Hotels': this.hotelLayer,
      'Museums': this.museumLayer,
    };

    this.hotelLayer.on('add', () => {
      this.fetchHotels();
      this.hotelLayer.off('add'); // Remove listener after first fetch
    });

    this.museumLayer.on('add', () => {
      this.fetchMuseums();
      this.museumLayer.off('add');
    });

    this.railwayStationLayer.on('add', () => {
      this.fetchRailwayStations();
      this.railwayStationLayer.off('add');
    });

    return layers;
  }


  populateLayer(layer, data, iconClass, color, borderColor='') {
    layer.clearLayers();
    data.forEach(item => {
      let bgColor = 'white';
      if (item.isCapital) {
        iconClass = 'star';
        bgColor = 'black';
        color = 'gold';
      }

      const icon = createCustomIcon(iconClass, color, bgColor, borderColor );
      const marker = L.marker([item.lat, item.lon], { icon })
        .bindPopup(`<strong>${toTitleCase(item.name)}</strong>`);
      layer.addLayer(marker);
    });
  }

  /* Remove all layers from map */
  removeLayersFromMap() {
    [this.borderLayer, this.cityLayer, this.airportLayer, this.hotelLayer, this.museumLayer, this.railwayStationLayer].forEach(layer => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
  }

  setNEarthQuakesDay(nEarthquakesDay) {
    this.nEarthquakesDay = nEarthquakesDay;
  }

  /* Fetch data utility */
  fetchData(url, type) {
    return $.getJSON(url)
      .then(data => {
        if (data) return data;
        throw new Error(`No ${type} found for this country.`);
      })
      .fail((_, status, error) => {
        console.error(`Failed to fetch ${type} from ${url}: ${status}, ${error}`);
        throw new Error(`Failed to fetch ${type}: ${status}, ${error}`);
      });
  }
}

/* ------------------------------------------------------------------------------
    HELPER FUNCTIONS FOR CREATING MARKER CLUSTERS
------------------------------------------------------------------------------ */

/**
 * Creates a custom marker cluster group for POIs like hotels, museums, and railway stations.
 * @param {string} markerColor - Color for the marker cluster.
 * @param {number} [maxRadius=30] - Maximum cluster radius.
 * @param {number} [disZoomAt=16] - Zoom level to disable clustering.
 * @param {number} [size=30] - Size of the marker cluster icon.
 * @param {boolean} [borderBlack=true] - Whether to add a black border around the marker.
 * @returns {L.MarkerClusterGroup} - The created custom cluster group.
 */
function createCustomClusterGroup(markerColor, maxRadius = 30, disZoomAt = 16, size = 30, borderBlack = true, customFontSize = '') {
  return L.markerClusterGroup({
    maxClusterRadius: maxRadius,
    disableClusteringAtZoom: disZoomAt,
    chunkedLoading: true,
    chunkDelay: 50,
    chunkInterval: 200,
    iconCreateFunction: cluster => {
      const count = cluster.getChildCount();
      const adjustedColor = adjustColorBrightness(markerColor, -Math.min(100, count * 2));
      const borderStyle = borderBlack ? '2px solid rgba(0, 0, 0, 0.7)' : '';
      const innerSize = Math.floor(size / 1.35);
      
      return L.divIcon({
        html: `
          <div  class = "outer-cluster-circle" style="background-color: ${adjustedColor}47; ${borderStyle}; height: ${size}px; width: ${size}px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
            <div class="inner-cluster-circle" style="background-color: ${adjustedColor}b8; ${borderStyle}; height: ${innerSize}px; width: ${innerSize}px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
              <h6 class="cluster-h6">${count}</h6>
            </div>
          </div>
        `,
        className: 'custom-cluster-icon',
        iconSize: [size, size],
        popupAnchor: [0, -20]
      });
    },
    polygonOptions: {
      fillColor: markerColor,
      color: '#000',
      weight: 2,
      opacity: 0.75,
      fillOpacity: 0.4
    }
  });
}


/**
 * Creates a custom marker icon with a FontAwesome icon.
 * @param {string} iconClass - The FontAwesome icon class (without the 'fa' prefix).
 * @param {string} color - The color of the FontAwesome icon.
 * @param {string} [bgColor='#fff'] - Background color of the marker.
 * @param {string} [borderColor=''] - Border color of the marker. If empty, the border color is the same as the icon color.
 * @returns {L.Icon} - The custom marker icon.
 */
function createCustomIcon(iconClass, color, bgColor='#fff', borderColor='') {
  const options = {
    icon: iconClass,          // The FontAwesome icon class (without the 'fa' prefix)
    iconShape: 'marker',      // The shape of the icon
    borderColor: borderColor !== '' ? borderColor : color, // The border color
    textColor: color,         // The color of the FontAwesome icon
    backgroundColor: bgColor, // Background color of the marker
    iconSize: [24, 24],       // Adjusted icon size (width, height)
    iconAnchor: [12, 24],     // Anchor point of the icon (half of width and full height)
    popupAnchor: [0, -24],    // Position of the popup relative to the icon
    innerIconStyle: 'font-size:0.6rem; margin-top:4px;', // Adjusted font size and margin
  };

  return L.BeautifyIcon.icon(options);
}

/* ------------------------------------------------------------------------------
    MAP INITIALIZATION AND LAYER HANDLING
------------------------------------------------------------------------------ */

// Global map variables
export let map;
export let currentCountry = null;
export let userLat, userLon;
export let userCountryCode;
let controlSection;
let baseMaps;
let baseOverlays;

/**
 * Creates the base map layers (Streets, Satellite, Physical).
 * @returns {Object} An object containing the base map layers.
 */
function createBaseMaps() {
  return {
    "Streets": L.tileLayer.provider('Esri.WorldStreetMap'),
    "Satellite": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri ..."
    }),
    "Physical": L.tileLayer.provider('Esri.WorldPhysical')
  };
}

// Define additional tile layers (Labels)
const additionalLayers = {
  labels: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; CartoDB'
  })
};

/**
 * Creates overlay layers for the map control.
 * @returns {Object} An object containing overlay layers (Labels).
 */
function createBaseOverlays() {
  return {
    'Names': additionalLayers.labels
  };
}

/**
 * Handles the base layer changes to toggle additional layers like labels.
 * @param {L.Map} map - The Leaflet map instance.
 */
function handleBaseLayerChange(map) {
  map.on('baselayerchange', function (event) {
    const selectedBaseLayer = event.name;

    // Remove labels if they're currently added
    map.removeLayer(additionalLayers.labels);

    // If "Satellite" or "Physical" is selected, add the labels overlay
    if (selectedBaseLayer === "Satellite" || selectedBaseLayer === "Physical") {
      map.addLayer(additionalLayers.labels);
    }
  });
}

/**
 * Initializes the map and sets up event listeners.
 */
export function initializeMap() {
  baseMaps = createBaseMaps();
  baseOverlays = createBaseOverlays();

  // Initialize the map centered on the world
  map = L.map('map').fitWorld();

  // Add the default 'Streets' base layer and layer controls
  baseMaps['Streets'].addTo(map);
  controlSection = L.control.layers(baseMaps, baseOverlays).addTo(map);

  // Handle base layer changes to toggle additional layers
  handleBaseLayerChange(map);

  // Start geolocation and set up event listeners for location events
  map.locate({ setView: true, maxZoom: 12 });
  map.on('locationfound', handleLocationFound);
  map.on('locationerror', handleLocationError);
  
}

/**
 * Handles the location found event.
 * @param {L.LocationEvent} e - Event containing location data.
 */
function handleLocationFound(e) {
  const { latlng, accuracy } = e;
  userLat = latlng.lat;
  userLon = latlng.lng; 

  // Reverse geocode the user's location to get the country code
  $.getJSON(`php/reverseGeocode.php?lat=${latlng.lat}&lon=${latlng.lng}`, data => {
    if (data.countryCode) {
      userCountryCode = data.countryCode;
      initializeSelectedCountry(userCountryCode);  // Initialize selected country based on location
      $('#hiddenCountrySelected').val(data.countryCode).trigger('change');  // Trigger country selection
    }
  }).fail((_, status, error) => console.error(`Failed to reverse geocode (${status}): ${error}`));
}

/**
 * Handles location error events (e.g., when location services are unavailable).
 * @param {L.ErrorEvent} e - Event containing error data.
 */
function handleLocationError(e) {
  initializeSelectedCountry('gb');
  $('#hiddenCountrySelected').val('gb').trigger('change');
}

/**
 * Initializes the selected country and loads its data.
 * @param {string} countryCode - ISO country code of the selected country.
 */
function initializeSelectedCountry(countryCode) {
  if (currentCountry) currentCountry.removeLayersFromMap();

  currentCountry = new SelectedCountry(countryCode);
  
  // Load country data
  currentCountry.fetchInfo();
  currentCountry.getCapitalCoordinates()
    .then(() => currentCountry.fetchCountryWeather())
    .then(() => {
      updateWeatherUI(currentCountry.weather); // Update UI with weather data
    })
    .catch(error => console.error('Error during country initialization:', error));
  
  currentCountry.fetchCities();
  currentCountry.fetchAirports();
 
  currentCountry.fetchCountryBorderData()
    .then(() => {
      displayBorderData(currentCountry.borderData);
      $('#pre-load').addClass("fadeOut");
    })
    .catch(error => console.error('Error fetching border data:', error));

  // Load currency information for the country
  loadCurrenciesForCountry(countryCode);

  // Update the control section with the country's layers
  updateControlSectionWithCountryLayers();  

  // Automatically add the Cities layer to the map after control is updated
  map.addLayer(currentCountry.cityLayer);
}

/**
 * Updates the control section to include the selected country's layers.
 */
function updateControlSectionWithCountryLayers() {
  if (controlSection) controlSection.remove(); // Remove old control section

  // Get layers for the selected country and merge them with base overlays
  const countryLayers = currentCountry.getLayers();
  baseOverlays = { ...baseOverlays, ...countryLayers };

  // Recreate the control section with updated layers
  controlSection = L.control.layers(baseMaps, baseOverlays).addTo(map);
}

/* ------------------------------------------------------------------------------
    COUNTRY SELECTION AND UI HANDLING
------------------------------------------------------------------------------ */

/**
 * Populates the country select dropdown with country data.
 */
function loadCountries() {
  $.getJSON('php/getCountries.php')
    .done((data) => {
      const select = $('#countrySelect');
      const sortedCountries = data.sort((a, b) => a.name.localeCompare(b.name));
      sortedCountries.forEach(country => {
        select.append(new Option(country.name, country.code));
      });
    })
    .fail((_, status, error) => console.error(`Failed to fetch countries: ${status}, ${error}`));
}

/**
 * Handles country selection changes.
 */
function handleCountrySelection() {
  $('#countrySelect').on('change', function () {
    const selectedCountryCode = $(this).val();
    hideCustomOverlays();
    initializeSelectedCountry(selectedCountryCode);
  });
}

/**
 * Displays country borders on the map.
 * @param {Object} borderData - GeoJSON data for the country's borders.
 */
const displayBorderData = (borderData) => {
  if (currentCountry.borderLayer) {
    map.removeLayer(currentCountry.borderLayer);
  }

  // Add the new border layer
  currentCountry.borderLayer = L.geoJson(borderData, {
    style: {
      color: "#ff7800",
      weight: 5,
      opacity: 0.65,
      fillOpacity: 0.125
    }
  }).addTo(map);

  map.fitBounds(currentCountry.borderLayer.getBounds());
};

/* ------------------------------------------------------------------------------
    MODAL INITIALIZATION
------------------------------------------------------------------------------ */

/**
 * Hides all custom overlays (e.g., weather, earthquakes, etc.).
 */
export const hideCustomOverlays = () => {
  ['#earthquakeOverlay', '#currencyOverlay', '#weatherOverlay', '#demoContainer', '#infoContainer'].forEach(overlay => {
    $(overlay).css('display', 'none');
  });
};

/**
 * Initializes the EasyButtons for modals on the map.
 */
const modalBtns = [
  L.easyButton('bi-info-circle', () => showGeneralInfoOverlay()),
  L.easyButton("bi-bar-chart", () => showDemographicsOverlay()),
  L.easyButton('bi-cloud-sun', () => showWeatherOverlay()),
  L.easyButton("bi-cash", () => showCurrencyOverlay()),
  L.easyButton("bi-exclamation-diamond", () => showEarthquakesOverlay())
];

/**
 * Adds the modal buttons to the map.
 */
function showModalBtns() {
  modalBtns.forEach(btn => btn.addTo(map));
}

/* ------------------------------------------------------------------------------
    MAP MAIN LOGIC
------------------------------------------------------------------------------ */

/**
 * Initializes the map, loads countries, handles country selection, and adds modal buttons.
 */
$(document).ready(() => {
  $('#pre-load').removeClass("fadeOut");

  initializeMap();
  loadCountries();
  handleCountrySelection();
  showModalBtns();

  
});

/**
 * Adjusts the height of the map container to fit the viewport and recalculates map size.
 */
function adjustMapHeight() {
  const viewportHeight = window.innerHeight;
  document.getElementById('map').style.height = `${viewportHeight}px`;

  // Invalidate the map size to fix rendering issues
  if (map) {
    map.invalidateSize();
  }
}

// Adjust the map height on page load and window resize
window.addEventListener('load', adjustMapHeight);
window.addEventListener('resize', () => { adjustMapHeight(); });