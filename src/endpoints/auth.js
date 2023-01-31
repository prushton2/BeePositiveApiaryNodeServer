/*
This file is built to handle universal authentication commands (basically just logging out)
The app routes to different files based on how the user is logging in.
*/

//used modules
const express = require("express")
const ver = require("../verification.js")
const config = require("../../config/config.json")
const jwtdecode = require("jwt-decode");

const database = require("../database.js");


//this router
const authRouter = express.Router()

module.exports = authRouter
module.exports.roleHeirarchy = ["user", "admin"]


//-----------AUTH ENDPOINTS-----------
//for the logged in user to get their user info
authRouter.get("/getUser", async(req, res) => {
    if(!await ver.verifySession(req, res, "user")) {
        return
    }

    let userID = jwtdecode(req.cookies.auth).sub;

    let user = database.Users.get(userID);
    user["table"]["ID"] = user["primaryKey"];

    res.status(200);
    res.send({"response": user["table"]});
    
})

authRouter.post("/getUser", async(req, res) => {
	req.cookies.auth = req.body.auth;
	if(!await ver.verifySession(req, res, "user")) {
        return
    }
	
    let userID = jwtdecode(req.body.auth).sub;

    let user = database.Users.get(userID);
    user["table"]["ID"] = user["primaryKey"];

    res.status(200);
    res.send({"response": user["table"]});
})

//getting all users, for admin use
authRouter.post("/getUsers", async(req, res) => {
    if(!await ver.verifySession(req, res, "admin")) {
        return
    }
    let users = await database.Users.findAll({});
    res.status(200)
    res.send({"response": users})
})


authRouter.post("/deleteAccount", async(req, res) => {
    if(!await ver.verifySession(req, res, "user")) {
        return
    }
    let userID = req.cookies.auth.split(":")[0]
    let sessionID = req.cookies.auth.split(":")[1]

    // if(!await authManager.deleteAccount(userID, sessionID)) {
    //     res.status(301)
    //     res.send({"response": "Newer session ID required", "redirect": `${config}/login`})
    //     return
    // }

    res.status(200)
    res.send({"response": "Account deleted"})
})

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