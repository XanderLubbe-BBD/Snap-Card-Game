import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8081 });

function sendMessage(msg, client = null) {
    if (!client) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === 1) {
                client.send(msg);
            }
        });
    } else {
        if (client.readyState === 1) {
            client.send(msg);
        }
    }
}


wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
        console.log('received: %s', data);

        data = JSON.parse(data);

        switch (data.type) {
            case "respond":
                sendMessage(data.message, ws);
                break;
            case "broadcast":
                sendMessage(data.message);
                break;
            case "request":
                fetch(`http://localhost:8082/${data.endpoint}`).then(res => {
                    res.text().then(data =>
                        sendMessage(data, ws)
                    );
                });
                break;
        }
    });
});