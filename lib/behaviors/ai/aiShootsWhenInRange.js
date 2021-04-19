// aiShootsWhenInRange
// fires all weapons whenever it can
module.exports = {
  tags: ['ai'],
  create: function createAiShootsWhenInRange (sprite, opts) {
    sprite.followTarget = opts.followTarget;
    sprite.range = sprite.range || opts.range || 520;
    opts.weapons = opts.weapons || {
      'primaryWeapon': true,
      'secondaryWeapon': false,
      'specialWeapon': false
    };
//    sprite.range = 20;
    // sprite.ai = true;
  },
  update: function updateAiShootsWhenInRange (sprite, game) {
    let T = game.Things;
  
    // TODO: check for closest object instead of just followTarget
    if (sprite.followTarget && T[sprite.followTarget.name]) {
      var target =  sprite.followTarget;
      var d1 = Phaser.Math.Distance.Between(sprite.x, sprite.y, sprite.followTarget.x, sprite.followTarget.y);
      //var d2 = game.physics.arcade.distanceBetween(missle, T["PLAYER_3"]);
      //console.log('range', d1, sprite.range)
      var angle =  Phaser.Math.RadToDeg(Math.atan2(target.y - sprite.y, target.x - sprite.x));
      //console.log('angle', angle, sprite.angle)
      var angleDiff = Math.abs(angle - sprite.angle);
      if (d1 < sprite.range && angleDiff < 4) { // TODO: replace with estimated range of weapon
        // TODO: replace with using key inputs instead of autofire
        /*
        sprite.inputs['primaryWeaponKey'] = true;
        sprite.inputs['secondaryWeaponKey'] = true;
        sprite.inputs['specialWeaponKey'] = true;
        */
        // Remark: autofire option is being depreciated for direct input control
        // TODO: invert control of AI and inputs
        // AI should only set state of sprite.brain, and sprite itself should react
        // TODO: use opts.weapons
        // sprite.brain.mainWeapons = true;
        sprite.inputs['primaryWeaponKey'] = true;
      } else {
        // is this even needed? will it not reset to false every loop anyway? maybe not.
        // TODO: needs to be replaced with checks for sprite.owner or sprite.name....issue with new keyboard inputs
        /*
        sprite.inputs['primaryWeaponKey'] = false;
        sprite.inputs['secondaryWeaponKey'] = false;
        sprite.inputs['specialWeaponKey'] = false;
        */
        // sprite.brain.mainWeapons = false;
        sprite.inputs['primaryWeaponKey'] = false;
        
      }
    } else {
      // is this even needed? will it not reset to false every loop anyway? maybe not.
      /*
      sprite.inputs['primaryWeaponKey'] = false;
      sprite.inputs['secondaryWeaponKey'] = false;
      sprite.inputs['specialWeaponKey'] = false;
      */
      // sprite.brain.mainWeapons = false;
      sprite.inputs['primaryWeaponKey'] = false;
      
    }
    // TODO: smoother rotation which respects ships variable rotation rate
  },
  remove: function removeAiShootsWhenInRange (sprite) {
    // sprite.autofire = false;
    // sprite.ai = false;
    // TODO: update to new inputs api
    try {
      sprite.inputs['primaryWeaponKey'] = false;
      sprite.inputs['secondaryWeaponKey'] = false;
      sprite.inputs['specialWeaponKey'] = false;
    } catch (err) {
      
    }
  }
};


