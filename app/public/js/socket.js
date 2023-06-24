const ws = new WebSocket("ws://localhost:8081");
ws.addEventListener("open", () => {
    console.log("We are connected");
});

ws.addEventListener('message', function (event) {
    let msg = JSON.parse(event.data);

    switch (msg.type) {
        case "":
            // stuff
            break;
        case "":
            // stuff
            break;
        default:
            // stuff
            break;
    }
});

function sendMessage(data) {
    ws.send(JSON.stringify(data));
}

