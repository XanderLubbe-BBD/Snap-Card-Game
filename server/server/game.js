import * as deckAPI from '../api/docApi.js';

/**
 * 
 * @param {Object} Player
 * Desc:
 * Instantiates a player using a destructor
 */
function Player(id) {
    this.id = id;
    // this.name = name;
    this.currentHand = null;
    this.turn = false;
    this.timesPlayed = 0;
}
  
const activeGames = new Map();

/**
 * 
 * @param {Object} playerInfo
 * @param {WebSocket} playerWS
 * Desc:
 * Creates a new active game
 */
export async function createGame(playerInfo, playerWS){
    const getRandomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();
    const joinCode = getRandomCode();

    let lobby = new Map();
    lobby.set(playerWS, new Player(playerInfo))

    deckAPI.getDeck().then( (gameDeck) => {
        const game = {
            lobby: lobby,
            deck_id: gameDeck.deck_id,
            started: false,
            snapCalled: false,
            pile: null,
        };
    
        activeGames.set(joinCode, game);
        console.log({
            type: "response",
            joinCode: joinCode,
            message: `Created game successfully`
        });
    
        playerWS.send(JSON.stringify({
            type: "create",
            joinCode: joinCode
        }));
    });

    
}

/**
 * 
 * @param {String} joinCode
 * @param {Object} playerInfo
 * @param {WebSocket} playerWS
 * Desc:
 * Allows players to join a game.
 */
export async function joinGame(joinCode, playerInfo, playerWS){

    if (activeGames.has(joinCode)) {
        let lobby = activeGames.get(joinCode).lobby
        if (!lobby.has(playerWS)) {
            if (lobby.size < 4) {
                activeGames.get(joinCode).lobby.set(playerWS, new Player(playerInfo))

                activeGames.get(joinCode).lobby.forEach((value, key) => {
                    key.send(JSON.stringify({
                        type: "join",
                        player: playerInfo
                    }))
                });  
            } else {
                playerWS.send(JSON.stringify({
                    type: "error",
                    message: `Game is full!`
                }));
            }
            
        } else {
            playerWS.send(JSON.stringify({
                type: "error",
                message: `Already part of game!`
            }));
        }
    }
}

/**
 * 
 * @param {String} joinCode
 * @param {WebSocket} playerWS
 * Desc:
 * Allows players to leave a game.
 */
export async function leaveGame(joinCode, playerWS, disconnected = false){
    if (validatePlayerByWebSocket(joinCode, playerWS)) {
        const game = activeGames.get(joinCode);
        const playerLeft = game.lobby.get(playerWS);
        if (game.started === true) {
            const result = await deckAPI.addCard(game.deck_id, game.lobby.get(playerWS).currentHand);
        }
        activeGames.get(joinCode).lobby = removePlayerByWebSocket(game.lobby, playerLeft, disconnected);
        if (activeGames.get(joinCode).lobby.size === 0) {
            activeGames.delete(joinCode);
        }
    }
}

/**
 * 
 * @param {String} joinCode
 * @param {WebSocket} playerWS
 * Desc:
 * Distributes cards to pile if  players is disconnected from a game.
 */
export async function disconnect(playerWS){

    for (const [joinCode, game] of activeGames.entries()) {
        for (const [player] of game.keys()) {
            if (playerWS === player) {
                await leaveGame(joinCode, playerWS, true);
            }
        }
        
    }
}

/**
 * 
 * @param {String} joinCode
 * @param {WebSocket} playerWS
 * Desc:
 * Allows players to start a game.
 */
export async function startGame(joinCode, playerWS){
    console.log("Starting game");
    if (validatePlayerByWebSocket(joinCode, playerWS)) {
        let game = activeGames.get(joinCode);

        if (game.started === false) {
            const randomPlayer = Array.from(game.lobby.keys())[Math.floor(Math.random() * game.lobby.size)];

            activeGames.get(joinCode).lobby = await setPlayersHand(game, Array.from(game.lobby.values()).every( player => player.currentHand === []), randomPlayer);

            activeGames.get(joinCode).lobby.get(randomPlayer).turn = true;

            activeGames.get(joinCode).started = true;

            const lobbyInfo = Array.from(activeGames.get(joinCode).lobby.values()).map( values => {
                return {"id": values.id, "cards": values.currentHand.length}
            });

            activeGames.get(joinCode).lobby.forEach( (value, key) => {
                key.send(JSON.stringify({
                    type: "start",
                    players: lobbyInfo
                }))

                if (randomPlayer === key) {
                    key.send(JSON.stringify({
                        type: "yourTurn",
                        player: value.id
                    }))
                } else {
                    key.send(JSON.stringify({
                        type: "playerTurn",
                        player: activeGames.get(joinCode).lobby.get(randomPlayer).id
                    }))
                }
                
            });
        }
    }
}

/**
 * 
 * @param {String} joinCode
 * @param {WebSocket} playerWS
 * Desc:
 * Allows players to play a card.
 */
export async function playCard(joinCode, playerWS){
    console.log("Play card");
    if (validatePlayerByWebSocket(joinCode, playerWS)) {
        activeGames.get(joinCode).snapCalled = false;
        let game = activeGames.get(joinCode);
        
        if (game.started === true) {
            const card = game.lobby.get(playerWS).currentHand[0];

            const result = await deckAPI.addPile(game.deck_id, [card.code]);

            activeGames.get(joinCode).lobby.get(playerWS).timesPlayed += 1;
            activeGames.get(joinCode).lobby.get(playerWS).currentHand.shift();
            game.lobby.forEach( (value, key) => {
                key.send(JSON.stringify({
                    type: "placed",
                    card: card,
                    player: game.lobby.get(playerWS).id,
                }))
            })
            const redistribute = Array.from(activeGames.get(joinCode).lobby.values()).every( player => player.currentHand === []);
            if (redistribute === true) {
                game.lobby = activeGames.get(joinCode).lobby = setPlayersHand(activeGames.get(joinCode), redistribute);

                const lobbyInfo = Array.from(game.lobby.values()).map( values => {
                    return {"id": values.id, "cards": values.currentHand.length}
                });

                game.lobby.forEach( (value, key) => {
                    value.timesPlayed = 0;

                    key.send(JSON.stringify({
                        type: "redistribute",
                        players: lobbyInfo
                    }))
                });
            }

            activeGames.get(joinCode).lobby = setNextPlayerTurn(game.lobby, playerWS);
        }
    }
}

/**
 * 
 * @param {String} joinCode
 * @param {WebSocket} playerWS
 * 
 * Desc:
 * Dictate if valid Snap.
 */
export async function snap(joinCode, playerWS){
    if (validatePlayerByWebSocket(joinCode, playerWS)) {
        const game = activeGames.get(joinCode);
        if (game.snapCalled === false) {
            activeGames.get(joinCode).snapCalled = true;
            if (game.started === true) {
                deckAPI.listPile(game.deck_id).then(pile => {
                    const firstCard = pile.piles.SnapPot.cards[pile.piles.SnapPot.cards.length - 1];
                    const secondCard = pile.piles.SnapPot.cards[pile.piles.SnapPot.cards.length - 2];
                    if ((firstCard.value === secondCard.value) || (firstCard.suit === secondCard.suit)) {
                        for (let [playerSocket, player] of activeGames.get(joinCode).lobby.entries()) {
                            player.timesPlayed = 0;
                        }
                        if (pile.piles.SnapPot.cards.length + game.lobby.get(playerWS).currentHand.length === 52) {
                            game.lobby.forEach( (value, key) => {
                                key.send(JSON.stringify({
                                    type: "gameOver",
                                    winner: game.lobby.get(playerWS).id,
                                }))
                            });
                        } else {
                            console.log("JackPot!");
                            deckAPI.drawPile(game.deck_id, pile.piles.SnapPot.cards.length).then(snapPot => {
                                console.log(snapPot);
                                const result = activeGames.get(joinCode).lobby.get(playerWS).currentHand.concat(snapPot.cards);
                                activeGames.get(joinCode).lobby.get(playerWS).currentHand = result;

                                game.lobby.forEach( (value, key) => {
                                    if (key === playerWS) {
                                        key.send(JSON.stringify({
                                            type: "youWinPot",
                                            cards: result,
                                        }))
                                    } else {
                                        key.send(JSON.stringify({
                                            type: "potWon",
                                            player: game.lobby.get(playerWS).id,
                                        }))
                                    }
                                    
                                });
                            });
                        }
                    }
                });
            }
        }
    }
}

function removePlayerByWebSocket(lobby, wss, disconnected) {
    if (lobby.has(wss)) {
        const playerLeft = lobby.get(wss)
        lobby.forEach((value, key) => {
            key.send(JSON.stringify({
                type: (disconnected === true)?"disconnect":"leave",
                player: playerLeft.id
            }))
        });
        lobby.delete(wss)
        if (lobby.started === true && playerLeft.turn === true) {
            lobby = setNextPlayerTurn(lobby, wss)
        }
    }

    return lobby
}

function setNextPlayerTurn(lobby, currentPlayer) {
    if (lobby.has(currentPlayer)) {
        let count = 1;
        const playersWS = Array.from(lobby.keys());
        let playerIndex = getPlayerIndex(playersWS, currentPlayer, count, lobby.size)

        while (lobby.get(playersWS[playerIndex]).currentHand.length <= 0) {
            playerIndex = getPlayerIndex(playersWS, lobby.get(playersWS[playerIndex]), count, lobby.size)
        }

        lobby.forEach((player) => player.turn = false);
        lobby.get(playersWS[playerIndex]).turn = true;
        lobby.forEach( (value, key) => {
            key.send(JSON.stringify({
                type: (playersWS[playerIndex] === key)?"yourTurn":"playerTurn",
                player: lobby.get(playersWS[playerIndex]).id,
            }))
        });
    }

    return lobby
}

function getPlayerIndex(playerArray, currentPlayer, count, size){
    const result = (playerArray.findIndex(playerws => playerws === currentPlayer) + count) % size
    return result
}

async function  setPlayersHand(game, redistribute, randomPlayer = null){
    for (let [playerSocket, player] of game.lobby.entries()) {
        if (redistribute === false) {
            const numCard = Math.floor(52 / game.lobby.size);

            let currentHand = null;
            if (game.lobby.size === 3 && playerSocket === randomPlayer) {
                currentHand = await deckAPI.drawDeck(game.deck_id, numCard + 1);
            } else {
                currentHand = await deckAPI.drawDeck(game.deck_id, numCard);
            }

            player.turn = false;
            player.currentHand = currentHand.cards;
        } else if (redistribute === true) {
            if (player.timesPlayed > 0) {
                const currentHand = await deckAPI.drawPile(game.deck_id, player.timesPlayed);

                player.currentHand = currentHand.cards;
            }
        }
    }

    return game.lobby;
}

function validatePlayerByWebSocket(joinCode, wss) {
    if (activeGames.has(joinCode)) {
        if (activeGames.get(joinCode).lobby.has(wss)) {
            return true
        }
    }

    return false
}

// debug
export async function debug(joinCode, playerWS){
    if (validatePlayerByWebSocket(joinCode, playerWS)) {
        const game = activeGames.get(joinCode);

        let players = [];

        game.lobby.forEach((value, key) => {
            players.push({
                id: value.id,
                cards: value.currentHand.length
            });
        })

        playerWS.send(JSON.stringify({
            type: "debug",
            players: players
        }))
    }
}