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

if (isset($_POST['id']) && isset($_POST['table'])) {
    $id = $_POST['id'];
    $table = $_POST['table'];

    // Whitelist the valid table names
    $valid_tables = ['personnel', 'department', 'location'];

    // Check if the table is valid
    if (!in_array($table, $valid_tables)) {
        echo json_encode([
            'status' => [
                'code' => 400,
                'name' => 'failure',
                'description' => 'Invalid table type.',
            ],
        ]);
        exit();
    }

    // Prepare the SQL DELETE query
    $query = $conn->prepare("DELETE FROM $table WHERE id = ?");
    if ($query === false) {
        echo json_encode([
            'status' => [
                'code' => 500,
                'name' => 'failure',
                'description' => 'Database error.',
            ],
        ]);
        exit();
    }

    $query->bind_param('i', $id);

    // Execute the statement
    if ($query->execute()) {
        echo json_encode([
            'status' => [
                'code' => 200,
                'name' => 'ok',
                'description' => 'Record deleted successfully.',
            ],
        ]);
    } else {
        echo json_encode([
            'status' => [
                'code' => 500,
                'name' => 'failure',
                'description' => 'Database error.',
            ],
        ]);
    }

    $query->close();
} else {
    echo json_encode([
        'status' => [
            'code' => 400,
            'name' => 'failure',
            'description' => 'Missing required parameters.',
        ],
    ]);
}

$conn->close();
?>
