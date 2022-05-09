const { Model, DataTypes } = require('sequelize');
const sequelize = require('../src/database.js')
const fs = require("fs")
const util = require('util');
const readFile = (fileName) => util.promisify(fs.readFile)(fileName, 'utf8');


class ProductRelations extends Model {}

ProductRelations.init({
    productId: {
      	type: DataTypes.INTEGER,
      	primaryKey: true,
  	},
    subProductId: {
		type: DataTypes.INTEGER,
		primaryKey: true,
    },
    price: {
        type: DataTypes.DOUBLE,
    },
	imageURL: {
		type: DataTypes.STRING,
	},
    increment: {
        type: DataTypes.DOUBLE,
    }
}, {
    sequelize,
    modelName: "productRelations",
    timestamps: false
})

module.exports = ProductRelations;

//change this? export it to json on write and import it from json on load? I need a persisntent way to store the products aside from the database (I delete it too much)
module.exports.setProductRelations = async() => {
    const file = await readFile("./tables/ProductRelations.json")
    const productList = JSON.parse(file)
    for(i=0; i<Object.keys(productList).length; i++) { 
        //create product if it doesn't exist, or update if it does
        output = await Products.upsert( productList[i] );
    }
}