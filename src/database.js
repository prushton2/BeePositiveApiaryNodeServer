//This file handles all database calls. No direct database calls should be present anywhere

const fs = require('fs');

let Users = {};
let Orders = {};
let Products = {};

async function loadFiles() {
    Users = await fs.readFileSync("../tables/Users.json");
}