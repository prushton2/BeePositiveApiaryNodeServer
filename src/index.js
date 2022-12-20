const database           = require('./database.js');
const config             = require('./config.js');
const ver                = require('./verification.js');
// const archive            = require('./archive.js');
// const sendgrid           = require('./sendgrid.js');
// const inputValidator     = require('./inputValidator.js');

// const fs                 = require('fs');
const cookieParser       = require('cookie-parser');
const cron               = require('node-cron');
const cors               = require("cors");
const express            = require("express");
const bodyParser         = require('body-parser');
const app                = express();
const port               = 3000

// const authRoute = require('./endpoints/auth.js');
// const dbRoute = require('./endpoints/db.js');
// const emailRoute = require('./endpoints/email.js');
// const ordersRoute = require('./endpoints/orders.js');

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
    // archive.archiveDB()
});

onStart = async() => {
    if(false) { //set to true to load the latest save on start
        // await archive.loadLatestSave();
    }


    console.log("Database is ready")

    app.listen(port,() => {
        console.log(`App listening on port ${port}`)
    })
    

    
}

onStart()

//Routing for endpoints
// app.use("/auth", authRoute);
// app.use("/db", dbRoute);
// app.use("/email", emailRoute);
// app.use("/orders", ordersRoute);

app.all("*", async(req, res) => {
    res.status(404)
    res.send({"response": "Endpoint does not exist"})
})