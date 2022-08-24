// const Sequelize = require("sequelize")
const sequelize          = require('../src/database.js');
const queryInterface = sequelize.getQueryInterface();

const Products           = require('../tables/Products.js');
const ProductRelations   = require('../tables/ProductRelations.js');
const ArchivedOrders     = require('../tables/ArchivedOrders.js');
const ArchivedPurchases  = require('../tables/ArchivedPurchases.js');
const Orders             = require('../tables/Orders.js');
const Purchases          = require('../tables/Purchases.js');
const Sessions           = require("../tables/Sessions.js")
const Users              = require("../tables/Users.js");

/* Add column 

*/


async function main() {
    console.log(await sequelize.query("ALTER TABLE ArchivedOrders ADD COLUMN viewKey varchar(255);"));
}

main()