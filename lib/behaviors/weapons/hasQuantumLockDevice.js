const Behavior = require('../../Geoffrey/Behavior');
const Thing = require('../../Geoffrey/Thing');
const T = require('../../Geoffrey/Things');
const tints = require('../../utils/tints');

// hasQuantumLockDevice
module.exports = {
  lore: {
    name: 'Quantum Lock',
    symbol: 'QL'
  },
  config: {
    stack: 0
  },
  create: function createQuantumLockDevice (sprite, opts) {
    sprite.G.quantumLockDeviceControlKey = opts.controlKey || 'secondaryWeaponKey';
    sprite.G.quantumLockEngaged = false;
  },
  update: function updateQuantumLockDevice (sprite, game) {

    function isTargeting (sprite, thing) {
      
      // Do not target anything without a body
      if (!T[thing].body) {
        return false
      }
      
      // Do not target itself
      if (T[thing].name === sprite.name) {
        return false;
      }
      // Do not target things ship owns ( unless it's a captured piece )
      if (T[thing].owner === sprite.name && T[thing].captured !== true) {
        return false;
      }
      return true;
    }

    // freezes all things not owned by current sprite
    function freezeThings () {
      for (var thing in T) {
        if (isTargeting(sprite, thing)) {
          if (!T[thing].ogVelocity) {
            T[thing].ogVelocity = {
              x: T[thing].body.velocity.x,
              y: T[thing].body.velocity.y
            }
            // console.log('saving velocity', thing, T[thing].ogVelocity);
          }
          T[thing].G.isFrozen = true;
          if (T[thing].body) {
            T[thing].setVelocity(0, 0);
          }
        }
      }
    }

    // unfreezes all things not owned by current sprite
    // TODO: needs better velocity resume logic
    function unfreezeThings () {
      for (var thing in T) {
        if (isTargeting(sprite, thing)) {
          if (typeof T[thing].ogVelocity !== 'undefined') {
            // console.log('resume velocity', thing, T[thing].ogVelocity )
            T[thing].G.isFrozen = false;
            if (T[thing].body) {
              T[thing].setVelocity(T[thing].ogVelocity.x, T[thing].ogVelocity.y);
              delete T[thing].ogVelocity;
            }
          }
        }
      }
    }

    if (sprite.inputs[sprite.G.quantumLockDeviceControlKey]) {
      sprite.G.quantumLockEngaged = true;
      freezeThings();
      sprite.energy -= 1;
    } else {
      if (sprite.G.quantumLockEngaged) {
        unfreezeThings();
        sprite.G.quantumLockEngaged = false;
      }
    }
  }
};
