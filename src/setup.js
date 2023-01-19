const config = require('./config.js');
const fs = require("fs");

config.createConfigIfNotExists()
console.log("Config is ready")
config.createEnvIfNotExists()
console.log("Env is ready")

fs.writeFileSync("tables/Users.json", "{}");
fs.writeFileSync("tables/Orders.json", "{}");
fs.writeFileSync("tables/ArchivedOrders.json", "{}");
fs.writeFileSync("tables/Products.json", "{}");