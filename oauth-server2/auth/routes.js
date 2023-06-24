const auth = require('./authenticator')

module.exports = (router, app, auth) => {
    router.post("/register", auth.registerUser);
    router.post("/login", app.oauth.grant(), auth.login);

    return router;
};