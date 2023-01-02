//handles credential checks and hashing stuff

const crypto = require("crypto");
// const config = require("./config.js");
const config = require("../config/config.json");

const auth = require("./endpoints/auth.js");
const database = require("./database.js");

//google auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = config["auth"]["GoogleOAuth2ClientID"]
const client = new OAuth2Client(config["auth"]["GoogleOAuth2ClientID"]);

module.exports.hash = (str) => { //10 time hashing because why not
    currenthash = crypto.createHmac('sha256', str).update("Normal Salt").digest("hex");
    
    for(i=0; i<10; i++) {
        currenthash = crypto.createHmac('sha256', str).update(currenthash).digest("hex");
    }

    return currenthash;
}

//"shorthand" version of verifySession (why is this here i dont remember using it ever)
module.exports.verifySessionWithTokens = async(userID, sessionID, requiredRole) => {
    return await module.exports.verifySession({cookies: {auth: `${userID}:${sessionID}`}}, {}, requiredRole, exitIfInvalid=false);
}

//verifies the user's session and makes sure they have the given permission
//this function is the backbone behind the entire security of the website

module.exports.verifySession = async(req, res, requiredRole, exitIfInvalid=true) => {
    let jwt = req.cookies.auth;
    let decoded;
    try {
        decoded = JSON.parse(Buffer.from(jwt.split(".")[1], "base64").toString("ascii"));
    } catch {
        if(exitIfInvalid) {
            res.status(400);
            res.send({"response": "No Session Found"});
        }
        return false;
    }

    let isValidJWT = await verifyJWT(jwt, decoded.sub);

    if(!isValidJWT) {
        if(exitIfInvalid) {
            res.status(400);
            res.send({"response": "No Valid Session Found"});
        }
        return false;
    }

    database.Users.load();
    
    if(database.Users.table[decoded.sub] == undefined) {
        await auth.createUserIfNotExists(
            decoded.sub,
            {
                name: decoded.name,
                email: decoded.email
            }
        );
    }

    if( auth.roleHeirarchy.indexOf(requiredRole) > auth.roleHeirarchy.indexOf( database.Users.table[decoded.sub].permissions )) {
        if(exitIfInvalid) {
            res.status(403);
            res.send({"response": "Insufficient Permissions"});
        }
        return false;
    }
    
    return true;

}

async function verifyJWT(jwt, originalID) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: jwt,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        return userid == originalID
    } catch (error) {
        console.log(`Nonfatal error verifying Google JWT: ${error}`)
        return false
    }
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