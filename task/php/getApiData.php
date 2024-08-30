<?php

// Initialize execution time for performance measurement
$executionStartTime = microtime(true);

// Check for 'neighbours' API request
if ($_POST['api'] == 'neighbours') {
    // Get the country code from POST data
    $country = isset($_POST['country']) ? $_POST['country'] : '';

    // Set the API URL for fetching neighbouring countries
    $url = 'http://api.geonames.org/neighboursJSON?&country=' . $country . '&username=olijwood';

    // Initialize cURL session
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Ignore SSL certificate verification
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return the response as a string
    curl_setopt($ch, CURLOPT_URL, $url); // Set the URL

    // Execute the cURL session
    $result = curl_exec($ch);

    // Check for cURL errors
    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
        curl_close($ch);
        exit;
    }

    // Close cURL session
    curl_close($ch);

    // Decode JSON response
    $decode = json_decode($result, true);

    // Prepare output
    $output = [];
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $decode['geonames'];

    // Set content type to JSON
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
}

// Check for 'nearbyPop' API request
if ($_POST['api'] == 'nearbyPop') {
    // Get latitude and longitude from POST data
    $lat = isset($_POST['lat']) ? $_POST['lat'] : '';
    $lng = isset($_POST['lng']) ? $_POST['lng'] : '';

    // Set the API URL for fetching nearby populated places
    $url = 'http://api.geonames.org/findNearbyPlaceNameJSON?formatted=true&lang=en&lat=' . $lat . '&lng=' . $lng . '&username=olijwood&style=medium';

    // Initialize cURL session
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Ignore SSL certificate verification
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return the response as a string
    curl_setopt($ch, CURLOPT_URL, $url); // Set the URL

    // Execute the cURL session
    $result = curl_exec($ch);

    // Check for cURL errors
    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
        curl_close($ch);
        exit;
    }

    // Close cURL session
    curl_close($ch);

    // Decode JSON response
    $decode = json_decode($result, true);

    // Prepare output
    $output = [];
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $decode['geonames'];

    // Set content type to JSON
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
}

// Check for 'nearbyWeather' API request
if ($_POST['api'] == 'nearbyWeather') {
    // Get latitude and longitude from POST data
    $lat = isset($_POST['lat']) ? $_POST['lat'] : '';
    $lng = isset($_POST['lng']) ? $_POST['lng'] : '';

    // Set the API URL for fetching nearby weather observation
    $url = 'http://api.geonames.org/findNearByWeatherJSON?lat=' . $lat . '&lng=' . $lng . '&username=olijwood';

    // Initialize cURL session
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Ignore SSL certificate verification
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return the response as a string
    curl_setopt($ch, CURLOPT_URL, $url); // Set the URL

    // Execute the cURL session
    $result = curl_exec($ch);

    // Check for cURL errors
    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
        curl_close($ch);
        exit;
    }

    // Close cURL session
    curl_close($ch);

    // Decode JSON response
    $decode = json_decode($result, true);

    // Prepare output
    $output = [];
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $decode['weatherObservation'];

    // Set content type to JSON
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
}

?>
