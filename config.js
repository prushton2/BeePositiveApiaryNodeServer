const fs = require("fs")

//default password is password
defaultConfig = {
    "auth": {
        "passwords": [
            "15ac60994616bb996ca08cdc4042927f032af8245485d5893388be83a16abf79"
        ]
    }
}
filepath = "config.json"



module.exports.createConfigIfNotExists = async() => {
    fs.exists(filepath, (e) => {
        if(!e) {
            fs.open(filepath,'w',function(fileExists, file) {
                fs.writeFile( filepath, JSON.stringify(defaultConfig), (err) => {
                if (err) console.error(err)
                console.log('Data written')
                });
            });
        }
    })
}

module.exports.read = async() => {
    return new Promise(function(resolve, reject) {
        fs.readFile("./config.json", "utf-8", (err, file) => {
            if(err != null) {
                reject(err)
            }
            resolve(JSON.parse(file))
        })
    })
}

module.exports.archiveDB = async() => {
    const date = new Date()
    time = date.getTime()
    fileName = time + ".sqlite"
  
    currentDB = fs.readFileSync('./bpa.sqlite',{encoding:'utf8', flag:'r'});
    // console.log(currentDB);

    fs.writeFileSync(`./backups/${fileName}`, currentDB)
  
}