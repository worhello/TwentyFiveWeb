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
        let gameContext = new singlePlayerGameContext.SinglePlayerGameContext(testEventsHandler, 2, 0, false);
        if ('for tests, deck should be sorted by value', function() {
            let deck = gameContext.deck;
            assert.strictEqual(deck.cards[0].value, gameLogic.CardValues.ace);
            assert.strictEqual(deck.cards[1].value, gameLogic.CardValues.ace);
            assert.strictEqual(deck.cards[2].value, gameLogic.CardValues.ace);
            assert.strictEqual(deck.cards[3].value, gameLogic.CardValues.ace);
        });

        it('self player starts', async () => {
            await gameContext.startGame();

            assert.strictEqual(gameContext.players[0].isDealer, false);
            assert.strictEqual(gameContext.players[1].isDealer, true);
            assert.strictEqual(gameContext.players[0].isSelfPlayer, true);
            assert.strictEqual(gameContext.players[1].isSelfPlayer, false);

            assert.strictEqual(testEventsHandler.eventsToViewController.length, 5);
            testEventsHandler.checkEventToViewControllerName(0, 'resetSelfPlayerState');
            testEventsHandler.checkEventToViewControllerName(1, 'showSelfPlayerHand');
            testEventsHandler.checkEventToViewControllerName(2, 'setupInitialState');
            testEventsHandler.checkEventToViewControllerName(3, 'highlightCurrentPlayer');
            testEventsHandler.checkEventToViewControllerName(4, 'showSelfPlayerHand');
        });
    });
    
    describe('run game - other starts', function() {
        sortPlayersStub.callsFake(function(players) { players.reverse(); });
        let gameContext = new singlePlayerGameContext.SinglePlayerGameContext(testEventsHandler, 2, 0, false);
        it('other player starts', async () => {
            await gameContext.startGame();
            
            assert.strictEqual(gameContext.players[0].isDealer, false);
            assert.strictEqual(gameContext.players[1].isDealer, true);
            assert.strictEqual(gameContext.players[0].isSelfPlayer, false);
            assert.strictEqual(gameContext.players[1].isSelfPlayer, true);
            
            assert.strictEqual(testEventsHandler.eventsToViewController.length, 13);
            testEventsHandler.checkEventToViewControllerName(0, 'resetSelfPlayerState');
            testEventsHandler.checkEventToViewControllerName(1, 'showSelfPlayerHand');
            testEventsHandler.checkEventToViewControllerName(2, 'setupInitialState');
            testEventsHandler.checkEventToViewControllerName(3, 'highlightCurrentPlayer');
            testEventsHandler.checkEventToViewControllerName(4, 'showSelfPlayerHand');
            testEventsHandler.checkEventToViewControllerName(5, 'resetSelfPlayerState');
            testEventsHandler.checkEventToViewControllerName(6, 'showSelfPlayerHand');
            testEventsHandler.checkEventToViewControllerName(7, 'setupInitialState');
            testEventsHandler.checkEventToViewControllerName(8, 'highlightCurrentPlayer');
            testEventsHandler.checkEventToViewControllerName(9, 'playCard');
            testEventsHandler.checkEventToViewControllerName(10, 'updateCurrentWinningCard');
            testEventsHandler.checkEventToViewControllerName(11, 'highlightCurrentPlayer');
            testEventsHandler.checkEventToViewControllerName(12, 'showSelfPlayerHand');
        });
    });
});