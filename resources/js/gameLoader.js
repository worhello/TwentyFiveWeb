"use strict";

function showStartGameOverlay() {
    document.getElementById("menuContainer").style.display = "block";
}
function hideStartGameOverlay() {
    document.getElementById("menuContainer").style.display = "none";
}

function event_showStartGameOverlay() {
    showStartGameOverlay();
}

function event_hideStartGameOverlay() {
    hideStartGameOverlay();
}

function onStartButtonClicked() {
    let numPlayersSelect = document.getElementById("numPlayersSelect");
    let numPlayers = numPlayersSelect.options[numPlayersSelect.selectedIndex].value;

    let isSinglePlayer = document.getElementById("singlePlayer").checked;

    let cardDisplayDelay = 500;

    if (isSinglePlayer) {
        window.gameContext = new SinglePlayerGameContext(numPlayers, cardDisplayDelay);
    } else {
        window.gameContext = new SinglePlayerGameContext(numPlayers, cardDisplayDelay); // TODO change
    }

    window.gameViewController = new ViewController();

    window.gameContext.startGame();

    hideStartGameOverlay();
}

window.onload = function(event) {
    this.document.getElementById("startGameButton").addEventListener("click", function(ev) {
        onStartButtonClicked();
    });
    showStartGameOverlay();
}