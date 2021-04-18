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

async function startGame(numPlayers, isSinglePlayer, cardDisplayDelay, tutorialManager) {

    window.eventsHandler = new EventsHandler();

    if (isSinglePlayer) {
        window.gameContext = new SinglePlayerGameContext(window.eventsHandler, numPlayers, cardDisplayDelay, tutorialManager, window.localisationManager);
    } else {
        window.gameContext = new MultiPlayerGameContext(window.eventsHandler, numPlayers, window.localisationManager);
    }

    window.gameViewController = new ViewController(window.eventsHandler, window.localisationManager);

    await window.gameContext.startGame();

    if (isSinglePlayer) {
        window.gameViewController.hideStartGameOverlay();
    }
}

function onStartButtonClicked() {
    let numPlayersSelect = document.getElementById("numPlayersSelect");
    let numPlayers = numPlayersSelect.options[numPlayersSelect.selectedIndex].value;

    let isSinglePlayer = document.getElementById("singlePlayer").checked;

    let cardDisplayDelay = getCardDisplayDelay();
    
    startGame(numPlayers, isSinglePlayer, cardDisplayDelay, null);
}

function onTutorialButtonClicked() {
    let userIsOk = window.confirm(window.localisationManager.getLocalisedString("tutorialConfirmationMessage"));
    if (userIsOk === false) {
        return;
    }

    let numPlayers = 2;
    let isSinglePlayer = true;
    let cardDisplayDelay = getCardDisplayDelay();
    let tutorialManager = new window.tutorialManager.TutorialManager(window.localisationManager);
    startGame(numPlayers, isSinglePlayer, cardDisplayDelay, tutorialManager);
}

function preloadCards() {
    let cards = buildDeck();
    for (let card of cards) {
        var _img = new Image();
        _img.src = card.url;
    }
}

function initLocalisation() {
    let locale = "en/UK"; // TODO - see GH #115
    let localisedStrings = window.localisedStrings.getLocalisedStrings();
    window.localisationManager = new window.localisedStringManager.LocalisedStringManager(locale, localisedStrings);

    document.getElementById("2PlayersOption").textContent  = window.localisationManager.getLocalisedString("2PlayersOption");
    document.getElementById("3PlayersOption").textContent  = window.localisationManager.getLocalisedString("3PlayersOption");
    document.getElementById("4PlayersOption").textContent  = window.localisationManager.getLocalisedString("4PlayersOption");
    document.getElementById("5PlayersOption").textContent  = window.localisationManager.getLocalisedString("5PlayersOption");
    document.getElementById("6PlayersOption").textContent  = window.localisationManager.getLocalisedString("6PlayersOption");
    document.getElementById("7PlayersOption").textContent  = window.localisationManager.getLocalisedString("7PlayersOption");
    document.getElementById("8PlayersOption").textContent  = window.localisationManager.getLocalisedString("8PlayersOption");
    document.getElementById("9PlayersOption").textContent  = window.localisationManager.getLocalisedString("9PlayersOption");
    document.getElementById("10PlayersOption").textContent = window.localisationManager.getLocalisedString("10PlayersOption");

    document.getElementById("singlePlayerLabel").textContent = window.localisationManager.getLocalisedString("singlePlayer");
    document.getElementById("multiPlayerLabel").textContent  = window.localisationManager.getLocalisedString("multiPlayerComingSoon");
    //document.getElementById("multiPlayerLabel").textContent  = window.localisationManager.getLocalisedString("multiPlayer");
    document.getElementById("slowSpeedLabel").textContent    = window.localisationManager.getLocalisedString("slowSpeedLabel");
    document.getElementById("mediumSpeedLabel").textContent  = window.localisationManager.getLocalisedString("mediumSpeedLabel");
    document.getElementById("fastSpeedLabel").textContent    = window.localisationManager.getLocalisedString("fastSpeedLabel");
    
    document.getElementById("startGameButton").textContent     = window.localisationManager.getLocalisedString("startGameButton");
    document.getElementById("startTutorialButton").textContent = window.localisationManager.getLocalisedString("startTutorialButton");

    document.getElementById("gameRulesLabel").textContent    = window.localisationManager.getLocalisedString("gameRulesLabel");

    document.getElementById("currentCardIndicator").textContent        = window.localisationManager.getLocalisedString("currentCardIndicator");
    document.getElementById("currentWinningCardIndicator").textContent = window.localisationManager.getLocalisedString("currentWinningCardIndicator");
}

window.onload = function() {
    this.document.getElementById("startGameButton").addEventListener("click", function() {
        onStartButtonClicked();
    });
    this.document.getElementById("startTutorialButton").addEventListener("click", function() {
        onTutorialButtonClicked();
    });

    // only needed for debugging purposes, can enable locally
    this.document.getElementById("gameSpeedSelector").hidden = true;

    // not fully finished out - can be enabled locally
    this.document.getElementById("multiPlayer").disabled = true;

    initLocalisation();
    showStartGameOverlay();
    preloadCards();
}