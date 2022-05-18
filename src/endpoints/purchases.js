const express = require("express");

const ArchivedPurchases = require("../../tables/ArchivedPurchases.js");
const Purchases = require("../../tables/Purchases.js");

const enc = require("../encryption.js");

let purchasesRouter = express.Router();

module.exports = purchasesRouter;

purchasesRouter.get("/get", async(req, res) => {

    if(!await enc.verifypassword(req.body["password"])) {
        res.status(401)
        res.send({"response": "Invalid Credentials"})
        return
    }

    let allpurchases;
    if(req.body["getArchived"]) {
        allpurchases = await ArchivedPurchases.findAll({where: {orderID: req.body["orderID"]}})
    } else {
        allpurchases = await Purchases.findAll({where: {orderID: req.body["orderID"]}})
    }

    res.status(200)
    res.send({"response": allpurchases})
    return
})