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
  
    let verified = await verify(jwt, JSON.parse(decoded)["sub"])//verify JWT

    if(!verified) {//if JWT is not verified
        res.status(401)
        res.send({"response": "Invalid JWT signature"})
        return
    }

    
    // let user = await Users.findOne({where: {authID: enc.hash(JSON.parse(decoded)["sub"]), authType: "google"}})

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
    res.cookie('cookieName', "value", {expires: new Date() + 99999, maxAge: 99999, path: '/'});
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
        console.log(`Nonfatal error verifying JWT: ${error}`)
        return false
    }
}