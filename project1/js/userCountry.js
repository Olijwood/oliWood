class SelectedCountry {
  constructor(countryCode) {
    this.name = "";
    this.countryCode = countryCode.toUpperCase();
    this.lat = 0;
    this.lon = 0;

    this.cities = [];  // Will be populated by the method
    this.cityLayer = L.featureGroup();  // Layer for displaying city markers
  }

  // Method to set the country details
  setCountryDetails(name, lat, lon) {
    this.name = name;
    this.lat = lat;
    this.lon = lon;
  }

  // Method to fetch cities from cities.json based on countryCode
  fetchCities() {
    return new Promise((resolve, reject) => {
      $.getJSON('data/cities.json', (citiesData) => {
        if (citiesData[this.countryCode]) {
          this.cities = citiesData[this.countryCode];
          this.populateCityLayer(); // Populate the city layer with markers
          resolve(this.cities);
        } else {
          reject('No cities found for this country.');
        }
      }).fail((xhr, status, error) => {
        reject(`Failed to fetch cities: ${status}, ${error}`);
      });
    });
  }

  // Method to populate the cityLayer with markers for the cities
  populateCityLayer() {
    this.cityLayer.clearLayers();  // Clear any previous markers

    this.cities.forEach(city => {
      // Use Bootstrap icon as a custom marker
      const cityIcon = L.divIcon({
        html: '<i class="bi bi-building-fill" style="font-size: 24px; color: #007bff;"></i>', // Use Bootstrap icon
        className: 'custom-div-icon',  // You can style this further with CSS
        iconSize: [24, 24],  // Set size of the marker icon
        popupAnchor: [0, -12]  // Adjust popup position relative to the icon
      });

      const marker = L.marker([city.lat, city.lon], { icon: cityIcon })
        .bindPopup(`<strong>${city.name}</strong>`);
      this.cityLayer.addLayer(marker);
    });
  }

  // Method to return the city layer for map overlays
  getCityLayer() {
    return this.cityLayer;
  }
}

export default SelectedCountry;
