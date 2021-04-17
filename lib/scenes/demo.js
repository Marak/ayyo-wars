const Behavior = require('../Geoffrey/Behavior');
let globalCollisionHandler = require('../Geoffrey/Collisions');

const Thing = require('../Geoffrey/Thing');
const Things = require('../Geoffrey/Things');
const Input = require('../Geoffrey/Input');

let i = 0;
var Demo = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Demo ()
    {
        Phaser.Scene.call(this, 'demo');
    },

    preload: function ()
    {
      this.load.image('space', 'assets/levels/starfield.jpg');
      
      this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
        globalCollisionHandler(event, bodyA, bodyB);
      });

    },

    create: function ()
    {
      this.cameras.main.fadeIn(1000, 0, 0, 0)
      
      console.log('demo.create');
      let game = this;

      let bg = game.add.tileSprite(0, 0, 20000, 20000, 'space');
      bg.context.fillStyle = '#FFFFFF';
      bg.tint = 0xff0000;
      bg.setDepth(-1);

      const screenCenterX = game.cameras.main.worldView.x + game.cameras.main.width / 2;
      const screenCenterY = game.cameras.main.worldView.y + game.cameras.main.height / 2;

      let logo = Thing.create({
        name: 'welcome-logo',
        x: screenCenterX,
        y: screenCenterY,
        gameobject: 'text',
        text: 'DEMO',
        style: { font: "74px Arial Black", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" }
      }, game);

      // game.text2 = game.add.text(screenCenterX, screenCenterY, 'Ayyo Wars', { font: "74px Arial Black", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" });
      logo.setOrigin(0.5);
      logo.setStroke('#ccc', 16);
      logo.setShadow(2, 2, "#333333", 2, true, true);
      logo.setDepth(2);

      /*
      // Behavior.attach('allOtherPlayersDead', sprite);
      let sun = Thing.create({
        name: 'sun-0',
        x: 500,
        y: 500,
        isStatic: true,
        texture: 'mib-caddy'
      });
      Behavior.attach('hasGravity', sun);
      */

      let startingLocation = {
        x: 300,
        y: 250
      };

      let p1 = Thing.create({
        name: 'PLAYER_1',
        x: startingLocation.x,
        y: startingLocation.y,
        texture: 'mib-caddy'
      }, this);

      startingLocation = {
        x: 100,
        y: 250
      };

      let p2 = Thing.create({
        name: 'PLAYER_2',
        x: startingLocation.x,
        y: startingLocation.y,
        texture: 'mib-caddy'
      }, this);

      Behavior.attach('isMIBCaddy', p1);
      Behavior.attach('hasWeaponSelector', p1);
      Behavior.attach('hasCloneDevice', p1);
      // Behavior.attach('hasQuantumLockDevice', p1);
      Behavior.attach('isVimana', p2, { 
        health: 10
      }, this);

      p1.setDepth(66);
      p2.setDepth(99);

      /*
      Behavior.attach('aiFollow', p2, { 
        followTarget: p1
      });
      */
      

      let a1 = Thing.create({
        type: 'asteroid',
        matter: true,
        x: startingLocation.x + 100,
        y: startingLocation.y + 100
      }, this);

      Behavior.attach('isAsteroid', a1, { 
        health: 10,
        height: 200,
        width: 200
      }, this);

      Behavior.attach('hasScreenWrap', p1);
      Behavior.attach('hasScreenWrap', p2);
      Behavior.attach('hasScreenWrap', a1);
      //  Start the RT Scene
       // this.scene.launch('renderScene');
        // this.scene.start('demo');
    },
    
    update: function (time, delta) {
      //console.log('demo.update');
      //return;
      
      let = hsv = Phaser.Display.Color.HSVColorWheel();
      const top = hsv[i].color;
      const bottom = hsv[359 - i].color;
      if (this.Things['welcome-logo']) {
        this.Things['welcome-logo'].setTint(top, bottom, top, bottom);
      }
      i++;

      if (i === 360) {
        i = 0;
      }
      
      let scene = this;
      Input.process(this);
      // Game.update(game);
      for (let thing in this.Things) {
        // console.log('updating', thing, Things[thing].inputs)
        Behavior.process(this.Things[thing], this, { time, delta });
      }
      
      if (this.Things['PLAYER_1'] && this.Things['PLAYER_1'].inputs.escape && !this.escapingPage) {
        this.escapingPage = true;
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
          this.scene.stop('demo');
          scene.Things = {};
          this.scene.start('title');
          this.escapingPage = false;
      	});
        
      }
      
    }

});

module.exports = Demo;