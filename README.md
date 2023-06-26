# Snap (Card Game)
<br>
<hr>

## Game Info for Development

*This is just a rough idea of how I wanted this project to work. Feel free to add or change anything that doesn't make sense ☺️*

### Game Idea

This is a multi-player game (2 - 4 players). This app uses web sockets to allow players to join a game.

Once a game is started, a shuffled deck of cards is retrieved from the api and split between the players (this can be done by us on the server side or can be handled by the api, they have implemented "piles" to allow us to use the api to keep track of that).

One by one, the server will tell each player when it's their turn and they will be able to click or tap their deck to flip over the top card.

At any stage, any player can click or tap the "snap" button (or press a pre-defined key on the keyboard like spacebar) when the card that is flipped over matches the previous card. If the cards do match, the player to pressed "snap" first will get all the cards from the center added to the bottom of their "pile". If a player presses snap and the cards do not match, they will lose their next card (reducing the number of cards they have).

When a player runs out of cards, they can continue to play, but will not be able to place any cards down. They will need to try to press snap when the cards match to try and get more cards.

The game ends when only 1 player is left with any cards.

### The Various Parts

#### Server
The server will control the gameplay and manage communication between the players (clients).

#### App
The app is the front-end that the players will see on their browser. This is where they will see the cards and interact with the game. The app communicated with the server through web sockets.

#### API
The api is responsible for communicating with the database for registering users and storing scores and results. When a user is created, an api key will be generated for them which will then be used for all api calls to ensure only registed users can hit our endpoints.

#### Other info
Because our front-end and back-end communicate through web socket messages, I think it's best to have a common structure for the messages. I've created a `sample_websocket_messages.js` file which has the types of messages that will be sent between the front-end and back-end. As we go, we can just keep updating that so that everyone working on different parts can see the structure of the messages they need to send and can expect to receive.
<br><br><br><br><br><br><br><br>
<hr>


## Actual Readme for giving to other group

### Running locally

1. Run `npm install` in the "api" directory.
2. Run `npm install` in the "server" directory.
3. Run `npm install` in the "app" directory.
4. Run `npm install` in the "auth-server" directory.
5. Run `npm start` in the "api" directory.
6. Run `npm start` in the "server" directory.
7. Run `npm start` in the "app" directory.
8. Run `npm start` in the "auth-server" directory.
9. Open browser to [http://localhost:8080/](http://localhost:8080/)
