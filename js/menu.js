const fs = require('fs');
const { ipcRenderer } = require('electron');

const DAT = document.getElementById("dat-card");
const TM3 = document.getElementById("tm3-card");

// Window menu buttons
const minimizeBtn = document.getElementById("minimize");
const maximizeBtn = document.getElementById("maximize");
const closeWindowBtn = document.getElementById("closeWindow");
const logo = document.getElementById("logo");

// Eventos
DAT.addEventListener("click", function () {
    ipcRenderer.send("openDATtool")
})

TM3.addEventListener("click", function () {
    ipcRenderer.send("openTM3tool")
})

// Window menu actions
minimizeBtn.addEventListener("click", () => {
    ipcRenderer.send("minimize")
})

maximizeBtn.addEventListener("click", () => {
    ipcRenderer.send("maximize")
})

closeWindowBtn.addEventListener("click", () => {
    ipcRenderer.send("closeWindow")
})

logo.addEventListener("click", function () {
    require('electron').shell.openExternal("https://www.youtube.com/@hardrainmodder");
})
