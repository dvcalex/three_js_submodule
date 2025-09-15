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
		$stmt = $conn->prepare("UPDATE Users SET FirstName = ?, LastName = ?, Login = ?, Password = ? WHERE UserID = ?");
		$stmt->bind_param("ssssi", $firstName, $lastName, $login, $password, $userId);

		if($stmt->execute()){
			returnWithInfo("User updated.", $firstName, $lastName, $login, $password);

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

	function returnWithInfo( $msg , $firstName, $lastName, $login, $password)
	{
		$retValue = '{"message":"' . $msg . '", "firstName":"' . $firstName . '","lastName":"' . $lastName . '","login":"' . $login . '","password":"' . $password . '","error":""}';
		sendResultInfoAsJson($retValue);
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
