const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('node:path');
console.log("DBHandler does actually exist")

export async function initSql(dbPath) {
    let db = await open({
        filename: path.join(dbPath, 'finance.db'),
        driver: sqlite3.Database
    });
    return db;
}
