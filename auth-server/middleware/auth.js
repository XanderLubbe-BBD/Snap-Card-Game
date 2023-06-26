const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    const response = {valid : false, message : "A token is required for authentication"};
    res.status(401).json(response);
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    const response = {valid : false, message : "Invalid Token"};
    res.status(401).json(response);
  }
   next();
};

module.exports = verifyToken;