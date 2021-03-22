const Input = {};
const inputs = require('../inputs/inputs');

Input.process = function processInput (game) {
  const Things = require('./Things');
  for (let player in inputs) {
    for (let input in inputs[player]) {
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

module.exports = Input;
