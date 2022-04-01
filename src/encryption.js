const crypto = require("crypto")
const config = require("./config.js")

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

module.exports.createHash = function() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( var i = 0; i < 32; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}