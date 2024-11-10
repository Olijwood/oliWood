<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include 'config.php';

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli(
    $cd_host,
    $cd_user,
    $cd_password,
    $cd_dbname,
    $cd_port,
    $cd_socket,
);

if (mysqli_connect_errno()) {
    mysqli_close($conn);

    echo json_encode([
        'status' => [
            'code' => 300,
            'name' => 'failure',
            'description' => 'database unavailable',
            'returnedIn' =>
                (microtime(true) - $executionStartTime) / 1000 . ' ms',
        ],
    ]);

    exit();
}

// Retrieve and validate filter parameters
$departmentID =
    isset($_POST['departmentID']) && $_POST['departmentID'] != 0
        ? $_POST['departmentID']
        : '';
$locationID =
    isset($_POST['locationID']) && $_POST['locationID'] != 0
        ? $_POST['locationID']
        : '';

// Check if only one filter is set (either departmentID or locationID)
$filterColumn = null;
$filterValue = null;
$types = '';

if ($departmentID === '' && $locationID === '') {
    mysqli_close($conn);

    echo json_encode([
        'status' => [
            'code' => 400,
            'name' => 'failure',
            'description' =>
                'Please provide either a departmentID or a locationID',
            'returnedIn' =>
                (microtime(true) - $executionStartTime) / 1000 . ' ms',
        ],
    ]);

    exit();
} elseif ($departmentID !== '') {
    $filterColumn = 'p.departmentID';
    $filterValue = $departmentID;
    $types = 'i';
} elseif ($locationID !== '') {
    $filterColumn = 'd.locationID';
    $filterValue = $locationID;
    $types = 'i';
}

// Base query
$query = "SELECT p.id, p.firstName, p.lastName, p.email, d.name AS departmentName, l.name AS locationName
          FROM personnel p
          LEFT JOIN department d ON p.departmentID = d.id
          LEFT JOIN location l ON d.locationID = l.id
          WHERE $filterColumn = ?
          ORDER BY p.lastName, p.firstName";

$stmt = $conn->prepare($query);

if ($stmt === false) {
    echo json_encode([
        'status' => [
            'code' => 500,
            'name' => 'failure',
            'description' => 'Query preparation failed: ' . $conn->error,
        ],
    ]);
    exit();
}

// Bind parameter only if a filter is set
if ($filterColumn !== null) {
    $stmt->bind_param($types, $filterValue);
}

$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode([
    'status' => [
        'code' => 200,
        'description' => 'success',
        'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . ' ms',
    ],
    'data' => $data,
]);

$stmt->close();
$conn->close();
?>
