<?php
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

if (!isset($_POST['id'])) {
    $output['status']['code'] = '400';
    $output['status']['name'] = 'failed';
    $output['status']['description'] = 'ID not provided';
    $output['data'] = [];

    echo json_encode($output);
    exit();
}

$locationID = $_POST['id'];

// SQL query to fetch location data by ID
$preparedQuery = 'SELECT `id`, `name` FROM `location` WHERE `id` = ?';
$query = $conn->prepare($preparedQuery);
$query->bind_param('i', $locationID);
$query->execute();

$result = $query->get_result();

if ($result->num_rows === 0) {
    $output['status']['code'] = '400';
    $output['status']['name'] = 'failed';
    $output['status']['description'] = 'Location not found';
    $output['data'] = [];
} else {
    $output['status']['code'] = 200;
    $output['status']['name'] = 'ok';
    $output['status']['description'] = 'success';
    $output['location'] = $result->fetch_assoc();
}

$query->close();
mysqli_close($conn);

$output['status']['returnedIn'] =
    (microtime(true) - $executionStartTime) / 1000 . ' ms';
echo json_encode($output);

?>
