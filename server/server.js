import { WebSocketServer } from 'ws';
import * as GameLogic from './src/game.js'
import * as HistoryLogic from './src/history.js'
import * as RegisterLogic from './src/register.js'


const wss = new WebSocketServer({ port: 8081 });

wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
        console.log('received: %s', data);

        data = JSON.parse(data);

        switch (data.type) {
            case "create":
                GameLogic.createGame(ws, data.token);
                break;
            case "join":
                GameLogic.joinGame(data.joinCode, ws, data.token);
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
            case "history":
                HistoryLogic.getHistory(ws, data.token);
                break;
            case "register":
                RegisterLogic.registerUser(ws, data.token);
            case "debug":
                GameLogic.debug(data.joinCode, ws);
                break;
        }
    });

    ws.on('close', function disconnect(ws) {
        GameLogic.disconnect(ws);
    });
});
