const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('fs');
const { open } = require('sqlite')
const dbPath = app.getPath('userData')
ipcMain.setMaxListeners(20);
import icon from './icons/fmlogo.svg';
//const pythonShell = require('python-shell');

import * as DBHandler from './databaseHandler.js';
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

  // Open the DevTools. Disabled temporarily for demo.
  //mainWindow.webContents.openDevTools();
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
    const db = DBHandler.initSql(dbPath).then((db) => {
      console.log("database initialized, creating tables if they don't exist");
      DBHandler.createTables(db).then(() => {
        console.log("tables created (if they didn't exist)");
      });
      ipcMain.on('db-incomerecent-request', (event, args) => {
          DBHandler.getMostRecentIncome(db, args).then((data) => {
              window.webContents.send('db-incomerecent-reply', data);
          });
      })
      ipcMain.on('db-expenserecent-request', (event, args) => {
          DBHandler.getMostRecentExpenses(db, args).then((data) => {
              window.webContents.send('db-expenserecent-reply', data);
          });
      })
      ipcMain.on('db-investmentrecent-request', (event, args) => {
          DBHandler.getMostRecentInvestments(db, args).then((data) => {
              window.webContents.send('db-investmentrecent-reply', data);
          });
      })
      ipcMain.on('db-expense-request', (event, args) => {
          DBHandler.getExpense(db, args).then((data) => {
              window.webContents.send('db-expense-reply', data);
          });
      })
      ipcMain.on('db-investment-request', (event, args) => {
          DBHandler.getInvestment(db, args).then((data) => {
              window.webContents.send('db-investment-reply', data);
          });
      })
      ipcMain.on('db-settings-request', (event, args) => {
          DBHandler.fixSettings(db).then(() => {
            console.log("settings fixed (if they were broken)");
          });
          DBHandler.getSettings(db).then((data) => {
              window.webContents.send('db-settings-reply', data);
              window.webContents.send('db-settings-go', 'stupid ass timing hack');
          });
      });
      ipcMain.on('db-expense-insert', (event, args) => {
          DBHandler.insertExpense(db, args.name, args.amount, args.date, args.type).then((data) => {
              window.webContents.send('db-expense-insert-reply', data);
          });
      });
      ipcMain.on('db-income-insert', (event, args) => {
          DBHandler.insertIncome(db, args.name, args.amount, args.date, args.type).then((data) => {
              window.webContents.send('db-income-insert-reply', data);
          });
      });
      ipcMain.on('db-investment-insert', (event, args) => {
          DBHandler.insertInvestment(db, args[0], args[1], args[2]).then((data) => {
              window.webContents.send('db-investment-insert-reply', data);
          });
      });
      ipcMain.on('db-setting-update', (event, args) => {
          if (args.name = 'incomeChartHLength') {
              DBHandler.updateSetting(db, 1, args.name, args.value).then((data) => {
                  window.webContents.send('db-setting-update-reply', data);
                  console.log(data);
              });
          };
          if (args.name = 'expenseChartHLength') {
              DBHandler.updateSetting(db, 2, args.name, args.value).then((data) => {
                  window.webContents.send('db-setting-update-reply', data);
              });
          };
      });
      ipcMain.on('db-expenseall-request', (event, args) => {
          DBHandler.getAllExpenses(db).then((data) => {
              window.webContents.send('db-expenseall-reply', data);
          });
      });
      ipcMain.on('db-incomeall-request', (event, args) => {
          DBHandler.getAllIncome(db).then((data) => {
              window.webContents.send('db-incomeall-reply', data);
          });
      });
      ipcMain.on('db-income-delete', (event, args) => {
          DBHandler.deleteIncome(db, args).then((data) => {
              window.webContents.send('db-income-delete-reply', data);
          });
      });
      ipcMain.on('db-expense-delete', (event, args) => {
        console.log(args);
          DBHandler.deleteExpense(db, args).then((data) => {
              window.webContents.send('db-expense-delete-reply', data);
              console.log(data);
          });
      });
    });
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
