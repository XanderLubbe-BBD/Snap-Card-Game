# Snap (Card Game)
<br>

## Running locally

### 1. Creating the databases

Create two mysql databases: one  for the game and one for authentication. <br/>
Run the following scripts to create the databases:

### 2. Adding environment variables

Add an `.env` file in the `api` folder containing the following: <br/> 

  HOST: your mysql hostname<br/>
  USER: your mysql username<br/>
  PASSWORD: your mysql password<br/>
  DATABASE: database for game <br/>
  AUTH_URL= http://localhost:4001 <br/> <br/>


Add an `.env` file in the `auth-server` folder containing the following: <br/>

HOST: your mysql hostname <br/>
USER: your mysql username<br/>
PASSWORD: your mysql password<br/>
DATABASE: database for authentication <br/>
TOKEN_KEY = enter any string without quotations here<br/>
API_PORT=4001 <br/>
APP_URL= http://localhost:8080 <br/>
API_URL= http://localhost:8082 <br/>
SERVER_URL= http://localhost:8081 <br/>

### 3. Installing dependencies

1. Run `npm install` in the "api" directory.
2. Run `npm install` in the "server" directory.
3. Run `npm install` in the "app" directory.
4. Run `npm install` in the "auth-server" directory.
5. Run `npm start` in the "api" directory.
6. Run `npm start` in the "server" directory.
7. Run `npm start` in the "app" directory.
8. Run `npm start` in the "auth-server" directory.
9. Open browser to [http://localhost:8080/](http://localhost:8080/)

<hr>





