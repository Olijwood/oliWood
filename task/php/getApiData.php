<?php

if ($_POST['api'] == 'neighbours') {
    $country = isset($_POST['country']) ? $_POST['country'] : '';

    $url = 'http://api.geonames.org/neighboursJSON?&country=' . $country . '&username=olijwood';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);

    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
        curl_close($ch);
        exit;
    }

    curl_close($ch);

    $decode = json_decode($result, true);

    $output = [];
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $decode['geonames'];

    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
}


if ($_POST['api'] == 'nearbyPop') {
    $lat = isset($_POST['lat']) ? $_POST['lat'] : '';
    $lng = isset($_POST['lng']) ? $_POST['lng'] : '';

    $url = 'http://api.geonames.org/findNearbyPlaceNameJSON?formatted=true&lang=en&lat=' . $lat . '&lng=' . $lng . '&username=olijwood&style=medium';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);

    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
        curl_close($ch);
        exit;
    }

    curl_close($ch);

    $decode = json_decode($result, true);

    $output = [];
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $decode['geonames'];

    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
}

if ($_POST['api'] == 'nearbyWeather') {
    $lat = isset($_POST['lat']) ? $_POST['lat'] : '';
    $lng = isset($_POST['lng']) ? $_POST['lng'] : '';

    $url = 'http://api.geonames.org/findNearByWeatherJSON?lat=' . $lat . '&lng=' . $lng . '&username=olijwood';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);

    if (curl_errno($ch)) {
        echo 'Curl error: ' . curl_error($ch);
        curl_close($ch);
        exit;
    }

    curl_close($ch);

    $decode = json_decode($result, true);

    $output = [];
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $decode['weatherObservation'];

    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
}

?>
