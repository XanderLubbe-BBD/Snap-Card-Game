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
            if(waitingToJoin){
                showWaiting();
                waitingToJoin = false;
            } else {
                try {
                    let li = document.createElement("li");
                    li.innerText = msg.player;
                    document.getElementById("playerList").appendChild(li);
                } catch (e) {
                    
                }
            }
            
            break;
        case "start":
            startGame(msg.players);
            break;
        case "yourTurn":
            myTurn = true;
            break;
        case "playerTurn":
            myTurn = false;
            break;
        case "placed":
            let card = msg.card;
            let player = msg.player;

            let elements = document.getElementsByClassName("whole-card");
            
            elements = [...elements].filter(element => {
                return element.getAttribute("data-id") === player;
            });

            let nextCard = elements[elements.length-1];

            nextCard.getElementsByClassName("card-front")[0].src = `/images/cards/${card.code}.png`;
            nextCard.classList.add("in-center");
            nextCard.style.zIndex = zIndexCount++;
            nextCard.removeAttribute("data-id");

            break;
        case "gameOver":
            let winner = msg.winner;

            clearGamePage();

            let h1 = document.createElement("h1");
            h1.textContent = `Game Over!`;
            let h2 = document.createElement("h2");
            h1.textContent = `${winner} won!`;

            let box = document.createElement("section");
            box.classList.add("box");

            box.appendChild(h1);
            box.appendChild(h2);

            document.body.appendChild(box);
            
            break;
        case "youWinPot":
            let myNewCards = document.getElementsByClassName("in-center");

            [...myNewCards].map(card => {
                card.classList.remove("my-cards", "p1-cards", "p2-cards", "p3-cards", "in-center");
                card.classList.add("my-cards");
                card.setAttribute("data-id", `${myId}`);
                card.style.zIndex = "initial";
                card.getElementsByClassName("card-front")[0].src = `/images/cards/blank.png`;
                card.removeEventListener("click", () => {
                    if(myTurn){
                        let msg = {
                            type: "place",
                            joinCode: jCode
                        }
                        sendMessage(msg);
    
                        myTurn = false;
                    }
                });
                card.addEventListener("click", () => {
                    if(myTurn){
                        let msg = {
                            type: "place",
                            joinCode: jCode
                        }
                        sendMessage(msg);
    
                        myTurn = false;
                    }
                });
            });

            break;
        case "potWon":
            let playerNewCards = document.getElementsByClassName("in-center");
            let winningPlayer = msg.player;

            [...playerNewCards].map(card => {
                card.classList.remove("my-cards", "p1-cards", "p2-cards", "p3-cards", "in-center");
                card.classList.add(`p${getPlayerIndex(winningPlayer)+1}-cards`);
                card.setAttribute("data-id", `${winningPlayer}`);
                card.style.zIndex = "initial";
                card.getElementsByClassName("card-front")[0].src = `/images/cards/blank.png`;
            });

            break;
        case "leave":
            let playerId = msg.player;

            let leaveElems = document.getElementsByClassName("whole-card");

            leaveElems = [...leaveElems].filter(element => {
                return element.getAttribute("data-id") === playerId;
            });

            for(let i = 0; i < leaveElems.length; i++){
                leaveElems[i].classList.add("in-center");
                leaveElems[i].removeAttribute("data-id");
            }
            

            break;
        case "debug":
            checkCardSync(msg.players);
        default:
            // stuff
            break;
    }
});

function sendMessage(data) {
    ws.send(JSON.stringify(data));
}

function checkCardSync(players){
    console.log("[INFO] Comparing number of cards on front-end and back-end...");
    
    let checkArr = [];

    for(let i = 0; i < players.length; i++){
        let playerId = players[i].id;
        let playerCards = players[i].cards;

        let elements = document.getElementsByClassName("whole-card");
        elements = [...elements].filter(element => {
            return element.getAttribute("data-id") === playerId;
        });

        console.log(`[INFO] Player "${playerId}" has ${playerCards} cards on the server (Front-end: ${elements.length})`);

        checkArr.push(playerCards == elements.length);
    }


    console.log(`${checkArr.every(element => element) ? "[SUCCESS]" : "[ERROR]"} Sync check ${checkArr.every(element => element) ? "passed" : "failed"}`);
}