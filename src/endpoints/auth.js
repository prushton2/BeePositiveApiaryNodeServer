const express = require("express")

const authRouter = express.Router()

module.exports = authRouter


authRouter.get("/", (req, res) => {
    res.send("Hello World")
})