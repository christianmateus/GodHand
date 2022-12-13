const fs = require('fs');
const { windowsStore } = require('process');
const { ipcRenderer } = require('electron');

// Const for testing text output (DEBUG)
const textarea = document.getElementById("testes");

/* ===============
    CREATE
   =============== */

// Getting elements
var rootEl = document.querySelector("html");
var copyBtnEl = document.getElementById("copyBtn");
var pasteBtnEl = document.getElementById("pasteBtn");
var undoBtnEl = document.getElementById("undoBtn");
var redoBtnEl = document.getElementById("redoBtn");
var countEl = document.getElementById("count");
var numberSequential = document.querySelector(".number-sequential");
var selectItemID = document.querySelector(".item-id");
var quantityEl = document.querySelector(".quantity");
var indexEl = document.querySelector(".item-index");
var selectRandomEl = document.querySelector(".random");
var selectGlowEl = document.querySelector(".glow");
var selectInsideEl = document.querySelector(".inside");
var etsEl = document.querySelector(".ets");
var selectStatusEl = document.querySelector(".status");
var posX = document.querySelector(".posX");
var posY = document.querySelector(".posY");
var posZ = document.querySelector(".posZ");
var rotX = document.querySelector(".rotX");
var rotY = document.querySelector(".rotY");
var rotZ = document.querySelector(".rotZ");

// Getting elements for cloneRow function
var table = document.querySelector("table");
var tBody = document.querySelector("tbody");
var row = document.querySelector(".tableRow");

// Const for getting Menu elements
const openFile = document.getElementById("openFile")
const closeBtn = document.getElementById("closeFile")
const saveBtn = document.getElementById("saveFile")
const saveAsBtn = document.getElementById("saveAs")
const minimizeBtn = document.getElementById("minimize")
const maximizeBtn = document.getElementById("maximize")
const closeWindowBtn = document.getElementById("closeWindow")

var headerFileName = document.getElementById("header-filename");
var headerFileSize = document.getElementById("header-filesize");


// Menu actions (open/save/quit)
openFile.addEventListener("click", () => {
    ipcRenderer.send("openfile");
    ipcRenderer.send("closeITAfile");
})

saveAsBtn.addEventListener("click", () => {
    ipcRenderer.send("saveFile")
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
var chunk = 0; // Used together with sum to read all chunks data
var seq = 1; // Used to update the row/slot number
var itemID_id = 2; // Add a new id for each cell in every row
var quantity_id = 2; // Add a new id for each cell in every row
var index_id = 2; // Add a new id for each cell in every row
var random_id = 2; // Add a new id for each cell in every row
var glow_id = 2; // Add a new id for each cell in every row
var inside_id = 2; // Add a new id for each cell in every row
var ets_id = 2; // Add a new id for each cell in every row
var status_id = 2; // Add a new id for each cell in every row
var posX_id = 2; // Add a new id for each cell in every row
var posY_id = 2; // Add a new id for each cell in every row
var posZ_id = 2; // Add a new id for each cell in every row
var rotX_id = 2; // Add a new id for each cell in every row
var rotY_id = 2; // Add a new id for each cell in every row
var rotZ_id = 2; // Add a new id for each cell in every row

// Menu bar buttons 
copyBtnEl.addEventListener("click", () => document.execCommand("copy")); // Copy function
pasteBtnEl.addEventListener("click", () => document.execCommand("paste")); // Paste function
undoBtnEl.addEventListener("click", () => document.execCommand("undo")); // Undo function
redoBtnEl.addEventListener("click", () => document.execCommand("redo")); // Redo function

ipcRenderer.on("dialog", (e, arg) => {
    let fd = fs.openSync(arg); // fd means file descriptor
    var buffer = fs.readFileSync(fd);

    // Defining headers
    var ITAFileName = String(arg);
    var ITAFileName_converted = ITAFileName.replace(/^[^.]*\\/gm, '');
    headerFileSize.value = buffer.length + " bytes"; // Outputing file size to the header
    headerFileName.value = ITAFileName_converted; // Outputing file name to the header

    let total_item = buffer.readUInt8(6);
    countEl.setAttribute("value", total_item);


    // Reading table data
    for (i = 1; i != total_item; i++) {
        // Item slot number
        numberSequential.innerText = 1;

        // Reading item ID
        var getItem_id = buffer.readUInt8(148);
        selectItemID.id = 1;
        selectItemID.selectedIndex = getItem_id;

        // Reading quantity bytes
        var getQuantity = buffer.readUint16LE(152);
        quantityEl.id = 1;
        quantityEl.value = getQuantity;

        // Reading index byte
        var getIndex = buffer.readUint8(70);
        indexEl.id = 1;
        indexEl.value = getIndex;

        // Reading random byte
        var getRandom = buffer.readUint8(149);
        selectRandomEl.id = 1;
        if (getRandom == 0) {
            selectRandomEl.selectedIndex = 0;
        } else if (getRandom == 16) {
            selectRandomEl.selectedIndex = 1;
        }

        // Reading glow byte
        var getGlow = buffer.readUint8(156);
        selectGlowEl.id = 1;
        selectGlowEl.selectedIndex = getGlow;

        // Reading inside byte
        var getInside = buffer.readUint8(86);
        selectInsideEl.id = 1;
        selectInsideEl.selectedIndex = getInside;

        // Reading ETS byte
        var getETS = buffer.readUint8(87);
        etsEl.id = 1;
        etsEl.value = getETS;

        // Reading status byte
        var getStatus = buffer.readUint8(160);
        selectStatusEl.id = 1;
        if (getStatus == 0) {
            selectStatusEl.selectedIndex = 0;
        } else if (getStatus == 2) {
            selectStatusEl.selectedIndex = 1;
        } else if (getStatus == 16) {
            selectStatusEl.selectedIndex = 2;
        } else {
            selectStatusEl.selectedIndex = 0;
        }

        // Reading position X
        var getPosX = buffer.readFloatLE(112).toFixed(2);
        posX.id = 1;
        posX.value = getPosX;

        // Reading position Y
        var getPosY = buffer.readFloatLE(116).toFixed(2);
        posY.id = 1;
        posY.value = getPosY;

        // Reading position Z
        var getPosZ = buffer.readFloatLE(120).toFixed(2);
        posZ.id = 1;
        posZ.value = getPosZ;

        cloneRow();
    }

    // Função para criar novas linhas
    function cloneRow() {
        let clone = row.cloneNode(true); // Cloning all child nodes
        chunk = chunk + 176;
        seq++;

        let cloneSeq = clone.querySelector(".number-sequential");
        cloneSeq.innerText = seq;

        // Reading next ITEM ID bytes
        let cloneItem_id = buffer.readUInt8(148 + chunk);
        let selectItem_id = clone.querySelector(".item-id");
        selectItem_id.id = itemID_id++;
        selectItem_id.selectedIndex = cloneItem_id;

        // for (var i = 0; i < selectItem_id.options.length; i++) {
        //     if (selectItem_id.options[i].value == cloneItem_id) {
        //         selectItem_id.selectedIndex = i;
        //     }
        // }

        // Reading next QUANTITY bytes
        let cloneQuantity = buffer.readUInt16LE(152 + chunk);
        let cloneQuantityEl = clone.querySelector(".quantity");
        cloneQuantityEl.id = quantity_id++;
        clone.querySelector(".quantity").value = cloneQuantity;

        // Reading next INDEX byte
        let cloneIndex = buffer.readUInt8(70 + chunk);
        let cloneIndexEl = clone.querySelector(".item-index")
        cloneIndexEl.id = index_id++;
        cloneIndexEl.value = cloneIndex;

        // Reading next RANDOM bytes
        let cloneRandom = buffer.readUInt8(149 + chunk);
        let cloneRandomEl = clone.querySelector(".random");
        cloneRandomEl.id = random_id++;

        if (cloneRandom == 0) {
            clone.querySelector(".random").selectedIndex = 0;
        } else {
            clone.querySelector(".random").selectedIndex = 1;
        }

        // Reading next GLOW bytes
        let cloneGlow = buffer.readUInt8(156 + chunk);
        let cloneGlowEl = clone.querySelector(".glow");
        cloneGlowEl.id = glow_id++;
        cloneGlowEl.selectedIndex = cloneGlow;

        // Reading next INSIDE bytes
        let cloneInside = buffer.readUInt8(86 + chunk);
        let cloneInsideEl = clone.querySelector(".inside")
        cloneInsideEl.id = inside_id++;
        cloneInsideEl.selectedIndex = cloneInside;

        // Reading next ETS byte
        let cloneETS = buffer.readUInt8(87 + chunk);
        let cloneEtsEl = clone.querySelector(".ets")
        cloneEtsEl.id = ets_id++;
        cloneEtsEl.value = cloneETS;

        // Reading next ITEM STATUS bytes
        let cloneStatus = buffer.readUInt8(160 + chunk);
        let cloneStatusEl = clone.querySelector(".status");
        cloneStatusEl.id = status_id++;

        if (cloneStatus == 0) {
            clone.querySelector(".status").selectedIndex = 0;
        } else if (cloneStatus == 2) {
            clone.querySelector(".status").selectedIndex = 1;
        } else if (cloneStatus == 16) {
            clone.querySelector(".status").selectedIndex = 2;
        } else {
            clone.querySelector(".status").selectedIndex = 0;
        }

        // Reading next X Coordinate bytes
        let cloneX = buffer.readFloatLE(112 + chunk).toFixed(2);
        let cloneXEl = clone.querySelector(".posX");
        cloneXEl.id = posX_id++;
        cloneXEl.value = cloneX;

        //Reading next Y Coordinate bytes
        let cloneY = buffer.readFloatLE(116 + chunk).toFixed(2);
        let cloneYEl = clone.querySelector(".posY");
        cloneYEl.id = posY_id++;
        cloneYEl.value = cloneY;

        //Reading next Z Coordinate bytes
        let cloneZ = buffer.readFloatLE(120 + chunk).toFixed(2);
        let cloneZEl = clone.querySelector(".posZ");
        cloneZEl.id = posZ_id++;
        cloneZEl.value = cloneZ;

        tBody.appendChild(clone); // add new row to end of table

    }
    /* ===============
           UPDATE
       =============== */

    // Adding a parent event listener
    tBody.addEventListener("change", function (e) {
        // Gets value from item ID and sets to buffer
        if (e.target.className == "item-id") {
            var setItemID = e.target.id;
            var setItemID_opt = e.target.selectedIndex;
            var chunk_save = 176 * (parseInt(setItemID) - 1);
            buffer.writeUint8(setItemID_opt, 148 + chunk_save)
        }
        // Gets value from quantity and sets to buffer
        if (e.target.className == "quantity") {
            var setQuantity = e.target.value;
            var setQuantityId = e.target.id;
            var chunk_save = 176 * (parseInt(setQuantityId) - 1);
            if (setQuantity <= 65000) {
                buffer.writeUint16LE(setQuantity, 152 + chunk_save)
                document.getElementsByClassName("quantity")[parseInt(setQuantityId) - 1].style.color = "#111";
                document.getElementsByClassName("quantity")[parseInt(setQuantityId) - 1].style.outline = "none";
            } else {
                document.getElementsByClassName("quantity")[parseInt(setQuantityId) - 1].style.color = "red";
                document.getElementsByClassName("quantity")[parseInt(setQuantityId) - 1].style.outline = "1px solid red";
            }
        }
        // Gets value from index and sets to buffer
        if (e.target.className == "item-index") {
            var setIndex = e.target.value;
            var setIndexId = e.target.id;
            var chunk_save = 176 * (parseInt(setIndexId) - 1);
            if (setIndex <= 255) {
                buffer.writeUint8(setIndex, 70 + chunk_save)
                document.getElementsByClassName("item-index")[parseInt(setIndexId) - 1].style.color = "#000";
                document.getElementsByClassName("item-index")[parseInt(setIndexId) - 1].style.outline = "none";
            } else {
                document.getElementsByClassName("item-index")[parseInt(setIndexId) - 1].style.color = "red";
                document.getElementsByClassName("item-index")[parseInt(setIndexId) - 1].style.outline = "1px solid red";
            }
        }
        // Gets value from random and sets to buffer
        if (e.target.className == "random") {
            var setRandom_opt = e.target.selectedIndex;
            var setRandomId = e.target.id;
            var chunk_save = 176 * (parseInt(setRandomId) - 1);
            if (setRandom_opt == 0) {
                buffer.writeUint8(0, 149 + chunk_save);
            } else if (setRandom_opt == 1) {
                buffer.writeUint8(16, 149 + chunk_save);
            }
        }
        // Gets value from glow and sets to buffer
        if (e.target.className == "glow") {
            var setGlow_opt = e.target.selectedIndex;
            var setGlowId = e.target.id;
            var chunk_save = 176 * (parseInt(setGlowId) - 1);
            buffer.writeUint8(setGlow_opt, 156 + chunk_save);
        }
        // Gets value from inside and sets to buffer
        if (e.target.className == "inside") {
            var setInside_opt = e.target.selectedIndex;
            var setInsideId = e.target.id;
            var chunk_save = 176 * (parseInt(setInsideId) - 1);
            buffer.writeUint8(setInside_opt, 86 + chunk_save);
        }
        // Gets value from ets and sets to buffer
        if (e.target.className == "ets") {
            var setEts = e.target.value;
            var setEtsId = e.target.id;
            var chunk_save = 176 * (parseInt(setEtsId) - 1);
            if (setEts <= 255) {
                buffer.writeUint8(setEts, 87 + chunk_save);
                document.getElementsByClassName("ets")[parseInt(setEtsId) - 1].style.color = "#000";
                document.getElementsByClassName("ets")[parseInt(setEtsId) - 1].style.outline = "none";
            } else {
                document.getElementsByClassName("ets")[parseInt(setEtsId) - 1].style.color = "red";
                document.getElementsByClassName("ets")[parseInt(setEtsId) - 1].style.outline = "1px solid red";
            }
        }
        // Gets value from status and sets to buffer
        if (e.target.className == "status") {
            var setStatus_opt = e.target.selectedIndex;
            var setStatusId = e.target.id;
            var chunk_save = 176 * (parseInt(setStatusId) - 1);
            if (setStatus_opt == 0) {
                buffer.writeUint8(0, 160 + chunk_save);
            } else if (setStatus_opt == 1) {
                buffer.writeUint8(2, 160 + chunk_save);
            } else if (setStatus_opt == 2) {
                buffer.writeUint8(16, 160 + chunk_save);
            }
        }
        // Gets value from X and sets to buffer
        if (e.target.className == "posX") {
            var setPosX = e.target.value;
            var setPosXid = e.target.id;
            var chunk_save = 176 * (parseInt(setPosXid) - 1);
            buffer.writeFloatLE(setPosX, 112 + chunk_save).toFixed(2);
        }
        // Gets value from X and sets to buffer
        if (e.target.className == "posY") {
            var setPosY = e.target.value;
            var setPosYid = e.target.id;
            var chunk_save = 176 * (parseInt(setPosYid) - 1);
            buffer.writeFloatLE(setPosY, 116 + chunk_save).toFixed(2);
        }
        // Gets value from X and sets to buffer
        if (e.target.className == "posZ") {
            var setPosZ = e.target.value;
            var setPosZid = e.target.id;
            var chunk_save = 176 * (parseInt(setPosZid) - 1);
            buffer.writeFloatLE(setPosZ, 120 + chunk_save).toFixed(2);
        }
    })
    // Menu buttons
    saveBtn.addEventListener("click", () => {
        fs.writeFileSync(arg, buffer);
        var saveMessage = document.querySelector(".hide");
        saveMessage.style.display = "block"
        setTimeout(() => {
            saveMessage.style.display = "none"
        }, 2000);
    })

    ipcRenderer.on("saveAsITA", (e, arg) => {
        fs.writeFileSync(arg, buffer);
    })

})

closeBtn.addEventListener("click", () => {
    ipcRenderer.send("closeITAfile");
})
