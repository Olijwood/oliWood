<?php
  // example use from browser
  // http://localhost/project2/libs/php/updateDepartmentByID.php

  // remove next two lines for production	
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
    $output['data'] = [];
    echo json_encode($output);
    exit;
  }

  $departmentID = $_POST['id'];
  $departmentName = $_POST['name'];
  $locationID = $_POST['locationID'];

  $query = $conn->prepare('UPDATE department SET name = ?, locationID = ? WHERE id = ?');
  $query->bind_param("sii", $departmentName, $locationID, $departmentID);
  $query->execute();

  if (false === $query) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed";
    $output['data'] = [];
    echo json_encode($output);
    exit;
  }

  $output['status']['code'] = "200";
  $output['status']['name'] = "ok";
  $output['status']['description'] = "success";
  $output['data'] = [];
  echo json_encode($output);
?>
