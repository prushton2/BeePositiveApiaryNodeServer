//this file handles all the abstract functions to log in/out users.

//file variables
const expiryTime = 604800_000
const deleteExpiryTime = 60_000

//basic dependencies
const enc = require("../../verification.js")
const database = require("../../database.js");

//create user if it doesn't exist
module.exports.createUserIfNotExists = async(authID, authType, name, pfpUrl, email) => {


    let user = database.Users.exists({"authID": authID, "authType": authType});

    if(user == -1) {
        user = database.Users.create(
            ver.createHash(),
            {
                "authID": authID,
                "authType": authType,
                "name": name,
                "pfpURL": pfpUrl,
                "email": email,
                "permissions": "user"
            }
        );
    } else {
        user = database.Users.get(user);
    }
    return user
}

//deletes a session
module.exports.deleteSession = async(sessionID, userID) =>{
    let response = await Sessions.destroy({
        where: {
            sessionID: enc.hash(sessionID),
            userID: userID
        }
    })
    return response
}

//creates a new session
module.exports.createSession = async(userID) => {
    let date = new Date()
    let sid = enc.createHash(128)

    await Sessions.create({
        userID: userID,
        sessionID: enc.hash(sid),
        expDate: date.getTime() + expiryTime
    })
    return {
        "userID": userID,
        "sessionID": sid,
    }
}

module.exports.deleteAllSessions = async(userID) => {
    await Sessions.destroy({
        where: {
            userID: userID
        }
    })
}

module.exports.deleteAccount = async(userID, sessionID) => {
    if(!await enc.verifySessionWithTokens(userID, sessionID, "user")) {
        console.log("Invalid Session")
        return false
    }
    let date = new Date()
    let session = await Sessions.findOne({where: {sessionID: enc.hash(sessionID), userID: userID}})

    //the session must be made less than a minute ago to prove the user can sign in to their account before deletion
    
    if(date.getTime() < session.expDate - (expiryTime - deleteExpiryTime)) { 
        Users.destroy({where: {ID: userID} })
        this.deleteAllSessions(userID)
        return true
    } else {
        console.log("Session Expired")
        return false
    }

}