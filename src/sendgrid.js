const sendgrid = require('@sendgrid/mail');
const sequelize = require('./database.js');
require("dotenv").config()

const Products = require('../tables/Products.js');
const config = require("../config/config.json");

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.sendOrderConfirmation = async(order, shoppingList) => {
    
    if(!config["sendgrid"]["useSendgrid"]) {
        return false
    }

    let date = new Date()

    let shoppingListString = ""
    let totalcost = 0

    for(let i = 0; i < shoppingList.length; i++) {
        product = await Products.findOne({where: {id: shoppingList[i]["productID"]}})
        subproduct = await Products.findOne({where: {id: shoppingList[i]["subProductID"]}})
        
        cost = (product["price"] * subproduct["price"] * shoppingList[i]["amount"]).toFixed(2)
        totalcost += parseFloat(cost)
        if(subproduct["id"] != 0) {
            subproduct["name"] += " of "
        }
        shoppingListString += `${shoppingList[i]["amount"]}x ${subproduct["name"]}${product["name"]} ($${cost})<br>`
    }

    totalcost += totalcost * config["pricing"]["tax"]
    const msg = {
        "from":{
            "email": config["sendgrid"]["fromEmail"],
            "name": "Bee Positive Apiary"
        },
        "personalizations":[
            {
                "to":[
                    {
                        "email":order["email"]
                    }
                ],
                "dynamic_template_data":{
                    "name": order["name"],
                    "receipt": shoppingListString,
                    "cost": `$${totalcost.toFixed(2)}`,
                    "tax": `${100*config["pricing"]["tax"]}%`,
                    "date": date.toDateString().split(" GMT")[0],
                }
            }
        ],
        "template_id": config["sendgrid"]["orderConfirmationTemplateID"]
    }
    await sendgrid.send(msg)
    return true
}