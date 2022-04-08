const emailValidator = require("email-validator")
const disallowedRegex = /[^a-zA-Z0-9 '.\/\\()\[\]{}\-_+=]/g
const numberRegex = /[^0-9\-]/g

module.exports.validateInput = (order) => {
    //will validate the input and return the cleaned input, and a boolean indicating if the input had to be cleaned
    response = {
        "email": {
            "cleanedString": order["email"],
            "wasCleaned": !module.exports.validateEmail(order["email"])
        },
        "name": {
            "cleanedString": module.exports.cleanText(order["name"]),
            "wasCleaned": !module.exports.isTextClean(order["name"])
        },
        "address": {
            "cleanedString": module.exports.cleanText(order["address"]),
            "wasCleaned": !module.exports.isTextClean(order["address"])
        },
        "phoneNumber": {
            "cleanedString": module.exports.cleanPhoneNumber(order["phoneNumber"]),
            "wasCleaned": !module.exports.isPhoneNumberClean(order["phoneNumber"])
        }
    }

    return response
}

module.exports.validateEmail = (email) => {
    //will validate the email and return the cleaned email, and a boolean indicating if the email had to be cleaned
    response = emailValidator.validate(email)
    return response
}

module.exports.isTextClean = (text) => {
    //will check if the text is clean and return a boolean
    return module.exports.cleanText(text) == text
}

module.exports.cleanText = (text) => {
    //will clean the text and return the cleaned text, and a boolean indicating if the text had to be cleaned
    response = text.replace(disallowedRegex, "")
    return response
}

module.exports.cleanPhoneNumber = (phoneNumber) => {
    //will clean the phone number and return the cleaned phone number, and a boolean indicating if the phone number had to be cleaned
    response = phoneNumber.replace(numberRegex, "")
    return response
}

module.exports.isPhoneNumberClean = (phoneNumber) => {
    //will check if the phone number is clean and return a boolean
    return module.exports.cleanPhoneNumber(phoneNumber) == phoneNumber
}