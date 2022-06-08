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
    if(!await enc.verifySession(req, res, "user")) {
        return
    }

    await authManager.deleteSession(req.body.auth.sessionID, req.body.auth.userID)

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