let userDB;

module.exports = (injectedUserDB) => {
    userDB = injectedUserDB;

    return {
        registerUser,
        login,
    };
};

function registerUser(req, res) {
    console.log(req.body);
    userDB.isValidUser(req.body.username, (error, isValidUser) => {
        console.log(error);
        console.log(isValidUser);
        if (error.error !== null || isValidUser !== null) {
            const message = error !== null
                ? "Something went wrong!"
                : "This user already exists!";

            sendResponse(res, message, error);

            return;
        } 

        userDB.register(req.body.username, req.body.password, (response) => {
            console.log(response);
            sendResponse(
                res,
                response.error === null ? "Success!!" : "Something went wrong!",
                response.error
            );
        });
    });
}

function login(query, res) {}

function sendResponse(res, message, error) {
    res.status(error !== undefined ? 400 : 200).json({
        message: message,
        error: error,
    });
}