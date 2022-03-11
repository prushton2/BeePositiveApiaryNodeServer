const sequelize = require('./database.js');
const enc = require('./encryption.js');
const rsp = require('./response.js');
const Orders = require('./Orders.js')
const Purchases = require('./Purchases.js')

const bodyParser = require('body-parser');
const http = require('http');
const cors = require("cors");
const express = require("express");
const app = express();
const port = 3000

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(
  bodyParser.json()
);
app.use(cors({
  origin: "*"
}));

onStart = async() => {
  await sequelize.sync()
  console.log("Database is ready")
}

onStart()

app.post('/add', async(req, res) => {
  //validate input
  for(key in req.body["Order"]) {
    if(!req.body["Order"][key]) {
      res.status(400)
      res.send({"response": "Invalid input"})
      return;
    }
  }
  //Add Order to db
  req.body["Order"]["isComplete"] = false
  output = await Orders.create(req.body["Order"])
  orderid = output["dataValues"]["id"] // Get order ID to be used in the Purchases database to create relations
  
  //Add purchases to db
  for (purchase in req.body["Items"]) {
    
    if (req.body["Items"][purchase] == 0) { // prevent orders of 0 items from getting stored.
      continue;
    }
    
    await Purchases.create({
      orderID: orderid,
      productID: purchase,
      amount: req.body["Items"][purchase]
    })
  }
  
  res.send({"response": "Order Created"})
})

app.post("/getPurchases", async(req, res) => {
  url = req.url.split("/").slice(2)
  
  if(!enc.verifypassword(req.body["password"])) {
    res.status(400)
    res.send({"response": "Invalid Credentials"})
    return
  }

  allpurchases = await Purchases.findAll({where: {orderID: req.body["orderID"]}})
  res.status(200)
  res.send({"response": allpurchases})
  return
})

app.post("/getOrders", async(req, res) => {
  url = req.url.split("/").slice(2)

  if(!enc.verifypassword(req.body["password"])) {
    res.status(400)
    res.send({"response": "Invalid Credentials"})
    return
  }

  allOrders = await Orders.findAll()

  res.send({ "response": allOrders})
  return  
})

app.post("/complete", async(req, res) => {
  url = req.url.split("/").slice(2)
  
  if(!enc.verifypassword(req.body["password"])) { // exit if password is invalid
    res.status(400)
    res.send({"response": "Invalid Credentials"})
    return
  }

  order = await Orders.findOne({where: {id: req.body["orderID"]}})
  order.isComplete = req.body["completeStatus"]  
  await order.save()

  res.status(200)
  res.send({"response": "Updated completion status"})

  
})


// Replace with archive
app.get("/delete/*", async(req, res) => {
  url = req.url.split("/").slice(2)


  order = await sequelize.getOrderByID(url[1])


  if(!(enc.verifypassword(url[0]) || order["password"] == enc.hash(url[0]))) { //If either the master password is given or the order specific password is given, delete order. Else respond with 400.
    res.end(rsp.respond("400", {}))
    return
  }

  orders = await sequelize.get("orders")

  for(var order in orders) {

    if(orders[order]["id"] == url[1]) {
      orders.splice(order, 1)
      sequelize.overwrite(orders)

      res.end(rsp.respond("200"), {})
      return
    }
  }


  res.end(rsp.respond("400", {}))
})



app.post("/reset", async(req, res) => {
  if(true) {
    res.status(404)
    res.end("Cannot GET /reset")
    return
  }
  url = req.url.split("/").slice(2)
  if(enc.verifypassword(req.body["password"])) {
    await sequelize.reset()
    res.end(rsp.respond("200", {}))
    return
  }
})

app.listen(port,() => {
  console.log(`App listening on port ${port}`)
})