<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include('config.php'); 

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    mysqli_close($conn);

    echo json_encode([
        "status" => [
            "code" => 300,
            "name" => "failure",
            "description" => "database unavailable",
            "returnedIn" => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ]
    ]);

    exit;
}

$departmentIDs = isset($_POST['departmentIDs']) ? $_POST['departmentIDs'] : [];
$locationIDs = isset($_POST['locationIDs']) ? $_POST['locationIDs'] : [];

// Prepare WHERE clause parts based on selected filters
$conditions = [];
$bindParams = [];
$types = '';

// Department filter
if (!empty($departmentIDs)) {
  $conditions[] = "d.id IN (" . implode(',', array_fill(0, count($departmentIDs), '?')) . ")";
  $bindParams = array_merge($bindParams, $departmentIDs);
  $types .= str_repeat('i', count($departmentIDs));
}

// Location filter
if (!empty($locationIDs)) {
  $conditions[] = "l.id IN (" . implode(',', array_fill(0, count($locationIDs), '?')) . ")";
  $bindParams = array_merge($bindParams, $locationIDs);
  $types .= str_repeat('i', count($locationIDs));
}

// Default to all if no filters are applied
$whereClause = count($conditions) ? implode(' AND ', $conditions) : '1=1';

$query = "SELECT p.id, p.firstName, p.lastName, p.jobTitle, p.email, d.name as departmentName, l.name as locationName 
          FROM personnel p
          LEFT JOIN department d ON d.id = p.departmentID
          LEFT JOIN location l ON l.id = d.locationID
          WHERE $whereClause
          ORDER BY p.lastName, p.firstName";

$stmt = $conn->prepare($query);

if (!empty($types)) {
  $stmt->bind_param($types, ...$bindParams);
}

$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    $data[] = $row;
}

echo json_encode([
    "status" => [
        "code" => 200,
        "name" => "ok",
        "description" => "success",
        "returnedIn" => (microtime(true) - $executionStartTime) / 1000 . " ms"
    ],
    "data" => $data
]);

mysqli_close($conn);
?>
