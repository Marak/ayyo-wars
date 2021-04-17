const Behavior = require('../../Geoffrey/Behavior');
const Things = require('../../Geoffrey/Things');
const Input = require('../../Geoffrey/Input');


// isControllerMapper
module.exports = {
  create: function hasControllerMapperCreate (sprite, opts, game) {

    var element = game.add.dom(515, 420).createFromCache('controls-html');
    element.setPerspective(800);
    game.element = element;
    let inputs = require('../../inputs/inputs');
    
    for (let player in inputs) {
      for (let input in inputs[player]) {
        var inputKey = element.getChildByName(player + '_' +input);
        if (inputKey) {
          let availableKeyboardInputs = Object.keys(Phaser.Input.Keyboard.KeyCodes);
    
          availableKeyboardInputs.forEach(function(key){
            var el = document.createElement('option');
            el.text = key;
            if (key === inputs[player][input]) {
              el.selected = true;
            }
            inputKey.appendChild(el);
          });
        }
      }
    }
  },
  update: function hasControllerMapperUpdate (sprite, game) {
    let inputs = require('../../inputs/inputs');
    for (let input in inputs.PLAYER_1) {
      var inputKey = game.element.getChildByName('PLAYER_1_' + input);
      if (inputKey) {
        // TODO: save current configuration to local storage and live instance
        // console.log(input, inputKey.value)
      }
    }
  }
};