const fs = require('fs');
const { ipcRenderer } = require('electron');

/* ===============
    CREATE
   =============== */

// Getting elements
var rootEl = document.querySelector("html");
var headerFileName = document.getElementById("header-filename");
var headerFileSize = document.getElementById("header-filesize");

// Const for getting Menu elements
const openFile = document.getElementById("openSpecialsfile");
const closeBtn = document.getElementById("closeSpecialsfile");
const saveBtn = document.getElementById("saveSpecialsfile");
const saveAsBtn = document.getElementById("saveSpecialsas");
const quitApp = document.getElementById("quitApp");
const minimizeBtn = document.getElementById("minimize");
const maximizeBtn = document.getElementById("maximize");
const closeWindowBtn = document.getElementById("closeWindow");

var toggleWhiteTheme = document.querySelector(".white-theme-btn");
var toggleDarkTheme = document.querySelector(".dark-theme-btn");

var export_tpl = document.getElementById("export-tpl");
var import_tpl = document.getElementById("import-tpl");

// Menu actions (open/save/quit)
openFile.addEventListener("click", () => {
   ipcRenderer.send("openSPECIALSfile")
   ipcRenderer.send("closeSPECIALSfile")
})

saveAsBtn.addEventListener("click", () => {
   ipcRenderer.send("saveAsSpecialsfile")
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
ipcRenderer.on("specialsFileChannel", (e, filepath) => {

   var fd = fs.openSync(filepath); // Opening the file in memory
   var buffer = fs.readFileSync(fd); // Converting file string to buffer (hex)
   var BINFileName = String(filepath);
   var conv = BINFileName.replace(/^[^.]*\\/gm, '');
   headerFileSize.value = buffer.length + " bytes";
   headerFileName.value = conv;

   let iterator = 0;
   let tpl_offsets;

   export_tpl.addEventListener("click", function () {
      for (let i = 0; i != buffer.at(0); i++) {
         if (!fs.existsSync("Specials")) {
            fs.mkdirSync("Specials", { recursive: true })
         }
         if (!(i == buffer.at(0) - 1)) {
            let tpl = buffer.subarray(buffer.readUint32LE(4 + iterator), buffer.readUint32LE(8 + iterator));
            fs.writeFileSync(`Specials/${i}.tpl`, tpl);
         } else {
            console.log("Entrou no offset " + i);
            let tpl = buffer.subarray(buffer.readUint32LE(4 + iterator));
            fs.writeFileSync(`Specials/${i}.tpl`, tpl);
         }
         iterator += 4;
      }
   })

   import_tpl.addEventListener("click", function () {
      let buffer_header = Buffer.alloc(0x80)
      let fileLengthIterator = 0;
      let buffer_complete = Buffer.alloc(0);
      let file_count = 0;
      iterator = 0;

      buffer_header.writeUint8(buffer.at(0), 0);
      buffer_header.writeUint8(128, 4);

      for (let j = 0; j != buffer.at(0) - 1; j++) {
         let file = fs.readFileSync(`Specials/${j}.tpl`);
         fileLengthIterator = fileLengthIterator + file.length;

         buffer_header.writeUint32LE(fileLengthIterator + 128, 8 + iterator)
         iterator += 4;
      }

      for (let i = 0; i != buffer.at(0); i++) {
         if (!fs.existsSync("Specials")) {
            fs.mkdirSync("Specials", { recursive: true })
         }
         let file = fs.readFileSync(`Specials/${i}.tpl`);
         fs.appendFileSync("Specials/data.tpl", file);
      }

      fs.writeFileSync("Specials/data_complete.tpl", Buffer.concat([buffer_header, fs.readFileSync("Specials/data.tpl")]));
   })

   // Main Functions
   function showTextBox(message, status) {
      var removedMessage = document.querySelector(".removedEntry");
      removedMessage.style.display = "block"
      removedMessage.style.backgroundColor = status;
      if (status == "exported") {
         document.getElementById("removedEntry").firstElementChild.style.backgroundColor = "#333"
         document.getElementById("removedEntry").firstElementChild.style.border = "2px solid #ddd"
         document.getElementById("removedEntry").firstElementChild.style.width = "35%"
         document.getElementById("removedEntry").firstElementChild.innerHTML = '<i class="fa-solid fa-file-export"></i>&nbsp&nbsp' + message;
      }
      if (status == "imported") {
         document.getElementById("removedEntry").firstElementChild.style.backgroundColor = "#353"
         document.getElementById("removedEntry").firstElementChild.style.border = "2px solid #7f7"
         document.getElementById("removedEntry").firstElementChild.style.color = "2px solid #7f7"
         document.getElementById("removedEntry").firstElementChild.style.color = "2px solid #7f7"
         document.getElementById("removedEntry").firstElementChild.style.width = "35%"
         document.getElementById("removedEntry").firstElementChild.innerHTML = '<i class="fa-solid fa-file-import"></i>&nbsp&nbsp' + message;
      }
      setTimeout(() => {
         removedMessage.style.display = "none"
      }, 2000);
   }

   /* ===============
       UPDATE
      =============== */

   /* ==========================================
       NEW FUNCIONALITY: 
      ========================================== */

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
      ipcRenderer.send("closeSPECIALSfile");
   })

   ipcRenderer.on("saveAsSpecialsfileContent", (e, arg) => {
      fs.writeFileSync(arg, buffer);
   })
})
