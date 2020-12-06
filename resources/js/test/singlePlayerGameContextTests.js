"use strict";

let gameLogic = require('../gameLogic.js');
let singlePlayerGameContext = require('../singlePlayerGameContext.js');

let assert = require('assert');
let sinon = require('sinon');

class TestEventsHandler {
    constructor() {
        this.eventsToGameContext = [];
        this.eventsToViewController = [];
    }

    async sendEventToGameContext(eventName, eventDetails) {
        this.eventsToGameContext.push({ "eventName": eventName, "eventDetails": eventDetails });
    }
    
    async sendEventToViewController(eventName, eventDetails) {
        this.eventsToViewController.push({ "eventName": eventName, "eventDetails": eventDetails });
    }

    checkEventToViewControllerName(eventIndex, expectedEventName) {
        assert.strictEqual(this.eventsToViewController[eventIndex].eventName, expectedEventName);
    }
}

describe('SinglePlayerGameContext', function() {
    let testEventsHandler = new TestEventsHandler();

    var sortPlayersStub = sinon.stub(singlePlayerGameContext.SinglePlayerGameContext, 'sortPlayers');
    var shuffleDeckStub = sinon.stub(gameLogic.Deck, 'shuffleDeck');
    shuffleDeckStub.callsFake(function(cards) { cards.sort(function(a, b) { return a.value > b.value ? 1 : -1; }); });
    describe('run game - self starts', function() {
        sortPlayersStub.callsFake(function(players) {});
        let gameContext = new singlePlayerGameContext.SinglePlayerGameContext(testEventsHandler, 2, 0);
        if ('for tests, deck should be sorted by value', function() {
            let deck = gameContext.deck;
            assert.strictEqual(deck.cards[0].value, gameLogic.CardValues.ace);
            assert.strictEqual(deck.cards[1].value, gameLogic.CardValues.ace);
            assert.strictEqual(deck.cards[2].value, gameLogic.CardValues.ace);
            assert.strictEqual(deck.cards[3].value, gameLogic.CardValues.ace);
        });

        it('self player starts', async () => {
            await gameContext.startGame();

            assert.strictEqual(testEventsHandler.eventsToViewController.length, 9);
            testEventsHandler.checkEventToViewControllerName(0, 'resetSelfPlayerState');
            testEventsHandler.checkEventToViewControllerName(1, 'showSelfPlayerHand');
            testEventsHandler.checkEventToViewControllerName(2, 'setSelfPlayerCardsEnabled');
            testEventsHandler.checkEventToViewControllerName(3, 'resetPlayedCardsState');
            testEventsHandler.checkEventToViewControllerName(4, 'drawPlayedCardsPlaceholders');
            testEventsHandler.checkEventToViewControllerName(5, 'redrawTrumpCard');
            testEventsHandler.checkEventToViewControllerName(6, 'highlightCurrentPlayer');
            testEventsHandler.checkEventToViewControllerName(7, 'showSelfPlayerHand');
            testEventsHandler.checkEventToViewControllerName(8, 'setSelfPlayerCardsEnabled');
        });
    });

    describe('run game - other starts', function() {
        sortPlayersStub.callsFake(function(players) { players.reverse(); });
        let gameContext = new singlePlayerGameContext.SinglePlayerGameContext(testEventsHandler, 2, 0);
        it('other player starts', async () => {
            await gameContext.startGame();

            assert.strictEqual(testEventsHandler.eventsToViewController.length, 20);
            testEventsHandler.checkEventToViewControllerName(0, 'resetSelfPlayerState');
            testEventsHandler.checkEventToViewControllerName(1, 'showSelfPlayerHand');
            testEventsHandler.checkEventToViewControllerName(2, 'setSelfPlayerCardsEnabled');
            testEventsHandler.checkEventToViewControllerName(3, 'resetPlayedCardsState');
            testEventsHandler.checkEventToViewControllerName(4, 'drawPlayedCardsPlaceholders');
            testEventsHandler.checkEventToViewControllerName(5, 'redrawTrumpCard');
            testEventsHandler.checkEventToViewControllerName(6, 'highlightCurrentPlayer');
            testEventsHandler.checkEventToViewControllerName(7, 'showSelfPlayerHand');
            testEventsHandler.checkEventToViewControllerName(8, 'setSelfPlayerCardsEnabled');
            testEventsHandler.checkEventToViewControllerName(9, 'resetSelfPlayerState');
            testEventsHandler.checkEventToViewControllerName(10, 'showSelfPlayerHand');
            testEventsHandler.checkEventToViewControllerName(11, 'setSelfPlayerCardsEnabled');
            testEventsHandler.checkEventToViewControllerName(12, 'resetPlayedCardsState');
            testEventsHandler.checkEventToViewControllerName(13, 'drawPlayedCardsPlaceholders');
            testEventsHandler.checkEventToViewControllerName(14, 'redrawTrumpCard');
            testEventsHandler.checkEventToViewControllerName(15, 'highlightCurrentPlayer');
            testEventsHandler.checkEventToViewControllerName(16, 'playCard');
            testEventsHandler.checkEventToViewControllerName(17, 'highlightCurrentPlayer');
            testEventsHandler.checkEventToViewControllerName(18, 'showSelfPlayerHand');
            testEventsHandler.checkEventToViewControllerName(19, 'setSelfPlayerCardsEnabled');
        });
    });
});