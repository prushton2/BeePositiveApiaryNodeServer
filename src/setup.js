const config = require('./config.js');

config.createConfigIfNotExists()
console.log("Config is ready")
config.createEnvIfNotExists()
console.log("Env is ready")
