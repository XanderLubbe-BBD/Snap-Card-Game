const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
});

pool.connect(function(err) {
  if (err) throw err;
  console.log("Database successfully connected!");
});

module.exports = {
    pool
}