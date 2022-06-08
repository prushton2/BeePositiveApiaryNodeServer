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
    await Sessions.destroy({
        where: {
            sessionID: sessionID,
            userID: userID
        }
    })
}

//creates a new session
module.exports.createSession = async(userID) => {
    let date = new Date()
    let session = await Sessions.create({
        userID: userID,
        sessionID: enc.createHash(128),
        expDate: date.getTime() + 7776000
    })
    return session
}

module.exports.deleteAllSessions = async(userID) => {
    await Sessions.destroy({
        where: {
            userID: userID
        }
    })
}