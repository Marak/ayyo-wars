// hasLifespanCreate
module.exports ={
  create: function hasLifespanCreate (sprite, opts) {
    sprite.G.lifespan = opts.lifespan || 2000;
    opts.callback = opts.callback || function () {
      // console.log('missing hasLifespan callback')
      sprite.G.destroy(true, false)
    };
    var timer = game.time.delayedCall(sprite.G.lifespan, function(){
      opts.callback();
    });
  },
  update: function hasLifespanUpdate (sprite) {
  }
};
