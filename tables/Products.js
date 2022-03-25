const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js')
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
    price: {
        type: DataTypes.INTEGER,
    },
    description: {
        type: DataTypes.STRING,
    },
    unit: {
        type: DataTypes.STRING,
    },
    increment: {
        type: DataTypes.DOUBLE,
    },
    isInStock: {
      type: DataTypes.BOOLEAN
    }
}, {
    sequelize,
    modelName: "products",
    timestamps: false
})

module.exports = Products;

module.exports.setProducts = async() => {
    const file = await readFile("./tables/products.json")
    const productList = JSON.parse(file)
    for(i=0; i<Object.keys(productList).length; i++) {
        //create product if it doesn't exist, or update if it does
        output = await Products.upsert( productList[i] );
    }
}