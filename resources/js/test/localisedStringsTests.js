"use strict";

let localisedStringsManager = require('../localisedStringsManager.js');
let localisedStrings = require('../localisedStrings.js');

let assert = require('assert');

describe("check returned strings are formatted correctly", function() {
    let knownStringId = "startGameButton";
    let unknownStringId = "MyUnknownStringId";
    let strings = localisedStrings.getLocalisedStrings();
    describe("test with unknown locale", function() {
        let unknownLocaleManager = new localisedStringsManager.LocalisedStringManager("myUnknownLocale", strings);
        describe("should always return unknown string value", function() {
            it("called with unknown string ID", function() {
                let actual = unknownLocaleManager.getLocalisedString(unknownStringId);
                assert.strictEqual(actual, "UNLOCALISED_STRING: Unknown string ID - MyUnknownStringId");
            });

            it("called with known string ID", function() {
                let actual = unknownLocaleManager.getLocalisedString(knownStringId);
                assert.strictEqual(actual, "UNLOCALISED_STRING: Unknown string ID - startGameButton");
            });
        });
    });
    
    describe("test getLocalisedStrings with no params", function() {
        let localisedStringManager = new localisedStringsManager.LocalisedStringManager("en", strings);
        it("unknown localised string", function() {
            let actual = localisedStringManager.getLocalisedString(unknownStringId);
            assert.strictEqual(actual, "UNLOCALISED_STRING: Unknown string ID - MyUnknownStringId");
        });

        it("known localised string", function() {
            let actual = localisedStringManager.getLocalisedString(knownStringId);
            assert.strictEqual(actual, "Start Game");
        });
    });

    describe("test getLocalisedStrings with params", function() {
        let localisedStringManager = new localisedStringsManager.LocalisedStringManager("en", strings);
        let knownParamStringId = "robbedByPlayerLabelText";
        it("unknown localised string", function() {
            let actual = localisedStringManager.getLocalisedString(unknownStringId, ["my param"]);
            assert.strictEqual(actual, "UNLOCALISED_STRING: Unknown string ID - MyUnknownStringId");
        });

        it("known localised string with no param tokens", function() {
            let actual = localisedStringManager.getLocalisedString(knownStringId, ["my param"]);
            assert.strictEqual(actual, "Start Game");
        });

        it("known localised string with param tokens", function() {
            let actual = localisedStringManager.getLocalisedString(knownParamStringId, ["my param"]);
            assert.strictEqual(actual, "Robbed by my param");
        });

        it("known localised string with invalid param tokens", function() {
            var exceptionThrown = false;
            try {
                let actual = localisedStringManager.getLocalisedString(knownParamStringId, "my param");
            } catch (err) {
                exceptionThrown = true;
            }
            assert.strictEqual(exceptionThrown, true);
        });
    });
});

describe("test all localised strings are translated to all finished languages", function() {
    let expectedProperties = [
        "translator note",
        "en"
    ];

    let stringInfos = localisedStrings.getLocalisedStrings();

    it("all strings have ONLY the required properties", function() {
        const checkExclusiveProperties = function(stringInfoName) {
            return Object.keys(stringInfos[stringInfoName]).length == expectedProperties.length;
        }
        assert.strictEqual(Object.keys(stringInfos).every(checkExclusiveProperties), true);

        const checkAllStrings = function(prop) {
            for (let stringName of Object.keys(stringInfos)) {
                if (!stringInfos[stringName][prop]) {
                    return false;
                }
            }
            return true;
        }
        assert.strictEqual(expectedProperties.every(checkAllStrings), true);
    });
});
