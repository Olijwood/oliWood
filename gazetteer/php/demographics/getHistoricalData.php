<?php
if (isset($_GET['country']) && isset($_GET['indicators'])) {
    $countryCode = $_GET['country'];
    $indicators = $_GET['indicators']; // This will be passed dynamically from the frontend

    // URL-encode the indicators to ensure the semicolon is properly handled
    $encodedIndicators = urlencode($indicators);

    // World Bank API endpoint
    $apiUrl = "https://api.worldbank.org/v2/country/$countryCode/indicator/$encodedIndicators?format=json&source=2";

    // Initialize cURL session
    $allData = [];
    $page = 1;
    $totalPages = 1; // Initialize with 1 page to start the loop

    // Set up multi-curl
    do {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $apiUrl . "&page=" . $page);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        // Execute the cURL request
        $response = curl_exec($curl);
        curl_close($curl);

        // Decode the JSON response
        $data = json_decode($response, true);

        // Check if the response is valid and contains the expected data
        if (isset($data[0]['pages'])) {
            $totalPages = $data[0]['pages']; // Update the total number of pages
        } else {
            // If there is an error or invalid response
            echo json_encode(['error' => 'Error fetching data from the World Bank API']);
            exit;
        }

        // Only include relevant fields (indicator, date, value)
        if (isset($data[1])) {
            foreach ($data[1] as $entry) {
                // Round the value to 2 decimal places if it's not null
                // Otherwise, set it to null
                
                $roundedValue = isset($entry['value']) ? round($entry['value'], 2) : null;
                $filteredEntry = [
                    'indicator' => $entry['indicator']['id'],
                    'date' => $entry['date'],
                    'value' => $roundedValue
                ];

                $allData[] = $filteredEntry;
            }
        }

        $page++; // Increment the page number for the next loop iteration
    } while ($page <= $totalPages);

    // Set header for JSON output
    header('Content-Type: application/json');

    // Return the combined data
    echo json_encode($allData);

} else {
    echo json_encode(['error' => 'Missing parameters']);
}
?>
