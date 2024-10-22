<?php 

  ini_set('display_errors', 'On');
  error_reporting(E_ALL);

  $executionStartTime = microtime(true);

  include("config.php");

  header('Content-Type: application/json; charset=UTF-8');

  $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

  if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    echo json_encode($output);
    exit;
  }

  $table = $_POST['table'];
  $stmt = null;

  if ($table == "personnel") {
    $stmt = $conn->prepare('INSERT INTO personnel (firstName, lastName, email, departmentID) VALUES (?, ?, ?, ?)');
    $stmt->bind_param("sssi", $_POST['firstName'], $_POST['lastName'], $_POST['email'], $_POST['departmentID']);
  } else if ($table == "departments") {
    $stmt = $conn->prepare('INSERT INTO department (name, locationID) VALUES (?, ?)');
    $stmt->bind_param("si", $_POST['name'], $_POST['locationID']);
  } else if ($table == "locations") {
    $stmt = $conn->prepare('INSERT INTO `location` (name) VALUES (?)');
    $stmt->bind_param("s", $_POST['name']);
  }

  if ($stmt->execute()) {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
  } else {
    $output['status']['code'] = "500";
    $output['status']['name'] = "error";
    $output['status']['description'] = "Failed to insert record";
  }

  mysqli_close($conn);

  echo json_encode($output);

?>