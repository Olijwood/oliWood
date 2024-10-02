import { adjustColorBrightness, toTitleCase } from "./utils";
import { fetchEarthquakes, calcEarthquakesInCountry, earthquakesGeoJSON} from "./earthquakes.js";
import { populateCurrencyDropdowns, updateConversion, loadCurrenciesForCountry } from "./currency-modal.js";

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
    this.railwayStations = [];
    this.borderData = {};
    this.nEarthquakesDay = 0;
    // Create a map object

    // Flags to track if data has been fetched
    this.hasFetchedHotels = false;
    this.hasFetchedMuseums = false;
    this.hasFetchedRailwayStations = false;

    // Create marker cluster groups
    this.borderLayer = null
    this.cityLayer = createClusterGroup();
    this.airportLayer = createClusterGroup();
    this.railwayStationLayer = createCustomClusterGroup('#ff3131', 50, 16, 24, false);
    this.hotelLayer = createCustomClusterGroup('#f08080', 40, 15); 
    this.museumLayer = createCustomClusterGroup('#dccd8b', 20, 14); 
    
  }

  setCountryDetails(name, lat, lon, flag, alt) {
    this.name = name;
    this.lat = lat;
    this.lon = lon;
    this.flag.src = flag;
    this.flag.alt = alt || `${name}: Flag`;
  }

  fetchCountryBorderData() {
    return $.getJSON(`php/getCountryBorders.php?code=${this.countryCode}`)
      .done(data => {
        // Save the entire GeoJSON data into borderData
        this.borderData = data;
      })
      .fail((_, status, error) => console.error('Error fetching country border data:', error));
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
 // Clear the layer before adding new markers
 layer.clearLayers();

 // Add markers in small batches
 let batchSize = 50; // Adjust batch size as needed
 for (let i = 0; i < pois.results.length; i += batchSize) {
     const batch = pois.results.slice(i, i + batchSize);

     // Populate the layer without clearing it
     batch.forEach(item => {
         const icon = createCustomIcon(iconClass, markerColor, `marker-${featureCode.toLowerCase()}`);
         const marker = L.marker([item.lat, item.lon], { icon })
             .bindPopup(`<strong>${toTitleCase(item.name)}</strong>`);
         layer.addLayer(marker);
        });
      }
    });
  }

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
  

  // Fetch POIs only if they haven't been fetched yet
  fetchHotels() {
    if (!this.hasFetchedHotels) {
      this.fetchPOIs('HTL', this.hotelLayer, 'fa-bell-concierge', '#dc4d8d').then(() => {
        this.hasFetchedHotels = true;
      });
    }
  }

  fetchMuseums() {
    if (!this.hasFetchedMuseums) {
      this.fetchPOIs('MUS', this.museumLayer, 'fa-landmark', '#dccd8b').then(() => {
        this.hasFetchedMuseums = true;
      });
    }
  }

  fetchRailwayStations() {
    if (!this.hasFetchedRailwayStations) {
      this.fetchPOIs('RSTN', this.railwayStationLayer, 'fa-train', '#ff0000').then(() => {
        this.hasFetchedRailwayStations = true;
      });
    }
  }

  // Modified getLayers to set up event listeners for first-time fetches
  getLayers() {
    const layers = {
      'Cities': this.cityLayer,
      'Airports': this.airportLayer,
      'Train Stations': this.railwayStationLayer,
      'Hotels': this.hotelLayer,
      'Museums': this.museumLayer,
    };

    // Attach layeradd event listeners for first-time fetching of POIs
    this.hotelLayer.on('add', () => {
      this.fetchHotels();
      this.hotelLayer.off('add'); // Remove listener after first call
    }, { passive: true });

    this.museumLayer.on('add', () => {
      this.fetchMuseums();
      this.museumLayer.off('add'); // Remove listener after first call
    }, { passive: true });

    this.railwayStationLayer.on('add', () => {
      this.fetchRailwayStations();
      this.railwayStationLayer.off('add'); // Remove listener after first call
    }, { passive: true });


    return layers;
  }

  removeLayersFromMap() {
    [this.borderLayer,this.cityLayer, this.airportLayer, this.hotelLayer, this.museumLayer, this.railwayStationLayer].forEach(layer => {
      map.removeLayer(layer);
    });
  }

  setNEarthQuakesDay(nEarthquakesDay) {
    this.nEarthquakesDay = nEarthquakesDay;
  }
}

function createClusterGroup(maxRadius = 22, disZoomAt = 8) {
  return L.markerClusterGroup({
    maxClusterRadius: 22,
    disableClusteringAtZoom: 8,
    chunkedLoading: true,  // Enable chunked loading
    iconCreateFunction: cluster => {
      return L.divIcon({
        html: '',
        className: 'c-cluster-icon',
        iconSize: [28, 28]
      });
    }
  });
}

function createCustomClusterGroup(markerColor, maxRadius = 30, disZoomAt = 16, size = 30, borderBlack = true) {
  return L.markerClusterGroup({
    maxClusterRadius: maxRadius,
    disableClusteringAtZoom: disZoomAt,
    chunkedLoading: true,  
    chunkDelay: 50, 
    chunkInterval: 200, 
    iconCreateFunction: cluster => {
      const count = cluster.getChildCount();
      const adjustedColor = adjustColorBrightness(markerColor, -Math.min(100, count * 2));
      const borderStyle = borderBlack ? '2px solid rgb(0, 0, 0, 0.7);' : '';
      return L.divIcon({
        html: `<div style="background-color: ${adjustedColor}; ${borderStyle}; height: ${size}px; width: ${size}px; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center;">${count}</div>`,
        className: 'custom-cluster-icon',
        iconSize: [size, size],
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
export let map;
export let currentCountry = null;
export let userlat;
export let userlon;

const labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  attribution: '&copy; CartoDB'
});
const terrainLines = L.tileLayer('/project1/php/terrainProxy.php?z={z}&x={x}&y={y}', {
  maxZoom: 20,
  attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
});


// Initialize the map and base layers
function initializeMap() {
  const basemaps = createBaseMaps();
  
  map = L.map('map').fitWorld();
  basemaps['Streets'].addTo(map);
  
  controlSection.addTo(map);
 
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

let baseOverlays = {
  'Names': labels,
  'Borders': terrainLines
};
let controlSection = L.control.layers(createBaseMaps(), baseOverlays);

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
  currentCountry.fetchInfo();
  currentCountry.fetchWeather();
  currentCountry.fetchCities();
  currentCountry.fetchAirports();
  currentCountry.fetchCountryBorderData().then(() => {
    displayBorderData(currentCountry.borderData);
  });
  loadCurrenciesForCountry(countryCode);

  // Update the control section
  if (controlSection) controlSection.remove();
   const countryLayers = currentCountry.getLayers();
   baseOverlays = { ...baseOverlays, ...countryLayers }
   controlSection = L.control.layers(createBaseMaps(), baseOverlays);
   controlSection.addTo(map);
}

// Load countries into dropdown
function loadCountries() {
  $.getJSON('php/getCountries.php', data => {
    const select = $('#countrySelect');
    select.append(data.sort((a, b) => a.name.localeCompare(b.name)).map(country => new Option(country.name, country.code)));
  }).fail((_, status, error) => console.error("Failed to fetch countries:", error));
}

const displayBorderData = (borderData) => {
  if (currentCountry.borderLayer) {
    map.removeLayer(currentCountry.borderLayer);
  }

  // Add the new border layer
  currentCountry.borderLayer = L.geoJson(borderData, {
    style: { color: "#ff7800", weight: 5, opacity: 0.65, fillOpacity: 0.125 }
  }).addTo(map);

  map.fitBounds(currentCountry.borderLayer.getBounds());
};

// Handle country selection changes
function handleCountrySelection() {
  $('#countrySelect').change(function () {
    const selectedCountryCode = $(this).val();
    hideCustomOverlays();
    initializeSelectedCountry(selectedCountryCode);
  });
}

const hideCustomOverlays = () => {
  $('#earthquakeOverlay').css('display', 'none');
  $('#currencyOverlay').css('display', 'none');
}

// Initialize modals for buttons
const modalBtns = [
  L.easyButton('bi-cloud-sun', (btn, map) => $("#weatherModal").modal("show")),
  L.easyButton('bi-info-circle', (btn, map) => $("#infoModal").modal("show")),
  L.easyButton("bi-bar-chart", (btn, map) => $("#demographicsModal").modal("show")),
  L.easyButton("bi-cash", (btn, map) => {
    $("#earthquakeOverlay").css("display", "none");
    $("#currencyOverlay").css("display", "flex");
    populateCurrencyDropdowns();
    updateConversion();
  }),
  L.easyButton("bi-exclamation-diamond", (btn, map) => {
    $("#currencyOverlay").css("display", "none");
    $("#earthquakeOverlay").css("display", "flex");
    if (!earthquakesGeoJSON) {
      fetchEarthquakes();
    } else {
      earthquakesGeoJSON.addTo(map);
    }
  })
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

function adjustMapHeight() {
  // Get the height of the visible viewport
  const viewportHeight = window.innerHeight;

  // Set the height of the map container to fit the viewport
  document.getElementById('map').style.height = `${viewportHeight}px`;

   // Invalidate the map size to fix rendering issues
   if (map) {
    map.invalidateSize(); // This method recalculates the map's size and updates the display
  }
}

// Adjust the height on page load
window.addEventListener('load', adjustMapHeight);

// Adjust the height on window resize
window.addEventListener('resize', () => {
  adjustMapHeight();
});
