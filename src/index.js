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
const dbRoute = require('./endpoints/db.js');
const emailRoute = require('./endpoints/email.js');

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
    await Products.setDefaults();
    await ProductRelations.setDefaults();
    console.log("Set up default table values")
    
    app.listen(port,() => {
        console.log(`App listening on port ${port}`)
    })
    
}

onStart()

//Routing for endpoints
app.use("/orders", ordersRoute);
app.use("/purchases", purchasesRoute);
app.use("/db", dbRoute);
app.use("/email", emailRoute);


app.post("/validateInput", async(req, res) => {
    //meant for the frontend to check if the input is valid before sending it to the server. The server does the same thing,
    //but this is more friendly for the end user.
    res.status(200)
    // res.send({"response": inputValidator.validateInput(req.body["string"])})
    res.send({"response": inputValidator.validateShoppingList(req.body["string"])})
})

app.all("*", async(req, res) => {
    res.status(404)
    res.send({"response": "Endpoint does not exist"})
})