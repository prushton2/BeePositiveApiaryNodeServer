const ver = require("../verification.js");
const inputValidator = require("../inputValidator.js");
const sendgrid = require("../sendgrid.js");
const jwtdecode = require("jwt-decode");


const database = require("../database.js");

const express = require("express");

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

    //viewkey to view order after its placed
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
        req.body["Order"]["owner"] = jwtdecode(req.cookies.auth).sub;
    }
    
    //verify the purchases
    let verifiedPurchases = []
    for (let purchase in req.body["Items"]) {
        
        purchase = req.body["Items"][purchase];

        if (purchase["amount"] <= 0) { // prevent orders of 0 items from getting stored.
            continue; //this is a continue because submitting products with a quantity of 0 is expected behaviour, so we dont error from it
        }
        
        let product = database.Products.get(purchase["ID"])["table"]; //load product info
        let subProduct = database.Products.get(purchase["subProductID"])["table"];

        if(product["relations"][purchase["subProductID"]] == undefined) { //if the relation is invalid
            res.status(400);
            res.send({"response": `Product ${purchase["ID"]} does not contain a subproduct ${purchase["subProductID"]}`});
            return;
        }


        if( (product.stock    != null && product.stock    - purchase["amount"] < 0) ||
            (subProduct.stock != null && subProduct.stock - purchase["amount"] < 0)) { //if there is enough stock
            
            res.status(400);
			res.send({"response": `Not enough stock for product ${purchase["ID"]} with ${purchase["subProductID"]}`});
			return;
        }

        //remove the stock
        if(product.stock != null) {    database.Products.set(purchase["ID"]   , {"stock": product.stock   - purchase["amount"]});  }
		if(subProduct.stock != null) { database.Products.set(purchase["subProductID"], {"stock": subProduct.stock - purchase["amount"]}); }
        
        verifiedPurchases.push(purchase);

    }

    //after the product checks, add it to the order
    req.body["Order"]["purchases"] = verifiedPurchases;
    
    //Add Order to db
    //Redo this - wont work long term as it doesnt interact with the archived orders
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
    
    let order = database.Orders.get(req.query.orderID.toString())["table"];
    //if not found in active table, check archived table
    if(order == undefined) {
        order = database.ArchivedOrders.get(req.query.orderID.toString())["table"];
    }

    if(order == undefined) {
        res.status(400)
        res.send({"response": "Invalid Order or View Key"})
        return
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

ordersRouter.get("/get/*", async(req, res) => {
    
    let response
    if(req.originalUrl.split("/")[3] == "placed") {
        if(!await ver.verifySession(req, res, "user")) { return; }
        response = {
            "active": database.Orders.findAll({"owner": req.cookies.auth.split(":")[0]}),
            "complete": database.ArchivedOrders.findAll({"owner": req.cookies.auth.split(":")[0]})
        }
    } else if (req.originalUrl.split("/")[3] == "all") {
        if(!await ver.verifySession(req, res, "admin")) { return; }
        database.Orders.load();
        database.ArchivedOrders.load();
        response = {
            "active": database.Orders.table,
            "archived": database.ArchivedOrders.table
        };
    }
    res.status(200);
    res.send({"response": response});
})

ordersRouter.patch("/action/*", async(req, res) => {
    if(!await ver.verifySession(req, res, "admin")) { return; }

    switch(req.originalUrl.split("/")[3]) {
        case "complete":
            database.Orders.set(req.body["orderID"], {"isComplete": !!req.body["value"]});
            break;
        case "archive":
            let order = database.Orders.get(req.body["orderID"]);
            database.Orders.delete(req.body["orderID"]);
            database.ArchivedOrders.create(order["primaryKey"], order["table"]);
            break;
        default:
            res.status(404);
            res.send({"response": "Endpoint does not exist"});
            break;
    }
    res.status(200);
    res.send({"response": "Action completed"});
})