const Behavior = require('../../Geoffrey/Behavior');

const Thing = require('../../Geoffrey/Thing');
const Things = require('../../Geoffrey/Things');
const inputs = require('../../inputs/inputs');
const tints = require('../../utils/tints');

// hasWeaponSelector
let weapons = [
  'hasFusionGun',
  'hasPlasmaCannon',
  'hasTurboLaser',
  'hasFractalRocket',
  'hasHomingMissle',
  'hasEyeOfRa'
];

let ships = [
  'isMIBCaddy',
  'isDracoBorg'
];

let specialWeapons = [
  'hasCloneDevice',
  'hasQuantumLockDevice'
];

function createHud () {
  
}

module.exports = {
  create: function hasWeaponSelectorCreate (sprite, opts, game) {
    const behaviors = require('../../behaviors');
    sprite.G.currentShipName = 'isMIBCaddy';
    sprite.G.currentPrimaryWeapon = weapons[0];
    sprite.G.currentSpecialWeapon = specialWeapons[0];
    sprite.G.cyclePrimaryWeaponKeyTime = 0;
    sprite.G.cycleShipTime = 0;
    
    // const weaponInfo = Thing.create
    console.log('iii', inputs, sprite.name)
    // inputs[sprite.name].primaryWeaponKey 
    let text = Thing.create({
      name: 'weapon-selector-text',
      gameobject: 'text',
      text: `
        Ship: ${sprite.G.currentShipName }\n
        Primary Weapon: ${sprite.G.currentPrimaryWeapon }\n
        Move: ↑↓←→
        Fire: A, S, D
        To cycle weapons press: Q, W, E
        Change Ship: R`,
      x: 5,
      y: 30
    });

    let shipHUD = Thing.create({
      name: 'ship-HUD',
      gameobject: 'text',
      text: `
        Ship: ${sprite.G.currentShipName }\n
        Health: ${sprite.G.health }\n
        Energy: ${sprite.G.energy }\n`,
      x: 660,
      y: 30
    });

    let group = Things['group0'] = game.add.group();
    weapons.forEach(function(weapon){
      var r1 = game.add.rectangle(30, 30, 30, 30, 0x6666ff);
      var label;
      let button = game.add.container();
      if (weapon === 'hasFusionGun') {
        label = game.add.text(20, 22, behaviors[weapon].lore.symbol);
      } else {
        label = game.add.text(20, 22, behaviors[weapon].lore.symbol, { color: 0xBBBBBB });
      }
      button.add(r1);
      Things['label-' + weapon] = label;
      button.add(Things['label-' + weapon]);
      group.add(button);
    });

    Phaser.Actions.GridAlign(group.getChildren(), {
        width: 10,
        height: 10,
        cellWidth: 45,
        cellHeight: 45,
        x: 60,
        y: 720
    });

    let group2 = game.add.group();
    specialWeapons.forEach(function(weapon){
      var r1 = game.add.rectangle(30, 30, 30, 30, tints.red);
      var label;
      if (weapon === 'hasCloneDevice') {
        label = game.add.text(20, 22, behaviors[weapon].lore.symbol);
      } else {
        label = game.add.text(20, 22, behaviors[weapon].lore.symbol, { color: 0x6666ff });
      }
      let button = game.add.container();
      button.add(r1);
      button.add(label);
      group2.add(button);
    });

    Phaser.Actions.GridAlign(group2.getChildren(), {
        width: 10,
        height: 10,
        cellWidth: 45,
        cellHeight: 45,
        x: 660,
        y: 720
    });

  },
  update: function hasWeaponSelectorUpdate (sprite, game) {
    const behaviors = require('../../behaviors');
    if (sprite.inputs) {
      // change weapon based on action keys, hard-mapped for now to player_1
      // first detach existing weapon
      // then attach new weapon to replace it
      let changedWeapon = false;

      if (sprite.inputs.cycleShipKey && game.time.now > sprite.G.cycleShipTime) {
        sprite.G.cycleShipTime = game.time.now + 250;
        
      }

      if (sprite.inputs.cyclePrimaryWeaponKey && game.time.now > sprite.G.cyclePrimaryWeaponKeyTime) {
        console.log('cyclePrimaryWeaponKeycyclePrimaryWeaponKeycyclePrimaryWeaponKey')
        changedWeapon = true;
        weapons.forEach(function(w){
          Behavior.detach(w, sprite);
        });
        
        let index = weapons.indexOf(sprite.G.currentPrimaryWeapon);
        console.log('index', index)
        if (index + 1 >= weapons.length) {
          index = 0;
        } else {
          index++;
        }
        console.log('windex', index)
        
        let weapon = weapons[index];
        console.log('weapon', weapon)
        
        Things['label-' + sprite.G.currentPrimaryWeapon].setColor('black');
        sprite.G.currentPrimaryWeapon = weapon;
        Behavior.attach(weapon, sprite);
        changedWeapon = weapon;
        Things['label-' + weapon].setColor('white');
        sprite.G.cyclePrimaryWeaponKeyTime = game.time.now + 250;

      }

      if (changedWeapon) {
        Things['weapon-selector-text'].setText(`
        Press O key to see controls\n
        Primary Weapon: ${sprite.G.currentPrimaryWeapon }\n
        Move: ↑↓←→ 
        Fire: A, S, D
        To cycle weapons press: Q, W, E`,
        );
      }

      
      let currentShipBehavior = behaviors['isMIBCaddy'];
      console.log('behaviors', behaviors)
      Things['ship-HUD'].setText(`
        Ship: ${behaviors[sprite.G.currentShipName].lore.name}\n
        Primary Weapon: ${behaviors[sprite.G.currentPrimaryWeapon].lore.name}
        Secondary Weapon: ${sprite.G.currentSecondaryWeapon }
        Special Weapon: ${behaviors[sprite.G.currentSpecialWeapon].lore.name}
        
        Health: ${sprite.G.health }
        Energy: ${sprite.G.energy }
        Recharge Rate: ${sprite.G.rechargeEnergyRate },
        
        Mass: ${currentShipBehavior.config.MASS },
        Thrust Force: ${currentShipBehavior.config.THRUST_FORCE },
        Max Velocity: X: ${currentShipBehavior.config.MAX_VELCOCITY.x } Y: ${currentShipBehavior.config.MAX_VELCOCITY.y }
        Rotation Speed: ${currentShipBehavior.config.ROTATION_SPEED }`
      );

        /*
      MAX_SPEED: 300,
      MAX_VELCOCITY: {
        x: 3.8,
        y: 3.8
      },
      THRUST_FORCE: 0.0025,
      REVERSE_THRUST: 300,
      ROTATION_SPEED: 0.088,
      STRAFE_SPEED: 600,
      MASS: 10
      */

      // console.log('sss', sprite.inputs.action1);
    }
  }
};