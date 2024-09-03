<?php
header('Content-Type: application/json');

$geojsonFile = '../data/countryBorders.geo.json';
$data = file_get_contents($geojsonFile);
$geojson = json_decode($data, true);

$code = $_GET['code'];
$borders = null;
 
foreach ($geojson['features'] as $feature) {
    if ($feature['properties']['iso_a2'] === $code) {
        $borders = $feature['geometry'];
        break;
    }
}

echo json_encode($borders);
?>