<?php
if (isset($_GET['country'])) {
    $countryCode = $_GET['country'];
    
    // World Bank API endpoint with required indicators and format
    $indicators = "SP.POP.TOTL;SP.POP.GROW;SP.POP.0014.TO.ZS;SP.POP.1564.TO.ZS;SP.POP.65UP.TO.ZS;SP.POP.TOTL.FE.ZS;SP.URB.TOTL.IN.ZS;SP.RUR.TOTL.ZS;SE.ADT.LITR.ZS;SL.EMP.TOTL.SP.ZS;NY.GDP.MKTP.CD;NY.GDP.PCAP.CD;FP.CPI.TOTL.ZG;SP.DYN.LE00.IN;SP.DYN.TFRT.IN;SH.XPD.CHEX.PC.CD;EN.ATM.CO2E.PC";
    $apiUrl = "https://api.worldbank.org/v2/country/$countryCode/indicator/$indicators?format=json&source=2&mrv=5";

    // Initialize cURL session
    $allData = [];
    $page = 1;
    $totalPages = 1; // Initialize with 1 page to start the loop
    
    do {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $apiUrl . "&page=" . $page);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        
        // Execute the API call and store the response
        $response = curl_exec($curl);
        curl_close($curl);
        
        // Decode the JSON response
        $data = json_decode($response, true);
        
        // Check for errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(['error' => 'Error decoding the World Bank API response']);
            exit;
        }
        
        // Add the data to the $allData array
        if (isset($data[1])) {
            $allData = array_merge($allData, $data[1]);
        }
        
        // Get total pages from the first API call
        if (isset($data[0]['pages'])) {
            $totalPages = $data[0]['pages'];
        }

        $page++; // Increment the page number
    } while ($page <= $totalPages);

    // Set header for JSON output
    header('Content-Type: application/json');
    
    // Return the combined data
    echo json_encode([['pages' => $totalPages], $allData]);
    
} else {
    echo json_encode(['error' => 'Missing country parameter']);
}
?>