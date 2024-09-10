<?php
if (isset($_GET['country']) && isset($_GET['indicators'])) {
    $countryCode = $_GET['country'];
    $indicators = $_GET['indicators']; // This will be passed dynamically from the frontend

    // World Bank API endpoint
    $apiUrl = "https://api.worldbank.org/v2/country/$countryCode/indicator/$indicators?format=json&source=2";

    // Initialize cURL session
    $allData = [];
    $page = 1;
    $totalPages = 1; // Initialize with 1 page to start the loop
    
    // Set up multi-curl
    $mh = curl_multi_init();
    $handles = [];
    
    // Add API calls to multi-curl session
    do {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $apiUrl . "&page=" . $page);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_multi_add_handle($mh, $curl);
        $handles[] = $curl;
        
        $page++; // Increment the page number
    } while ($page <= $totalPages);
    
    // Execute all API calls at once
    $running = null;
    do {
        curl_multi_exec($mh, $running);
    } while ($running > 0);
    
    // Get the results of all API calls
    foreach ($handles as $curl) {
        $response = curl_multi_getcontent($curl);
        curl_multi_remove_handle($mh, $curl);
        curl_close($curl);
        
        // Decode the JSON response
        $data = json_decode($response, true);
        
        // Check for errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(['error' => 'Error decoding the World Bank API response']);
            exit;
        }
        
        // Only include relevant fields (indicator, date, value)
        if (isset($data[1])) {
            foreach ($data[1] as $entry) {
                $filteredEntry = [
                    'indicator' => $entry['indicator']['id'],
                    'date' => $entry['date'],
                    'value' => $entry['value']
                ];

                $allData[] = $filteredEntry;
            }
        }
    }
    
    // Close multi-curl session
    curl_multi_close($mh);
    
    // Set header for JSON output
    header('Content-Type: application/json');
    
    // Return the combined data
    echo json_encode([['pages' => $totalPages], $allData]);
    
} else {
    echo json_encode(['error' => 'Missing parameters']);
}
?>

