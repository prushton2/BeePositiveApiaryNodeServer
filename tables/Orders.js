const { Model, DataTypes } = require('sequelize');
const sequelize = require('../src/database.js')

class Orders extends Model {}

Orders.init({
  name: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  phoneNumber: {
    type: DataTypes.STRING
  },
  isComplete: {
    type: DataTypes.BOOLEAN
  },
  date: {
    type: DataTypes.INTEGER
  },
  emailSent: {
    type: DataTypes.BOOLEAN
  }
}, {
  sequelize,
  modelName: "orders",
  timestamps: false
})

module.exports = Orders;