const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');
const { open } = require('sqlite')
const dbPath = app.getPath('userData')
import icon from './icons/fmlogo.svg';
//const pythonShell = require('python-shell');

import DBHandler, { createTables, getIncome, getMostRecentIncome, initSql } from './databaseHandler.js';
//import pyScript from './StockAPI.py';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    icon: icon,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegrationInWorker: true,
    },
  });
  
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  let window = createWindow();
  
  console.log("sending init-sync message")


  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  ipcMain.on('init-sync', (event, args) => {
    console.log(args)
    window.webContents.send('init-sync', 'connected to main!');
    let db = initSql(dbPath).then((db) => {
      console.log("database initialized, creating tables if they don't exist");
      createTables(db).then(() => {
        console.log("tables created");
      });
      ipcMain.on('db-incomerecent-request', (event, args) => {
          getMostRecentIncome(db, args).then((data) => {
              console.log(data);
              window.webContents.send('db-incomerecent-reply', data);
          });
      })
      ipcMain.on('db-expense-request', (event, args) => {
          getExpense(db, args).then((data) => {
              console.log(data);
              window.webContents.send('db-expense-reply', data);
          });
      })
      ipcMain.on('db-investment-request', (event, args) => {
          getInvestment(db, args).then((data) => {
              console.log(data);
              window.webContents.send('db-investment-reply', data);
          });
      })
      ipcMain.on('db-setting-request', (event, args) => {
          getSetting(db, args).then((data) => {
              console.log(data);
              window.webContents.send('db-setting-reply', data);
          });
      });
    })
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' | true) {
    console.log("app is closing");
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

 // Start the database handler and set it up to handle requests
