

function getLocalisedStrings() {
    // TODO aggregate strings from everywhere in the code to here
    return {
        "2PlayersOption": {
            "translator note" : "play a game with 2 players",
            "en/UK": "2 players"
        },
        "3PlayersOption": {
            "translator note" : "play a game with 3 players",
            "en/UK": "3 players"
        },
        "4PlayersOption": {
            "translator note" : "play a game with 4 players",
            "en/UK": "4 players"
        },
        "5PlayersOption": {
            "translator note" : "play a game with 5 players",
            "en/UK": "5 players"
        },
        "6PlayersOption": {
            "translator note" : "play a game with 6 players",
            "en/UK": "6 players"
        },
        "7PlayersOption": {
            "translator note" : "play a game with 7 players",
            "en/UK": "7 players"
        },
        "8PlayersOption": {
            "translator note" : "play a game with 8 players",
            "en/UK": "8 players"
        },
        "9PlayersOption": {
            "translator note" : "play a game with 9 players",
            "en/UK": "9 players"
        },
        "10PlayersOption": {
            "translator note" : "play a game with 10 players",
            "en/UK": "10 players"
        },
        "singlePlayer":{
            "translator note": "text for the label beside the radio button option for a single player game",
            "en/UK": "Single Player"
        },
        "multiPlayerComingSoon":{
            "translator note": "text for the label beside the radio button option for a multiplayer game",
            "en/UK": "Multiplayer (Coming soon)"
        },
        "slowSpeedLabel":{
            "translator note": "text for the label beside the radio button option for a slower paced game (transitions every 600ms)",
            "en/UK": "Slow"
        },
        "mediumSpeedLabel":{
            "translator note": "text for the label beside the radio button option for a medium paced game (transitions every 400ms)",
            "en/UK": "Medium"
        },
        "fastSpeedLabel":{
            "translator note": "text for the label beside the radio button option for a faster paced game (transitions every 200ms)",
            "en/UK": "Fast"
        },
        "startGameButton": {
            "translator note": "text for button to start the game",
            "en/UK": "Start Game"
        },
        "startTutorialButton": {
            "translator note": "text for button to start the tutorial",
            "en/UK": "Tutorial"
        },
        "gameRulesLabel": {
            "translator note": "text for link to game rules",
            "en/UK": "Game Rules"
        },
        "currentCardIndicator": {
            "translator note": "text for legend for current card indicator",
            "en/UK": "Current Card"
        },
        "currentWinningCardIndicator": {
            "translator note": "text for legend for current winning card indicator",
            "en/UK": "Current Winning Card"
        },
        "tutorialConfirmationMessage": {
            "translator note": "text for the dialog to confirm that you want to play the tutorial",
            "en/UK": "Running a game in Tutorial mode results in having predefined card choices, to highlight the different card interactions and comparisons. You will generally have far more card choices available in a real game.\n\nClick OK to continue"
        },
        "trumpCardTitle": {
            "translator note": "text above the trump card in the middle of the playable area",
            "en/UK": "Trump Card"
        },
        "dealerTitle": {
            "translator note": "text above the player who is the current dealer",
            "en/UK": "Dealer"
        },
        "skipRobbingButtonText": {
            "translator note": "button text for skipping your chance to rob the trump card",
            "en/UK": "Skip"
        },
        "startNewGameButtonText": {
            "translator note": "button text for starting a new game after completing a game",
            "en/UK": "Start New Game"
        },
        "startNextRoundButtonText": {
            "translator note": "button text for starting the next round in an ongoing game",
            "en/UK": "Start Next Round"
        },
        "tutorialContinueToNextHand": {
            "translator note": "button text for continuing to the next hard after receiving the explanation for the result of the previous round",
            "en/UK": "Continue"
        },
        "UnlocalisedString": "UNLOCALISED_STRING"
    }
}

class LocalisedStringManager {
    constructor(locale) {
        this.locale = locale;
        this.localisedStrings = getLocalisedStrings();
    }

    getLocalisedString(localisedStringId) {
        var localisedString = "";
        var localisedStringObj = this.localisedStrings[localisedStringId];
        if (localisedStringObj) {
            localisedString = localisedStringObj[this.locale];
        }

        if (localisedString === "") {
            localisedString = this.localisedStrings["UnlocalisedString"];
        }

        return localisedString;
    }
}

(function () {
    let e = {};
    e.LocalisedStringManager = LocalisedStringManager;
    
    if (typeof module !== 'undefined' && module.exports != null) {
        module.exports = e;
    } else {
        window.localisedStrings = e;
    }
})();