const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js')

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

productList = {
    0: {
        "id"           :0,
        "name"         :"",
        "price"        :1,
        "unit"         :"&nbsp&nbsp&nbsp",
        "description"  :"",
        "increment"    :0,
        "isInStock"    :true
    },
    1: {
        "id"           :100,
        "name"         :"Cuticle Salve",
        "price"        :4.99,
        "unit"         :"&nbsp&nbsp&nbsp",
        "description"  :"Cuticle Salve",
        "increment"    :1,
        "isInStock"    :true
    },
    2: {
        "id"           :101,
        "name"         :"Spa in a Jar",
        "price"        :2.99,
        "unit"         :"&nbsp&nbsp&nbsp",
        "description"  :"Spa",
        "increment"    :1,
        "isInStock"    :true
    },
    3: {
        "id"           :200,
        "name"         :"Plain Honey",
        "price"        :4.99,
        "unit"         :"lb",
        "description"  :"Plain honey",
        "increment"    :.5,
        "isInStock"    :true
    },
    4: {
        "id"           :201,
        "name"         :"Cranberry Honey",
        "price"        :5.49,
        "unit"         :"lb",
        "description"  :"Cranberry flavored honey",
        "increment"    :.5,
        "isInStock"    :true
    },
    5: {
        "id"           :300,
        "name"         :"8oz Jar",
        "price"        :0.5,
        "unit"         :"&nbsp&nbsp&nbsp",
        "description"  :"",
        "increment"    :.5,
        "isInStock"    :true
    },
    6: {
        "id"           :302,
        "name"         :"10oz Jar",
        "price"        :0.625,
        "unit"         :"&nbsp&nbsp&nbsp",
        "description"  :"",
        "increment"    :0.625,
        "isInStock"    :true
    },
    7: {
        "id"           :303,
        "name"         :"1lb Jar",
        "price"        :1,
        "unit"         :"&nbsp&nbsp&nbsp",
        "description"  :"",
        "increment"    :1,
        "isInStock"    :true
    },
    8: {
        "id"           :304,
        "name"         :"2lb Jar",
        "price"        :2,
        "unit"         :"&nbsp&nbsp&nbsp",
        "description"  :"",
        "increment"    :2,
        "isInStock"    :true
    }
}


module.exports.setProducts = async() => {
    for(i=0; i<Object.keys(productList).length; i++) {
        //create product if it doesn't exist, or update if it does
        output = await Products.upsert( productList[i] );
    }
}