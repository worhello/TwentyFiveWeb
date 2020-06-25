"use strict";

function sleepFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setupPlayers(numPlayers) {
    var players = [];
    players.push(new Player("You"));
    for (const i of Array(numPlayers - 1).keys()) {
        players.push(new Player("player_" + i));
    }
    players.sort(function() {
        return .5 - Math.random();
    });
    return players;
}

function waitForCardsToBeRendered() {
    window.setTimeout(function() {
        if (window.gameViewController.allPlayedCardsVisible()) {
            window.gameContext.evaluateRoundEnd();
        } else {
            window.alert("error happened loading cards!");
        }
    }, 400);
}

function getSelfPlayer(players) {
    return players.find(function(p) {
        return p.name == "You";
    });
}

class SinglePlayerGameContext {
    constructor(numPlayers, cardDisplayDelay) {
        this.deck = new Deck();
        this.players = setupPlayers(numPlayers);
        this.trumpCard = new TrumpCard();
        this.selfPlayer = getSelfPlayer(this.players);
        this.cardDisplayDelay = cardDisplayDelay;
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

    async evaluateRoundEnd() {
        let playersAndCards = window.gameViewController.getPlayersAndCards();
        let playedCards = playersAndCards.map(pAC => pAC.card);
        let winningCard = getWinningCard(this.trumpCard, playedCards);
        let winningPlayerName = playersAndCards.find(function (pAC) { return pAC.card == winningCard }).playerName;

        window.gameViewController.event_highlightWinningCard(winningPlayerName);
        await sleepFor(500);


        this.players.find(function (p) { return p.name == winningPlayerName }).score += 5;
        window.gameViewController.event_redrawPlayerScores();

        var winnerWithHighestScore = this.players[0];
        this.players.map(function(p) {
            if (p.score > winnerWithHighestScore.score) {
                winnerWithHighestScore = p;
            }
        });

        if (winnerWithHighestScore.score >= 25) {
            window.alert(winnerWithHighestScore.name + " won!");
            window.gameViewController.event_resetPlayedCardsState();
            window.gameViewController.event_resetSelfPlayerState();
            event_showStartGameOverlay();
        } else {
            // start next round
            this.rotatePlayersArray(winningPlayerName);
            this.startRound();
        }
    }

    getCardIndexByName(name) {
        return this.players.findIndex(p => p.name == name);
    }

    async playCardAsync(playerName, playedCard) {
        await sleepFor(500);
        window.gameViewController.playCard(playerName, playedCard);
    }

    async playCardsBeforeSelfAsync() {
        let selfPlayerIndex = this.getCardIndexByName("You");
        if (selfPlayerIndex >= 0) {
            for (var i = 0; i < selfPlayerIndex; i++) {
                let player = this.players[i];
                let playedCards = window.gameViewController.getPlayedCards();
                await this.playCardAsync(player.name, player.aiPlayCard(playedCards));
            }
        }
    }

    async playCardsInRange(begin, end) {
        for (var i = begin; i < end; i++) {
            let player = this.players[i];
            let playedCards = window.gameViewController.getPlayedCards();
            await this.playCardAsync(player.name, player.aiPlayCard(playedCards));
        }
    }

    async playCardsAfterSelfAsync() {
        window.gameViewController.event_setSelfPlayerCardsEnabled(false);
        let selfPlayerIndex = this.getCardIndexByName("You");
        if (selfPlayerIndex >= 0) {
            await this.playCardsInRange(selfPlayerIndex + 1, this.players.length);
        }

        waitForCardsToBeRendered();
    }
    
    async playCardsBeforeSelf() {
        let selfPlayerIndex = this.getCardIndexByName("You");
        if (selfPlayerIndex >= 0) {
            await this.playCardsInRange(0, selfPlayerIndex);
        }
    }

    async playSelfCard(cardName) {
        this.selfPlayer.playCard(cardName);
        await window.gameContext.playCardsAfterSelfAsync();
    }

    playCardsAfterSelf() {
        window.gameViewController.event_setSelfPlayerCardsEnabled(false);
        let selfPlayerIndex = this.getCardIndexByName("You");
        if (selfPlayerIndex >= 0) {
            for (var i = selfPlayerIndex + 1; i < this.players.length; i++) {
                let player = this.players[i];
                playCard(player.name, player.aiPlayCard(getPlayedCards()));
            }
        }

        waitForCardsToBeRendered();
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
            window.gameViewController.event_showSelfPlayerHand();
            this.trumpCard.card = this.drawCards(1)[0];
            this.trumpCard.hasBeenStolen = false;
            window.gameViewController.event_redrawTrumpCard();
        }

        window.gameViewController.event_setSelfPlayerCardsEnabled(false);

        window.gameViewController.event_resetPlayedCardsState();
        window.gameViewController.event_drawPlayedCardsPlaceholders();

        await this.playCardsBeforeSelfAsync();

        window.gameViewController.event_setSelfPlayerCardsEnabled(true);
    }
    
    startGame() {
        window.gameViewController.event_resetSelfPlayerState();
        window.gameViewController.event_drawPlayerScores();
        this.startRound();
    }

    drawCards = function(num) {
        var cards = [];
        for (const i of Array(num).keys()) {
            cards.push(this.deck.cards.pop());
        }
        return cards;
    }
}
