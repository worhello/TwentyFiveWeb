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
    constructor() {
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

    // TODO - check if any better way so as to not need this function
    allPlayedCardsVisible() {
        for (let player of window.gameContext.players) {
            let playerName = player.name;
            let playedCardContainer = document.getElementById('playedCard_' + playerName);
            if (playedCardContainer.getElementsByTagName('img').length == 0) {
                return false;
            }
        }
        return true;
    }

    showPlayedCard(playerName, cardNode) {
        let playedCardContainer = document.getElementById('playedCard_' + playerName);
        playedCardContainer.appendChild(cardNode);
    }

    playCard(playerName, card) {
        let cardNode = buildCardNode(playerName, card);
        this.showPlayedCard(playerName, cardNode);
    }

    async playSelfCard(cardNode, cardName) {
        if (this.selfPlayerCardsEnabled)
        {
            this.showPlayedCard(window.gameContext.selfPlayer.name, cardNode);
            window.gameContext.playSelfCard(cardName); // TODO - make this an event too so both classes can be totally separate
        }
    }

    _drawPlayerScores(players) {
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

    _setSelfPlayerCardsEnabled(isEnabled) {
        this.selfPlayerCardsEnabled = isEnabled;
        if (this.selfPlayerCardsEnabled) {
            document.getElementById("playerCardsContainer").classList.remove('DisabledSelfPlayerCards');
        } else {
            document.getElementById("playerCardsContainer").classList.add('DisabledSelfPlayerCards');
        }
        document.getElementById('playedCardsContainerWrapper').style.display = 'none';
        document.getElementById('playedCardsContainerWrapper').style.display = 'block';
    }

    event_setSelfPlayerCardsEnabled(isEnabled) {
        this._setSelfPlayerCardsEnabled(isEnabled);
    }

    event_drawPlayerScores() {
        this._drawPlayerScores(window.gameContext.players);
    }

    _redrawPlayerScores(players) {
        for (let player of players) {
            var playerScoreNode = document.getElementById("playerScoreNode_" + player.name);
            if (playerScoreNode) {
                playerScoreNode.textContent = player.score;
            }
        }
    }

    event_redrawPlayerScores() {
        this._redrawPlayerScores(window.gameContext.players);
    }

    event_drawPlayedCardsPlaceholders() {
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

    event_resetPlayedCardsState() {
        clearChildrenOfElementById("playedCardsContainer");
    }

    event_resetSelfPlayerState() {
        clearChildrenOfElementById("playerCardsContainer");
    }

    _showSelfPlayerHand(selfPlayer) {
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

    event_showSelfPlayerHand() {
        this._showSelfPlayerHand(window.gameContext.selfPlayer);
    }

    _redrawTrumpCard(trumpCard) {
        clearChildrenOfElementById("trumpCardImgContainer");

        var trumpCardContainer = document.getElementById("trumpCardImgContainer");
        trumpCardContainer.className = trumpCard.hasBeenStolen ? "TrumpCardStolen" : "TrumpCardNotStolen";

        let cardNode = buildCardNode("Trump Card", trumpCard.card);
        trumpCardContainer.appendChild(cardNode);
    }

    event_redrawTrumpCard() {
        this._redrawTrumpCard(window.gameContext.trumpCard);
    }

    event_highlightWinningCard(winningPlayerName) {
        let winningCardContainer = document.getElementById('playedCard_' + winningPlayerName);
        winningCardContainer.classList.add('WinningCardAnimation');
    }
}
