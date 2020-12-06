"use strict";

function getGameLogicModule() {
    if (typeof module !== 'undefined' && module.exports != null) {
        let gameLogic = require("./gameLogic");
        return gameLogic;
    }
    else {
        return window.gameLogic;
    }
}

function getPlayerModule() {
    if (typeof module !== 'undefined' && module.exports != null) {
        let playerModule = require("./player");
        return playerModule;
    }
    else {
        return window.playerModule;
    }
}

function sleepFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setupPlayers(numPlayers) {
    var players = [];

    let playerModule = getPlayerModule();

    players.push(new playerModule.Player("You", true));
    for (const i of Array(numPlayers - 1).keys()) {
        players.push(new playerModule.Player("player_" + i));
    }
    players.sort(function() {
        return .5 - Math.random();
    });
    players[numPlayers - 1].isDealer = true;
    return players;
}

class SinglePlayerGameContext {
    constructor(eventsHandler, numPlayers, cardDisplayDelay) {
        this.gameLogic = getGameLogicModule();
        this.eventsHandler = eventsHandler;
        this.deck = new this.gameLogic.Deck();
        this.players = setupPlayers(numPlayers);
        this.trumpCard = new this.gameLogic.TrumpCard();
        this.selfPlayer = this.players.find(p => p.isSelfPlayer == true );
        this.cardDisplayDelay = cardDisplayDelay;
        this.roundPlayerAndCards = [];
    }

    async defaultSleep() {
        await sleepFor(this.cardDisplayDelay);
    }

    dealAllPlayerCards() {
        let gameContext = this;
        this.players.forEach(function(player) {
            player.cards = gameContext.drawCards(5);
        });
    }

    rotatePlayersArray(lastRoundWinningPlayerId) {
        let playersCopy = [...this.players];
        let winningPlayerIndex = playersCopy.findIndex(p => p.id == lastRoundWinningPlayerId);
        var firstHalf = playersCopy.slice(winningPlayerIndex, playersCopy.length);
        let secondHalf = playersCopy.slice(0, winningPlayerIndex);
        this.players = firstHalf.concat(secondHalf);
    }

    getPlayedCards() {
        return this.roundPlayerAndCards.map(pAC => pAC.card);
    }

    getSortedListOfPlayers() {
        let playersCopy = [...this.players];
        let cmpFunc = function(a, b) {
            if (a.score < b.score) {
                return 1;
            }
            if (a.score > b.score) {
                return -1;
            }
            return 0;
        }
        playersCopy.sort(cmpFunc);
        return playersCopy;
    }

    async evaluateRoundEnd() {
        let playedCards = this.getPlayedCards();
        let winningCard = this.gameLogic.getWinningCard(this.trumpCard, playedCards);
        let winningPlayer = this.roundPlayerAndCards.find(pAC => pAC.card == winningCard).player;
        let winningPlayerId = winningPlayer.id;

        await this.eventsHandler.sendEventToViewController('highlightWinningPlayer', { "winningPlayerId": winningPlayerId });
        await this.defaultSleep();
        await this.defaultSleep(); // double pause intentional

        this.players.find(p => p.id == winningPlayerId).score += 5;

        var winnerWithHighestScore = this.players[0];
        this.players.map(function(p) {
            if (p.score > winnerWithHighestScore.score) {
                winnerWithHighestScore = p;
            }
        });

        let orderedPlayers = this.getSortedListOfPlayers();
        if (winnerWithHighestScore.score >= 25) {
            await this.eventsHandler.sendEventToViewController('resetPlayedCardsState', {});
            await this.eventsHandler.sendEventToViewController('resetSelfPlayerState', {});
            await this.eventsHandler.sendEventToViewController('showStartGameOverlay', {});

            await this.eventsHandler.sendEventToViewController('showEndGameStats', { "sortedPlayers": orderedPlayers });
        }
        else if (this.mustDealNewCards()) {
            await this.eventsHandler.sendEventToViewController('showEndOfHandStats', { "sortedPlayers": orderedPlayers });
        }
        else {
            this.startNextRound(winningPlayerId);
        }
    }

    startNextRound(startingPlayerId) {
        this.rotatePlayersArray(startingPlayerId);
        this.startRound();
    }

    getSelfPlayerIndex() {
        return this.players.findIndex(p => p.isSelfPlayer == true);
    }

    async playCardAsync(player, playedCard) {
        await this.eventsHandler.sendEventToViewController('playCard', { "player": player, "playedCard": playedCard });
        this.roundPlayerAndCards.push({ "player": player, "card": playedCard });
        await this.defaultSleep();
    }

    async highlightCurrentPlayer(player) {
        await this.eventsHandler.sendEventToViewController('highlightCurrentPlayer', { "player": player });
    }

    async playCardsInRange(begin, end) {
        for (var i = begin; i < end; i++) {
            let player = this.players[i];
            await this.highlightCurrentPlayer(player);
            let playedCards = this.getPlayedCards();
            await this.playCardAsync(player, player.aiPlayCard(playedCards, this.trumpCard));
        }
    }

    async playCardsAfterSelfAsync() {
        await this.eventsHandler.sendEventToViewController('setSelfPlayerCardsEnabled', { "isEnabled": false });
        let selfPlayerIndex = this.getSelfPlayerIndex();
        await this.playCardsInRange(selfPlayerIndex + 1, this.players.length);

        await this.evaluateRoundEnd();
    }
    
    async playCardsBeforeSelf() {
        let selfPlayerIndex = this.getSelfPlayerIndex();
        await this.playCardsInRange(0, selfPlayerIndex);
    }

    async playSelfCard(cardName) {
        let playedCard = this.selfPlayer.playCard(cardName);
        await this.updateAndShowSelfPlayerEnabledCards();
        await this.eventsHandler.sendEventToViewController('setSelfPlayerCardsEnabled', { "isEnabled": false });
        await this.playCardAsync(this.selfPlayer, playedCard);

        await this.playCardsAfterSelfAsync();
    }

    resetDeckIfNeeded() {
        let numCardsNeeded = (this.players.length * 5) + 1;
        if (this.deck.cards.length < numCardsNeeded) {
            this.deck = new Deck();
        }
    }

    rotateDealer() {
        var dealerIndex = this.players.findIndex(p => p.isDealer === true);
        if (dealerIndex == -1) {
            dealerIndex = this.players.length - 2;
        } else {
            this.players[dealerIndex].isDealer = false;
        }
        dealerIndex = (dealerIndex + 1) % this.players.length;
        this.players[dealerIndex].isDealer = true;
    }

    mustDealNewCards() {
        return this.selfPlayer.cards.length == 0;
    }

    robCard(player, droppedCardName) {
        let _ = player.playCard(droppedCardName);
        player.cards.push(this.trumpCard.card);
        this.trumpCard.steal(player);
    }

    async selfPlayerRobTrumpCard(droppedCardName) {
        this.robCard(this.selfPlayer, droppedCardName);
        await this.updateAndShowSelfPlayerEnabledCards();

        await this.startRound();
    }

    async skipRobbingTrumpCard() {
        await this.startRound();
    }

    playerCanRobTrumpCard(player) {
        return this.gameLogic.canTrumpCardBeRobbed(player.cards, player.isDealer, this.trumpCard);
    }

    aiAttemptRob(player) {
        let canRob = this.playerCanRobTrumpCard(player);
        if (canRob === false) {
            return false;
        }

        let willRob = player.aiWillRobCard();
        if (willRob === false) {
            return false;
        }

        this.robCard(player, player.aiSelectCardToDropForRob(this.trumpCard));
        return true;
    }

    attemptRobForEachPlayer() {
        // sequence is explained in the rules
        // first check dealer
        let dealerIndex = this.players.findIndex(p => p.isDealer === true);
        let dealer = this.players[dealerIndex];
        if (dealer.isSelfPlayer === true) {
            return this.playerCanRobTrumpCard(dealer);
        }
        let dealerRobbed = this.aiAttemptRob(dealer);
        if (dealerRobbed === true) {
            return false;
        }

        // then cycle through other players
        for (let player of this.players) {
            if (player.isDealer) {
                continue; // already handled above
            }

            if (player.isSelfPlayer) {
                if (this.playerCanRobTrumpCard(player)) {
                    return true;
                }
            } else {
                let aiRobbed = this.aiAttemptRob(player);
                if (aiRobbed) {
                    return false;
                }
            }
        }

        return false;
    }

    async startRound() {
        this.resetDeckIfNeeded();
        this.roundPlayerAndCards = [];
        if (this.mustDealNewCards()) {
            this.rotateDealer();
            this.dealAllPlayerCards();
            await this.updateAndShowSelfPlayerEnabledCards();
            this.trumpCard = new TrumpCard();
            this.trumpCard.card = this.drawCard();

            let canBeRobbedBySelfPlayer = this.attemptRobForEachPlayer();
            if (canBeRobbedBySelfPlayer) {
                await this.eventsHandler.sendEventToViewController('showSelfPlayerRobbingDialog', { "trumpCard": this.trumpCard });
                return;
            }
        }

        await this.eventsHandler.sendEventToViewController('setSelfPlayerCardsEnabled', { "isEnabled": false });
        await this.eventsHandler.sendEventToViewController('resetPlayedCardsState', {});
        await this.eventsHandler.sendEventToViewController('drawPlayedCardsPlaceholders', { "players": this.players });
        await this.eventsHandler.sendEventToViewController('redrawTrumpCard', { "trumpCard": this.trumpCard });

        await this.playCardsBeforeSelf();

        await this.highlightCurrentPlayer(this.selfPlayer);
        await this.updateAndShowSelfPlayerEnabledCards();
        await this.eventsHandler.sendEventToViewController('setSelfPlayerCardsEnabled', { "isEnabled": true });
    }
    
    async updateAndShowSelfPlayerEnabledCards() {
        let playedCards = this.getPlayedCards();
        this.gameLogic.updatePlayerCardsEnabledState(playedCards, this.selfPlayer.cards, this.trumpCard);
        await this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer });
    }

    async startGame() {
        await this.eventsHandler.sendEventToViewController('resetSelfPlayerState', {});
        await this.startRound();
    }

    drawCard() {
        return this.deck.cards.pop();
    }

    drawCards(num) {
        var cards = [];
        for (const _ of Array(num).keys()) {
            cards.push(drawCard());
        }
        return cards;
    }

    async handleEvent(eventName, eventDetails) {
        if (eventName === 'playSelfCard') {
            await this.playSelfCard(eventDetails.cardName);
        } else if (eventName === 'startNextRound') {
            this.startNextRound(eventDetails.startingPlayerId);
        } else if (eventName === 'selfPlayerRobTrumpCard') {
            this.selfPlayerRobTrumpCard(eventDetails.droppedCardName);
        } else if (eventName === 'skipRobbingTrumpCard') {
            await this.skipRobbingTrumpCard();
        }
    }
}

(function () {
    if (typeof module !== 'undefined' && module.exports != null) {
        let sp_gameContextExports = {};
        sp_gameContextExports.SinglePlayerGameContext = SinglePlayerGameContext;
        
        module.exports = sp_gameContextExports;
    }
})();