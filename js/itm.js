const fs = require('fs');
const { ipcRenderer } = require('electron');
let Dropbox = require('dropbox').Dropbox;
let dbx = new Dropbox({ accessToken: 'sl.BUkN930Qgv0eW8plGbrzfXyUgF2xN4HQP7ktwvaOVYD56V8gjmX1C70QQps3Yuuy9Ch4CJvVJX9LNhcyIdbNr-aSdhWavTQvnJwtTjtqfbo6-Ll4TqJt8DeljeLmj5ldH7-qfUM' });

/* ===============
    CREATE
   =============== */

// Getting elements
var rootEl = document.querySelector("html");
var headerFileName = document.getElementById("header-filename");
var headerFileSize = document.getElementById("header-filesize");

// Const for getting Menu elements
const openFile = document.getElementById("openITMfile");
const closeBtn = document.getElementById("closeITMfile");
const saveBtn = document.getElementById("saveITMfile");
const saveAsBtn = document.getElementById("saveITMas");
const quitApp = document.getElementById("quitApp");
const minimizeBtn = document.getElementById("minimize");
const maximizeBtn = document.getElementById("maximize");
const closeWindowBtn = document.getElementById("closeWindow");

const fieldsetMain = document.getElementsByClassName("fieldset-main")[0];

// Menu actions (open/save/quit)
openFile.addEventListener("click", () => {
   ipcRenderer.send("openITMfile")
   ipcRenderer.send("closeITMfile")
})

saveAsBtn.addEventListener("click", () => {
   ipcRenderer.send("saveAsITMfile")
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

// 
dbx.filesListFolder({ path: '' })
   .then(function (response) {
      console.log(response);
   })
   .catch(function (error) {
      console.log(error);
   });

/* ===============
    READ
   =============== */

// Global variables
var chunk = 0; // Will be incremented in each chunk

// Getting file path
ipcRenderer.on("itmFileChannel", (e, filepath) => {

   var fd = fs.openSync(filepath); // Opening the file in memory
   var buffer = fs.readFileSync(fd); // Converting file string to buffer (hex)
   var BINFileName = String(filepath);
   var conv = BINFileName.replace(/^[^.]*\\/gm, '');
   headerFileSize.value = buffer.length + " bytes";
   headerFileName.value = conv;

   let boneCount = buffer.readUint8(0x09);
   let textureCount = buffer.readUint8(0x0A);
   let binType = buffer.readUint8(0x1A); // 1 == SMD, 3 == ITM
   let materialStartOffset = buffer.readUint32LE(12); // Very first line, reads pointer to the material list
   let binFirstSubmeshOffset = buffer.readUint32LE(materialStartOffset + 12); // Reads pointer from first material


   var num_faces = 32;
   for (var t = 0; t < num_faces - 2; t++) {
      if (t & 1)
         console.log([t, t + 1, t + 2]);
      else
         console.log([t, t + 2, t + 1]);
   }


   function covertBinToObj() {
      padding = 0;
      let submeshCount = 0; // Gets count of submeshes for each texture
      let submeshIterator = 0; // Iterates to another submesh by doing sum of submesh block * 16
      let submeshHeaderIterator = 0; // Simply sums + 0x30 which is a submesh header length
      let textureIterator = 0;
      let buffer_vertices = '';
      let buffer_normals = '';
      let buffer_textures = '';
      let buffer_complete = '';
      let objMaker = "";
      let objComplete = `# Resident evil 4 - BIN Tool 2022` +
         `\n` + `\n` + `# By HardRain` + `\n` + `\n`;

      if (binType == 1) {
         binHeaderSize = 64;
      } else if (binType == 3) {
         binHeaderSize = 96;
      }

      // Iterates through each texture
      for (let textureIndex = 0; textureIndex != textureCount; textureIndex++) {
         submeshCount = buffer.readUint8(binFirstSubmeshOffset + 2 + submeshIterator + submeshHeaderIterator + textureIterator);
         binFirstSubmeshOffset = buffer.readUint32LE(materialStartOffset + 12 + (16 * textureIndex));

         // Iterates through each submesh of each texture
         for (let submeshIndex = 0; submeshIndex != submeshCount - 1; submeshIndex++) {
            console.log('Submesh ' + submeshIndex);
            console.log("---------------------");

            submeshSize = buffer.readUint8(binFirstSubmeshOffset + 48 + submeshIterator + submeshHeaderIterator + textureIterator);
            objComplete = '';
            // buffer_vertices = 0;

            for (let i = 0; i != submeshSize; i++) {
               // Reading vertices XYZ
               let vert_X = buffer.readInt16LE(binFirstSubmeshOffset + submeshIterator + binHeaderSize + submeshHeaderIterator + padding) / 1.6 / 1000;
               let vert_Y = buffer.readInt16LE(binFirstSubmeshOffset + submeshIterator + binHeaderSize + submeshHeaderIterator + 2 + padding) / 1.6 / 1000;
               let vert_Z = buffer.readInt16LE(binFirstSubmeshOffset + submeshIterator + binHeaderSize + submeshHeaderIterator + 4 + padding) / 1.6 / 1000;

               padding = padding + 24; // padding between each set of data 
               objMaker = "v " + String(vert_X.toFixed(4)) + " " + String(vert_Y.toFixed(4)) + " " + String(vert_Z.toFixed(4)) + `\n`
               objComplete = objComplete + objMaker;
            }
            buffer_vertices = buffer_vertices + objComplete;
            padding = 0;
            objComplete = '';
            // console.log(binHeaderSize);
            // console.log(buffer_vertices.toString());

            // For used to read normals XYZ
            for (let i = 0; i != submeshSize; i++) {
               let normal_X = buffer.readInt16LE(binFirstSubmeshOffset + binHeaderSize + 8 + padding) / 2.56 / 1000;
               let normal_Y = buffer.readInt16LE(binFirstSubmeshOffset + binHeaderSize + 8 + 2 + padding) / 2.56 / 1000;
               let normal_Z = buffer.readInt16LE(binFirstSubmeshOffset + binHeaderSize + 8 + 4 + padding) / 2.56 / 1000;

               padding = padding + 24; // padding between each set of data 
               objMaker = "vn " + String(normal_X.toFixed(4)) + " " + String(normal_Y.toFixed(4)) + " " + String(normal_Z.toFixed(4)) + `\n`
               objComplete = objComplete + objMaker;
            }
            buffer_normals = buffer_normals + objComplete;
            padding = 0;
            objComplete = '';

            // For used to read Textures UV
            for (let i = 0; i != submeshSize; i++) {
               let texture_U = buffer.readInt16LE(binFirstSubmeshOffset + binHeaderSize + 16 + padding) / 2.55 / 100;
               let texture_V = buffer.readInt16LE(binFirstSubmeshOffset + binHeaderSize + 16 + 2 + padding) / 2.55 / 100;

               padding = padding + 24; // padding between each set of data 
               objMaker = "vt " + String(texture_U.toFixed(4)) + " " + String(texture_V.toFixed(4)) + `\n`;
               objComplete = objComplete + objMaker;
            }
            buffer_textures = buffer_textures + objComplete;
            padding = 0;
            submeshIterator = submeshIterator + (submeshSize * 16);

            // The second (and so on) submesh headers have an extra length of 0x10, so this sums up
            if (submeshIndex > 0) {
               submeshHeaderIterator = submeshHeaderIterator + 48 + 16;
            } else {
               submeshHeaderIterator = submeshHeaderIterator + 48;
            }

            // Acumulates the total to be used for faces generation
            submeshSizeTotal = submeshSizeTotal + submeshSize;
         }
         textureIterator = textureIterator + 16;
      }
      objComplete = buffer_vertices + buffer_textures + buffer_normals;
      return objComplete;
   }

   function convertObjToBin() {
      ipcRenderer.on("BINobj", (e, objpath) => {
         var importedObjContent = fs.readFileSync(objpath, { encoding: 'utf8' }); // OBJ file converted to string
         let sum = 0;
         padding = 0;
         let UVpadding = 0;

         // Regex for getting Vertices XYZ
         let regexFromVert_X = /(v\s[-]?\d{1,}[.]\d{1,})/g;
         let regexFromVert_Y = /(?!v\s[-]?\d{1,}[.]\d{1,})(\d\s[-]?\d{1,}[.]\d{4,})/g;
         let regexFromVert_Z = /(?!v\s[-]?\d{1,}[.]\d{1,})(?!\d\s\d{1,}[.]\d{1,})([-]?\d{1,}[.]\d{4,}[\r\n])/g;

         // Regex for getting Normal X
         let regexFromNormal_X = /(vn\s[-]?\d{1,}[.]\d{1,})/g; // Needs just this one because V changes to VN

         // Regex for getting Texture U
         let regexFromTexture_U = /(vt\s[-]?\d{1,}[.]\d{1,})/g; // Needs just this one because V changes to VT

         // Looks for values that matches with Regex, used for Vertices, Normals and UV
         let arrayFromX = importedObjContent.match(regexFromVert_X);
         let arrayFromY = importedObjContent.match(regexFromVert_Y);
         let arrayFromZ = importedObjContent.match(regexFromVert_Z);
         let arrayFromNormalX = importedObjContent.match(regexFromNormal_X);
         let arrayFromTexture_U = importedObjContent.match(regexFromTexture_U);

         console.log(arrayFromTexture_U[0].substring(3) * 2.55 * 100);
         console.log(arrayFromZ);
         for (let i = 0; i < 24; i++) {

            // Writing vertices values
            buffer.writeInt16LE(arrayFromX[0 + sum].substring(2) * 1.6 * 1000, binFirstSubmeshOffset + binHeaderSize + padding);
            buffer.writeInt16LE(arrayFromY[0 + sum].substring(2) * 1.6 * 1000, binFirstSubmeshOffset + binHeaderSize + 2 + padding);
            buffer.writeInt16LE(arrayFromZ[0 + sum] * 1.6 * 1000, binFirstSubmeshOffset + binHeaderSize + 4 + padding);

            if (i < 12) { // There are only half normals, comparing to vertices
               // Writing Normals values, the two latter can use the same as vertices array, but getting value after vertices end
               buffer.writeInt16LE(arrayFromNormalX[0 + sum].substring(3) * 2.56 * 1000, binFirstSubmeshOffset + binHeaderSize + 8 + padding);
               buffer.writeInt16LE(arrayFromY[24 + sum].substring(3) * 2.56 * 1000, binFirstSubmeshOffset + binHeaderSize + 8 + 2 + padding);
               buffer.writeInt16LE(arrayFromZ[24 + sum] * 2.56 * 1000, binFirstSubmeshOffset + binHeaderSize + 8 + 4 + padding);
            }

            // Writing Texture UV values, the two latter can use the same as vertices array, but getting value after vertices end
            buffer.writeInt16LE(arrayFromTexture_U[0 + sum].substring(3) * 2.55 * 100, binFirstSubmeshOffset + binHeaderSize + 16 + padding);
            buffer.writeInt16LE(arrayFromZ[48 + sum] * 2.55 * 100, binFirstSubmeshOffset + binHeaderSize + 16 + 2 + padding);

            padding = padding + 24;
            sum = sum + 1;
            UVpadding = 2;
         }
      })
   }

   /* =================================
      EXPORT/IMPORT FUNCTIONALITY
     ================================= */

   // Getting elements
   const btnExportEl = document.getElementById("export-bin");
   const btnImportEl = document.getElementById("import-bin");

   // Function for generating faces AMMO BOX ITM
   // function generateFaces() {
   //     let faces_complete = `o  BIN Model` + `\n`;
   //     sum = 0;
   //     for (i = 1; i < (submeshSizeTotal / 4); i++) {
   //         let faces = "f " + (i + sum) + "/" + (i + sum) + "/" + (i + sum) + " " +
   //             " " + (i + 2 + sum) + "/" + (i + 2 + sum) + "/" + (i + 2 + sum) + " " +
   //             (i + 1 + sum) + "/" + (i + 1 + sum) + "/" + (i + 1 + sum) +
   //             `\n` +
   //             "f " + (i + 1 + sum) + "/" + (i + 1 + sum) + "/" + (i + 1 + sum) + " " +
   //             (i + 3 + sum) + "/" + (i + 3 + sum) + "/" + (i + 3 + sum) + " " +
   //             (i + 2 + sum) + "/" + (i + 2 + sum) + "/" + (i + 2 + sum) +
   //             `\n`
   //         faces_complete = faces_complete + faces;
   //         sum = sum + 3;
   //     } return faces_complete;
   // }

   // Function for generating faces SMD
   // function generateFaces() {
   //     let faces_complete = `o  BIN Model` + `\n`;
   //     sum = 0;
   //     for (i = 1; i < (submeshSizeTotal / 4); i++) {
   //         let faces = "f " + (i + sum) + "/" + (i + sum) + "/" + (i + sum) + " " +
   //             " " + (i + 1 + sum) + "/" + (i + 1 + sum) + "/" + (i + 1 + sum) + " " +
   //             (i + 2 + sum) + "/" + (i + 2 + sum) + "/" + (i + 2 + sum) +
   //             `\n` +
   //             "f " + (i + 3 + sum) + "/" + (i + 3 + sum) + "/" + (i + 3 + sum) + " " +
   //             (i + 2 + sum) + "/" + (i + 2 + sum) + "/" + (i + 2 + sum) + " " +
   //             (i + 1 + sum) + "/" + (i + 1 + sum) + "/" + (i + 1 + sum) +
   //             `\n`
   //         faces_complete = faces_complete + faces;
   //         sum = sum + 3;
   //     } return faces_complete;
   // }

   // Function for generating faces SMD
   function generateFaces() {
      let faces_complete = `o  BIN Model` + `\n`;
      // sum = 0;
      // for (i = 1; i < (submeshSizeTotal / 6); i++) {
      //    let faces = "f " + (i + sum) + "/" + (i + sum) + "/" + (i + sum) + " " +
      //       " " + (i + 1 + sum) + "/" + (i + 1 + sum) + "/" + (i + 1 + sum) + " " +
      //       (i + 2 + sum) + "/" + (i + 2 + sum) + "/" + (i + 2 + sum) +
      //       `\n` +
      //       "f " + (i + 3 + sum) + "/" + (i + 3 + sum) + "/" + (i + 3 + sum) + " " +
      //       (i + 4 + sum) + "/" + (i + 4 + sum) + "/" + (i + 4 + sum) + " " +
      //       (i + 5 + sum) + "/" + (i + 5 + sum) + "/" + (i + 5 + sum) +
      //       `\n`
      //    faces_complete = faces_complete + faces;
      // sum = sum + 5;

      // var num_faces = 32;
      for (var t = 1; t < submeshSizeTotal - 2; t++) {

         let faces;
         if (t & 1) {
            faces = "f " + t + " " + (t + 1) + " " + (t + 2) + `\n`;
            faces_complete = faces_complete + faces;
         }
         else {
            faces = "f " + t + " " + (t + 2) + " " + (t + 1) + `\n`;
            faces_complete = faces_complete + faces;
         }
      }

      // for (var t = 3; t < submeshSizeTotal; t++) {

      //    let faces;
      //    if (t % 2 == 0) {
      //       faces = "f " + (t - 2) + " " + (t - 1) + " " + t + `\n`;
      //       faces_complete = faces_complete + faces;
      //    }
      //    else {
      //       faces = "f " + (t - 2) + " " + (t - 2) + " " + t + `\n`;
      //       faces_complete = faces_complete + faces;
      //    }
      // }
      return faces_complete;
   }

   // Function for getting coordinate values
   function exportEvents_vertices(quantity) {
      let objMaker = "";
      let objComplete = `# Resident evil 4 - BIN Tool 2022` +
         `\n` + `\n` + `# By HardRain` + `\n` + `\n`;
      let vert_topLeftX = topLeftXEl.value / 1000;
      let vert_topLeftZ = topLeftZEl.value / 1000;
      let vert_topRightX = topRightXEl.value / 1000;
      let vert_topRightZ = topRightZEl.value / 1000;
      let vert_bottomRightX = bottomRightXEl.value / 1000;
      let vert_bottomRightZ = bottomRightZEl.value / 1000;
      let vert_bottomLeftX = bottomLeftXEl.value / 1000;
      let vert_bottomLeftZ = bottomLeftZEl.value / 1000;
      let vert_lowerLimit = lowerLimitEl.value / 1000;
      let vert_higherLimit = higherLimitEl.value / 1000;

      for (i = 0; i != buffer.readUint8(6); i++) {
         if (quantity == 1) { i = (eventNumber.value - 1) }
         vert_topLeftX = buffer.readFloatLE(36 + (160 * i)) / 1000;
         vert_topLeftZ = buffer.readFloatLE(40 + (160 * i)) / 1000;
         vert_topRightX = buffer.readFloatLE(44 + (160 * i)) / 1000;
         vert_topRightZ = buffer.readFloatLE(48 + (160 * i)) / 1000;
         vert_bottomRightX = buffer.readFloatLE(52 + (160 * i)) / 1000;
         vert_bottomRightZ = buffer.readFloatLE(56 + (160 * i)) / 1000;
         vert_bottomLeftX = buffer.readFloatLE(60 + (160 * i)) / 1000;
         vert_bottomLeftZ = buffer.readFloatLE(64 + (160 * i)) / 1000;
         vert_lowerLimit = buffer.readFloatLE(24 + (160 * i)) / 1000;
         vert_higherLimit = buffer.readFloatLE(28 + (160 * i)) / 1000;

         objMaker = "# Vertices" + ` Event ${Number(i + 1)}` +
            `\n` +
            "v " + String(vert_topLeftX.toFixed(5)) + " "
            + String(vert_lowerLimit.toFixed(5)) + " "
            + String(vert_topLeftZ.toFixed(5)) +
            `\n` +
            "v " + String(vert_topRightX.toFixed(5)) + " "
            + String(vert_lowerLimit.toFixed(5)) + " "
            + String(vert_topRightZ.toFixed(5)) +
            `\n` +
            "v " + String(vert_bottomRightX.toFixed(5)) + " "
            + String(vert_lowerLimit.toFixed(5)) + " "
            + String(vert_bottomRightZ.toFixed(5)) +
            `\n` +
            "v " + String(vert_bottomLeftX.toFixed(5)) + " "
            + String(vert_lowerLimit.toFixed(5)) + " "
            + String(vert_bottomLeftZ.toFixed(5)) +
            `\n` + // --------- BELOW HERE STARTS WITH HIGHER LIMIT -------------
            "v " + String(vert_topLeftX.toFixed(5)) + " "
            + String(vert_higherLimit.toFixed(5)) + " "
            + String(vert_topLeftZ.toFixed(5)) +
            `\n` +
            "v " + String(vert_topRightX.toFixed(5)) + " "
            + String(vert_higherLimit.toFixed(5)) + " "
            + String(vert_topRightZ.toFixed(5)) +
            `\n` +
            "v " + String(vert_bottomRightX.toFixed(5)) + " "
            + String(vert_higherLimit.toFixed(5)) + " "
            + String(vert_bottomRightZ.toFixed(5)) +
            `\n` +
            "v " + String(vert_bottomLeftX.toFixed(5)) + " "
            + String(vert_higherLimit.toFixed(5)) + " "
            + String(vert_bottomLeftZ.toFixed(5)) + `\n`
         objComplete = objComplete + objMaker;
         if (quantity == 1) break;
      }
      return objComplete
   }

   function importEvents_vertices(quantity) {
      ipcRenderer.on("AEVobj", (e, objpath) => {
         var importedObjContent = fs.readFileSync(objpath, { encoding: 'utf8' });
         let sum = 0;
         let regexFromX = /(v\s[-]?\d{1,}[.]\d{1,})/g;
         let regexFromHeight = /(?!v\s[-]?\d{1,}[.]\d{1,})(\d\s[-]?\d{1,}[.]\d{5,})/g;
         let regexFromZ = /(?!v\s[-]?\d{1,}[.]\d{1,})(?!\d\s\d{1,}[.]\d{1,})([-]?\d{1,}[.]\d{5,}[\r\n])/g;

         let arrayFromX = importedObjContent.match(regexFromX);
         let arrayFromHeight = importedObjContent.match(regexFromHeight);
         let arrayFromZ = importedObjContent.match(regexFromZ);

         for (let i = 0; i != buffer.readUint8(6); i++) {
            if (quantity == 1) { i = (eventNumber.value - 1) }
            // X values
            buffer.writeFloatLE(Number(arrayFromX[0 + sum].substring(2)) * 1000, 36 + (160 * i));
            buffer.writeFloatLE(Number(arrayFromX[1 + sum].substring(2)) * 1000, 44 + (160 * i));
            buffer.writeFloatLE(Number(arrayFromX[2 + sum].substring(2)) * 1000, 52 + (160 * i));
            buffer.writeFloatLE(Number(arrayFromX[3 + sum].substring(2)) * 1000, 60 + (160 * i));
            // Z values
            buffer.writeFloatLE(Number(arrayFromZ[0 + sum].substring(0, arrayFromZ[0].length - 2)) * 1000, 40 + (160 * i));
            buffer.writeFloatLE(Number(arrayFromZ[1 + sum].substring(0, arrayFromZ[1].length - 2)) * 1000, 48 + (160 * i));
            buffer.writeFloatLE(Number(arrayFromZ[2 + sum].substring(0, arrayFromZ[2].length - 2)) * 1000, 56 + (160 * i));
            buffer.writeFloatLE(Number(arrayFromZ[3 + sum].substring(0, arrayFromZ[3].length - 2)) * 1000, 64 + (160 * i));
            // Lower and Higher Limits
            buffer.writeFloatLE(Number(arrayFromHeight[0 + sum].substring(2)) * 1000, 24 + (160 * i));
            buffer.writeFloatLE(Number(arrayFromHeight[4 + sum].substring(2)) * 1000, 28 + (160 * i));
            // Outputing values to screen
            lowerLimitEl.value = buffer.readFloatLE(24 + (160 * (eventNumber.value - 1))).toFixed(2);
            higherLimitEl.value = buffer.readFloatLE(28 + (160 * (eventNumber.value - 1))).toFixed(2);
            topLeftXEl.value = buffer.readFloatLE(36 + (160 * (eventNumber.value - 1))).toFixed(2);
            topRightXEl.value = buffer.readFloatLE(44 + (160 * (eventNumber.value - 1))).toFixed(2);
            bottomLeftXEl.value = buffer.readFloatLE(52 + (160 * (eventNumber.value - 1))).toFixed(2);
            bottomRightXEl.value = buffer.readFloatLE(60 + (160 * (eventNumber.value - 1))).toFixed(2);
            topLeftZEl.value = buffer.readFloatLE(40 + (160 * (eventNumber.value - 1))).toFixed(2);
            topRightZEl.value = buffer.readFloatLE(48 + (160 * (eventNumber.value - 1))).toFixed(2);
            bottomLeftZEl.value = buffer.readFloatLE(56 + (160 * (eventNumber.value - 1))).toFixed(2);
            bottomRightZEl.value = buffer.readFloatLE(64 + (160 * (eventNumber.value - 1))).toFixed(2);
            if (quantity == 1) { break }
            sum = sum + 8;
         } if (quantity == 1) {
            showTextBox("Event imported successfully!", "imported");
         } else
            showTextBox("All events imported successfully!", "imported");

      })
   }

   // Event listener
   var folderName = headerFileName.value.substring(0, headerFileName.value.length - 4);
   btnExportEl.addEventListener("click", function exportOneEvent() {
      showTextBox("BIN model exported to obj!", "exported");
      fs.mkdirSync(`Bins/${folderName}`, { recursive: true });
      fs.writeFileSync(`Bins/${folderName}/${folderName}.obj`, covertBinToObj() + generateFaces());
   });

   btnImportEl.addEventListener("click", function importOneEvent() {
      ipcRenderer.send("BINimportBtn");
      convertObjToBin();
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
      ipcRenderer.send("closeMDTfile");
   })

   ipcRenderer.on("saveAsMDTfileContent", (e, arg) => {
      fs.writeFileSync(arg, buffer);
   })
})
