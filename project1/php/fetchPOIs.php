<?php
require_once './load_env.php';
loadEnv(__DIR__ . '/../.env');

if (isset($_GET['code']) && isset($_GET['fCode'])) {
    $countryCode = $_GET['code'];
    $featureCode = $_GET['fCode'];
    $username = getenv('GNAMES_USERNAME');

    $apiUrl = "http://api.geonames.org/searchJSON?country=$countryCode&featureCode=$featureCode&maxRows=1000&username=$username";
    
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $apiUrl);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $response = curl_exec($curl);
    curl_close($curl);
    
    // Decode the JSON response
    $decodedResponse = json_decode($response, true);
    
    // Prepare data with count and results
    $data = array();
    $data['count'] = isset($decodedResponse['totalResultsCount']) ? $decodedResponse['totalResultsCount'] : 0;
    if (isset($decodedResponse['geonames']) && !empty($decodedResponse['geonames'])) {
      $rawPOIs = $decodedResponse['geonames'];
      
      $pois = [];

      foreach ($rawPOIs as $poi) {
        $pois[] = [
          'name' => $poi['name'],
          'lat' => $poi['lat'],
          'lon' => $poi['lng'],
        ];
      }
      $data['results'] = $pois;
    }

     
    // Return the final JSON with pretty print
    header('Content-Type: application/json');
    echo json_encode($data, JSON_PRETTY_PRINT);
} else {
    echo json_encode(['error' => 'Missing country code or feature code'], JSON_PRETTY_PRINT);
}
?>
