// hasMaxVelocity
module.exports ={
  create: function hasMaxVelocityCreate (sprite, opts) {
    sprite.G.maxVelocity = opts.maxVelocity || {
      x: 4,
      y: 4
    };
  },
  update: function hasMaxVelocityUpdate (sprite) {
    if (sprite && sprite.body) {
      // calculate the max velocity for x and y axis
      let maxVelocityX = sprite.body.velocity.x > sprite.G.maxVelocity.x ? 1 : sprite.body.velocity.x < -sprite.G.maxVelocity.x ? -1 : null;
      let maxVelocityY = sprite.body.velocity.y > sprite.G.maxVelocity.y ? 1 : sprite.body.velocity.y < -sprite.G.maxVelocity.y ? -1 : null;
    
      // check each axis to see if the maximum velocity has been exceeded,
      // if so, set the velocity explicity to the max value ( clamping maximum speed )
      if (maxVelocityX) {
        sprite.setVelocity(sprite.G.maxVelocity.x * maxVelocityX, sprite.body.velocity.y);
      }
      if (maxVelocityY) {
        sprite.setVelocity(sprite.body.velocity.x, sprite.G.maxVelocity.y * maxVelocityY);
      }
    }
  }
};
