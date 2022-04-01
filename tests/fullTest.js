//tests all endpoints
const config = require('./testConfig.json');
const products = require('../tables/Products.json');
const axios = require('axios');

const words = ["abstract", "abundant", "absurd", "accept", "accessible", "accurate", "acid", "acoustic", "acrid", "accue"]
const hashedWords = ["996bae6147a5d118541c717a2652d0984329bef434ec8214c65b5c19c32873a2","617490cbba72058f66a645624f7beb42bfcd9bca78ff188ada565bf100e07109","b957a81413f489fbebe072075d9f4704c9fde04494d1eed3164bfba9afe6df41","c1628c8f82c7f4dcfca6beb4d0164be238f7058c2b5c322b05598aaac7ed6451","87bbb8678fa0b44693c860d8f1521ef6d14a1ad1a4b6b0c81a32fbd2a3a4bdfa","f84afeb291a5b2f773e83151cb7aba5f092f9fd5b6c021bb41c42cfc76cb6285","4e10ea4c234be7715608bf7b6dd53aeaad03ddeba6ae43bc6b80ee50f5c40964","caa95ad05749073f5c568ffa50b900207ac6453cc776ca339958727ef28eb900","948834ad1541ac57ad21a1e59276d3ffbebbd50a81a0a8189f14d20141dc1b52","4d779c4890e1ffbfe83c3fde2bbb81a81656ad9046e68f52dbebc2b179bf9e29"]
const firstNames = ['John', 'Jane', 'Joe', 'Jack', 'Jill', 'Jenny', 'Juan', 'Julie', 'Jill', 'Jenny'];
const lastNames = ['Smith', 'Doe', 'Jones', 'Williams', 'Johnson', 'Brown', 'Miller', 'Wilson', 'Moore', 'Taylor'];
const addresses = ['123 Main St', '456 Main St', '789 Main St', '123 Main St', '456 Main St', '789 Main St', '123 Main St', '456 Main St', '789 Main St', '123 Main St'];
const phoneNumbers = ['123-456-7890', '123-456-7890', '123-456-7890', '123-456-7890', '123-456-7890', '123-456-7890', '123-456-7890', '123-456-7890', '123-456-7890', '123-456-7890'];
const websites = ['google.com', 'yahoo.com', 'bing.com', 'facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'linkedin.com', 'pinterest.com', 'reddit.com'];


//create user
user = {    
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    address: addresses[Math.floor(Math.random() * addresses.length)],
    phoneNumber: phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)],
}
user["email"] = user.firstName + user.lastName + '@' + websites[Math.floor(Math.random() * websites.length)];
//create shopping cart
itemsToAdd = parseInt(Math.random() * 10) + 1;
cart = [];
for (let i = 0; i < itemsToAdd; i++) {
    product = products[Math.floor(Math.random() * 9)];
    cart.push({
        "productID": product["id"],
        "subProductID": products[Math.floor(Math.random() * 9)]["id"],
        "amount": Math.floor(Math.random() * 10) + 1
    });
}

function printValidation(fullResult, isValidBoolean, title) {
    console.log(`-----${title}-----`)
    console.log(`Result: `)
    console.log(fullResult)
    console.log(`Autovalidation: ${isValidBoolean}`)
    return isValidBoolean;
}

async function runTests() {
    let totalTests = 9;
    let passedTests = 0;
    let compareData;
    //create order
    let order = {
        "name": user["firstName"] + " " + user["lastName"],
        "email": user["email"],
        "address": user["address"],
        "phoneNumber": user["phoneNumber"],
    }

    let result = await axios.post(`${config["url"]}/add`, {
        "Order": order,
        "Items": cart
    })
    //adding booleans to ints :)
    passedTests += printValidation(result.data, result.data["response"] == "Order Created", "Add Order")

    //get order
    result = await axios.post(`${config["url"]}/getOrders`, {
        "password": config["password"],
        "getArchived": false
    })
    data = result.data["response"][result.data["response"].length-1]

    let orderID = data["id"]

    compareData = {
        "name": data["name"],
        "email": data["email"],
        "address": data["address"],
        "phoneNumber": data["phoneNumber"]
    }
    
    passedTests += printValidation(data, 
        JSON.stringify(compareData) == JSON.stringify(order), 
        "Get Order")

    

    //get purchases
    result = await axios.post(`${config["url"]}/getPurchases`, {
        "password": config["password"],
        "orderID": orderID,
        "getArchived": false,
    })

    compareData = [];
    for (let i = 0; i < result.data["response"].length; i++) {
        compareData.push({
            "productID": result.data["response"][i]["productID"],
            "subProductID": result.data["response"][i]["subProductID"],
            "amount": result.data["response"][i]["amount"]
        })
    }
    
    passedTests += printValidation(result.data["response"], JSON.stringify(compareData) == JSON.stringify(cart), "Get Purchases")

    //test /complete
    result = await axios.post(`${config["url"]}/complete`, {
        "password": config["password"],
        "orderID": orderID,
        "completeStatus": true
    })

    passedTests += printValidation(result.data, result.data["response"] == "Updated completion status", "Mark as Complete")

    result = await axios.post(`${config["url"]}/complete`, {
        "password": config["password"],
        "orderID": orderID,
        "completeStatus": false
    })

    passedTests += printValidation(result.data, result.data["response"] == "Updated completion status", "Mark as Incomplete")

    //test /archive
    result = await axios.post(`${config["url"]}/archive`, {
        "password": config["password"],
        "orderID": orderID,
    })

    passedTests += printValidation(result.data, result.data["response"] == "Order Archived", "Archive Order")

    result = await axios.post(`${config["url"]}/getOrders`, {
        "password": config["password"],
        "getArchived": true
    })
    data = result.data["response"][result.data["response"].length-1]

    //test get archived
    compareData = {
        "name": data["name"],
        "email": data["email"],
        "address": data["address"],
        "phoneNumber": data["phoneNumber"]
    }
    
    passedTests += printValidation(data, 
        JSON.stringify(compareData) == JSON.stringify(order), 
        "Get Archived Order")

    

    //get purchases
    result = await axios.post(`${config["url"]}/getPurchases`, {
        "password": config["password"],
        "orderID": orderID,
        "getArchived": true,
    })

    compareData = [];
    for (let i = 0; i < result.data["response"].length; i++) {
        compareData.push({
            "productID": result.data["response"][i]["productID"],
            "subProductID": result.data["response"][i]["subProductID"],
            "amount": result.data["response"][i]["amount"]
        })
    }
    
    passedTests += printValidation(result.data["response"], JSON.stringify(compareData) == JSON.stringify(cart), "Get Archived Purchases")


    //test /hash
    let index = Math.floor(Math.random() * words.length)
    let word = words[index];
    let hashedWord = hashedWords[index];
    result = await axios.post(`${config["url"]}/hash`, {
        "password": config["password"],
        "text": word
    })

    passedTests += printValidation(result.data, result.data["response"] == hashedWord, "Hash")
    //print total tests and passed tests
    console.log(`-----Total Scores-----`)
    console.log(`Total Tests: ${totalTests}`)
    console.log(`Passed Tests: ${passedTests}`)
    console.log(`Percentage Passed: ${parseInt((passedTests / totalTests) * 100)}%`)
}

runTests()