<?php

	$inData = getRequestInfo();
	
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$login = $inData["login"];
	$password = $inData["password"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "ContactManagerDB");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		//login already exists
		$stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
		$stmt->bind_param("s", $login);
		$stmt->execute();
		$result = $stmt->get_result();

		if ($result->num_rows > 0)
		{
			returnWithError("Username already taken");
		}
		else
		{
			//insert new user
			$stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
			$stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
			
			if ($stmt->execute())
			{
				returnWithInfo("User registered!");
			}
			else
			{
				returnWithError("Registration failed");
			}
		}

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson($obj)
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError($err)
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}

	function returnWithInfo($msg)
	{
		$retValue = '{"message":"' . $msg . '","error":""}';
		sendResultInfoAsJson($retValue);
	}

?>
