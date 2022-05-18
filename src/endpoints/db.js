const express = require("express");

const Products = require("../../tables/Products.js");
const ProductRelations = require("../../tables/ProductRelations.js");

const enc = require("../encryption.js");

const dbRouter = express.Router();

module.exports = dbRouter;

dbRouter.get("/getProducts", async(req, res) => {
    res.status(200)
    res.send({"response": {
        "products": await Products.findAll(),
        "productRelations": await ProductRelations.findAll()
    }})
})

dbRouter.get("/hash", async(req, res) => {
    if(!await enc.verifypassword(req.body["password"])) { // exit if password is invalid
        res.status(401)
        res.send({"response": "Invalid Credentials"})
        return
    }

    res.status(200)
    res.send({"response": enc.hash(req.body["text"])})
})