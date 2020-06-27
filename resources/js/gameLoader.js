"use strict";

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

    window.gameViewController.hideStartGameOverlay();
}

window.onload = function() {
    this.document.getElementById("startGameButton").addEventListener("click", function() {
        onStartButtonClicked();
    });
    showStartGameOverlay();
}