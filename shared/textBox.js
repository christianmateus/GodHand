exports.module = function showTextBox(message, boxColor) {
    var removedMessage = document.querySelector(".infoBox");
    removedMessage.style.display = "block"
    removedMessage.style.backgroundColor = boxColor;
    if (boxColor == "gray") {
        document.getElementById("infoBox").firstElementChild.style.backgroundColor = "#333"
        document.getElementById("infoBox").firstElementChild.style.border = "2px solid #ddd"
        document.getElementById("infoBox").firstElementChild.style.width = "35%"
        document.getElementById("infoBox").firstElementChild.innerHTML = '<i class="fa-solid fa-file-export"></i>&nbsp&nbsp' + message;
    }
    if (boxColor == "green") {
        document.getElementById("infoBox").firstElementChild.style.backgroundColor = "#353"
        document.getElementById("infoBox").firstElementChild.style.border = "2px solid #7f7"
        document.getElementById("infoBox").firstElementChild.style.color = "2px solid #7f7"
        document.getElementById("infoBox").firstElementChild.style.width = "35%"
        document.getElementById("infoBox").firstElementChild.innerHTML = '<i class="fa-solid fa-file-import"></i>&nbsp&nbsp' + message;
    }
    if (boxColor == "red") {
        document.getElementById("infoBox").firstElementChild.style.backgroundColor = "#533"
        document.getElementById("infoBox").firstElementChild.style.border = "2px solid #f77"
        document.getElementById("infoBox").firstElementChild.style.color = "2px solid #eee"
        document.getElementById("infoBox").firstElementChild.style.width = "35%"
        document.getElementById("infoBox").firstElementChild.innerHTML = '<i class="fa-solid fa-file-import"></i>&nbsp&nbsp' + message;
    }
    if (boxColor == "blue") {
        document.getElementById("infoBox").firstElementChild.style.backgroundColor = "#335"
        document.getElementById("infoBox").firstElementChild.style.border = "2px solid #77f"
        document.getElementById("infoBox").firstElementChild.style.color = "2px solid #eee"
        document.getElementById("infoBox").firstElementChild.style.width = "35%"
        document.getElementById("infoBox").firstElementChild.innerHTML = '<i class="fa-solid fa-circle-check"></i>&nbsp&nbsp' + message;
    }
    setTimeout(() => {
        removedMessage.style.display = "none";
    }, 3000);
}