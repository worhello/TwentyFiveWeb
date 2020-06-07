"use strict";
window.onload = function(event) {
    this.document.getElementById("startGameButton").addEventListener("click", function(ev) {
        let numPlayersSelect = document.getElementById("numPlayersSelect");
        let numPlayers = numPlayersSelect.options[numPlayersSelect.selectedIndex].value;
        window.gameContext = new GameContext(numPlayers);
        window.gameContext.startGame();
    });
}