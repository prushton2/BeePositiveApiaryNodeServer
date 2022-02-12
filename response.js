module.exports.respond = function(status, response) {
  totalresponse = {
    "status": status,
    "response": response
  }

  return JSON.stringify(totalresponse)
}