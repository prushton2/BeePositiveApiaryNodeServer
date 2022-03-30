const { Sequelize } = require('sequelize');


const sequelize = new Sequelize("bpa-db", "root", "password", {
  dialect: "sqlite",
  host: "./bpa.sqlite",
  logging: false
})

module.exports = sequelize