<?php

// Check if the country code is provided
if (isset($_GET['code'])) {
    $countryCode = $_GET['code'];
    $file = __DIR__ . '/../data/capitals.json';

    // Check if the capitals file exists
    if (file_exists($file)) {
        $capitals = json_decode(file_get_contents($file), true);

        // Check if the country code is in the capitals data
        if (isset($capitals[$countryCode])) {
            header('Content-Type: application/json');
            echo json_encode($capitals[$countryCode]);
        } else {
            // Country code not found in the capitals data
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Country code not found.']);
        }
    } else {
        // Capitals file not found
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Capitals file not found.']);
    }
} else {
    // Country code not provided
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Missing country code.']);
}

?>
