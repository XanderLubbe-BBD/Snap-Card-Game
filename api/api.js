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

app.get("/info/:token", verifyEmail, (req, res) => {
    console.log("Getting info");
    const playerEmail = res.locals.email;
    console.log(`Email: ${playerEmail}`);
    try{
        const query = `SELECT username FROM Players WHERE email = ?`;
        console.log(`Running SQL Query: ${query.replace('?', `'${playerEmail}'`)}`);
        pool.query(query, [playerEmail], (err, rows, fields) => {
            if (!err) {
                console.log(rows);
                const response = {email: rows.email}
                res.status(200).send(response);
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
      const response = await fetch(`${process.env.AUTH_URL}/${url}`, {
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