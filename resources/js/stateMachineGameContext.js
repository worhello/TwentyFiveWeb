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

class StateMachineGameContext {
    constructor(eventsHandler, numPlayers, localisationManager) {
        this.eventsHandler = eventsHandler;
        this.gameId = "StateMachineGameId";

        this.selfPlayer = new (StateMachineGameContextModuleHelper.getPlayerModule()).Player(localisationManager.getLocalisedString("selfPlayerDisplayName"), true);
        this.gameStateMachine = (StateMachineGameContextModuleHelper.getGameStateMachineModule()).GameStateMachine;

        this.game = new (StateMachineGameContextModuleHelper.getGameModule()).Game(this.gameId, numPlayers); // TODO - we should be able to set rules here
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
        
        await this.eventsHandler.sendEventToViewController('resetSelfPlayerState', {});
        await this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer, "isEnabled": false });
        await this.eventsHandler.sendEventToViewController('setupInitialState', { "isSelfPlayerCardsEnabled": false, "players": this.game.players, "trumpCard": this.game.trumpCard });

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
        await this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer, "isEnabled": false });
        await this.eventsHandler.sendEventToViewController('setupInitialState', { "isSelfPlayerCardsEnabled": false, "players": this.game.players, "trumpCard": this.game.trumpCard });
        await this.updateGameState();
    }

    async handleSelfPlayerRobbing() {
        await this.eventsHandler.sendEventToViewController('showSelfPlayerRobbingDialog', { 
            "trumpCard": this.game.trumpCard, 
            "skipButtonDisabled": false,
            "skipButtonDisabledReason": ""
        });
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
        await this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer, "isEnabled": true });
    }

    async handleWaitingForPlayerMove() {
        let player = this.game.players[this.game.currentHandInfo.currentPlayerIndex];
        await this.eventsHandler.sendEventToViewController('highlightCurrentPlayer', { "player": player });

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
        await this.eventsHandler.sendEventToViewController('playCard', { "player": player, "playedCard": playedCard });
        if (isNewWinningCard == true) {
            await this.eventsHandler.sendEventToViewController('updateCurrentWinningCard', { "player": player, "card": playedCard });
        }
    }

    async handleRoundFinished() {
        this.gameStateMachine.updateToNextGameState(this.game);
        if (this.game.endOfHandInfo.gameFinished == true) {
            await this.eventsHandler.sendEventToViewController('showGameEndScreen', { "sortedPlayers": this.game.endOfHandInfo.orderedPlayers });
        }
        else if (this.game.currentHandInfo.needMoreCardsDealt) {
            await this.eventsHandler.sendEventToViewController('showEndOfHandStats', { "sortedPlayers": this.game.endOfHandInfo.orderedPlayers });
        }
        else {
            await this.defaultSleep();
            await this.eventsHandler.sendEventToViewController('setupInitialState', { "isSelfPlayerCardsEnabled": false, "players": this.game.players, "trumpCard": this.game.trumpCard });
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
        await this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer, "isEnabled": false });
        await this.updateGameState();
    }

    async startNextRound() {
        await this.updateGameState();
    }

    async selfPlayerRobTrumpCard(droppedCardName) {
        let player = this.game.players[this.game.roundRobbingInfo.playerCanRobIndex];
        this.gameStateMachine.robCard(this.game, player, droppedCardName);
        await this.updateGameState();
        await this.eventsHandler.sendEventToViewController('redrawTrumpCard', { "trumpCard": this.game.trumpCard });
    }

    async skipRobbingTrumpCard() {
        this.gameStateMachine.skipRobbing(this.game);
        await this.updateGameState();
        await this.eventsHandler.sendEventToViewController('redrawTrumpCard', { "trumpCard": this.game.trumpCard });
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