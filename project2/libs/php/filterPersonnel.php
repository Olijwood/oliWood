<?php
  ini_set('display_errors', 'On');
  error_reporting(E_ALL);

  $executionStartTime = microtime(true);
  include('config.php'); 

  header('Content-Type: application/json; charset=UTF-8');
  $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

  if (mysqli_connect_errno()) {
    echo json_encode([
      "status" => [
        "code" => 300,
        "name" => "failure",
        "description" => "database unavailable"
      ]
    ]);
    exit;
  }

  $departmentIDs = isset($_POST['departmentIDs']) ? $_POST['departmentIDs'] : [];
  $locationIDs = isset($_POST['locationIDs']) ? $_POST['locationIDs'] : [];

  $query = "SELECT p.id, p.firstName, p.lastName, p.email, d.name as departmentName, l.name as locationName
            FROM personnel p
            LEFT JOIN department d ON p.departmentID = d.id
            LEFT JOIN location l ON d.locationID = l.id
            WHERE 1=1";

  if ($departmentIDs !== "ALL" && !empty($departmentIDs)) {
    $departmentPlaceholders = implode(',', array_fill(0, count($departmentIDs), '?'));
    $query .= " AND d.id IN ($departmentPlaceholders)";
  }

  if ($locationIDs !== "ALL" && !empty($locationIDs)) {
    $locationPlaceholders = implode(',', array_fill(0, count($locationIDs), '?'));
    $query .= " AND l.id IN ($locationPlaceholders)";
  }

  $stmt = $conn->prepare($query);

  // Bind the parameters
  $params = [];
  if ($departmentIDs !== "ALL") $params = array_merge($params, $departmentIDs);
  if ($locationIDs !== "ALL") $params = array_merge($params, $locationIDs);

  if (!empty($params)) {
    $types = str_repeat("i", count($params));
    $stmt->bind_param($types, ...$params);
  }

  $stmt->execute();
  $result = $stmt->get_result();

  $data = [];
  while ($row = $result->fetch_assoc()) {
    $data[] = $row;
  }

  echo json_encode([
    "status" => [
      "code" => 200,
      "name" => "ok",
      "description" => "success"
    ],
    "data" => $data
  ]);

  $stmt->close();
  $conn->close();
?>
