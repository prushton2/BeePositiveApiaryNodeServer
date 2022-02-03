const Database = require("@replit/database")
const db = new Database()

module.exports.reset = async() => {
  await db.set("orders", []).then(() => {});
  await db.set("lastid", 0);
}


module.exports.append = async(order) => {
  orders = await db.get("orders").then((value) => {return value})
  orders.push(order)
  await db.set("orders", orders)
  return true
}

module.exports.get = async(key) => {
  return await db.get(key).then((value) => {return value})
}

module.exports.delete = async(key) => {
  await db.delete(key)
  return true
}

module.exports.overwrite = async(newData) => {
  await db.set("orders", newData)
  return true
}

module.exports.getID = async() => {
  lastid = await db.get("lastid").then((value) => {return value})
  newid = lastid+1
  await db.set("lastid", newid)
  return newid
}

module.exports.list = async(search) => {
  return await db.list(search).then((keys) => {return keys})
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
    while(string != string.replace(element[1], element[0])) {
      string = string.replace(element[1], element[0])
    }
  })
  return string
}