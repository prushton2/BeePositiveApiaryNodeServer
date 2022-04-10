const emailValidator = require("email-validator")
const disallowedRegex = /[^a-zA-Z0-9 ,'.\/\\()\[\]{}\-_+=]/g
const phonenumberRegex = /[^0-9\-]/g
const numberRegex = /[^0-9]/g

module.exports.validateInput = (order) => {
    //will validate the input and return the cleaned input, and a boolean indicating if the input had to be cleaned
    //This function does not clean the email. This is because if the email is invalid, the endpoint should return a 400 instead of cleaning it.
    response = {
        "wasCleaned": false,
        "email": {
            "cleanedString": order["email"],
            "wasCleaned":   !module.exports.isValidEmail(order["email"])
        },
        "name": {
            "cleanedString": module.exports.cleanText(order["name"], disallowedRegex),
            "wasCleaned":   !module.exports.isTextClean(order["name"], disallowedRegex)
        },
        "address": {
            "cleanedString": module.exports.cleanText(order["address"], disallowedRegex),
            "wasCleaned":   !module.exports.isTextClean(order["address"], disallowedRegex)
        },
        "phoneNumber": {
            "cleanedString": module.exports.cleanText(order["phoneNumber"], phonenumberRegex),
            "wasCleaned":   !module.exports.isTextClean(order["phoneNumber"], phonenumberRegex)
        }
    }

    if(JSON.stringify(response).indexOf('"wasCleaned":true') > -1) {
        response["wasCleaned"] = true
    }

    return response
}

module.exports.validateShoppingList = (shoppingList) => {
    //will validate the input and return the cleaned input, and a boolean indicating if the input had to be cleaned
    response = {
        "wasCleaned": false,
        "shoppingList": []
    }

    // console.log(response["shoppingList"])
    // console.log(shoppingList)

    for(key in shoppingList) {
        console.log("shop list ")
        console.log(response["shoppingList"])
        console.log("product id "+shoppingList[key]["productID"])
        console.log("clean "+module.exports.cleanText(shoppingList[key]["productID"], numberRegex))
        response["shoppingList"].push({
            "productID": module.exports.cleanText(shoppingList[key]["productID"], numberRegex),
            "subProductID": 0,//module.exports.cleanText(shoppingList[key]["subProductID"], numberRegex),
            "amount": 0//shoppingList[key]["amount"]
        })
    }

    // if(JSON.stringify(response["shoppingList"]) == JSON.stringify(shoppingList)) {
    //     response["wasCleaned"] = true
    // }

    return response
}



module.exports.cleanText = (text, regex) => {
    //will clean the text by removing disallowed characters
    response = text.replace(regex, "")
    return response
}

module.exports.isTextClean = (text, regex) => {
    //will check if the text is clean
    return text == module.exports.cleanText(text, regex)
}

module.exports.isValidEmail = (email) => {
    //will check if the email is valid
    return emailValidator.validate(email)
}