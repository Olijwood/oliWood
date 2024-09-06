<?php
  $apiKey = "YOUR_API_KEY";
  $baseUrl = "https://api.exchangerate-api.com/v4/latest/";

  if (isset($_GET['currency'])) {
    $currency = $_GET['currency'];
    $url = $baseUrl . $currency;
    $response = file_get_contents($url);
    
    if ($response) {
      echo $response;
    } else {
      echo json_encode(["error" => "Failed to fetch data"]);
    }
  } else {
    echo json_encode(["error" => "No currency specified"]);
  }
?>
