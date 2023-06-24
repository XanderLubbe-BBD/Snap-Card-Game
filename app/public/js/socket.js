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
            let player = msg.id;

            let elements = document.getElementsByClassName("whole-card");
            elements = elements.filter(element => {
                return element.getAttribute("id") === player;
            });

            let nextCard = elements[elements.length];

            nextCard.getElementsByClassName("card-front").src = `/images/cards/${card.code}.png`;
            nextCard.classList.add("in-center");
            nextCard.classList.remove("my-cards", "p1-cards", "p2-cards", "p3-cards");
            nextCard.removeAttribute("id");

            break;
        case "gameOver":
            let winner = msg.winner;

            clearPage();

            setTimeout(() => {
                alert(`Game over! Winner is ${winner}`);
            }, 1000);
            
            break;
        case "youWinPot":
            let myNewCards = document.getElementsByClassName("in-center");

            for (let i = 0; i < cards.length; i++) {
                myNewCards[i].classList.add("my-cards");
                myNewCards[i].setAttribute("id", `${myId}`);
                myNewCards[i].classList.remove("in-center");
                myNewCards[i].style.zIndex = "initial";
                myNewCards[i].getElementsByClassName("card-front")[0].src = `/images/cards/blank.png`;
            }
            break;
        case "potWon":
            let playerNewCards = document.getElementsByClassName("in-center");
            let winningPlayer = msg.player;
            for (let i = 0; i < cards.length; i++) {
                playerNewCards[i].classList.add(`p${getPlayerIndex(winningPlayer)}-cards`);
                playerNewCards[i].setAttribute("id", `${winningPlayer}`);
                playerNewCards[i].classList.remove("in-center");
                playerNewCards[i].style.zIndex = "initial";
                playerNewCards[i].getElementsByClassName("card-front")[0].src = `/images/cards/blank.png`;
            }
            break;
        case "leave":
            let playerId = msg.player;

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

    for(let i = 0; i > players.length; i++){
        let playerId = players[i].id;
        let playerCards = players[i].cards;

        let elements = document.getElementsByClassName("whole-card");
        elements = elements.filter(element => {
            return element.getAttribute("id") === playerId;
        });

        console.log(`[INFO] player ${playerId} has ${playerCards} cards (actual: ${elements.length})`);

        checkArr.push(playerCards == elements.length);
    }


    console.log(`${checkArr.every(element => element) ? "[SUCCESS]" : "[ERROR]"} Sync check ${checkArr.every(element => element) ? "passed" : "failed"}`);
}