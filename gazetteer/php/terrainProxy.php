<?php
require_once './load_env.php';
loadEnv(__DIR__ . '/../.env');
// Get the requested URL parameters from the client-side request
$z = $_GET['z'] ?? null;
$x = $_GET['x'] ?? null;
$y = $_GET['y'] ?? null;

// Make sure all parameters are provided
if ($z === null || $x === null || $y === null) {
    http_response_code(400);
    echo "Invalid tile request.";
    exit;
}

// Your Stadia Maps API key (stored on the server-side)
$apiKey = getenv('TERRAIN_MAP_API_KEY');

// Construct the API URL using the API key
$apiUrl = "https://tiles.stadiamaps.com/tiles/stamen_terrain/{$z}/{$x}/{$y}.png?api_key={$apiKey}";

// Initialize a cURL session to fetch the tile
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);

// Get the tile image
$tileData = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// If the request was successful, output the image
if ($httpCode === 200) {
    header('Content-Type: image/png');
    echo $tileData;
} else {
    http_response_code($httpCode);
    echo "Error fetching tile.";
}
?>
