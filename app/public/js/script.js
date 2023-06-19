const ws = new WebSocket("ws://localhost:8081");
ws.addEventListener("open", () => {
    console.log("We are connected");
});

ws.addEventListener('message', function (event) {
    document.getElementById("response").innerHTML = event.data;
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

