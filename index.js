const sequelize         = require('./database.js');
const enc               = require('./encryption.js');

const Orders            = require('./Orders.js')
const Purchases         = require('./Purchases.js')
const ArchivedOrders    = require('./ArchivedOrders.js')
const ArchivedPurchases = require('./ArchivedPurchases.js')

const fs                = require("fs");
const cors              = require("cors");
const express           = require("express");
const bodyParser        = require('body-parser');
const app               = express();
const port              = 3000


app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());

app.use(cors({
  origin: "*"
}));

//Handles all errors without exiting. Doesnt send back a response, but that is less important than a crashing database
process.on('uncaughtException', (err) => {
  console.log(err)
})

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
  try {
    order.isComplete = req.body["completeStatus"]  
    await order.save()
  } catch {
    res.status(400)
    res.send({"response": "Invalid Order"})
  }

  res.status(200)
  res.send({"response": "Updated completion status"})
})


app.post("/archive", async(req, res) => {

  if(!enc.verifypassword(req.body["password"])) { // exit if password is invalid
    res.status(400)
    res.send({"response": "Invalid Credentials"})
    return
  }

  order = await Orders.findOne({where: {id: req.body["orderID"]}})
  
  try {
    order = order["dataValues"]
    order["id"] = req.body["orderID"] //Persist the order ID so the purchases table refers to the right Orders instance
  } catch {
    res.status(400)
    res.send({"response": "Invalid Order"})
  }  
  
  purchases = await Purchases.findAll({where: {orderID: req.body["orderID"]}})  
  
  ArchivedOrders.create(order)
  Orders.destroy({where: {id: req.body["orderID"]}})
  
  purchases.forEach(element => {
    ArchivedPurchases.create(element["dataValues"])
    Purchases.destroy({where: {id: element["dataValues"]["id"]}})
  });
  
  res.send({"response":"Order Archived"})
})


app.post("/reset", async(req, res) => {
  if(true || !enc.verifypassword(req.body["password"])) {
    res.status(404)
    res.send({"response": "Endpoint does not exist"})
    return
  }

  fs.truncate("bpa.sqlite", 0, function() {
    fs.writeFile("bpa.sqlite", "", function (err) {
      if (err) {
        return console.log("Error writing file: " + err);
      }
    });
  });
  res.send({"response": "Database Erased"})
})

app.all("*", async(req, res) => {
  res.status(404)
  res.send({"response": "Endpoint does not exist"})
})




app.listen(port,() => {
  console.log(`App listening on port ${port}`)
})