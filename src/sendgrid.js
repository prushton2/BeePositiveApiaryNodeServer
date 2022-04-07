const sendgrid = require('@sendgrid/mail');
const sequelize = require('./database.js');
require("dotenv").config()

const Products = require('../tables/Products.js');
const config = require("../config/config.json");

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);


async function sendMail(msg) {
    fulfilled = await sendgrid.send(msg).then(fulfilled => {return fulfilled})
    return fulfilled
}

async function createShoppingListString(shoppingList) {
    
    let shoppingListString = ""
    let totalcost = 0

    for(let i = 0; i < shoppingList.length; i++) {
        let product = await Products.findOne({where: {id: shoppingList[i]["productID"]}})
        let subproduct = await Products.findOne({where: {id: shoppingList[i]["subProductID"]}})

        let cost = product["price"] * subproduct["price"] * shoppingList[i]["amount"]
        cost = cost.toFixed(2)
        totalcost += parseFloat(cost)
        if(subproduct["id"] != 0) {
            subproduct["name"] += " of "
        }
        shoppingListString += `${shoppingList[i]["amount"]}x ${subproduct["name"]}${product["name"]} ($${cost})<br>`
    }
    totalcost += totalcost * config["pricing"]["tax"]
    return [shoppingListString, totalcost]
}

module.exports.sendOrderConfirmation = async(order, shoppingList) => {
    
    if(!config["sendgrid"]["useSendgrid"]) {
        return false
    }

    let date = new Date()

    let output = await createShoppingListString(shoppingList)
    let shoppingListString = output[0]
    let totalcost = output[1]

    const msg = {
        "from":{
            "email": config["sendgrid"]["fromEmail"],
            "name": "Bee Positive Apiary"
        },
        "personalizations":[
            {
                "to":[
                    {
                        "email": order["email"]
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
    fulfilled = await sendMail(msg)
    return fulfilled
}

module.exports.sendOrderCompletionEmail = async(order) => {
    
    if(!config["sendgrid"]["useSendgrid"]) {
        return false
    }

    let date = new Date()

    const msg = {
        "from": {
            "email": config["sendgrid"]["fromEmail"],
            "name": "Bee Positive Apiary"
        },
        "personalizations": [
            {
                "to": [
                    {
                        "email": order["email"]
                    }
                ],
                "dynamic_template_data": {
                    "name": order["name"],
                    "date": date.toDateString().split(" GMT")[0]
                }
            }
        ],
        "template_id": config["sendgrid"]["orderCompletionTemplateID"]

    }

    fulfilled = await sendMail(msg)

    return fulfilled
}

