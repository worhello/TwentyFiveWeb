"use strict";

class EventsHandler {
    constructor() {
        //
    }

    sendEventToGameContext(eventName, eventDetails) {
        window.gameContext.handleEvent(eventName, eventDetails);
    }

    sendEventToViewController(eventName, eventDetails) {
        window.gameViewController.handleEvent(eventName, eventDetails);
    }
}