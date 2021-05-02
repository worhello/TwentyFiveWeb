"use strict";

class SinglePlayerGameContext2 extends GameContext {
    constructor(eventsHandler, numPlayers, cardDisplayDelay, tutorialManager, localisationManager) {
        super(eventsHandler);
        this.gameId = "SinglePlayerGameId";
        this.eventsHandler = eventsHandler;
        this.tutorialManager = tutorialManager;
        this.cardDisplayDelay = cardDisplayDelay;

        let gameContext = this;
        let notifyEventFunc = async function(playerId, data) { await gameContext.handleGameEvent(playerId, data); };
        let gameStateChangedFunc = async function(newState) { await gameContext.handleGameStateChanged(newState); };
        let disableReneging = true;
        this.game = new (this.getGameModule()).Game(this.gameId, numPlayers, notifyEventFunc, gameStateChangedFunc, disableReneging, tutorialManager != null);

        this.players = [];
        this.trumpCard = {};

        this.selfPlayer = new (this.getPlayerModule()).Player(localisationManager.getLocalisedString("selfPlayerDisplayName"), true);
        this.userId = this.selfPlayer.id;
    }

    getGameLogicModule() {
        if (typeof module !== 'undefined' && module.exports != null) {
            let m = require("./twentyfive-js/gameLogic");
            return m;
        }
        else {
            return window.gameLogic;
        }
    }
    
    getGameModule() {
        if (typeof module !== 'undefined' && module.exports != null) {
            let m = require("./twentyfive-js/game");
            return m;
        }
        else {
            return window.game;
        }
    }
    
    getPlayerModule() {
        if (typeof module !== 'undefined' && module.exports != null) {
            let m = require("./twentyfive-js/player");
            return m;
        }
        else {
            return window.playerModule;
        }
    }

    async showNextTutorialOverlayMessage(continueFunc) {
        if (this.tutorialManager) {
            let tutorialOverlayMessage = this.tutorialManager.getNextTutorialOverlayMessage();
            await this.eventsHandler.sendEventToViewController('showTutorialOverlayMessage', { "tutorialOverlayMessage": tutorialOverlayMessage, "continueFunc": continueFunc });
        }
    }

    async showNextTutorialIntroMessage() {
        if (this.tutorialManager) {
            console.log("inside showNextTutorialIntroMessage");
            let gameContext = this;
            let continueFunc = async function() {
                if (gameContext.tutorialManager.hasMoreIntroMessages()) {
                    await gameContext.showNextTutorialIntroMessage();
                }
                else {
                    //await gameContext.startRound();
                    await gameContext.game.start();
                }
            };
            await this.showNextTutorialOverlayMessage(continueFunc);
        }
    }

    async startGame() {
        await this.game.init();

        await this.game.addPlayer(this.selfPlayer);
        await this.game.fillWithAis();

        await this.eventsHandler.sendEventToViewController('resetSelfPlayerState', {});

        if (this.tutorialManager) {
            await this.showNextTutorialIntroMessage();
        }
        else {
            await this.game.start();
        }
    }

    async playSelfCard(cardName) {
        await this.game.playCardWithId(this.selfPlayer.id, { cardName: cardName });
    }
    
    async startNextRound(startingPlayerId) {
        await this.game.markPlayerReadyForNextRound(this.selfPlayer.id);
    }
    
    async selfPlayerRobTrumpCard(droppedCardName) {
        await this.game.robTrumpCard(this.selfPlayer.id, { cardName: droppedCardName });
    }

    async skipRobbingTrumpCard() {
        await this.game.skipRobTrumpCard(this.selfPlayer.id);
    }

    async handleEvent(eventName, eventDetails) {
        if (eventName === 'playSelfCard') {
            await this.playSelfCard(eventDetails.cardName);
        } else if (eventName === 'startNextRound') {
            await this.startNextRound(eventDetails.startingPlayerId);
        } else if (eventName === 'selfPlayerRobTrumpCard') {
            await this.selfPlayerRobTrumpCard(eventDetails.droppedCardName);
        } else if (eventName === 'skipRobbingTrumpCard') {
            await this.skipRobbingTrumpCard();
        }
    }

    async handleTfGameEvent(data) {
        if (data.type == "tutorialRoundEnded") {
            await this.showNextTutorialOverlayMessage(data.continueFunc);
        }
        else {
            await super.handleTfGameEvent(data);
        }
    }

    // overriding base class due to tutorial logic
    async handleRobTrumpCardAvailable(json) {
        await this.eventsHandler.sendEventToViewController('showSelfPlayerRobbingDialog', 
        { 
            "trumpCard": json.trumpCard, 
            "skipButtonDisabled": this.tutorialManager !== null,
            "skipButtonDisabledReason": this.tutorialManager !== null ? this.tutorialManager.getSkipTrumpButtonDisabledReason() : ""
        });
    }

    async handleGameEvent(playerId, data) {
        if (playerId == this.selfPlayer.id) {
            await this.handleTfGameEvent(data);
        }
    }
    
    async handleGameStateChanged(newState) {
        console.log("gameState changed to: " + newState);
    }
}