const Thing = require('../../Geoffrey/Thing');

// isExploding
module.exports = {
  preload: function preloadIsExploding (opts, game) {
    game.load.spritesheet('explode', 'assets/fx/explode.png', { frameWidth: 128, frameHeight: 128 });
  },
  create: function createDiesWithNoHealth (sprite, opts) {
    if (!(sprite && sprite.x && sprite.y)) {
      return;
    }
    var explosion = Thing.create({
      type: 'explosion',
      matter: false,
      x: sprite.x,
      y: sprite.y,
      texture: 'explode'
    });
    explosion.height = 10;
    explosion.width = 10;
    explosion.displayHeight = 25;
    explosion.displayWidth = 25;
    explosion.height = sprite.height * 2;
    explosion.width = sprite.width * 2;
    // should explosion be in front or behind of target sprite?
    //explosion.depth = -1;
    var config = {
      key: 'explodes',
      frames: game.anims.generateFrameNumbers('explode'),
      frameRate: 16,
      yoyo: false,
      repeat: 0
    };
    game.anims.create(config);
    explosion.anims.load('explodes');
    explosion.anims.play('explodes');
    explosion.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function(currentAnim, currentFrame, sprite){
      try {
        explosion.G.destroy();
      } catch (err) {
        console.log(err)
      }
    });
  },
  update: function updateIsExploding (sprite) {
  }
};

