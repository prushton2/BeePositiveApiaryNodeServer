const { Model, DataTypes } = require('sequelize');
const sequelize = require('../src/database.js')

class ArchivedOrders extends Model {}

ArchivedOrders.init({
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
  reasonArchived: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  modelName: "archivedOrders",
  timestamps: false
})

module.exports = ArchivedOrders;