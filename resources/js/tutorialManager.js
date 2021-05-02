"use strict";

class TutorialManager {
    constructor(localisedStringManager) {
        this.localisedStringManager = localisedStringManager;
        this.introMessagesShown = 0;
    }

    getNextTutorialOverlayMessage() {
        var messageType = "defaultTutorialMesssage";
        if (this.hasMoreIntroMessages()) {
            messageType = this.getNextIntroMessageType();
        } else {
            messageType = this.getNextWinningMessageType();
        }

        return this.localisedStringManager.getLocalisedString(messageType);
    }

    hasMoreIntroMessages() {
        return this.introMessagesShown < 3;
    }

    getNextIntroMessageType() {
        this.introMessagesShown++;
        if (this.introMessagesShown === 1) {
            return "tutorialIntroOne";
        }
        else if (this.introMessagesShown === 2) {
            return "tutorialIntroTwo";
        }
        else if (this.introMessagesShown === 3) {
            return "tutorialIntroThree";
        }

        return "defaultTutorialMesssage";
    }

    getNextWinningMessageType() {
        this.playCount++;

        var messageType = "defaultTutorialMesssage";
        if (this.playCount === 1) {
            return "tutorialMoveOne";
        }
        else if (this.playCount === 2) {
            return "tutorialMoveTwo";
        }
        else if (this.playCount === 3) {
            return "tutorialMoveThree";
        }
        else if (this.playCount === 4) {
            return "tutorialMoveFour";
        }
        else if (this.playCount === 5) {
            return "tutorialMoveFive";
        }
        else if (this.playCount === 6) {
            return "tutorialMoveSix";
        }
        else if (this.playCount === 7) {
            return "tutorialMoveSeven";
        }
        else if (this.playCount === 8) {
            return "tutorialMoveEight";
        }
        else if (this.playCount === 9) {
            return "tutorialMoveNine";
        }
        else if (this.playCount === 10) {
            return "tutorialMoveTen";
        }

        return "defaultTutorialMesssage";
    }

    getSkipTrumpButtonDisabledReason() {
        return this.localisedStringManager.getLocalisedString("skipTrumpButtonDisabledReason");
    }
}

(function () {
    let e = {};
    e.TutorialManager = TutorialManager;
    
    if (typeof module !== 'undefined' && module.exports != null) {
        module.exports = e;
    } else {
        window.tutorialManager = e;
    }
})();