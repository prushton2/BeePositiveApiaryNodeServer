const { Model, DataTypes } = require('sequelize');
const sequelize = require('../src/database.js')
const fs = require("fs")
const util = require('util');
const readFile = (fileName) => util.promisify(fs.readFile)(fileName, 'utf8');


class Products extends Model {}

Products.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    },
    imageURL: {
        type: DataTypes.STRING,
    },
    stock: {
      type: DataTypes.INTEGER
    }
}, {
    sequelize,
    modelName: "products",
    timestamps: false
})

module.exports = Products;

//change this? export it to json on write and import it from json on load? I need a persisntent way to store the products aside from the database (I delete it too much)
module.exports.setDefaults = async() => {
    const file = await readFile("./tables/Products.json")
    const productList = JSON.parse(file)
    for(i=0; i<Object.keys(productList).length; i++) { 
        //create product if it doesn't exist, or update if it does
        output = await Products.upsert( productList[i] );
    }
}