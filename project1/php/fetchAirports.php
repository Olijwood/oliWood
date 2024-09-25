<?php
if (isset($_GET['code'])) {
    $countryCode = strtoupper($_GET['code']);  // Ensure country code is uppercase
    $username = 'olijwood';  // Your GeoNames username

    // GeoNames API URL to fetch airports in the specified country
    $apiUrl = "http://api.geonames.org/searchJSON?country=$countryCode&featureCode=AIRP&maxRows=50&username=$username";

    // Initialize cURL to fetch data from the API
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $apiUrl);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $response = curl_exec($curl);
    curl_close($curl);

    // Decode the API response
    $data = json_decode($response, true);

    // Check if the response contains airport data
    if (isset($data['geonames']) && !empty($data['geonames'])) {
        // Filter airports to ensure they belong to the correct country
        $filteredAirports = array_filter($data['geonames'], function ($airport) use ($countryCode) {
            return isset($airport['countryCode']) && $airport['countryCode'] === strtoupper($countryCode);
        });

        // Prepare a clean array of airport data
        $airports = [];

        foreach ($filteredAirports as $airport) {
            $airports[] = [
                'name' => $airport['name'],
                'lat' => $airport['lat'],
                'lon' => $airport['lng'],  // GeoNames uses 'lng' for longitude
            ];
        }

        // Return the filtered airport data as JSON
        header('Content-Type: application/json');
        echo json_encode($airports);
    } else {
        // No airports found for the given country code
        header('Content-Type: application/json');
        echo json_encode(['error' => 'No airports found for this country']);
    }
} else {
    // Missing 'code' parameter in the request
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Missing country code']);
}
?>
