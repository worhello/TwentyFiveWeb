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
    cardNode.playerId = playerId;

    cardNodeContainer.appendChild(cardNode);
    cardNodeContainer.id = cardName;
    cardNodeContainer.draggable = true;

    return cardNodeContainer;
}

function showStartGameOverlay() {
    document.getElementById("menuContainer").style.display = "block";
    document.getElementById("endGameStatsContainer").style.display = "none";
}

class ViewController {
    constructor(eventsHandler) {
        this.eventsHandler = eventsHandler;
        this.selfPlayerCardsEnabled = false;
    }

    hideStartGameOverlay() {
        document.getElementById("menuContainer").style.display = "none";
    }

    showEndGameStats(eventDetails) {
        document.getElementById("menuContainer").style.display = "none";
        document.getElementById("endGameStatsContainer").style.display = "block";

        var first = true;

        for (let player of eventDetails.sortedPlayers) {
            let isWinner = first;
            if (first) {
                first = false;
            }

            let outer = document.createElement("div");
            outer.classList.add("EndGamePlayerInfoContainer");
            let playerNameCtr = document.createElement("div");
            playerNameCtr.textContent = player.name;
            playerNameCtr.classList.add("RightAlign");
            let playerScoreCtr = document.createElement("div");
            playerScoreCtr.textContent = player.score;

            if (player.isSelfPlayer) {
                outer.classList.add("EndGameSelfPlayer");
            }

            outer.appendChild(playerNameCtr);
            outer.appendChild(playerScoreCtr);

            if (isWinner) {
                outer.classList.add("EndGameWinningPlayer");
                let rightStar = document.createElement("div");
                rightStar.textContent = "🎉";
                outer.appendChild(rightStar);
            }

            document.getElementById("endGameStatsContainer").appendChild(outer);
        }

        let startButtonCtr = document.createElement("div");
        startButtonCtr.classList.add("EndGamePlayerInfoContainer");
        startButtonCtr.classList.add("EndGameStartNewGameButtonContainer");

        var startNewGameButton = document.createElement("button");
        startNewGameButton.textContent = "Start New Game";
        startNewGameButton.addEventListener("click", function() {
            showStartGameOverlay();
            clearChildrenOfElementById("endGameStatsContainer");
        });
        startButtonCtr.appendChild(startNewGameButton);
        document.getElementById("endGameStatsContainer").appendChild(startButtonCtr);
    }

    cardDragStartHandler(ev) {
        if (this.selfPlayerCardsEnabled)
        {
            document.getElementById("playedCardsContainer").classList.add("DroppableTargetHighlight");
            ev.dataTransfer.effectAllowed = "move";
            ev.dataTransfer.setData("text", ev.target.parentElement.id);
        }
    }
    
    cardDragOverHandler(ev) {
        if (document.getElementById("playedCardsContainer").contains(ev.target)) {
            ev.preventDefault();
            ev.dataTransfer.effectAllowed = "move";
        } else {
            ev.dataTransfer.effectAllowed = "none";
        }
    }
    
    cardDropHandler(ev) {
        ev.preventDefault();
        this.cardDragEndHandler();
        let cardName = ev.dataTransfer.getData("text");
        this.playSelfCard(cardName);
    }
    
    cardDragEndHandler() {
        document.getElementById("playedCardsContainer").classList.remove("DroppableTargetHighlight");
    }

    showPlayedCard(playerId, cardNode) {
        let playedCardContainer = document.getElementById('playedCard_' + playerId);
        playedCardContainer.appendChild(cardNode);
    }

    playCard(player, card) {
        let cardNode = buildCardNode(player.id, card);
        this.showPlayedCard(player.id, cardNode);
    }

    playSelfCard(cardName) {
        if (this.selfPlayerCardsEnabled)
        {
            let cardNode = document.getElementById(cardName);
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
        let gameContainer = document.getElementById("gameContainer");
        let viewController = this;

        cards.forEach(function(card) {
            let cardNode = buildCardNode(selfPlayer.id, card);
            cardNode.addEventListener("click", function() {
                viewController.playSelfCard(card.cardName);
            });
            gameContainer.addEventListener("dragstart", function(ev) {
                viewController.cardDragStartHandler(ev);
            });
            gameContainer.addEventListener("dragover", function(ev) {
                viewController.cardDragOverHandler(ev);
            });
            gameContainer.addEventListener("drop", function(ev) {
                viewController.cardDropHandler(ev);
            });
            gameContainer.addEventListener("dragend", function() {
                viewController.cardDragEndHandler();
            });

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
        } else if (eventName === 'showStartGameOverlay') {
            showStartGameOverlay();
        } else if (eventName === 'hideStartGameOverlay') {
            this.hideStartGameOverlay();
        } else if (eventName === 'showEndGameStats') {
            this.showEndGameStats(eventDetails);
        }
    }
}
