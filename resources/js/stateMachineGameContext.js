"use strict";

class StateMachineGameContextModuleHelper {
    static getGameModule() {
        if (typeof module !== 'undefined' && module.exports != null) {
            return require("./twentyfive-js/game");
        }
        else {
            return window.game;
        }
    }
    
    static getPlayerModule() {
        if (typeof module !== 'undefined' && module.exports != null) {
            return require("./twentyfive-js/player");
        }
        else {
            return window.playerModule;
        }
    }

    static getGameStateMachineModule() {
        if (typeof module !== 'undefined' && module.exports != null) {
            return require("./twentyfive-js/gameStateMachine");
        }
        else {
            return window.gameStateMachine;
        }
    }
}

class StateMachineGameContext extends GameContext {
    constructor(eventsHandler, numPlayers, localisationManager, gameRules) {
        super(eventsHandler);
        this.eventsHandler = eventsHandler;
        this.gameId = "StateMachineGameId";

        this.selfPlayer = new (StateMachineGameContextModuleHelper.getPlayerModule()).Player(localisationManager.getLocalisedString("selfPlayerDisplayName"), true);
        this.gameStateMachine = (StateMachineGameContextModuleHelper.getGameStateMachineModule()).GameStateMachine;

        this.game = new (StateMachineGameContextModuleHelper.getGameModule()).Game(this.gameId, numPlayers, gameRules);
    }

    async defaultSleep() {
        await new Promise(r => setTimeout(r, 500));
    }

    async startGame() {
        await this.updateGameState();
        this.gameStateMachine.addPlayer(this.game, this.selfPlayer);
        this.gameStateMachine.fillWithAIs(this.game);
        await this.updateGameState();
        await this.updateGameState();

        await this.notifyGameInitialState(this.selfPlayer, this.game.players, this.game.trumpCard, this.game.teams);

        await this.updateGameState();
    }

    async updateGameState() {
        this.gameStateMachine.updateToNextGameState(this.game);
        await this.handleUpdatedGameState();
    }

    async handleUpdatedGameState() {
        //console.log("currentState2 = " + this.game.currentState2);
        let gameModule = StateMachineGameContextModuleHelper.getGameModule();

        if (this.game.currentState2 == gameModule.GameState2.dealCards) {
            await this.updateGameState();
        }
        else if (this.game.currentState2 == gameModule.GameState2.cardsDealt) {
            await this.handleCardsDealt();
        }
        else if (this.game.currentState2 == gameModule.GameState2.waitingForPlayerToRobTrumpCard) {
            await this.handlePlayerRobbing();
        }
        else if (this.game.currentState2 == gameModule.GameState2.waitingForPlayerMove) {
            await this.handleWaitingForPlayerMove();
        }
        else if (this.game.currentState2 == gameModule.GameState2.roundFinished) {
            await this.handleRoundFinished();
        }
        else if (this.game.currentState2 == gameModule.GameState2.waitingForPlayersToMarkAsReady) {
            await this.handleWaitingForPlayersToMarkAsReady();
        }
    }

    async handleCardsDealt() {
        await this.notifyGameInitialState(this.selfPlayer, this.game.players, this.game.trumpCard, this.game.teams);
        await this.updateGameState();
    }

    async handleSelfPlayerRobbing() {
        await this.handleRobTrumpCardAvailable(this.game.trumpCard);
    }

    async handlePlayerRobbing() {
        let player = this.game.players[this.game.roundRobbingInfo.playerCanRobIndex];
        if (player.id == this.selfPlayer.id) {
            await this.handleSelfPlayerRobbing();
        }
        else {
            this.gameStateMachine.handleAiPlayerRob(this.game);
            await this.updateGameState();
        }
    }

    async handleWaitingForSelfPlayerMove() {
        await this.notifySelfPlayerShowHand(this.selfPlayer, true);
    }

    async handleWaitingForPlayerMove() {
        let player = this.game.players[this.game.currentHandInfo.currentPlayerIndex];
        await this.notifyHighlightCurrentPlayer(player);

        if (player.id == this.selfPlayer.id) {
            await this.handleWaitingForSelfPlayerMove();
        }
        else {
            await this.defaultSleep();
            let isNewWinningCard = this.gameStateMachine.aiPlayCard(this.game, player);
            await this.handleCardPlayed(player, isNewWinningCard);

            await this.updateGameState();
        }
    }

    async handleCardPlayed(player, isNewWinningCard) {
        let playedCard = this.game.currentHandInfo.roundPlayerAndCards[this.game.currentHandInfo.roundPlayerAndCards.length - 1].card;
        await this.notifyCardPlayed(player, playedCard, isNewWinningCard);
    }

    async handleRoundFinished() {
        this.gameStateMachine.updateToNextGameState(this.game);
        if (this.game.endOfHandInfo.gameFinished == true) {
            await super.handleGameFinished(this.game.teams, this.game.endOfHandInfo.orderedPlayers);
        }
        else if (this.game.currentHandInfo.needMoreCardsDealt) {
            await super.handleRoundFinished(this.game.teams, this.game.endOfHandInfo.orderedPlayers);
        }
        else {
            await this.defaultSleep();
            await this.notifyGameInitialState(this.selfPlayer, this.game.players, this.game.trumpCard, this.game.teams);
            await this.updateGameState();
        }
    }

    async handleWaitingForPlayersToMarkAsReady() {
        this.gameStateMachine.markPlayerReadyForNextRound(this.game, this.selfPlayer.id);
        await this.updateGameState();
    }

    async playSelfCard(cardName) {
        let player = this.game.players[this.game.currentHandInfo.currentPlayerIndex];
        let isNewWinningCard = this.gameStateMachine.playCard(this.game, player, cardName);
        await this.handleCardPlayed(player, isNewWinningCard);
        await this.notifySelfPlayerShowHand(this.selfPlayer, false)
        await this.updateGameState();
    }

    async startNextRound() {
        await this.updateGameState();
    }

    async selfPlayerRobTrumpCard(droppedCardName) {
        let player = this.game.players[this.game.roundRobbingInfo.playerCanRobIndex];
        this.gameStateMachine.robCard(this.game, player, droppedCardName);
        await this.updateGameState();
        await this.notifyRedrawTrumpCard(this.game.trumpCard);
    }

    async skipRobbingTrumpCard() {
        this.gameStateMachine.skipRobbing(this.game);
        await this.updateGameState();
        await this.notifyRedrawTrumpCard(this.game.trumpCard);
    }

    async handleEvent(eventName, eventDetails) {
        if (eventName === 'playSelfCard') {
            await this.playSelfCard(eventDetails.cardName);
        } else if (eventName === 'startNextRound') {
            await this.startNextRound();
        } else if (eventName === 'selfPlayerRobTrumpCard') {
            await this.selfPlayerRobTrumpCard(eventDetails.droppedCardName);
        } else if (eventName === 'skipRobbingTrumpCard') {
            await this.skipRobbingTrumpCard();
        }
    }
}

(function () {
    let e = {};
    e.StateMachineGameContext = StateMachineGameContext;
    
    if (typeof module !== 'undefined' && module.exports != null) {
        module.exports = e;
    } else {
        window.StateMachineGameContext = e;
    }
})();