var express = require("express");
var app = express();

app.get("/names", (req, res, next) => {
    res.json(
        {
            status: "success",
            names: ["Daelin", "Juan-Roux", "Anne-Mien", "Cameron"]
        }
    );
});

app.listen(8082, () => {
    console.log("Server running on port 8082");
});

