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

dbRouter.patch("/update", async(req, res) => {
    if(!await enc.verifypassword(req.body["password"])) {
        res.status(401)
        res.send({"response": "Invalid Credentials"})
        return
    }

    let whereClause = req.body["primaryKeys"]
    let response

    if(req.body["table"] == "ProductRelations") {
        response = await ProductRelations.findOne({where: whereClause})
    } else if(req.body["table"] == "Products") {
        response = await Products.findOne({where: whereClause})
    } else {
        res.status(400)
        res.send({"response": "Invalid table"})
        return
    }
    
    try {
        response[req.body["column"]] = req.body["value"]
        response.save()
    } catch {
        res.status(400)
        res.send({"response": "Invalid column"})
        return
    }

    res.status(200)
    res.send({"response": "Product Updated"})
})

dbRouter.post("/newEntry", async(req, res) => {
    if(!await enc.verifypassword(req.body["password"])) {
        res.status(401)
        res.send({"response": "Invalid Credentials"})
        return
    }

    let newEntry = req.body["values"]

    try {
        
        switch(req.body["table"]) {
            case "Products":
                await Products.create(newEntry)
                break
            case "ProductRelations":
                await ProductRelations.create(newEntry)
                break
            default:
                res.status(400)
                res.send({"response": "Invalid table"})
                break
        }
    } catch {
        res.status(400)
        res.send({"response": "Internal error caused by invalid columns"})
        return
    }

    res.status(200)
    res.send({"response": "New entry created"})
})

dbRouter.delete("/deleteEntry", async(req, res) => {
    if(!await enc.verifypassword(req.body["password"])) {
        res.status(401)
        res.send({"response": "Invalid Credentials"})
        return
    }

})

dbRouter.post("/hash", async(req, res) => {
    if(!await enc.verifypassword(req.body["password"])) { // exit if password is invalid
        res.status(401)
        res.send({"response": "Invalid Credentials"})
        return
    }

    res.status(200)
    res.send({"response": enc.hash(req.body["text"])})
})