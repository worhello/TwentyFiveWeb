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

function waitForCardsToBeRendered() {
    window.setTimeout(function() {
        if (allPlayedCardsVisible()) {
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

class GameContext {
    constructor(numPlayers) {
        this.deck = new Deck();
        this.players = setupPlayers(numPlayers);
        this.trumpCard = new TrumpCard();
        this.selfPlayer = getSelfPlayer(this.players);
    }

    dealAllPlayerCards() {
        if (this.deck.cards.length === 0) {
            this.deck = new Deck();
        }

        this.players.forEach(function(player) {
            player.cards = window.gameContext.drawCards(5);
        });
    }

    getBestCard(cards) {
        //TODO
        return cards[0];
    }

    rotatePlayersArray(lastRoundWinningPlayer) {
        //TODO
    }

    evaluateRoundEnd() {
        let playersAndCards = getPlayedCards();
        let playedCards = playersAndCards.map(pAC => pAC.card);
        let winningCard = this.getBestCard(playedCards);
        let winningPlayerName = playersAndCards.find(function (pAC) { return pAC.card == winningCard }).playerName;
        this.players.find(function (p) { return p.name == winningPlayerName }).score += 5;

        redrawPlayerScores();

        var winnerWithHighestScore = this.players[0];
        this.players.map(function(p) {
            if (p.score > winnerWithHighestScore.score) {
                winnerWithHighestScore = p;
            }
        });

        //if (winnerWithHighestScore.score >= 25) {
        if (winnerWithHighestScore.score >= 30) {
            window.alert(winnerWithHighestScore.name + " won!");
            resetPlayedCardsState();
            resetSelfPlayerState();
        } else {
            // start next round
            //window.alert(winnerWithHighestScore.name + " has highest score but didn't win, starting next round");
            this.rotatePlayersArray(winnerWithHighestScore);
            this.startRound();
        }
    }

    playCardsBeforeSelf() {
        for (let player of this.players) {
            if (player.name == "You") {
                break;
            }
            playCard(player.name, player.aiPlayCard());
        }
    }

    playCardsAfterSelf() {
        let selfPlayerIndex = this.players.findIndex(p => p.name == "You");
        if (selfPlayerIndex >= 0) {
            for (var i = selfPlayerIndex + 1; i < this.players.length; i++) {
                let player = this.players[i];
                playCard(player.name, player.aiPlayCard());
            }
        }

        waitForCardsToBeRendered();
    }
    startRound() {
        if (this.selfPlayer.cards.length == 0) {
            this.dealAllPlayerCards();
            showSelfPlayerHand();
        }

        this.trumpCard.card = this.drawCards(1)[0];
        this.trumpCard.hasBeenStolen = false;
        redrawTrumpCard();

        resetPlayedCardsState();
        drawPlayedCardsPlaceholders();

        this.playCardsBeforeSelf();
    }
    
    startGame() {
        resetSelfPlayerState();
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
}
