

class Player {
    constructor(name, isSelfPlayer = false) {
        this.name = name;
        this.id = "playerId_" + name;
        this.cards = [];
        this.score = 0;
        this.isSelfPlayer = isSelfPlayer;
        this.isDealer = false;
    }

    getName() {
        let dealerText = this.isDealer ? " (D)" : "";
        return this.name + dealerText;
    }

    playCard(cardName) {
        let cardIndex = this.cards.findIndex(card => card.cardName == cardName);
        if (cardIndex > -1) {
            let playedCard = this.cards[cardIndex];
            this.cards.splice(cardIndex, 1);
            return playedCard;
        }
        return this.cards[0];
    }

    aiPlayCard(playedCards) {
        let trumpCard = window.gameContext.trumpCard;
        let cardToPlay = getBestCardFromOptions(this.cards, trumpCard, playedCards);
        this.playCard(cardToPlay.cardName);
        return cardToPlay;
    }

    aiWillRobCard() {
        return Math.floor(Math.random() * 10) > 4;
    }

    aiSelectCardToDropForRob(trumpCard) {
        var card = this.cards[0];
        if (isAceOfTrumps(card, trumpCard)) {
            card = this.cards[1];
        }

        return card.cardName;
    }
}