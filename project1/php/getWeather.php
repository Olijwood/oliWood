<?php

if (isset($_GET['lat']) && isset($_GET['lon'])) {
    $lat = $_GET['lat'];
    $lon = $_GET['lon'];
    $apiKey = '9787c10bc41ad2317f51d50a436fc09b';
    $apiUrl = "https://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lon&units=metric&appid=$apiKey";

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $apiUrl);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $response = curl_exec($curl);
    curl_close($curl);

    $data = json_decode($response, true);
    if (isset($data['weather'][0]['main'])) {
        $weather = [];
        $weather['wDescription'] = $data['weather'][0]['description'];
        $weather['temperature'] = $data['main']['temp'];
        $weather['feelsLike'] = $data['main']['feels_like'];
        $weather['humidity'] = $data['main']['humidity'];
        $weather['windSpeed'] = $data['wind']['speed'];
        $weather['sunrise'] = $data['sys']['sunrise'];
        $weather['sunset'] = $data['sys']['sunset'];
        $weather['wStationName'] = $data['name'];

        $response = json_encode($weather);
        header('Content-Type: application/json');
        echo $response;
    } else {
        echo json_encode(['error' => 'Failed to fetch weather data.']);
    }
   
} else {
    echo json_encode(['error' => 'Missing parameters.']);
}

?>