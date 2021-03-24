// hasLifespanCreate
module.exports ={
  create: function hasLifespanCreate (sprite, opts) {
    sprite.lifespan = opts.lifespan || 2000;
    opts.callback = opts.callback || function () {
      console.log('missing hasLifespan callback')
      sprite.G.destroy(true, false)
    };
    var timer = game.time.delayedCall(sprite.lifespan, function(){
      opts.callback();
    });
  },
  update: function hasLifespanUpdate (sprite) {
  }
};
