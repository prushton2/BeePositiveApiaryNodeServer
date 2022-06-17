//this file handles all the abstract functions to log in/out users.

//basic dependencies
const enc = require("../../encryption.js")
const Sessions = require("../../../tables/Sessions.js")
const Users = require("../../../tables/Users.js")

//create user if it doesn't exist
module.exports.createUserIfNotExists = async(authID, authType, name, pfpUrl, email) =>{
    let user = await Users.findOne({where: {authID: authID, authType: authType}})
    if(user == null) {
        await Users.create({
            ID: enc.createHash(),
            authID: authID,
            authType: authType,
            name: name,
            pfpURL: pfpUrl,
            email: email,
            permissions: "user"
        })
    }
    return user == null
}

//deletes a session
module.exports.deleteSession = async(sessionID, userID) =>{
    let response = await Sessions.destroy({
        where: {
            sessionID: sessionID,
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
        expDate: date.getTime() + 604800
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