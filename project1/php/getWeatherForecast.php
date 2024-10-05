<?php
require_once './load_env.php';
loadEnv(__DIR__ . '/../.env');
if (isset($_GET['lat']) && isset($_GET['lon'])) {
    $lat = $_GET['lat'];
    $lon = $_GET['lon'];
    $apiKey = getenv('WEATHER_API_KEY');
    $url = "https://api.openweathermap.org/data/2.5/forecast?lat=$lat&lon=$lon&appid=$apiKey&units=metric";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    header('Content-Type: application/json');
    echo $response;
} else {
  header('Content-Type: application/json');
    echo json_encode(['error' => 'Missing latitude or longitude']);
}
// http://localhost/project1/php/getWeatherForecast.php?lat=51.167232&lon=-0.5963776
// http://localhost/project1/php/getWeatherForecast.php?lat=5.4793&lon=53.2060
?>
