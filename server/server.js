import { WebSocketServer } from 'ws';
import * as GameLogic from './server/game.js'

// TODO: implement secure web sockets (required when accessing fron-end through https)

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
            case "create":
                GameLogic.createGame(data.id, ws);
                break;
            case "join":
                GameLogic.joinGame(data.joinCode, data.id, ws);
                break;            
            case "leave":
                GameLogic.leaveGame(data.joinCode, ws);
                break;   
            case "start":
                GameLogic.startGame(data.joinCode, ws);
                break;   
            case "place":
                GameLogic.playCard(data.joinCode, ws);
                break;  
            case "snap":
                GameLogic.snap(data.joinCode, ws);
                break;
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
            case "debug":
                GameLogic.debug(data.joinCode, ws);
                break;
        }
    });
});