const Database = require("@replit/database")
const db = new Database()
const crypto = require("crypto")
const { Sequelize } = require('sequelize');


const sequelize = new Sequelize("bpa-db", "user", "pass", {
  dialect: "sqlite",
  host: "./bpa.sqlite",
})

module.exports = sequelize