// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

var map;

// tile layers

var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
  }
);

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  }
);

var basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

// buttons

var infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
  $("#exampleModal").modal("show");
});

// ---------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------

// initialise and add controls once DOM is ready

$(document).ready(function () {
  
  // Fetch countries and populate the dropdown
  $.ajax({
    url: 'php/getCountries.php',
    method: 'GET',
    dataType: 'json',
    success: function(data) {
        const select = $('#countrySelect');

        // Sort countries alphabetically by name
        data.sort((a, b) => a.name.localeCompare(b.name));

        data.forEach(country => {
            select.append(new Option(country.name, country.code));
        });
    },
    error: function(xhr, status, error) {
      console.error("Failed to fetch countries:", status, error);
    }
  });

  map = L.map("map", {
    layers: [streets]
  }).setView([54.5, -4], 6);
  
  // setView is not required in your application as you will be
  // deploying map.fitBounds() on the country border polygon

  layerControl = L.control.layers(basemaps).addTo(map);

  infoBtn.addTo(map);

  // Check for geolocation support
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        map.setView([lat, lon], 10);
    }, function(error) {
        console.error('Geolocation request failed');
    });
  }

  // Event handler for country selection
  $('#countrySelect').change(function() {
    let selectedCountry = $(this).val();

    $.ajax({
      url: `php/getCountryBorders.php?code=${selectedCountry}`,
      method: 'GET',
      dataType: 'json',
      success: function(borderData) {
        // Remove existing layers
        map.eachLayer(function(layer) {
          if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
          }
        });

        // Add new border data
        L.geoJson(borderData).addTo(map);

        // Fit map to new borders
        map.fitBounds(L.geoJson(borderData).getBounds());
      },
      error: function(xhr, status, error) {
        console.error("Failed to fetch country borders:", status, error);
      }
    });
  });

});
