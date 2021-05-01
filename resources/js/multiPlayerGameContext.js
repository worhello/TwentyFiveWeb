"use strict";

function getPlayerModule() {
    if (typeof module !== 'undefined' && module.exports != null) {
        let playerModule = require("./player");
        return playerModule;
    }
    else {
        return window.playerModule;
    }
}

class MultiPlayerGameContext {
    constructor(eventsHandler, numPlayers, localisationManager) {
        this.eventsHandler = eventsHandler;
        this.numPlayers = numPlayers;
        this.players = [];
        this.localisationManager = localisationManager;
        this.userId = "";
        this.gameId = "";
        this.gameUrl = "";
        this.selfPlayer = {};

        this.websocket = new WebSocket('ws://localhost:8081');
        let gameContext = this;
        this.websocket.onmessage = function (event) {
            gameContext.handleWebsocketEvent(event);
        };
        this.websocket.onopen = function (event) {
            console.log("connected successfully");
        };
    }

    async startGame() {
        let gameContext = this;
        await this.eventsHandler.sendEventToViewController('showMultiplayerNameInput', {
            continueFunc: function (input) { gameContext.createGameWithName(input); }
        });
    }

    async joinGame(gameId) {
        let gameContext = this;
        await this.eventsHandler.sendEventToViewController('showMultiplayerNameInput', {
            continueFunc: function (input) { gameContext.joinGameWithName(gameId, input); }
        });
    }

    async joinGameWithName(gameId, playerName) {
        let data = {
            type: "joinGame",
            gameId: gameId,
            playerDetails: {
                name: playerName,
                userId: this.userId
            }
        };
        this.websocket.send(JSON.stringify(data));
    }

    createGameWithName(playerName) {
        // TODO lots of input validation needed here...
        let data = {
            type: "createGame",
            numberOfPlayers: this.numPlayers,
            playerDetails: {
                name: playerName,
                userId: this.userId
            }
        };
        this.websocket.send(JSON.stringify(data));
    }

    requestAIs() {
        let data = {
            type: "requestAIs",
            gameId: this.gameId
        };
        this.websocket.send(JSON.stringify(data));
    }

    startGameOnServer() {
        let data = {
            type: "startGame",
            gameId: this.gameId
        };
        this.websocket.send(JSON.stringify(data));
    }

    async startNextRound() {
        let data = {
            type: "playerAction",
            playerActionType: "startNextRound",
            gameId: this.gameId,
            userId: this.userId
        };
        this.websocket.send(JSON.stringify(data));
    }

    async selfPlayerRobTrumpCard(droppedCardName) {
        let data = {
            type: "playerAction",
            playerActionType: "robTrumpCard",
            gameId: this.gameId,
            userId: this.userId,
            droppedCardDetails: {
                cardName: droppedCardName
            }
        };
        this.websocket.send(JSON.stringify(data));
    }

    async playSelfCard(cardName) {
        let data = {
            type: "playerAction",
            playerActionType: "playCard",
            gameId: this.gameId,
            userId: this.userId,
            cardDetails: {
                cardName: cardName
            }
        };
        this.websocket.send(JSON.stringify(data));
    }

    async skipRobbingTrumpCard() {
        let data = {
            type: "playerAction",
            playerActionType: "skipRobTrumpCard",
            gameId: this.gameId,
            userId: this.userId
        };
        this.websocket.send(JSON.stringify(data));
    }

    async handleEvent(eventName, eventDetails) {
        if (eventName == 'playSelfCard') {
            await this.playSelfCard(eventDetails.cardName);
        } else if (eventName == 'startNextRound') {
            await this.startNextRound(eventDetails.startingPlayerId);
        } else if (eventName == 'selfPlayerRobTrumpCard') {
            await this.selfPlayerRobTrumpCard(eventDetails.droppedCardName);
        } else if (eventName == 'skipRobbingTrumpCard') {
            await this.skipRobbingTrumpCard();
        }
    }

    handlePlayerListChanged(json) {
        // Caution - if we end up changing players midway through we lose all details here
        let gameContext = this;
        let playersDetails = json.playersDetails;
        let playersModule = getPlayerModule();
        let convertToTfPlayer = function(details) {
            var p = new playersModule.Player(details.name, details.userId == gameContext.userId);
            p.id = details.userId;
            return p;
        }
        this.players = playersDetails.map(convertToTfPlayer);

        this.eventsHandler.sendEventToViewController('updateMultiplayerWaitingScreen', {
            waitingPlayers: this.players,
            needMorePlayers: json.needMorePlayers,
            gameUrl: this.gameUrl,
            continueFunc: function () { json.needMorePlayers? gameContext.requestAIs() : gameContext.startGameOnServer(); }
        });

        if (!this.selfPlayer) {
            this.selfPlayer = this.players.find(function (p) { p.id == this.userId });
        }
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
        this.websocket.close();
    }

    async handleRoundFinished(json) {
        await this.handleScoresUpdated(json);
        await this.eventsHandler.sendEventToViewController('showEndOfHandStats', { "sortedPlayers": json.orderedPlayers });
    }

    async handleScoresUpdated(json) {
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

    async handleWebsocketEvent(event) {
        let json = JSON.parse(event.data);
        console.log(json);
        if (json.type == "wsConnectionAck") {
            this.userId = json.userId;
        }
        else if (json.type == "createGameAck" || json.type == "joinGameAck") {
            this.gameId = json.gameId;
            this.gameUrl = json.gameUrl;
        }
        else if (json.type == "playerListChanged") {
            this.handlePlayerListChanged(json);
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
            await this.handleScoresUpdated(json);
        }
        else if (json.type == "robTrumpCardAvailable") {
            await this.handleRobTrumpCardAvailable(json);
        }
    }
}