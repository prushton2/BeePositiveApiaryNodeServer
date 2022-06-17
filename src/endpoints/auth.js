/*
This file is built to handle universal authentication commands (basically logging out)
The app routes to different files based on how the user is logging in.
*/

//used modules
const express = require("express")
const enc = require("../encryption.js")
const authManager = require("./auth/authManager.js")

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

//-----------AUTH ENDPOINTS-----------
//logout user and delete session
authRouter.post("/logout", async(req, res) => {
    console.log("running")
    if(!await enc.verifySession(req, res, "user")) {
        return
    }
    console.log("passed auth")
    let sessionID = req.cookies.auth.split(":")[1]
    let userID = req.cookies.auth.split(":")[0]

    console.log(sessionID)
    console.log(userID)

    let opt = await authManager.deleteSession(enc.hash(sessionID), userID)
    console.log(opt)

    res.status(200)
    res.send({"response": "Logged out"})
})

authRouter.post("/logoutOfAll", async(req, res) => {
    if(!await enc.verifySession(req, res, "user")) {
        return
    }

    await authManager.deleteAllSessions(req.body.auth.userID)

    res.status(200)
    res.send({"response": "Logged out of all sessions"})
})

//for the logged in user to get their user info
authRouter.get("/getUser", async(req, res) => {
    if(!await enc.verifySession(req, res, "user")) {
        return
    }
    
    let userID = req.cookies.auth.split(":")[0]
    let sessionID = req.cookies.auth.split(":")[1]

    let session = await Sessions.findOne({where: {sessionID: enc.hash(sessionID), userID: userID}})
    if(session == null) {
        res.status(401)
        res.send({"response": "Invalid session"})
        return
    }
    let user = await Users.findOne({where: {ID: userID}})
    
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