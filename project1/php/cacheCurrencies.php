<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$cacheFile = '../data/currency_data.json';
$cacheTime = 86400; // Cache for 24 hours (in seconds)
echo "Attempting to write to: $cacheFile\n";

if (file_exists($cacheFile)) {
    echo 'File exists';
} else {
    echo 'File does not exist';
}


$apiUrl = 'https://restcountries.com/v3.1/all?fields=cca2,currencies';

// Check if the cache file exists and is still valid
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    echo 'still valid';
    // Return the cached currency data
    $cachedData = file_get_contents($cacheFile);
    echo $cachedData;

} else {

    // Fetch all countries data from the API
    $response = file_get_contents($apiUrl);
    $countries = json_decode($response, true);

    // Initialize arrays to store country-to-currency mappings and a list of currencies
    $countryToCurrency = [];
    $currenciesList = [];

    // Process each country to extract the relevant currency information
    foreach ($countries as $country) {
        if (isset($country['currencies'])) {
            $currencies = $country['currencies'];
            $countryCode = isset($country['cca2']) ? $country['cca2'] : '';
            
            if (!empty($countryCode)) {
                // Extract all currency codes and symbols
                $currencyCodes = array_keys($currencies);
                $countryToCurrency[$countryCode] = $currencyCodes;

                // Add currencies to the list (avoiding duplicates)
                foreach ($currencyCodes as $currencyCode) {
                    if (!isset($currenciesList[$currencyCode])) {
                        $currenciesList[$currencyCode] = [
                            'name' => $currencies[$currencyCode]['name'],
                            'symbol' => $currencies[$currencyCode]['symbol']
                        ];                    }
                }
            }
        }
    }

    // Combine both mappings into one array to cache
    $result = [
        'countryToCurrency' => $countryToCurrency,
        'currenciesList' => $currenciesList,
    ];
    
    if (file_put_contents($cacheFile, json_encode($result))) {
        echo 'File has been written successfully';
    } else {
        echo 'Failed to write to the file';
    }
    // Return the result
    echo json_encode($result);
}

?>
