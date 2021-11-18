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
        this.teams = [];
    }

    
    async handlePlayerListChanged(playersDetails, needMorePlayers) {
        // no-op for SinglePlayer, very useful for MultiPlayer
    }

    async handleGameInitialState(gameInfo, playerDetails, players, teams) {
        this.trumpCard = gameInfo.trumpCard;
        this.selfPlayer.id = playerDetails.userId;
        this.selfPlayer.cards = playerDetails.cards;
        this.players = players;
        this.teams = teams;
        this.setSelfPlayer(this.players);
        await this.notifyGameInitialState(this.selfPlayer, this.players, this.trumpCard, this.teams);
    }

    async notifyGameInitialState(selfPlayer, players, trumpCard, teams) {
        var promises = [
            this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": selfPlayer, "isEnabled": false }),
            this.eventsHandler.sendEventToViewController('setupInitialState', { "isSelfPlayerCardsEnabled": false, "players": players, "trumpCard": trumpCard, "teams": teams })
        ];
        for (let p of promises) {
            await p;
        }
    }

    async handleCurrentPlayerMovePending(userId) {
        let player = this.players.find(function (p) { return p.id == userId; });
        await this.eventsHandler.sendEventToViewController('highlightCurrentPlayer', { "player": player });
    }

    async handlePlayerMoveRequested(userId) {
        if (userId == this.selfPlayer.id) {
            await this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer, "isEnabled": true });
        }
    }

    async handleCardPlayed(userId, playedCard, isNewWinningCard) {
        let player = this.players.find(function (p) { return p.id == userId; });
        await this.eventsHandler.sendEventToViewController('playCard', { "player": player, "playedCard": playedCard });
        if (isNewWinningCard == true) {
            await this.eventsHandler.sendEventToViewController('updateCurrentWinningCard', { "player": player, "card": playedCard });
        }
    }

    async handleCardsUpdated(userId, cards) {
        if (userId == this.selfPlayer.id) {
            this.selfPlayer.cards = cards;
            await this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer, "isEnabled": false });
        }
    }

    async handleTeamGameEndOfHandOrGame(teams, orderedPlayers, gameFinished) {
        let teamPlayersInfos = [];
        for (let team of teams) {
            let teamPlayersInfo = {};
            teamPlayersInfo.teamId = team.id;
            teamPlayersInfo.totalScore = team.totalScore;
            teamPlayersInfo.players = [];
            for (let playerId of team.playerIds) {
                teamPlayersInfo.players.push(orderedPlayers.find(p => p.id == playerId));
            }
            teamPlayersInfos.push(teamPlayersInfo);
        }
        await this.eventsHandler.sendEventToViewController('showEndOfHandOrGameStats_teams', { "teamPlayersInfos": teamPlayersInfos, "gameFinished": gameFinished });
    }

    async handleGameFinished(teams, orderedPlayers) {
        if (this.teams.length == 0) {
            await this.eventsHandler.sendEventToViewController('showGameEndScreen', { "sortedPlayers": orderedPlayers });
        }
        else {
            await this.handleTeamGameEndOfHandOrGame(teams, orderedPlayers, true);
        }
    }

    setSelfPlayer(players) {
        players.find(p => p.id == this.selfPlayer.id).isSelfPlayer = true;
    }

    async handleRoundFinished(teams, orderedPlayers) {
        this.setSelfPlayer(orderedPlayers);
        var promises = [ this.handleScoresUpdated(orderedPlayers) ];
        if (this.teams.length == 0) {
            promises.push(this.eventsHandler.sendEventToViewController('showEndOfHandStats', { "sortedPlayers": orderedPlayers }));
        }
        else {
            await this.handleTeamGameEndOfHandOrGame(teams, orderedPlayers, false);
        }
        for (let p of promises) {
            await p;
        }
    }

    handleScoresUpdated(orderedPlayers) {
        for (var i = 0; i < orderedPlayers.length; i++) {
            let updatedPlayer = orderedPlayers[i];
            let playerIndex = this.players.findIndex(function (p) { return p.id == updatedPlayer.id; });
            if (playerIndex > -1) {
                this.players[playerIndex].score = updatedPlayer.score;
            }
        }
    }

    async handleRobTrumpCardAvailable(trumpCard) {
        await this.eventsHandler.sendEventToViewController('showSelfPlayerRobbingDialog', { 
            "trumpCard": trumpCard, 
            "skipButtonDisabled": false,
            "skipButtonDisabledReason": ""
        });
    }

    async handlePlayersReadyForNextRoundChanged(readyPlayerIds) {
        await this.eventsHandler.sendEventToViewController('playersReadyForNextRoundChanged', { 
            "readyPlayers": this.players.filter(p => readyPlayerIds.findIndex(pId => pId == p.id) != -1),
            "disableButtons": readyPlayerIds.indexOf(this.userId) != -1
        });
    }

    async handleTfGameEvent(json) {
        // console.log(json);
        if (json.type == "playerListChanged") {
            await this.handlePlayerListChanged(json.playersDetails, json.needMorePlayers);
        }
        else if (json.type == "gameInitialState") {
            await this.handleGameInitialState(json.gameInfo, json.playerDetails, json.players, json.teams);
        }
        else if (json.type == "currentPlayerMovePending") {
            await this.handleCurrentPlayerMovePending(json.userId);
        }
        else if (json.type == "playerMoveRequested") {
            await this.handlePlayerMoveRequested(json.userId);
        }
        else if (json.type == "cardPlayed") {
            await this.handleCardPlayed(json.userId, json.playedCard, json.isNewWinningCard);
        }
        else if (json.type == "cardsUpdated") {
            await this.handleCardsUpdated(json.userId, json.cards);
        }
        else if (json.type == "gameFinished") {
            await this.handleGameFinished(json.teams, json.orderedPlayers);
        }
        else if (json.type == "roundFinished") {
            await this.handleRoundFinished(json.teams, json.orderedPlayers);
        }
        else if (json.type == "scoresUpdated") {
            this.handleScoresUpdated(json.orderedPlayers);
        }
        else if (json.type == "robTrumpCardAvailable") {
            await this.handleRobTrumpCardAvailable(json.trumpCard);
        }
        else if (json.type == "playersReadyForNextRoundChanged") {
            await this.handlePlayersReadyForNextRoundChanged(json.readyPlayerIds);
        }
    }
}