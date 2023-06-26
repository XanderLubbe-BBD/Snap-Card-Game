
  const postAuth = async (url, body) => {
    try {
      const response = await fetch(`https://xdict95te4.eu-west-1.awsapprunner.com/${url}`, {
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

  async function login(username, password) 
  {
    let res;
    try{
        let body = {"email" : username, "password" : password};
        res = await postAuth(`login`, body);
    }
    catch(error){
        console.log(error);
    }
    return res;
  }

  async function getToken(username, password){
    let res = await login(username, password);
    if (res.ok){
        let result = await res.json();
        if(result.token){
            sessionStorage.setItem('token', result.token);
            window.location.href = `/home/${result.token}`;
        }
    }   
    else {
    document.getElementById("error-message").textContent = "Incorrect email address or password";
    document.getElementById("error-message").style.display = "block";
    }
  }

  document.getElementById("signinBtn").addEventListener("click", () => {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    getToken(email, password);
});