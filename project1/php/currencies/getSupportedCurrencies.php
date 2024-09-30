<?php
require_once '../load_env.php';
loadEnv(__DIR__ . '/../../.env');
$cacheFile = '../../data/supported_currencies.json';
$cacheTime = 604800; // 1 week in seconds
$apiKey = getenv('EXCHANGE_API_KEY');
$apiUrl = 'https://v6.exchangerate-api.com/v6/' . $apiKey . '/codes';

// Check if the cache file exists and if it is still valid
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    // Return cached data
    echo file_get_contents($cacheFile);
} else {
    // Fetch new data from the API
    $response = file_get_contents($apiUrl);
    $data = json_decode($response, true);

    if ($data && isset($data['supported_codes'])) {
        // Save the new data to the cache file
        file_put_contents($cacheFile, json_encode($data['supported_codes']));
        echo json_encode($data['supported_codes']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch data']);
    }
}
?>
