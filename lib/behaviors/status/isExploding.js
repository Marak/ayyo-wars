const Phaser = require('phaser');

const Thing = require('../../Geoffrey/Thing');
const Game = require('../../Geoffrey/Game');
// TODO: get rid of isExploding behavior?
// explosions are animations and animations shouldn't be things???
// we don't want to create / run animations on the server at all
// isExploding
module.exports = {
  preload: function preloadIsExploding (opts, game) {
    game.load.spritesheet('explosion', 'assets/fx/explosion.png', { frameWidth: 64, frameHeight: 64, endFrame: 23 });
  },
  create: function createDiesWithNoHealth (sprite, opts, game) {

    let height = opts.height || 10;
    let width = opts.width || 10;
    sprite.height = height;
    sprite.width = width;
    sprite.displayHeight = height;
    sprite.displayWidth = width;

    // should explosion be in front or behind of target sprite?
    //explosion.depth = -1;
    if (Game.servermode === true) {
      return false;
      /*
      game.time.addEvent(Phaser.Timer.SECOND * 4, function(){
        sprite.G.destroy();
      }, this);
      */
    }

    var config = {
       key: 'explodeAnimation',
       frames: game.anims.generateFrameNumbers('explosion', { start: 0, end: 23, first: 23 }),
       frameRate: 30,
       repeat: 0
    };

    game.anims.create(config);
    sprite.on(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, function(currentAnim, currentFrame, sprite){
      try {
        sprite.G.destroy();
      } catch (err) {
        console.log(err)
      }
    });
    try {
      sprite.play('explodeAnimation');
    } catch (err) {
      console.log('error playing explosion', err)
    }

  },
  update: function updateIsExploding (sprite) {
  }
};

