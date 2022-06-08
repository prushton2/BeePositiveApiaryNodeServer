//handles credential checks and hashing
const crypto = require("crypto")
const config = require("./config.js")
const configjson = require("../config/config.json")

const auth = require("./endpoints/auth.js")

const Sessions = require("../tables/Sessions.js")
const Users = require("../tables/Users.js")


module.exports.hash = (str) => {
    // I love hashing, and I am paranoid
    
    currenthash = crypto.createHmac('sha256', str).update("Normal Salt").digest("hex")
    
    for(i=0; i<10; i++) {
        currenthash = crypto.createHmac('sha256', str).update(currenthash).digest("hex")
    }

    return currenthash
}

module.exports.verifypassword = async(pswd) => {
  contents = await config.read()  
  return contents["auth"]["passwords"].indexOf(module.exports.hash(pswd)) >= 0
}

module.exports.verifySession = async(req, res, requiredRole) => {
    let sessionID
    let userID
    let body = req.body

    
    try { //why does this have to be so complicated?
        sessionID = body.auth.sessionID
        userID = body.auth.userID
        if(!sessionID || !userID) {
            throw "Missing sessionID or userID"
        }
    } catch {
        res.status(400)
        res.send({"response": "No Session Found"})
        return false
    }
    
    let session = await Sessions.findOne({where: {sessionID: sessionID, userID: userID}})
    
    if(session == null) {
        res.status(302)
        res.send({"response": "No Valid Session Found", "redirect": `${configjson["domain"]["frontend-url"]}/login`})
        return false
    }
    
    let user = await Users.findOne({where: {ID: userID}})

    if(session["expDate"] < new Date().getTime()) {
        await Sessions.destroy({where: {sessionID: sessionID, userID: userID}})
        res.status(302)
        res.send({"response": "Session Expired", "redirect": `${configjson["domain"]["frontend-url"]}/login`})
        return false
    }

    //if the user doesnt have the required permission, deny the action
    if(auth.roleHeirarchy.indexOf(requiredRole) > auth.roleHeirarchy.indexOf(user["permissions"])) {
        res.status(401)
        res.send({"response": "Insufficient Permissions"})
        return false
    }

    return true
}

module.exports.convertUrlEscapeCharacters = (string) => {
  charmap = 
  [[" ","%20"],
  ["$", "%24"],
  ["&", "%26"],
  ["`", "%60"],
  [":", "%3A"],
  ["<", "%3C"],
  [">", "%3E"],
  ["[", "%5B"],
  ["]", "%5D"],
  ["{", "%7B"],
  ["}", "%7D"],
  ['"', "%22"],
  ["+", "%2B"],
  ["#", "%23"],
  ["%", "%25"],
  ["@", "%40"],
  ["/", "%2F"],
  [";", "%3B"],
  ["=", "%3D"],
  ["?", "%3F"],
  ["\\","%5C"],
  ["^", "%5E"],
  ["|", "%7C"],
  ["~", "%7E"],
  ["‘", "%27"],
  [",", "%2C"]]

  charmap.forEach((element) => {
    try {
      while(string != string.replace(element[1], element[0])) {
        string = string.replace(element[1], element[0])
      }
    } catch {}
  })
  return string
}

module.exports.createHash = function(len=32) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let charactersLength = characters.length;
  for ( var i = 0; i < len; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}