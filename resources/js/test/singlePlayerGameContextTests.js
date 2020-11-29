"use strict";

let assert = require('assert');

let share = require('../share.js');
/**
let singlePlayerGameContext = require('../singlePlayerGameContext.js');
let SinglePlayerGameContext = singlePlayerGameContext.SinglePlayerGameContext;

let Deck = share.Deck;
let TrumpCard = share.TrumpCard;

//let SinglePlayerGameContext = share.SinglePlayerGameContext;

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
    let gameContext = new SinglePlayerGameContext(testEventsHandler, 2, 0);
    describe('happy path', function() {
        it('should return a default Card if no cards passed in', function() {
            //let trumpCard = new deck.TrumpCard();
            //let cards = [ new deck.Card() ];
            //assert.ok(gameLogic.getWinningCard(trumpCard, cards));
        });
    });
});
/**/