<?php
	$inData = getRequestInfo();

	ini_set('display_errors', 1);
	error_reporting(E_ALL);
	
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$login = $inData["login"];
	$password = $inData["password"];
    $userId = $inData["userId"]

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "ContactManagerDB");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("DELETE FROM Users WHERE UserID = ?");
		$stmt->bind_param("i", $userId);

		if($stmt->execute()){
			returnWithInfo("User deleted.");

		}
		else{
			returnWithError("User update failed.");
		}

		$stmt->close();
		$conn->close();
		returnWithError("");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithInfo( $msg )
	{
		$retValue = '{"message":"' . $msg . '"}';
		sendResultInfoAsJson($retValue);
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
