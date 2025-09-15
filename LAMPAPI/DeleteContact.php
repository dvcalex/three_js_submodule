<?php
	$inData = getRequestInfo();

	ini_set('display_errors', 1);
	error_reporting(E_ALL);
	
	//$contactFirst = $inData["contactFirst"];
    //$contactLast = $inData["contactLast"];
	//$userId = $inData["userId"];
	$id = $inData["id"];
    //$phone = $inData["phone"];
    //$email = $inData["email"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "ContactManagerDB");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ?");
		$stmt->bind_param("i", $id);

		if($stmt->execute()){
			returnWithInfo("Contact deleted.");

		}
		else{
			returnWithError("Contact delete failed.");
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
