const express = require("express");

// const Products = require("../../tables/Products.js");
// const ProductRelations = require("../../tables/ProductRelations.js");
// const Users = require("../../tables/Users.js");

const database = require("../database.js");
const ver = require("../verification.js");

const dbRouter = express.Router();

module.exports = dbRouter;

dbRouter.get("/getProducts", async(req, res) => {
    database.Products.load();
    let table = database.Products.table;

    if(req.query.location != null) {
        table = database.Products.findAll({"location": req.query.location});
    }

    res.status(200);
    res.send({"response": {
        "products": table
    }});
})

/* NO CHANCES WITH THIS GARBAGE, this will be redone soon(tm)
dbRouter.patch("/update", async(req, res) => {
    if(!await enc.verifySession(req, res, "admin")) {
        return
    }

    let whereClause = req.body["primaryKeys"]
    let response
    

    //not my proudest moment, but this endpoint seems vulnerable and I dont want to take any chances
    
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
    if(!await enc.verifySession(req, res, "admin")) {
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
    if(!await enc.verifySession(req, res, "admin")) {
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

dbRouter.post("/getJson", async(req, res) => {
	if(!await enc.verifySession(req, res, "admin")) {
		return
	}

	let json;

	switch(req.body["table"]) {
        case "Products":
            json = await Products.findAll();
            break;
        case "ProductRelations":
            json = await ProductRelations.findAll();
            break;
        case "Users":
			json = await Users.findAll();
            break;
        default:
            res.status(400);
            res.send({"response": "Invalid table"});
            break;
    }

	
    res.status(200);
    res.send({"response": json});
})*/

dbRouter.post("/hash", async(req, res) => {
    if(!await ver.verifySession(req, res, "admin")) {
        return
    }

    res.status(200)
    res.send({"response": ver.hash(req.body["text"])})
})