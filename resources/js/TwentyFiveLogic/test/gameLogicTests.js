"use strict";

let deck = require('../deck.js');
let gameLogic = require('../gameLogic.js');
let assert = require('assert');

describe('Game Logic', function() {
    describe('getWinningCard', function() {
        it('should return the first card if a single card passed in', function() {
            let trumpCard = new deck.TrumpCard();
            let cards = [ new deck.Card() ];
            assert.equal(cards[0], gameLogic.getWinningCard(trumpCard, cards));
        });
    });
});