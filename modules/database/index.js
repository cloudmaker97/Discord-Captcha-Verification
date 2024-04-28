const sqlite3 = require('sqlite3').verbose();
const { resolve } = require('path');
class Database {
    constructor() {
        this.db = new sqlite3.Database(resolve(__dirname, '../../database.sqlite'), (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Connected to the database');
            }
        });

        this.db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, discord_id TEXT, discord_guild_id TEXT, ip TEXT, timestamp INTEGER)');
        this.db.run('CREATE TABLE IF NOT EXISTS attempts (id INTEGER PRIMARY KEY, discord_id TEXT, discord_guild_id TEXT, ip TEXT, timestamp INTEGER, reason TEXT)');
    }

    async addAttempt(discordId, discordGuildId, ip, reason) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO attempts (discord_id, discord_guild_id, ip, timestamp, reason) VALUES (?, ?, ?, ?, ?)', [discordId, discordGuildId, ip, Date.now(), reason], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async addUser(discordId, discordGuildId, ip) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO users (discord_id, discord_guild_id, ip, timestamp) VALUES (?, ?, ?, ?)', [discordId, discordGuildId, ip, Date.now()], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async ipUsedInLastDay(ip) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE ip = ? AND timestamp >= ?', [ip, Date.now() - 86400000], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row !== undefined);
                }
            });
        });
    }

    async isUserVerified(discordId, discordGuildId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE discord_id = ? AND discord_guild_id = ?', [discordId, discordGuildId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row !== undefined);
                }
            });
        });
    }

    getDatabase() {
        return this.db;
    }
}

module.exports = new Database();