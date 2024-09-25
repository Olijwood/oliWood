// Importing libraries
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'jquery';

import 'leaflet';
import 'leaflet-easybutton';
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



// Font Awesome
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faCloud, faStar, faTemperatureHigh, faSun, faCloudSun, faWind, faTint, faCity, faGlobe, faUsers, faHashtag, faInfoCircle, faLanguage, faScroll, faUserTie, faPlaneDeparture, faBellConcierge, faLandmark, faGlobeAmericas } from '@fortawesome/free-solid-svg-icons';
library.add(faCloud, faStar, faTemperatureHigh, faSun, faWind, faCloudSun, faTint, faCity, faGlobe, faUsers, faHashtag, faInfoCircle, faLanguage, faScroll, faUserTie, faPlaneDeparture, faBellConcierge, faLandmark);
dom.watch();

// Import your custom scripts
import './utils.js';
import './map.js';
import './country-info.js';
import './weather.js';
import './currency-modal.js';
import './demographics/demographics.js';
