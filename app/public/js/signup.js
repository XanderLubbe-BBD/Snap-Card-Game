const postAuth = async (url, body) => {
    try {
      const response = await fetch(`http://localhost:4001/${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
  
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  async function register(first_name, last_name, email, password) 
  {
    let res;
    try{
        let body = {"first_name" : first_name, "last_name" : last_name, "email" : email, "password" : password};
        res = await postAuth(`register`, body);
    }
    catch(error){
        console.log(error);
    }
    return res;
  }

  async function getToken(first_name, last_name, email, password){
    let res = await register(first_name, last_name, email, password);
    if (res.ok){
        let result = await res.json();
        if(result.token){
            sessionStorage.setItem('token', result.token);
            window.location.href = `/home/${result.token}`;
        }
    }   
  }

document.getElementById("signupBtn").addEventListener("click", function () {
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let password1 = document.getElementById("password1").value;

    if (email == "user@example.com") {
        document.getElementById("error-message").textContent = "Email address is already in use, please login instead";
        document.getElementById("error-message").style.display = "block";
    } else if (password != password1) {
        document.getElementById("error-message").textContent = "Passwords do not match, please try again";
        document.getElementById("error-message").style.display = "block";
    } else if(!validatePassword(password)){
        document.getElementById("error-message").style.display = "block";
    } else {
        getToken(firstName, lastName, email, password);
    }
});

document.getElementById("password").addEventListener("keyup", function () {
    let password = document.getElementById("password").value;

    if (password.length < 8) {
        document.getElementById("check1").classList.remove("success");
    } else {
        document.getElementById("check1").classList.add("success");
    }
    if (password.search(/[a-z]/) < 0) {
        document.getElementById("check2").classList.remove("success");
    } else {
        document.getElementById("check2").classList.add("success");
    }
    if (password.search(/[A-Z]/) < 0) {
        document.getElementById("check3").classList.remove("success");
    } else {
        document.getElementById("check3").classList.add("success");
    }
    if (password.search(/[0-9]/) < 0) {
        document.getElementById("check4").classList.remove("success");
    } else {
        document.getElementById("check4").classList.add("success");
    }
    if (password.search(/[^a-zA-Z0-9]/) < 0) {
        document.getElementById("check5").classList.remove("success");
    } else {
        document.getElementById("check5").classList.add("success");
    }
});

function validatePassword(password) {
    if (password.length < 8) {
        document.getElementById("error-message").textContent = "Password must be at least 8 characters";
        return false;
    } else if (password.search(/[a-z]/) < 0) {
        document.getElementById("error-message").textContent = "Password must contain at least one lowercase letter";
        return false;
    } else if (password.search(/[A-Z]/) < 0) {
        document.getElementById("error-message").textContent = "Password must contain at least one uppercase letter";
        return false;
    } else if (password.search(/[0-9]/) < 0) {
        document.getElementById("error-message").textContent = "Password must contain at least one number";
        return false;
    } else if (password.search(/[^a-zA-Z0-9]/) < 0) {
        document.getElementById("error-message").textContent = "Password must contain at least one special character";
        return false;
    } else {
        return true;
    }
}