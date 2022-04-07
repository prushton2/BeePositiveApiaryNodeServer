const fs = require("fs")

//default password is password
defaultConfig = {
    "auth": {
        "passwords": [
            "15ac60994616bb996ca08cdc4042927f032af8245485d5893388be83a16abf79"
        ]
    },
    "pricing": {
        "tax": 0.0625
    },
    "sendgrid": {
        "useSendgrid": false,
        "fromEmail": "",
        "orderConfirmationTemplateID": "",
        "orderCompletionTemplateID": ""
    }
}
configpath = "./config/config.json"
envpath = "./.env"


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