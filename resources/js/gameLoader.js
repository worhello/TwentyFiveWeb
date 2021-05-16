"use strict";

async function startGame(numPlayers, isSinglePlayer, isTutorial, gameId) {

    window.eventsHandler = new EventsHandler();

    if (isTutorial) {
        window.gameContext = new TutorialGameContext(window.eventsHandler, numPlayers, window.localisationManager);
    } else if (isSinglePlayer) {
        window.gameContext = new SinglePlayerGameContext(window.eventsHandler, numPlayers, window.localisationManager);
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

    startGame(numPlayers, isSinglePlayer,  false, gameId);
}

function onTutorialButtonClicked() {
    let userIsOk = window.confirm(window.localisationManager.getLocalisedString("tutorialConfirmationMessage"));
    if (userIsOk === false) {
        return;
    }

    let numPlayers = 2;
    let isSinglePlayer = true;
    startGame(numPlayers, isSinglePlayer, true, null);
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

    document.getElementById("2PlayersOption").textContent  = window.localisationManager.getLocalisedString("nPlayersOption", [2]);
    document.getElementById("3PlayersOption").textContent  = window.localisationManager.getLocalisedString("nPlayersOption", [3]);
    document.getElementById("4PlayersOption").textContent  = window.localisationManager.getLocalisedString("nPlayersOption", [4]);
    document.getElementById("5PlayersOption").textContent  = window.localisationManager.getLocalisedString("nPlayersOption", [5]);
    document.getElementById("6PlayersOption").textContent  = window.localisationManager.getLocalisedString("nPlayersOption", [6]);
    document.getElementById("7PlayersOption").textContent  = window.localisationManager.getLocalisedString("nPlayersOption", [7]);
    document.getElementById("8PlayersOption").textContent  = window.localisationManager.getLocalisedString("nPlayersOption", [8]);
    document.getElementById("9PlayersOption").textContent  = window.localisationManager.getLocalisedString("nPlayersOption", [9]);
    document.getElementById("10PlayersOption").textContent = window.localisationManager.getLocalisedString("nPlayersOption", [10]);

    document.getElementById("singlePlayerLabel").textContent = window.localisationManager.getLocalisedString("singlePlayer");
    document.getElementById("multiPlayerLabel").textContent  = window.localisationManager.getLocalisedString("multiPlayer");

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

    initLocalisation();
    showStartGameOverlay();
    preloadCards();

    let gameId = getGameIdParam();
    if (gameId != null) {
        createGame(false, gameId);
    }
}