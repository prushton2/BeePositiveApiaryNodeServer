const { Sequelize } = require('sequelize');


const sequelize = new Sequelize("bpa-db", "user", "pass", {
  dialect: "sqlite",
  host: "./bpa.sqlite",
  logging: false
})

module.exports = sequelize