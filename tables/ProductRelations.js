const { Model, DataTypes } = require('sequelize');
const sequelize = require('../src/database.js')
const fs = require("fs")
const util = require('util');
const readFile = (fileName) => util.promisify(fs.readFile)(fileName, 'utf8');


class ProductRelations extends Model {}

ProductRelations.init({
    id: {
      	type: DataTypes.INTEGER,
      	primaryKey: true,
  	},
    subProductID: {
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
module.exports.setDefaults = async() => {
    const file = await readFile("./tables/ProductRelations.json")
    const productList = JSON.parse(file)
    for(i=0; i<productList["data"].length; i++) { 
        //create product if it doesn't exist, or update if it does
        output = await ProductRelations.upsert( productList["data"][i] );
    }
}