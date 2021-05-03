"use strict";

class SinglePlayerGameContext2 extends GameContext {
    constructor(eventsHandler, numPlayers, cardDisplayDelay, localisationManager) {
        super(eventsHandler);
        this.gameId = "SinglePlayerGameId";
        this.eventsHandler = eventsHandler;
        this.cardDisplayDelay = cardDisplayDelay;

        let gameContext = this;
        this.notifyEventFunc = async function(playerId, data) { await gameContext.handleGameEvent(playerId, data); };
        this.gameStateChangedFunc = async function(newState) { await gameContext.handleGameStateChanged(newState); };
        this.disableReneging = true;

        this.game = new (this.getGameModule()).Game(this.gameId, numPlayers, this.notifyEventFunc, this.gameStateChangedFunc, this.disableReneging);

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

    async onStartGame() {
        await this.game.start();
    }

    async startGame() {
        await this.game.init();

        await this.game.addPlayer(this.selfPlayer);
        await this.game.fillWithAis();

        await this.eventsHandler.sendEventToViewController('resetSelfPlayerState', {});

        await this.onStartGame();
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

    async handleGameEvent(playerId, data) {
        if (playerId == this.selfPlayer.id) {
            await this.handleTfGameEvent(data);
        }
    }
    
    async handleGameStateChanged(newState) {
    }
}

(function () {
    let e = {};
    e.SinglePlayerGameContext2 = SinglePlayerGameContext2;
    
    if (typeof module !== 'undefined' && module.exports != null) {
        module.exports = e;
    } else {
        window.SinglePlayerGameContext2Module = e;
    }
})();