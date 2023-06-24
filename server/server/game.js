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
export async function leaveGame(joinCode, playerWS){
    if (validatePlayerByWebSocket(joinCode, playerWS)) {
        const game = activeGames.get(joinCode);
        if (game.started === true) {
            const playerLeft = game.lobby.get(playerWS);
            const result = await deckAPI.addCard(game.deck_id, game.lobby.get(playerWS).currentHand);
            activeGames.get(joinCode).lobby = removePlayerByWebSocket(game.lobby, playerLeft);
        }
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
            const numCard = Math.floor(52 / game.lobby.size);

            for (let [playerSocket, player] of activeGames.get(joinCode).lobby.entries()) {
                let currentHand = null;
                if (game.lobby.size === 3 && playerSocket === randomPlayer) {
                    currentHand = await deckAPI.drawDeck(game.deck_id, numCard + 1);
                } else {
                    currentHand = await deckAPI.drawDeck(game.deck_id, numCard);
                }

                player.turn = false;
                player.currentHand = currentHand.cards;
            }

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

            activeGames.get(joinCode).lobby.get(playerWS).currentHand.shift();
            game.lobby.forEach( (value, key) => {
                key.send(JSON.stringify({
                    type: "placed",
                    card: card,
                    player: game.lobby.get(playerWS).id,
                }))
            })
                
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
                                activeGames.get(joinCode).lobby.get(playerWS).currentHand = snapPot;
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
                            });
                        }
                    }
                });
            }
        }
    }
}

function removePlayerByWebSocket(lobby, wss) {
    if (lobby.has(wss)) {
        const playerLeft = lobby.get(wss)
        lobby.forEach((value, key) => {
            key.send(JSON.stringify({
                type: "leave",
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
        const playersWS = Array.from(lobby.keys());
        const playerIndex = (playersWS.findIndex(playerws => playerws === currentPlayer) + 1) % lobby.size

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