const config            = require('./config.js');
const sequelize         = require('./database.js');
const enc               = require('./encryption.js');
const archive           = require('./archive.js');
const sendgrid          = require('./sendgrid.js');
const inputValidator    = require('./inputValidator.js');

const Products           = require('../tables/Products.js');
const ProductRelations   = require('../tables/ProductRelations.js');
const ArchivedOrders     = require('../tables/ArchivedOrders.js');
const ArchivedPurchases  = require('../tables/ArchivedPurchases.js');
const Orders             = require('../tables/Orders.js');
const Purchases          = require('../tables/Purchases.js');

const cron               = require('node-cron');
const cors               = require("cors");
const express            = require("express");
const bodyParser         = require('body-parser');
const app                = express();
const port               = 3000

const ordersRoute = require('./endpoints/orders.js');
const purchasesRoute = require('./endpoints/purchases.js');

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json());

app.use(cors({
  origin: "*"
}));

app.use("/orders", ordersRoute.orders);
app.use("/purchases", purchasesRoute.purchases);


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
  await Products.setDefaults();
  await ProductRelations.setDefaults();
  console.log("Set up default table values")

  app.listen(port,() => {
    console.log(`App listening on port ${port}`)
  })

}

onStart()



app.post("/validateInput", async(req, res) => {
    //meant for the frontend to check if the input is valid before sending it to the server. The server does the same thing,
    //but this is more friendly for the end user.
    res.status(200)
    // res.send({"response": inputValidator.validateInput(req.body["string"])})
    res.send({"response": inputValidator.validateShoppingList(req.body["string"])})
})

app.post("/sendCompletionEmail", async(req, res) => {
  //verify password
    if(!await enc.verifypassword(req.body["password"])) {
        res.status(401)
        res.send({"response": "Invalid Credentials"})
        return
    }
    //get order from db
    let order = await Orders.findOne({where: {id: req.body["orderID"]}})
    //check if order is complete
    if(!order["isComplete"]) {
        res.status(400)
        res.send({"response": "Order is not complete"})
        return
    }

    //get shoppingList
    let shoppingList = await Purchases.findAll({where: {orderID: req.body["orderID"]}})

    //update emailSent
    order["emailSent"] = true
    await order.save()

    //send email
    let emailSent = await sendgrid.sendOrderCompletionEmail(order, shoppingList)

    res.status(emailSent ? 200 : 403)
    emailSentString = emailSent ? "Email Sent" : "Email Not Sent"
    res.send({"response": emailSentString})
})

app.post("/hash", async(req, res) => {
    if(!await enc.verifypassword(req.body["password"])) { // exit if password is invalid
        res.status(401)
        res.send({"response": "Invalid Credentials"})
        return
    }

    res.status(200)
    res.send({"response": enc.hash(req.body["text"])})
})

app.get("/getProducts", async(req, res) => {
    res.status(200)
    res.send({"response": {
        "products": await Products.findAll(),
        "productRelations": await ProductRelations.findAll()
    }})
})

app.all("*", async(req, res) => {
    res.status(404)
    res.send({"response": "Endpoint does not exist"})
})