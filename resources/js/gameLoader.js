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

async function startGame(numPlayers, isSinglePlayer, cardDisplayDelay, isTutorial, gameId) {

    window.eventsHandler = new EventsHandler();

    if (isTutorial) {
        window.gameContext = new TutorialGameContext(window.eventsHandler, numPlayers, cardDisplayDelay, window.localisationManager);
    } else if (isSinglePlayer) {
        window.gameContext = new SinglePlayerGameContext(window.eventsHandler, numPlayers, cardDisplayDelay, window.localisationManager);
    } else {
        window.gameContext = new MultiPlayerGameContext(window.eventsHandler, numPlayers);
    }

    window.gameViewController = new ViewController(window.eventsHandler, window.localisationManager);

    if (isSinglePlayer && !isTutorial) {
        window.gameViewController.hideStartGameOverlay();
    }
    else {
        document.getElementById("startGameButton").disabled = true;
        document.getElementById("connectingLabel").hidden = false;
    }

    if (!isSinglePlayer && gameId != null) {
        await window.gameContext.joinGame(gameId);
    }
    else {
        await window.gameContext.startGame();
    }
}

function onStartButtonClicked() {
    let isSinglePlayer = document.getElementById("singlePlayer").checked;
    createGame(isSinglePlayer, null);
}

function createGame(isSinglePlayer, gameId) {
    let numPlayersSelect = document.getElementById("numPlayersSelect");
    let numPlayers = numPlayersSelect.options[numPlayersSelect.selectedIndex].value;

    let cardDisplayDelay = getCardDisplayDelay();
    
    startGame(numPlayers, isSinglePlayer, cardDisplayDelay, false, gameId);
}

function onTutorialButtonClicked() {
    let userIsOk = window.confirm(window.localisationManager.getLocalisedString("tutorialConfirmationMessage"));
    if (userIsOk === false) {
        return;
    }

    let numPlayers = 2;
    let isSinglePlayer = true;
    let cardDisplayDelay = getCardDisplayDelay();
    startGame(numPlayers, isSinglePlayer, cardDisplayDelay, true, null);
}

function preloadCards() {
    let deck = new Deck();
    let cards = deck.cards;
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
    document.getElementById("multiPlayerLabel").textContent  = window.localisationManager.getLocalisedString("multiPlayer");
    document.getElementById("slowSpeedLabel").textContent    = window.localisationManager.getLocalisedString("slowSpeedLabel");
    document.getElementById("mediumSpeedLabel").textContent  = window.localisationManager.getLocalisedString("mediumSpeedLabel");
    document.getElementById("fastSpeedLabel").textContent    = window.localisationManager.getLocalisedString("fastSpeedLabel");
    
    document.getElementById("startGameButton").textContent     = window.localisationManager.getLocalisedString("startGameButton");
    document.getElementById("startTutorialButton").textContent = window.localisationManager.getLocalisedString("startTutorialButton");
    document.getElementById("connectingLabel").textContent     = window.localisationManager.getLocalisedString("connectingLabel");

    document.getElementById("gameRulesLabel").textContent = window.localisationManager.getLocalisedString("gameRulesLabel");

    document.getElementById("currentCardIndicator").textContent        = window.localisationManager.getLocalisedString("currentCardIndicator");
    document.getElementById("currentWinningCardIndicator").textContent = window.localisationManager.getLocalisedString("currentWinningCardIndicator");

}

function getGameIdParam() {
    let url = window.location.search;
    let params = new URLSearchParams(url);
    return params.get('gameId');
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

    initLocalisation();
    showStartGameOverlay();
    preloadCards();

    let gameId = getGameIdParam();
    if (gameId != null) {
        createGame(false, gameId);
    }
}