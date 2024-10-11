// --------------------------------------------------
// External Library Imports
// --------------------------------------------------

// Bootstrap and Font Awesome styles
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// jQuery
import 'jquery';

// Leaflet and related plugins
import 'leaflet';
import 'leaflet-easybutton';
import 'leaflet-easybutton/src/easy-button.css';
import 'leaflet-providers';
import 'leaflet/dist/leaflet.css'; 
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import '@turf/turf'; // Turf.js for spatial analysis

// Leaflet icons
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Set default icon options for Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'marker-icon-2x.png',
  iconUrl: 'marker-icon.png',
  shadowUrl: 'marker-shadow.png'
});

// --------------------------------------------------
// Custom Script Imports
// --------------------------------------------------

import './utils.js';
import './map.js';
import './country-info.js';
import './weather.js';
import './currency.js';
import './demographics.js';
import './earthquakes.js';