const Input = {};
const inputs = require('../inputs/inputs');
Input.process = function processInput (scene) {
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
  
  let Things = scene.Things;
  for (let player in inputs) {
    for (let input in inputs[player]) {
      if (!Things[player] || !Things[player].inputs) {
        continue;
      }
      if (scene.input) {
        var key = scene.input.keyboard.addKey(inputs[player][input]);
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
