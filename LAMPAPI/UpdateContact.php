<?php
	$inData = getRequestInfo();

	ini_set('display_errors', 1);
	error_reporting(E_ALL);
	
	$contactFirst = $inData["contactFirst"];
    $contactLast = $inData["contactLast"];
	//$userId = $inData["userId"];
	$id = $inData["id"];
    $phone = $inData["phone"];
    $email = $inData["email"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "ContactManagerDB");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("UPDATE Contacts SET FirstName = ?, LastName = ?, Phone = ?, Email = ? WHERE ID = ?");
		$stmt->bind_param("ssssi", $contactFirst, $contactLast, $phone, $email, $id);

		if($stmt->execute()){
			returnWithInfo("Contact updated.", $contactFirst, $contactLast, $phone, $email);

		}
		else{
			returnWithError("Contact update failed.");
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

	function returnWithInfo( $msg , $contactFirst, $contactLast, $phone, $email)
	{
		$retValue = '{"message":"' . $msg . '", "firstName":"' . $contactFirst . '","lastName":"' . $contactLast . '","phone":"' . $phone . '","email":"' . $email . '","error":""}';
		sendResultInfoAsJson($retValue);
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
