// Importing libraries
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'jquery';

import 'leaflet';
import 'leaflet-easybutton';
import 'leaflet-easybutton/src/easy-button.css';
import 'leaflet-providers';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'marker-icon-2x.png',
  iconUrl: 'marker-icon.png',
  shadowUrl: 'marker-shadow.png'
});
import 'leaflet/dist/leaflet.css'; 
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import '@turf/turf';



import '@fortawesome/fontawesome-free/css/all.min.css';

// Import your custom scripts
import './utils.js';
import './map.js';
import './country-info.js';
import './weather.js';
import './currency-modal.js';
import './demographics.js';
import './earthquakes.js';

function adjustMapHeight() {
  // Get the height of the visible viewport
  const viewportHeight = window.innerHeight;

  // Set the height of the map container to fit the viewport
  document.getElementById('map').style.height = `${viewportHeight}px`;

}

// Adjust the height on page load
window.addEventListener('load', adjustMapHeight);

