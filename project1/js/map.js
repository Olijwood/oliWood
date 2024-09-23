import SelectedCountry from "./userCountry";

var map;
let currentCountry = null;  // Instance of the SelectedCountry class

const streets = L.tileLayer.provider('Esri.WorldStreetMap');
const physical =  L.tileLayer.provider('Esri.WorldPhysical');
const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri ..."
});
const terrainLines = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_lines/{z}/{x}/{y}{r}.png', {
  maxZoom: 20,
  attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>', 
});
const labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a>'
});
const basemaps = { "Streets": streets, 'Satellite': satellite, "Physical": physical};
const overlays = {'Names': labels, 'Borders': terrainLines};

export let userlat = 54.5;
export let userlon = -4;


const initializeMap = () => {
  map = L.map('map').fitWorld();
  streets.addTo(map);
  L.control.layers(basemaps, overlays).addTo(map);
  map.on('baselayerchange', ({name}) => {
    const isSatelliteOrPhysical = name === "Satellite" || name === "Physical";
    const overlaysToToggle = [labels, terrainLines];
    if (isSatelliteOrPhysical) {
      overlaysToToggle.forEach(layer => map.addLayer(layer));
    } else {
      overlaysToToggle.forEach(layer => map.removeLayer(layer));
    }
  });

  map.locate({setView: true, maxZoom: 16});
  function onLocationFound(e) {
    var radius = e.accuracy;
    var latlng = e.latlng;
    userlat = latlng.lat;
    userlon = latlng.lng;
    L.marker(latlng).addTo(map)
        .bindPopup("You are here").openPopup();

    L.circle(latlng, radius).addTo(map);
    $.getJSON(`php/reverseGeocode.php?lat=${userlat}&lon=${userlon}`, (data) => {
      const countryCode = data.countryCode;
      if (countryCode) {
        // Automatically select the country based on the code
        initializeSelectedCountry(countryCode);
        $('#hiddenCountrySelected').val(countryCode).trigger('change');
      } else {
        console.error('Error fetching country code:', data.error);
      }
    }).fail((xhr, status, error) => {
      console.error("Failed to reverse geocode:", status, error);
    });
  }


  function onLocationError(e) {
    alert(e.message);
  }

  map.on('locationfound', onLocationFound);
  map.on('locationerror', onLocationError)
};


const weatherBtn = L.easyButton("bi-cloud-sun", (btn, map) => {
  $("#weatherModal").modal("show");
});
const countryInfoBtn = L.easyButton("bi-info-circle", (btn, map) => {
  $("#infoModal").modal("show");
});
const demographicsBtn = L.easyButton("bi-bar-chart", (btn, map) => {
  $("#demographicsModal").modal("show");
})
const currencyBtn = L.easyButton("bi-cash", (btn, map) => {
  $("#currencyModal").modal("show");
})

const modalBtns = [demographicsBtn, currencyBtn, weatherBtn, countryInfoBtn];
const showModalBtns = (map) => {
  modalBtns.forEach((btn) => {
    btn.addTo(map);
  });
};

$(document).ready(function() {
  initializeMap();
  loadCountries();
  handleCountrySelection();
  showModalBtns(map);
  
})


function loadCountries() {
  $.getJSON('php/getCountries.php', (data) => {
    const select = $('#countrySelect');
    const options = data
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(country => new Option(country.name, country.code));
    select.append(options);
  }).fail((xhr, status, error) => {
    console.error("Failed to fetch countries:", status, error);
  });
}

function initializeSelectedCountry(countryCode) {
  currentCountry = new SelectedCountry(countryCode);
  
  // Fetch and display the cities for the selected country
  currentCountry.fetchCities().then(() => {
    // Add cities layer as an overlay (but don't add it to the map yet)
    L.control.layers(null, { "Cities": currentCountry.getCityLayer() }).addTo(map);
  });
}


function handleCountrySelection() {
  $('#countrySelect').change(function () {
    const selectedCountryCode = $(this).val();

    initializeSelectedCountry(selectedCountryCode);

     // Fetch capital and borders as before
     $.getJSON(`php/getCapitalCoordinates.php?code=${selectedCountryCode}`, (capitalData) => {
      if (!capitalData.error) {
        map.setView([capitalData.lat, capitalData.lon], 10);
      }
    });

    $.getJSON(`php/getCountryBorders.php?code=${selectedCountryCode}`, (borderData) => {
      const geoJsonLayer = L.geoJson(borderData, {
        style: {
          "color": "#ff7800",
          "weight": 5,
          "opacity": 0.65,
          "fillOpacity": 0.125
        }
      }).addTo(map);
      map.fitBounds(geoJsonLayer.getBounds());
    });
  });
}

export let userCountryCodeInput = $('#hiddenCountrySelected');
