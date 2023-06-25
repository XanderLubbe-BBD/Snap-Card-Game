const express = require("express");
const app = express();
const mysql = require("mysql2");

// app.get("/names", (req, res, next) => {
//     res.json(
//         {
//             status: "success",
//             names: ["Daelin", "Juan-Roux", "Anne-Mien", "Cameron"]
//         }
//     );
// });

app.listen(8082, () => {
    console.log("Server running on port 8082");
});

app.get("/history", (req, res) => {
    const playerEmail = req.query.email;
    const query = `SELECT playerId FROM playerInfo WHERE email = ?`;
    const validEMailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!query.match(validEMailPattern)) {
        return res.status(400).json({ err: "Please enter a valid email" });
    } else {
        mysql.query(query, [playerEmail], (err, rows, fields) => {
            if (!err) {
                res.status(200).send(rows);
            } else {
                console.log(err);
                res.status(400).send(fields);
            };
        });
    };
});

app.post("")