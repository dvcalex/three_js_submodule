const urlBase = 'https://sharktronauts.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 ){		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "contact.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function toggleRegister(show)
{
	var registerDiv = document.getElementById("registerDiv");
	var registerResult = document.getElementById("registerResult");

	var loginDiv = document.getElementById("loginDiv");
	var loginResult = document.getElementById("loginResult");

	if (show)
	{
		loginDiv.style.display = "none"
		registerDiv.style.display = "block";
		registerResult.innerHTML = "";
	}
	else
	{
		registerDiv.style.display = "none";
		loginDiv.style.display = "block";
		loginResult.innerHTML = "";
	}
}

function doRegister() {
    var firstName = document.getElementById("regFirstName").value;
    var lastName = document.getElementById("regLastName").value;
	var username  = document.getElementById("regLogin").value;
    var password  = document.getElementById("regPassword").value;



    if (!firstName || !lastName || !username || !password) {
        document.getElementById("registerResult").innerHTML = "invalid signup";
        return;
    }

	//var hash = md5(password);

    document.getElementById("registerResult").innerHTML = "";

    let tmp = {
        firstName: firstName,
        lastName: lastName,
        login: username,
        password: password
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Register.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {

			if (this.readyState == 4)
            {
                // Network / server error
                if (this.status != 200)
                {
                    document.getElementById("registerResult").innerHTML = "Server error (" + this.status + ").";
                    return;
                }

                // Parse response
                var json = {};
                try { json = JSON.parse(xhr.responseText); } catch (e) {}

                if (json.error && json.error.length > 0)
                {
                    document.getElementById("registerResult").innerHTML = json.error;
                    return;
                }

                document.getElementById("registerResult").style.color = "green";
                document.getElementById("registerResult").innerHTML = "Account created! You can now log in.";
			}
        };

        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("registerResult").innerHTML = err.message;
    }
}


function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		//window.location.href = "index.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function toggleAddContact(show)
{
    var addDiv = document.getElementById("addContactDiv");
    var msg = document.getElementById("addContactResult");
    if (show)
    {
        addDiv.style.display = "block";
        if (msg) msg.innerHTML = "";
    }
    else
    {
        addDiv.style.display = "none";
    }
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

// NOT DONE
function addContact()
{
	alert("addContact() clicked");

	let firstName = document.getElementById("contactFirstName").value;
    let lastName = document.getElementById("contactLastName").value;
    let email = document.getElementById("contactEmail").value;
    let phone = document.getElementById("contactPhone").value;
	document.getElementById("addContactResult").innerHTML = "";

	let tmp = {firstName, lastName, email, phone, userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function(){
			if (this.readyState == 4 && this.status == 200){
				document.getElementById("addContactResult").innerHTML = "Contact has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err){
		document.getElementById("addContactResult").innerHTML = err.message;
	}
	
}

// NOT DONE
function searchContacts()
{
	alert("searchContacts() clicked");

	let srch = document.getElementById("searchText").value;
	document.getElementById("contactSearchResult").innerHTML = "";
	
	let contactList = "";

	let tmp = {search:srch, userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchContacts.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try{
		xhr.onreadystatechange = function(){
			if (this.readyState == 4 && this.status == 200){
				document.getElementById("contactSearchResult").innerHTML = "Contacts(s) has been retrieved";
				let jsonObject = JSON.parse( xhr.responseText );
				
				for( let i=0; i<jsonObject.results.length; i++ ){
					contactList += jsonObject.results[i];
					contactList += contactList.firstName + " " + contactList.lastName;
					if( i < jsonObject.results.length - 1 ){
						contactList += "<br />\r\n";
					}
				}
				
				document.getElementsByTagName("contactList").innerHTML = contactList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err){
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}
}
