// diesWithNoHealth
const Behavior = require('../../Geoffrey/Behavior');
const Thing = require('../../Geoffrey/Thing');
const Things = require('../../Geoffrey/Things');

module.exports ={
  create: function createDiesWithNoHealth (sprite, opts) {
    // should already have hasHealth attached
    sprite.diesWithNoHealthCallback = opts.callback || null;
  },
  update: function updateDiesWithNoHealth (sprite) {
    if (sprite.G.health <= 0 && !sprite.G.dead) {
      // TODO: add explosion / fix detach destroy remove error
      if (sprite.diesWithNoHealthCallback !== null) {
        sprite.diesWithNoHealthCallback(null, sprite);
      }

      let explosion = Thing.create({
        type: 'explosion',
        matter: false,
        x: sprite.x,
        y: sprite.y,
        height: sprite.height * 0.66,
        width: sprite.width * 0.66,
        isStatic: true
      });
      // this isnt working on server, probably because it needs callback
      Behavior.attach('isExploding', explosion);
      sprite.G.destroy();
      sprite.G.dead = true;
    } 
  }
};