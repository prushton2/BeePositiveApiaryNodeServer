const express = require("express");

const database = require("../database.js");

const ver = require("../verification.js");
const sendgrid = require("../sendgrid.js");

let sendgridRouter = express.Router();
module.exports = sendgridRouter;

sendgridRouter.post("/completionEmail", async(req, res) => {
    //verify password
    if(!await ver.verifySession(req, res, "admin")) {
        return
    }
      //get order from db
    let order = database.Orders.get(req.body["orderID"])["table"];

    if(order == undefined) {
        res.status(400);
        res.send({"response": "Order doesnt exist"});
        return;
    }

    //check if order is complete
    if(!order["isComplete"]) {
        res.status(400);
        res.send({"response": "Order is not complete"});
        return;
    }
  
      //get shoppingList
    let shoppingList = order["purchases"];

    //update emailSent
    database.Orders.set(req.body["orderID"], {"emailSent": true})

    //send email
    let emailSent = await sendgrid.sendOrderCompletionEmail(order, shoppingList)

    res.status(emailSent ? 200 : 403)
    emailSentString = emailSent ? "Email Sent" : "Email Not Sent"
    res.send({"response": emailSentString})
})