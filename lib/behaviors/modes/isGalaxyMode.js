const Thing = require('../../Geoffrey/Thing');
const T = Things = require('../../Geoffrey/Things');
const Behavior = require('../../Geoffrey/Behavior');
const tints = require('../../utils/tints');
const starMap = require('../../../data/stars');

let i = 0;
// isHomeScreen
// level0 is current melee / skirmish level
module.exports = {
  preload: function preloadIsHomeScreen (opts, game) {
    // game.load.image('space', 'assets/levels/starfield.jpg');
  },
  create: function createisLevel0 (sprite, opts, game) {

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
       zoomIn: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
       zoomOut: game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
       acceleration: 0.06,
       drag: 0.0005,
       maxSpeed: 1.0
    };

    sprite.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
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
    
        var bmd = game.add.image(x, y, 'missle')
        bmd.tags = ['star'];
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

        T['star-' + i] = bmd;
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
  
    // attaches keyboard inputs for utility keys like ESC, 1, 2, 3, M, O, F, etc...
    // attach('hasKeyboardInputs', game);

    // adds a player display for ship status
    var playerStatusDisplay = Things['playerStatusDisplay'] = game.add.group();
    playerStatusDisplay.width = 700;




  },
  update: function updateisHomeScreen (sprite, game, config, gameUpdate) {
    sprite.controls.update(gameUpdate.delta);
  },
  remove: function removeIsHomeScreen (sprite, game) {
    Behavior.detach('isItemGrid', Things['nav-menu']);
    Things['nav-menu'].G.destroy();
  }
};
