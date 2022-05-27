const express = require("express");

const Products = require("../../tables/Products.js");
const ProductRelations = require("../../tables/ProductRelations.js");
const Users = require("../../tables/Users.js");

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
    if(!await enc.verifySession(req.body, res, "admin")) {
        return
    }

    let whereClause = req.body["primaryKeys"]
    let response

    if(req.body["table"] == "ProductRelations") {
        response = await ProductRelations.findOne({where: whereClause})
    } else if(req.body["table"] == "Products") {
        response = await Products.findOne({where: whereClause})
    } else if(req.body["table"] == "Users") {
        response = await Users.findOne({where: whereClause})
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
    if(!await enc.verifySession(req.body, res, "admin")) {
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
            case "Users":
                await Users.create(newEntry)
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
    if(!await enc.verifySession(req.body, res, "admin")) {
        return
    }

    let whereClause = req.body["primaryKeys"]

    switch(req.body["table"]) {
        case "Products":
            await Products.destroy({where: whereClause})
            break
        case "ProductRelations":
            await ProductRelations.destroy({where: whereClause})
            break
        case "Users":
            await Users.destroy({where: whereClause})
            break
        default:
            res.status(400)
            res.send({"response": "Invalid table"})
            break
    }

    res.status(200)
    res.send({"response": "Entry deleted"})
})

dbRouter.post("/hash", async(req, res) => {
    if(!await enc.verifySession(req.body, res, "admin")) {
        return
    }

    res.status(200)
    res.send({"response": enc.hash(req.body["text"])})
})