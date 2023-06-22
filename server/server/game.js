/**
 * 
 * @param {Object} Player
 *
 * Instantiates a player using a destructor
 */
function Player({id, name, isHost, wss}) {
    this.id = id;
    this.name = name;
    this.isHost = isHost;
    this.wss = wss;
    this.currentCard = "";
    this.currentHand = null;
    this.turn = false;
}
  
const activeGames = new Map();

/**
 * 
 * @param {Object} playerInfo
 * @param {WebSocket} playerWS
 *
 * Creates a new active game
 */
export async function createGame(playerInfo, playerWS){
    const getRandomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();
    const joinCode = getRandomCode();

    let lobby = new Map();
    lobby.set(playerWS, new Player(playerInfo))
    let gameId = 1
    let game = {
        gameId: gameId,
        joinCode: joinCode,
        lobby: lobby,
        started: false,
    };

    activeGames.set(joinCode, game);
    console.log({
        requestType: "response",
        joinCode: joinCode,
        message: `Created game successfully`
    });

    playerWS.send(JSON.stringify({
        requestType: "response",
        joinCode: joinCode,
        message: `Created game successfully`
    }));
}

/**
 * 
 * @param {String} joinCode
 * @param {Object} playerInfo
 * @param {WebSocket} playerWS
 *
 * Allows players to join a game.
 */
export async function joinGame(joinCode, playerInfo, playerWS){

    if (activeGames.has(joinCode)) {
        let lobby = activeGames.get(joinCode).lobby
        if (!lobby.has(playerWS)) {
            if (lobby.size < 4) {
                activeGames.get(joinCode).lobby.set(playerWS, new Player(playerInfo))
                console.log(activeGames.get(joinCode).lobby.size);
                activeGames.get(joinCode).lobby.forEach((value, key) => {
                    key.send(JSON.stringify({
                        requestType: "response",
                        message: `Player ${playerInfo.id} successfully joined game!`
                    }))
                });  
            } else {
                playerWS.send(JSON.stringify({
                    requestType: "response",
                    message: `Game full!`
                }));
            }
            
        } else {
            playerWS.send(JSON.stringify({
                requestType: "response",
                message: `Already part of game!`
            }));
        }
    }
}

/**
 * 
 * @param {String} joinCode
 * @param {WebSocket} playerWS
 *
 * Allows players to leave a game.
 */
export async function leaveGame(joinCode, playerWS){
    if (validatePlayerByWebSocket(joinCode, playerWS)) {

        activeGames.get(joinCode).lobby = removePlayerByWebSocket(activeGames.get(joinCode).lobby, playerWS);
        if (activeGames.get(joinCode).lobby.size === 0) {
            activeGames.delete(joinCode);
        }
    }
}

/**
 * 
 * @param {String} joinCode
 * @param {WebSocket} playerWS
 *
 * Allows players to start a game.
 */
export async function startGame(joinCode, playerWS){
    let game = activeGames.get(joinCode);
    console.log("Starting game");
    if (validatePlayerByWebSocket(joinCode, playerWS) && game.started === false) {
        let randomPlayer = Math.floor(Math.random() * game.lobby.size);
        let activePlayer = null;

        activeGames.get(joinCode).lobby.forEach(player => player.turn = false);
        activeGames.get(joinCode).lobby.get(Array.from(game.lobby.keys())[randomPlayer]).turn = true;
        activePlayer = game.lobby.get(Array.from(game.lobby.keys())[randomPlayer]);
        activeGames.get(joinCode).started = true;
        console.log(randomPlayer);
        console.log(JSON.stringify(activePlayer));
        game.lobby.forEach( (value, key) => {
            key.send(JSON.stringify({
                requestType: "response",
                message: `Game started. Player ${activePlayer.id} turn!`
            }))
        });
    }
}

function removePlayerByWebSocket(lobby, wss) {
    if (lobby.has(wss)) {
        lobby.forEach((value, key) => {
            key.send(JSON.stringify({
                requestType: "response",
                message: `Player ${lobby.get(wss).id} left game!`
            }))
        });

        lobby.delete(wss)
        
    }

    return lobby
}

function validatePlayerByWebSocket(joinCode, wss) {
    if (activeGames.has(joinCode)) {
        if (activeGames.get(joinCode).lobby.has(wss)) {
            return true
        }
    }

    return false
}