const sendgrid = require('@sendgrid/mail');
const sequelize         = require('./database.js');

const Products           = require('../tables/Products.js');
const config = require("../config/config.json");
//put in env variable
sendgrid.setApiKey(config["sendgrid"]["apiKey"]);

module.exports.sendOrderConfirmation = async(order, shoppingList) => {
    
    if(!config["sendgrid"]["useSendgrid"]) {
        return false
    }

    let date = new Date()

    let shoppingListString = ""

    for(let i = 0; i < shoppingList.length; i++) {
        console.log(shoppingList[i])
        product = await Products.findOne({where: {id: shoppingList[i]["productID"]}})
        subproduct = await Products.findOne({where: {id: shoppingList[i]["subProductID"]}})
        
        console.log(subproduct)

        if(subproduct["id"] != 0) {
            subproduct["name"] += " of "
        }
        shoppingListString += `${shoppingList[i]["amount"]}x ${subproduct["name"]}${product["name"]} <br>`
    }
    const msg = {
    "from":{
        "email": config["sendgrid"]["fromEmail"],
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
              "cost": "$10.00",
              "date": date.toDateString().split(" GMT")[0],
            }
        }
     ],
     "template_id": config["sendgrid"]["orderConfirmationTemplateID"]
  }

    console.log(msg)
    
    await sendgrid.send(msg)
    return true
}