<?php
// Set the cache file location
$cacheFile = __DIR__ . '/../../data/currency_cache.json';
$cacheDuration = 3600; // 1 hour in seconds
$apiKey = 'fca_live_rPWM7TFnHYkyU9Z2EfkH73acvjlY51bPzTFMIuhy'; 

// Get the currency codes from the request
$fromCurrency = $_GET['from'];
$toCurrency = $_GET['to'];
$amount = $_GET['amount'];

// Check if the cache file exists and is still valid
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheDuration) {
    // Use cached data
    $rates = json_decode(file_get_contents($cacheFile), true);
} else {
    // Fetch new data from FreeCurrencyAPI
    $apiUrl = "https://api.freecurrencyapi.com/v1/latest?apikey=$apiKey";
    $response = file_get_contents($apiUrl);
    
    if ($response === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch data from the currency API']);
        exit;
    }
    
    $rates = json_decode($response, true);
    
    // Cache the data
    file_put_contents($cacheFile, json_encode($rates));
}

// Perform the currency conversion
if (isset($rates['data'][$fromCurrency]) && isset($rates['data'][$toCurrency])) {
    $fromRate = $rates['data'][$fromCurrency];
    $toRate = $rates['data'][$toCurrency];
    $conversionRate = $toRate / $fromRate;
    $convertedAmount = $amount * $conversionRate;

    echo json_encode([
        'from' => $fromCurrency,
        'to' => $toCurrency,
        'amount' => $amount,
        'convertedAmount' => $convertedAmount,
        'rate' => $conversionRate
    ]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid currency code']);
}
