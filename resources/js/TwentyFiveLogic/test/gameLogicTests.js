"use strict";

let gameLogic = require('../gameLogic.js');
let deck = gameLogic.deck;
let assert = require('assert');

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

        describe('two cards played', function() {
            describe('neither of the cards are trumps', function() {
                let trumpCard = new deck.TrumpCard();
                describe('different suits', function() {
                    let cardValue = deck.CardValues.queen;
                    describe('play clubs first', function() {
                        it('should return the first card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.clubs, cardValue), new deck.Card(deck.CardSuits.spades, cardValue) ];
                            assert.equal(cards[0], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                    describe('play spades first', function() {
                        it('should return the first card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.spades, cardValue), new deck.Card(deck.CardSuits.clubs, cardValue) ];
                            assert.equal(cards[0], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                    describe('play hearts first', function() {
                        it('should return the first card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.hearts, cardValue), new deck.Card(deck.CardSuits.clubs, cardValue) ];
                            assert.equal(cards[0], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                    describe('play diamonds first', function() {
                        it('should return the first card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.diamonds, cardValue), new deck.Card(deck.CardSuits.clubs, cardValue) ];
                            assert.equal(cards[0], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                });

                describe('same suits - picture cards (higher value is better)', function() {
                    let queenVal = deck.CardValues.queen;
                    let kingVal = deck.CardValues.king;
                    describe('clubs', function() {
                        it('should return the second card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.clubs, queenVal), new deck.Card(deck.CardSuits.clubs, kingVal) ];
                            assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                    describe('spades', function() {
                        it('should return the second card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.spades, queenVal), new deck.Card(deck.CardSuits.spades, kingVal) ];
                            assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                    describe('hearts', function() {
                        it('should return the second card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.hearts, queenVal), new deck.Card(deck.CardSuits.hearts, kingVal) ];
                            assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                    describe('diamonds', function() {
                        it('should return the second card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.diamonds, queenVal), new deck.Card(deck.CardSuits.diamonds, kingVal) ];
                            assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                });
                describe('same suits - number cards', function() {
                    let highVal = deck.CardValues.ten;
                    let lowVal = deck.CardValues.two;
                    describe('clubs (lower values are better)', function() {
                        it('should return the second card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.clubs, lowVal), new deck.Card(deck.CardSuits.clubs, highVal) ];
                            assert.equal(cards[0], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                     describe('spades (lower values are better)', function() {
                         it('should return the second card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.spades, lowVal), new deck.Card(deck.CardSuits.spades, highVal) ];
                            assert.equal(cards[0], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                     describe('hearts (higher values are better)', function() {
                         it('should return the second card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.hearts, lowVal), new deck.Card(deck.CardSuits.hearts, highVal) ];
                            assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                    describe('diamonds (higher values are better)', function() {
                        it('should return the second card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.diamonds, lowVal), new deck.Card(deck.CardSuits.diamonds, highVal) ];
                            assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                });

                describe('same suits - number vs picture cards', function() {
                    let highVal = deck.CardValues.queen;
                    let lowVal = deck.CardValues.two;
                    describe('clubs', function() {
                        it('should return the second card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.clubs, lowVal), new deck.Card(deck.CardSuits.clubs, highVal) ];
                            assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                     describe('spades', function() {
                         it('should return the second card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.spades, lowVal), new deck.Card(deck.CardSuits.spades, highVal) ];
                            assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                     describe('hearts', function() {
                         it('should return the second card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.hearts, lowVal), new deck.Card(deck.CardSuits.hearts, highVal) ];
                            assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                    describe('diamonds', function() {
                        it('should return the second card', function() {
                            let cards = [ new deck.Card(deck.CardSuits.diamonds, lowVal), new deck.Card(deck.CardSuits.diamonds, highVal) ];
                            assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                        });
                    });
                });
            });

            describe('first card played is trumps', function() {
                var trumpCard = new deck.TrumpCard();
                let cardValue = deck.CardValues.queen;
                describe('clubs are trumps', function() {
                    it('should return the first card', function() {
                        trumpCard.card = new deck.Card(deck.CardSuits.clubs, deck.CardValues.two);
                        let cards = [ new deck.Card(deck.CardSuits.clubs, cardValue), new deck.Card(deck.CardSuits.spades, cardValue) ];
                        assert.equal(cards[0], gameLogic.getWinningCard(trumpCard, cards));
                    });
                });
                describe('spades are trumps', function() {
                    it('should return the first card', function() {
                        trumpCard.card = new deck.Card(deck.CardSuits.spades, deck.CardValues.two);
                        let cards = [ new deck.Card(deck.CardSuits.spades, cardValue), new deck.Card(deck.CardSuits.clubs, cardValue) ];
                        assert.equal(cards[0], gameLogic.getWinningCard(trumpCard, cards));
                    });
                });
                describe('hearts are trumps', function() {
                    it('should return the first card', function() {
                        trumpCard.card = new deck.Card(deck.CardSuits.hearts, deck.CardValues.two);
                        let cards = [ new deck.Card(deck.CardSuits.hearts, cardValue), new deck.Card(deck.CardSuits.clubs, cardValue) ];
                        assert.equal(cards[0], gameLogic.getWinningCard(trumpCard, cards));
                    });
                });
                describe('diamonds are trumps', function() {
                    it('should return the first card', function() {
                        trumpCard.card = new deck.Card(deck.CardSuits.diamonds, deck.CardValues.two);
                        let cards = [ new deck.Card(deck.CardSuits.diamonds, cardValue), new deck.Card(deck.CardSuits.clubs, cardValue) ];
                        assert.equal(cards[0], gameLogic.getWinningCard(trumpCard, cards));
                    });
                });
            });

            describe('second card played is trumps', function() {
                var trumpCard = new deck.TrumpCard();
                let cardValue = deck.CardValues.queen;
                describe('clubs are trumps', function() {
                    it('should return the second card', function() {
                        trumpCard.card = new deck.Card(deck.CardSuits.clubs, deck.CardValues.two);
                        let cards = [ new deck.Card(deck.CardSuits.spades, cardValue), new deck.Card(deck.CardSuits.clubs, cardValue) ];
                        assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                    });
                });
                describe('spades are trumps', function() {
                    it('should return the second card', function() {
                        trumpCard.card = new deck.Card(deck.CardSuits.spades, deck.CardValues.two);
                        let cards = [ new deck.Card(deck.CardSuits.clubs, cardValue), new deck.Card(deck.CardSuits.spades, cardValue) ];
                        assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                    });
                });
                describe('hearts are trumps', function() {
                    it('should return the second card', function() {
                        trumpCard.card = new deck.Card(deck.CardSuits.hearts, deck.CardValues.two);
                        let cards = [ new deck.Card(deck.CardSuits.clubs, cardValue), new deck.Card(deck.CardSuits.hearts, cardValue) ];
                        assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                    });
                });
                describe('diamonds are trumps', function() {
                    it('should return the second card', function() {
                        trumpCard.card = new deck.Card(deck.CardSuits.diamonds, deck.CardValues.two);
                        let cards = [ new deck.Card(deck.CardSuits.clubs, cardValue), new deck.Card(deck.CardSuits.diamonds, cardValue) ];
                        assert.equal(cards[1], gameLogic.getWinningCard(trumpCard, cards));
                    });
                });
            });

            describe('both cards are trumps', function() {
                //
            });
        });
    });
});