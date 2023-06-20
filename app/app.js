var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/pages/landing.html');
})

app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/pages/login.html');
})

app.get('/home', function (req, res) {
    res.sendFile(__dirname + '/pages/home.html');
})

app.get('/game', function (req, res) {
    res.sendFile(__dirname + '/pages/game.html');
})

app.get('/history', function (req, res) {
    res.sendFile(__dirname + '/pages/history.html');
})

app.get('/rules', function (req, res) {
    res.sendFile(__dirname + '/pages/rules.html');
})

app.get('/*', function (req, res) {
    res.sendFile(__dirname + '/pages/404.html');
})

var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
})