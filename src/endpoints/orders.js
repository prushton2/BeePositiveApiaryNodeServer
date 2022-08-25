const enc = require("../encryption.js");
const inputValidator = require("../inputValidator.js");
const sendgrid = require("../sendgrid.js");

const Orders = require("../../tables/Orders.js");
const Purchases = require("../../tables/Purchases.js");

const ArchivedOrders = require("../../tables/ArchivedOrders.js");
const ArchivedPurchases = require("../../tables/ArchivedPurchases.js");

const express = require("express");
// const bodyParser = require("body-parser");

let ordersRouter = express.Router()

module.exports = ordersRouter;


ordersRouter.post('/add', async(req, res) => {

    const date = new Date()
  
    //validate any empty inputs
    for(key in req.body["Order"]) {
        if(!req.body["Order"][key]) {
        res.status(400)
        res.send({"response": "Empty input given"})
        return;
        }
    }

    //clean string
    //if the data is not clean, return a 400. The front end prevents users inputting bad strings, but we do it here to be safe.
    let cleanedData = inputValidator.validateInput(req.body["Order"])
    if(cleanedData["wasCleaned"]) {
        res.status(400)
        res.send({"response": "Invalid body input, you used disallowed characters in a field",
                "cleanedInput": cleanedData})
        return
    }
    let viewKey = enc.createHash()
    //set up extra parameters in order
    req.body["Order"]["isComplete"] = false
    req.body["Order"]["date"] = date.getTime()
    req.body["Order"]["emailSent"] = false
    req.body["Order"]["wantsEmails"] = req.body["wantsToReceiveEmails"]
    req.body["Order"]["viewKey"] = enc.hash(viewKey)

    //Add a user to the order if there is one
    req.body["Order"]["owner"] = ""

    if(await enc.verifySession(req, res, "user", false)) {
        req.body["Order"]["owner"] = req.cookies.auth.split(":")[0]
    }


    //Add Order to db
    let output = await Orders.create(req.body["Order"])
    let orderid = output["dataValues"]["id"] // Get order ID to be used in the Purchases database to create relations
  
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
    let emailSent = false
    if(req.body["wantsToReceiveEmails"]) {
        emailSent = await sendgrid.sendOrderConfirmation(req.body["Order"], req.body["Items"], orderid, viewKey)
    }

    res.status(201)
    res.send({  "response": "Order Created", 
                "Email": emailSent ? "Sent" : "Not Sent",
                "viewKey": viewKey,
                "orderID": orderid})
})

ordersRouter.post("/getByKey", async(req, res) => {
    let order = await Orders.findOne({where: {id: req.body["orderID"], viewKey: enc.hash(req.body["viewKey"])}})
    let purchases;
    //if not found in active table, check archived table
    if(order == null) {
        order = await ArchivedOrders.findOne({where: {id: req.body["orderID"], viewKey: enc.hash(req.body["viewKey"])}})
        purchases = await ArchivedPurchases.findAll({where: {orderID: order["id"]}})
    } else {
        purchases = await Purchases.findAll({where: {orderID: order["id"]}})
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
        },
        "purchases":purchases.map(purchase => { return {"productID": purchase["productID"], 
                                                        "subProductID": purchase["subProductID"], 
                                                        "amount": purchase["amount"] } })
    }

    res.status(200)
    res.send({"response": response})
})

ordersRouter.get("/getPlacedOrders", async(req, res) => {
    if(!await enc.verifySession(req, res, "user")) {
        return
    }

    let userID = req.cookies.auth.split(":")[0]

    let allOrders = {
        "active": (await Orders.findAll({where: {"owner": userID}})).map(purchase => {return {  "id": purchase["id"],
                                                                                                "date": purchase["date"],
                                                                                                "isComplete": purchase["isComplete"]}}),
        "completed": await ArchivedOrders.findAll({where: {"owner": userID}}).map(purchase => {return { "id": purchase["id"],
                                                                                                        "date": purchase["date"],
                                                                                                        "isComplete": purchase["isComplete"]}})
    }

    console.log(allOrders)
    res.status(200)
    res.send({"response": allOrders})
})

ordersRouter.post("/getPlacedOrder", async(req, res) => {
    if(!await enc.verifySession(req, res, "user")) {
        return
    }

    let order = Orders.findOne({where: {id: req.query.id, owner: req.cookies.auth.split(":")[0]}})
    let purchases;
    if(order == null) {
        order = ArchivedOrders.findOne({where: {id: req.query.id, owner: req.cookies.auth.split(":")[0]}})
        purchases = ArchivedPurchases.findOne({where: {id: req.query.id, owner: req.cookies.auth.split(":")[0]}})
    } else {
        purchases = Purchases.findOne({where: {id: req.query.id, owner: req.cookies.auth.split(":")[0]}})
    }

    if(order == null) {
        res.status(400)
        res.send({"response": "Invalid order ID"})
        return
    }

    res.status(200)
    res.send({
        "response": {
            order: order,
            purchases: purchases
        }
    })

})

ordersRouter.post("/get", async(req, res) => {

    if(!await enc.verifySession(req, res, "admin")) {
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


ordersRouter.patch("/complete", async(req, res) => {
  
    if(!await enc.verifySession(req, res, "admin")) {
        return
    }

    let order = await Orders.findOne({where: {id: req.body["orderID"]}})
    if(order != null) {
        order.isComplete = req.body["isComplete"]  
        await order.save()
    } else {
        res.status(400)
        res.send({"response": "Invalid Order"})
        return
    }

    res.status(200)
    res.send({"response": "Updated completion status"})
})


ordersRouter.post("/archive", async(req, res) => {

    if(!await enc.verifySession(req, res, "admin")) {
        return
    }

    let order = await Orders.findOne({where: {id: req.body["orderID"]}})
    
    try {
        order = order["dataValues"]
        order["id"] = req.body["orderID"] //Persist the order ID so the purchases table refers to the right Orders instance
    } catch {
        res.status(400)
        res.send({"response": "Invalid Order"})
    }  
    
    purchases = await Purchases.findAll({where: {orderID: req.body["orderID"]}})  
    order["reasonArchived"] = "Archived By Administrator"
    ArchivedOrders.create(order)
    Orders.destroy({where: {id: req.body["orderID"]}})
    
    purchases.forEach(element => {
        ArchivedPurchases.create(element["dataValues"])
        Purchases.destroy({where: {id: element["dataValues"]["id"]}})
    });
    
    res.status(200)
    res.send({"response":"Order Archived"})
})
