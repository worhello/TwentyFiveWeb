"use strict";

class GameContext {
    constructor(eventsHandler) {
        this.eventsHandler = eventsHandler;

        this.players = [];
        this.selfPlayer = {};
        this.userId = "";
        this.trumpCard = {};
        this.gameId = "";
        this.gameUrl = "";
    }

    
    async handlePlayerListChanged(json) {
        // no-op for SinglePlayer, very useful for MultiPlayer
    }

    async handleGameInitialState(json) {
        this.trumpCard = json.gameInfo.trumpCard;
        this.selfPlayer.id = json.playerDetails.userId;
        this.selfPlayer.cards = json.playerDetails.cards;
        this.players = json.players; // TODO this overwrites important info, let's change this
        this.players.find(p => p.id == this.selfPlayer.id).isSelfPlayer = true;
        await this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer, "isEnabled": false });
        await this.eventsHandler.sendEventToViewController('setupInitialState', { "isSelfPlayerCardsEnabled": false, "players": this.players, "trumpCard": this.trumpCard });
    }

    async handleCurrentPlayerMovePending(json) {
        let player = this.players.find(function (p) { return p.id == json.userId; });
        await this.eventsHandler.sendEventToViewController('highlightCurrentPlayer', { "player": player });
    }

    async handlePlayerMoveRequested(json) {
        await this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer, "isEnabled": true });
    }

    async handleCardPlayed(json) {
        let player = this.players.find(function (p) { return p.id == json.userId; });
        let playedCard = json.playedCard;
        await this.eventsHandler.sendEventToViewController('playCard', { "player": player, "playedCard": playedCard });
        if (json.isNewWinningCard == true) {
            await this.eventsHandler.sendEventToViewController('updateCurrentWinningCard', { "player": player, "card": playedCard });
        }
    }

    async handleCardsUpdated(json) {
        let player = this.players.find(function (p) { return p.id == json.userId; });
        player.cards = json.cards;
        this.selfPlayer = player;
        await this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer, "isEnabled": false });
    }

    async handleGameFinished(json) {
        await this.eventsHandler.sendEventToViewController('showGameEndScreen', { "sortedPlayers": json.orderedPlayers });
    }

    async handleRoundFinished(json) {
        await this.handleScoresUpdated(json);
        await this.eventsHandler.sendEventToViewController('showEndOfHandStats', { "sortedPlayers": json.orderedPlayers });
    }

    handleScoresUpdated(json) {
        for (var i = 0; i < json.orderedPlayers.length; i++) {
            let updatedPlayer = json.orderedPlayers[i];
            let playerIndex = this.players.findIndex(function (p) { return p.id == updatedPlayer.id; });
            if (playerIndex > -1) {
                this.players[playerIndex].score = updatedPlayer.score;
            }
        }
    }

    async handleRobTrumpCardAvailable(json) {
        await this.eventsHandler.sendEventToViewController('showSelfPlayerRobbingDialog', { 
            "trumpCard": json.trumpCard, 
            "skipButtonDisabled": false,
            "skipButtonDisabledReason": ""
        });
    }

    async handlePlayersReadyForNextRoundChanged(json) {
        await this.eventsHandler.sendEventToViewController('playersReadyForNextRoundChanged', { 
            "readyPlayerIds": json.readyPlayerIds
        });
    }

    async handleTfGameEvent(json) {
        console.log("Received TF Event with type=" + json.type);
        if (json.type == "wsConnectionAck") {
            this.userId = json.userId;
        }
        else if (json.type == "createGameAck" || json.type == "joinGameAck") {
            this.gameId = json.gameId;
            this.gameUrl = json.gameUrl;
        }
        else if (json.type == "playerListChanged") {
            await this.handlePlayerListChanged(json);
        }
        else if (json.type == "gameInitialState") {
            await this.handleGameInitialState(json);
        }
        else if (json.type == "currentPlayerMovePending") {
            await this.handleCurrentPlayerMovePending(json);
        }
        else if (json.type == "playerMoveRequested") {
            await this.handlePlayerMoveRequested(json);
        }
        else if (json.type == "cardPlayed") {
            await this.handleCardPlayed(json);
        }
        else if (json.type == "cardsUpdated") {
            await this.handleCardsUpdated(json);
        }
        else if (json.type == "gameFinished") {
            await this.handleGameFinished(json);
        }
        else if (json.type == "roundFinished") {
            await this.handleRoundFinished(json);
        }
        else if (json.type == "scoresUpdated") {
            this.handleScoresUpdated(json);
        }
        else if (json.type == "robTrumpCardAvailable") {
            await this.handleRobTrumpCardAvailable(json);
        }
        else if (json.type == "playersReadyForNextRoundChanged") {
            await this.handlePlayersReadyForNextRoundChanged(json);
        }
    }
}