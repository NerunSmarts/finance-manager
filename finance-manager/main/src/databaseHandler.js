import { get } from 'http';

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

export async function createTables(db) {
    await db.exec(`CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        date REAL NOT NULL,
        type TEXT NOT NULL
    )`);
    await db.exec(`CREATE TABLE IF NOT EXISTS income (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        date REAL NOT NULL,
        type TEXT NOT NULL
    )`);
    await db.exec(`CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticker TEXT NOT NULL,
        amount REAL NOT NULL,
        date REAL NOT NULL
    )`);
    await db.exec(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value TEXT NOT NULL
    )`);
}

export async function fixSettings(db) {
    let settings = await db.all('SELECT * FROM settings');
    let settingNames = settings.map((setting) => setting.name);
    if (!settingNames.includes('stockAPIKey')) {
        await db.run('INSERT INTO settings (name, value) VALUES (?, ?)', ['stockAPIKey', 'null']);
    }
    if (!settingNames.includes('incomeChartHLength')) {
        await db.run('INSERT INTO settings (name, value) VALUES (?, ?)', ['incomeChartHLength', '3 months']);
    }
    if (!settingNames.includes('expenseChartHLength')) {
        await db.run('INSERT INTO settings (name, value) VALUES (?, ?)', ['expenseChartHLength', '3 months']);
    }
    if (!settingNames.includes('investmentChartHLength')) {
        await db.run('INSERT INTO settings (name, value) VALUES (?, ?)', ['investmentChartHLength', '3 months']);
    }
}

export async function insertExpense(db, name, amount, date, type) {
    await db.run('INSERT INTO expenses (name, amount, date, type) VALUES (?, ?, ?, ?)', [name, amount, date, type]);
    return true
}

export async function insertIncome(db, name, amount, date, type) {
    await db.run('INSERT INTO income (name, amount, date, type) VALUES (?, ?, ?, ?)', [name, amount, date, type]);
    return true
}

export async function insertInvestment(db, ticker, amount, date) {
    await db.run('INSERT INTO investments (ticker, amount, date) VALUES (?, ?, ?)', [ticker, amount, date]);
    return true
}

export async function insertSetting(db, name, value) {
    await db.run('INSERT INTO settings (name, value) VALUES (?, ?)', [name, value]);
    return true
}

export async function getAllExpenses(db) {
    return await db.all('SELECT * FROM expenses');
}

export async function getAllIncome(db) {
    return await db.all('SELECT * FROM income');
}

export async function getAllInvestments(db) {
    return await db.all('SELECT * FROM investments');
}

export async function getSettings(db) {
    return await db.all('SELECT * FROM settings');
}

export async function getExpense(db, id) {
    return await db.get('SELECT * FROM expenses WHERE id = ?', [id]);
}

export async function getIncome(db, id) {
    return await db.get('SELECT * FROM income WHERE id = ?', [id]);
}

export async function getInvestment(db, id) {
    return await db.get('SELECT * FROM investments WHERE id = ?', [id]);
}

export async function getSetting(db, id) {
    return await db.get('SELECT * FROM settings WHERE id = ?', [id]);
}

export async function deleteExpense(db, id) {
    console.log(id);
    console.log(await db.run('CREATE TABLE temp_expenses AS SELECT ROW_NUMBER() OVER (ORDER BY id) AS id, name, amount, date, type FROM expenses'));
    await db.run('DROP TABLE expenses');
    await db.run('ALTER TABLE temp_expenses RENAME TO expenses');
    return await db.run('DELETE FROM expenses WHERE id = ?', [id]);

}

export async function deleteIncome(db, id) {
    console.log(id);
    console.log(await db.run('CREATE TABLE temp_income AS SELECT ROW_NUMBER() OVER (ORDER BY id) AS id, name, amount, date, type FROM income'));
    await db.run('DROP TABLE income');
    await db.run('ALTER TABLE temp_income RENAME TO income');
    return await db.run('DELETE FROM income WHERE id = ?', [id]);
}

export async function deleteInvestment(db, id) {
    return await db.run('DELETE FROM investments WHERE id = ?', [id]);
}

export async function deleteSetting(db, id) {
    return await db.run('DELETE FROM settings WHERE id = ?', [id]);
}

export async function updateExpense(db, id, name, amount, date, type) {
    return await db.run('UPDATE expenses SET name = ?, amount = ?, date = ?, type = ? WHERE id = ?', [name, amount, date, type, id]);
}

export async function updateIncome(db, id, name, amount, date, type) {
    return await db.run('UPDATE income SET name = ?, amount = ?, date = ?, type = ? WHERE id = ?', [name, amount, date, type, id]);
}

export async function updateInvestment(db, id, ticker, amount, date) {
    return await db.run('UPDATE investments SET ticker = ?, amount = ?, date = ? WHERE id = ?', [ticker, amount, date, id]);
}

export async function updateSetting(db, id, name, value) {
    return await db.run('UPDATE settings SET name = ?, value = ? WHERE id = ?', [name, value, id]);
}

export async function closeDb(db) {
    await db.close();
    return true
}

export async function sortIncomeByTime(db) {
    return await db.all('SELECT * FROM income ORDER BY date');
}

export async function sortExpensesByTime(db) {
    return await db.all('SELECT * FROM expenses ORDER BY date');
}

export async function sortInvestmentsByTime(db) {
    return await db.all('SELECT * FROM investments ORDER BY date');
}

export async function getMostRecentIncome(db, num) {
    return await db.all('SELECT * FROM income WHERE date >= ?', [num]);
}

export async function getMostRecentExpenses(db, num) {
    return await db.all('SELECT * FROM expenses WHERE date >= ?', [num]);
}

export async function getMostRecentInvestments(db, num) {
    return await db.all('SELECT * FROM investments WHERE date >= ?', [num]);
}

export async function getIncomeByType(db, type) {
    return await db.all('SELECT * FROM income WHERE type = ?', [type]);
}

export async function getExpensesByType(db, type) {
    return await db.all('SELECT * FROM expenses WHERE type = ?', [type]);
}

export async function getInvestmentsByTicker(db, ticker) {
    return await db.all('SELECT * FROM investments WHERE ticker = ?', [ticker]);
}
