const Phaser = require('phaser');

const Thing = require('../../Geoffrey/Thing');
const Game = require('../../Geoffrey/Game');
// TODO: get rid of isExploding behavior?
// explosions are animations and animations shouldn't be things???
// we don't want to create / run animations on the server at all
// isExploding
module.exports = {
  preload: function preloadIsExploding (opts, game) {
    game.load.spritesheet('explode', 'assets/fx/explode.png', { frameWidth: 128, frameHeight: 128 });
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
      key: 'explodes',
      frames: game.anims.generateFrameNumbers('explode', { start: 0, end: 16 }),
      frameRate: 16,
      yoyo: false,
      repeat: 0
    };

    //explosion.animations.add('explodes');
    //explosion.play('explodes', 16, false);
    game.anims.create(config);
    console.log('add event to ', sprite.name)
    sprite.on(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, function(currentAnim, currentFrame, sprite){
      try {
        // game.anims.remove('explodes');
        console.log('destroying', sprite.name)
        sprite.G.destroy();
      } catch (err) {
        console.log(err)
      }
    });
    try {
      sprite.play('explodes');
    } catch (err) {
      console.log('error playing explosion', err)
    }

  },
  update: function updateIsExploding (sprite) {
  }
};

