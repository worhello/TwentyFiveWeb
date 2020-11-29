
(function(exported){

  if (typeof module === "object" && module && typeof module.exports === "object") {
    let gameLogic = require('./gameLogic.js');
    exported.Deck = gameLogic.Deck;
    exported.Card = gameLogic.Card;
    exported.CardSuits = gameLogic.CardSuits;
    exported.CardValues = gameLogic.CardValues;
    exported.TrumpCard = gameLogic.TrumpCard;
    exported.gameLogic = gameLogic;

    let player = require("./player.js");
    exported.Player = player.Player;
  }
  else {
    exported.Deck = Deck;
    exported.Card = Card;
    exported.CardSuits = CardSuits;
    exported.CardValues = CardValues;
    exported.TrumpCard = TrumpCard;

    exported.Player = Player;
  }

})(typeof exports === 'undefined' ? this.share = {} : exports);
