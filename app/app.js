var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/pages/landing.html');
})

app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/pages/login.html');
})

app.get('/signup', function (req, res) {
    res.sendFile(__dirname + '/pages/signup.html');
})

app.get('/home/:token', verifyUser, function (req, res) {
    res.sendFile(__dirname + '/pages/home.html');
})

app.get('/game/:token', verifyUser, function (req, res) {
    res.sendFile(__dirname + '/pages/game.html');
})

app.get('/history/:token',verifyUser, function (req, res) {
    res.sendFile(__dirname + '/pages/history.html');
})

app.get('/rules/:token', verifyUser,function (req, res) {
    res.sendFile(__dirname + '/pages/rules.html');
})

app.all('/*', function (req, res) {
    res.sendFile(__dirname + '/pages/404.html');
})

var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
})

async function verifyUser(req,res,next){
    const token = req.params.token;
    const result = await getAuth("verify", token);
    console.log(result);
    if (result.valid){
        next();
    }
    else{
        res.sendFile(__dirname + '/pages/landing.html');
    }
}

const getAuth = async (url, header) => {
    try {
      const response = await fetch(`http://localhost:4001/${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token' : header,
        },
      });
      const json = await response.json();
  
      return json;
    } catch (error) {
      console.log(error);
    }
  };