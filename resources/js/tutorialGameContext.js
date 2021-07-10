"use strict";

class TutorialModulesAccessor {
    static getStateMachineContextModule() {
        if (typeof module !== 'undefined' && module.exports != null) {
            return require("./stateMachineGameContext");
        }
        else {
            return window.StateMachineGameContext;
        }
    }

    static getGameModule() {
        if (typeof module !== 'undefined' && module.exports != null) {
            let m = require("./twentyfive-js/game");
            return m;
        }
        else {
            return window.game;
        }
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

    static getCardModule() {
        if (typeof module !== 'undefined' && module.exports != null) {
            let card = require("./card");
            return card;
        }
        else {
            return window.card;
        }
    }
}

class TutorialManager {
    constructor(localisedStringManager) {
        this.localisedStringManager = localisedStringManager;
        this.introMessagesShown = 0;
        this.playCount = 0;
    }

    getNextTutorialOverlayMessage() {
        var messageType = "defaultTutorialMesssage";
        if (this.hasMoreIntroMessages()) {
            messageType = this.getNextIntroMessageType();
        } else {
            messageType = this.getNextWinningMessageType();
        }

        return this.localisedStringManager.getLocalisedString(messageType);
    }

    hasMoreIntroMessages() {
        return this.introMessagesShown < 3;
    }

    getNextIntroMessageType() {
        this.introMessagesShown++;
        if (this.introMessagesShown === 1) {
            return "tutorialIntroOne";
        }
        else if (this.introMessagesShown === 2) {
            return "tutorialIntroTwo";
        }
        else if (this.introMessagesShown === 3) {
            return "tutorialIntroThree";
        }

        return "defaultTutorialMesssage";
    }

    getNextWinningMessageType() {
        this.playCount++;

        if (this.playCount === 1) {
            return "tutorialMoveOne";
        }
        else if (this.playCount === 2) {
            return "tutorialMoveTwo";
        }
        else if (this.playCount === 3) {
            return "tutorialMoveThree";
        }
        else if (this.playCount === 4) {
            return "tutorialMoveFour";
        }
        else if (this.playCount === 5) {
            return "tutorialMoveFive";
        }
        else if (this.playCount === 6) {
            return "tutorialMoveSix";
        }
        else if (this.playCount === 7) {
            return "tutorialMoveSeven";
        }
        else if (this.playCount === 8) {
            return "tutorialMoveEight";
        }
        else if (this.playCount === 9) {
            return "tutorialMoveNine";
        }
        else if (this.playCount === 10) {
            return "tutorialMoveTen";
        }

        return "defaultTutorialMesssage";
    }

    getSkipTrumpButtonDisabledReason() {
        return this.localisedStringManager.getLocalisedString("skipTrumpButtonDisabledReason");
    }
}

class TutorialGameManager {
    constructor() {
        this.playCount = -1;
        this.deckSorted = false;
        this.dealerSet = false;
    }

    sortDeckIfNeeded(deckCards) {
        if (this.deckSorted == true) {
            return;
        }
        this.deckSorted = true;

        let gameLogic = TutorialModulesAccessor.getGameLogicModule();
        let cardModule = TutorialModulesAccessor.getCardModule();
        let cardsToFindAndReplace = [
            new cardModule.Card(cardModule.CardSuits.diamonds, cardModule.CardValues.seven),
            new cardModule.Card(cardModule.CardSuits.spades,   cardModule.CardValues.three),
            new cardModule.Card(cardModule.CardSuits.clubs,    cardModule.CardValues.ace  ),
            new cardModule.Card(cardModule.CardSuits.hearts,   cardModule.CardValues.six  ),
            new cardModule.Card(cardModule.CardSuits.hearts,   cardModule.CardValues.three),

            new cardModule.Card(cardModule.CardSuits.diamonds, cardModule.CardValues.four ),
            new cardModule.Card(cardModule.CardSuits.spades,   cardModule.CardValues.two  ),
            new cardModule.Card(cardModule.CardSuits.clubs,    cardModule.CardValues.ten  ),
            new cardModule.Card(cardModule.CardSuits.hearts,   cardModule.CardValues.seven),
            new cardModule.Card(cardModule.CardSuits.clubs,    cardModule.CardValues.three),

            new cardModule.Card(cardModule.CardSuits.hearts,   cardModule.CardValues.four ),

            new cardModule.Card(cardModule.CardSuits.clubs,    cardModule.CardValues.nine ),
            new cardModule.Card(cardModule.CardSuits.diamonds, cardModule.CardValues.five ),
            new cardModule.Card(cardModule.CardSuits.diamonds, cardModule.CardValues.ten  ),
            new cardModule.Card(cardModule.CardSuits.hearts,   cardModule.CardValues.king ),
            new cardModule.Card(cardModule.CardSuits.spades,   cardModule.CardValues.queen),

            new cardModule.Card(cardModule.CardSuits.diamonds, cardModule.CardValues.jack ),
            new cardModule.Card(cardModule.CardSuits.hearts,   cardModule.CardValues.ace  ),
            new cardModule.Card(cardModule.CardSuits.diamonds, cardModule.CardValues.queen),
            new cardModule.Card(cardModule.CardSuits.spades,   cardModule.CardValues.four ),
            new cardModule.Card(cardModule.CardSuits.hearts,   cardModule.CardValues.jack ),

            new cardModule.Card(cardModule.CardSuits.diamonds, cardModule.CardValues.ace  )
        ];

        for (var i = 0; i < cardsToFindAndReplace.length; i++) {
            let deckIndex = i;
            let cardIndex = deckCards.findIndex(function(card) { return gameLogic.isSameCard(card, cardsToFindAndReplace[i]); } );
            var tmp = deckCards[deckIndex];
            deckCards[deckIndex] = deckCards[cardIndex];
            deckCards[cardIndex] = tmp;
        }
    }

    getDealerIndex(selfPlayerIndex) {
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

    getNextAiCardToPlay(player) {
        return player.cards[0].cardName;
    }
}

class TutorialGameContext extends (TutorialModulesAccessor.getStateMachineContextModule()).StateMachineGameContext {
    constructor(eventsHandler, numPlayers, localisationManager) {
        super(eventsHandler, numPlayers, localisationManager);
        this.tutorialManager = new TutorialManager(localisationManager);
        this.tutorialGameManager = new TutorialGameManager();
    }

    // override
    async startGame() {
        await this.showNextTutorialIntroMessage();
    }

    async startGameAfterIntroMessages() {
        await super.startGame();
    }

    async showNextTutorialOverlayMessage(continueFunc) {
        let tutorialOverlayMessage = this.tutorialManager.getNextTutorialOverlayMessage();
        await this.eventsHandler.sendEventToViewController('showTutorialOverlayMessage', { "tutorialOverlayMessage": tutorialOverlayMessage, "continueFunc": continueFunc });
    }

    async showNextTutorialIntroMessage() {
        let gameContext = this;
        let continueFunc = async function() {
            if (gameContext.tutorialManager.hasMoreIntroMessages()) {
                await gameContext.showNextTutorialIntroMessage();
            }
            else {
                await gameContext.startGameAfterIntroMessages();
            }
        };
        await this.showNextTutorialOverlayMessage(continueFunc);
    }

    async handleTutorialRoundFinished() {
        let gameContext = this;
        let continueFunc = async function() {
            await gameContext.handleRoundFinished();
        };
        await this.defaultSleep();
        await this.showNextTutorialOverlayMessage(continueFunc);
    }

    // override
    async handleUpdatedGameState() {
        let gameModule = TutorialModulesAccessor.getGameModule();
        var callParentFunc = true;
        if (this.game.currentState2 == gameModule.GameState2.readyToPlay) {
            let dealerIndex = this.tutorialGameManager.getDealerIndex(this.game.players.findIndex(p => p.isAi == false));
            this.game.players[dealerIndex].isDealer = true;
        }
        else if (this.game.currentState2 == gameModule.GameState2.dealCards) {
            this.tutorialGameManager.sortDeckIfNeeded(this.game.deck.cards);
        }
        else if (this.game.currentState2 == gameModule.GameState2.roundFinished) {
            callParentFunc = false;
            await this.handleTutorialRoundFinished();
        }
        else if (this.game.currentState2 == gameModule.GameState2.waitingForPlayerMove) {
            let player = this.game.players[this.game.currentHandInfo.currentPlayerIndex];
            this.tutorialGameManager.enableCardsForPlay(player.cards);
        }

        if (callParentFunc == true) {
            await super.handleUpdatedGameState();
        }
    }

    // override
    async handleSelfPlayerRobbing() {
        await this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer, "isEnabled": true });
        await this.eventsHandler.sendEventToViewController('showSelfPlayerRobbingDialog', 
        { 
            "trumpCard": this.game.trumpCard, 
            "skipButtonDisabled": true,
            "skipButtonDisabledReason": this.tutorialManager.getSkipTrumpButtonDisabledReason()
        });
    }
}