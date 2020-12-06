"use strict";

let singlePlayerGameContext = require('../singlePlayerGameContext.js');

let assert = require('assert');

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
}

describe('SinglePlayerGameContext', function() {
    let testEventsHandler = new TestEventsHandler();
    let gameContext = new singlePlayerGameContext.SinglePlayerGameContext(testEventsHandler, 2, 0);
    /**
    describe('happy path', function() {
        it('should return a default Card if no cards passed in', function() {
            //let trumpCard = new deck.TrumpCard();
            //let cards = [ new deck.Card() ];
            //assert.ok(gameLogic.getWinningCard(trumpCard, cards));
        });
    });
    /**/
});