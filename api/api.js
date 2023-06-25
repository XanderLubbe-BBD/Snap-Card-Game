const express = require("express");
const app = express();
const { pool } = require("./database");

app.listen(8082, () => {
    console.log("Server running on port 8082");
});

app.get("/history", (req, res) => {
    const playerEmail = req.query.email;
    const query = `SELECT game_id, game_players.player_id, players.username FROM Game_Players INNER JOIN players ON players.player_id = game_players.player_id WHERE game_id IN (SELECT game_id FROM Game_Players WHERE player_id = (SELECT player_id FROM players WHERE email = ?))`;
    pool.query(query, [playerEmail], (err, rows, fields) => {
        if (!err) {
            let obj = [];
            let gameIds = [];
            rows.forEach(row => {
                if(gameIds.includes(row.game_id)){
                    obj.forEach(item => {
                        if(item.game_id == row.game_id){
                            item.players.push(row.username);
                        }
                    });
                } else {
                    let newObj = {
                        game_id: row.game_id,
                        players: [row.username]
                    }
                    obj.push(newObj);
                    gameIds.push(row.game_id);
                }
            })
            res.status(200).send(obj);
        } else {
            console.log(err);
            res.status(400).send(fields);
        };
    });
});

