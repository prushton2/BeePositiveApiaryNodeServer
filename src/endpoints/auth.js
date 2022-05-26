const express = require("express")
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
// const jwt     = require("jsonwebtoken")

const authRouter = express.Router()

module.exports = authRouter


authRouter.get("/", (req, res) => {
    res.send("Hello World")
})

authRouter.post("/login", (req, res) => {
    let date = new Date()

    let jwt = req.body["JWT"]
    let payload = jwt.split(".")[1]

    let verified = true //jwt.verify()

    if(!verified) {
        res.status(401)
        res.send({"response": "Invalid JWT signature"})
        return
    }

    let decoded = Buffer.from(payload, "base64").toString("ascii")

    console.log("-----JWT-----")
    console.log(req.body["JWT"])
    console.log("-----DECODED-----")
    console.log(decoded)



    let authToken = {
        "SID": 0, 
        "userID": 0, 
        "expDate": date.getTime() + 7776000
    }
    res.send({"response": authToken})
})

async function verify() {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
}