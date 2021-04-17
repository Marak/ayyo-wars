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
      this.viewSettingsTime = 0;
      this.viewingSettings = false;
      let scene = this;
       console.log('create title screen')
      Things['homescreen'] = this;
      //Behavior.attach('isHomeScreen', this);
      
      console.log(Thing)
      scene.changingScreen = false;

      let form = Thing.create({
        x: 515,
        y: 420,
        type: 'controller-form'
      }, this)


      Behavior.attach('isControllerMapper', form)

      // window.inputKey = inputKey;
      
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

      //console.log('running update')
      let = hsv = Phaser.Display.Color.HSVColorWheel();
      const top = hsv[i].color;
      const bottom = hsv[359 - i].color;

      this.Things['welcome-logo'].setTint(top, bottom, top, bottom);
      i++;

      if (i === 360) {
        i = 0;
      }


      if (
        (this.Things['PLAYER_1'].inputs.escape)
        && !this.viewingSettings
      ) {
        
        if (this.time.now > this.viewSettingsTime) {
          this.viewingSettings = true;
          this.viewSettingsTime = this.time.now + 2000;
          this.scene.stop();
          this.Things = {};
          // scene.Things = {};
          this.scene.resume('skirmish-battle');
          // this.viewingSettings = false;
          game.scene.getScene('skirmish-battle').viewingSettings = false;
        }
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