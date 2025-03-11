<?php
if (isset($_GET['lat']) && isset($_GET['lon'])) {
    $lat = $_GET['lat'];
    $lon = $_GET['lon'];
    $apiUrl = "https://nominatim.openstreetmap.org/reverse?lat=$lat&lon=$lon&format=json";
    
    // cURL setup with custom User-Agent
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $apiUrl);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

    // Set a custom User-Agent to avoid being blocked
    curl_setopt($curl, CURLOPT_USERAGENT, 'globalCountryProfiler/1.0 (olijwood@gmail.com)');

    // Execute request
    $response = curl_exec($curl);
    
    // Check for errors
    if ($response === false) {
        echo json_encode(['error' => 'Unable to connect to geocoding service: ' . curl_error($curl)]);
    } else {
        $data = json_decode($response, true);
        if (isset($data['address']['country_code'])) {
            $countryCode = strtoupper($data['address']['country_code']);
            echo json_encode(['countryCode' => $countryCode]);
        } else {
            echo json_encode(['error' => 'Country code not found']);
        }
    }
    
    // Close cURL
    curl_close($curl);
} else {
    echo json_encode(['error' => 'Missing parameters.']);
}

?>
