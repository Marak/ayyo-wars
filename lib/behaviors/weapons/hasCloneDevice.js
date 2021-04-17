const Thing = require('../../Geoffrey/Thing');
const T = Things = require('../../Geoffrey/Things');
const Behavior = require('../../Geoffrey/Behavior');

// hasCloneDevice
var MAX_CLONES = 6;
var TOTAL_CLONES = 0;
var DEVICE_RATE = 12000;
module.exports = {
  lore: {
    name: 'Clone Device',
    symbol: 'CD'
  },
  create: function createHasCloneDevice (sprite, opts) {
    sprite.cloneControlKey = opts.controlKey || 'specialWeaponKey';
    sprite.G.cloneDeviceTime = 0;
    sprite.G.clones = [];
  },
  update: function updateHasCloneDevice (sprite, game) {

    // if parent sprite dies, destroy all clones
    if (sprite.health <= 0) {
      sprite.G.clones.forEach(function(s){
        if(typeof s !== 'undefined') {
          s.destroy();
        }
      });
    }

    function createClone (sprite) {

      let clone = Thing.create({
        type: 'clone',
        x: sprite.x,
        y: sprite.y,
        texture: sprite.texture.key
      }, game);
      clone.tint = '0xff0000';

      clone.owner = sprite.name;

      for (let b in sprite.behaviors) {
        if (!sprite.behaviors[b].config.singleton) {
          sprite.behaviors[b].config.inputs = sprite.inputs;
          // issue here where clones don't pick up additional behaviors that are already on ship?
          Behavior.attach(b, clone, sprite.behaviors[b].config); // maybe opts scope?
        }
      }

      if (sprite.name === 'PLAYER_1') {
        Behavior.attach('aiFollow', clone, {
          followTarget: T['PLAYER_2']
        });
      } else {
        Behavior.attach('aiFollow',  clone, {
          followTarget: T['PLAYER_1']
        });
      }
      Behavior.attach('hasLifespan', clone, {
        lifespan: DEVICE_RATE - 10 // slight padding to avoid double triggers
      });
      Behavior.detach('hasCloneDevice', clone);
      // Behavior.detach('hasCloneDevice', clone);
    }

    if ((sprite.inputs && sprite.inputs[sprite.cloneControlKey]) /*|| (sprite.ai && sprite.hasHeavyDamageAlert)*/) { 
      sprite.tint = '0xff0000';
      // if (!sprite.padding) {
      if (game.time.now > sprite.G.cloneDeviceTime) {
        sprite.G.cloneDeviceTime = game.time.now + DEVICE_RATE;
        for (let i = 0; i < MAX_CLONES; i++) {
          createClone(sprite);
        }
      }
    } else {
      sprite.tint = '0xffffff';
    }

  }
};
