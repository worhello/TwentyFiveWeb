"use strict";

function sleepFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setupPlayers(numPlayers) {
    var players = [];

    players.push(new Player("You", true));
    for (const i of Array(numPlayers - 1).keys()) {
        players.push(new Player("player_" + i));
    }
    players.sort(function() {
        return .5 - Math.random();
    });
    players[0].isDealer = true;
    return players;
}

class SinglePlayerGameContext {
    constructor(eventsHandler, numPlayers, cardDisplayDelay) {
        this.eventsHandler = eventsHandler;
        this.deck = new Deck();
        this.players = setupPlayers(numPlayers);
        this.trumpCard = new TrumpCard();
        this.selfPlayer = this.players.find(p => p.isSelfPlayer == true );
        this.cardDisplayDelay = cardDisplayDelay;
        this.roundPlayerAndCards = [];
    }

    async defaultSleep() {
        await sleepFor(this.cardDisplayDelay);
    }

    dealAllPlayerCards() {
        this.players.forEach(function(player) {
            player.cards = window.gameContext.drawCards(5);
        });
    }

    rotatePlayersArray(lastRoundWinningPlayerId) {
        let players = this.players;
        let winningPlayerIndex = players.findIndex(p => p.id == lastRoundWinningPlayerId);
        let firstHalf = players.slice(winningPlayerIndex);
        let secondHalf = players.slice(0, winningPlayerIndex);
        this.players = firstHalf.concat(secondHalf);
    }

    getPlayedCards() {
        return this.roundPlayerAndCards.map(pAC => pAC.card);
    }

    getSortedListOfPlayers() {
        let playersCopy = this.players;
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
        let winningCard = getWinningCard(this.trumpCard, playedCards);
        let winningPlayer = this.roundPlayerAndCards.find(pAC => pAC.card == winningCard).player;
        let winningPlayerId = winningPlayer.id;

        this.eventsHandler.sendEventToViewController('highlightWinningPlayer', { "winningPlayerId": winningPlayerId });
        await this.defaultSleep();

        this.players.find(p => p.id == winningPlayerId).score += 5;

        var winnerWithHighestScore = this.players[0];
        this.players.map(function(p) {
            if (p.score > winnerWithHighestScore.score) {
                winnerWithHighestScore = p;
            }
        });

        if (winnerWithHighestScore.score >= 25) {
            this.eventsHandler.sendEventToViewController('resetPlayedCardsState', {});
            this.eventsHandler.sendEventToViewController('resetSelfPlayerState', {});
            this.eventsHandler.sendEventToViewController('showStartGameOverlay', {});

            let orderedPlayers = this.getSortedListOfPlayers();
            this.eventsHandler.sendEventToViewController('showEndGameStats', { "sortedPlayers": orderedPlayers });

        } else {
            this.rotateDealer();
            this.rotatePlayersArray(winningPlayerId);
            this.eventsHandler.sendEventToViewController('drawPlayerScores', { "players": this.players });
            this.startRound();
        }
    }

    getSelfPlayerIndex() {
        return this.players.findIndex(p => p.isSelfPlayer == true);
    }

    async playCardAsync(player, playedCard) {
        this.eventsHandler.sendEventToViewController('playCard', { "player": player, "playedCard": playedCard });
        this.roundPlayerAndCards.push({ "player": player, "card": playedCard });
        await this.defaultSleep();
    }

    async playCardsInRange(begin, end) {
        for (var i = begin; i < end; i++) {
            let player = this.players[i];
            let playedCards = this.getPlayedCards();
            await this.playCardAsync(player, player.aiPlayCard(playedCards));
        }
    }

    async playCardsAfterSelfAsync() {
        this.eventsHandler.sendEventToViewController('setSelfPlayerCardsEnabled', { "isEnabled": false });
        let selfPlayerIndex = this.getSelfPlayerIndex();
        await this.playCardsInRange(selfPlayerIndex + 1, this.players.length);

        this.evaluateRoundEnd();
    }
    
    async playCardsBeforeSelf() {
        let selfPlayerIndex = this.getSelfPlayerIndex();
        await this.playCardsInRange(0, selfPlayerIndex);
    }

    async playSelfCard(cardName) {
        let playedCard = this.selfPlayer.playCard(cardName);
        this.eventsHandler.sendEventToViewController('resetSelfPlayerState', {});
        this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer });
        this.eventsHandler.sendEventToViewController('setSelfPlayerCardsEnabled', { "isEnabled": false });
        await this.playCardAsync(this.selfPlayer, playedCard);

        await window.gameContext.playCardsAfterSelfAsync();
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
            dealerIndex = 0;
        } else {
            this.players[dealerIndex].isDealer = false;
        }
        dealerIndex = (dealerIndex + 1) % this.players.length;
        this.players[dealerIndex].isDealer = true;
    }

    async startRound() {
        this.resetDeckIfNeeded();
        this.roundPlayerAndCards = [];
        if (this.selfPlayer.cards.length == 0) {
            this.dealAllPlayerCards();
            this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer });
            this.trumpCard.card = this.drawCards(1)[0];
            this.trumpCard.hasBeenStolen = false;
            this.eventsHandler.sendEventToViewController('redrawTrumpCard', { "trumpCard": this.trumpCard });
        }

        this.eventsHandler.sendEventToViewController('setSelfPlayerCardsEnabled', { "isEnabled": false });
        this.eventsHandler.sendEventToViewController('resetPlayedCardsState', {});
        this.eventsHandler.sendEventToViewController('drawPlayedCardsPlaceholders', { "players": this.players });

        await this.playCardsBeforeSelf();

        this.eventsHandler.sendEventToViewController('setSelfPlayerCardsEnabled', { "isEnabled": true });
    }

    startGame() {
        this.eventsHandler.sendEventToViewController('resetSelfPlayerState', {});
        this.eventsHandler.sendEventToViewController('drawPlayerScores', { "players": this.players });
        this.startRound();
    }

    drawCards(num) {
        var cards = [];
        for (const _ of Array(num).keys()) {
            cards.push(this.deck.cards.pop());
        }
        return cards;
    }

    handleEvent(eventName, eventDetails) {
        if (eventName === 'playSelfCard') {
            this.playSelfCard(eventDetails.cardName);
        }
    }
}
