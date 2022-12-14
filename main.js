// Modules
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { download } = require('electron-dl');
const fs = require('fs');
const path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Create a new BrowserWindow when `app` is ready
function createWindow() {

  mainWindow = new BrowserWindow({
    width: 1100, height: 600, minWidth: 600, minHeight: 300,
    autoHideMenuBar: true,
    frame: false,
    icon: "./icons/icon.png",
    webPreferences: {
      // devTools: false,
      contextIsolation: false,
      nodeIntegration: true,
      preload: 'preload.js'
    }

  })

  // Load menu.html into the new BrowserWindow
  mainWindow.loadFile('menu.html');

  // Open DevTools - Remove for PRODUCTION!
  // mainWindow.webContents.openDevTools();

  // Listen for window being closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Electron `app` is ready
app.on('ready', createWindow)

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

/* ================== 
    FUNCTIONS
   ================== */

// DAT -------------------------------------------
// Function for sending DAT file path
ipcMain.on("openDATfile", () => {
  dialog.showOpenDialog(mainWindow, {
    filters: [{
      name: "DAT files", extensions: ["DAT"]
    }], properties: ["openFile"]
  })
    .then((um) => {
      let DATfile = um.filePaths.toString();
      mainWindow.webContents.send("datFileChannel", DATfile);
      console.log(DATfile)
    })
})

// Saving actual DAT file
ipcMain.on("saveAsDATfile", (e, arg) => {
  dialog.showSaveDialog(mainWindow,
    {
      filters: [
        { name: 'DAT Files', extensions: ['DAT'] }
      ]
    }).then((dados) => {
      let salvar = dados.filePath.toString();
      mainWindow.webContents.send("saveAsDatfileContent", salvar);
      console.log(salvar)
    })
})

// Closing DAT file
ipcMain.on("closeDATfile", (e, arg) => {
  mainWindow.loadFile("dat.html")
})

// TM3 -------------------------------------------
// Function for sending TM3 file path
ipcMain.on("openTM3file", () => {
  dialog.showOpenDialog(mainWindow, {
    filters: [{
      name: "TM3 files", extensions: ["TM3"]
    }], properties: ["openFile"]
  })
    .then((um) => {
      let TM3file = um.filePaths.toString();
      mainWindow.webContents.send("tm3FileChannel", TM3file);
      console.log(TM3file)
    })
})

ipcMain.on("dialogDATtype", () => {
  dialog.showMessageBox(mainWindow, {
    type: "info",
    buttons: ["Room DAT", "Player DAT"],
    title: "Which type of DAT is this one?",
    message: "Room DAT are files like r100, r101. Player DAT are files like pl00, pl01."
  }).then((response) => {
    return mainWindow.webContents.send("DATtype", response.response);
  }).catch((err) => { console.log(err); })
})

// Saving actual TM3 file
ipcMain.on("saveAsTM3file", (e, arg) => {
  dialog.showSaveDialog(mainWindow,
    {
      filters: [
        { name: 'TM3 Files', extensions: ['TM3'] }
      ]
    }).then((dados) => {
      let salvar = dados.filePath.toString();
      mainWindow.webContents.send("saveAsTm3fileContent", salvar);
      console.log(salvar)
    })
})

// Closing TM3 file
ipcMain.on("closeTM3file", (e, arg) => {
  mainWindow.loadFile("tm3.html")
})

// Quiting application
ipcMain.on("quitApp", (e, arg) => {
  mainWindow.close();
})

// ====================
// Window menu buttons
ipcMain.on("minimize", (e, arg) => {
  mainWindow.minimize();
})

ipcMain.on("maximize", (e, arg) => {
  mainWindow.maximize();
})

ipcMain.on("closeWindow", (e, arg) => {
  mainWindow.close();
})

ipcMain.on("openMainMenu", (e, arg) => {
  mainWindow.loadFile("menu.html");
})

// MENU CARDS
ipcMain.on("openDATtool", () => {
  mainWindow.loadFile("dat.html")
})

ipcMain.on("openTM3tool", () => {
  mainWindow.loadFile("tm3.html")
})