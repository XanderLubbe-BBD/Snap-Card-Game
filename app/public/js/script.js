const ws = new WebSocket("ws://localhost:8081");
ws.addEventListener("open", () => {
    console.log("We are connected");
});

ws.addEventListener('message', function (event) {
    document.getElementById("response").innerText = event.data;
});

document.getElementById("createLobby").addEventListener("click", function () {
    let message = document.getElementById("input").value;
    let data = {
        "type": "create",
        "player": {"id": 0}
    }
    ws.send(JSON.stringify(data));
});

document.getElementById("joinLobby").addEventListener("click", function () {
    let message = document.getElementById("input").value;
    let data = {
        "type": "join",
        "joinCode": message,
        "player": {"id": 1}
    }
    ws.send(JSON.stringify(data));
});

document.getElementById("leaveLobby").addEventListener("click", function () {
    let message = document.getElementById("input").value;
    let data = {
        "type": "leave",
        "joinCode": message,
    }
    ws.send(JSON.stringify(data));
});

document.getElementById("respond").addEventListener("click", function () {
    let message = document.getElementById("input").value;
    let data = {
        "type": "respond",
        "message": message
    }
    ws.send(JSON.stringify(data));
});

document.getElementById("broadcast").addEventListener("click", function () {
    let message = document.getElementById("input").value;
    let data = {
        "type": "broadcast",
        "message": message
    }
    ws.send(JSON.stringify(data));
});

document.getElementById("requestNames").addEventListener("click", function () {
    let data = {
        "type": "request",
        "endpoint": "names"
    }
    ws.send(JSON.stringify(data));
});

document.getElementById("startGame").addEventListener("click", function () {
    let message = document.getElementById("input").value;
    let data = {
        "type": "start",
        "joinCode": message
    }
    ws.send(JSON.stringify(data));
});

