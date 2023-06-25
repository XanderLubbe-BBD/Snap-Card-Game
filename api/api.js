const express = require("express");
const app = express();
const { pool } = require("./database");

app.listen(8082, () => {
    console.log("Server running on port 8082");
});


app.get("/history/:token",verifyEmail, (req, res) => {
    const playerEmail = res.locals.email;
    try{
    const query = `SELECT game_id, Game_Players.player_id, Players.username 
    FROM Game_Players 
    INNER JOIN Players 
    ON Players.player_id = Game_Players.player_id 
    WHERE game_id IN 
    (SELECT game_id FROM Game_Players 
        WHERE player_id = (SELECT player_id FROM Players WHERE email = ?))`;
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
    }
    catch{
        
    }
});


async function verifyEmail(req, res, next){
    const token = req.params.token;
    const result = await getAuth("email", token);
    res.locals.email = result.email;
    next();
}

const getAuth = async (url, header) => {
    try {
      const response = await fetch(`http://localhost:4001/${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token' : header,
        },
      });
      const json = await response.json();
  
      return json;
    } catch (error) {
      console.log(error);
    }
  };