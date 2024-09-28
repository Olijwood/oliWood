<?php

$cacheTime = 86400; // 1 day in seconds
$minMag = $_GET['mag'] ?? '1.0';
$period = $_GET['period'] ?? 'day';
$cacheFile = "../data/earthquakes_$period.json";
$magPlusPeriod = $minMag . "_" . $period;
$apiUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/$magPlusPeriod.geojson";

// Check if the cache file exists and if it is still valid
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    // Return cached data
    header('Content-Type: application/json');
    echo file_get_contents($cacheFile);
} else {
    // Fetch new data from the API
    $response = file_get_contents($apiUrl);
    $data = json_decode($response, true);

    if ($data && isset($data['features'])) {
        // Save the new data to the cache file
        $earthquakes = $data;
        file_put_contents($cacheFile, json_encode($earthquakes));
        header('Content-Type: application/json');
        echo json_encode($earthquakes);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch data']);
    }
}
?>
