const { Model, DataTypes } = require('sequelize');
const sequelize = require('../src/database.js')

class Sessions extends Model {}

Sessions.init({
    userID: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    sessionID: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    expDate: {
        type: DataTypes.INTEGER
    }
}, {
    sequelize,
    modelName: "sessions",
    timestamps: false
})

module.exports = Sessions;