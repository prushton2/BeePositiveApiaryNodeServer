const sendgrid = require('@sendgrid/mail');
const config = require("../config/config.json");
sendgrid.setApiKey(config["sendgrid"]["apiKey"]);

async function sendEmail(msg) {
    return new Promise(function(resolve, reject) {
        sendgrid.send(msg).then(() => {
            resolve()
        })
    })
}

module.exports.sendOrderConfirmation = async(order, shoppingList) => {
    
    const msg = {
        to: "peterrushton418@gmail.com",
        from: config["sendgrid"]["fromEmail"],
        subject: "Test Subject",
        text: "Test Text",
        html: "<b>Test HTML</b>",
    }

    await sendEmail(msg)

    return true
}