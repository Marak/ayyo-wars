let fullscreen = require('../../utils/fullscreen');

// hasFullScreenControl
module.exports = {
  config: {
    stack: 0
  },
  create: function hasFullScreenControlCreate (sprite, opts, game) {
    sprite.G.fullScreenTime = 0;
  },
  update: function hasFullScreenControlUpdate (sprite, game) {
    if (sprite.inputs && sprite.inputs.fullscreen && !sprite.G.isFullScreen) {
      if (game.time.now > sprite.G.fullScreenTime) {
        // should not be needed?
        sprite.inputs.fullscreen = false;
        sprite.G.fullScreenTime = game.time.now + 5000;
        console.log("aaFIRING SREEN")
        game.scale.toggleFullscreen();
      }
    }
    
  }
};