
<?php

	use Dotenv\Dotenv;  

	require '../../../assets/vendor/autoload.php';

	$dotenv = Dotenv::createImmutable(__DIR__ . '/../../'); // Adjust this path to match your folder structure
	$dotenv->load();

	$cd_dbname = $_ENV['DBNAME'];
	$cd_user = $_ENV['DBUSER'];
	$cd_password = $_ENV['DBPW'];

	$cd_host = "127.0.0.1";
	$cd_port = 3306;
	$cd_socket = "";

?>
