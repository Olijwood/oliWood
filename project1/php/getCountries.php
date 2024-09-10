<?php 
header('Content-Type: application/json');

$geojsonFile = '../data/countryBorders.geo.json';
$geojsonData = json_decode(file_get_contents($geojsonFile), true);

// Extract country codes and names
$countries = [];
foreach ($geojsonData['features'] as $feature) {
    $code = $feature['properties']['iso_a2'];
    $name = $feature['properties']['name'];
    $countries[] = ['code' => $code, 'name' => $name];
}

echo json_encode($countries);
?>