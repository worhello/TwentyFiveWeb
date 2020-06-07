"use strict";

const CardSuits = {
    "hearts" : 0,
    "diamonds" : 1,
    "clubs" : 2,
    "spades" : 3
};
Object.freeze(CardSuits);

const CardValues = {
    "ace" : 1,
    "2" : 2,
    "3" : 3,
    "4" : 4,
    "5" : 5,
    "6" : 6,
    "7" : 7,
    "8" : 8,
    "9" : 9,
    "10" : 10,
    "jack" : 11,
    "queen" : 12,
    "king" : 13,
};
Object.freeze(CardValues);

function buildCardName(s, v) {
    return v + "_of_" + s;
}

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
        this.cardName = buildCardName(suit, value);
    }
}

function buildDeck() {
    var cards = [];
    for (let [s, _] of Object.entries(CardSuits)) {
        for (let [v, _1] of Object.entries(CardValues)) {
            cards.push(new Card(s, v));
        }
    }
    return cards;
}

class Deck {
    constructor() {
        this.cards = buildDeck();
        this.cards.sort(function() {
            return .5 - Math.random();
        });
    }
}
