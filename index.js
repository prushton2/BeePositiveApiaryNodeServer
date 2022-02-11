const http = require('http');
const db = require('./database.js');
const enc = require('./encryption.js');

const cors = require("cors")
const express = require("express");
const app = express();
const port = 3000

app.use(cors({
  origin: "*"
}));

app.get('/add/*', async(req, res) => {
  url = req.url.split("/").slice(2)

  order = {
    "items": db.convertUrlEscapeCharacters(url[0]),
    "date" : db.convertUrlEscapeCharacters(url[1]),
    "email": db.convertUrlEscapeCharacters(url[2]),
    "name" : db.convertUrlEscapeCharacters(url[3]),
    "isComplete": false,
    "id": await db.getID(),
  }
  db.append(order)
  res.end(`{"status": "success"}`)
})

app.get("/get/*", async(req, res) => {
  url = req.url.split("/").slice(2)
  if(enc.verifypassword(url[0])) {
    res.end(JSON.stringify(await db.get(url[1])))
  } else {
    res.end("Error")
  }
})

app.get("/complete/*", async(req, res) => {
  url = req.url.split("/").slice(2)
  if(enc.verifypassword(url[0])) {
    orders = await db.get("orders")
    for(var order in orders) {
      if(orders[order]["id"] == url[1]) {
        orders[order]["isComplete"] = url[2] == 'true'
      }
    }
    await db.overwrite(orders)
  }
  res.end("Updated")
})

app.get("/delete/*", async(req, res) => {
  url = req.url.split("/").slice(2)
  if(enc.verifypassword(url[0])) {
    orders = await db.get("orders")
    for(var order in orders) {
      if(orders[order]["id"] == parseInt(url[1])) {
        orders.splice(order, 1)
        db.overwrite(orders)
        res.end("Deleted Item")
        return
      }
    }
  } 

  res.end("Nah")
})

// app.get("/reset/*", async(req, res) => {
//   await db.reset()
//   res.end("Reset")
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})