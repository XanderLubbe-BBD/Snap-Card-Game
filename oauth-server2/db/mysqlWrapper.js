const mysql = require("mysql");

const pool = mysql.createPool({
    user: "root",
    host: "localhost",
    database: "snap_oauth2",
    password: "yourPassword",
    port: 3306, // MySQL default port is 3306
  });
  
  function query(queryString, cbFunc) {
    pool.getConnection((error, connection) => {
      if (error) {
        cbFunc(setResponse(error, null));
      } else {
        connection.query(queryString, (error, results) => {
          connection.release();
          cbFunc(setResponse(error, results));
        });
      }
    });
  }

  function setResponse(error, results) {
    return {
      error: error,
      results: results ? results : null,
    };
  }

  module.exports = {
    query,
  };

  