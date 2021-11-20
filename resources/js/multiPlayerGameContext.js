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

class MultiPlayerGameContext extends GameContext {
    constructor(eventsHandler, numPlayers, gameRules) {
        super(eventsHandler);
        this.eventsHandler = eventsHandler;
        this.numPlayers = numPlayers;
        this.players = [];
        this.userId = "";
        this.gameId = "";
        this.gameUrl = "";
        this.selfPlayer = {};
        this.gameRules = gameRules;

        // this.websocket = new WebSocket('ws://localhost:3000');
        this.websocket = new WebSocket('wss://server.twentyfivecardgame.com');
        let gameContext = this;
        this.websocket.onmessage = function (event) {
            gameContext.handleWebsocketEvent(event).finally(function() {});
        };
        this.websocket.onopen = function (event) {
            gameContext.handleWebsocketConnected();
        };
        this.websocket.onerror = function(event) {
            console.log(event);
            gameContext.handleWebsocketError();
        }
        this.websocket.onclose = function(event) {
            gameContext.handleWebsocketError();
        }
    }

    async startGame() {
        let gameContext = this;
        await this.showMultiPlayerNameInput(function (input) { gameContext.createGameWithName(input); });
    }
    
    async joinGame(gameId) {
        let gameContext = this;
        await this.showMultiPlayerNameInput(function (input) { gameContext.joinGameWithName(gameId, input); });
    }

    async showMultiPlayerNameInput(continueFunc) {
        if (this.websocket.readyState == WebSocket.OPEN) {
            await this.eventsHandler.sendEventToViewController('showMultiplayerNameInput', {
                continueFunc: continueFunc
            });
        }
        else {
            let gameContext = this;
            this.websocket.onopen = function(event) {
                gameContext.showMultiPlayerNameInput(continueFunc);
            }
        }
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
        let data = {
            type: "createGame",
            numberOfPlayers: this.numPlayers,
            playerDetails: {
                name: playerName,
                userId: this.userId
            },
            gameRules: this.gameRules
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
            await this.startNextRound();
        } else if (eventName == 'selfPlayerRobTrumpCard') {
            await this.selfPlayerRobTrumpCard(eventDetails.droppedCardName);
        } else if (eventName == 'skipRobbingTrumpCard') {
            await this.skipRobbingTrumpCard();
        }
    }

    handlePlayerListChanged(playersDetails, needMorePlayers) {
        // Caution - if we end up changing players midway through we lose all details here
        let gameContext = this;
        let playersModule = getPlayerModule();

        // TODO - make better way to build up TF types from Json
        let convertToTfPlayer = function(details) {
            var p = new playersModule.Player(details.name, details.id == gameContext.userId);
            p.id = details.id;
            p.isAi = details.isAi ?? false;
            p.isHost = details.isHost;
            return p;
        }
        this.players = playersDetails.map(convertToTfPlayer);

        this.eventsHandler.sendEventToViewController('updateMultiplayerWaitingScreen', {
            waitingPlayers: this.players,
            needMorePlayers: needMorePlayers,
            gameUrl: this.gameUrl,
            buttonsEnabled: this.players.find(p => p.id == this.userId).isHost,
            continueFunc: function () { needMorePlayers ? gameContext.requestAIs() : gameContext.startGameOnServer(); }
        });

        if (!this.selfPlayer) {
            this.selfPlayer = this.players.find((p) =>p.isSelfPlayer == true);
        }
    }

    async handleGameFinished(teams, orderedPlayers) {
        await super.handleGameFinished(teams, orderedPlayers);
        this.websocket.onclose = function(event) { /* no-op */ };
        this.websocket.close();
    }

    eventsQueue = [];
    addEventToQueue(asyncFunc) {
        this.eventsQueue.push(asyncFunc);
        if (this.eventInProgress == false) {
            this.processNextEvent();
        }
    }

    eventInProgress = false;
    processNextEvent() {
        this.eventInProgress = true;
        new Promise(r => setTimeout(r, 150)).then(async () => {
            let nextEntry = this.eventsQueue.shift();
            await nextEntry();

            if (this.eventsQueue.length == 0) {
                this.eventInProgress = false;
            }
            else {
                this.processNextEvent();
            }
        });
    }

    excludedEventTypes = [
        "playerListChanged"
    ];

    excludedSelfPlayerEventTypes = [
        "cardPlayed",
        "cardsUpdated"
    ];

    shouldQueueEvent(json) {
        if (this.excludedEventTypes.indexOf(json.type) > -1) {
            return false;
        }

        if (json.userId == this.selfPlayer.id) {
            if (this.excludedSelfPlayerEventTypes.indexOf(json.type) > -1) {
                return false;
            }
        }

        return true;
    }

    async handleWebsocketEvent(event) {
        let json = JSON.parse(event.data);
        if (json.type == "wsConnectionAck") {
            this.userId = json.userId;
        }
        else if (json.type == "createGameAck" || json.type == "joinGameAck") {
            this.gameId = json.gameId;
            this.gameUrl = json.gameUrl;
        }
        else if (json.type == "errorMessage") {
            console.log("server error received: " + json.errorMessage);
            this.websocket.close();
        }
        else if (this.shouldQueueEvent(json)) {
            let gc = this;
            this.addEventToQueue(async function() {
                await gc.handleTfGameEvent(json);
            });
        }
        else {
            await this.handleTfGameEvent(json);
        }
    }

    handleWebsocketConnected() {
        this.eventsHandler.sendEventToViewController('multiplayerConnected', {});
}

    handleWebsocketError() {
        this.eventsHandler.sendEventToViewController('multiplayerErrorHappened', {});
    }
}