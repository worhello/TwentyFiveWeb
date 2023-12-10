"use strict";

async function startGame(numPlayers, isSinglePlayer, isTutorial, gameId, gameRules) {

    window.eventsHandler = new EventsHandler();

    if (isTutorial) {
        window.gameContext = new TutorialGameContext(window.eventsHandler, numPlayers, window.localisationManager, gameRules);
    } else if (isSinglePlayer) {
        window.gameContext = new StateMachineGameContext(window.eventsHandler, numPlayers, window.localisationManager, gameRules);
    } else {
        window.gameContext = new MultiPlayerGameContext(window.eventsHandler, numPlayers, gameRules);
    }

    window.gameViewController = new ViewController(window.eventsHandler, window.localisationManager);

    if (isSinglePlayer && !isTutorial) {
        window.gameViewController.hideStartGameOverlay();
    }
    else {
        document.getElementById("singlePlayerGameButton").disabled = true;
        document.getElementById("multiPlayerGameButton").disabled = true;
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

function getGameRules() {
    let winningScoreSelect = document.getElementById("winningScoreSelect");
    let renegingAllowed = document.getElementById("renegingAllowedCheckbox").checked;
    let dealerBonusIfTrumpIsAce = document.getElementById("dealerAceTrumpsBonusCheckbox").checked;
    let rules = {
        "winningScore": winningScoreSelect.options[winningScoreSelect.selectedIndex].value,
        "renegingAllowed": renegingAllowed,
        "useTeams": null,
        "customRules": {
            "dealerBonusIfTrumpIsAce": dealerBonusIfTrumpIsAce
        }
    };

    let raw = numPlayersSelect.options[numPlayersSelect.selectedIndex].value;
    let values = raw.split("_", 2);
    if (values.length == 2) {
        rules.useTeams = {
            "numTeams": parseInt(values[0]),
            "teamSize": parseInt(values[1])
        };
    }

    return rules;
}

function buildTutorialRules() {
    return {
        "winningScore": 25,
        "renegingAllowed": true,
        "useTeams": null,
        "customRules": null
    };
}

function joinMultiPlayerGame(gameId) {
    startGame(0, false, false, gameId, getGameRules());
}

function createGame(isSinglePlayer, gameId) {
    let numPlayersSelect = document.getElementById("numPlayersSelect");

    var numPlayers = 0;
    let gameRules = getGameRules();
    if (gameRules.useTeams) {
        numPlayers = gameRules.useTeams.numTeams * gameRules.useTeams.teamSize;
    } else {
        numPlayers = numPlayersSelect.options[numPlayersSelect.selectedIndex].value;
    }

    startGame(numPlayers, isSinglePlayer, false, gameId, gameRules);
}

function onTutorialButtonClicked() {
    let userIsOk = window.confirm(window.localisationManager.getLocalisedString("tutorialConfirmationMessage"));
    if (userIsOk === false) {
        return;
    }

    let numPlayers = 2;
    let isSinglePlayer = true;
    let gameRules = buildTutorialRules();
    startGame(numPlayers, isSinglePlayer, true, null, gameRules);
}

function preloadCards() {
    let deck = new Deck();
    let cards = deck.cards;
    for (let card of cards) {
        var _img = new Image();
        _img.src = getCardUrl(card);
    }
}

function detectLocale() {
    if (/^en\b/.test(navigator.language)) {
        return "en";
    }
    else if (/^fr\b/.test(navigator.language)) {
        console.log("French is not currently supported!");
        //return "fr";
    }
    else if (/^de\b/.test(navigator.language)) {
        console.log("German is not currently supported!");
        //return "de";
    }

    return "en";
}

function initLocalisation() {
    let locale = detectLocale();
    let localisedStrings = window.localisedStrings.getLocalisedStrings();
    window.localisationManager = new window.localisedStringManager.LocalisedStringManager(locale, localisedStrings);

    let localizableElementIds = [
        "singlePlayerGameButton",
        "multiPlayerGameButton",
        "numPlayersSelectLabel",
        "winningScoreSelectLabel",
        "renegingAllowedLabel",
        "dealerAceTrumpsBonusLabel",
        "houseRulesContainerHeaderLabel",
        "startTutorialButton",
        "connectingLabel",
        "gameRulesLabel",
        "gameProjectLinkLabel",
        "mainMenuTitleHeader",
        "currentCardIndicator",
        "currentWinningCardIndicator"
    ];

    for (let localizableElementId of localizableElementIds) {
        document.getElementById(localizableElementId).textContent = window.localisationManager.getLocalisedString(localizableElementId);
    }

}

function getGameIdParam() {
    let url = window.location.search;
    let params = new URLSearchParams(url);
    return params.get('gameId');
}

window.onload = function() {
    preloadCards();

    this.document.getElementById("singlePlayerGameButton").addEventListener("click", function() {
        createGame(true, null);
    });
    this.document.getElementById("multiPlayerGameButton").addEventListener("click", function() {
        createGame(false, null);
    });
    this.document.getElementById("startTutorialButton").addEventListener("click", function() {
        onTutorialButtonClicked();
    });

    createDefaultHouseRules();

    initLocalisation();
    populateLocalisedOptions();

    populateNumberOfPlayersOptions();
    populateWinningScoreOptions();

    let gameId = getGameIdParam();
    if (gameId) {
        joinMultiPlayerGame(gameId);
    } else {
        showStartGameOverlay();
    }

}