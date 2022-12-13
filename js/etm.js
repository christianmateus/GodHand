const fs = require('fs');
const { ipcRenderer } = require('electron');
const path = require('path');
const textBox = require('../shared/textBox').module;
const ETM = require('../resources/etm-objects').ETMobject;

/* ===============
    CREATE
   =============== */

// Getting elements
var rootEl = document.querySelector("html");
var exportAllBtn = document.getElementById("export-all");
var exportAllSubfoldersBtn = document.getElementById("export-all-subfolders");
var downloadBtn = document.getElementById("downloadBtn");
var searchBtnEl = document.getElementById("searchBtn");
var copyBtnEl = document.getElementById("copyBtn");
var pasteBtnEl = document.getElementById("pasteBtn");
var undoBtnEl = document.getElementById("undoBtn");
var redoBtnEl = document.getElementById("redoBtn");
var headerFileName = document.getElementById("header-filename");
var headerFileSize = document.getElementById("header-filesize");
var countEl = document.getElementById("count");

// Getting entries elements
const tbody = document.getElementsByTagName("tbody")[0];
const entrySizeCell = document.getElementsByClassName("entrySize");
const entryRawNameCell = document.getElementsByClassName("entryRawName");
const entryTypeCell = document.getElementsByClassName("entryType");
const entryAvailableCell = document.getElementsByClassName("entryAvailable");

// Const for getting Menu elements
const openFile = document.getElementById("openETMfile");
const closeBtn = document.getElementById("closeETMfile");
const saveBtn = document.getElementById("saveETMfile");
const saveAsBtn = document.getElementById("saveETMas");
const quitApp = document.getElementById("quitApp");
const minimizeBtn = document.getElementById("minimize");
const maximizeBtn = document.getElementById("maximize");
const closeWindowBtn = document.getElementById("closeWindow");

const addNewButtons = document.getElementsByClassName("add-new-buttons");
const modal = document.querySelector(".modal");
const closeButton = document.querySelector(".close-button");
const fieldsetFiles = document.getElementById("fieldset-files");
const optionSelect = document.getElementById("download-select");
const objectList = document.getElementsByClassName("object-list");
const fileList = document.getElementsByClassName("file-list");
const downloadFileList = document.getElementsByClassName("download-file-btn");
const downloadSuccessfulMsg = document.getElementsByClassName("download-success")[0];
const objImage = document.querySelector(".obj-image");

// Menu actions (open/save/quit)
openFile.addEventListener("click", () => {
  ipcRenderer.send("openETMfile")
  ipcRenderer.send("closeETMfile")
})

saveAsBtn.addEventListener("click", () => {
  ipcRenderer.send("saveAsETMfile")
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

// Basic funcionalities

/* ===============
    READ
   =============== */

// Global variables
var chunk = 0; // Will be incremented in each chunk

// Menu bar buttons 
copyBtnEl.addEventListener("click", () => document.execCommand("copy")); // Copy function
pasteBtnEl.addEventListener("click", () => document.execCommand("paste")); // Paste function
undoBtnEl.addEventListener("click", () => document.execCommand("undo")); // Undo function
redoBtnEl.addEventListener("click", () => document.execCommand("redo")); // Redo function

// Getting file path
ipcRenderer.on("etmFileChannel", (e, filepath) => {

  var fd = fs.openSync(filepath); // Opening the file in memory
  var buffer = fs.readFileSync(fd); // Converting file string to buffer (hex)

  // Defining headers
  var ETMFileName = String(filepath);
  var ETMFileName_converted = ETMFileName.replace(/^[^.]*\\/gm, '');
  headerFileSize.value = buffer.length + " bytes"; // Outputing file size to the header
  headerFileName.value = ETMFileName_converted; // Outputing file name to the header

  // Reading ETM file header 
  countEl.value = buffer.readUint8(0);

  // Spliting the file
  let buffer_header = buffer.subarray(0x00, 0x20);
  let buffer_entries = buffer.subarray(0x20);

  // Core functions
  function createTableRow(index) {
    let tr = document.createElement("tr");
    let td_number = document.createElement("td");
    let td_raw = document.createElement("td");
    let td_size = document.createElement("td");
    let td_type = document.createElement("td");
    let td_available = document.createElement("td");
    let td_import = document.createElement("td");
    let td_export = document.createElement("td");
    let td_download = document.createElement("td");
    let td_remove = document.createElement("td");
    let td_notes = document.createElement("td");
    let import_btn = document.createElement("button");
    let export_btn = document.createElement("button");
    let download_btn = document.createElement("button");
    let remove_btn = document.createElement("button");
    let notes = document.createElement("input");

    tr.id = index + 1;
    td_number.innerText = index + 1;

    td_raw.id = `td_raw-${index + 1}`
    td_raw.classList.add("entryRawName");

    td_size.id = `td_size-${index + 1}`
    td_size.classList.add("entrySize");

    td_type.id = `td_type-${index + 1}`
    td_type.classList.add("entryType");

    td_available.id = `td_available-${index + 1}`
    td_available.classList.add("entryAvailable");

    import_btn.id = `importBtn-${index}`
    export_btn.id = `exportBtn-${index}`
    download_btn.id = `downloadBtn-${index}`
    remove_btn.id = `removeBtn-${index}`

    td_import.classList.add("cell-buttons");
    td_export.classList.add("cell-buttons");
    td_download.classList.add("cell-buttons");
    td_remove.classList.add("cell-buttons");

    import_btn.classList.add("win7-btn", "table-buttons");
    export_btn.classList.add("win7-btn", "table-buttons");
    download_btn.classList.add("win7-btn", "table-buttons");
    remove_btn.classList.add("win7-btn", "table-buttons");

    import_btn.innerHTML = `<img src="./images/import.png" id="download-btn"
    class="icons-inside-button"> Import`;
    export_btn.innerHTML = `<img src="./images/export.png" id="download-btn"
    class="icons-inside-button"> Export`;
    // download_btn.innerHTML = `<i class="fa-solid fa-download"></i> Download`;
    remove_btn.innerHTML = `<img src="./images/trash.png" id="download-btn"
    class="icons-inside-button"> Remove`;
    notes.classList.add("comment-box");
    notes.setAttribute("placeholder", "Type here...");
    notes.setAttribute("type", "text");

    td_import.appendChild(import_btn);
    td_export.appendChild(export_btn);
    // td_download.appendChild(download_btn);
    td_remove.appendChild(remove_btn);
    // td_notes.appendChild(notes);

    tr.append(td_number, td_raw, td_size, td_type, td_available, td_import, td_export, td_remove);
    tbody.appendChild(tr);
  }

  // Activates buttons
  addNewButtons[0].removeAttribute("disabled");
  addNewButtons[1].removeAttribute("disabled");

  // Create initial table rows
  for (let x = 0; x != countEl.value; x++) {
    createTableRow(x);
  }

  // Populates the table cell with data
  function showData() {
    let fileSizeAcumulator = 0;
    for (let i = 0; i != countEl.value; i++) {
      let entryName = buffer_entries.subarray(0x20 + fileSizeAcumulator, 0x20 + fileSizeAcumulator + 16);
      let firstZeroedByte = entryName.indexOf(0x00);
      let entryTrimmed = entryName.subarray(0, firstZeroedByte).toString();
      let entrySize = buffer_entries.readUInt32LE(0x00 + fileSizeAcumulator);

      if (entrySize > 999) {
        entrySize = entrySize / 1000;
        entrySizeCell[i].innerText = entrySize.toFixed(0) + " KB";
      } else {
        entrySizeCell[i].innerText = entrySize + " B";
      }

      entryRawNameCell[i].innerText = entryTrimmed;
      entryTypeCell[i].innerText = buffer_entries.readUInt32LE(0x04 + fileSizeAcumulator);

      fileSizeAcumulator += buffer_entries.readUInt32LE(0x00 + fileSizeAcumulator);
    }
  }
  showData();

  // Stores the room name
  var folderName = headerFileName.value.substring(0, headerFileName.value.length - 4);

  // Gets click events 
  tbody.addEventListener("click", function exportObject({ target }) {
    let iterator = 0;

    // Export an object
    for (let x = 0; x != countEl.value; x++) {
      if (target.id == `exportBtn-${x}`) {
        if (!fs.existsSync(`ETM/${folderName}`)) {
          fs.mkdirSync(`ETM/${folderName}`, { recursive: true });
        }

        let entryHeader = buffer_entries.subarray(0x00 + iterator, 0x40 + iterator);
        let obj = buffer_entries.subarray(0x40 + iterator, 0x40 + iterator + entryHeader.readUint32LE(0));

        fs.writeFile(`ETM/${folderName}/${entryRawNameCell[x].textContent}`, obj, function (err) {
          if (err) {
            console.log(err);
          }
          textBox("Object exported successfully!", "green");
        })
      } else { iterator += buffer_entries.readUint32LE(0 + iterator); }
    }

    iterator = 0;
    let arrayForIterator = [];
    // Import an object
    for (let x = 0; x != countEl.value; x++) {
      arrayForIterator.push(buffer_entries.readUint32LE(0 + iterator));
      if (target.id == `importBtn-${x}`) {
        if (!fs.existsSync(`ETM/${folderName}`)) {
          fs.mkdirSync(`ETM/${folderName}`, { recursive: true });
        }

        // Shows open Dialog, and then imports to the ETM file
        ipcRenderer.send("swapETM");

        // Fix for iterator acumulating more than needed
        let realIterator = iterator;

        // Handling imported object
        ipcRenderer.once("swappedETMobject", function (e, filepath) {
          let buffer_newFile = fs.readFileSync(filepath);
          let newFileName = path.basename(filepath).toLowerCase();

          // If object came from CRZOSK tool, remove the header and rename the file
          if (path.extname(newFileName).toLowerCase() == ".etb") {
            buffer_newFile = buffer_newFile.subarray(0x40);
            newFileName = newFileName.slice(0, newFileName.length - 4);
            newFileName = newFileName.replace("_", ".");
          }

          let file_header = Buffer.alloc(0x40);
          let buffer_top = Buffer.alloc(0);
          let buffer_bottom = Buffer.alloc(0);
          let fileExtension = path.extname(newFileName).toLowerCase();

          file_header.writeUint32LE(buffer_newFile.length + 0x40, 0x00);
          switch (fileExtension) {
            case ".eff": if (!newFileName.includes("obm")) { file_header.writeUint8(0x09, 0x04); break; }
            case ".eff": if (newFileName.includes("obm")) { file_header.writeUint8(0x0A, 0x04); break; }
            case ".bin": file_header.writeUint8(0x0B, 0x04); break;
            case ".tpl": file_header.writeUint8(0x0B, 0x04); break;
            case ".fcv": file_header.writeUint8(0x0C, 0x04); break;
            case ".seq": file_header.writeUint8(0x0D, 0x04); break;
            default: break;
          }

          let buffer_newFileName = Buffer.from(newFileName);
          for (let index = 0; index != buffer_newFileName.length; index++) {
            file_header.writeUint8(buffer_newFileName[index], 32 + index)
          }

          if (arrayForIterator.length > 1) {
            iterator = realIterator;
          }

          if (x == 0) {
            buffer_top = buffer_entries.subarray(0x00, 0x00);
            buffer_bottom = buffer_entries.subarray(buffer_entries.readUint32LE(0x00));
          } else {
            buffer_top = buffer_entries.subarray(0x00, 0x00 + iterator);
            buffer_bottom = buffer_entries.subarray(0x00 + iterator + buffer_entries.readUint32LE(iterator));
          }

          buffer_entries = Buffer.concat([buffer_top, file_header, buffer_newFile, buffer_bottom]);
          showData();
          showAvailability();
        });
        break;
      } else { iterator += buffer_entries.readUint32LE(0 + iterator); }
    }

    iterator = 0;
    // Remove an object
    for (let x = 0; x != countEl.value; x++) {
      if (target.id == `removeBtn-${x}`) {
        document.getElementById(String(Number(x + 1))).remove(); // Removes table row
        let buffer_top = buffer_entries.subarray(0, 0 + iterator);
        let buffer_down = buffer_entries.subarray(buffer_top.length + buffer_entries.readUint32LE(0 + iterator));

        buffer_entries = Buffer.concat([buffer_top, buffer_down]);
        buffer_header.writeUint8(buffer_header.at(0) - 1, 0); // Reduces by -1 on the ETM header index
        countEl.value--;
        tbody.innerHTML = "";
        // Create initial table rows
        for (let x = 0; x != countEl.value; x++) {
          createTableRow(x);
        }
        showData();
        showAvailability();
        break;
      } else { iterator += buffer_entries.readUint32LE(0 + iterator); }
    }
  })

  exportAllBtn.addEventListener("click", function () {
    if (!fs.existsSync(`ETM/${folderName}`)) {
      fs.mkdirSync(`ETM/${folderName}`, { recursive: true });
    }
    let iterator = 0;

    for (let x = 0; x != countEl.value; x++) {
      let entryHeader = buffer_entries.subarray(0x00 + iterator, 0x40 + iterator);
      let obj = buffer_entries.subarray(0x40 + iterator, 0x40 + iterator + entryHeader.readUint32LE(0));

      fs.writeFile(`ETM/${folderName}/${entryRawNameCell[x].textContent}`, obj, function (err) {
        if (err) {
          console.log(err);
        }
      })
      iterator += buffer_entries.readUint32LE(0 + iterator);
    }
    textBox("All objects exported successfully!", "green");
  });

  // Export all objects creating subfolders with object name
  exportAllSubfoldersBtn.addEventListener("click", function () {
    if (!fs.existsSync(`ETM/${folderName}`)) {
      fs.mkdirSync(`ETM/${folderName}`, { recursive: true });
    }
    let iterator = 0;

    for (let x = 0; x != countEl.value; x++) {
      let entryHeader = buffer_entries.subarray(0x00 + iterator, 0x40 + iterator);
      let obj = buffer_entries.subarray(0x40 + iterator, 0x40 + iterator + entryHeader.readUint32LE(0));
      let objectName;

      if (entryRawNameCell[x].textContent.includes("obm")) {
        objectName = entryRawNameCell[x].textContent.slice(0, 5);
      } else {
        objectName = entryRawNameCell[x].textContent.slice(0, 4);
      }

      if (!fs.existsSync(`ETM/${folderName}/${objectName}`)) {
        fs.mkdirSync(`ETM/${folderName}/${objectName}`, { recursive: true });
      }

      fs.writeFile(`ETM/${folderName}/${objectName}/${entryRawNameCell[x].textContent}`, obj, function (err) {
        if (err) {
          console.log(err);
        }
      })
      iterator += buffer_entries.readUint32LE(0 + iterator);
    }
    textBox("All objects exported successfully!", "green");
  });

  /* ===============
      UPDATE
     =============== */

  // ADD NEW OBJECT  
  addNewButtons[0].addEventListener("click", async function () {
    ipcRenderer.send("importETM");
    ipcRenderer.once("ETMobject", (e, filepath) => {
      let newETM = fs.readFileSync(filepath);

      let newFileName = path.basename(filepath).toLowerCase();
      console.log(newETM.length);
      console.log(newFileName);
      if (path.extname(newFileName).toLowerCase() == ".etb") {
        console.log("Foi ETB");
        newETM = newETM.subarray(0x40);
        newFileName = newFileName.slice(0, newFileName.length - 4);
        newFileName = newFileName.replace("_", ".");
      }
      console.log(newETM.length);

      let file_header = Buffer.alloc(0x40);
      let fileExtension = path.extname(newFileName).toLowerCase();

      file_header.writeUint32LE(newETM.length + 0x40, 0x00);
      switch (fileExtension) {
        case ".eff": if (!newFileName.includes("obm")) { file_header.writeUint8(0x09, 0x04); break; }
        case ".eff": if (newFileName.includes("obm")) { file_header.writeUint8(0x0A, 0x04); break; }
        case ".bin": file_header.writeUint8(0x0B, 0x04); break;
        case ".tpl": file_header.writeUint8(0x0B, 0x04); break;
        case ".fcv": file_header.writeUint8(0x0C, 0x04); break;
        case ".seq": file_header.writeUint8(0x0D, 0x04); break;
        default: break;
      }

      let buffer_newFileName = Buffer.from(newFileName);
      for (let index = 0; index != buffer_newFileName.length; index++) {
        file_header.writeUint8(buffer_newFileName[index], 32 + index)
      }
      buffer_entries = Buffer.concat([buffer_entries, file_header, newETM]);

      createTableRow((buffer.at(0) - 1) + 1);
      buffer.writeUint8(buffer.readUInt8(0) + 1, 0);
      countEl.value = buffer.at(0);
      // fs.writeFileSync(filepath, buffer_entries);
      showData();
      showAvailability();
    })
  });

  // Show modal for download screen
  function toggleModal() {
    modal.classList.toggle("show-modal");
  }

  // Hide modal if clicked outside modal
  function windowOnClick(event) {
    if (event.target === modal) {
      toggleModal();
      objImage.style.opacity = 0;
    }
  }

  // Shows available file list for downloading, based on selected option
  fileList[0].style.display = "block"
  optionSelect.addEventListener("change", function (e) {
    let opt_selected = e.target.selectedIndex;
    let obj_ID = objectList[opt_selected].innerText.slice(0, 4);

    for (let x = 0; x != fileList.length; x++) {
      fileList[x].style.display = "none"
    }

    objImage.style.opacity = 100;
    objImage.children[0].setAttribute("src", `./images/obj/${opt_selected}.png`);

    for (let i = 0; i != optionSelect.length; i++) {
      if (fileList[i].classList.contains(obj_ID)) {
        fileList[i].style.display = "block";
        break;
      }
    }
  })

  // Sets links for download buttons 
  fieldsetFiles.addEventListener("click", function (e) {
    if (e.target.classList.contains("download-file-btn")) {

      let parent = e.target.closest(".file-list");
      let array = parent.children;
      let iterator = 0;

      for (let x = 0; x != array.length; x++) {
        if (array[x].nodeName == "BUTTON") {
          array[x].id = 0 + iterator;
          iterator++;
        }
      }

      let obj_ID = parent.classList[0];
      for (let y = 0; y < Object.keys(ETM).length; y++) {
        if (Object.keys(ETM)[y] == obj_ID) {

          // Gets the object clicked, gets the values (links) and get the link based on button ID
          ipcRenderer.send("download", { url: Object.entries(ETM)[y][1][e.target.parentNode.id] });
          downloadSuccessfulMsg.style.opacity = 100;
          downloadSuccessfulMsg.children[0].textContent = `Started downloading file...`;
          setTimeout(() => {
            downloadSuccessfulMsg.style.opacity = 0;
          }, 800);
        }
      }
    }
  })

  // Handles object from a successfull download
  ipcRenderer.on("download-success", (e, arg) => {
    downloadSuccessfulMsg.style.opacity = 100;
    downloadSuccessfulMsg.children[0].textContent = `File ${arg.filename} downloaded successfully!`;
    setTimeout(() => {
      downloadSuccessfulMsg.style.opacity = 0;
    }, 2000);
    showAvailability();
  })

  /* ======================= 
      Download new object
     ======================= */
  downloadBtn.addEventListener("click", function () {
    toggleModal();
    objImage.children[0].setAttribute("src", `./images/obj/${optionSelect.selectedIndex}.png`);
    if (modal.classList.contains("show-modal")) {
      objImage.style.opacity = 100;
    } else {
      objImage.style.opacity = 0;
    }
  })

  addNewButtons[1].addEventListener("click", async function () {
    toggleModal();
    objImage.children[0].setAttribute("src", `./images/obj/${optionSelect.selectedIndex}.png`);
    objImage.style.opacity = 100;
  });

  closeButton.addEventListener("click", function () {
    toggleModal();
    objImage.style.opacity = 0;
  });
  window.addEventListener("click", windowOnClick);

  // Updates the file avaiability icon
  searchBtnEl.addEventListener("click", function () {
    showAvailability();
  })

  // Updates the file avaiability icon
  function showAvailability() {
    if (!fs.existsSync("ETM/Downloads")) {
      fs.mkdirSync("ETM/Downloads", { recursive: true });
    };

    let downloadedFiles = fs.readdirSync("ETM/Downloads");
    if (downloadedFiles.length == 0) {
      for (let x = 0; x != entryAvailableCell.length; x++) {
        entryAvailableCell[x].innerHTML = "<i class='fa-solid fa-circle-xmark'></i>"
        entryAvailableCell[x].style.color = "#733"
        entryAvailableCell[x].setAttribute("title", "Not available in Downloads folder");
      }
      return;
    }
    // Verifies if file exists on Downloads folder, then assigns text to the Available Cell
    for (let i = 0; i != entryAvailableCell.length; i++) {
      for (let x = 0; x != downloadedFiles.length; x++) {
        if (entryRawNameCell[i].textContent == downloadedFiles[x]) {
          entryAvailableCell[i].innerHTML = "<i class='fa-solid fa-circle-check'></i>";
          entryAvailableCell[i].style.color = "#473";
          entryAvailableCell[i].setAttribute("title", "Available in Downloads folder");
          break;
        } else {
          entryAvailableCell[i].innerHTML = "<i class='fa-solid fa-circle-xmark'></i>"
          entryAvailableCell[i].style.color = "#733"
          entryAvailableCell[i].setAttribute("title", "Not available in Downloads folder");
        }
      }
    }
  }
  showAvailability();

  // Save all modified buffer back to file
  saveBtn.addEventListener("click", () => {
    let COMPLETE_BUFFER = Buffer.concat([buffer_header, buffer_entries])
    headerFileSize.value = COMPLETE_BUFFER.length + " bytes";
    fs.writeFileSync(filepath, COMPLETE_BUFFER);
    var saveMessage = document.querySelector(".hide");
    saveMessage.style.display = "block"
    setTimeout(() => {
      saveMessage.style.display = "none"
    }, 2000);
  })

  closeBtn.addEventListener("click", () => {
    ipcRenderer.send("closeETMfile");
    fs.closeSync(fd);
  })

  ipcRenderer.on("saveAsETMfileContent", (e, arg) => {
    let COMPLETE_BUFFER = Buffer.concat([buffer_header, buffer_entries]);
    fs.writeFileSync(arg, COMPLETE_BUFFER);
  })
})
