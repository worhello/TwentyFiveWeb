"use strict";

class TutorialManager {
    constructor(localisedStringManager) {
        this.localisedStringManager = localisedStringManager;
        this.playCount = 0;
        this.deckSorted = false;
        this.dealerSet = false;
    }

    getNextWinningReasonMessage() {
        this.playCount++;

        var winningReasonType = "defaultTutorialMesssage";
        if (this.playCount === 1) {
            winningReasonType = "tutorialMoveOne";
        }
        else if (this.playCount === 2) {
            winningReasonType = "tutorialMoveTwo";
        }
        else if (this.playCount === 3) {
            winningReasonType = "tutorialMoveThree";
        }
        else if (this.playCount === 4) {
            winningReasonType = "tutorialMoveFour";
        }
        else if (this.playCount === 5) {
            winningReasonType = "tutorialMoveFive";
        }
        else if (this.playCount === 6) {
            winningReasonType = "tutorialMoveSix";
        }
        else if (this.playCount === 7) {
            winningReasonType = "tutorialMoveSeven";
        }
        else if (this.playCount === 8) {
            winningReasonType = "tutorialMoveEight";
        }
        else if (this.playCount === 9) {
            winningReasonType = "tutorialMoveNine";
        }
        else if (this.playCount === 10) {
            winningReasonType = "tutorialMoveTen";
        }

        return this.localisedStringManager.getLocalisedString(winningReasonType);
    }

    static getGameLogicModule() {
        if (typeof module !== 'undefined' && module.exports != null) {
            let gameLogic = require("./gameLogic");
            return gameLogic;
        }
        else {
            return window.gameLogic;
        }
    }

    sortDeckIfNeeded(deckCards) {
        if (this.deckSorted === true) {
            return;
        }
        this.deckSorted = true;

        let gameLogic = TutorialManager.getGameLogicModule();
        let cardsToFindAndReplace = [
            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.seven),
            new gameLogic.Card(gameLogic.CardSuits.spades,   gameLogic.CardValues.three),
            new gameLogic.Card(gameLogic.CardSuits.clubs,    gameLogic.CardValues.ace  ),
            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.six  ),
            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.three),

            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.four ),
            new gameLogic.Card(gameLogic.CardSuits.spades,   gameLogic.CardValues.two  ),
            new gameLogic.Card(gameLogic.CardSuits.clubs,    gameLogic.CardValues.ten  ),
            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.seven),
            new gameLogic.Card(gameLogic.CardSuits.clubs,    gameLogic.CardValues.three),

            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.four ),

            new gameLogic.Card(gameLogic.CardSuits.clubs,    gameLogic.CardValues.nine ),
            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.five ),
            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.ten  ),
            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.king ),
            new gameLogic.Card(gameLogic.CardSuits.spades,   gameLogic.CardValues.queen),

            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.jack ),
            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.ace  ),
            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.queen),
            new gameLogic.Card(gameLogic.CardSuits.spades,   gameLogic.CardValues.four ),
            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.jack ),

            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.ace  )
        ];

        for (var i = 0; i < cardsToFindAndReplace.length; i++) {
            let deckIndex = 51 - i;
            let cardIndex = deckCards.findIndex(function(card) { return gameLogic.isSameCard(card, cardsToFindAndReplace[i]); } );
            var tmp = deckCards[deckIndex];
            deckCards[deckIndex] = deckCards[cardIndex];
            deckCards[cardIndex] = tmp;
        }
    }

    getDealerIndex(selfPlayerIndex) {
        console.log("hitting getDealerIndex with selfPlayerIndex=" + selfPlayerIndex);
        if (this.dealerSet === true) {
            return selfPlayerIndex;
        }
        this.dealerSet = true;
        return  (selfPlayerIndex + 1) % 2;
    }

    enableCardsForPlay(selfPlayerCards) {
        for (var card of selfPlayerCards) {
            card.canPlay = false;
        }
        if (selfPlayerCards.length > 0) {
            selfPlayerCards[0].canPlay = true;
        }

        return selfPlayerCards;
    }

    playNextAiCard(player) {
        // always play the first card
        return player.playCard(player.cards[0].cardName);
    }

    getSkipTrumpButtonDisabledReason() {
        return this.localisedStringManager.getLocalisedString("skipTrumpButtonDisabledReason");
    }
}

(function () {
    let e = {};
    e.TutorialManager = TutorialManager;
    
    if (typeof module !== 'undefined' && module.exports != null) {
        module.exports = e;
    } else {
        window.tutorialManager = e;
    }
})();