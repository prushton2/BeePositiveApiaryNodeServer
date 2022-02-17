const http = require('http');
const db = require('./database.js');
const enc = require('./encryption.js');
const rsp = require('./response.js');

const cors = require("cors")
const express = require("express");
const app = express();
const port = 3000

app.use(cors({
  origin: "*"
}));

app.get('/add/*', async(req, res) => {
  url = req.url.split("/").slice(2)

  id = await db.getID()
  password = await db.getID()
  
  order = {
    "items": db.convertUrlEscapeCharacters(url[0]),
    "date" : db.convertUrlEscapeCharacters(url[1]),
    "email": db.convertUrlEscapeCharacters(url[2]),
    "name" : db.convertUrlEscapeCharacters(url[3]),
    "isComplete": false,
    "id": id,
    "password": enc.hash(password)
  }

  db.append(order)
  res.end(rsp.respond("200", {"ID": id, "password": password}))

})

app.get("/get/*", async(req, res) => {
  url = req.url.split("/").slice(2)

  if(enc.verifypassword(url[0])) {
    res.end(rsp.respond("200", await db.get(url[1])))
  } else {
    res.end(rsp.respond("400", {}))
  }

})

app.get("/complete/*", async(req, res) => {
  url = req.url.split("/").slice(2)

  haschanged = false

  if(!enc.verifypassword(url[0])) { //cancel if password is fake
    res.end(rsp.respond("400", {}))
    return
  }

  orders = await db.get("orders")
  for(var order in orders) {
    if(orders[order]["id"] == url[1]) {
      orders[order]["isComplete"] = url[2] == 'true'
      haschanged = true
    }
  }

  if(!haschanged) {
    res.end(rsp.respond("400", {}))
  }

  await db.overwrite(orders)
  res.end(rsp.respond("200", {}))

  
})

app.get("/delete/*", async(req, res) => {
  url = req.url.split("/").slice(2)


  order = await db.getOrderByID(url[1])


  if(!(enc.verifypassword(url[0]) || order["password"] == enc.hash(url[0]))) { //If either the master password is given or the order specific password is given, delete order. Else respond with 400.
    res.end(rsp.respond("400", {}))
    return
  }

  orders = await db.get("orders")

  for(var order in orders) {

    if(orders[order]["id"] == url[1]) {
      orders.splice(order, 1)
      db.overwrite(orders)

      res.end(rsp.respond("200"), {})
      return
    }
  }


  res.end(rsp.respond("400", {}))
})

app.get("/getorder/*", async(req, res) => {
  url = req.url.split("/").slice(2)
  
  order = await db.getOrderByID(url[0])

  if(enc.hash(url[1]) != order["password"]) { //respond if password is valid
    res.end(rsp.respond("400", {}))
    return
  }

  res.end(rsp.respond("200", order))
})

app.get("/setorder/*", async(req, res) => {
  url = req.url.split("/").slice(2)
  
  order = await db.getOrderByID(url[0])
  
  if(enc.hash(url[1]) != order["password"]) { //Continue if password verified
    res.end(rsp.respond("400", {}))
    return
  }

  await db.editOrder(url[0], "items", db.convertUrlEscapeCharacters(url[2]))
  await db.editOrder(url[0], "isComplete", false)
  order = await db.getOrderByID(url[0])
  res.end(rsp.respond("200", {}))
 
})

app.get("/reset/*", async(req, res) => {
  url = req.url.split("/").slice(2)
  if(enc.verifypassword(url[0])) {
    await db.reset()
    res.end(rsp.respond("200", {}))
    return
  }
  res.end(rsp.respond("404", {}))
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})