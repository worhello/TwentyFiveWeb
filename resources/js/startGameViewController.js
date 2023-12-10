"use strict";

var validWinningScoreOptions = [];
var validTeamOptions = [];
var validNoTeamOptions = [];

function populateLocalisedOptions() {
    validWinningScoreOptions = [
        { "id": "25", "string": "25" },
        { "id": "30", "string": "30" },
        { "id": "45", "string": "45" },
    ];

    validTeamOptions = [
        { "id": "2_2", "string": window.localisationManager.getLocalisedString("n_n_teamConfig", [2, 2]) },
        { "id": "2_3", "string": window.localisationManager.getLocalisedString("n_n_teamConfig", [2, 3]) },
        { "id": "2_4", "string": window.localisationManager.getLocalisedString("n_n_teamConfig", [2, 4]) },
        { "id": "3_2", "string": window.localisationManager.getLocalisedString("n_n_teamConfig", [3, 2]) },
        { "id": "3_3", "string": window.localisationManager.getLocalisedString("n_n_teamConfig", [3, 3]) },
    ];

    validNoTeamOptions = [
        { "id": "2",  "string": window.localisationManager.getLocalisedString("nPlayersOption", [2]) },
        { "id": "3",  "string": window.localisationManager.getLocalisedString("nPlayersOption", [3]) },
        { "id": "4",  "string": window.localisationManager.getLocalisedString("nPlayersOption", [4]) },
        { "id": "5",  "string": window.localisationManager.getLocalisedString("nPlayersOption", [5]) },
        { "id": "6",  "string": window.localisationManager.getLocalisedString("nPlayersOption", [6]) },
        { "id": "7",  "string": window.localisationManager.getLocalisedString("nPlayersOption", [7]) },
        { "id": "8",  "string": window.localisationManager.getLocalisedString("nPlayersOption", [8]) },
        { "id": "9",  "string": window.localisationManager.getLocalisedString("nPlayersOption", [9]) },
        { "id": "10", "string": window.localisationManager.getLocalisedString("nPlayersOption", [10]) },
    ];
}

function populateWinningScoreOptions() {
    clearChildrenOfElementById("winningScoreSelect");
    populateOptions("winningScoreSelect", validWinningScoreOptions);
}

function onUseTeamsChanged(isChecked) {
    clearChildrenOfElementById("numPlayersSelect");
    if (isChecked) {
        populateOptions("numPlayersSelect", validTeamOptions);
    } else {
        populateOptions("numPlayersSelect", validNoTeamOptions);
    }
}

function populateOptions(elementId, options) {
    for (let option of options) {
        let selectOptionElem = document.createElement("option");
        selectOptionElem.id = option.id;
        selectOptionElem.value = option.id;
        selectOptionElem.textContent = option.string;
        document.getElementById(elementId).appendChild(selectOptionElem);
    }
}