const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database.js')

class ArchivedPurchases extends Model {}

ArchivedPurchases.init({
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
  modelName: "archivedPurchases",
  timestamps: false
})

module.exports = ArchivedPurchases;