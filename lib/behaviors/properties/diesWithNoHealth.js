// diesWithNoHealth
const Behavior = require('../../Geoffrey/Behavior');

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
      Behavior.attach('isExploding', sprite);
      sprite.G.destroy();
      sprite.G.dead = true;
    } 
  }
};