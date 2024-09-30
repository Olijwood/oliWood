<?php
function loadEnv($filePath) {
    if (!file_exists($filePath)) {
        throw new Exception('.env file not found.');
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Parse the .env file lines
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        // Set environment variables
        if (!getenv($name)) {
            putenv("$name=$value");
        }
    }
}
