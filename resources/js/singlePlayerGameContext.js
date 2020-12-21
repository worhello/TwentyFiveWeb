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

class SinglePlayerGameContext {
    constructor(eventsHandler, numPlayers, cardDisplayDelay, isTutorial) {
        this.gameLogic = getGameLogicModule();
        this.eventsHandler = eventsHandler;
        this.deck = new this.gameLogic.Deck();
        this.players = this.setupPlayers(numPlayers, !isTutorial);
        this.trumpCard = new this.gameLogic.TrumpCard();
        this.selfPlayer = this.players.find(p => p.isSelfPlayer == true );
        this.cardDisplayDelay = cardDisplayDelay;
        this.roundPlayerAndCards = [];
        this.currentWinningPlayerAndCard = {};

        this.isTutorial = isTutorial;
        this.tutorialDeckSorted = false;
        this.tutorialDealerSet = false;
        this.tutorialPlayCount = 0;
    }

    static sortPlayers(players) {
        players.sort(function() {
            return .5 - Math.random();
        });
    }
    
    setupPlayers(numPlayers, sortPlayers) {
        var players = [];
    
        let playerModule = getPlayerModule();
    
        players.push(new playerModule.Player("You", true));
        for (var i = 1; i < numPlayers; i++) {
            players.push(new playerModule.Player("player_" + i));
        }

        if (sortPlayers) {
            SinglePlayerGameContext.sortPlayers(players);
        }

        return players;
    }

    async sleepFor(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async defaultSleep() {
        if (this.cardDisplayDelay > 0) {
            await this.sleepFor(this.cardDisplayDelay);
        }
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

    getTutorialWinningReasonMessage() {
        // TODO move these to the localisation manager / tutorial manager
        if (this.tutorialPlayCount === 1) {
            return "You won because you both played Diamonds, where higher values are better";
        }
        else if (this.tutorialPlayCount === 2) {
            return "You lost because you both played Spades, where lower values are better";
        }
        else if (this.tutorialPlayCount === 3) {
            return "You won because you both played Clubs, where lower values are better";
        }
        else if (this.tutorialPlayCount === 4) {
            return "You lost because you both played Hearts, where higher values are better";
        }
        else if (this.tutorialPlayCount === 5) {
            return "You won because you played a card of the Trumps suit vs a non-Trumps card";
        }
        else if (this.tutorialPlayCount === 6) {
            return "You won because the Five of Trumps is the best card in the game";
        }
        else if (this.tutorialPlayCount === 7) {
            return "You lost because you did not play the Jack or Five of Trumps against the Ace of Hearts, which is ALWAYS the third best card in the deck";
        }
        else if (this.tutorialPlayCount === 8) {
            return "You lost because you did not play the same suit as the first card";
        }
        else if (this.tutorialPlayCount === 9) {
            return "You won because you played a picture card against a normal numbered card (e.g. not Five of Trumps)";
        }
        else if (this.tutorialPlayCount === 10) {
            return "You won because the other player did not play Trumps against your Trumps card";
        }

        return "This is a tutorial message from the game context";
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

        let gameContext = this;
        let continueFunc = async function() {
            let orderedPlayers = gameContext.getSortedListOfPlayers();
            if (winnerWithHighestScore.score >= 25) {
                await gameContext.eventsHandler.sendEventToViewController('showGameEndScreen', { "sortedPlayers": orderedPlayers });
            }
            else if (gameContext.mustDealNewCards()) {
                await gameContext.eventsHandler.sendEventToViewController('showEndOfHandStats', { "sortedPlayers": orderedPlayers });
            }
            else {
                gameContext.startNextRound(winningPlayerId);
            }
        };

        if (this.isTutorial) {
            this.tutorialPlayCount++;
            await this.eventsHandler.sendEventToViewController('showTutorialWinningReason', { "winningReasonMessage": this.getTutorialWinningReasonMessage(), "continueFunc": continueFunc });
        }
        else {
            await continueFunc();
        }
    }

    startNextRound(startingPlayerId) {
        this.rotatePlayersArray(startingPlayerId);
        this.startRound();
    }

    getSelfPlayerIndex() {
        return this.players.findIndex(p => p.isSelfPlayer == true);
    }

    updateCurrentWinningCard(currentMove) {
        let currentWinningCard = this.gameLogic.getWinningCard(this.trumpCard, this.getPlayedCards());
        if (!this.currentWinningPlayerAndCard.card || !this.gameLogic.isSameCard(this.currentWinningPlayerAndCard.card, currentWinningCard)) { // is new card
            this.currentWinningPlayerAndCard = currentMove;
            return true;
        }
        return false;
    }

    async playCardAsync(player, playedCard) {
        let currentMove = { "player": player, "card": playedCard };
        await this.eventsHandler.sendEventToViewController('playCard', { "player": player, "playedCard": playedCard });

        this.roundPlayerAndCards.push(currentMove);
        if (this.updateCurrentWinningCard(currentMove)) {
            await this.eventsHandler.sendEventToViewController('updateCurrentWinningCard', { "player": player, "card": playedCard });
        }

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
            if (this.isTutorial) {
                // always play the first card
                await this.playCardAsync(player, player.playCard(player.cards[0].cardName));
            } else {
                await this.playCardAsync(player, player.aiPlayCard(playedCards, this.trumpCard));
            }
        }
    }

    async playCardsAfterSelfAsync() {
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
        await this.updateAndShowSelfPlayerEnabledCards(false);
        await this.playCardAsync(this.selfPlayer, playedCard);

        await this.playCardsAfterSelfAsync();
    }

    sortDeckForTutorial() {
        let gameLogic = this.gameLogic;
        let cardsToFindAndReplace = [
            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.seven),
            new gameLogic.Card(gameLogic.CardSuits.spades,   gameLogic.CardValues.three),
            new gameLogic.Card(gameLogic.CardSuits.clubs,    gameLogic.CardValues.ace  ),
            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.six  ),
            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.three),

            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.four ),
            new gameLogic.Card(gameLogic.CardSuits.spades,   gameLogic.CardValues.two  ),
            new gameLogic.Card(gameLogic.CardSuits.clubs,    gameLogic.CardValues.ten  ),
            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.seven),
            new gameLogic.Card(gameLogic.CardSuits.clubs,    gameLogic.CardValues.three),

            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.four ),

            new gameLogic.Card(gameLogic.CardSuits.clubs,    gameLogic.CardValues.nine ),
            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.five ),
            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.ten  ),
            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.king ),
            new gameLogic.Card(gameLogic.CardSuits.spades,   gameLogic.CardValues.queen),

            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.jack ),
            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.ace  ),
            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.queen),
            new gameLogic.Card(gameLogic.CardSuits.spades,   gameLogic.CardValues.four ),
            new gameLogic.Card(gameLogic.CardSuits.hearts,   gameLogic.CardValues.jack ),

            new gameLogic.Card(gameLogic.CardSuits.diamonds, gameLogic.CardValues.ace  )
        ];

        for (var i = 0; i < cardsToFindAndReplace.length; i++) {
            let deckIndex = 51 - i;
            let cardIndex = this.deck.cards.findIndex(function(card) { return gameLogic.isSameCard(card, cardsToFindAndReplace[i]); } );
            var tmp = this.deck.cards[deckIndex];
            this.deck.cards[deckIndex] = this.deck.cards[cardIndex];
            this.deck.cards[cardIndex] = tmp;
        }
    }

    resetDeckIfNeeded() {
        let numCardsNeeded = (this.players.length * 5) + 1;
        if (this.deck.cards.length < numCardsNeeded) {
            this.deck = new Deck();
        }

        if (this.isTutorial && this.tutorialDeckSorted === false) {
            this.tutorialDeckSorted = true;
            this.sortDeckForTutorial();
        }
    }

    rotateDealer() {
        var dealerIndex = this.players.findIndex(p => p.isDealer === true);
        if (dealerIndex == -1) {
            dealerIndex = this.players.length - 2;
        } else {
            this.players[dealerIndex].isDealer = false;
        }
        if (this.isTutorial && this.tutorialDealerSet === false) {
            // other player is dealer first
            this.tutorialDealerSet = true;
            dealerIndex = (this.getSelfPlayerIndex() + 1) % this.players.length; 
        }
        else {
            dealerIndex = (dealerIndex + 1) % this.players.length;
        }
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
        await this.updateAndShowSelfPlayerEnabledCards(false);

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
            await this.updateAndShowSelfPlayerEnabledCards(false);
            this.trumpCard = new this.gameLogic.TrumpCard();
            this.trumpCard.card = this.drawCard();

            let canBeRobbedBySelfPlayer = this.attemptRobForEachPlayer();
            if (canBeRobbedBySelfPlayer) {
                await this.eventsHandler.sendEventToViewController('showSelfPlayerRobbingDialog', { "trumpCard": this.trumpCard, "skipButtonDisabled": this.isTutorial });
                return;
            }
        }

        await this.eventsHandler.sendEventToViewController('setupInitialState', { "isSelfPlayerCardsEnabled": false, "players": this.players, "trumpCard": this.trumpCard });

        await this.playCardsBeforeSelf();

        await this.highlightCurrentPlayer(this.selfPlayer);
        await this.updateAndShowSelfPlayerEnabledCards(true);
    }
    
    async updateAndShowSelfPlayerEnabledCards(selfPlayerCardsEnabled) {
        let playedCards = this.getPlayedCards();
        if (this.isTutorial) {
            for (var card of this.selfPlayer.cards) {
                card.canPlay = false;
            }
            if (this.selfPlayer.cards.length > 0) {
                this.selfPlayer.cards[0].canPlay = true;
            }
        } else {
            this.gameLogic.updatePlayerCardsEnabledState(playedCards, this.selfPlayer.cards, this.trumpCard);
        }
        await this.eventsHandler.sendEventToViewController('showSelfPlayerHand', { "selfPlayer": this.selfPlayer, "isEnabled": selfPlayerCardsEnabled });
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
        for (var i = 0; i < num; i++) {
            cards.push(this.drawCard());
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