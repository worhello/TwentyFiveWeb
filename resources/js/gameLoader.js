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

function startGame(numPlayers, isSinglePlayer, cardDisplayDelay, isTutorialMode) {

    window.eventsHandler = new EventsHandler();

    if (isSinglePlayer) {
        window.gameContext = new SinglePlayerGameContext(window.eventsHandler, numPlayers, cardDisplayDelay, isTutorialMode);
    } else {
        // Long term TODO
        //window.gameContext = new SinglePlayerGameContext(window.eventsHandler, numPlayers, cardDisplayDelay);
        window.alert("Multiplayer not yet supported!");
        return;
    }

    window.gameViewController = new ViewController(window.eventsHandler);

    window.gameContext.startGame();

    window.gameViewController.hideStartGameOverlay();
}

function onStartButtonClicked() {
    let numPlayersSelect = document.getElementById("numPlayersSelect");
    let numPlayers = numPlayersSelect.options[numPlayersSelect.selectedIndex].value;

    let isSinglePlayer = document.getElementById("singlePlayer").checked;

    let cardDisplayDelay = getCardDisplayDelay();
    
    startGame(numPlayers, isSinglePlayer, cardDisplayDelay, false);
}

function onTutorialButtonClicked() {
    let numPlayers = 2;
    let isSinglePlayer = true;
    let cardDisplayDelay = getCardDisplayDelay();
    startGame(numPlayers, isSinglePlayer, cardDisplayDelay, true);
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
    this.document.getElementById("startTutorialButton").addEventListener("click", function() {
        onTutorialButtonClicked();
    });

    showStartGameOverlay();
    preloadCards();
}