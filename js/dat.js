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
const openFile = document.getElementById("openDATfile");
const closeBtn = document.getElementById("closeDATfile");
const saveBtn = document.getElementById("saveDATfile");
const saveAsBtn = document.getElementById("saveDATas");
const quitApp = document.getElementById("quitApp");
const minimizeBtn = document.getElementById("minimize");
const maximizeBtn = document.getElementById("maximize");
const closeWindowBtn = document.getElementById("closeWindow");

var export_dat = document.getElementById("export-dat");
var import_dat = document.getElementById("import-dat");
const panelBtn = document.getElementsByClassName("panel-btn");

// Menu actions (open/save/quit)
openFile.addEventListener("click", () => {
   ipcRenderer.send("openDATfile")
   ipcRenderer.send("closeDATfile")
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
var chunk = 0; // Will be incremented in each chunk

// Getting file path
ipcRenderer.on("datFileChannel", (e, filepath) => {

   var fd = fs.openSync(filepath); // Opening the file in memory
   var buffer = fs.readFileSync(fd); // Converting file string to buffer (hex)
   var DATFileName = String(filepath);
   var conv = DATFileName.replace(/^[^.]*\\/gm, '');
   headerFileSize.value = buffer.length + " bytes";
   headerFileName.value = conv;

   let iterator = 0;
   let folderName = conv.substring(0, conv.lastIndexOf('.'));
   panelBtn[0].removeAttribute("disabled");
   panelBtn[1].removeAttribute("disabled");

   // Export files from .dat container
   export_dat.addEventListener("click", function () {
      iterator = 0;
      if (!fs.existsSync(`DAT/${folderName}`)) {
         fs.mkdirSync(`DAT/${folderName}`, { recursive: true })
      }

      let file_extensions = [];
      for (let j = 0; j != buffer.readUint16LE(0); j++) {
         let extension = buffer.subarray((4 * buffer.readUint16LE(0)) + iterator + 4, (4 * buffer.readUint16LE(0)) + iterator + iterator + 8);
         if (extension.toString("utf-8").slice(0, 4) == "\x00\x00\x00\x00") {
            file_extensions.push("DMY");
            // console.log("DMY file");
         } else {
            file_extensions.push(extension.toString("utf-8").slice(0, 4).replace(/\x00/g, ""));
         }
         iterator += 4;
      }
      iterator = 0;

      for (let i = 0; i != buffer.readUint16LE(0); i++) {
         if (!(i == buffer.readUint16LE(0) - 1)) {
            let file = buffer.subarray(buffer.readUint32LE(4 + iterator), buffer.readUint32LE(8 + iterator));
            fs.writeFileSync(`DAT/${folderName}/${folderName}_${i}.${file_extensions[i]}`, file);
         } else {
            let file = buffer.subarray(buffer.readUint32LE(4 + iterator));
            fs.writeFileSync(`DAT/${folderName}/${folderName}_${i}.${file_extensions[i]}`, file);
         }
         iterator += 4;
      }
      textBox("All files extracted successfully!", "green");
   })

   // Import files to .dat container
   import_dat.addEventListener("click", function () {
      let DAT_type = 0;

      ipcRenderer.send("dialogDATtype");
      ipcRenderer.on("DATtype", (e, DATtype) => {

         // Get all files from folder and sorts array alphabetically
         let collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
         const dirents = fs.readdirSync(`DAT/${folderName}`, { withFileTypes: true });
         const files = dirents.filter(dirent => dirent.isFile()).map(dirent => dirent.name).sort(collator.compare);

         // Creates headers for pointers and extensions
         let buffer_offsets = Buffer.alloc((4 * files.length) + 4);
         let buffer_extensions = Buffer.alloc(4 * files.length);
         let fileLengthIterator = 0;

         // Gets DAT type (player or room)
         DAT_type = DATtype
         if (DAT_type == 0) {
            switch (((files.length)) % 4) {
               case 1:
                  DAT_type = 24;
                  break;
               case 2:
                  DAT_type = 16;
                  break;
               case 3:
                  DAT_type = 8;
                  break;
               default:
                  DAT_type = 32;
                  break;
            }
         } else {
            DAT_type = 16;
         }

         buffer_offsets.writeUint16LE(files.length, 0);
         buffer_offsets.writeUint32LE(8 * files.length + DAT_type, 4)


         // Generate offsets (pointers)
         iterator = 0;
         for (let j = 0; j != files.length - 1; j++) {
            let file = fs.readFileSync(`DAT/${folderName}/${files[j]}`);
            fileLengthIterator = fileLengthIterator + file.length;
            buffer_offsets.writeUint32LE(fileLengthIterator + (8 * files.length) + DAT_type, 8 + iterator);
            iterator += 4;
         }

         // Generate file extensions
         iterator = 0;
         for (let i = 0; i != files.length; i++) {
            if (!fs.existsSync(`DAT/${folderName}`)) {
               fs.mkdirSync(`DAT/${folderName}`, { recursive: true })
            }

            let file_extension = files[i].replace(/[a-zA-z0-9]{1,}[.]/gm, '');
            let buffer_tmp = Buffer.from(file_extension);
            for (let k = 0; k != buffer_tmp.length; k++) {
               buffer_extensions.writeUint8(buffer_tmp[k], iterator + k)
            }
            iterator += 4;
         }
         if (DATtype == 0) {
            // Checks if block alignment is needed, if so, adds empty pointers 
            switch (((files.length)) % 4) {
               case 1:
                  let empty_pointer_12 = Buffer.alloc(20);
                  buffer_extensions = Buffer.concat([buffer_extensions, empty_pointer_12])
                  break;
               case 2:
                  let empty_pointer_8 = Buffer.alloc(12);
                  buffer_extensions = Buffer.concat([buffer_extensions, empty_pointer_8])
                  break;
               case 3:
                  let empty_pointer_4 = Buffer.alloc(4);
                  buffer_extensions = Buffer.concat([buffer_extensions, empty_pointer_4])
                  break;
               default:
                  let empty_pointer_default = Buffer.alloc(28);
                  buffer_extensions = Buffer.concat([buffer_extensions, empty_pointer_default])
                  break;
            }
         } else {
            // Checks if block alignment is needed, if so, adds empty pointers 
            switch (((files.length * 4) + 1) % 4) {
               case 1:
                  let empty_pointer_12 = Buffer.alloc(12);
                  buffer_extensions = Buffer.concat([buffer_extensions, empty_pointer_12])
                  console.log("Adicionou 12 bytes");
                  break;
               case 2:
                  let empty_pointer_8 = Buffer.alloc(8);
                  buffer_extensions = Buffer.concat([buffer_extensions, empty_pointer_8])
                  console.log("Adicionou 8 bytes");
                  break;
               case 3:
                  let empty_pointer_4 = Buffer.alloc(4);
                  buffer_extensions = Buffer.concat([buffer_extensions, empty_pointer_4])
                  console.log("Adicionou 4 bytes");
                  break;
               default:
                  break;
            }
         }



         // Creates compiled folder for ready .dat files
         if (!fs.existsSync(`DAT/Compiled`)) {
            fs.mkdirSync(`DAT/Compiled`, { recursive: true })
         }

         // Writes header, pointers, file extensions and appends every file inside the folder
         fs.writeFileSync(`DAT/Compiled/${folderName}.dat`, Buffer.concat([buffer_offsets, buffer_extensions]));
         for (let x = 0; x != files.length; x++) {
            fs.appendFileSync(`DAT/Compiled/${folderName}.dat/`, fs.readFileSync(`DAT/${folderName}/${files[x]}`))
         }
      })
   })

   // Main Functions

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
