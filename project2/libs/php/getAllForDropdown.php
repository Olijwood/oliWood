<?php
$executionStartTime = microtime(true);

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
    $output['status']['code'] = '300';
    $output['status']['name'] = 'failure';
    $output['status']['description'] = 'database unavailable';
    $output['status']['returnedIn'] =
        (microtime(true) - $executionStartTime) / 1000 . ' ms';
    $output['data'] = [];

    mysqli_close($conn);

    echo json_encode($output);

    exit();
}

$table = $_POST['table'];
$allowedTables = ['department', 'location'];

if (!in_array($table, $allowedTables)) {
    $output['status']['code'] = '400';
    $output['status']['name'] = 'invalid request';
    $output['status']['description'] = 'Provided wrong table name';
    $output['data'] = [];

    mysqli_close($conn);

    echo json_encode($output);

    exit();
}

$prepared_query = "SELECT id, name FROM $table ORDER BY name";

$query = $conn->prepare($prepared_query);
$query->execute();
$result = $query->get_result();

if (!$result) {
    $output['status']['code'] = '400';
    $output['status']['name'] = 'executed';
    $output['status']['description'] = 'query failed';
    $output['data'] = [];

    mysqli_close($conn);

    echo json_encode($output);

    exit();
}

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    array_push($data, $row);
}

$output['status']['code'] = 200;
$output['status']['name'] = 'ok';
$output['status']['description'] = 'success';
$output['status']['returnedIn'] =
    (microtime(true) - $executionStartTime) / 1000 . ' ms';
$output['data'] = $data;

mysqli_close($conn);

echo json_encode($output);
?>
