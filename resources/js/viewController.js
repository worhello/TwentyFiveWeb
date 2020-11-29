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
    cardNode.src = card.url;
    cardNode.playerId = playerId;

    cardNodeContainer.appendChild(cardNode);
    cardNodeContainer.id = cardName;
    cardNodeContainer.className = "CardImgContainer";
    cardNodeContainer.draggable = true;

    return cardNodeContainer;
}

function hideAllOverlays() {
    document.getElementById("menuContainer").style.display = "none";
    document.getElementById("endGameStatsContainer").style.display = "none";

    var robbingCardOverlay = document.getElementById("selfPlayerRobbingCardOverlay");
    if (robbingCardOverlay) {
        robbingCardOverlay.style.display = "none";
    }
}

function showStartGameOverlay() {
    hideAllOverlays();
    document.getElementById("menuContainer").style.display = "block";
}

function getPlayedCardDisplayTitle(player) {
    var displayTitle = player.name;
    displayTitle += " [" + player.score + "]";
    return displayTitle;
}

function calculateAngles(numPlayers) {
    let step = (2 * Math.PI) / numPlayers
    var angles = [];
    var currentAngle = Math.PI / 2;

    for (var i = 0; i < numPlayers; i++) {
        angles.push(currentAngle);
        currentAngle += step;
    }

    return angles;
}

function calculateZIndices(numCards) {
    var zIndices = [];
    let middleCardNum = Math.ceil(numCards / 2);
    for (var i = 0; i < middleCardNum; i++) {
        zIndices.push((middleCardNum - i).toString());
    }

    var copy = zIndices.concat();
    copy.reverse();

    if (numCards % 2 == 1) {
        copy.splice(0, 1);
    }

    zIndices = zIndices.concat(copy);

    return zIndices;
}

class ViewController {
    constructor(eventsHandler) {
        this.eventsHandler = eventsHandler;
        this.selfPlayerCardsEnabled = false;
        this.isRobbing = false;
    }

    hideStartGameOverlay() {
        hideAllOverlays();
    }

    showEndOfHandOrGameStats(sortedPlayers, showWinningPlayer, buttonText, buttonFunc) {
        clearChildrenOfElementById("endGameStatsContainer");
        hideAllOverlays();
        document.getElementById("endGameStatsContainer").style.display = "block";

        var first = true;

        for (let player of sortedPlayers) {
            let isWinner = showWinningPlayer && first;
            if (isWinner) {
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
        startNewGameButton.textContent = buttonText;
        startNewGameButton.addEventListener("click", buttonFunc);
        startButtonCtr.appendChild(startNewGameButton);
        document.getElementById("endGameStatsContainer").appendChild(startButtonCtr);
    }

    showEndGameStats(eventDetails) {
        this.showEndOfHandOrGameStats(eventDetails.sortedPlayers, true, "Start New Game", function() {
            showStartGameOverlay();
            clearChildrenOfElementById("endGameStatsContainer");
        });
    }

    showEndOfHandStats(eventDetails) {
        let viewController = this;
        this.showEndOfHandOrGameStats(eventDetails.sortedPlayers, false, "Start next round", function() {
            hideAllOverlays();
            viewController.eventsHandler.sendEventToGameContext('startNextRound', { "startingPlayerId": eventDetails.sortedPlayers[0].id });
        });
    }

    cardDragStartHandler(ev) {
        if (this.selfPlayerCardsEnabled) {
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

    async playSelfCard(cardName) {
        if (this.selfPlayerCardsEnabled)
        {
            let cardNode = document.getElementById(cardName);
            document.getElementById("playerCardsContainer").removeChild(cardNode);
            if (this.isRobbing) {
                await this.eventsHandler.sendEventToGameContext('selfPlayerRobTrumpCard', { "droppedCardName": cardName });
                this.isRobbing = false;
            } else {
                await this.eventsHandler.sendEventToGameContext('playSelfCard', { "cardName": cardName });
            }
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
            var playedCardContainerTitle = document.getElementById("playedCardTitle_" + player.id);
            if (playedCardContainerTitle) {
                playerNameLabel.textContent = getPlayedCardDisplayTitle(player);
            }
        }
    }

    drawPlayedCardsPlaceholders(players) {
        let playedCardArea = document.getElementById("playedCardsContainer");

        let trumpCardContainer = document.createElement("div");
        trumpCardContainer.classList.add('CardContainer');
        trumpCardContainer.id = 'trumpCardContainer';

        let trumpCardTitle = document.createElement("div");
        trumpCardTitle.textContent = "Trump Card";
        let trumpCardRobbed = document.createElement("div");
        trumpCardRobbed.id = "trumpCardRobbedText";
        trumpCardRobbed.style.display = "none";

        let trumpCardImgContainer = document.createElement("div");
        trumpCardImgContainer.id = "trumpCardImgContainer";

        trumpCardContainer.appendChild(trumpCardTitle);
        trumpCardContainer.appendChild(trumpCardRobbed);
        trumpCardContainer.appendChild(trumpCardImgContainer);

        playedCardArea.appendChild(trumpCardContainer);

        let selfPlayerIndex = players.findIndex(p => p.isSelfPlayer == true);
        let angles = calculateAngles(players.length);
        var angleIndex = (angles.length - selfPlayerIndex) % angles.length;
        let zIndices = calculateZIndices(angles.length);

        let cardWidth = 106;
        let cardHeight = 174;
        let containerRadius = 325;
        let cardsRadius = 230;

        for (let player of players) {
            let playedCardContainer = document.createElement("span");

            playedCardContainer.classList.add('CardContainer');
            playedCardContainer.classList.add('PlayedCardContainer');
            playedCardContainer.id = 'playedCard_' + player.id;

            if (player.isDealer === true) {
                let isDealerLabel = document.createElement("div");
                isDealerLabel.textContent = "Dealer";
                playedCardContainer.appendChild(isDealerLabel);
            }

            let playerNameLabel = document.createElement("div");
            playerNameLabel.id = 'playedCardTitle_' + player.id;
            playerNameLabel.textContent = getPlayedCardDisplayTitle(player);
            playedCardContainer.appendChild(playerNameLabel);

            let angle = angles[angleIndex];
            let zIndex = zIndices[angleIndex];
            playedCardContainer.style.left = Math.round(containerRadius + (cardsRadius * Math.cos(angle)) - (cardWidth/2)) + 'px';
            playedCardContainer.style.top = Math.round(containerRadius + (cardsRadius * Math.sin(angle))  - (cardHeight/2)) + 'px';
            playedCardContainer.style.zIndex = zIndex;
            angleIndex = (angleIndex + 1) % angles.length;

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

        let cardNode = buildCardNode("Trump Card", trumpCard.card);
        trumpCardContainer.appendChild(cardNode);
        
        if (trumpCard.hasBeenStolen) {
            trumpCardContainer.classList.add("TrumpCardStolen");
            document.getElementById("trumpCardRobbedText").style.display = "block";
            document.getElementById("trumpCardRobbedText").textContent = "Robbed by " + trumpCard.stolenBy.name;
        }
    }

    async clearCurrentPlayerAnimation() {
        let playedCards = document.getElementsByClassName('PlayedCardContainer');
        for (let card of playedCards) {
            card.classList.remove('CurrentCardAnimation');
        }
    }

    async addClassNameToPlayedCard(playerId, className) {
        let cardContainer = document.getElementById('playedCard_' + playerId);
        cardContainer.classList.add(className);
    }

    async highlightWinningCard(winningPlayerId) {
        await this.clearCurrentPlayerAnimation();
        await this.addClassNameToPlayedCard(winningPlayerId, 'WinningCardAnimation');
    }
    
    async highlightCurrentPlayer(player) {
        await this.clearCurrentPlayerAnimation();
        await this.addClassNameToPlayedCard(player.id, 'CurrentCardAnimation');
    }

    showWinningPlayer(winningPlayer) {
        window.alert(winningPlayer.name + " won!");
    }

    showSelfPlayerRobbingDialog(trumpCard) {
        this.isRobbing = true;
        hideAllOverlays();
        var robbingCardOverlay = document.getElementById("selfPlayerRobbingCardOverlay");
        if (!robbingCardOverlay) {
            robbingCardOverlay = document.createElement("div");
            robbingCardOverlay.id = "selfPlayerRobbingCardOverlay";
            robbingCardOverlay.classList.add("Overlay");
        } else {
            clearChildrenOfElementById("selfPlayerRobbingCardOverlay");
        }

        let title = document.createElement("div");
        title.innerText = "Select a card from your hand below to drop for the Trump card";
        robbingCardOverlay.appendChild(title);

        let cardNode = buildCardNode("Trump Card", trumpCard.card);
        robbingCardOverlay.appendChild(cardNode);
        
        var skipButton = document.createElement("button");
        skipButton.textContent = "Skip";
        let viewController = this;
        skipButton.addEventListener("click", function() {
            viewController.eventsHandler.sendEventToGameContext('skipRobbingTrumpCard', {});
        })
        robbingCardOverlay.appendChild(skipButton);

        document.getElementById("playedCardsContainer").appendChild(robbingCardOverlay);

        robbingCardOverlay.style.display = "flex";

        this.setSelfPlayerCardsEnabled(true);
    }

    async handleEvent(eventName, eventDetails) {
        if (eventName === 'highlightWinningPlayer') {
            await this.highlightWinningCard(eventDetails.winningPlayerId);
        } else if (eventName === 'highlightCurrentPlayer') {
            await this.highlightCurrentPlayer(eventDetails.player);
        } else if (eventName === 'redrawTrumpCard') {
            this.redrawTrumpCard(eventDetails.trumpCard);
        } else if (eventName === 'showSelfPlayerHand') {
            this.showSelfPlayerHand(eventDetails.selfPlayer);
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
        } else if (eventName === 'showEndOfHandStats') {
            this.showEndOfHandStats(eventDetails);
        } else if (eventName === 'showEndGameStats') {
            this.showEndGameStats(eventDetails);
        } else if (eventName === 'showSelfPlayerRobbingDialog') {
            this.showSelfPlayerRobbingDialog(eventDetails.trumpCard);
        }
    }
}
