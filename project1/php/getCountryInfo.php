<?php

header('Content-Type: application/json');

$apiUrl = 'https://restcountries.com/v3.1/alpha/';

// Get the country code from the query parameter
$countryCode = isset($_GET['code']) ? $_GET['code'] : '';

if (empty($countryCode)) {
    echo json_encode(['error' => 'Country code is required']);
    exit;
}

// Make the API request
$response = file_get_contents($apiUrl . $countryCode);
$data = json_decode($response, true);

if (isset($data[0])) {

    $country = $data[0];
    $result = [
        'name' => $country['name']['common'],
        'official-name' => $country['name']['official'],
        'capital' => $country['capital'][0],
        'continent' => $country['region'],
        'subcontinent' => $country['subregion'],
        'population' => $country['population'],
        'languages' => isset($country['languages']) ? $country['languages'] : null,
        'currencies' => isset($country['currencies']) ? $country['currencies'] : null,
        'flag' => $country['flags']['svg'],
        'alt' => $country['flags']['alt'],
        'borders' => $country['borders'],
        'driveSide' => $country['car']['side'],
        'landlocked' => $country['landlocked'],
        'area' => $country['area'],
        'demonyms' => $country['demonyms'],
        'independent' => $country['independent'],
        'unm49' => $country['unMember'],

    ];
    echo json_encode($result);
} else {
    echo json_encode(['error' => 'Country not found']);
}


?>