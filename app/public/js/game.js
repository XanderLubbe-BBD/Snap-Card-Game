let zIndexCount = 10;
let jCode = "";
let myTurn = false;
let myId = "";
let waitingToJoin = false;
let numPlayers = "";

const debug = true;

if(debug){
    let pId = document.createElement("p");
    pId.style.position = "absolute";
    pId.style.top = "0";
    pId.style.right = "0";
    pId.textContent = myId;
    pId.style.color = "red";
    pId.id = "debugId";
    document.body.appendChild(pId);

    let input = document.createElement("input");
    input.style.position = "absolute";
    input.style.top = "50px";
    input.style.right = "0";
    input.id = "debugInput";
    document.body.appendChild(input);
    input.addEventListener("keyup", (e) => {
        pId.textContent = e.target.value;
        myId = e.target.value;
    });

    let debugMsg = document.createElement("p");
    debugMsg.style.position = "absolute";
    debugMsg.style.top = "50px";
    debugMsg.style.color = "red"
    debugMsg.textContent = "debug mode enabled";
}

let playerIds = [];

let urlParams = new URLSearchParams(window.location.search);

if (urlParams.get('join') != null) {
    document.getElementById("create").classList.add("hidden");
    document.getElementById("join").classList.add("hidden");

    addJoinElements();
} else if (urlParams.get('create') != null) {
    document.getElementById("create").classList.add("hidden");
    document.getElementById("join").classList.add("hidden");

    createGame();

    addCreateElements();
}

document.getElementById("create").addEventListener("click", () => {
    // remove "join" button from dom
    document.getElementById("create").classList.add("hidden");
    document.getElementById("join").classList.add("hidden");

    createGame();

    addCreateElements();
});

document.getElementById("join").addEventListener("click", () => {
    // remove "join" button from dom
    document.getElementById("create").classList.add("hidden");
    document.getElementById("join").classList.add("hidden");

    addJoinElements();
});

function addCreateElements() {
    let code = document.createElement("p");
    code.innerText = "_ _ _ _ _";
    code.classList.add("code");
    code.id = "join-code";

    document.getElementsByClassName("buttons")[0].appendChild(code);

    let box = document.getElementsByClassName("box")[0];
    let ul = document.createElement("ul");
    ul.id = "playerList";
    let headerLI = document.createElement("li");
    headerLI.innerText = "Players";

    let li = document.createElement("li");
    li.innerText = "You";

    ul.appendChild(headerLI);
    ul.appendChild(li);
    box.appendChild(ul);

    let startBtn = document.createElement("button");
    startBtn.innerText = "Start";
    startBtn.id = "start";
    box.appendChild(startBtn);

    startBtn.addEventListener("click", () => {
        let msg = {
            type: "start",
            joinCode: jCode
        }
        sendMessage(msg);
    });
}

function addJoinElements() {
    // let code = document.createElement("input");
    // code.type = "text";
    // code.id = "code";
    // code.classList.add("code");
    // document.getElementsByClassName("buttons")[0].appendChild(code);

    let form = document.createElement('form');
    form.method = "get";
    form.id = "digit-group";
    form.setAttribute('data-group-name', 'digits');
    form.setAttribute('data-autosubmit', 'true');
    form.setAttribute('autocomplete', 'off');

    for (let i = 1; i <= 5; i++) {
        let input = document.createElement('input');
        input.type = "text";
        input.id = `digit-${i}`;
        input.name = `digit-${i}`;
        input.className = "singleInput";
        input.maxLength = 1;

        if (urlParams.get('join') != null && urlParams.get('join').length == 5) {
            input.value = urlParams.get('join').charAt(i - 1);
        }

        form.appendChild(input);
    }

    document.getElementById('join-code').appendChild(form);

    document.getElementById('join-code').classList.add("join");

    // add join button below the form
    let joinButton = document.createElement('button');
    joinButton.type = "submit";
    joinButton.id = "join-btn";
    joinButton.textContent = "Join";
    joinButton.classList.add('btn');

    if (urlParams.get('join') != null && urlParams.get('join').length == 5) {
        joinButton.classList.remove('disabled');
        joinButton.disabled = false;
    } else {
        joinButton.classList.add('disabled');
        joinButton.disabled = true;
    }

    document.getElementsByClassName('box')[0].appendChild(joinButton);

    joinButton.addEventListener('click', () => {
        joinGame();
    });

    const inputElements = [...document.querySelectorAll('#digit-group input')]

    inputElements.forEach((ele, index) => {
        ele.addEventListener('keydown', (e) => {
            if (e.keyCode === 8 && e.target.value === '') inputElements[Math.max(0, index - 1)].focus()
        })
        ele.addEventListener('input', (e) => {
            const [first, ...rest] = e.target.value
            e.target.value = first ?? ''
            const lastInputBox = index === inputElements.length - 1
            const didInsertContent = first !== undefined
            if (didInsertContent && !lastInputBox) {
                inputElements[index + 1].focus()
                inputElements[index + 1].value = rest.join('')
                inputElements[index + 1].dispatchEvent(new Event('input'))
            }

            let isValid = inputElements.every(input => { return input.value != ""; });

            if (isValid) {
                document.getElementById('digit-group').classList.add('valid');
                document.getElementById("join-btn").disabled = false;
                document.getElementById("join-btn").classList.remove('disabled');
            } else {
                document.getElementById('digit-group').classList.remove('valid');
                document.getElementById("join-btn").disabled = true;
                document.getElementById("join-btn").classList.add('disabled');
            }
        })
    })
}

function createGame() {
    if(debug){
        document.getElementById("debugId").innerText = myId;
        if(myId == ""){
            myId = "player";
        }
    }
    
    let msg = {
        type: "create",
        id: myId
    }
    sendMessage(msg);
}

function joinGame() {
    if(debug){
        document.getElementById("debugId").innerText = myId;
        if(myId == ""){
            myId = "player2"
        }
    }
    jCode = "";

    let digits = document.getElementsByClassName("singleInput");
    for (let i = 0; i < digits.length; i++) {
        jCode += digits[i].value.toUpperCase();
    }

    let msg = {
        type: "join",
        joinCode: jCode,
        id: myId
    }
    sendMessage(msg);

    waitingToJoin = true;

    
}

function startGame(players) {
    clearPage();

    createGameButtons();

    // replace this with what is received from socket
    setTimeout(() => {
        let myCards = -1;
        let myIndex = -1;
        let totalPlayers = players.length;
        for (let i = 0; i < totalPlayers; i++) {
            let id = players[i].id;

            if (id == myId) {
                myCards = players[i].cards;
                myIndex = i;
                break;
            }
        }

        if(totalPlayers == 2){
            totalPlayers = "two";
        } else if(totalPlayers == 3){
            totalPlayers = "three";
        } else {
            totalPlayers = "four";
        }

        numPlayers = totalPlayers;

        players = players.filter(player => {
            return player.id != myId;
        });
        console.log(`Creating ${myCards} cards for myself`);

        // add my cards
        for (let i = 0; i < myCards; i++) {
            article = document.createElement("article");
            article.classList.add("my-cards");
            article.classList.add("whole-card");
            article.classList.add(totalPlayers);
            article.setAttribute("data-id", `${myId}`);

            cardback = document.createElement("img");
            cardback.src = "/images/cards/back.png";
            cardback.classList.add("card-back");

            cardfront = document.createElement("img");
            cardfront.src = "/images/cards/blank.png";
            cardfront.classList.add("card-front");

            article.appendChild(cardback);
            article.appendChild(cardfront);

            document.body.appendChild(article);

            article.addEventListener("click", () => {
                if(myTurn){
                    let msg = {
                        type: "place",
                        joinCode: jCode
                    }
                    sendMessage(msg);

                    myTurn = false;
                }
            });
        }

        let myCountSpot = document.createElement("h5");
        myCountSpot.innerText = myCards;
        myCountSpot.id = "my-count";
        document.body.appendChild(myCountSpot);

        // Other players
        for(let i = 0; i < players.length; i++){
            
            playerIds.push(players[i].id);
            let numCards = players[i].cards;

            console.log(`Creating ${numCards} cards for ${players[i].id}`);

            let article;
            let cardback;
            let cardfront;

            for(let j = 0; j < numCards; j++){
                article = document.createElement("article");
                article.classList.add(`p${i+1}-cards`);
                article.classList.add("whole-card");
                article.classList.add(totalPlayers);
                article.setAttribute("data-id", `${players[i].id}`);

                cardback = document.createElement("img");
                cardback.src = "/images/cards/back.png";
                cardback.classList.add("card-back");

                cardfront = document.createElement("img");
                cardfront.src = "/images/cards/blank.png";
                cardfront.classList.add("card-front");

                article.appendChild(cardback);
                article.appendChild(cardfront);

                document.body.appendChild(article);
            }
        }

        window.addEventListener("keydown", (e) => {
            // if key is spacebar
            if (e.keyCode == 32) {
                e.preventDefault();

                callSnap();
            }
        });

        document.getElementById("callSnap").addEventListener("click", () => {
            callSnap();
        });

        // TODO: remove debug stuff
        if(debug){
            let debugBtn = document.createElement("button");
            debugBtn.textContent = "Request Debug";
            debugBtn.style.position = "absolute";
            debugBtn.style.top = "10px";
            debugBtn.style.left = "10px";
            document.body.appendChild(debugBtn);

            debugBtn.addEventListener("click", () => {
               let msg = {
                   type: "debug",
                   joinCode: jCode
               };
               sendMessage(msg);
            });
        }
        
    }, 1000);


}

function clearPage() {
    document.getElementsByClassName("box")[0].style.transform = "translateY(100px)";
    document.getElementsByTagName("footer")[0].style.transform = "translateY(100px)";

    document.getElementsByClassName("box")[0].style.opacity = "0";
    document.getElementsByTagName("footer")[0].style.opacity = "0";

    document.getElementById("snapy").remove();

    setTimeout(() => {
        document.getElementsByClassName("box")[0].remove();
        document.getElementsByTagName("footer")[0].remove();
    }, 1000);

    window.scrollTo(0, 0);
}

function clearGamePage(){
    let cards = document.getElementsByClassName("whole-card");
    [...cards].forEach(card => {
       card.remove(); 
    });
    document.getElementById("callSnap").remove();
}

function createGameButtons() {
    let snapBtn = document.createElement("button");
    snapBtn.textContent = "Snap!";
    snapBtn.id = "callSnap";

    document.body.appendChild(snapBtn);
}

function callSnap() {
    let elements = document.getElementsByClassName("in-center");

    if(elements.length >= 2){
        let msg = {
            type: "snap",
            joinCode: jCode
        }
        sendMessage(msg);
    }
}

function showWaiting() {
    document.getElementById("join-code").innerHTML = "Waiting for game to start...";
    document.getElementById("join-btn").remove();
}

function getPlayerIndex(id) {
    for (let i = 0; i < playerIds.length; i++) {
        if (playerIds[i] == id) {
            return i;
        }
    }
}

function preLoadCardImages(){
    preloads = [
        "/images/cards/back.png",
        "/images/cards/blank.png",
        "/images/cards/0H.png",
        "/images/cards/0D.png",
        "/images/cards/0C.png",
        "/images/cards/0S.png",
        "/images/cards/2H.png",
        "/images/cards/2D.png",
        "/images/cards/2C.png",
        "/images/cards/2S.png",
        "/images/cards/3H.png",
        "/images/cards/3D.png",
        "/images/cards/3C.png",
        "/images/cards/3S.png",
        "/images/cards/4H.png",
        "/images/cards/4D.png",
        "/images/cards/4C.png",
        "/images/cards/4S.png",
        "/images/cards/5H.png",
        "/images/cards/5D.png",
        "/images/cards/5C.png",
        "/images/cards/5S.png",
        "/images/cards/6H.png",
        "/images/cards/6D.png",
        "/images/cards/6C.png",
        "/images/cards/6S.png",
        "/images/cards/7H.png",
        "/images/cards/7D.png",
        "/images/cards/7C.png",
        "/images/cards/7S.png",
        "/images/cards/8H.png",
        "/images/cards/8D.png",
        "/images/cards/8C.png",
        "/images/cards/8S.png",
        "/images/cards/9H.png",
        "/images/cards/9D.png",
        "/images/cards/9C.png",
        "/images/cards/9S.png",
        "/images/cards/JH.png",
        "/images/cards/JD.png",
        "/images/cards/JC.png",
        "/images/cards/JS.png",
        "/images/cards/QH.png",
        "/images/cards/QD.png",
        "/images/cards/QC.png",
        "/images/cards/QS.png",
        "/images/cards/KH.png",
        "/images/cards/KD.png",
        "/images/cards/KC.png",
        "/images/cards/KS.png",
        "/images/cards/AH.png",
        "/images/cards/AD.png",
        "/images/cards/AC.png",
        "/images/cards/AS.png",
    ]

    var tempImg = []

    for(let i = 0; i < preloads.length; i++) {
        tempImg[i] = new Image();
        tempImg[i].src = preloads[i];
    }
}