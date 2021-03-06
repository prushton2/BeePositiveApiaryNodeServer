/*
This file is built to handle universal authentication commands (basically logging out)
The app routes to different files based on how the user is logging in.
*/

//used modules
const express = require("express")
const enc = require("../encryption.js")
const authManager = require("./auth/authManager.js")
const config = require("../../config/config.json")

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
    let sessionID = req.cookies.auth.split(":")[1]
    let userID = req.cookies.auth.split(":")[0]

    await authManager.deleteSession(sessionID, userID)

    res.cookie("auth", "", {maxAge: 10, httpOnly: true, sameSite: "strict", secure: config["environment"]["environment-type"] == "production"})
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

    let user = await Users.findOne({where: {ID: userID}})
    let allExtraMenuItems = {
        "user": [],
        "admin": [`<a href="${config["domain"]["frontend-url"]}/admin">Admin</a>`]
    }
    
    res.status(200)
    res.send({"response": user, "extraMenuItems": allExtraMenuItems[user.permissions]})
    
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


authRouter.post("/deleteAccount", async(req, res) => {
    if(!await enc.verifySession(req, res, "user")) {
        return
    }
    let userID = req.cookies.auth.split(":")[0]
    let sessionID = req.cookies.auth.split(":")[1]

    if(!await authManager.deleteAccount(userID, sessionID)) {
        res.status(301)
        res.send({"response": "Newer session ID required", "redirect": `${config}/login`})
        return
    }

    res.status(200)
    res.send({"response": "Account deleted"})
})