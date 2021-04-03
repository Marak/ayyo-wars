// hasHealth
module.exports ={
  create: function createHealth (sprite, opts) {
    sprite.G.health = opts.health || 100;
    sprite.G.maxHealth = opts.maxHealth || opts.health;
  },
  update: function updateHealth (sprite) {
  }
};