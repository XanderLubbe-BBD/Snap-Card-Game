require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

const User = require("./model/user");

const cors=require("cors");
const corsOptions ={
   origin:['http://localhost:8080', 'http://localhost:8080'],
   credentials:true,            
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) 

// Register
app.post("/register", async (req, res) => {

    try {
      const { first_name, last_name, email, password } = req.body;
  
      if (!(email && password && first_name && last_name)) {
        res.status(400).send("All input is required");
      }
  
      const oldUser = await User.findOne({ email });
  
      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }
  
      let encryptedPassword = await bcrypt.hash(password, 10);
  
      const user = await User.create({
        first_name,
        last_name,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
      });
  
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;
      let response = {"token" : user.token};
  
      // return new user
      res.status(201).json(response);
    } catch (err) {
      console.log(err);
    }
  });

// Login
app.post("/login", async (req, res) => {

    try {
      const { email, password } = req.body;
  
      if (!(email && password)) {
        res.status(400).send("All input is required");
      }

      const user = await User.findOne({ email });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email},
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
  
        // save user token
        user.token = token;
        let response = {"token" : user.token};
  
        // user
        res.status(200).json(response);
      }
      res.status(400).send("Invalid Credentials");
    } catch (err) {
      console.log(err);
    }
  });

const auth = require("./middleware/auth");

app.get("/email", auth, (req, res) => {
  let response = {"email" : req.user.email};
  res.status(200).json(response);
});

module.exports = app;