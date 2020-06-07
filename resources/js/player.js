

class Player {
    constructor(name) {
        this.name = name;
        this.cards = [];
        this.score = 0;
    }

    playCard = function() {
        // TODO - use context
        let context = window.context;
        return this.cards.pop();
    }
}