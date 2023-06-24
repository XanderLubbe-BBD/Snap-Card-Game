let mysqlPool;

module.exports = (injectedMysqlPool) => {
  mysqlPool = injectedMysqlPool;

  return {
    saveAccessToken,
    getUserIDFromBearerToken,
  };
};

function saveAccessToken(accessToken, userID, cbFunc) {
    const query = `INSERT INTO access_tokens (access_token, user_id) VALUES ('${accessToken}', ${userID});`;
  
    mysqlPool.query(query, (error) => {
      cbFunc(error);
    });
  }

  function getUserIDFromBearerToken(bearerToken, cbFunc) {
    const query = `SELECT * FROM access_tokens WHERE access_token = '${bearerToken}';`;
  
    mysqlPool.query(query, (error, results) => {
      const userID =
        results && results.length === 1 ? results[0].user_id : null;
  
      cbFunc(userID);
    });
  }