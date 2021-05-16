"use strict";

class SinglePlayerGameContext extends GameContext {
    constructor(eventsHandler, numPlayers, localisationManager) {
        super(eventsHandler);
        this.gameId = "SinglePlayerGameId";
        this.eventsHandler = eventsHandler;

        let gameContext = this;
        this.notifyEventFunc = async function(playerId, data) { await gameContext.handleGameEvent(playerId, data); };
        this.gameStateChangedFunc = async function(newState) { await gameContext.handleGameStateChanged(newState); };
        this.gameChangedFunc = async function() {};
        this.disableReneging = true;

        this.game = new (this.getGameModule()).Game(this.gameId, numPlayers, this.disableReneging);
        this.gameMgr = new (this.getGameProcessorModule()).GameProcessor(this.game, this.notifyEventFunc, this.gameStateChangedFunc, this.gameChangedFunc)
        this.gameMgr.nextActionDelayTime = 300;

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

    getGameProcessorModule() {
        if (typeof module !== 'undefined' && module.exports != null) {
            let m = require("./twentyfive-js/gameProcessor");
            return m;
        }
        else {
            return window.gameProcess;
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
        await this.gameMgr.start();
    }

    async startGame() {
        await this.gameMgr.init();

        await this.gameMgr.addPlayer(this.selfPlayer);
        await this.gameMgr.fillWithAis();

        await this.eventsHandler.sendEventToViewController('resetSelfPlayerState', {});

        await this.onStartGame();
    }

    async playSelfCard(cardName) {
        await this.gameMgr.playCardWithId(this.selfPlayer.id, { cardName: cardName });
    }
    
    async startNextRound(startingPlayerId) {
        await this.gameMgr.markPlayerReadyForNextRound(this.selfPlayer.id);
    }
    
    async selfPlayerRobTrumpCard(droppedCardName) {
        await this.gameMgr.robTrumpCard(this.selfPlayer.id, { cardName: droppedCardName });
    }

    async skipRobbingTrumpCard() {
        await this.gameMgr.skipRobTrumpCard(this.selfPlayer.id);
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
    e.SinglePlayerGameContext = SinglePlayerGameContext;
    
    if (typeof module !== 'undefined' && module.exports != null) {
        module.exports = e;
    } else {
        window.SinglePlayerGameContextModule = e;
    }
})();