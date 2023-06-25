require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("./config/database");
const app = express();

app.use(express.json());


const cors = require("cors");
const corsOptions = {
  origin: ["http://localhost:8080", "http://localhost:8080"],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Register
app.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    const query = "SELECT * FROM users WHERE email = ?";
    pool.query(query, [email], async (error, results) => {
      if (error) {
        console.error("Error retrieving user:", error);
        return res.status(500).send("Internal Server Error");
      }

      if (results.length > 0) {
        return res.status(409).send("User Already Exist. Please Login");
      }

      let encryptedPassword = await bcrypt.hash(password, 10);

      const insertQuery =
        "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)";
      const insertValues = [first_name, last_name, email, encryptedPassword];

      pool.query(insertQuery, insertValues, (insertError) => {
        if (insertError) {
          console.error("Error creating user:", insertError);
          return res.status(500).send("Internal Server Error");
        }

        const user_id = results.insertId;

        const token = jwt.sign(
          { user_id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );

        const response = { token };

        return res.status(201).json(response);
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    const query = "SELECT * FROM users WHERE email = ?";
    pool.query(query, [email], async (error, results) => {
      if (error) {
        console.error("Error retrieving user:", error);
        return res.status(500).send("Internal Server Error");
      }

      if (results.length > 0) {
        const user = results[0];

        if (await bcrypt.compare(password, user.password)) {
          const token = jwt.sign(
            { user_id: user.id, email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );

          user.token = token;
          const response = { token };
          return res.status(200).json(response);
        }
      }

      return res.status(400).send("Invalid Credentials");
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
});

const auth = require("./middleware/auth");

app.get("/email", auth, (req, res) => {
  let response = { email: req.user.email };
  res.status(200).json(response);
});

app.get("/verify", auth, (req, res) => {
  let response = { valid: true };
  res.status(200).json(response);
});

module.exports = app;