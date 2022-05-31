const express = require("express")
const config = require("../../config/config.json")
const enc = require("../encryption.js")

const Users = require("../../tables/Users.js")
const Sessions = require("../../tables/Sessions.js")

const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = config["auth"]["OAuth2ClientID"]
const client = new OAuth2Client(config["auth"]["OAuth2ClientID"]);

const authRouter = express.Router()

module.exports = authRouter

module.exports.roleHeirarchy = ["user", "admin"]

authRouter.get("/", async(req, res) => {
    res.send("Hello World")
})

authRouter.post("/login", async(req, res) => {
    
    let date = new Date()
    let jwt = req.body["JWT"]
    let payload = jwt.split(".")[1]
    let decoded = Buffer.from(payload, "base64").toString("ascii")
  
    let verified = await verify(jwt, JSON.parse(decoded)["sub"])

    if(!verified) {
        res.status(401)
        res.send({"response": "Invalid JWT signature"})
        return
    }

    let userCreated = await createUserIfNotExists(enc.hash(JSON.parse(decoded)["sub"]), "google", JSON.parse(decoded))
    let user = await Users.findOne({where: {authID: enc.hash(JSON.parse(decoded)["sub"]), authType: "google"}})
    let sessionCreated = await Sessions.create({
        userID: user["ID"],
        sessionID: enc.createHash(),
        expDate: date.getTime() + 7776000
    })

    if(req.body.oldSession != null) { //delete the old session
        deleteSession(req.body.oldSession.sessionID, req.body.oldSession.userID)
    }


    let authToken = {
        "sessionID": sessionCreated["sessionID"], 
        "userID": sessionCreated["userID"],
        "expDate": sessionCreated["expDate"]
    }
    res.status(200)
    res.send({
        "response": {
            "authToken": authToken,
            "userCreated": userCreated
        } 
    })
})

async function verify(jwt, originalID) {
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
        console.log(`Nonfatal error verifying JWT: ${error}`)
        return false
    }
}

async function createUserIfNotExists(authID, authType, JWT) {
    let user = await Users.findOne({where: {authID: authID, authType: authType}})
    if(user == null) {
        await Users.create({
            ID: enc.createHash(),
            authID: authID,
            authType: authType,
            name: JWT["name"],
            pfpURL: JWT["picture"],
            email: JWT["email"],
            permissions: "user"
        })
    }
    return user == null
}

authRouter.post("/logout", async(req, res) => {
    if(!await enc.verifySession(req, res, "user")) {
        return
    }

    await deleteSession(req.body.auth.sessionID, req.body.auth.userID)

    res.status(200)
    res.send({"response": "Logged out"})
})


async function deleteSession(sessionID, userID) {
    await Sessions.destroy({
        where: {
            sessionID: sessionID,
            userID: userID
        }
    })
}


authRouter.post("/getUsers", async(req, res) => {
    if(!await enc.verifySession(req, res, "admin")) {
        return
    }
    let users = await Users.findAll()
    res.status(200)
    res.send({"response": users})
})

