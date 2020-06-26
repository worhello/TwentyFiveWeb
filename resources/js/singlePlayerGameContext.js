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
    return players;
}

class SinglePlayerGameContext {
    constructor(numPlayers, cardDisplayDelay) {
        this.deck = new Deck();
        this.players = setupPlayers(numPlayers);
        this.trumpCard = new TrumpCard();
        this.selfPlayer = this.players.find(function(p) { return p.isSelfPlayer == true; });
        this.cardDisplayDelay = cardDisplayDelay;
        this.roundPlayerAndCards = [];
    }

    dealAllPlayerCards() {
        this.players.forEach(function(player) {
            player.cards = window.gameContext.drawCards(5);
        });
    }

    rotatePlayersArray(lastRoundWinningPlayerName) {
        let players = this.players;
        let winningPlayerIndex = players.findIndex(p => p.name == lastRoundWinningPlayerName);;
        let firstHalf = players.slice(winningPlayerIndex);
        let secondHalf = players.slice(0, winningPlayerIndex);
        this.players = firstHalf.concat(secondHalf);
    }

    getPlayedCards() {
        return this.roundPlayerAndCards.map(pAC => pAC.card);
    }

    async evaluateRoundEnd() {
        let playedCards = this.getPlayedCards();
        let winningCard = getWinningCard(this.trumpCard, playedCards);
        let winningPlayerName = this.roundPlayerAndCards.find(function (pAC) { return pAC.card == winningCard }).player.name;

        window.eventsHandler.sendEventToViewController('highlightWinningPlayer', { "winningPlayerName": winningPlayerName });
        await sleepFor(500);

        this.players.find(function (p) { return p.name == winningPlayerName }).score += 5;
        window.eventsHandler.sendEventToViewController('redrawPlayerScores', { "players": this.players });

        var winnerWithHighestScore = this.players[0];
        this.players.map(function(p) {
            if (p.score > winnerWithHighestScore.score) {
                winnerWithHighestScore = p;
            }
        });

        if (winnerWithHighestScore.score >= 25) {
            window.alert(winnerWithHighestScore.name + " won!");
            window.eventsHandler.sendEventToViewController('resetPlayedCardsState', {});
            window.eventsHandler.sendEventToViewController('resetSelfPlayerState', {});
            window.eventsHandler.sendGameOverlayEvent('showStartGameOverlay', {});
        } else {
            // start next round
            this.rotatePlayersArray(winningPlayerName);
            this.startRound();
        }
    }

    getSelfPlayerIndex() {
        return this.players.findIndex(p => p.isSelfPlayer == true);
    }

    async playCardAsync(player, playedCard) {
        window.eventsHandler.sendEventToViewController('playCard', { "playerName": player.name, "playedCard": playedCard });
        this.roundPlayerAndCards.push({ "player": player, "card": playedCard });
        await sleepFor(500);
    }

    async playCardsInRange(begin, end) {
        for (var i = begin; i < end; i++) {
            let player = this.players[i];
            let playedCards = this.getPlayedCards();
            await this.playCardAsync(player, player.aiPlayCard(playedCards));
        }
    }

    async playCardsAfterSelfAsync() {
        window.eventsHandler.sendEventToViewController('setSelfPlayerCardsEnabled', { "isEnabled": false });
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
        window.eventsHandler.sendEventToViewController('resetSelfPlayerState', {});
        window.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer });
        window.eventsHandler.sendEventToViewController('setSelfPlayerCardsEnabled', { "isEnabled": false });
        await this.playCardAsync(this.selfPlayer, playedCard);

        await window.gameContext.playCardsAfterSelfAsync();
    }

    resetDeckIfNeeded() {
        let numCardsNeeded = (this.players.length * 5) + 1;
        if (this.deck.cards.length < numCardsNeeded) {
            this.deck = new Deck();
        }
    }

    async startRound() {
        this.resetDeckIfNeeded();
        if (this.selfPlayer.cards.length == 0) {
            this.dealAllPlayerCards();
            this.roundPlayerAndCards = [];
            window.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer });
            this.trumpCard.card = this.drawCards(1)[0];
            this.trumpCard.hasBeenStolen = false;
            window.eventsHandler.sendEventToViewController('redrawTrumpCard', { "trumpCard": this.trumpCard });
        }

        window.eventsHandler.sendEventToViewController('setSelfPlayerCardsEnabled', { "isEnabled": false });
        window.eventsHandler.sendEventToViewController('resetPlayedCardsState', {});
        window.eventsHandler.sendEventToViewController('drawPlayedCardsPlaceholders', { "players": this.players });

        await this.playCardsBeforeSelf();

        window.eventsHandler.sendEventToViewController('setSelfPlayerCardsEnabled', { "isEnabled": true });
    }

    startGame() {
        window.eventsHandler.sendEventToViewController('resetSelfPlayerState', {});
        window.eventsHandler.sendEventToViewController('drawPlayerScores', { "players": this.players });
        this.startRound();
    }

    drawCards = function(num) {
        var cards = [];
        for (const i of Array(num).keys()) {
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
