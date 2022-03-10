const { Model, DataTypes } = require('sequelize');
const sequelize = require('./database.js')

class Orders extends Model {}

Orders.init({
  name: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: "orders"
})

module.exports = Orders;