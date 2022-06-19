//this handles all google auth management
const express = require("express")
const config = require("../../../config/config.json")
const enc = require("../../encryption.js")
const authManager = require("./authManager.js")

//google auth stuff
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = config["auth"]["GoogleOAuth2ClientID"]
const client = new OAuth2Client(config["auth"]["GoogleOAuth2ClientID"]);

const authGoogleRouter = express.Router()
module.exports = authGoogleRouter


authGoogleRouter.post("/login", async(req, res) => {
    // let date = new Date() //get date
    let jwt = req.body["JWT"] //get jwt from body
    let payload = jwt.split(".")[1] //get payload
    let decoded = Buffer.from(payload, "base64").toString("ascii")//decode payload
  
    //log out if already logged in
    if(await enc.verifySession(req, res, "user", false)) {
        let sid = req.cookies.auth.split(":")[1]
        let userID = req.cookies.auth.split(":")[0]
        await authManager.deleteSession(enc.hash(sid), userID)
    }


    let verified = await verify(jwt, JSON.parse(decoded)["sub"])//verify JWT

    if(!verified) {//if JWT is not verified
        res.status(401)
        res.send({"response": "Invalid JWT signature"})
        return
    }

    let userID = enc.hash(JSON.parse(decoded)["sub"])

    let userCreated = await authManager.createUserIfNotExists(
        userID,
        "google",
        JSON.parse(decoded)["name"],
        JSON.parse(decoded)["picture"],
        JSON.parse(decoded)["email"]
    )
    
    
    let sessionCreated = await authManager.createSession(userID)

    if(req.cookies.auth != null) { //delete the old session
        try {
            let act = req.cookies.auth.split(":")[0]
            let sid = req.cookies.auth.split(":")[1]
            await auth.deleteSession(sid, act)
        } catch {}
    }

    res.status(200)



    res.cookie("auth", userID + ":" + sessionCreated.sessionID, 
    {
        maxAge: 1000 * 60 * 60 * 24 * 7, 
        httpOnly: true, 
        sameSite: "strict", 
        secure: config["environment"]["environment-type"] == "production" //if in production, set secure to true, else use false so it can be accessed from localhost
    })
    res.send({
        "response": {
            "authToken": {
                "sessionID": sessionCreated["sessionID"], 
                "userID": sessionCreated["userID"],
                "expDate": sessionCreated["expDate"]
            },
            "userCreated": userCreated
        } 
    })
})

//verifies the google JWT
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
        console.log(`Nonfatal error verifying Google JWT: ${error}`)
        return false
    }
}