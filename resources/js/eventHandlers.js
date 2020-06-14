"use strict";
window.onload = function(event) {
    this.document.getElementById("startGameButton").addEventListener("click", function(ev) {
        onStartButtonClicked();
    });
    showStartGameOverlay();
}