const ver = require("../verification.js");
const inputValidator = require("../inputValidator.js");
const sendgrid = require("../sendgrid.js");

// const TBDOrders = require("../../tables/Orders.js");
// const TBDPurchases = require("../../tables/Purchases.js");

// const TBDArchivedOrders = require("../../tables/ArchivedOrders.js");
// const TBDArchivedPurchases = require("../../tables/ArchivedPurchases.js");

// const TBDProducts = require("../../tables/Products.js")

const database = require("../database.js");

const express = require("express");
// const bodyParser = require("body-parser");

let ordersRouter = express.Router()

module.exports = ordersRouter;


ordersRouter.post('/add', async(req, res) => {

    const date = new Date();
  
    //validate any empty inputs
    for(key in req.body["Order"]) {
        if(!req.body["Order"][key]) {
            res.status(400);
            res.send({"response": "Empty input given"});
            return;
        }
    }

    //clean string
    //if the data is not clean, return a 400. The front end prevents users inputting bad strings, but we do it here to be safe.
    let cleanedData = inputValidator.validateInput(req.body["Order"]);
    if(cleanedData["wasCleaned"]) {
        res.status(400);
        res.send({"response": "Invalid body input, you used disallowed characters in a field",
                "cleanedInput": cleanedData});
        return;
    }
    let viewKey = ver.createHash()
    //set up extra parameters in order
    req.body["Order"]["isComplete"] = false;
    req.body["Order"]["date"] = date.getTime();
    req.body["Order"]["emailSent"] = false;
    req.body["Order"]["wantsEmails"] = req.body["wantsToReceiveEmails"];
    req.body["Order"]["viewKey"] = ver.hash(viewKey);
    //Add a user to the order if there is one
    
    req.body["Order"]["owner"] = "";
    if(await ver.verifySession(req, res, "user", false)) {
        req.body["Order"]["owner"] = req.cookies.auth.split(":")[0];
    }
    
    //verify the purchases
    for (let purchase in req.body["Items"]) {
        if (req.body["Items"][purchase]["amount"] <= 0) { // prevent orders of 0 items from getting stored.
            delete req.body["Items"][purchase];
        }
        purchase = req.body["Items"][purchase];
    
        let product = database.Products.get(purchase["productID"])["table"];
        let subProduct = database.Products.get(purchase["subProductID"])["table"];

        if(product["relations"][purchase["subProductID"]] == undefined) {
            res.status(400);
            res.send({"response": `Product ${purchase["productID"]} does not contain a subproduct ${purchase["subProductID"]}`});
            return;
        }


        if( (product.stock    != null && product.stock    - purchase["amount"] < 0) ||
            (subProduct.stock != null && subProduct.stock - purchase["amount"] < 0)) {
            
            res.status(400);
			res.send({"response": `Not enough stock for product ${purchase["productID"]} with ${purchase["subProductID"]}`});
			return;
        }

        //remove the stock
        if(product.stock != null) {    database.Products.set(purchase["productID"]   , {"stock": product.stock   - purchase["amount"]});  }
		if(subProduct.stock != null) { database.Products.set(purchase["subProductID"], {"stock": subProduct.stock - purchase["amount"]}); }

    }

    //after the product checks, add it to the order
    req.body["Order"]["purchases"] = req.body["Items"];
    
    //Add Order to db
    let newID = parseInt(database.Orders.getLastID()) + 1;
    database.Orders.create(newID.toString(), req.body["Order"])

    //send email
    let emailSent = await sendgrid.sendOrderConfirmation(req.body["Order"], req.body["Order"]["purchases"], newID, viewKey)
    
    res.status(201)
    res.send({  "response": "Order Created", 
    "Email": emailSent ? "Sent" : "Not Sent",
    "viewKey": viewKey,
    "orderID": newID.toString()})
})

ordersRouter.get("/getByKey", async(req, res) => {
    
    let order = database.Orders.get(req.query.orderId.toString())["table"];
    //if not found in active table, check archived table
    if(order == undefined) {
        order = database.ArchivedOrders.get(req.query.orderId.toString())["table"];
    }
    
    if(req.query.viewKey == "loggedInUser") {
        if(!await ver.verifySession(req, res, "user")) { return; } //return if not logged in
        
        if(order["owner"] != req.cookies.auth.split(":")[0]) {
            res.status(401);
            res.send({"response": "Invalid Owner"});
            return;
        }
        
    } else {

        if(order["viewKey"] != ver.hash(req.query.viewKey)) {
            res.status(401);
            res.send({"response": "Invalid Key"});
            return;
        }
    }
    
    if(order == null) {
        res.status(400)
        res.send({"response": "Invalid Order or View Key"})
        return
    }
    
    let response = {
        "order": {
            "id": order["id"],
            "name": order["name"],
            "email": order["email"],
            "phoneNumber": order["phoneNumber"],
            "address": order["address"],
            "isComplete": order["isComplete"],
            "date": order["date"],
            "purchases": order["purchases"]
        }
    }

    res.status(200)
    res.send({"response": response})
})

// ordersRouter.get("/getPlacedOrders", async(req, res) => {
//     if(!await enc.verifySession(req, res, "user")) {
//         return
//     }

//     let userID = req.cookies.auth.split(":")[0]

//     let allOrders = {
//         "active": (await TBDOrders.findAll({where: {"owner": userID}})).map(purchase => {return {  "id": purchase["id"],
//                                                                                                 "date": purchase["date"],
//                                                                                                 "isComplete": purchase["isComplete"]}}),
//         "completed": (await TBDArchivedOrders.findAll({where: {"owner": userID}})).map(purchase => {return { "id": purchase["id"],
//                                                                                                         "date": purchase["date"],
//                                                                                                         "isComplete": purchase["isComplete"]}})
//     }

//     res.status(200)
//     res.send({"response": allOrders})
// })

// ordersRouter.post("/get", async(req, res) => {

//     if(!await enc.verifySession(req, res, "admin")) {
//         return
//     }

//     let allOrders;
//     if(req.body["getArchived"]) {
//         allOrders = await TBDArchivedOrders.findAll()
//     } else {
//         allOrders = await TBDOrders.findAll()
//     }

//     res.status(200)
//     res.send({"archived":!!req.body["getArchived"], "response": allOrders})
//     return  
// })


// ordersRouter.patch("/complete", async(req, res) => {
  
//     if(!await enc.verifySession(req, res, "admin")) {
//         return
//     }

//     let order = await TBDOrders.findOne({where: {id: req.body["orderID"]}})
//     if(order != null) {
//         order.isComplete = req.body["isComplete"]  
//         await order.save()
//     } else {
//         res.status(400)
//         res.send({"response": "Invalid Order"})
//         return
//     }

//     res.status(200)
//     res.send({"response": "Updated completion status"})
// })


// ordersRouter.post("/archive", async(req, res) => {

//     if(!await enc.verifySession(req, res, "admin")) {
//         return
//     }

//     let order = await TBDOrders.findOne({where: {id: req.body["orderID"]}})
    
//     try {
//         order = order["dataValues"]
//         order["id"] = req.body["orderID"] //Persist the order ID so the purchases table refers to the right Orders instance
//     } catch {
//         res.status(400)
//         res.send({"response": "Invalid Order"})
//     }  
    
//     purchases = await TBDPurchases.findAll({where: {orderID: req.body["orderID"]}})  
//     order["reasonArchived"] = "Archived By Administrator"
//     TBDArchivedOrders.create(order)
//     TBDOrders.destroy({where: {id: req.body["orderID"]}})
    
//     purchases.forEach(element => {
//         TBDArchivedPurchases.create(element["dataValues"])
//         TBDPurchases.destroy({where: {id: element["dataValues"]["id"]}})
//     });
    
//     res.status(200)
//     res.send({"response":"Order Archived"})
// })
