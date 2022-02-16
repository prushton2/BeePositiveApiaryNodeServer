const Database = require("@replit/database")
const db = new Database()
const crypto = require("crypto")


module.exports.reset = async() => {
  await db.set("orders", []).then(() => {});
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
  return module.exports.createHash();
}

module.exports.list = async(search) => {
  return await db.list(search).then((keys) => {return keys})
}

module.exports.getOrderByID = async(id) => {
  orders = await db.get("orders").then(value => {return value})
  for(var order in orders) {
    if(orders[order]["id"] == id) {
      return orders[order]
    }
  }
}

module.exports.editOrder = async(id, key, data) => {
  orders = await db.get("orders").then(value => {return value})

  for(let order in orders) {
    if(orders[order]["id"] == id) {
      orders[order][key] = data
    }
  }

  await db.set("orders", orders)
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