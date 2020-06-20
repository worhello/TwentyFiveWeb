"use strict";

function clearChildrenOfElementById(elementId) {
    let node = document.getElementById(elementId);
    while (node && node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function getPlayersAndCards() {
    let playedCardsNode = document.getElementById("playedCardsContainer");
    var playedCards = [];
    for (let card of playedCardsNode.getElementsByClassName('Card')) {
        playedCards.push({"playerName": card.playerName, "card": card.cardObj });
    }
    return playedCards;
}

function getPlayedCards() {
    let playedCardsNode = document.getElementById("playedCardsContainer");
    var playedCards = [];
    for (let card of playedCardsNode.getElementsByClassName('Card')) {
        playedCards.push(card.cardObj);
    }
    return playedCards;
}

function allPlayedCardsVisible() {
    for (let player of window.gameContext.players) {
        let playerName = player.name;
        let playedCardContainer = document.getElementById('playedCard_' + playerName);
        if (playedCardContainer.getElementsByTagName('img').length == 0) {
            return false;
        }
    }
    return true;
}

function buildCardNode(playerName, card) {
    let cardName = card.cardName;
    let cardNodeContainer = document.createElement("div");
    let cardNode = document.createElement("img");
    cardNode.className = 'Card';
    cardNode.src = "resources/images/Cards/" + cardName + ".svg";
    cardNode.id = cardName;
    cardNode.playerName = playerName;
    cardNode.cardObj = card;

    cardNodeContainer.appendChild(cardNode);

    return cardNodeContainer;
}

function showPlayedCard(playerName, cardNode) {
    let playedCardContainer = document.getElementById('playedCard_' + playerName);
    playedCardContainer.appendChild(cardNode);
}

function playCard(playerName, card) {
    let cardNode = buildCardNode(playerName, card);
    showPlayedCard(playerName, cardNode);
}

async function playSelfCard(cardNode, cardName) {
    if (window.gameContext.selfPlayerCardsEnabled)
    {
        showPlayedCard(window.gameContext.selfPlayer.name, cardNode);
        window.gameContext.playSelfCard(cardName);
    }
}

function drawPlayerScores() {
    clearChildrenOfElementById("playersScoreContainer");
    let players = window.gameContext.players;
    let playersContainer = document.getElementById("playersScoreContainer");
    for (let player of players) {
        let playerNode = document.createElement("span");
        playerNode.className = "PlayerScoreContainer";
        let playerName = document.createElement("div");
        let playerScore = document.createElement("div");
        playerScore.className = "PlayerScoreNumber";
        playerScore.id = "playerScoreNode_" + player.name;
        playerNode.appendChild(playerName);
        playerNode.appendChild(playerScore);

        playerName.textContent = player.name;
        playerScore.textContent = player.score;

        playersContainer.appendChild(playerNode);
    }
}

function redrawPlayerScores() {
    let playersContainer = document.getElementById("playersScoreContainer");
    for (let player of window.gameContext.players) {
        var playerScoreNode = document.getElementById("playerScoreNode_" + player.name);
        if (playerScoreNode) {
            playerScoreNode.textContent = player.score;
        }
    }
}

function drawPlayedCardsPlaceholders() {
    let playedCardArea = document.getElementById("playedCardsContainer");

    for (let player of window.gameContext.players) {
        let playedCardContainer = document.createElement("span");
        playedCardContainer.className = 'CardContainer PlayedCardContainer';
        playedCardContainer.id = 'playedCard_' + player.name;
        let playerNameLabel = document.createElement("div");
        playerNameLabel.textContent = player.name;
        playedCardContainer.appendChild(playerNameLabel);
        playedCardArea.appendChild(playedCardContainer);
    }
}

function resetPlayedCardsState() {
    clearChildrenOfElementById("playedCardsContainer");
}

function resetSelfPlayerState() {
    clearChildrenOfElementById("playerCardsContainer");
}

function showSelfPlayerHand() {
    let selfPlayer = window.gameContext.selfPlayer;
    let cards = selfPlayer.cards;
    let playerName = selfPlayer.name;
    
    cards.forEach(function(card) {
        let cardNode = buildCardNode(playerName, card);
        cardNode.addEventListener("click", function(ev) {
            playSelfCard(cardNode, card.cardName);
        })
        document.getElementById("playerCardsContainer").appendChild(cardNode);
    });
}

function redrawTrumpCard() {
    clearChildrenOfElementById("trumpCardImgContainer");

    let trumpCard = window.gameContext.trumpCard;
    var trumpCardContainer = document.getElementById("trumpCardImgContainer");
    trumpCardContainer.className = trumpCard.hasBeenStolen ? "TrumpCardStolen" : "TrumpCardNotStolen";

    let cardNode = buildCardNode("Trump Card", trumpCard.card);
    trumpCardContainer.appendChild(cardNode);
}

function showStartGameOverlay() {
    document.getElementById("menuContainer").style.display = "block";
}

function hideStartGameOverlay() {
    document.getElementById("menuContainer").style.display = "none";
}

function onStartButtonClicked() {
    let numPlayersSelect = document.getElementById("numPlayersSelect");
    let numPlayers = numPlayersSelect.options[numPlayersSelect.selectedIndex].value;

    let isSinglePlayer = document.getElementById("singlePlayer").checked;

    let cardDisplayDelay = 500;

    if (isSinglePlayer) {
        window.gameContext = new SinglePlayerGameContext(numPlayers, cardDisplayDelay);
    } else {
        window.gameContext = new SinglePlayerGameContext(numPlayers, cardDisplayDelay); // TODO change
    }

    window.gameContext.startGame();

    hideStartGameOverlay();
}
