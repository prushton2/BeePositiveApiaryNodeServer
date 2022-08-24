const config             = require('./config.js');
const sequelize          = require('./database.js');
const enc                = require('./encryption.js');
const archive            = require('./archive.js');
const sendgrid           = require('./sendgrid.js');
const inputValidator     = require('./inputValidator.js');
const cookieParser       = require('cookie-parser');

const Products           = require('../tables/Products.js');
const ProductRelations   = require('../tables/ProductRelations.js');
const ArchivedOrders     = require('../tables/ArchivedOrders.js');
const ArchivedPurchases  = require('../tables/ArchivedPurchases.js');
const Orders             = require('../tables/Orders.js');
const Purchases          = require('../tables/Purchases.js');

const fs                 = require('fs');
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
const authRoute = require('./endpoints/auth.js');

app.use(cookieParser());

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json());

app.use( cors({
    origin:true,
    credentials: true
}));


process.on('uncaughtException', (err) => {
    console.log(err)
})

//Archive every tuesday at 11pm
cron.schedule("0 13 * * 2", () => {
    archive.archiveDB()
});

onStart = async() => {
    if(false) { //set to true to load the latest save on start
        await archive.loadLatestSave();
    }
    
    let addProducts = true
    if(fs.existsSync("./bpa.sqlite")) {
        addProducts = false
    }

    // await sequelize.sync()
    await sequelize.sync({ })//force: false })


    if(addProducts) {
        await Products.setDefaults();
        await ProductRelations.setDefaults();
        console.log("Set up default table values")
    }

    console.log("Database is ready")
    delete addProducts
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
app.use("/auth", authRoute);

app.all("*", async(req, res) => {
    res.status(404)
    res.send({"response": "Endpoint does not exist"})
})