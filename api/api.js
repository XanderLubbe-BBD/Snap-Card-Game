const express = require("express");
const app = express();
const { pool } = require("./database");
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.listen(8082, () => {
    console.log("Server running on port 8082");
});

app.get("/history/:token", verifyEmail, (req, res, next) => {
    const playerEmail = res.locals.email;
    try {
        const query = `SELECT Players.username, Game_Players.game_id, (SELECT DISTINCT username FROM .Players INNER JOIN .Games ON Players.player_id = Games.winner_id WHERE player_id = (SELECT DISTINCT winner_id FROM .Game_Players WHERE player_id = (SELECT player_id FROM .Players WHERE email = ?))) as Winner
        FROM .Game_Players
        INNER JOIN .Players ON Players.player_id = Game_Players.player_id
        INNER JOIN .Games ON Games.game_id = Game_Players.game_id
        WHERE Game_Players.game_id IN (
          SELECT game_id
          FROM .Game_Players
          WHERE player_id = (
            SELECT player_id
            FROM Players
            WHERE email = ?
          )
        );`;



        pool.query(query, [playerEmail, playerEmail], (err, rows, fields) => {
            if (!err) {
                let obj = [];
                let gameIds = [];
                rows.forEach((row) => {
                    if (gameIds.includes(row.game_id)) {
                        obj.forEach((item) => {
                            if (item.game_id == row.game_id) {
                                item.players.push(row.username);
                            }
                        });
                    } else {
                        let newObj = {
                            game_id: row.game_id,
                            players: [row.username],
                            winner: row.winner_username,
                        };
                        obj.push(newObj);
                        gameIds.push(row.game_id);
                    }
                });
                res.status(200).send(obj);
            } else {
                console.log(err);
                res.status(400).send(fields);
            }
        });
    } catch (err) {
        next(err);
    }
});

app.get("/info/:token", verifyEmail, (req, res) => {
    console.log("Getting info");
    const playerEmail = res.locals.email;
    console.log(`Email: ${playerEmail}`);
    try {
        const query = `SELECT username, email FROM Players WHERE email = ?`;
        console.log(`Running SQL Query: ${query.replace('?', `'${playerEmail}'`)}`);
        pool.query(query, [playerEmail], (err, rows, fields) => {
            if (!err) {
                console.log(rows);
                const response = { username: rows[0].username, email: rows[0].email, valid: true }
                res.status(200).send(response);
            } else {
                console.log(err);
                res.status(400).send(fields);
            };
        });
    }
    catch {

    }
});

app.get("/register/:token", verifyAndRetrieveUser, (req, res) => {
    const playerEmail = res.locals.email;
    const userName = res.locals.firstName + ' ' + res.locals.lastName;
    try {
        const query = `INSERT INTO Players(username, email) VALUES (?, ?)`;
        pool.query(query, [userName, playerEmail], (err, rows, fields) => {
            if (!err) {
                console.log(rows);
                const response = { email: rows.email }
                res.status(200).send(response);
            } else {
                console.log(err);
                res.status(400).send(fields);
            };
        });
    }
    catch (error) {
    }
})

async function verifyAndRetrieveUser(req, res, next) {
    const token = req.params.token;
    const result = await getAuth("user", token);
    res.locals.email = result.email;
    res.locals.firstName = result.firstName;
    res.locals.lastName = result.lastName;
    console.log(result);
    next();
}

async function verifyEmail(req, res, next) {
    const token = req.params.token;
    const result = await getAuth("email", token);
    res.locals.email = result.email;
    next();
}

const getAuth = async (url, header) => {
    try {
        const response = await fetch(`${process.env.AUTH_URL}/${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': header,
            },
        });
        const json = await response.json();

        return json;
    } catch (error) {
        console.log(error);
    }
};


app.post('/gameResults', (req, res) => {
    const players = req.body.player;
    const winner = req.body.winner;

    console.log(`Winner: ${winner}`);

    if (players.length < 2) {
        res.status(400).json({ success: false, error: 'At least 2 players are required.' });
        return;
    }

    const gameQuery = 'INSERT INTO Games (winner_id) VALUES ((SELECT player_id FROM Players WHERE email = ?))';
    pool.query(gameQuery, [winner], (error, results) => {
        if (error) {
            console.error('Error inserting game:', error);
            res.status(500).send({ success: false });
            return;
        }

        const gameId = results.insertId;

        let placeholders = '';
        const values = [];

        for (let i = 0; i < players.length; i++) {
            placeholders += '(?, (SELECT player_id FROM Players WHERE email = ?)), ';
            values.push(gameId, players[i]);
        }

        placeholders = placeholders.slice(0, -2);

        const gamePlayersQuery =
            `INSERT INTO Game_Players (game_id, player_id) VALUES ${placeholders}`;

        pool.query(gamePlayersQuery, values, (error) => {
            if (error) {
                console.error('Error inserting game players:', error);
                res.status(500).send({ success: false });
                return;
            }

            res.status(200).send({ success: true });
        });
    });
});