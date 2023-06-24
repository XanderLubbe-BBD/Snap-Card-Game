import * as deckAPI from '../api/docApi.js';

/**
 * 
 * @param {Object} Player
 * Desc:
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
 * Desc:
 * Creates a new active game
 */
export async function createGame(playerInfo, playerWS){
    const getRandomCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();
    const joinCode = getRandomCode();

    let lobby = new Map();
    lobby.set(playerWS, new Player(playerInfo))

    const gameDeck = await deckAPI.getDeck();

    const gameId = 1
    const game = {
        gameId: gameId,
        joinCode: joinCode,
        lobby: lobby,
        deck_id: gameDeck.deck_id,
        started: false,
        pile: null,
    };

    activeGames.set(joinCode, game);
    console.log({
        type: "response",
        joinCode: joinCode,
        message: `Created game successfully`
    });

    playerWS.send(JSON.stringify({
        type: "response",
        joinCode: joinCode,
        message: `Created game successfully`
    }));
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
                console.log(activeGames.get(joinCode).lobby.size);
                activeGames.get(joinCode).lobby.forEach((value, key) => {
                    key.send(JSON.stringify({
                        type: "response",
                        message: `Player ${playerInfo.id} successfully joined game!`
                    }))
                });  
            } else {
                playerWS.send(JSON.stringify({
                    type: "response",
                    message: `Game full!`
                }));
            }
            
        } else {
            playerWS.send(JSON.stringify({
                type: "response",
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
export async function leaveGame(joinCode, playerWS){
    if (validatePlayerByWebSocket(joinCode, playerWS)) {
        const game = activeGames.get(joinCode);
        if (game.started === true) {
            const result = await deckAPI.addCard(game.deck_id, game.lobby.get(playerWS).currentHand);
            setNextPlayerTurn(game.lobby, playerWS);
        }
        activeGames.get(joinCode).lobby = removePlayerByWebSocket(game.lobby, playerWS);
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
 * Allows players to start a game.
 */
export async function startGame(joinCode, playerWS){
    console.log("Starting game");
    if (validatePlayerByWebSocket(joinCode, playerWS)) {
        let game = activeGames.get(joinCode);

        if (game.started === false) {
            const randomPlayer = Array.from(game.lobby.keys())[Math.floor(Math.random() * game.lobby.size)];
            const numCard = 52 / game.lobby.size;
            activeGames.get(joinCode).lobby.forEach(async player  => {
                let currentHand = await deckAPI.drawDeck(game.deck_id, numCard);
                player.turn = false;
                player.currentHand = currentHand.cards;
                player.currentCard = currentHand.cards[0];
            });
            console.log(activeGames.get(joinCode).lobby);
            activeGames.get(joinCode).lobby.get(randomPlayer).turn = true;

            activeGames.get(joinCode).started = true;
            console.log(randomPlayer);

            activeGames.get(joinCode).lobby.forEach( (value, key) => {
                if (playerWS === key) {
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
 * @param {Object} card
 * Desc:
 * Allows players to play a card.
 */
export async function playCard(joinCode, playerWS, card){
    console.log("Play card");
    if (validatePlayerByWebSocket(joinCode, playerWS)) {
        let game = activeGames.get(joinCode);
        
        if (game.started === true) {
            if (game.lobby.get(playerWS).currentCard === card) {
                const result = await deckAPI.addPile(game.deck_id, card.code);
                game.lobby.get(playerWS).currentHand.unshift()
                game.lobby.get(playerWS).currentCard = game.lobby.get(playerWS).currentHand
            }
            
            game.lobby = setNextPlayerTurn(game.lobby, playerWs);

            activeGames.get(joinCode).lobby.get(randomPlayer).turn = true;

            activeGames.get(joinCode).started = true;
            console.log(randomPlayer);

            game.lobby.forEach( (value, key) => {
                key.send(JSON.stringify({
                    type: (playerWS === key)?"yourTurn":"playerTurn",
                    player: game.lobby.get(randomPlayer).id,
                }))

                key.send(JSON.stringify({
                    type: "placed",
                    card: card,
                }))
            });
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
        if (game.started === true) {
            const pile = await deckAPI.listPile(game.deck_id);
            const firstCard = pile[pile.length - 1];
            const secondCard = pile[pile.length - 2];
            if ((firstCard.value === secondCard.value) || (firstCard.suit === secondCard.suit)) {
                if (pile.length + game.lobby.get(playerWS) === 52) {
                    game.lobby.forEach( (value, key) => {
                        key.send(JSON.stringify({
                            type: "gameOver",
                            winner: game.lobby.get(playerWS).id,
                        }))
                    });
                } else {
                    const snapPot = await deckAPI.drawPile(game.deck_id, pile.length);
                    game.lobby.forEach( (value, key) => {
                        if (key === playerWS) {
                            key.send(JSON.stringify({
                                type: "youWinPot",
                                cards: snapPot,
                            }))
                        } else {
                            key.send(JSON.stringify({
                                type: "potWon",
                                player: game.lobby.get(playerWS).id,
                            }))
                        }
                        
                    });
                }
                
            }
        }
    }
}

function removePlayerByWebSocket(lobby, wss) {
    if (lobby.has(wss)) {
        lobby.forEach((value, key) => {
            key.send(JSON.stringify({
                type: "response",
                message: `Player ${lobby.get(wss).id} left game!`
            }))
        });
        lobby = setNextPlayerTurn(lobby, wss)
        lobby.delete(wss)
        
    }

    return lobby
}

function setNextPlayerTurn(lobby, currentPlayer) {
    if (lobby.has(wss)) {
        const playersWS = Array.from(lobby.keys());
        const playerIndex = (playersWS.findIndex(playerws => playerws == wss) + 1) % lobby.length

        lobby.forEach(player => player.turn = false);
        lobby.get(playersWS[playerIndex]).turn = true;
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