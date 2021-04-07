const Thing = require('../../Geoffrey/Thing');
const T = Things = require('../../Geoffrey/Things');
const Behavior = require('../../Geoffrey/Behavior');

// hasCloneDevice
var MAX_CLONES = 6;
var TOTAL_CLONES = 0;
var DEVICE_RATE = 12000;
module.exports ={
  create: function createHasCloneDevice (sprite, opts) {
    // should already have hasHealth attached
    sprite.cloneControlKey = opts.controlKey || 'specialWeaponKey';
    sprite.isCloning = false;
    sprite.clones = 0;
    sprite.G.cloneDeviceTime = 0;
    sprite.G.clones = [];
  },
  update: function updateHasCloneDevice (sprite, game) {

    if (sprite.health <= 0) {
      sprite.G.clones.forEach(function(s){
        if(typeof s !== 'undefined') {
          s._destroy();
        }
      });
    }

    function createClone (sprite) {

      let clone = Thing.create({
        type: 'clone',
        x: sprite.x,
        y: sprite.y,
        texture: 'mib-caddy'
      });
      clone.tint = '0xff0000';

      // clone.name = sprite.name + '_CLONE_' + sprite.clones;
      clone.owner = sprite.name;
      Behavior.attach('isMIBCaddy',  clone, {
        name: clone.name,
        //followTarget: T["PLAYER_1"],
        inputs: sprite.inputs,
        health: sprite.health
      });
      
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
    }

    if ((sprite.inputs && sprite.inputs[sprite.cloneControlKey]) /*|| (sprite.ai && sprite.hasHeavyDamageAlert)*/) { 
      sprite.tint = '0xff0000';
      // if (!sprite.isCloning) {
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
