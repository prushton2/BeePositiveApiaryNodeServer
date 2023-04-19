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
    let table = database.Products.findAll({});

    if(req.query.location != null) {
        table = database.Products.findAll({"location": req.query.location});
    }

    res.status(200);
    res.send({"response": {
        "products": table
    }});
})


dbRouter.patch("/setProduct", async(req, res) => {
	if(!await ver.verifySession(req, res, "admin")) {
        return
    }
	database.Products.load();
	database.Products.create(req.body.id, req.body.newProduct);
	database.Products.save();

	res.status(200);
	res.send({"response": "Updated product"});
});

dbRouter.patch("/delete", async(req, res) => {
	if(!await ver.verifySession(req, res, "admin")) {
        return
    }
	database.Products.load();
	database.Products.delete(req.body.id);
	database.Products.save();

	res.status(200);    
	res.send({"response": "Deleted product"});
});


dbRouter.post("/hash", async(req, res) => {
    if(!await ver.verifySession(req, res, "admin")) {
        return
    }

    res.status(200)
    res.send({"response": ver.hash(req.body["text"])})
})