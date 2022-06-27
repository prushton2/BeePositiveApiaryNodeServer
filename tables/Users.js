const { Model, DataTypes } = require('sequelize');
const sequelize = require('../src/database.js')

class Users extends Model {}

Users.init({
    ID: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    authID: {
        type: DataTypes.STRING
    },
    authType: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
    pfpURL: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    permissions: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: "users",
    timestamps: false
})

module.exports = Users;