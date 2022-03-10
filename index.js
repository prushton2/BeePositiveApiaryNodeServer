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

// Example code

// app.get('/list', async(req, res) => {
//   response = await Orders.findOne({where: {}})
//   res.send(response)
// })

// app.get('/all', async(req, res) => {
//   let response = await Orders.findAll()
//   console.log(response)
//   res.send(response)
//   // res.send(response)
// })

//Debug function
app.get("/setDefaultPurchases", async(req, res) => {
  await Purchases.create({
    orderID: 1,
    productID: 21,
    amount: 7,
  })
  await Purchases.create({
    orderID: 1,
    productID: 12,
    amount: 2,
  })
  await Purchases.create({
    orderID: 2,
    productID: 76,
    amount: 3,
  })
  await Purchases.create({
    orderID: 2,
    productID: 34,
    amount: 1,
  })
  res.send("Created")
})

app.post('/add', async(req, res) => {
  //validate input
  for(key in req.body["Order"]) {
    if(!req.body["Order"][key]) {
      res.status(400)
      res.send({"response": "Invalid input"})
      return;
    }
  }
  //Add to db
  req.body["Order"]["isComplete"] = false
  await Orders.create(req.body["Order"]) 
  res.send({"response": "User Added"})
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

  res.send(allOrders)
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

// app.post("/complete", async(req, res) => {
//   url = req.url.split("/").slice(2)

//   haschanged = false

//   if(!enc.verifypassword(req.body["password"])) { // exit if password is invalid
//     res.status(400)
//     res.send({"response": "Invalid Credentials"})
//     return
//   }

//   orders = await sequelize.get("orders")
//   for(var order in orders) {
//     if(orders[order]["id"] == url[1]) {
//       orders[order]["isComplete"] = url[2] == 'true'
//       haschanged = true
//     }
//   }

//   if(!haschanged) {
//     res.end(rsp.respond("400", {}))
//   }

//   await sequelize.overwrite(orders)
//   res.end(rsp.respond("200", {}))

  
// })

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

app.get("/getorder/*", async(req, res) => {
  url = req.url.split("/").slice(2)
  
  order = await sequelize.getOrderByID(url[0])

  if(enc.hash(url[1]) != order["password"]) { //respond if password is valid
    res.end(rsp.respond("400", {}))
    return
  }

  res.end(rsp.respond("200", order))
})

app.get("/setorder/*", async(req, res) => {
  url = req.url.split("/").slice(2)
  
  order = await sequelize.getOrderByID(url[0])
  
  if(enc.hash(url[1]) != order["password"]) { //Continue if password verified
    res.end(rsp.respond("400", {}))
    return
  }

  await sequelize.editOrder(url[0], "items", sequelize.convertUrlEscapeCharacters(url[2]))
  await sequelize.editOrder(url[0], "isComplete", false)
  order = await sequelize.getOrderByID(url[0])
  res.end(rsp.respond("200", {}))
 
})

app.get("/reset/*", async(req, res) => {
  url = req.url.split("/").slice(2)
  if(enc.verifypassword(url[0])) {
    await sequelize.reset()
    res.end(rsp.respond("200", {}))
    return
  }
  res.end(rsp.respond("404", {}))
})

app.listen(port,() => {
  console.log(`App listening on port ${port}`)
})