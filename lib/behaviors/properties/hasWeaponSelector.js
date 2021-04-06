const Behavior = require('../../Geoffrey/Behavior');
const Thing = require('../../Geoffrey/Thing');
const Things = require('../../Geoffrey/Things');
const inputs = require('../../inputs/inputs');

// hasWeaponSelector
let weapons = [
  'hasFusionGun',
  'hasPlasmaCannon',
  'hasTurboLaser',
  'hasFractalRocket'
];
module.exports = {
  create: function hasWeaponSelectorCreate (sprite, opts, game) {
    // const weaponInfo = Thing.create
    console.log('iii', inputs, sprite.name)
    // inputs[sprite.name].primaryWeaponKey 
    let text = Thing.create({
      name: 'weapon-selector-text',
      gameobject: 'text',
      text: 'Press O key to see controls\n\n\nPrimary Weapon: hasFusionGun\nTo switch weapons press: 1,2,3,4',
      x: 60,
      y: 60
    });

  },
  update: function hasWeaponSelectorUpdate (sprite, game) {
    if (sprite.inputs) {
      // change weapon based on action keys, hard-mapped for now to player_1
      // first detach existing weapon
      // then attach new weapon to replace it
      let changedWeapon = false;

      if (sprite.inputs.action1) {
        weapons.forEach(function(w){
          Behavior.detach(w, sprite);
        });
        Behavior.attach('hasFusionGun', sprite);
        changedWeapon = 'hasFusionGun';
      }

      if (sprite.inputs.action2) {
        weapons.forEach(function(w){
          Behavior.detach(w, sprite);
        });
        Behavior.attach('hasPlasmaCannon', sprite);
        changedWeapon = 'hasPlasmaCannon';
        
      }

      if (sprite.inputs.action3) {
        weapons.forEach(function(w){
          Behavior.detach(w, sprite);
        });
        Behavior.attach('hasTurboLaser', sprite);
        changedWeapon = 'hasTurboLaser';
        
      }

      if (sprite.inputs.action4) {
        weapons.forEach(function(w){
          Behavior.detach(w, sprite);
        });
        Behavior.attach('hasFractalRocket', sprite);
        changedWeapon = 'hasFractalRocket';
      }

      if (changedWeapon) {
        Things['weapon-selector-text'].setText(`Press O key to see controls\n\n\nPrimary Weapon: ${changedWeapon}\nTo switch weapons press: 1,2,3,4`);
      }

      // console.log('sss', sprite.inputs.action1);
    }
  }
};