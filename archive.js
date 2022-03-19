const fs = require("fs");

archiveDir = "./backups"
mainDB = "./bpa.sqlite"
extension = ".sqlite"


async function getFileToLoad(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, items) => {
            try {
                fileToLoad = items[items.length-2]
                resolve(fileToLoad)
            } catch {
                reject(err)
            }
        });
    })
}

module.exports.archiveDB = async() => {
    const date = new Date()
    time = date.getTime()
    fileName = time + extension
  
    fs.copyFile(mainDB, `${archiveDir}/${fileName}`, (e) => {});
    console.log(`Archived ${mainDB} to ${fileName}`)  
}

module.exports.loadLatestSave = async() => {
    fileToLoad = await getFileToLoad(archiveDir)
    fs.rm(mainDB, {recursive: false}, (e) => {
        fs.copyFile(`${archiveDir}/${fileToLoad}`, `${mainDB}`, (e) => {});
        console.log("Save Loaded")
    })
}