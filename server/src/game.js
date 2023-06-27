import * as deckAPI from './api/docApi.js';
import * as api from './api/api.js';

const debugMode = false;

/**
 * 
 * @param {Object} Player
 * Desc:
 * Instantiates a player using a destructor
 */
function Player(username, email) {
    this.username = username;
    this.email = email;
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
export async function createGame(playerWS, token) {
    try {
        const getRandomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();
        const joinCode = getRandomCode();


        const playerInfo = await api.getInfo(token);
        console.log(("Place 1"));
        console.log(playerInfo);
        
        if (playerInfo.valid) {
            let lobby = new Map();
            lobby.set(playerWS, new Player(playerInfo.username, playerInfo.email))
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
                    joinCode: joinCode,
                    player: playerInfo.username
                }));
            });
        }
    } catch (error) {
        console.log(error);
    }
    
}

/**
 * 
 * @param {String} joinCode
 * @param {Object} playerInfo
 * @param {WebSocket} playerWS
 * Desc:
 * Allows players to join a game.
 */
export async function joinGame(joinCode, playerWS, token){

    try {
        if (activeGames.has(joinCode)) {
            console.log("Code exists")
            let lobby = activeGames.get(joinCode).lobby
            if (!lobby.has(playerWS)) {
                console.log("Player is not yet in game");
                if (lobby.size < 4) {
                    console.log("Game has enough space for player to join");
                    const playerInfo = await api.getInfo(token);
                    console.log("Retrieving payer info");
                    console.log(playerInfo);
                    if (playerInfo.valid) {
                        console.log("Player exists");
                        activeGames.get(joinCode).lobby.set(playerWS, new Player(playerInfo.username, playerInfo.email))
    
                        activeGames.get(joinCode).lobby.forEach((value, key) => {
                            key.send(JSON.stringify({
                                type: "join",
                                player: playerInfo.username
                            }))
                        });  
                        playerWS.send(JSON.stringify({
                            type: "joinSuccess",
                            player: playerInfo.username
                        }));
                    }
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
    } catch (error) {
        console.log(error);
    }
    
}

/**
 * 
 * @param {String} joinCode
 * @param {WebSocket} playerWS
 * Desc:
 * Allows players to leave a game.
 */
export async function leaveGame(joinCode, playerWS){
    try {
        if (validatePlayerByWebSocket(joinCode, playerWS)) {
            const game = activeGames.get(joinCode);
            if (game.started === true) {
                console.log("Removing cards");
                if(game.lobby.get(playerWS).currentHand !== null || game.lobby.get(playerWS).currentHand.length > 0){
                    const result = await deckAPI.addPile(game.deck_id, game.lobby.get(playerWS).currentHand);
                    activeGames.get(joinCode).lobby.get(playerWS).currentHand = new Array();
                }
            }
            activeGames.get(joinCode).lobby = removePlayerByWebSocket(game, playerWS);
            if (activeGames.get(joinCode).lobby.size === 0) {
                activeGames.delete(joinCode);
            }
        }
    } catch (error) {
        console.log(error);       
    }
    
}

/**
 * 
 * @param {String} joinCode
 * @param {WebSocket} playerWS
 * Desc:
 * Distributes cards to pile if  players is disconnected from a game.
 */
export async function disconnect(){
    try {
        for (const joinCode of activeGames.keys()) {
            for (const player of activeGames.get(joinCode).lobby.keys()) {
                if (player.readyState === 3) {
                    await leaveGame(joinCode, player);
                }
            }
            
        }
    } catch (error) {
        console.log(error);
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
    try {
        console.log("Starting game");
        if (validatePlayerByWebSocket(joinCode, playerWS)) {
            let game = activeGames.get(joinCode);

            if (game.started === false) {
                const randomPlayer = Array.from(game.lobby.keys())[Math.floor(Math.random() * game.lobby.size)];

                game.lobby = activeGames.get(joinCode).lobby = await setPlayersHand(game, false, randomPlayer);

                activeGames.get(joinCode).lobby.get(randomPlayer).turn = true;

                activeGames.get(joinCode).started = true;

                const lobbyInfo = getPlayerCardCount(game.lobby);
                console.log(lobbyInfo);

                activeGames.get(joinCode).lobby.forEach( (value, key) => {
                    key.send(JSON.stringify({
                        type: "start",
                        players: lobbyInfo
                    }))
                });

                setTimeout(() =>{
                    activeGames.get(joinCode).lobby.forEach( async (value, key) => {
                        if (randomPlayer === key) {
                            key.send(JSON.stringify({
                                type: "yourTurn",
                                player: value.username
                            }))
                        } else {
                            key.send(JSON.stringify({
                                type: "playerTurn",
                                player: activeGames.get(joinCode).lobby.get(randomPlayer).username
                            }))
                        }
                    });
                }, 1200);
            }
        }
    } catch (error) {
        console.log(error);
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
    try {
        console.log("Play card");
        if (validatePlayerByWebSocket(joinCode, playerWS)) {
            activeGames.get(joinCode).snapCalled = false;
            let game = activeGames.get(joinCode);
            
            if (game.started === true) {
                const card = game.lobby.get(playerWS).currentHand[0];

                const result = await deckAPI.addPile(game.deck_id, [card]);

                activeGames.get(joinCode).lobby.get(playerWS).timesPlayed += 1;
                activeGames.get(joinCode).lobby.get(playerWS).currentHand.shift();
                game.lobby.forEach( (value, key) => {
                    key.send(JSON.stringify({
                        type: "placed",
                        card: card,
                        player: game.lobby.get(playerWS).username,
                    }))
                })
                const redistribute = Array.from(activeGames.get(joinCode).lobby.values()).every( player => player.currentHand.length <= 0);
                if (redistribute === true) {
                    game.lobby = activeGames.get(joinCode).lobby = await setPlayersHand(activeGames.get(joinCode), redistribute);

                    console.log(Array.from(game.lobby.values()));
                    const lobbyInfo = getPlayerCardCount(game.lobby);

                    game.lobby.forEach( (value, key) => {
                        key.send(JSON.stringify({
                            type: "redistribute",
                            players: lobbyInfo
                        }))
                    });
                }

                activeGames.get(joinCode).lobby = setNextPlayerTurn(game.lobby, playerWS);
            }
        }
    } catch (error) {
        console.log();
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
    try {
        if (validatePlayerByWebSocket(joinCode, playerWS)) {
            const game = activeGames.get(joinCode);
            if (game.snapCalled === false) {
                activeGames.get(joinCode).snapCalled = true;
                if (game.started === true) {
                    deckAPI.listPile(game.deck_id).then(async pile => {
                        if(pile.piles.SnapPot.cards.length > 2){
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
                                            winner: game.lobby.get(playerWS).username,
                                        }))
                                    });

                                    

                                    const finishedGame = {"player": Array.from(game.lobby.values()).map( values => {
                                        return values.email
                                    }), "winner": game.lobby.get(playerWS).email};
                                    const result = await api.postHistory(finishedGame);

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
                                                    player: game.lobby.get(playerWS).username,
                                                }))
                                            }
                                            
                                        });
                                    });
                                }
                            }
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

function removePlayerByWebSocket(game, playerWS) {
    try {
        if (game.lobby.has(playerWS)) {
            const playerLeft = game.lobby.get(playerWS)
            game.lobby.forEach((value, key) => {
                key.send(JSON.stringify({
                    type: "leave",
                    player: playerLeft.username
                }))
            });
            if (game.started === true && playerLeft.turn === true) {
                game.lobby = setNextPlayerTurn(game.lobby, playerWS)
            }
            game.lobby.delete(playerWS)
        }
    
        return game.lobby
    } catch (error) {
        console.log();
    }
}

function setNextPlayerTurn(lobby, currentPlayer) {
    try {
        if (lobby.has(currentPlayer)) {
            let count = 1;
            const playersWS = Array.from(lobby.keys());
            let playerIndex = getPlayerIndex(playersWS, currentPlayer, count, lobby.size)
    
            while (lobby.get(playersWS[playerIndex]).currentHand.length <= 0) {
                playerIndex = getPlayerIndex(playersWS, playersWS[playerIndex], count, lobby.size)
            }
    
            lobby.forEach((player) => player.turn = false);
            lobby.get(playersWS[playerIndex]).turn = true;
            lobby.forEach( (value, key) => {
                key.send(JSON.stringify({
                    type: (playersWS[playerIndex] === key)?"yourTurn":"playerTurn",
                    player: lobby.get(playersWS[playerIndex]).username,
                }))
            });
        }
    
        return lobby
    } catch (error) {
        console.log(error);
    }
    
}

function getPlayerIndex(playerArray, currentPlayer, count, size){
    const result = (playerArray.findIndex(playerws => playerws === currentPlayer) + count) % size
    return result
}

async function  setPlayersHand(game, redistribute, randomPlayer = null){
    let remaining = 0;
    for (let [playerSocket, player] of game.lobby.entries()) {
        if (redistribute === false) {
            let numCard;
            if(debugMode){
                numCard = 3;
            } else {
                numCard = Math.floor(52 / game.lobby.size);
            }
            

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
                console.log(player.timesPlayed);
                const currentHand = await deckAPI.drawPile(game.deck_id, player.timesPlayed);

                player.currentHand = currentHand.cards;
                remaining = currentHand.piles.SnapPot.remaining;
            } else {
                player.currentHand = new Array();
            }
            player.timesPlayed = 0;
        }
    }

    if (remaining > 0) {
        const pileList = await deckAPI.listPile(game.deck_id);
        const pileCards = pileList.piles.SnapPot.cards;
        const numCards = Math.floor(pileCards.length / game.lobby.size);
        const firstPlayer = Array.from(game.lobby.keys())[0];

        for (let [playerSocket, player] of game.lobby.entries()) {
            if ((pileCards.length % 2 === 1) && game.lobby.size % 2 === 0) {
                let currentHand = null
                if (playerSocket === firstPlayer) {
                    currentHand = await deckAPI.drawPile(game.deck_id, numCards + 1);
                } else {
                    currentHand = await deckAPI.drawPile(game.deck_id, numCards);
                }

                player.currentHand = player.currentHand.concat(currentHand.cards);
            } else if ((pileCards.length % 2 === 1) && game.lobby.size === 3) {
                let currentHand = null;
                if (pileCards.length == 5) {
                    currentHand = await deckAPI.drawPile(game.deck_id, numCards + 1);
                } else {
                    if (playerSocket === firstPlayer) {
                        currentHand = await deckAPI.drawPile(game.deck_id, numCards + 1);
                    } else {
                        currentHand = await deckAPI.drawPile(game.deck_id, numCards);
                    }
                }

                player.currentHand = player.currentHand.concat(currentHand.cards);
            } else if ((pileCards.length % 2 === 0) && (game.lobby.size  % 2 === 0)) {
                const currentHand = await deckAPI.drawPile(game.deck_id, numCards);

                player.currentHand = player.currentHand.concat(currentHand.cards);
            } else if ((pileCards.length % 2 === 0) && game.lobby.size === 3) {
                let currentHand = null;
                if (playerSocket === firstPlayer) {
                    currentHand = await deckAPI.drawPile(game.deck_id, numCards + 1);
                } else {
                    currentHand = await deckAPI.drawPile(game.deck_id, numCards);
                }

                player.currentHand = player.currentHand.concat(currentHand.cards);
            }
            player.timesPlayed = 0;
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

function getPlayerCardCount(lobby){
    const result = Array.from(lobby.values()).map( values => {
        return {"id": values.username, "cards": values.currentHand ? values.currentHand.length : 0}
    });

    return result;
}

// debug
export async function debug(joinCode, playerWS){
    if (validatePlayerByWebSocket(joinCode, playerWS)) {
        const game = activeGames.get(joinCode);

        let players = [];

        game.lobby.forEach((value, key) => {
            players.push({
                id: value.username,
                cards: value.currentHand.length
            });
        })

        playerWS.send(JSON.stringify({
            type: "debug",
            players: players
        }))
    }
}
