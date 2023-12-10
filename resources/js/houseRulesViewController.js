"use strict";

class UiHouseRule {
    constructor(houseRuleLabelId, houseRuleValueName, houseRuleValueId, houseRuleValueType, houseRuleValueDefault) {
        this.houseRuleLabelId = houseRuleLabelId;
        this.houseRuleValueName = houseRuleValueName;
        this.houseRuleValueId = houseRuleValueId;
        this.houseRuleValueType = houseRuleValueType;
        this.houseRuleValueDefault = houseRuleValueDefault;
    }
};

const houseRules = [
    new UiHouseRule("numPlayersSelectLabel", "numPlayers", "numPlayersSelect", "select", null),
    new UiHouseRule("winningScoreSelectLabel", "winningScore", "winningScoreSelect", "select", null),
    new UiHouseRule("dealerAceTrumpsBonusLabel", null, "dealerAceTrumpsBonusCheckbox", "checkbox", false),
    new UiHouseRule("renegingAllowedLabel", null, "renegingAllowedCheckbox", "checkbox", true)
];

function createInputElement(houseRule) {
    var input;
    if (houseRule.houseRuleValueType == "select") {
        input = document.createElement("select");
        input.name = houseRule.houseRuleValueName;
    } else if (houseRule.houseRuleValueType == "checkbox") {
        input = document.createElement("input");
        input.type = houseRule.houseRuleValueType;
        if (houseRule.houseRuleValueDefault) {
            input.checked = houseRule.houseRuleValueDefault;
        }
    }

    input.id = houseRule.houseRuleValueId;

    return input;    
}

function createDefaultHouseRules() {
    let houseRulesTable = document.getElementById("houseRulesContainer");

    for (let houseRule of houseRules) {
        let row = document.createElement("tr");

        let labelCell = document.createElement("td");
        labelCell.classList.add("houseRuleLabel");
        labelCell.id = houseRule.houseRuleLabelId;
        row.appendChild(labelCell);
        
        let valueCell = document.createElement("td");
        valueCell.classList.add("houseRuleLabel");
        let input = createInputElement(houseRule);
        valueCell.appendChild(input);
        row.appendChild(valueCell);

        houseRulesTable.appendChild(row);
    }
}