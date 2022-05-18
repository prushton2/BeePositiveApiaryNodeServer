const fs = require("fs")

//default password is password
defaultConfig = {
    "domain": {
        "frontend-url": "https://www.example.com",
        "backend-url": "https://backend.example.com",
        "cdn-url": "https://cdn.example.com"
    },
    "auth": {
        "passwords": [
            "15ac60994616bb996ca08cdc4042927f032af8245485d5893388be83a16abf79"
        ]
    },
    "pricing": {
        "tax": 0.0625
    },
    "sendgrid": {
        "bccToSender": true,
        "useSendgrid": false,
        "fromEmail": "",
        "orderConfirmationTemplateID": "",
        "orderCompletionTemplateID": ""
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