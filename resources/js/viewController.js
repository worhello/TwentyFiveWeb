"use strict";

function clearChildrenOfElementById(elementId) {
    let node = document.getElementById(elementId);
    while (node && node.firstChild) {
        node.removeChild(node.firstChild);
    }
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

class ViewController {
    constructor(eventsHandler) {
        this.eventsHandler = eventsHandler;
        this.selfPlayerCardsEnabled = true; //TODO change to false
    }

    getPlayersAndCards() {
        let playedCardsNode = document.getElementById("playedCardsContainer");
        var playedCards = [];
        for (let card of playedCardsNode.getElementsByClassName('Card')) {
            playedCards.push({ "playerName": card.playerName, "card": card.cardObj });
        }
        return playedCards;
    }

    getPlayedCards() {
        let playedCardsNode = document.getElementById("playedCardsContainer");
        var playedCards = [];
        for (let card of playedCardsNode.getElementsByClassName('Card')) {
            playedCards.push(card.cardObj);
        }
        return playedCards;
    }

    showPlayedCard(playerName, cardNode) {
        let playedCardContainer = document.getElementById('playedCard_' + playerName);
        playedCardContainer.appendChild(cardNode);
    }

    playCard(playerName, card) {
        let cardNode = buildCardNode(playerName, card);
        this.showPlayedCard(playerName, cardNode);
    }

    playSelfCard(cardNode, cardName) {
        if (this.selfPlayerCardsEnabled)
        {
            document.getElementById("playerCardsContainer").removeChild(cardNode);
            this.eventsHandler.sendEventToGameContext('playSelfCard', { "cardName": cardName });
        }
    }

    drawPlayerScores(players) {
        clearChildrenOfElementById("playersScoreContainer");

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

    setSelfPlayerCardsEnabled(isEnabled) {
        this.selfPlayerCardsEnabled = isEnabled;
        if (this.selfPlayerCardsEnabled) {
            document.getElementById("playerCardsContainer").classList.remove('DisabledSelfPlayerCards');
        } else {
            document.getElementById("playerCardsContainer").classList.add('DisabledSelfPlayerCards');
        }
        document.getElementById('playedCardsContainerWrapper').style.display = 'none';
        document.getElementById('playedCardsContainerWrapper').style.display = 'block';
    }

    redrawPlayerScores(players) {
        for (let player of players) {
            var playerScoreNode = document.getElementById("playerScoreNode_" + player.name);
            if (playerScoreNode) {
                playerScoreNode.textContent = player.score;
            }
        }
    }

    drawPlayedCardsPlaceholders(players) {
        let playedCardArea = document.getElementById("playedCardsContainer");
        
        for (let player of players) {
            let playedCardContainer = document.createElement("span");
            playedCardContainer.className = 'CardContainer PlayedCardContainer';
            playedCardContainer.id = 'playedCard_' + player.name;
            let playerNameLabel = document.createElement("div");
            playerNameLabel.textContent = player.name;
            playedCardContainer.appendChild(playerNameLabel);
            playedCardArea.appendChild(playedCardContainer);
        }
    }

    resetPlayedCardsState() {
        clearChildrenOfElementById("playedCardsContainer");
    }

    resetSelfPlayerState() {
        clearChildrenOfElementById("playerCardsContainer");
    }

    showSelfPlayerHand(selfPlayer) {
        let cards = selfPlayer.cards;
        let playerName = selfPlayer.name;

        cards.forEach(function(card) {
            let cardNode = buildCardNode(playerName, card);
            cardNode.addEventListener("click", function(ev) {
                window.gameViewController.playSelfCard(cardNode, card.cardName);
            })
            document.getElementById("playerCardsContainer").appendChild(cardNode);
        });
    }

    redrawTrumpCard(trumpCard) {
        clearChildrenOfElementById("trumpCardImgContainer");

        var trumpCardContainer = document.getElementById("trumpCardImgContainer");
        trumpCardContainer.className = trumpCard.hasBeenStolen ? "TrumpCardStolen" : "TrumpCardNotStolen";

        let cardNode = buildCardNode("Trump Card", trumpCard.card);
        trumpCardContainer.appendChild(cardNode);
    }

    highlightWinningCard(winningPlayerName) {
        let winningCardContainer = document.getElementById('playedCard_' + winningPlayerName);
        winningCardContainer.classList.add('WinningCardAnimation');
    }
    
    handleEvent(eventName, eventDetails) {
        if (eventName === 'highlightWinningPlayer') {
            this.highlightWinningCard(eventDetails.winningPlayerName);
        } else if (eventName === 'redrawTrumpCard') {
            this.redrawTrumpCard(eventDetails.trumpCard);
        } else if (eventName === 'showSelfPlayerHand') {
            this.showSelfPlayerHand(eventDetails.selfPlayer);
        } else if (eventName === 'drawPlayerScores') {
            this.drawPlayerScores(eventDetails.players);
        } else if (eventName === 'redrawPlayerScores') {
            this.redrawPlayerScores(eventDetails.players);
        } else if (eventName === 'resetSelfPlayerState') {
            this.resetSelfPlayerState();
        } else if (eventName === 'resetPlayedCardsState') {
            this.resetPlayedCardsState();
        } else if (eventName === 'drawPlayedCardsPlaceholders') {
            this.drawPlayedCardsPlaceholders(eventDetails.players);
        } else if (eventName === 'setSelfPlayerCardsEnabled') {
            this.setSelfPlayerCardsEnabled(eventDetails.isEnabled);
        } else if (eventName === 'playCard') {
            this.playCard(eventDetails.playerName, eventDetails.playedCard);
        }
    }
}
