"use strict";

class EventsHandler {
    constructor() {}

    async sendEventToGameContext(eventName, eventDetails) {
        await window.gameContext.handleEvent(eventName, eventDetails);
    }

    async sendEventToViewController(eventName, eventDetails) {
        await window.gameViewController.handleEvent(eventName, eventDetails);
    }
}