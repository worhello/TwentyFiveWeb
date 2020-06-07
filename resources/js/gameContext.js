"use strict";

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

class GameContext {
    constructor(numPlayers) {
        this.deck = new Deck();
        this.players = setupPlayers(numPlayers);
    }

    dealAllPlayerCards() {
        this.deck = new Deck();
        this.players.forEach(function(player) {
            player.cards = window.gameContext.drawCards(5);
        });
    }

    getBestCard(cards) {
        //TODO
        return cards[0];
    }

    evaluateRoundEnd() {
        let playersAndCards = getPlayedCards();
        let playedCards = playersAndCards.map(pAC => pAC.card);
        let winningCard = this.getBestCard(playedCards);
        let winningPlayerName = playersAndCards.find(function (pAC) { return pAC.card == winningCard }).playerName;
        this.players.find(function (p) { return p.name == winningPlayerName }).score += 5;

        redrawPlayerScores();

        let highestPlayerScore = Math.max.apply(Math, this.players.map(function(p) { return p.score; }));
        if (highestPlayerScore >= 25) {
            window.alert("someone won");
        } else {
            // start next round
            window.alert("someone didn't win");
            this.startRound();
        }
    }

    playCardsBeforeSelf() {
        for (let player of this.players) {
            if (player.name == "You") {
                break;
            }
            playCard(player.name, player.playCard());
        }
    }

    playCardsAfterSelf() {
        var played = true;
        for (let player of this.players) {
            if (!played) {
                playCard(player.name, player.playCard());
            }
            if (player.name == "You") {
                played = false; // works for the next one
            }
        }

        this.evaluateRoundEnd();
    }

    startRound() {
        if (this.getSelfPlayer().cards.length == 0) {
            this.dealAllPlayerCards();
        }

        resetPlayedCardsState();

        showSelfPlayerHand();

        this.playCardsBeforeSelf();
    }
    
    startGame() {
        redrawPlayerScores();
        this.startRound();
    }

    drawCards = function(num) {
        var cards = [];
        for (const i of Array(num).keys()) {
            cards.push(this.deck.cards.pop());
        }
        return cards;
    }

    getSelfPlayer = function() {
        return this.players.find(function(p) {
            return p.name == "You";
        });
    }
}
