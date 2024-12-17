const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('node:path');
const fs = require('fs');
const {
  initSql,
  createTables,
  insertExpense,
  insertIncome,
  insertInvestment,
  getAllExpenses,
  getAllIncome,
  getAllInvestments,
  getExpense,
  getIncome,
  getInvestment,
  deleteExpense,
  deleteIncome,
  deleteInvestment,
  updateExpense,
  updateIncome,
  updateInvestment,
  closeDb
} = require('./databaseHandler');

let db;

beforeAll(async () => {
  const dbPath = path.join(__dirname, 'test.db');
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  await createTables(db);
});

afterAll(async () => {
  await closeDb(db);
  fs.unlinkSync(path.join(__dirname, 'test.db'));
});

describe('Database Handler Tests', () => {
  test('Insert and retrieve expense', async () => {
    await insertExpense(db, 'Test Expense', 100, Date.now(), 'Food');
    const expenses = await getAllExpenses(db);
    expect(expenses.length).toBe(1);
    expect(expenses[0].name).toBe('Test Expense');
  });

  test('Insert and retrieve income', async () => {
    await insertIncome(db, 'Test Income', 200, Date.now(), 'Salary');
    const income = await getAllIncome(db);
    expect(income.length).toBe(1);
    expect(income[0].name).toBe('Test Income');
  });

  test('Insert and retrieve investment', async () => {
    await insertInvestment(db, 'AAPL', 10, Date.now());
    const investments = await getAllInvestments(db);
    expect(investments.length).toBe(1);
    expect(investments[0].ticker).toBe('AAPL');
  });

  test('Update and retrieve expense', async () => {
    const expense = await getAllExpenses(db);
    await updateExpense(db, expense[0].id, 'Updated Expense', 150, Date.now(), 'Transport');
    const updatedExpense = await getExpense(db, expense[0].id);
    expect(updatedExpense.name).toBe('Updated Expense');
  });

  test('Update and retrieve income', async () => {
    const income = await getAllIncome(db);
    await updateIncome(db, income[0].id, 'Updated Income', 250, Date.now(), 'Bonus');
    const updatedIncome = await getIncome(db, income[0].id);
    expect(updatedIncome.name).toBe('Updated Income');
  });

  test('Update and retrieve investment', async () => {
    const investment = await getAllInvestments(db);
    await updateInvestment(db, investment[0].id, 'GOOGL', 15, Date.now());
    const updatedInvestment = await getInvestment(db, investment[0].id);
    expect(updatedInvestment.ticker).toBe('GOOGL');
  });

  test('Delete expense', async () => {
    const expense = await getAllExpenses(db);
    await deleteExpense(db, expense[0].id);
    const expenses = await getAllExpenses(db);
    expect(expenses.length).toBe(0);
  });

  test('Delete income', async () => {
    const income = await getAllIncome(db);
    await deleteIncome(db, income[0].id);
    const incomes = await getAllIncome(db);
    expect(incomes.length).toBe(0);
  });

  test('Delete investment', async () => {
    const investment = await getAllInvestments(db);
    await deleteInvestment(db, investment[0].id);
    const investments = await getAllInvestments(db);
    expect(investments.length).toBe(0);
  });
});