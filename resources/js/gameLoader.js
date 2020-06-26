"use strict";

function showStartGameOverlay() {
    document.getElementById("menuContainer").style.display = "block";
}
function hideStartGameOverlay() {
    document.getElementById("menuContainer").style.display = "none";
}

function onStartButtonClicked() {
    let numPlayersSelect = document.getElementById("numPlayersSelect");
    let numPlayers = numPlayersSelect.options[numPlayersSelect.selectedIndex].value;

    let isSinglePlayer = document.getElementById("singlePlayer").checked;

    let cardDisplayDelay = 500;

    window.eventsHandler = new EventsHandler();

    if (isSinglePlayer) {
        window.gameContext = new SinglePlayerGameContext(window.eventsHandler, numPlayers, cardDisplayDelay);
    } else {
        window.gameContext = new SinglePlayerGameContext(window.eventsHandler, numPlayers, cardDisplayDelay); // TODO change
    }

    window.gameViewController = new ViewController(window.eventsHandler);


    window.gameContext.startGame();

    hideStartGameOverlay();
}

window.onload = function() {
    this.document.getElementById("startGameButton").addEventListener("click", function() {
        onStartButtonClicked();
    });
    showStartGameOverlay();
}