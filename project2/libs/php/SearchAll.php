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
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output);

		exit;

	}	

	$searchQuery = isset($_POST['query']) ? $_POST['query'] : '';
	$activeTab = isset($_POST['tab']) ? $_POST['tab'] : 'personnel';

	// SQL for personnel search
	if ($activeTab === 'personnel') {
		$query = $conn->prepare('SELECT `p`.`id`, `p`.`firstName`, `p`.`lastName`, `p`.`email`, `p`.`jobTitle`, `d`.`name` AS `departmentName`, `l`.`name` AS `locationName`
														FROM `personnel` `p`
														LEFT JOIN `department` `d` ON `d`.`id` = `p`.`departmentID`
														LEFT JOIN `location` `l` ON `l`.`id` = `d`.`locationID`
														WHERE `p`.`firstName` LIKE ? OR `p`.`lastName` LIKE ? OR `p`.`email` LIKE ? OR `p`.`jobTitle` LIKE ? OR `d`.`name` LIKE ? OR `l`.`name` LIKE ?
														ORDER BY `p`.`firstName`, `p`.`lastName`');
	} 
	// SQL for department search
	else if ($activeTab === 'department') {
		$query = $conn->prepare('SELECT `d`.`id`, `d`.`name` AS `departmentName`, `l`.`name` AS `locationName`
														FROM `department` `d`
														LEFT JOIN `location` `l` ON `d`.`locationID` = `l`.`id`
														WHERE `d`.`name` LIKE ? OR `l`.`name` LIKE ?
														ORDER BY `d`.`name`, l.`name`');
	} 
	// SQL for location search
	else if ($activeTab === 'location') {
		$query = $conn->prepare('SELECT `l`.`id`, `l`.`name`
														FROM `location` `l`
														WHERE `l`.`name` LIKE ?
														ORDER BY `l`.`name`');
	}

	$likeText = "%" . $searchQuery . "%";
	if ($activeTab === 'personnel') {
		$query->bind_param("ssssss", $likeText, $likeText, $likeText, $likeText, $likeText, $likeText);
	} else if ($activeTab === 'department') {
		$query->bind_param("ss", $likeText, $likeText);
	} else if ($activeTab === 'location') {
		$query->bind_param("s", $likeText);
	}

	$query->execute();
	$result = $query->get_result();
	$data = [];

	while ($row = mysqli_fetch_assoc($result)) {
			array_push($data, $row);
	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data']['found'] = $data;

	mysqli_close($conn);

	echo json_encode($output);

?>
