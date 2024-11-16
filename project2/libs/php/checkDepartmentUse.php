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

if ($conn->connect_error) {
    $output['status']['code'] = '300';
    $output['status']['name'] = 'failure';
    $output['status']['description'] = 'database unavailable';
    $output['status']['returnedIn'] =
        (microtime(true) - $executionStartTime) / 1000 . ' ms';
    $output['data'] = [];

    echo json_encode($output);
    exit();
}

$query = $conn->prepare(
    "SELECT
      d.name as departmentName,
      COUNT(p.id) as personnelCount
    FROM
      department d LEFT JOIN
      personnel p ON (p.departmentID = d.id)
    WHERE
      d.id = ?",
);

if (!$query) {
    $output['status']['code'] = '400';
    $output['status']['name'] = 'failure';
    $output['status']['description'] = 'query preparation failed';
    $output['data'] = [];

    echo json_encode($output);
    mysqli_close($conn);
    exit();
}

$query->bind_param('i', $_POST['id']);
$query->execute();

$result = $query->get_result();
if (!$result) {
    $output['status']['code'] = '400';
    $output['status']['name'] = 'failure';
    $output['status']['description'] = 'query execution failed';
    $output['data'] = [];

    echo json_encode($output);
    mysqli_close($conn);
    exit();
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

$output['status']['code'] = 200;
$output['status']['name'] = 'ok';
$output['status']['description'] = 'success';
$output['status']['returnedIn'] =
    (microtime(true) - $executionStartTime) / 1000 . ' ms';
$output['data'] = $data;

echo json_encode($output);

mysqli_close($conn);
?>
