const { Model, DataTypes } = require('sequelize');
const sequelize = require('./database.js')

class Purchases extends Model {}

Purchases.init({
  orderID: {
    type: DataTypes.STRING
  },
  productID: {
    type: DataTypes.STRING
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