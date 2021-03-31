const Input = {};
const inputs = require('../inputs/inputs');
Input.process = function processInput (game) {
  /*
  if (game.gamestate.inputsDisabled === true) {
    return false;
  }
  */
  const Game = require('./Game');
  
  if (Game.servermode) {
    // console.log('server only')
    return;
  }
  
  if (Game.clientMode) {
    return;
  }
  
  // TODO: seperate logic for multiplayer vs single player
  // TODO: see multiplayer handler code in online.html
  // In single player mode, all controls are handled on one client
  // In multiplayer mode, we only want to send inputs for current player, PLAYER_1
  
  const Things = require('./Things');
  for (let player in inputs) {
    for (let input in inputs[player]) {
      if (!Things[player] || !Things[player].inputs) {
        continue;
      }
      if (game.input) {
        var key = game.input.keyboard.addKey(inputs[player][input]);
        Things[player].inputs = Things[player].inputs || {};
        if (key.isDown) {
          Things[player].inputs[input] = true;
        } else {
          Things[player].inputs[input] = false;
        }
      }
    }
  }
}

Input.removeAll = function removeAllInput (game) {
  const Things = require('./Things');
  for (let player in inputs) {
    for (let input in inputs[player]) {
      if (!Things[player] || !Things[player].inputs) {
        continue;
      }
      console.log('iiii', input, player, inputs[player][input])
      console.log(inputs[player][input])
      var key = game.input.keyboard.removeKey(inputs[player][input]);
    }
  }
}

module.exports = Input;
