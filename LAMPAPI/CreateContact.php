<?php
	$inData = getRequestInfo();

	ini_set('display_errors', 1);
	error_reporting(E_ALL);
	
	$contactFirst = $inData["contactFirst"];
    $contactLast = $inData["contactLast"];
	$userId = $inData["userId"];
    $phone = $inData["phone"];
    $email = $inData["email"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "ContactManagerDB");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("INSERT into Contacts (UserId, FirstName, LastName, Phone, Email) VALUES(?,?,?,?,?)");
		$stmt->bind_param("sssss", $userId, $contactFirst, $contactLast, $phone, $email);

		if($stmt->execute()){
			$id = $conn->insert_id;
			returnWithInfo("Contact added.", $id, $contactFirst, $contactLast, $phone, $email);
		}
		else{
			returnWithError("Create contact failed.");
		}

		$stmt->close();
		$conn->close();
		//returnWithError("");
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

	function returnWithInfo( $msg , $id, $contactFirst, $contactLast, $phone, $email)
	{
		$retValue = '{"message":"' . $msg . '", "id":"' . $id . '", "firstName":"' . $contactFirst . '","lastName":"' . $contactLast . '","phone":"' . $phone . '","email":"' . $email . '","error":""}';
		sendResultInfoAsJson($retValue);
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
