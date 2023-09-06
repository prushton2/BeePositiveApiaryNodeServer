const fs = require("fs");

let archiveDir = "backups"
let db = "tables"


async function getFileToLoad(dir) {
    return fs.readdirSync(dir)[fs.readdirSync(dir).length - 2];
}

module.exports.archiveDB = async() => {
    const date = new Date();
    let directoryName = date.getTime();
    

    let tables = fs.readdirSync(db);
    
    fs.mkdirSync(`${archiveDir}/${directoryName}`);
    tables.forEach(element => {
        fs.copyFileSync(`${db}/${element}`, `${archiveDir}/${directoryName}/${element}`);
    });
}

module.exports.loadLatestSave = async() => {
    let archiveToLoad = await getFileToLoad(archiveDir);
    let tablesToLoad = fs.readdirSync(`${archiveDir}/${archiveToLoad}`);

    tablesToLoad.forEach(element => {
        fs.rmSync(`${db}/${element}`);
        fs.copyFileSync(`${archiveDir}/${archiveToLoad}/${element}`, `${db}/${element}`);
    });
}