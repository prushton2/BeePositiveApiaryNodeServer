const { Model, DataTypes } = require('sequelize');
const sequelize = require('../src/database.js')

class Purchases extends Model {}

Purchases.init({
  orderID: {
    type: DataTypes.INTEGER
  },
  productID: {
    type: DataTypes.INTEGER
  },
  subProductID: {
    type: DataTypes.INTEGER
  },
  amount: {
    type: DataTypes.INTEGER
  }
}, {
  sequelize,
  modelName: "purchases",
  timestamps: false
})

module.exports = Purchases;