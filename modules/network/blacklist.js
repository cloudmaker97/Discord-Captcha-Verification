const fs = require('fs');
const readline = require('readline');

class Blacklist {
    constructor() {
        this.blacklist = [];
    }

    async loadBlacklist() {
        const files = ["vpn.txt", "datacenter.txt"];
        const folder = "./modules/network/blacklist/";
        for (const file of files) {
            const fileStream = fs.createReadStream(folder + file);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });
            for await (const line of rl) {
                this.add(line);
            }
        }

        return new Promise((resolve) => {
            return resolve(this.blacklist);
        });
    }

    add(ip) {
        if(!this.isBlacklisted(ip))
        this.blacklist.push(ip);
    }

    remove(ip) {
        this.blacklist = this.blacklist.filter(blacklistedIp => blacklistedIp !== ip);
    }

    isBlacklisted(ip) {
        return this.blacklist.includes(ip);
    }
}

module.exports = new Blacklist();