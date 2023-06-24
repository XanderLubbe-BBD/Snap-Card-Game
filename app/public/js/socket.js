const ws = new WebSocket("ws://localhost:8081");
ws.addEventListener("open", () => {
    console.log("We are connected");
});

ws.addEventListener('message', function (event) {
    let msg = JSON.parse(event.data);
    console.log(msg);

    switch (msg.type) {
        case "create":
            jCode = msg.joinCode;

            document.getElementById("join-code").textContent = jCode;
            break;
        case "join":
            try {
                let li = document.createElement("li");
                li.innerText = msg.player;
                document.getElementById("playerList").appendChild(li);
            } catch (e) {
                
            }
            
            break;
        case "start":

            let obj = {
                type: "start",
                players: [
                    {
                        id: "whatever",
                        cards: 13
                    },
                    {
                        id: "whatever",
                        cards: 13
                    },
                    {
                        id: "whatever",
                        cards: 13
                    },
                    {
                        id: "whatever",
                        cards: 13
                    }
                ]
            }

            let players = [
                {
                    id: "whatever",
                    cards: 13
                },
                {
                    id: "whatever",
                    cards: 13
                },
                {
                    id: "whatever",
                    cards: 13
                },
                {
                    id: "whatever",
                    cards: 13
                }
            ]

            // stuff
            startGame(players);
            break;
        case "yourTurn":
            myTurn = true;
            break;
        case "playerTurn":
            myTurn = false;
            break;
        case "placed":
            // stuff
            break;
        case "gameOver":
            // stuff
            break;
        case "youWinPot":
            // stuff
            break;
        case "potWon":
            // stuff
            break;
        case "leave":
            let playerId = msg.player;

            break;
        default:
            // stuff
            break;
    }
});

function sendMessage(data) {
    ws.send(JSON.stringify(data));
}

