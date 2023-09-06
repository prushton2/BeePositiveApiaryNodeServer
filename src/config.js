const fs = require("fs")

//default password is password
defaultConfig = {
	"environment": {
		"environment-type": "development"
	},
    "domain": {
        "frontend-url": "https://www.example.com",
        "backend-url": "https://backend.example.com",
        "cdn-url": "https://cdn.example.com"
    },
    "auth": {
        "GoogleOAuth2ClientID": "example.apps.googleusercontent.com",
    },
    "pricing": {
        "tax": 0.0625
    },
    "sendgrid": {
        "bccToSender": true,
        "useSendgrid": false,
        "fromEmail": "",
        "orderConfirmationTemplateID": "",
        "orderCompletionTemplateID": "",
		"orderAdminCompletionTemplateID": ""
    }
}
const configpath = "./config/config.json"
const envpath = "./.env"


module.exports.createConfigIfNotExists = async() => {
    fs.exists(configpath, async (e) => {
        if(!e) {
            await fs.mkdirSync("./config")
            fs.open(configpath,'w',function(fileExists, file) {
                fs.writeFile( configpath, JSON.stringify(defaultConfig), (err) => {
                    if (err) {
                        console.error(err);
                        return
                    }
                    console.log('Data written')
                });
            });
        }
    })
}

module.exports.createEnvIfNotExists = async() => {
    fs.exists(envpath, async (e) => {
        if(!e) {
            fs.open(envpath,'w',function(fileExists, file) {
                fs.writeFile( envpath, "", (err) => {
                    if (err) {
                        console.error(err);
                        return
                    }
                    console.log('Data written')
                });
            });
        }
    })
}

module.exports.read = async() => {
    return new Promise(function(resolve, reject) {
        fs.readFile(configpath, "utf-8", (err, file) => {
            if(err != null) {
                reject(err)
            }
            resolve(JSON.parse(file))
        })
    })
}   