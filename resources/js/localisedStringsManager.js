"use strict";

class LocalisedStringManager {
    constructor(locale, localisedStrings) {
        this.locale = locale;
        this.localisedStrings = localisedStrings;
    }

    getLocalisedString(localisedStringId, params) {
        if (params && !Array.isArray(params)) {
            throw "'params' must be an array!";
        }
        var localisedString = "";
        var localisedStringObj = this.localisedStrings[localisedStringId];
        if (localisedStringObj) {
            localisedString = localisedStringObj[this.locale];

            if (localisedString && params && params.length > 0) {
                let paramToken = "{{param}}";
                for (let param of params) {
                    localisedString = localisedString.replace(paramToken, param);
                }
            }
        }
        if (!localisedString) {
            localisedString = "UNLOCALISED_STRING: Unknown string ID - " + localisedStringId;
        }

        return localisedString;
    }
}

(function () {
    let e = {};
    e.LocalisedStringManager = LocalisedStringManager;
    
    if (typeof module !== 'undefined' && module.exports != null) {
        module.exports = e;
    } else {
        window.localisedStringManager = e;
    }
})();