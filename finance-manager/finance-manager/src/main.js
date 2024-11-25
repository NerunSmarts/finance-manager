const { app, BrowserWindow, ipcMain, utilityProcess, MessageChannelMain } = require('electron');
const path = require('node:path');
const fs = require('fs');
const dbPath = app.getPath('userData')
const { port1, port2 } = new MessageChannelMain();
var args = [""];
var databaseHandler;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
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

  databaseHandler = utilityProcess.fork(path.join(__dirname, 'databaseHandler.js'), args, {stdio: 'pipe', cwd: dbPath});
  console.log("Database handler started");
  
  databaseHandler.on('spawn', () => {
    databaseHandler.postMessage({ message: 'init' }, [port2]);
    port1.on('connect', (message) => {
      console.log("talking to database handler!")
    });
  });
  window.webContents.send('init-sync', 'connected to main!');
  console.log("sending init-sync message") // DO NOT FUCKING REMOVE THIS LINE IT BREAKS SENDING FOR SOME FUCKING REASON

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' | true) {
    console.log("app is closing")
    databaseHandler.kill()
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

 // Start the database handler and set it up to handle requests
 
 