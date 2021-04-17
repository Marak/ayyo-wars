const Behavior = require('../../Geoffrey/Behavior');
const Things = require('../../Geoffrey/Things');
const Input = require('../../Geoffrey/Input');

let i = 0;
var Controls = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Controls ()
    {
        Phaser.Scene.call(this, 'settings-controls');
    },

    preload: function ()
    {
      this.load.html('controls-html', 'assets/html/controls.html');
    },

    create: function ()
    {
      this.cameras.main.fadeIn(1000, 0, 0, 0)
      const Thing = require('../../Geoffrey/Thing');
      
      let scene = this;
       console.log('create title screen')
      Things['homescreen'] = this;
      //Behavior.attach('isHomeScreen', this);
      
      console.log(Thing)
      scene.changingScreen = false;

      var element = this.add.dom(515, 420).createFromCache('controls-html');
      element.setPerspective(800);
      this.element = element;
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

      window.inputKey = inputKey;
      
      const screenCenterX = scene.cameras.main.worldView.x + scene.cameras.main.width / 2;
      const screenCenterY = scene.cameras.main.worldView.y + scene.cameras.main.height / 4;

      let logo = Thing.create({
        name: 'welcome-logo',
        x: screenCenterX,
        y: 50,
        gameobject: 'text',
        text: 'Controls',
        style: { font: "74px Arial Black", fill: "#000", boundsAlignH: "left", boundsAlignV: "middle" }
      }, scene);

      logo.setOrigin(0.5);
      logo.setStroke('#ccc', 16);
      logo.setShadow(2, 2, "#333333", 2, true, true);
      logo.setDepth(2);

      let p1 = Thing.create({
        name: 'PLAYER_1',
        x: 0,
        y: 0,
      }, scene);

      let navMenu = Thing.create({
        name: 'nav-menu',
        matter: false
      }, scene);

      navMenu.G.owner = 'PLAYER_1';
      navMenu.x = 400;
      navMenu.y = 400;

    },
    update: function (time, delta) {
      
      
      
      let inputs = require('../../inputs/inputs');
      
      for (let input in inputs.PLAYER_1) {
        var inputKey = this.element.getChildByName('PLAYER_1_' + input);
        if (inputKey) {
          console.log(input, inputKey.value)
        }
      }
      
      //console.log('running update')
      let = hsv = Phaser.Display.Color.HSVColorWheel();
      const top = hsv[i].color;
      const bottom = hsv[359 - i].color;

      this.Things['welcome-logo'].setTint(top, bottom, top, bottom);
      i++;

      if (i === 360) {
        i = 0;
      }


      Input.process(this);
      // Game.update(game);
      for (let thing in this.Things) {
        // console.log('updating', thing, Things[thing].inputs)
        Behavior.process(this.Things[thing], this, { time, delta });
      }
    }

});

module.exports = Controls;