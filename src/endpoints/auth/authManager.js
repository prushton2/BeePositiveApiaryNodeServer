//this file handles all the abstract functions to log in/out users.

//file variables
const expiryTime = 604800_000
const deleteExpiryTime = 60_000

//basic dependencies
const ver = require("../../verification.js")
const database = require("../../database.js");

//create user if it doesn't exist
module.exports.createUserIfNotExists = async(sub, object) => {


    let user = database.Users.table[sub];

    if(user == undefined) {
        user = database.Users.create(
            sub,
            {
                "name": object.name,
                "email": object.email,
                "permissions": "user",
            }
        );
    } else {
        user = database.Users.get(user);
    }
    return user
}

//deletes a session
module.exports.deleteSession = async(sessionID, userID) =>{
    let user = database.Users.get(userID);

    user["table"]["sessions"].splice(user["table"]["sessions"].indexOf(sessionID), 1);

    database.Users.set(userID, {"sessions": user["table"]["sessions"]})

}

//creates a new session
module.exports.createSession = async(userID) => {
    let date = new Date()
    let sid = ver.createHash(128)

    let user = database.Users.get(userID);
    user["table"]["sessions"].push(sid);
    database.Users.set(userID, {"sessions": user["table"]["sessions"]});

    return {
        "userID": userID,
        "sessionID": sid,
    }
}

module.exports.deleteAllSessions = async(userID) => {
    database.Users.set(userID, {"sessions": []});
}

module.exports.deleteAccount = async(userID, sessionID) => {
    return false;
/*         Need a new way to do this - will do when frontend is in a better state
    if(!await ver.verifySessionWithTokens(userID, sessionID, "user")) {
        console.log("Invalid Session");
        return false;
    }
    let date = new Date();
    let session = await Sessions.findOne({where: {sessionID: ver.hash(sessionID), userID: userID}})

    //the session must be made less than a minute ago to prove the user can sign in to their account before deletion
    
    if(date.getTime() < session.expDate - (expiryTime - deleteExpiryTime)) { 
        Users.destroy({where: {ID: userID} })
        this.deleteAllSessions(userID)
        return true
    } else {
        console.log("Session Expired")
        return false
    }
*/
}