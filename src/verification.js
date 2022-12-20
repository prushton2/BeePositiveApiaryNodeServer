//handles credential checks and hashing stuff

const crypto = require("crypto");
const config = require("./config.js");
const configjson = require("../config/config.json");

const auth = require("./endpoints/auth.js");

const database = require("./database.js");


module.exports.hash = (str) => { //10 time hashing because why not
    currenthash = crypto.createHmac('sha256', str).update("Normal Salt").digest("hex");
    
    for(i=0; i<10; i++) {
        currenthash = crypto.createHmac('sha256', str).update(currenthash).digest("hex");
    }

    return currenthash;
}

//shorthand version of verifySession (why is this here i dont remember using it ever)
module.exports.verifySessionWithTokens = async(userID, sessionID, requiredRole) => {
    return await module.exports.verifySession({cookies: {auth: `${userID}:${sessionID}`}}, {}, requiredRole, exitIfInvalid=false);
}

//verifies the user's session and makes sure they have the given permission
//this function is the backbone behind the entire security of the website

module.exports.verifySession = async(req, res, requiredRole, exitIfInvalid=true) => {
    let sessionID;
    let userID;
    let authCookie = req.cookies.auth;

    if(authCookie) { //look for a session to read
        userID = authCookie.split(":")[0]; //split the session token into the userID and sessionID
        sessionID = authCookie.split(":")[1];
    } else { //if no session
        if(exitIfInvalid) { //exit the function
            res.status(400);
            res.send({"response": "No Session Found"});
        }
        return false;
    }
    
    let account = database.Users.get(userID)["table"];
    
    if(account == undefined) {
        if(exitIfInvalid) {
            res.status(400);
            res.send({"response": "No Valid User Found"});
        }
        return false;
    }


    if(account["sessions"].indexOf(sessionID) == -1) {
        if(exitIfInvalid) { //exit the function 
            res.status(302);
            res.send({"response": "No Valid Session Found", "redirect": `${configjson["domain"]["frontend-url"]}/login`});
        }
        return false;        
    }

    //if the user doesnt have the required permission, deny the action
    if(auth.roleHeirarchy.indexOf(requiredRole) > auth.roleHeirarchy.indexOf(account["permissions"])) {
        if(exitIfInvalid) {
            res.status(401);
            res.send({"response": "Insufficient Permissions"});
        }
        return false;
    }

	//If none of the guard clauses triggered, the user and the action are valid
    return true;
}

//creates a random hash string
module.exports.createHash = function(len=32) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let charactersLength = characters.length;
    for ( var i = 0; i < len; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}