"use strict";

function clearChildrenOfElementById(elementId) {
    let node = document.getElementById(elementId);
    while (node && node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function getPlayedCards() {
    let playedCardsNode = document.getElementById("playedCardsContainer");
    var playedCards = [];
    for (let card of playedCardsNode.getElementsByClassName('Card')) {
        playedCards.push({"playerName": card.playerName, "card": card.cardObj });
    }
    return playedCards;
}

function buildCardNode(playerName, card) {
    let cardName = card.cardName;
    let cardNode = document.createElement("img");
    cardNode.className = 'Card';
    cardNode.src = "resources/images/Cards/" + cardName + ".png";
    cardNode.id = cardName;
    cardNode.playerName = playerName;
    cardNode.cardObj = card;

    return cardNode;
}

function showPlayedCard(playerName, cardNode) {
    let playedCardArea = document.getElementById("playedCardsContainer");
    let playedCardContainer = document.createElement("span");
    playedCardContainer.className = 'PlayedCardContainer';
    let playerNameLabel = document.createElement("div");
    playerNameLabel.textContent = playerName;
    playedCardContainer.appendChild(playerNameLabel);
    playedCardContainer.appendChild(cardNode);
    playedCardArea.appendChild(playedCardContainer);
}

function playCard(playerName, card) {
    // use context
    let cardNode = buildCardNode(playerName, card);
    showPlayedCard(playerName, cardNode);
}

function playSelfCard(card) {
    let selfPlayer = window.gameContext.getSelfPlayer();
    let cardNode = document.getElementById(card.cardName);

    showPlayedCard(selfPlayer.name, cardNode);

    window.gameContext.playCardsAfterSelf();
}

function redrawPlayerScores() {
    clearChildrenOfElementById("playersScoreContainer");
    let players = window.gameContext.players;
    let playersContainer = document.getElementById("playersScoreContainer");
    for (let player of players) {
        let playerNode = document.createElement("span");
        playerNode.className = "PlayerScoreContainer";
        let playerName = document.createElement("div");
        let playerScore = document.createElement("div");
        playerNode.appendChild(playerName);
        playerNode.appendChild(playerScore);

        playerName.textContent = player.name;
        playerScore.textContent = player.score;

        playersContainer.appendChild(playerNode);
    }
}

function resetPlayedCardsState() {
    clearChildrenOfElementById("playedCardsContainer");
}

function resetSelfPlayerState() {
    clearChildrenOfElementById("playerCardsContainer");
}

function showSelfPlayerHand() {
    resetSelfPlayerState();

    let selfPlayer = window.gameContext.getSelfPlayer();
    let cardNames = selfPlayer.cards;
    let playerName = selfPlayer.name;
    
    cardNames.forEach(function(card) {
        let cardNode = buildCardNode(playerName, card);
        cardNode.addEventListener("click", function(ev) {
            playSelfCard(card);
        })
        document.getElementById("playerCardsContainer").appendChild(cardNode);
    });
}
