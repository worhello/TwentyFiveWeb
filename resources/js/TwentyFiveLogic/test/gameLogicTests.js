"use strict";

let gameLogic = require('../gameLogic.js');
let deck = gameLogic.deck;
let testCases = require('./gameLogicTestCases.json');
let assert = require('assert');

function buildSuitFromString(suitAsString) {
    if (suitAsString == "clubs") {
        return deck.CardSuits.clubs;
    } else if (suitAsString == "spades") {
        return deck.CardSuits.spades;
    } else if (suitAsString == "diamonds") {
        return deck.CardSuits.diamonds;
    } else {
        return deck.CardSuits.hearts;
    }
}

function buildValueFromString(valueAsString) {
    if (valueAsString == "ace") {
        return deck.CardValues.ace;
    } else if (valueAsString == "two") {
        return deck.CardValues.two;
    } else  if (valueAsString == "three") {
        return deck.CardValues.three;
    } else  if (valueAsString == "four") {
        return deck.CardValues.four;
    } else  if (valueAsString == "five") {
        return deck.CardValues.five;
    } else  if (valueAsString == "six") {
        return deck.CardValues.six;
    } else  if (valueAsString == "seven") {
        return deck.CardValues.seven;
    } else  if (valueAsString == "eight") {
        return deck.CardValues.eight;
    } else  if (valueAsString == "nine") {
        return deck.CardValues.nine;
    } else  if (valueAsString == "ten") {
        return deck.CardValues.ten;
    } else  if (valueAsString == "jack") {
        return deck.CardValues.jack;
    } else  if (valueAsString == "queen") {
        return deck.CardValues.queen;
    } else  if (valueAsString == "king") {
        return deck.CardValues.king;
    }
}

function buildDeckCardFromJSON(cardAsJson) {
    return new deck.Card(buildSuitFromString(cardAsJson.suit), buildValueFromString(cardAsJson.value));
}

function buildDeckCardsFromJSON(cardsAsJsonArray) {
    var cards = [];
    for (let cardAsJson of cardsAsJsonArray) {
        cards.push(buildDeckCardFromJSON(cardAsJson));
    }
    return cards;
}

// this is only needed because I want the same test cases across two languages
// (yes I like making things extra complicated for no reason!)
describe('parse test JSON test', function() {
    let testJson = {
        "testCases": [
            {
                "name": "test test case",
                "playedCards": [
                    {
                        "suit": "clubs",
                        "value": "queen"
                    },
                    {
                        "suit": "spades",
                        "value": "queen"
                    }
                ],
                "trumpCard": {
                    "suit": "diamonds",
                    "value": "two"
                },
                "expectedCardIndex": 0
            }
        ]
    };
    it ('should match test input', function() {
        let testCase = testJson.testCases[0];
        assert.equal("test test case", testCase.name);
        assert.equal(0, testCase.expectedCardIndex);

        let playedCards = buildDeckCardsFromJSON(testCase.playedCards);
        assert.equal(2, playedCards.length);

        let playedCard0 = playedCards[0];
        assert.equal(deck.CardSuits.clubs, playedCard0.suit);
        assert.equal(deck.CardValues.queen, playedCard0.value);

        let playedCard1 = playedCards[1];
        assert.equal(deck.CardSuits.spades, playedCard1.suit);
        assert.equal(deck.CardValues.queen, playedCard1.value);

        let trumpCard = buildDeckCardFromJSON(testCase.trumpCard);
        assert.equal(deck.CardSuits.diamonds, trumpCard.suit);
        assert.equal(deck.CardValues.two, trumpCard.value);
    });
})

describe('Game Logic - using JSON', function() {
    for (let testCase of testCases.testCases) {
        it(testCase.name, function() {
            let playedCards = buildDeckCardsFromJSON(testCase.playedCards);
            var trumpCard = new deck.TrumpCard();
            trumpCard.card = buildDeckCardFromJSON(testCase.trumpCard);
            assert.equal(playedCards[testCase.expectedCardIndex], gameLogic.getWinningCard(trumpCard, playedCards));
        });
    }
});

describe('Game Logic', function() {
    describe('getWinningCard', function() {
        it('should return a default Card if no cards passed in', function() {
            let trumpCard = new deck.TrumpCard();
            let cards = [ new deck.Card() ];
            assert.ok(gameLogic.getWinningCard(trumpCard, cards));
        });

        it('should return the first card if a single card passed in', function() {
            let trumpCard = new deck.TrumpCard();
            let cards = [ new deck.Card() ];
            assert.equal(cards[0], gameLogic.getWinningCard(trumpCard, cards));
        });
    });
});

describe('Game Logic (Client only)', function() {
    describe('getBestCardFromOptions', function() {
        describe('no cards available', function() {
            it('should not crash', function() {
                assert.ok(gameLogic.getBestCardFromOptions([]));
            });
        });
        describe('one card available', function() {
            it('should return the first card', function() {
                let cardOptions = [ new deck.Card() ];
                assert.equal(cardOptions[0], gameLogic.getBestCardFromOptions(cardOptions));
            });
        });
        describe('no cards played', function() {
            it('should play the first card', function() {
                let cardOptions = [ new deck.Card() ];
                assert.equal(cardOptions[0], gameLogic.getBestCardFromOptions(cardOptions, {}, []));
            });
        });
        describe('one card played', function() {
            var trumpCard = new deck.TrumpCard();
            trumpCard.card = new deck.Card(deck.CardSuits.diamonds, deck.CardValues.eight);
            let availableNormalCard = new deck.Card(deck.CardSuits.hearts, deck.CardValues.eight);
            let availableOtherCard = new deck.Card(deck.CardSuits.spades, deck.CardValues.eight);
            let availableTrumpCard = new deck.Card(deck.CardSuits.diamonds, deck.CardValues.nine);
            let playedNormalCard = new deck.Card(deck.CardSuits.hearts, deck.CardValues.eight);
            let playedTrumpCard = new deck.Card(deck.CardSuits.diamonds, deck.CardValues.seven);

            let playedCards = [ new deck.Card(deck.CardSuits.hearts, deck.CardValues.two) ];
            describe('no cards of that suit and no trumps available', function () {
                it ('should return the first card', function() {
                    let cardOptions = [ availableOtherCard ];
                    assert.equal(cardOptions[0], gameLogic.getBestCardFromOptions(cardOptions, trumpCard, playedCards));
                });
            });
            describe('one card of that suit and no trumps available', function () {
                it ('should return the card of played suit', function() {
                    let cardOptions = [ availableOtherCard, availableNormalCard ];
                    assert.equal(cardOptions[1], gameLogic.getBestCardFromOptions(cardOptions, trumpCard, playedCards));
                });
            });
            describe('no cards of that suit and one trump card available', function () {
                it ('should return the trump card', function() {
                    let cardOptions = [ availableOtherCard, availableTrumpCard ];
                    assert.equal(cardOptions[1], gameLogic.getBestCardFromOptions(cardOptions, trumpCard, playedCards));
                });
            });
            describe('played card is trumps', function() {
                it('should return the only trump card', function() {
                    let playedCardsTrumps = [ new deck.Card(deck.CardSuits.diamonds, deck.CardValues.six) ];
                    let cardOptions = [ availableOtherCard, availableNormalCard, availableTrumpCard ];
                    assert.equal(cardOptions[2], gameLogic.getBestCardFromOptions(cardOptions, trumpCard, playedCardsTrumps));
                });
            });
        })
    });
});
