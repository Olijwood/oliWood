// Map initialization and interactions
let map;
const streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri ..."
});
const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri ..."
});
const basemaps = { "Streets": streets, "Satellite": satellite };

const weatherBtn = L.easyButton("fas fa-cloud-sun fa-lg", (btn, map) => {
  $("#weatherModal").modal("show");
});

const countryInfoBtn = L.easyButton("fas fa-info-circle fa-lg", (btn, map) => {
  $("#infoModal").modal("show");
});

let userCountryCodeInput = $('#hiddenCountrySelected');

$(document).ready(() => {
  loadCountries();
  initializeMap();
  handleSidebarCollapse();
  checkGeolocation();
  handleCountrySelection();
});

function loadCountries() {
  $.ajax({
    url: 'php/getCountries.php',
    method: 'GET',
    dataType: 'json',
    success: (data) => {
      const select = $('#countrySelect');
      data.sort((a, b) => a.name.localeCompare(b.name));
      data.forEach(country => {
        select.append(new Option(country.name, country.code));
      });
    },
    error: (xhr, status, error) => {
      console.error("Failed to fetch countries:", status, error);
    }
  });
}

function initializeMap() {
  map = L.map("map", { layers: [streets] }).setView([54.5, -4], 6);
  L.control.layers(basemaps).addTo(map);
  weatherBtn.addTo(map);
  countryInfoBtn.addTo(map);
}

function handleSidebarCollapse() {
  const expandedPosition = '95px';
  const collapsedPosition = '50px';

  const updateMapPosition = (position) => {
    $('#map').stop().animate({ top: position }, 10);
  };

  $('#sidebar').on('shown.bs.collapse', () => {
    updateMapPosition(expandedPosition);
  });

  $('#sidebar').on('hidden.bs.collapse', () => {
    updateMapPosition(collapsedPosition);
  });

  const initialPosition = $('#sidebar').hasClass('show') ? expandedPosition : collapsedPosition;
  $('#map').css('top', initialPosition);
}

function checkGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;
      map.setView([lat, lon], 10);
      fetchWeather(lat, lon);
    }, (error) => {
      console.error('Geolocation request failed');
    });
  } else {
    console.warn('Geolocation is not supported by this browser.');
  }
}

function handleCountrySelection() {
  $('#countrySelect').change(function () {
    const selectedCountryCode = $(this).val();

    $.ajax({
      url: `php/getCapitalCoordinates.php?code=${selectedCountryCode}`,
      method: 'GET',
      dataType: 'json',
      success: (capitalData) => {
        if (capitalData.error) {
          console.error('Error fetching capital data:', capitalData.error);
        } else {
          const { lat, lon } = capitalData;
          map.setView([lat, lon], 10);
          fetchWeather(lat, lon);
        }
      },
      error: (xhr, status, error) => {
        console.error('Failed to fetch capital coordinates:', status, error);
      }
    });

    $.ajax({
      url: `php/getCountryBorders.php?code=${selectedCountryCode}`,
      method: 'GET',
      dataType: 'json',
      success: (borderData) => {
        map.eachLayer((layer) => {
          if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
          }
        });

        const geoJsonLayer = L.geoJson(borderData).addTo(map);
        map.fitBounds(geoJsonLayer.getBounds());
      },
      error: (xhr, status, error) => {
        console.error("Failed to fetch country borders:", status, error);
      }
    });
  });
}
