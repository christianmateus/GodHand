const fs = require('fs');
const { ipcRenderer } = require('electron');

const ETS = document.getElementById("ets-card");
const ITA = document.getElementById("ita-card");
const AEV = document.getElementById("aev-card");
const MDT = document.getElementById("mdt-card");
const BIN = document.getElementById("bin-card");
const SMD = document.getElementById("smd-card");
const SND = document.getElementById("snd-card");
const ETM = document.getElementById("etm-card");
const ITM = document.getElementById("itm-card");
const SPECIALS = document.getElementById("specials-card");

// Window menu buttons
const minimizeBtn = document.getElementById("minimize");
const maximizeBtn = document.getElementById("maximize");
const closeWindowBtn = document.getElementById("closeWindow");
const logo = document.getElementById("logo");

// Eventos
ETS.addEventListener("click", function () {
    ipcRenderer.send("openETStool")
})

ITA.addEventListener("click", function () {
    ipcRenderer.send("openITAtool")
})

AEV.addEventListener("click", function () {
    ipcRenderer.send("openAEVtool")
})

// MDT.addEventListener("click", function () {
//     ipcRenderer.send("openMDTtool")
// })

// BIN.addEventListener("click", function () {
//     ipcRenderer.send("openBINtool")
// })

SMD.addEventListener("click", function () {
    ipcRenderer.send("openSMDtool")
})

SND.addEventListener("click", function () {
    ipcRenderer.send("openSNDtool")
})

ETM.addEventListener("click", function () {
    ipcRenderer.send("openETMtool")
})

ITM.addEventListener("click", function () {
    ipcRenderer.send("openITMtool")
})

SPECIALS.addEventListener("click", function () {
    ipcRenderer.send("openSPECIALStool")
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
