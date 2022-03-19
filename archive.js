const fs = require("fs");

archiveDir = "./backups"


module.exports.archiveDB = async() => {
    const date = new Date()
    time = date.getTime()
    fileName = time + ".sqlite"
  
    currentDB = fs.copyFile('./bpa.sqlite', `${archiveDir}/${fileName}`, (e) => {});
    console.log(`Archived to ${fileName}`)  
}

module.exports.loadLatestSave = async() => {
    
}