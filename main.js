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

// Function for sending ITA file path
ipcMain.on("openfile", () => {
  dialog.showOpenDialog(mainWindow, {
    filters: [{
      name: "ITA files", extensions: ["ITA"]
      // name: "All files", extensions: ["*"]
    }], properties: ["openFile"]
  })
    .then((um) => {
      let joao = um.filePaths.toString();
      // joao = joao.replace(/\\/g, "/") //Used to 
      mainWindow.webContents.send("dialog", joao);
      console.log(joao)
    })
})

// Saving As ITA file
ipcMain.on("saveFile", (e, arg) => {
  dialog.showSaveDialog(mainWindow,
    {
      filters: [
        { name: 'ITA Files', extensions: ['ITA'] }
      ]
    }).then((dados) => {
      let salvar = dados.filePath.toString();
      mainWindow.webContents.send("saveAsITA", salvar);
      console.log(salvar)
    })
})

// Closing ITA file (workaround)
ipcMain.on("closeITAfile", (e, arg) => {
  mainWindow.loadFile("ita.html")
})


// Function for sending ETS file path
ipcMain.on("openETSfile", () => {
  dialog.showOpenDialog(mainWindow, {
    filters: [{
      name: "ETS files", extensions: ["ETS"]
      // name: "All files", extensions: ["*"]
    }], properties: ["openFile"]
  })
    .then((um) => {
      let ETSfile = um.filePaths.toString();
      // ETSfile = ETSfile.replace(/\\/g, "/") //Used to 
      mainWindow.webContents.send("etsFileChannel", ETSfile);
      console.log(ETSfile)
    })
})

// Saving actual ETS file
ipcMain.on("saveAsETSfile", (e, arg) => {
  dialog.showSaveDialog(mainWindow,
    {
      filters: [
        { name: 'ETS Files', extensions: ['ETS'] }
      ]
    }).then((dados) => {
      let salvar = dados.filePath.toString();
      mainWindow.webContents.send("saveAsETSfileContent", salvar);
      console.log(salvar)
    })
})

// Closing ETS file (workaround)
ipcMain.on("closeETSfile", (e, arg) => {
  mainWindow.loadFile("ets.html")
})


// Function for sending AEV file path
ipcMain.on("openAEVfile", () => {
  dialog.showOpenDialog(mainWindow, {
    filters: [{
      name: "AEV files", extensions: ["AEV"]
      // name: "All files", extensions: ["*"]
    }], properties: ["openFile"]
  })
    .then((um) => {
      let AEVfile = um.filePaths.toString();
      mainWindow.webContents.send("aevFileChannel", AEVfile);
      console.log(AEVfile)
    })
})

// Saving actual AEV file
ipcMain.on("saveAsAEVfile", (e, arg) => {
  dialog.showSaveDialog(mainWindow,
    {
      filters: [
        { name: 'AEV Files', extensions: ['AEV'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    }).then((dados) => {
      let salvar = dados.filePath.toString();
      mainWindow.webContents.send("saveAsAEVfileContent", salvar);
      console.log(salvar)
    })
})

// Importing object files
ipcMain.on("AEVimportBtn", (e, arg) => {
  dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'OBJ Files', extensions: ['obj'] }
    ]
  }).then((dados) => {
    let importObjPath = dados.filePaths.toString();
    mainWindow.webContents.send("AEVobj", importObjPath);
    console.log(importObjPath)
  })
})

// Closing AEV file (workaround)
ipcMain.on("closeAEVfile", (e, arg) => {
  mainWindow.loadFile("aev.html")
})

// Function for sending MDT file path
ipcMain.on("openMDTfile", () => {
  dialog.showOpenDialog(mainWindow, {
    filters: [{
      name: "MDT files", extensions: ["MDT"]
    }], properties: ["openFile"]
  })
    .then((um) => {
      let MDTfile = um.filePaths.toString();
      mainWindow.webContents.send("mdtFileChannel", MDTfile);
      console.log(MDTfile)
    })
})

// Saving actual MDT file
ipcMain.on("saveAsMDTfile", (e, arg) => {
  dialog.showSaveDialog(mainWindow,
    {
      filters: [
        { name: 'MDT Files', extensions: ['MDT'] }
      ]
    }).then((dados) => {
      let salvar = dados.filePath.toString();
      mainWindow.webContents.send("saveAsMDTfileContent", salvar);
      console.log(salvar)
    })
})

// Closing MDT file (workaround)
ipcMain.on("closeMDTfile", (e, arg) => {
  mainWindow.loadFile("mdt.html")
})

// BIN -------------------------------------------
// Function for sending BIN file path
ipcMain.on("openBINfile", () => {
  dialog.showOpenDialog(mainWindow, {
    filters: [{
      name: "BIN files", extensions: ["bin"]
    }], properties: ["openFile"]
  })
    .then((um) => {
      let BINfile = um.filePaths.toString();
      mainWindow.webContents.send("binFileChannel", BINfile);
      console.log(BINfile)
    })
})

// Importing OBJ to BIN files
ipcMain.on("BINimportBtn", (e, arg) => {
  dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'OBJ Files', extensions: ['obj'] }
    ]
  }).then((dados) => {
    let importObjPath = dados.filePaths.toString();
    mainWindow.webContents.send("BINobj", importObjPath);
    console.log(importObjPath)
  })
})

// Closing BIN file (workaround)
ipcMain.on("closeBINfile", (e, arg) => {
  mainWindow.loadFile("bin.html")
})

// SMD -------------------------------------------
// Function for sending SMD file path
ipcMain.on("openSMDfile", () => {
  dialog.showOpenDialog(mainWindow, {
    filters: [{
      name: "SMD files", extensions: ["SMD"]
    }], properties: ["openFile"]
  })
    .then((um) => {
      let SMDfile = um.filePaths.toString();
      mainWindow.webContents.send("smdFileChannel", SMDfile);
      console.log(SMDfile)
    })
})

// Saving actual SMD file
ipcMain.on("saveAsSMDfile", (e, arg) => {
  dialog.showSaveDialog(mainWindow,
    {
      filters: [
        { name: 'SMD Files', extensions: ['SMD'] }
      ]
    }).then((dados) => {
      let salvar = dados.filePath.toString();
      mainWindow.webContents.send("saveAsSMDfileContent", salvar);
      console.log(salvar)
    })
})

// Adding new BIN model to SMD file
ipcMain.on("BINtoSMDBtn", (e, arg) => {
  dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'BIN Model', extensions: ['bin'] }
    ]
  }).then((dados) => {
    let importBinPath = dados.filePaths.toString();
    mainWindow.webContents.send("BINmodel", importBinPath);
    console.log("Bin imported: " + importBinPath);
  })
})

// Adding new TPL texture to SMD file
ipcMain.on("addNewTPLBtn", (e, arg) => {
  dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'TPL Texture', extensions: ['tpl'] }
    ]
  }).then((dados) => {
    let addedNewTexture = dados.filePaths.toString();
    mainWindow.webContents.send("addTPLtexture", addedNewTexture);
    console.log("TPL imported: " + addedNewTexture);
  })
})

// Closing SMD file
ipcMain.on("closeSMDfile", (e, arg) => {
  mainWindow.loadFile("smd.html")
})

// SND -------------------------------------------
// Function for sending SND file path
ipcMain.on("openSNDfile", () => {
  dialog.showOpenDialog(mainWindow, {
    filters: [{
      name: "SND files", extensions: ["SND"]
    }], properties: ["openFile"]
  })
    .then((um) => {
      let SNDfile = um.filePaths.toString();
      mainWindow.webContents.send("sndFileChannel", SNDfile);
      console.log(SNDfile)
    })
})

// Saving actual SND file
ipcMain.on("saveAsSNDfile", (e, arg) => {
  dialog.showSaveDialog(mainWindow,
    {
      filters: [
        { name: 'SND Files', extensions: ['SND'] }
      ]
    }).then((dados) => {
      let salvar = dados.filePath.toString();
      mainWindow.webContents.send("saveAsSNDfileContent", salvar);
      console.log(salvar)
    })
})

// Closing SND file
ipcMain.on("closeSNDfile", (e, arg) => {
  mainWindow.loadFile("snd.html")
})

// Show HELP message
ipcMain.on("showHelp", (e, arg) => {
  dialog.showMessageBox(mainWindow, {
    type: "question",
    title: "Guide for SND Tool",
    message: `Step 1: Export .vag audio from the .snd
Step 2: Convert the .vag audio to .wav
Step 3: Listen the .wav audio, go to the extracted folder and edit it as you like. Remember that it has to remain in the same frequency
Step 4: Convert your edited .wav to .vag
Step 5: Import back to the .snd\n
EXTRA INFO:
- Audios are imported based on filename index, so it must contain the index number at the end;
- There is no support for adding or removing audios, but you can edit every existent audios;
- Remember to save after every single import, because the file gets overwritten on memory;
- Audios must remain in same frequency as exported;
- The limit for audio length is unknown, you can increase it or decrease it as you like;
---------------------------------------
- You can use Audacity to easily edit your sounds;
- If facing problems while doing "batch converting", kindly move or delete all .vag sounds inside the folder and try again;
- A backup is created by default, you can deactivate it by options menu.`})
})

// Show message error VAG
ipcMain.on("wavConvertError", (e, arg) => {
  dialog.showErrorBox("Error while converting", "Cannot convert unexistent .wav file, please convert from .vag to .wav first.")
})

// Show message error WAV
ipcMain.on("errorMessage", (e, arg) => {
  dialog.showErrorBox("Error", "Cannot convert unexistent .vag file, please export .vag audio first.")
})

// Show message error SND
ipcMain.on("filenameError", (e, arg) => {
  dialog.showErrorBox("Filename error", "Could not find index number in .vag filename. Please use the following syntax: 'vagName_00.vag'.")
})

// Show message error SND
ipcMain.on("vagAbsent", (e, arg) => {
  dialog.showErrorBox("Error", "Cannot import back unexistent .vag file, please export .vag audio or convert from a .wav sound.")
})

// ETM -------------------------------------------
// Function for sending ETM file path
ipcMain.on("openETMfile", () => {
  dialog.showOpenDialog(mainWindow, {
    filters: [{
      name: "ETM files", extensions: ["ETM"]
    }], properties: ["openFile"]
  })
    .then((um) => {
      let ETMfile = um.filePaths.toString();
      mainWindow.webContents.send("etmFileChannel", ETMfile);
      console.log(ETMfile);
    })
})

// Saving actual ETM file
ipcMain.on("saveAsETMfile", (e, arg) => {
  dialog.showSaveDialog(mainWindow,
    {
      filters: [
        { name: 'ETM Files', extensions: ['ETM'] }
      ]
    }).then((dados) => {
      let salvar = dados.filePath.toString();
      mainWindow.webContents.send("saveAsETMfileContent", salvar);
      console.log(salvar)
    })
})

// Adding new object to ETM file
ipcMain.on("importETM", (e, arg) => {
  dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'ETM Models', extensions: ['bin', 'eff', 'fcv', 'seq', 'tpl'] },
      { name: 'ETB Crzosk', extensions: ['etb'] }
    ]
  }).then((dados) => {
    let importBinPath = dados.filePaths.toString();
    mainWindow.webContents.send("ETMobject", importBinPath);
    console.log("Object imported: " + importBinPath);
  })
})

// Adding new object to ETM file
ipcMain.on("swapETM", (e, arg) => {
  dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'ETM Models', extensions: ['bin', 'eff', 'fcv', 'seq', 'tpl'] },
      { name: 'ETB Crzosk', extensions: ['etb'] }
    ]
  }).then((dados) => {
    let swapBinPath = dados.filePaths.toString();
    mainWindow.webContents.send("swappedETMobject", swapBinPath);
    console.log("Object swapped: " + swapBinPath);
  })
});

// Downloading new object
ipcMain.on('download', async (event, info) => {
  await download(mainWindow, info.url, {
    directory: path.join(__dirname, "..", "..", "ETM", "Downloads"),
    onStarted: () => { mainWindow.webContents.send("download-started") },
    onCompleted: (object) => { mainWindow.webContents.send("download-success", object) },
    saveAs: false
  });
});

// Closing ETM file
ipcMain.on("closeETMfile", (e, arg) => {
  mainWindow.loadFile("etm.html")
})

// ITM -------------------------------------------
// Function for sending ITM file path
ipcMain.on("openITMfile", () => {
  dialog.showOpenDialog(mainWindow, {
    filters: [{
      name: "ITM files", extensions: ["ITM"]
    }], properties: ["openFile"]
  })
    .then((um) => {
      let ITMfile = um.filePaths.toString();
      mainWindow.webContents.send("itmFileChannel", ITMfile);
      console.log(ITMfile);
    })
})

// Saving actual ITM file
ipcMain.on("saveAsITMfile", (e, arg) => {
  dialog.showSaveDialog(mainWindow,
    {
      filters: [
        { name: 'ITM Files', extensions: ['ITM'] }
      ]
    }).then((dados) => {
      let salvar = dados.filePath.toString();
      mainWindow.webContents.send("saveAsITMfileContent", salvar);
      console.log(salvar)
    })
})

// Adding new object to ITM file
ipcMain.on("importITM", (e, arg) => {
  dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'ITM Models', extensions: ['bin', 'tpl'] },
    ]
  }).then((dados) => {
    let importBinPath = dados.filePaths.toString();
    mainWindow.webContents.send("ITMobject", importBinPath);
    console.log("Object imported: " + importBinPath);
  })
})

// Adding new object to ITM file
ipcMain.on("swapITM", (e, arg) => {
  dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'ITM Models', extensions: ['bin', 'tpl'] }
    ]
  }).then((dados) => {
    let swapBinPath = dados.filePaths.toString();
    mainWindow.webContents.send("swappedITMobject", swapBinPath);
    console.log("Object swapped: " + swapBinPath);
  })
});

// Downloading new object
ipcMain.on('download', async (event, info) => {
  await download(mainWindow, info.url, {
    directory: path.join(__dirname, "..", "..", "ITM", "Downloads"),
    onStarted: () => { mainWindow.webContents.send("download-started") },
    onCompleted: (object) => { mainWindow.webContents.send("download-success", object) },
    saveAs: false
  });
});

// Closing ITM file
ipcMain.on("closeITMfile", (e, arg) => {
  mainWindow.loadFile("itm.html")
})

// SPECIALS -------------------------------------------
// Function for sending SPECIALS file path
ipcMain.on("openSPECIALSfile", () => {
  dialog.showOpenDialog(mainWindow, {
    filters: [{
      name: "TPL files", extensions: ["TPL"]
    }], properties: ["openFile"]
  })
    .then((um) => {
      let SPECIALSfile = um.filePaths.toString();
      mainWindow.webContents.send("specialsFileChannel", SPECIALSfile);
      console.log(SPECIALSfile)
    })
})

// Saving actual SPECIALS file
ipcMain.on("saveAsSPECIALSfile", (e, arg) => {
  dialog.showSaveDialog(mainWindow,
    {
      filters: [
        { name: 'TPL Files', extensions: ['TPL'] }
      ]
    }).then((dados) => {
      let salvar = dados.filePath.toString();
      mainWindow.webContents.send("saveAsSpecialsfileContent", salvar);
      console.log(salvar)
    })
})

// Closing SPECIALS file
ipcMain.on("closeSPECIALSfile", (e, arg) => {
  mainWindow.loadFile("specials.html")
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

ipcMain.on("openITAtool", () => {
  mainWindow.loadFile("ita.html")
})

ipcMain.on("openETStool", () => {
  mainWindow.loadFile("ets.html")
})

ipcMain.on("openAEVtool", () => {
  mainWindow.loadFile("aev.html")
})

ipcMain.on("openMDTtool", () => {
  mainWindow.loadFile("mdt.html")
})

ipcMain.on("openBINtool", () => {
  mainWindow.loadFile("bin.html")
})

ipcMain.on("openSMDtool", () => {
  mainWindow.loadFile("smd.html")
})

ipcMain.on("openSNDtool", () => {
  mainWindow.loadFile("snd.html")
})

ipcMain.on("openETMtool", () => {
  mainWindow.loadFile("etm.html")
})

ipcMain.on("openITMtool", () => {
  mainWindow.loadFile("itm.html")
})

ipcMain.on("openSPECIALStool", () => {
  mainWindow.loadFile("specials.html")
})