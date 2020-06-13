

class Player {
    constructor(name) {
        this.name = name;
        this.cards = [];
        this.score = 0;
    }

    playCard = function(cardName) {
        let cardIndex = this.cards.findIndex(card => card.cardName == cardName);
        if (cardIndex > -1) {
            this.cards.splice(cardIndex, 1);
        }
    }

    aiPlayCard = function() {
        // TODO - use context
        let context = window.context;
        let cardToPlay = this.cards[0];
        this.playCard(cardToPlay.cardName);
        return cardToPlay;
    }
}