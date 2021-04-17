const Behavior = require('../Geoffrey/Behavior');
const Thing = require('../Geoffrey/Thing');
const Input = require('../Geoffrey/Input');
const starMap = require('../../data/stars');

let i = 0;
var Demo = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Demo ()
    {
        Phaser.Scene.call(this, 'galaxy');
    },

    preload: function ()
    {
    },

    create: function ()
    {
      let game = this;
      let T = this.Things || {};
      this.G = this.G || {};
      starsGroup = game.add.container();
      mainCam = game.cameras.main;
      //  A space background
      // TODO: replace sprite
      bg = game.add.tileSprite(0, 0, 20000, 20000, '');
      bg.context.fillStyle = '#FFFFFF';
      bg.tint = 0xff0000;
      // T['bg'] = bg;
      var readyRoom = T['skirmish-readyRoom'] = game.add.container();
      mainCam.ignore(T['skirmish-readyRoom']);

      var cursors = game.input.keyboard.createCursorKeys();

      var controlConfig = {
         camera: game.cameras.main,
         left: cursors.left,
         right: cursors.right,
         up: cursors.up,
         down: cursors.down,
         zoomIn: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
         zoomOut: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
         acceleration: 0.06,
         drag: 0.0005,
         maxSpeed: 1.0
      };

      this.G.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
      var cam = game.cameras.main;


      // jumps to a star by x, y positions and also zooms in
      function jumpToStar (star) {
        // find existing star as rendered
        console.log('jumping', star)
        mainCam.zoom = 10;
        mainCam.startFollow(star)
        mainCam.stopFollow(star)
        // TODO: smooth zoom
      }

      function drawStarMap () {
        // draw the galaxy!
        starMap.forEach(function(star, i){
          if (i > 2500) {
            // return;
          }
          //var x = (10 * star.X) - 2000;
          //var y = (10 * star.Y) - 2000;
          if (star.X > 200 || star.Y > 200 || star.X < 140 || star.Y < 140  ) {
            //return;
          }

          // only draw stars within a region of defined space
          var x = (star.X * 2) - 480;
          var y = (star.Y * 2) - 400;
          //var x = star.X;
          //var y = star.Y;
    
          let bmd = Thing.create({
            type: 'star',
            x: x,
            y: y,
            texture: 'missle'
          }, game);
          //var bmd = game.add.image(x, y, 'missle')
          //bmd.tags = ['star'];
          bmd.stardata = star;
          bmd.setInteractive();
    //            game.input.setDraggable(bmd);
          bmd.on('pointerover', function(){
            game.input.setDefaultCursor('pointer');
            //game.canvas.style.cursor = "pointer";
          });
          bmd.on('pointerout', function(){
            game.input.setDefaultCursor('default');
          });

          // this.Things['star-' + i] = bmd;
          try {
            hudCam.ignore(bmd);
          } catch (err) {
      
          }
          //console.log(star.AbsMag)
          var i = 0.2 * star.AbsMag;
          bmd.width = i;
          bmd.height = i;
          bmd.displayWidth = i;
          bmd.displayHeight = i;
          //bmd.setScale(0.2, 0.2);
      
        });
      }
      drawStarMap();

      // when user clicks on a Thing
      game.input.on('gameobjectdown', function (pointer, gameObject, dragX, dragY) {
        if (gameObject.stardata) {
          jumpToStar(gameObject);
        }
      });
  
      // adds a player display for ship status
      var playerStatusDisplay = Things['playerStatusDisplay'] = game.add.group();
      playerStatusDisplay.width = 700;
      // this.cameras.main._zoom = 10;
      
      let text = Thing.create({
        name: 'game-controls',
        gameobject: 'text',
        text: `
          Move: ↑↓←→ 
          Zoom: Z / X`,
        x: 5,
        y: 30
      }, game);
      var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "left", boundsAlignV: "middle" };
      text.setStyle(style);
      
    },
    
    update: function (time, delta) {
      this.G.controls.update(delta);
      let game = this;
      let Things = this.Things;
      let mainCam = this.cameras.main;
      if (mainCam._zoom > 6) {
        // display names of visible stars
        for (var t in Things) {
          var thing = Things[t];
          if (thing.stardata) {
            var star = thing;
            var worldView = mainCam.worldView;
            // do not draw stars outside of current camera world view
            if (star.x > worldView.x + worldView.width) {
              if (thing.starText) {
                thing.starText.setText('');
              }
              continue;
            }

            if (star.x < worldView.x) {
              if (thing.starText) {
                thing.starText.setText('');
              }
              continue;
            }

            if (star.y > worldView.y + worldView.height) {
              if (thing.starText) {
                thing.starText.setText('');
              }
              continue;
            }

            if (star.y < worldView.y) {
              if (thing.starText) {
                thing.starText.setText('');
              }
              continue;
            }

            var absMag = thing.stardata.AbsMag;
            var style = { font: '8px Helvetica', fill: '#ff0044', align: 'left' };
            thing.starText = thing.starText || game.add.text(thing.x, thing.y, 'ffff starrr', style);
            // TODO: only show star text if size of star falls within range
            // need to have stars not be cluttered
            /*
            var i = 0.1 * absMag;
            thing.starText.width = i;
            thing.starText.height = i;
            thing.starText.displayWidth = i;
            thing.starText.displayHeight = i;
            */
            
            thing.starText.setText(thing.stardata.Name);
          }
        }
      } else {
        for (var t in Things) {
          var thing = Things[t];
          if (thing.stardata) {
            if (thing.starText) {
              thing.starText.setText('');
            }
          }
        }
      }
      
    }

});

module.exports = Demo;