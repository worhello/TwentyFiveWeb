"use strict";

function getCardDisplayDelay() {
    if (document.getElementById("slow").checked) {
        return 600;
    } else if (document.getElementById("medium").checked) {
        return 400;
    } else if (document.getElementById("fast").checked) {
        return 200;
    }

    return 400;
}

function onStartButtonClicked() {
    let numPlayersSelect = document.getElementById("numPlayersSelect");
    let numPlayers = numPlayersSelect.options[numPlayersSelect.selectedIndex].value;

    let isSinglePlayer = document.getElementById("singlePlayer").checked;

    let cardDisplayDelay = getCardDisplayDelay();

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

function preloadCards() {
    let cards = buildDeck();
    for (let card of cards) {
        var _img = new Image();
        _img.src = card.url;
    }
}

window.onload = function() {
    this.document.getElementById("startGameButton").addEventListener("click", function() {
        onStartButtonClicked();
    });
    showStartGameOverlay();
    preloadCards();
}