
const crypto = require("crypto");

let mysqlPool;

module.exports = (injectedMysqlPool) => {
  mysqlPool = injectedMysqlPool;

  return {
    register,
    getUser,
    isValidUser,
  };
};

function register(username, password, cbFunc) {
  console.log("here");
    let shaPass = crypto.createHash("sha256").update(password).digest("hex");
    console.log(shaPass);
  
    const query = `INSERT INTO users (username, user_password) VALUES ('${username}', '${shaPass}')`;
    console.log(query);
  
    mysqlPool.query(query, cbFunc);
  }

function getUser(username, password, cbFunc) {
    let shaPass = crypto.createHash("sha256").update(password).digest("hex");
  
    const getUserQuery = `SELECT * FROM users WHERE username = '${username}' AND user_password = '${shaPass}'`;
  
    mysqlPool.query(getUserQuery, (error, results) => {
      cbFunc(
        false,
        results && results.length === 1 ? results[0] : null
      );
    });
  }

  function isValidUser(username, cbFunc) {
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    console.log(query);
  
    const checkUserCbFunc = (error, results) => {
      const isValidUser = results ? results.length < 0 : null;
      console.log(error);
      console.log(isValidUser);
      cbFunc(error, isValidUser);
    };
  
    mysqlPool.query(query, checkUserCbFunc);
  }