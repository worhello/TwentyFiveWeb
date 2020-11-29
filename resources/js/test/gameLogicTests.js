"use strict";

let assert = require('assert');

let share = require('../share.js');

let gameLogicTestCases = require('./gameLogicTestCases.json');
let getBestCardTestCases = require('./getBestCardFromHandTestCases.json');
let canTrumpCardBeRobbedTestCases = require('./canTrumpCardBeRobbedTestCases.json');


let Card = share.Card;
let CardSuits = share.CardSuits;
let CardValues = share.CardValues;
let TrumpCard = share.TrumpCard;
let gameLogic = share.gameLogic;


function buildSuitFromString(suitAsString) {
    if (suitAsString == "clubs") {
        return CardSuits.clubs;
    } else if (suitAsString == "spades") {
        return CardSuits.spades;
    } else if (suitAsString == "diamonds") {
        return CardSuits.diamonds;
    } else {
        return CardSuits.hearts;
    }
}

function buildValueFromString(valueAsString) {
    if (valueAsString == "ace") {
        return CardValues.ace;
    } else if (valueAsString == "two") {
        return CardValues.two;
    } else  if (valueAsString == "three") {
        return CardValues.three;
    } else  if (valueAsString == "four") {
        return CardValues.four;
    } else  if (valueAsString == "five") {
        return CardValues.five;
    } else  if (valueAsString == "six") {
        return CardValues.six;
    } else  if (valueAsString == "seven") {
        return CardValues.seven;
    } else  if (valueAsString == "eight") {
        return CardValues.eight;
    } else  if (valueAsString == "nine") {
        return CardValues.nine;
    } else  if (valueAsString == "ten") {
        return CardValues.ten;
    } else  if (valueAsString == "jack") {
        return CardValues.jack;
    } else  if (valueAsString == "queen") {
        return CardValues.queen;
    } else  if (valueAsString == "king") {
        return CardValues.king;
    }
}

function buildDeckCardFromJSON(cardAsJson) {
    return new Card(buildSuitFromString(cardAsJson.suit), buildValueFromString(cardAsJson.value));
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
        assert.strictEqual("test test case", testCase.name);
        assert.strictEqual(0, testCase.expectedCardIndex);

        let playedCards = buildDeckCardsFromJSON(testCase.playedCards);
        assert.strictEqual(2, playedCards.length);

        let playedCard0 = playedCards[0];
        assert.strictEqual(CardSuits.clubs, playedCard0.suit);
        assert.strictEqual(CardValues.queen, playedCard0.value);

        let playedCard1 = playedCards[1];
        assert.strictEqual(CardSuits.spades, playedCard1.suit);
        assert.strictEqual(CardValues.queen, playedCard1.value);

        let trumpCard = buildDeckCardFromJSON(testCase.trumpCard);
        assert.strictEqual(CardSuits.diamonds, trumpCard.suit);
        assert.strictEqual(CardValues.two, trumpCard.value);
    });
});

describe('Game Logic - using JSON', function() {
    for (let testCase of gameLogicTestCases.testCases) {
        it(testCase.name, function() {
            let playedCards = buildDeckCardsFromJSON(testCase.playedCards);
            var trumpCard = new TrumpCard();
            trumpCard.card = buildDeckCardFromJSON(testCase.trumpCard);
            let expectedCard = playedCards[testCase.expectedCardIndex];
            let actualCard = gameLogic.getWinningCard(trumpCard, playedCards);
            assert.strictEqual(actualCard.suit, expectedCard.suit);
            assert.strictEqual(actualCard.value, expectedCard.value);
        });
    }
});

describe('Game Logic', function() {
    describe('getWinningCard', function() {
        it('should return a default Card if no cards passed in', function() {
            let trumpCard = new TrumpCard();
            let cards = [ new Card() ];
            assert.ok(gameLogic.getWinningCard(trumpCard, cards));
        });

        it('should return the first card if a single card passed in', function() {
            let trumpCard = new TrumpCard();
            let cards = [ new Card() ];
            let expectedCard = cards[0];
            let actualCard = gameLogic.getWinningCard(trumpCard, cards);
            assert.strictEqual(expectedCard.suit, actualCard.suit);
            assert.strictEqual(expectedCard.value, actualCard.value);
        });
    });
});

describe('Game Logic - getBestCardFromOptions - using JSON', function() {
    for (let testCase of getBestCardTestCases.testCases) {
        it(testCase.name, function() {
            let playedCards = buildDeckCardsFromJSON(testCase.playedCards);
            let cardOptions = buildDeckCardsFromJSON(testCase.cardOptions);
            var trumpCard = new TrumpCard();
            trumpCard.card = buildDeckCardFromJSON(testCase.trumpCard);
            let expectedCard = cardOptions[testCase.expectedCardIndex];
            let actualCard = gameLogic.getBestCardFromOptions(cardOptions, trumpCard, playedCards);
            assert.strictEqual(actualCard.suit, expectedCard.suit);
            assert.strictEqual(actualCard.value, expectedCard.value);
        });
    }
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
                let cardOptions = [ new Card() ];
                let expectedCard = cardOptions[0];
                let actualCard = gameLogic.getBestCardFromOptions(cardOptions);
                assert.strictEqual(expectedCard.suit, actualCard.suit);
                assert.strictEqual(expectedCard.value, actualCard.value);
            });
        });
    });
});

describe('Game Logic - canTrumpCardBeRobbed - using JSON', function() {
    for (let testCase of canTrumpCardBeRobbedTestCases.testCases) {
        it(testCase.name, function() {
            let playerHand = buildDeckCardsFromJSON(testCase.playerHand);
            let isDealer = testCase.isDealer;
            var trumpCard = new TrumpCard();
            trumpCard.card = buildDeckCardFromJSON(testCase.trumpCard);
            let expectedResult = testCase.expectedResult;
            let actualResult = gameLogic.canTrumpCardBeRobbed(playerHand, isDealer, trumpCard);
            assert.strictEqual(actualResult, expectedResult);
        });
    }
});
