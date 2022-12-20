//This file handles all database calls. No direct database calls should be present anywhere

const fs = require('fs');


class table {
    constructor(name) {
        this.name = name;
        this.table = {};
    }

    load() {
        this.table = JSON.parse(fs.readFileSync(`tables/${this.name}.json`, {encoding:'utf-8', flag:'r'}));
    }

    save() {
        fs.writeFileSync(`tables/${this.name}.json`, JSON.stringify(this.table));
    }

    findOne(clause) {
        this.load();

        for(let i in this.table) {
            let element = this.table[i];
        
            for(let j in clause) {
                
                if(element[j] != clause[j]) {
                    i = null;
                    break;
                }
                console.log("eq");
            }
            if(i == null) { continue; }
            return i;
        }
        return -1;
    }

    create(primaryKey, properties) {
        this.load();
        this.table[primaryKey] = properties;
        this.save();
        return { primaryKey: primaryKey, table: this.table[primaryKey] };
    }

    delete(primaryKey) {
        this.load();
        delete this.table[primaryKey];
        this.save();
    }

    get(primaryKey) {
        this.load();
        return { primaryKey: primaryKey, table: this.table[primaryKey] };
    }

    set(primaryKey, newData) {
        this.load();
        let element = this.table[primaryKey];
        for(let i in newData) {
            element[i] = newData[i];
        }
        this.save();
    }    
}

module.exports.ArchivedOrders = new table("ArchivedOrders");
module.exports.Orders         = new table("Orders");
module.exports.Products       = new table("Products");
module.exports.Users          = new table("Users");