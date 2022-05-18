const express = require("express");

const Orders = require("../../tables/Orders.js");
const Purchases = require("../../tables/Purchases.js");

const enc = require("../encryption.js");
const sendgrid = require("../sendgrid.js");

let sendgridRouter = express.Router();
module.exports = sendgridRouter;

sendgridRouter.get("/completionEmail", async(req, res) => {
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