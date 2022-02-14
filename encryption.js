const crypto = require("crypto")
passwords = [
  "15ac60994616bb996ca08cdc4042927f032af8245485d5893388be83a16abf79",
  "ad78260290f15b98b5a1e0eb9587545c2653f7ff2bc9dd5ceb432775fea9296c",
]
module.exports.hash = (str) => {
  // I love hashing, and I am paranoid
  
  currenthash = crypto.createHmac('sha256', str).update("Normal Salt").digest("hex")
  
  for(i=0; i<10; i++) {
    currenthash = crypto.createHmac('sha256', str).update(currenthash).digest("hex")
  }

  return currenthash
}

module.exports.verifypassword = (pswd) => {
  return passwords.indexOf(module.exports.hash(pswd)) >= 0
}