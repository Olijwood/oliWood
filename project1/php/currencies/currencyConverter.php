<?php
// Set the cache file location
$cacheFile = '../../data/currency_cache.json';
$cacheDuration = 86400; // 1 day in seconds change in production
$apiKey = '5a77a192ac53ba466daee24d';

// Get the currency codes from the request
$fromCurrency = $_GET['from'];
$toCurrency = $_GET['to'];
$amount = $_GET['amount'];

// Check if the cache file exists and is still valid
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheDuration) {
    // Use cached data
    $rates = json_decode(file_get_contents($cacheFile), true);
} else {
    // Fetch new data from ExchangeRate-API
    $apiUrl = "https://v6.exchangerate-api.com/v6/$apiKey/latest/USD";
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
if (isset($rates['conversion_rates'][$fromCurrency]) && isset($rates['conversion_rates'][$toCurrency])) {
    $fromRate = $rates['conversion_rates'][$fromCurrency];
    $toRate = $rates['conversion_rates'][$toCurrency];
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
?>
