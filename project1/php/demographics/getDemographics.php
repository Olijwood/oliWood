<?php

if (isset($_GET['country'])) {
    $countryCode = $_GET['country'];
    
    // World Bank API endpoint with required indicators and format
    $indicators = "SP.POP.TOTL;SP.POP.GROW;SP.POP.0014.TO.ZS;SP.POP.65UP.TO.ZS;SP.POP.TOTL.FE.ZS;SP.URB.TOTL.IN.ZS;SP.RUR.TOTL.ZS;SE.ADT.LITR.ZS;SL.EMP.TOTL.SP.ZS";
    $apiUrl = "https://api.worldbank.org/v2/country/$countryCode/indicator/$indicators?format=json&source=2&mrv=1";

    // Initialize cURL session
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $apiUrl);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    
    // Execute the API call and store the response
    $response = curl_exec($curl);
    
    // Close cURL session
    curl_close($curl);

    // Set header for JSON output
    header('Content-Type: application/json');
    
    // Output the response from the World Bank API
    echo $response;
    
} else {
    echo json_encode(['error' => 'Missing country parameter']);
}

?>
