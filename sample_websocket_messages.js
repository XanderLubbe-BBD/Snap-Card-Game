// THis is just to help us during development so people working on different parts can see what messages are expected
// Define the structure of messages passed between front-end and back-end

// front-end to back-end
const placeCard = {
    "type": "place",
    // may not be required, server should know what everyones cards are and which is next for each player
    "card": {
        "code": "6H",
        "image": "https://deckofcardsapi.com/static/img/6H.png",
        "images": {
            "svg": "https://deckofcardsapi.com/static/img/6H.svg",
            "png": "https://deckofcardsapi.com/static/img/6H.png"
        },
        "value": "6",
        "suit": "HEARTS"
    }
}

const callSnap = {
    "type": "snap",
    "timestamp": "2020-01-01T00:00:00.000Z" // perhaps optional, server should see which was first but maybe just in case
}

// back-end to front-end
const yourTurn = {
    "type": "yourTurn"
}

const playerTurn = {
    "type": "playerTurn",
    "player": 2 // id of player whose turn it is
}

const cardPlaced = {
    "type": "placed",
    "card": {
        "code": "6H",
        "image": "https://deckofcardsapi.com/static/img/6H.png",
        "images": {
            "svg": "https://deckofcardsapi.com/static/img/6H.svg",
            "png": "https://deckofcardsapi.com/static/img/6H.png"
        },
        "value": "6",
        "suit": "HEARTS"
    },
    "player": 1 // id of player who placed a card
}

const youWinPot = {
    "type": "youWinPot",
    // may not be required if card data is only on the server (should be otherwise players and can potentially see their upcoming cards)
    "cards": [
        {
            "code": "6H",
            "image": "https://deckofcardsapi.com/static/img/6H.png",
            "images": {
                "svg": "https://deckofcardsapi.com/static/img/6H.svg",
                "png": "https://deckofcardsapi.com/static/img/6H.png"
            },
            "value": "6",
            "suit": "HEARTS"
        },
        {
            "code": "5S",
            "image": "https://deckofcardsapi.com/static/img/5S.png",
            "images": {
                "svg": "https://deckofcardsapi.com/static/img/5S.svg",
                "png": "https://deckofcardsapi.com/static/img/5S.png"
            },
            "value": "5",
            "suit": "SPADES"
        }
    ]
}

const potWon = {
    "type": "potWon",
    "player": 1 // id of player that won
}

const gameOver = {
    "type": "gameOver",
    "winner": 1 // id of player that won
}