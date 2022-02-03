const crypto = require("crypto")
passwords = [
  "d0cc333979497e7263f6288c1aacd6f2cdc659e9efad861265095b7db9060e6a",
  "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
]
module.exports.hash = (str) => {
  return crypto.createHash('sha256').update(str).digest('hex');
}

module.exports.verifypassword = (pswd) => {
  return passwords.indexOf(module.exports.hash(pswd)) >= 0
}