<?php
header('Content-Type: application/json');

$cacheFile = '../../data/currency_data.json';

if (isset($_GET['countryCode'])) {
    $countryCode = $_GET['countryCode'];

    // Check if the cache file exists
    if (file_exists($cacheFile)) {
        $data = file_get_contents($cacheFile);
        $currencyData = json_decode($data, true);

        // Find the currencies for the selected country
        if (isset($currencyData['countryToCurrency'][$countryCode])) {
            $currencies = $currencyData['countryToCurrency'][$countryCode];
            $currencyList = $currencyData['currenciesList'];

            // Create an array of currency details for the selected country
            $countryCurrencies = [];
            foreach ($currencies as $currencyCode) {
                if (isset($currencyList[$currencyCode])) {
                    $countryCurrencies[] = [
                        'currencyCode' => $currencyCode,
                        'currencyName' => $currencyList[$currencyCode]['name'],
                        'symbol' => $currencyList[$currencyCode]['symbol']
                    ];
                }
            }

            // Return the currencies for the selected country
            echo json_encode(['currencies' => $countryCurrencies]);
        } else {
            // No currencies found for the country
            echo json_encode(['currencies' => []]);
        }
    } else {
        // Cache file doesn't exist
        echo json_encode(['error' => 'Cache file not found']);
    }
} else {
    // No country code provided
    echo json_encode(['error' => 'No country code specified']);
}
?>
