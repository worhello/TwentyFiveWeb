function getBestCardFromOptions(cardOptions, trumpCard, playedCards) {
    return cardOptions[0]; // TODO
}

function getWinningCard(trumpCard, playedCards) {
    return playedCards[0]; // TODO
}


if (typeof module !== 'undefined' && module.exports != null) {
    let gameLogicExports = {};
    gameLogicExports.getBestCardFromOptions = getBestCardFromOptions;
    gameLogicExports.getWinningCard = getWinningCard;
    module.exports = gameLogicExports;
}