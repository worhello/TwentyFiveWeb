"use strict";

function clearChildrenOfElementById(elementId) {
    let node = document.getElementById(elementId);
    while (node && node.lastChild) {
        node.removeChild(node.lastChild);
    }
}

function getCardUrl(card) {
    return "resources/images/Cards/" + card.cardName + ".svg";
}

function buildCardNode(playerId, card) {
    let cardName = card.cardName;
    let cardNodeContainer = document.createElement("div");
    let cardNode = document.createElement("img");
    cardNode.className = 'Card';
    cardNode.src = getCardUrl(card);
    cardNode.playerId = playerId;

    cardNodeContainer.appendChild(cardNode);
    cardNodeContainer.id = cardName;
    cardNodeContainer.classList.add("CardImgContainer");
    if (card.canPlay === false) {
        cardNodeContainer.classList.add("DisabledSelfPlayerCard");
    }
    cardNodeContainer.disabled = (card.canPlay === false);
    cardNodeContainer.draggable = !(card.canPlay === false);

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
    document.getElementById("startGameButton").disabled = false;
    document.getElementById("connectingLabel").hidden = true;
}

function getPlayedCardDisplayTitle(player) {
    var displayTitle = player.name;
    displayTitle += " [" + player.score + "]";
    return displayTitle;
}

function getCurrentCardSideClassName(currentPlayerNum, numPlayers) {
    if (currentPlayerNum === 1) {
        return "PlayedCardContainer_Center"; // 1 is always the self player
    }

    if (numPlayers === 2 && currentPlayerNum === 2) {
        return "PlayedCardContainer_Center"; // center card
    }

    if (numPlayers % 2 === 0 && ((currentPlayerNum - 1) * 2) === numPlayers) {
        return "PlayedCardContainer_Center";
    }

    let midwayPoint = Math.ceil(numPlayers / 2.0);
    if (currentPlayerNum <= midwayPoint) {
        return "PlayedCardContainer_Left";
    } else {
        return "PlayedCardContainer_Right";
    }
}

function getCardAnglesClassNames(numPlayers) {
    var cardAnglesClassNames = [];

    cardAnglesClassNames.push([ "SelfPlayerPlayedCard" ]);

    for (var i = 2; i <= numPlayers; i++) { // skip the first element, count 1-n instead of 0-(n-1)
        var classes = [];
        classes.push("CardAngle_" + i + "_of_" + numPlayers);

        let currentCardSideClassName = getCurrentCardSideClassName(i, numPlayers);
        if (currentCardSideClassName !== null) {
            classes.push(currentCardSideClassName);
        }

        cardAnglesClassNames.push(classes);
    }

    return cardAnglesClassNames;
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
    constructor(eventsHandler, localisationManager) {
        this.eventsHandler = eventsHandler;
        this.localisationManager = localisationManager;
        this.selfPlayerCardsEnabled = false;
        this.isRobbing = false;
        this.isMultiplayer = false;
        //this.debug_printAllAngles();
    }

    hideStartGameOverlay() {
        hideAllOverlays();
    }

    showOverlayWithButton(overlayContent, buttonText, buttonFunc) {
        hideAllOverlays();
        clearChildrenOfElementById("endGameStatsContainer");
        document.getElementById("endGameStatsContainer").style.display = "block";

        document.getElementById("endGameStatsContainer").appendChild(overlayContent);

        let startButtonCtr = document.createElement("div");
        startButtonCtr.classList.add("EndGamePlayerInfoContainer");
        startButtonCtr.classList.add("EndGameStartNewGameButtonContainer");

        var startNewGameButton = document.createElement("button");
        startNewGameButton.id = "endGameStatsContainer_button";
        startNewGameButton.textContent = buttonText;
        startNewGameButton.addEventListener("click", buttonFunc);
        startButtonCtr.appendChild(startNewGameButton);
        document.getElementById("endGameStatsContainer").appendChild(startButtonCtr);
    }

    showEndOfHandOrGameStats(sortedPlayers, showWinningPlayer, showScores, buttonText, buttonFunc) {
        let playersContainer = document.createElement("div");
        playersContainer.id = "playersContainer";
        var first = true;

        for (let player of sortedPlayers) {
            let isWinner = showWinningPlayer && first;
            if (isWinner) {
                first = false;
            }

            let outer = document.createElement("div");
            outer.classList.add("EndGamePlayerInfoContainer");

            let leftIcon = document.createElement("div");
            leftIcon.classList.add("EndGameAiPlayerIcon");
            outer.appendChild(leftIcon);

            let innerPlayerInfoContainer = document.createElement("div");
            innerPlayerInfoContainer.classList.add("EndGameInnerPlayerInfoContainer");
            outer.appendChild(innerPlayerInfoContainer);

            let rightIcon = document.createElement("div");
            rightIcon.id = "EndGamePlayerStatusInfoContainer_" + player.id;
            rightIcon.classList.add("EndGameWinnerIcon");
            outer.appendChild(rightIcon);

            if (player.isAi) {
                outer.classList.add("EndGameAiPlayer");
                leftIcon.textContent = "🤖";
                leftIcon.title = this.localisationManager.getLocalisedString("playerIsAiTooltip", [ player.name ]);
            }
            else {
                outer.classList.add("EndGameHumanPlayer");
            }

            let playerNameCtr = document.createElement("div");
            playerNameCtr.id = "PlayerNameCtr_" + player.id;

            if (player.isSelfPlayer && this.isMultiplayer) {
                playerNameCtr.textContent = this.localisationManager.getLocalisedString("selfPlayerInListofPlayersName", [ player.name ]);
            }
            else {
                playerNameCtr.textContent = player.name;
            }

            innerPlayerInfoContainer.appendChild(playerNameCtr);

            if (showScores) {
                let playerScoreCtr = document.createElement("div");
                playerScoreCtr.textContent = player.score;
                innerPlayerInfoContainer.appendChild(playerScoreCtr);
            }

            if (isWinner) {
                outer.classList.add("EndGameWinningPlayer");
                rightIcon.textContent = "🎉";
                rightIcon.title =  this.localisationManager.getLocalisedString("playerIsWinnerTooltip", [ player.name ]);
            }

            playersContainer.appendChild(outer);
        }

        this.showOverlayWithButton(playersContainer, buttonText, buttonFunc);
    }

    showEndGameStats(sortedPlayers) {
        this.showEndOfHandOrGameStats(sortedPlayers, true, true, this.localisationManager.getLocalisedString("startNewGameButtonText"), function() {
            showStartGameOverlay();
            clearChildrenOfElementById("endGameStatsContainer");
        });
    }
    
    showEndOfHandStats(eventDetails) {
        let viewController = this;
        let buttonText = this.isMultiplayer ? this.localisationManager.getLocalisedString("markAsReadyButton")
                                            : this.localisationManager.getLocalisedString("startNextRoundButtonText");
        this.showEndOfHandOrGameStats(eventDetails.sortedPlayers, false, true, buttonText, function() {
            if (viewController.isMultiplayer == false) {
                hideAllOverlays();
            }
            viewController.eventsHandler.sendEventToGameContext('startNextRound', { "startingPlayerId": eventDetails.sortedPlayers[0].id });
        });
    }

    showEndOfHandOrGameStats_teams(teamPlayersInfos, gameFinished) {
        // TODO
    }

    cardDragStartHandler(ev) {
        if (this.selfPlayerCardsEnabled && ev.target.disabled === false) {
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
        if (this.selfPlayerCardsEnabled && ev.target.disabled === false && document.getElementById("playedCardsContainer").contains(ev.target)) {
            ev.preventDefault();
            this.cardDragEndHandler();
            let cardName = ev.dataTransfer.getData("text");
            this.playSelfCard(cardName);
        }
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
            if (this.isRobbing) {
                hideAllOverlays();
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
            document.getElementById("playerInfoContainer").classList.add('PlayerCardsContainerEnabled');
            window.scrollTo(0, document.body.scrollHeight);
        } else {
            document.getElementById("playerCardsContainer").classList.add('DisabledSelfPlayerCards');
            document.getElementById("playerInfoContainer").classList.remove('PlayerCardsContainerEnabled');
            window.scrollTo(0, 0);
        }
        document.getElementById('playedCardsContainerWrapper').style.display = 'none';
        document.getElementById('playedCardsContainerWrapper').style.display = 'block';
    }

    buildTrumpCardPlaceholder() {
        let trumpCardContainer = document.createElement("div");
        trumpCardContainer.classList.add('CardContainer');
        trumpCardContainer.id = 'trumpCardContainer';

        let trumpCardTitle = document.createElement("div");
        trumpCardTitle.textContent = this.localisationManager.getLocalisedString("trumpCardTitle");
        let trumpCardRobbed = document.createElement("div");
        trumpCardRobbed.id = "trumpCardRobbedText";
        trumpCardRobbed.style.display = "none";

        let trumpCardImgContainer = document.createElement("div");
        trumpCardImgContainer.id = "trumpCardImgContainer";

        trumpCardContainer.appendChild(trumpCardTitle);
        trumpCardContainer.appendChild(trumpCardRobbed);
        trumpCardContainer.appendChild(trumpCardImgContainer);

        return trumpCardContainer;
    }

    buildPlayedCardPlaceholder(player, extraCardClasses) {
        let playedCardContainer = document.createElement("span");
        playedCardContainer.id = 'playedCard_' + player.id;
        
        if (player.isDealer === true) {
            let isDealerLabel = document.createElement("div");
            isDealerLabel.textContent = this.localisationManager.getLocalisedString("dealerTitle");
            playedCardContainer.appendChild(isDealerLabel);
        }

        let playerNameLabel = document.createElement("div");
        playerNameLabel.id = 'playedCardTitle_' + player.id;
        playerNameLabel.textContent = getPlayedCardDisplayTitle(player);
        playedCardContainer.appendChild(playerNameLabel);

        playedCardContainer.classList.add('CardContainer');
        playedCardContainer.classList.add('PlayedCardContainer');
        for (let cardClassName of extraCardClasses) {
            playedCardContainer.classList.add(cardClassName);
        }

        return playedCardContainer;
    }

    drawPlayedCardsPlaceholders(players) {
        let playedCardArea = document.getElementById("playedCardsContainer");

        let trumpCardContainer = this.buildTrumpCardPlaceholder();
        playedCardArea.appendChild(trumpCardContainer);

        let selfPlayerIndex = players.findIndex(p => p.isSelfPlayer == true);
        let cardAnglesClassNames = getCardAnglesClassNames(players.length);
        var classNamesIndex = (cardAnglesClassNames.length - selfPlayerIndex) % cardAnglesClassNames.length;

        for (let player of players) {
            let playedCardContainer = this.buildPlayedCardPlaceholder(player, cardAnglesClassNames[classNamesIndex]);
            playedCardArea.appendChild(playedCardContainer);

            classNamesIndex = (classNamesIndex + 1) % cardAnglesClassNames.length;
        }
    }

    resetPlayedCardsState() {
        clearChildrenOfElementById("playedCardsContainer");
    }

    resetSelfPlayerState() {
        clearChildrenOfElementById("playerCardsContainer");
    }

    showSelfPlayerHand(selfPlayer, cardsEnabled) {
        this.resetSelfPlayerState();

        let cards = selfPlayer.cards;
        let gameContainer = document.getElementById("gameContainer");
        let viewController = this;

        cards.forEach(function(card) {
            let cardNode = buildCardNode(selfPlayer.id, card);
            cardNode.addEventListener("click", function() {
                if (cardNode.disabled === false) {
                    viewController.playSelfCard(card.cardName);
                }
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

        this.setSelfPlayerCardsEnabled(cardsEnabled);
    }

    redrawTrumpCard(trumpCard) {
        clearChildrenOfElementById("trumpCardImgContainer");

        var trumpCardContainer = document.getElementById("trumpCardImgContainer");

        let cardNode = buildCardNode("Trump Card", trumpCard.card);
        trumpCardContainer.appendChild(cardNode);
        
        if (trumpCard.hasBeenStolen) {
            trumpCardContainer.classList.add("TrumpCardStolen");
            document.getElementById("trumpCardRobbedText").style.display = "block";
            document.getElementById("trumpCardRobbedText").textContent = this.localisationManager.getLocalisedString("robbedByPlayerLabelText", [ trumpCard.stolenBy.name ]);
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

    showSelfPlayerRobbingDialog(trumpCard, skipButtonDisabled, skipButtonDisabledReason) {
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
        title.textContent = this.localisationManager.getLocalisedString("robbingDialogText");
        robbingCardOverlay.appendChild(title);

        let cardNode = buildCardNode("Trump Card", trumpCard.card);
        robbingCardOverlay.appendChild(cardNode);
        
        var skipButton = document.createElement("button");
        skipButton.textContent = this.localisationManager.getLocalisedString("skipRobbingButtonText");
        let viewController = this;
        skipButton.addEventListener("click", function() {
            viewController.eventsHandler.sendEventToGameContext('skipRobbingTrumpCard', {});
            viewController.isRobbing = false;
        });
        skipButton.disabled = (skipButtonDisabled == true);
        var skipButtonContainer = document.createElement("div");
        skipButtonContainer.appendChild(skipButton);
        skipButtonContainer.title = skipButtonDisabledReason;
        robbingCardOverlay.appendChild(skipButtonContainer);

        document.getElementById("playedCardsContainer").appendChild(robbingCardOverlay);

        robbingCardOverlay.style.display = "flex";

        this.setSelfPlayerCardsEnabled(true);
    }

    updateCurrentWinningCard(player, card) {
        let currentWinningCardNodes = document.getElementsByClassName("CurrentWinningCard");
        for (let currentWinningCardNode of currentWinningCardNodes) {
            currentWinningCardNode.classList.remove("CurrentWinningCard");
        }
        let playerCardContainer = document.getElementById('playedCard_' + player.id);
        playerCardContainer.classList.add("CurrentWinningCard");
    }

    showTutorialOverlayMessage(tutorialOverlayMessage, continueFunc) {
        let messageElem = document.createElement("span");
        messageElem.textContent = tutorialOverlayMessage;

        this.showOverlayWithButton(messageElem, this.localisationManager.getLocalisedString("tutorialContinueToNextHand"), function() {
            hideAllOverlays();
            continueFunc();
        });
    }

    async setupInitialState(isSelfPlayerCardsEnabled, players, trumpCard) {
        hideAllOverlays();
        this.setSelfPlayerCardsEnabled(isSelfPlayerCardsEnabled);
        this.resetPlayedCardsState();
        this.drawPlayedCardsPlaceholders(players);
        this.redrawTrumpCard(trumpCard);
    }

    async showGameEndScreen(orderedPlayers) {
        this.resetPlayedCardsState();
        this.resetSelfPlayerState();
        showStartGameOverlay();
        this.showEndGameStats(orderedPlayers);
    }

    showMultiplayerNameInput(continueFunc) {
        this.isMultiplayer = true;
        let container = document.createElement("div");
        let textElem = document.createElement("span");
        textElem.textContent = this.localisationManager.getLocalisedString("multiplayerGetNameReason");
        container.appendChild(textElem);
        container.appendChild(document.createElement("br"));
        let input = document.createElement("input");
        input.type = "text";
        input.placeholder = this.localisationManager.getLocalisedString("inputNamePlaceholder");
        container.appendChild(input);

        this.showOverlayWithButton(container, this.localisationManager.getLocalisedString("tutorialContinueToNextHand"), function() {
            hideAllOverlays();
            continueFunc(input.value);
        });

        document.getElementById("endGameStatsContainer_button").disabled = true;
        input.addEventListener("keyup", function() {
            document.getElementById("endGameStatsContainer_button").disabled = input.value.length < 3;
        });
    }

    updateMultiplayerWaitingScreen(waitingPlayers, needMorePlayers, gameUrl, buttonsEnabled, continueFunc) {
        let buttonText = needMorePlayers ? this.localisationManager.getLocalisedString("addAIsButton")
                                         : this.localisationManager.getLocalisedString("startGameButton");
        this.showEndOfHandOrGameStats(waitingPlayers, false, false, buttonText, function() {
            hideAllOverlays();
            continueFunc();
        });
        let gameUrlContainer = document.createElement("div");

        let gameUrlLabel = document.createElement("span");
        gameUrlLabel.textContent = this.localisationManager.getLocalisedString("copyLinkToShareGameLabel");

        let gameUrlInput = document.createElement("input");
        gameUrlInput.value = gameUrl;
        gameUrlInput.readOnly = true;
        gameUrlInput.size = 72;

        let copyUrlButton = document.createElement("button");
        copyUrlButton.textContent = this.localisationManager.getLocalisedString("copyLinkButtonText");
        copyUrlButton.addEventListener("click", function() {
            gameUrlInput.select();
            document.execCommand("copy");
        });

        gameUrlContainer.appendChild(gameUrlLabel);
        gameUrlContainer.appendChild(document.createElement("br"));
        gameUrlContainer.appendChild(gameUrlInput);
        gameUrlContainer.appendChild(copyUrlButton);

        document.getElementById("playersContainer").appendChild(gameUrlContainer);

        document.getElementById("endGameStatsContainer_button").disabled = !buttonsEnabled;
        if (!buttonsEnabled) {
            document.getElementById("endGameStatsContainer_button").title = this.localisationManager.getLocalisedString("multiplayerLobbyButtonDisabledTooltip");
        }
    }

    handleMultiplayerConnected() {
        //
    }

    handleMultiplayerError() {
        window.alert(this.localisationManager.getLocalisedString("multiplayerConnectionDropped"));
        this.resetPlayedCardsState();
        this.resetSelfPlayerState();
        showStartGameOverlay();
    }

    handlePlayersReadyForNextRoundChanged(readyPlayerIds, disableButtons) {
        for (let playerId of readyPlayerIds) {
            let nameCtr = document.getElementById("PlayerNameCtr_" + playerId);
            let playerInfoCtr = document.getElementById("EndGamePlayerStatusInfoContainer_" + playerId);
            if (playerInfoCtr && nameCtr) {
                playerInfoCtr.textContent = "✔️";
                playerInfoCtr.title = this.localisationManager.getLocalisedString("playerReady", [nameCtr.textContent]);
            }
        }

        document.getElementById("endGameStatsContainer_button").disabled = disableButtons;
    }

    async handleEvent(eventName, eventDetails) {
        // console.log("ViewController received event: "+ eventName);
        if (eventName == 'setupInitialState') {
            await this.setupInitialState(eventDetails.isSelfPlayerCardsEnabled, eventDetails.players, eventDetails.trumpCard);
        } else if (eventName == 'redrawTrumpCard') {
            this.redrawTrumpCard(eventDetails.trumpCard);
        } else if (eventName == 'showGameEndScreen') {
            await this.showGameEndScreen(eventDetails.sortedPlayers);
        } else if (eventName == 'highlightWinningPlayer') {
            await this.highlightWinningCard(eventDetails.winningPlayerId);
        } else if (eventName == 'highlightCurrentPlayer') {
            await this.highlightCurrentPlayer(eventDetails.player);
        } else if (eventName == 'showSelfPlayerHand') {
            this.showSelfPlayerHand(eventDetails.selfPlayer, eventDetails.isEnabled);
        } else if (eventName == 'resetSelfPlayerState') {
            this.resetSelfPlayerState();
        } else if (eventName == 'playCard') {
            this.playCard(eventDetails.player, eventDetails.playedCard);
        } else if (eventName == 'showEndOfHandStats') {
            this.showEndOfHandStats(eventDetails);
        } else if (eventName == 'showSelfPlayerRobbingDialog') {
            this.showSelfPlayerRobbingDialog(eventDetails.trumpCard, eventDetails.skipButtonDisabled, eventDetails.skipButtonDisabledReason);
        } else if (eventName == 'updateCurrentWinningCard') {
            this.updateCurrentWinningCard(eventDetails.player, eventDetails.card);
        } else if (eventName == 'showTutorialOverlayMessage') {
            this.showTutorialOverlayMessage(eventDetails.tutorialOverlayMessage, eventDetails.continueFunc);
        } else if (eventName == 'showMultiplayerNameInput') {
            this.showMultiplayerNameInput(eventDetails.continueFunc);
        } else if (eventName == 'updateMultiplayerWaitingScreen') {
            this.updateMultiplayerWaitingScreen(eventDetails.waitingPlayers, eventDetails.needMorePlayers, eventDetails.gameUrl, eventDetails.buttonsEnabled, eventDetails.continueFunc);
        } else if (eventName == 'multiplayerConnected') {
            this.handleMultiplayerConnected();
        } else if (eventName == 'multiplayerErrorHappened') {
            this.handleMultiplayerError();
        } else if (eventName == 'playersReadyForNextRoundChanged') {
            this.handlePlayersReadyForNextRoundChanged(eventDetails.readyPlayerIds, eventDetails.disableButtons);
        } else if (eventName == 'showEndOfHandOrGameStats_teams') {
            this.showEndOfHandOrGameStats_teams(eventDetails.teamPlayersInfos, eventDetails.gameFinished);
        }
    }

    debug_printAllAngles() {
        let cardWidth = 106;
        let cardHeight = 174;
        let containerRadius = 325;
        let cardsRadius = 230;

        var allStyles = {};

        for (var i = 2; i <= 10; i++) { // 2-10 players
            let angles = calculateAngles(i);
            let zIndices = calculateZIndices(angles.length);

            for (var angleIndex = 1; angleIndex < angles.length; angleIndex++) {
                let angle = angles[angleIndex];
                let zIndex = zIndices[angleIndex];
                let left = Math.round(containerRadius + (cardsRadius * Math.cos(angle)) - (cardWidth/2)) + 'px';
                let top = Math.round(containerRadius + (cardsRadius * Math.sin(angle))  - (cardHeight/2)) + 'px';

                var thisAngle = {};
                thisAngle["left"] = left;
                thisAngle["top"] = top;
                thisAngle["z-index"] = Number(zIndex);

                allStyles[".CardAngle_" + (angleIndex + 1) + "_of_" + i] = thisAngle;
            }
        }

        console.log(JSON.stringify(allStyles));
    }
}

(function() {
    if (typeof module !== 'undefined' && module.exports != null) {
        let e = {};
        e.getCurrentCardSideClassName = getCurrentCardSideClassName;

        module.exports = e;
    }
})();