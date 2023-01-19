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
            }
            if(i == null) { continue; }
            return i;
        }
        return -1;
    }

    findAll(clause) {
        this.load();
        let responses = [];

        for(let i in this.table) { //iterate over each element
            let element = this.table[i]; //load it
            element["id"] = i; //add the id to the entry

            for(let j in clause) { //for each clause case
                
                if(element[j] != clause[j]) { //if it doesnt match
                    i = null; //set to null as a flag to skip the .push
                    break; //break out of this for loop
                }
            }
            if(i == null) { continue; } //if the flag is set, skip to the next element
            responses.push(element); //if the flag isnt set, append the element to the responses list
        }
        return responses;
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

    getLastID() {
        this.load();
        let i;
        for(i in this.table) {}
        return i;
    }
}

module.exports.ArchivedOrders = new table("ArchivedOrders");
module.exports.Orders         = new table("Orders");
module.exports.Products       = new table("Products");
module.exports.Users          = new table("Users");