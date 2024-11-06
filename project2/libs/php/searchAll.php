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

// Retrieve search query, active tab, and filters
$searchQuery = isset($_POST['query']) ? $_POST['query'] : '';
$activeTab = isset($_POST['tab']) ? $_POST['tab'] : 'personnel';
$departmentIDs = isset($_POST['departmentIDs']) ? $_POST['departmentIDs'] : [];
$locationIDs = isset($_POST['locationIDs']) ? $_POST['locationIDs'] : [];

// Prepare dynamic parts for the SQL WHERE clause
$whereClauses = [];
$params = [];
$types = '';

$likeText = '%' . $searchQuery . '%';

// SQL and bindings for personnel search
if ($activeTab === 'personnel') {
    $sql = 'SELECT `p`.`id`, `p`.`firstName`, `p`.`lastName`, `p`.`email`, `p`.`jobTitle`, `d`.`name` AS `departmentName`, `l`.`name` AS `locationName`
						FROM `personnel` `p`
						LEFT JOIN `department` `d` ON `d`.`id` = `p`.`departmentID`
						LEFT JOIN `location` `l` ON `l`.`id` = `d`.`locationID`
						WHERE (`p`.`firstName` LIKE ? OR `p`.`lastName` LIKE ? OR `p`.`email` LIKE ? OR `p`.`jobTitle` LIKE ? OR `d`.`name` LIKE ? OR `l`.`name` LIKE ?)';

    array_push(
        $params,
        $likeText,
        $likeText,
        $likeText,
        $likeText,
        $likeText,
        $likeText,
    );
    $types .= 'ssssss';

    // Apply department filters if provided
    if (!empty($departmentIDs)) {
        $placeholders = implode(',', array_fill(0, count($departmentIDs), '?'));
        $sql .= " AND p.departmentID IN ($placeholders)";
        $params = array_merge($params, $departmentIDs);
        $types .= str_repeat('i', count($departmentIDs));
    }

    // Apply location filters if provided
    if (!empty($locationIDs)) {
        $placeholders = implode(',', array_fill(0, count($locationIDs), '?'));
        $sql .= " AND d.locationID IN ($placeholders)";
        $params = array_merge($params, $locationIDs);
        $types .= str_repeat('i', count($locationIDs));
    }

    $sql .= ' ORDER BY `p`.`lastName`, `p`.`firstName`';
}

// SQL and bindings for department search
elseif ($activeTab === 'department') {
    $sql = 'SELECT `d`.`id`, `d`.`name` AS `name`, `l`.`name` AS `locationName`
						FROM `department` `d`
						LEFT JOIN `location` `l` ON `d`.`locationID` = `l`.`id`
						WHERE `d`.`name` LIKE ? OR `l`.`name` LIKE ?';

    array_push($params, $likeText, $likeText);
    $types .= 'ss';

    // Apply location filters if provided
    if (!empty($locationIDs)) {
        $placeholders = implode(',', array_fill(0, count($locationIDs), '?'));
        $sql .= " AND d.locationID IN ($placeholders)";
        $params = array_merge($params, $locationIDs);
        $types .= str_repeat('i', count($locationIDs));
    }

    $sql .= ' ORDER BY `d`.`name`, `l`.`name`';
}

// SQL and bindings for location search
elseif ($activeTab === 'location') {
    $sql = 'SELECT `l`.`id`, `l`.`name`
						FROM `location` `l`
						WHERE `l`.`name` LIKE ?
						ORDER BY `l`.`name`';

    array_push($params, $likeText);
    $types .= 's';
}

$query = $conn->prepare($sql);
$query->bind_param($types, ...$params);

$query->execute();
$result = $query->get_result();
$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    array_push($data, $row);
}

$output['status']['code'] = '200';
$output['status']['name'] = 'ok';
$output['status']['description'] = 'success';
$output['status']['returnedIn'] =
    (microtime(true) - $executionStartTime) / 1000 . ' ms';
$output['data']['found'] = $data;

mysqli_close($conn);

echo json_encode($output);
?>
