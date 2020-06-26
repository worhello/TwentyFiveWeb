"use strict";

function clearChildrenOfElementById(elementId) {
    let node = document.getElementById(elementId);
    while (node && node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function buildCardNode(playerId, card) {
    let cardName = card.cardName;
    let cardNodeContainer = document.createElement("div");
    let cardNode = document.createElement("img");
    cardNode.className = 'Card';
    cardNode.src = "resources/images/Cards/" + cardName + ".svg";
    cardNode.id = cardName;
    cardNode.playerId = playerId;

    cardNodeContainer.appendChild(cardNode);

    return cardNodeContainer;
}

class ViewController {
    constructor(eventsHandler) {
        this.eventsHandler = eventsHandler;
        this.selfPlayerCardsEnabled = true; //TODO change to false
    }

    showPlayedCard(playerId, cardNode) {
        let playedCardContainer = document.getElementById('playedCard_' + playerId);
        playedCardContainer.appendChild(cardNode);
    }

    playCard(player, card) {
        let cardNode = buildCardNode(player.id, card);
        this.showPlayedCard(player.id, cardNode);
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
            playerScore.id = "playerScoreNode_" + player.id;
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
            var playerScoreNode = document.getElementById("playerScoreNode_" + player.id);
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
            playedCardContainer.id = 'playedCard_' + player.id;
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

        cards.forEach(function(card) {
            let cardNode = buildCardNode(selfPlayer.id, card);
            cardNode.addEventListener("click", function() {
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

    highlightWinningCard(winningPlayerId) {
        let winningCardContainer = document.getElementById('playedCard_' + winningPlayerId);
        winningCardContainer.classList.add('WinningCardAnimation');
    }

    showWinningPlayer(winningPlayer) {
        window.alert(winningPlayer.name + " won!");
    }
    
    handleEvent(eventName, eventDetails) {
        if (eventName === 'highlightWinningPlayer') {
            this.highlightWinningCard(eventDetails.winningPlayerId);
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
            this.playCard(eventDetails.player, eventDetails.playedCard);
        } else if (eventName === 'showWinningPlayer') {
            this.showWinningPlayer(eventDetails.winningPlayer);
        }
    }
}
