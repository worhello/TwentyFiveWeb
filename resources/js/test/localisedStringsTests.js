"use strict";

let localisedStrings = require('../localisedStrings.js');

let assert = require('assert');

describe("check returned strings are formatted correctly", function() {
    let knownStringId = "startGameButton";
    let unknownStringId = "MyUnknownStringId";
    describe("test with unknown locale", function() {
        let unknownLocaleManager = new localisedStrings.LocalisedStringManager("myUnknownLocale");
        describe("should always return unknown string value", function() {
            it("called with unknown string ID", function() {
                let actual = unknownLocaleManager.getLocalisedString(unknownStringId);
                assert.strictEqual(actual, "UNLOCALISED_STRING");
            });

            it("called with known string ID", function() {
                let actual = unknownLocaleManager.getLocalisedString(knownStringId);
                assert.strictEqual(actual, "UNLOCALISED_STRING");
            });
        });
    });
    
    describe("test getLocalisedStrings with no params", function() {
        let localisedStringManager = new localisedStrings.LocalisedStringManager("en/UK");
        it("unknown localised string", function() {
            let actual = localisedStringManager.getLocalisedString(unknownStringId);
            assert.strictEqual(actual, "UNLOCALISED_STRING");
        });

        it("known localised string", function() {
            let actual = localisedStringManager.getLocalisedString(knownStringId);
            assert.strictEqual(actual, "Start Game");
        });
    });

    describe("test getLocalisedStrings with params", function() {
        let localisedStringManager = new localisedStrings.LocalisedStringManager("en/UK");
        let knownParamStringId = "robbedByPlayerLabelText";
        it("unknown localised string", function() {
            let actual = localisedStringManager.getLocalisedString(unknownStringId, ["my param"]);
            assert.strictEqual(actual, "UNLOCALISED_STRING");
        });

        it("known localised string with no param tokens", function() {
            let actual = localisedStringManager.getLocalisedString(knownStringId, ["my param"]);
            assert.strictEqual(actual, "Start Game");
        });

        it("known localised string with param tokens", function() {
            let actual = localisedStringManager.getLocalisedString(knownParamStringId, ["my param"]);
            assert.strictEqual(actual, "Robbed by my param");
        });
    });
});