const fs = require('fs');
const { ipcRenderer } = require('electron');
const textBox = require('../shared/textBox').module;
const path = require('path');

/* ===============
    CREATE
   =============== */

// Getting elements
var rootEl = document.querySelector("html");
var headerFileName = document.getElementById("header-filename");
var headerFileSize = document.getElementById("header-filesize");

// Const for getting Menu elements
const openFile = document.getElementById("openTM3file");
const closeBtn = document.getElementById("closeTM3file");
const saveBtn = document.getElementById("saveTM3file");
const saveAsBtn = document.getElementById("saveTM3as");
const quitApp = document.getElementById("quitApp");
const minimizeBtn = document.getElementById("minimize");
const maximizeBtn = document.getElementById("maximize");
const closeWindowBtn = document.getElementById("closeWindow");

const export_tm3 = document.getElementById("export-tm3");
const import_tm3 = document.getElementById("import-tm3");
const panelBtn = document.getElementsByClassName("panel-btn");

// Menu actions (open/save/quit)
openFile.addEventListener("click", () => {
   ipcRenderer.send("openTM3file")
   ipcRenderer.send("closeTM3file")
})

saveAsBtn.addEventListener("click", () => {
   ipcRenderer.send("saveAsDatfile")
})

quitApp.addEventListener("click", () => {
   ipcRenderer.send("quitApp")
})

// Window menu actions
menuWindow.addEventListener("click", () => {
   ipcRenderer.send("openMainMenu")
})

minimizeBtn.addEventListener("click", () => {
   ipcRenderer.send("minimize")
})

maximizeBtn.addEventListener("click", () => {
   ipcRenderer.send("maximize")
})

closeWindowBtn.addEventListener("click", () => {
   ipcRenderer.send("closeWindow")
})

/* ===============
    READ
   =============== */

// Global variables 
let iterator = 0;

// Getting file path
ipcRenderer.on("tm3FileChannel", (e, filepath) => {

   var fd = fs.openSync(filepath); // Opening the file in memory
   var buffer = fs.readFileSync(fd); // Converting file string to buffer (hex)
   var TM3FileName = String(filepath);
   var conv = TM3FileName.replace(/^[^.]*\\/gm, '');
   headerFileSize.value = buffer.length + " bytes";
   headerFileName.value = conv;

   let imageCount = buffer.readUint8(4);
   let folderName = conv.substring(0, conv.lastIndexOf('.'));
   let buffer_filenames;

   // Activates buttons
   panelBtn[0].removeAttribute("disabled");
   panelBtn[1].removeAttribute("disabled");

   let fileNames = [];
   // for (let i = 0; i != imageCount; i++) {
   //    if (imageCount % 4 == 0) {
   //       buffer_filenames = buffer.subarray((4 * imageCount) + 0x10 + iterator, (4 * imageCount) + 8 + 0x10 + iterator);
   //       let cleanName = buffer_filenames.toString("utf-8").replace(/\x00.{1,}/gm, ' ')
   //       fileNames.push(cleanName);
   //       console.log(cleanName);
   //    } else if (imageCount % 4 == 3) {
   //       buffer_filenames = buffer.subarray((4 * imageCount) + 0x14 + iterator, (4 * imageCount) + 8 + 0x14 + iterator);
   //       let cleanName = buffer_filenames.toString("utf-8").replace(/\x00.{1,}/gm, '')
   //       fileNames.push(cleanName);
   //       console.log(cleanName);
   //    } else if (imageCount % 4 == 2) {
   //       buffer_filenames = buffer.subarray((4 * imageCount) + 0x18 + iterator, (4 * imageCount) + 8 + 0x18 + iterator);
   //       let cleanName = buffer_filenames.toString("utf-8").replace(/\x00.{1,}/gm, ' ')
   //       fileNames.push(cleanName);
   //       console.log(buffer_filenames);
   //    } else if (imageCount % 4 == 1) {
   //       buffer_filenames = buffer.subarray((4 * imageCount) + 0x22 + iterator, (4 * imageCount) + 8 + 0x22 + iterator);
   //       let cleanName = buffer_filenames.toString("utf-8").replace(/\x00.{1,}/gm, '')
   //       fileNames.push(cleanName);
   //       console.log(cleanName);
   //    }
   //    iterator += 8;
   // }

   console.log(fileNames);

   // Export images from .tm3 pack
   export_tm3.addEventListener("click", function () {
      iterator = 0;

      if (!fs.existsSync(`TM3/${folderName}`)) {
         fs.mkdirSync(`TM3/${folderName}`, { recursive: true })
      }

      // Getting file names
      // for (let j = 0; j != imageCount; j++) {
      //    let imageName = buffer.subarray()
      //    iterator += 4;
      // }
      iterator = 0;

      for (let i = 0; i != imageCount; i++) {
         if (!(i == imageCount - 1)) {
            let file = buffer.subarray(buffer.readUint32LE(0x10 + iterator), buffer.readUint32LE(0x14 + iterator));
            fs.writeFileSync(`TM3/${folderName}/${folderName}_${i}.TIM3`, file);
         } else {
            let file = buffer.subarray(buffer.readUint32LE(0x10 + iterator));
            fs.writeFileSync(`TM3/${folderName}/${folderName}_${i}.TIM3`, file);
         }
         iterator += 4;
      }
      textBox("Textures extracted successfully!", "green");
   })

   // Import files to .tm3 container
   import_tm3.addEventListener("click", function () {

      // Get all files from folder and sorts array alphabetically
      let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
      const dirents = fs.readdirSync(`TM3/${folderName}`, { withFileTypes: true });
      const files = dirents.filter(dirent => dirent.isFile()).map(dirent => dirent.name).sort(collator.compare);

      // Creates headers for pointers and file names
      let buffer_header = buffer.subarray(0, buffer.readUint32LE(0x10));
      let fileLengthIterator = 0;

      buffer_header.writeUint16LE(files.length, 0x04);
      buffer_header.writeUint32LE(buffer_header.length, 0x10);

      // Generate offsets (pointers)
      iterator = 0;
      for (let j = 0; j != files.length - 1; j++) {
         let file = fs.readFileSync(`TM3/${folderName}/${files[j]}`);
         fileLengthIterator = fileLengthIterator + file.length;
         buffer_header.writeUint32LE(fileLengthIterator + buffer_header.length, 0x14 + iterator);
         iterator += 4;
      }

      // Creates compiled folder for ready .TM3 files
      if (!fs.existsSync(`TM3/Compiled`)) {
         fs.mkdirSync(`TM3/Compiled`, { recursive: true })
      }

      // Writes header, pointers, file extensions and appends every file inside the folder
      fs.writeFileSync(`TM3/Compiled/${folderName}.TM3`, buffer_header);
      for (let x = 0; x != files.length; x++) {
         fs.appendFileSync(`TM3/Compiled/${folderName}.TM3/`, fs.readFileSync(`TM3/${folderName}/${files[x]}`))
      }
   })

   /* ===============
       UPDATE
      =============== */

   // Save all modified buffer back to file
   saveBtn.addEventListener("click", () => {
      fs.writeFileSync(filepath, buffer);
      var saveMessage = document.querySelector(".hide");
      saveMessage.style.display = "block"
      setTimeout(() => {
         saveMessage.style.display = "none"
      }, 2000);
   })

   closeBtn.addEventListener("click", () => {
      ipcRenderer.send("closeDATfile");
   })

   ipcRenderer.on("saveAsDatfileContent", (e, arg) => {
      fs.writeFileSync(arg, buffer);
   })
})
