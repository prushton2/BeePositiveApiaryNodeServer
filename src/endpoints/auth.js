/*
This file is built to handle logging in/out of the application.
The app routes to different files based on how the user is logging in. Once logged in,
this file handles all session management.
*/

//used modules
const express = require("express")
const config = require("../../config/config.json")
const enc = require("../encryption.js")

//used tables
const Users = require("../../tables/Users.js")
const Sessions = require("../../tables/Sessions.js")

//this router
const authRouter = express.Router()

//outgoing routes
const googleRoute = require("./auth/google.js")

module.exports = authRouter
module.exports.roleHeirarchy = ["user", "admin"]


//routers
authRouter.use("/google", googleRoute)

authRouter.get("/", async(req, res) => {
    res.send("Hello World")
})
//-----------AUTH FUNCTIONS-----------
//create user if it doesn't exist
async function createUserIfNotExists(authID, authType, name, pfpUrl, email) {
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
async function deleteSession(sessionID, userID) {
    await Sessions.destroy({
        where: {
            sessionID: sessionID,
            userID: userID
        }
    })
}

//creates a new session
async function createSession(userID) {
    let date = new Date()
    let session = await Sessions.create({
        userID: userID,
        sessionID: enc.createHash(128),
        expDate: date.getTime() + 7776000
    })
    return session
}

//-----------AUTH ENDPOINTS-----------
//logout user and delete session
authRouter.post("/logout", async(req, res) => {
    if(!await enc.verifySession(req, res, "user")) {
        return
    }

    await deleteSession(req.body.auth.sessionID, req.body.auth.userID)

    res.status(200)
    res.send({"response": "Logged out"})
})




//for the logged in user to get their user info
authRouter.post("/getUser", async(req, res) => {
    if(!await enc.verifySession(req, res, "user")) {
        return
    }
    
    let session = await Sessions.findOne({where: {sessionID: req.body.auth.sessionID, userID: req.body.auth.userID}})
    if(session == null) {
        res.status(401)
        res.send({"response": "Invalid session"})
        return
    }
    let user = await Users.findOne({where: {ID: req.body.auth.userID}})
    
    res.status(200)
    res.send({"response": user})
    
})


//getting all users, for admin use
authRouter.post("/getUsers", async(req, res) => {
    if(!await enc.verifySession(req, res, "admin")) {
        return
    }
    let users = await Users.findAll()
    res.status(200)
    res.send({"response": users})
})