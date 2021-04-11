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
    sprite.height = 10;
    sprite.width = 10;
    sprite.displayHeight = 25;
    sprite.displayWidth = 25;
    sprite.height = sprite.height * 2;
    sprite.width = sprite.width * 2;
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
      frames: game.anims.generateFrameNumbers('explode'),
      frameRate: 16,
      yoyo: false,
      repeat: 0
    };

    let explosion = Thing.create({
      type: 'explosion-holder',
      matter: false,
      x: sprite.x,
      y: sprite.y,
      isStatic: true
    });

    explosion.height = sprite.height * .75;
    explosion.width = sprite.width * .75;

    explosion.skipCollision = true;
    
    explosion.displayHeight = sprite.displayHeight * .75;
    explosion.displayWidth = sprite.displayWidth * .75;

    //explosion.animations.add('explodes');
    //explosion.play('explodes', 16, false);
    game.anims.create(config);

    sprite.on(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, function(currentAnim, currentFrame, sprite){
      try {
        // game.anims.remove('explodes');
        explosion.G.destroy();
        sprite.G.destroy();
      } catch (err) {
        console.log(err)
      }
    });
    try {
      sprite.play('explodes');
    } catch (err) {
      sprite.G.destroy();
    }

  },
  update: function updateIsExploding (sprite) {
  }
};

