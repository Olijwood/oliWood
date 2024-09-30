<?php
// Set GeoNames username
require_once './load_env.php';
loadEnv(__DIR__ . '/../.env');
$username = getenv('GNAMES_USERNAME');

// Define paths for capitals.json and cities.json
// Paths to capitals and cities JSON files
$capitalsFile = __DIR__ . '/../data/capitals.json';
$citiesFile = __DIR__ . '/../data/cities.json';

// Load capitals.json
$capitalsJson = file_get_contents($capitalsFile);
$capitals = json_decode($capitalsJson, true);

// Initialize an empty array to hold city data for all countries
$citiesData = [];

// Check if cities.json already exists, if so, load it to avoid duplicate calls
if (file_exists($citiesFile)) {
    $citiesData = json_decode(file_get_contents($citiesFile), true);
} else {
    // If cities.json doesn't exist, initialize an empty array
    $citiesData = [];
}

// Loop through each country in capitals.json
foreach ($capitals as $countryCode => $capitalInfo) {
    // Check if we already have data for this country in cities.json
    if (isset($citiesData[$countryCode])) {
        echo "Cities for country $countryCode already exist. Skipping...\n";
        continue;
    }

    // GeoNames Search API URL to fetch the most populous cities for the country
    $apiUrl = "http://api.geonames.org/searchJSON?country=$countryCode&featureClass=P&orderby=population&maxRows=50&username=$username";

    // Initialize cURL
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $apiUrl);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    // Execute cURL and get the response
    $response = curl_exec($curl);
    curl_close($curl);

    // Check if the response is valid
    if ($response) {
        $data = json_decode($response, true);

        // Check if 'geonames' data is available
        if (isset($data['geonames']) && !empty($data['geonames'])) {
            // Initialize an array to hold cities for this country
            $cities = [];

            // Loop through each city and store relevant data
            foreach ($data['geonames'] as $city) {
                $cities[] = [
                    'name' => $city['name'],
                    'lat' => $city['lat'],
                    'lon' => $city['lng'],
                    'population' => $city['population']
                ];
            }

            // Add the cities data to cities.json for this country
            $citiesData[$countryCode] = $cities;

            // Display progress in the console
            echo "Fetched and saved cities for country $countryCode\n";

            // Save the updated citiesData array to cities.json after each country
            file_put_contents($citiesFile, json_encode($citiesData, JSON_PRETTY_PRINT));
        } else {
            // Handle case where no cities are found for this country
            echo "No cities found for country $countryCode.\n";
        }
    } else {
        // Handle API request failure
        echo "Failed to fetch data for country $countryCode.\n";
    }

    // Reduced sleep time to 1 second (can adjust based on performance)
    sleep(1);
}

echo "City data collection complete.\n";
?>
