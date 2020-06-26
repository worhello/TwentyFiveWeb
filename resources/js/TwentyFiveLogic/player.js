

class Player {
    constructor(name, isSelfPlayer = false) {
        this.name = name;
        //Just adding the ID for now, to make it available in the rest of the app
        this.id = "playerId_" + name;
        this.cards = [];
        this.score = 0;
        this.isSelfPlayer = isSelfPlayer;
    }

    playCard = function(cardName) {
        let cardIndex = this.cards.findIndex(card => card.cardName == cardName);
        if (cardIndex > -1) {
            let playedCard = this.cards[cardIndex];
            this.cards.splice(cardIndex, 1);
            return playedCard;
        }
        return this.cards[0];
    }

    aiPlayCard = function(playedCards) {
        let trumpCard = window.gameContext.trumpCard;
        let cardToPlay = getBestCardFromOptions(this.cards, trumpCard, playedCards);
        this.playCard(cardToPlay.cardName);
        return cardToPlay;
    }
}