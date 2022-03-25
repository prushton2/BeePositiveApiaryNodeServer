const sequelize         = require('./database.js');
const enc               = require('./encryption.js');
const config            = require('./config.js');
const archive           = require('./archive.js');

const ArchivedOrders     = require('./tables/ArchivedOrders.js');
const ArchivedPurchases  = require('./tables/ArchivedPurchases.js');
const Orders             = require('./tables/Orders.js');
const Purchases          = require('./tables/Purchases.js');

const cron              = require('node-cron');
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

process.on('uncaughtException', (err) => {
  console.log(err)
})

//Archive every tuesday at 11pm
cron.schedule("0 23 * * 2", () => {
  archive.archiveDB()
});

onStart = async() => {
  if(false) { //set to true to load the latest save on start
    await archive.loadLatestSave();
  }

  await sequelize.sync()
  console.log("Database is ready")
  await config.createConfigIfNotExists()
  console.log("Config is ready")  
  
}

onStart()

app.post('/add', async(req, res) => {
  const date = new Date()
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
  req.body["Order"]["date"] = date.getTime()
  output = await Orders.create(req.body["Order"])
  orderid = output["dataValues"]["id"] // Get order ID to be used in the Purchases database to create relations
  
  //Add purchases to db
  for (purchase in req.body["Items"]) {
    
    if (req.body["Items"][purchase]["amount"] <= 0) { // prevent orders of 0 items from getting stored.
      continue;
    }
    
    await Purchases.create({
      orderID: orderid,
      productID: req.body["Items"][purchase]["productID"],
      subProductID: req.body["Items"][purchase]["subProductID"],
      amount: req.body["Items"][purchase]["amount"]
    })
  }
  
  res.send({"response": "Order Created"})
})


app.post("/getPurchases", async(req, res) => {
  url = req.url.split("/").slice(2)
  
  if(!await enc.verifypassword(req.body["password"])) {
    res.status(400)
    res.send({"response": "Invalid Credentials"})
    return
  }

  let allpurchases;
  if(req.body["getArchived"]) {
    allpurchases = await ArchivedPurchases.findAll({where: {orderID: req.body["orderID"]}})
  } else {
    allpurchases = await Purchases.findAll({where: {orderID: req.body["orderID"]}})
  }

  res.status(200)
  res.send({"response": allpurchases})
  return
})


app.post("/getOrders", async(req, res) => {

  if(!await enc.verifypassword(req.body["password"])) {
    res.status(400)
    res.send({"response": "Invalid Credentials"})
    return
  }

  let allOrders;
  if(req.body["getArchived"]) {
    allOrders = await ArchivedOrders.findAll()
  } else {
    allOrders = await Orders.findAll()
  }

  res.status(200)
  res.send({"archived":!!req.body["getArchived"], "response": allOrders})
  return  
})


app.post("/complete", async(req, res) => {
  url = req.url.split("/").slice(2)
  
  if(!await enc.verifypassword(req.body["password"])) { // exit if password is invalid
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

  if(!await enc.verifypassword(req.body["password"])) { // exit if password is invalid
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

app.post("/hash", async(req, res) => {

  if(!await enc.verifypassword(req.body["password"])) { // exit if password is invalid
    res.status(400)
    res.send({"response": "Invalid Credentials"})
    return
  }

  res.status(200)
  res.send({"response": enc.hash(req.body["string"])})
})


app.all("*", async(req, res) => {
  res.status(404)
  res.send({"response": "Endpoint does not exist"})
})

app.listen(port,() => {
  console.log(`App listening on port ${port}`)
})