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
  'isDracoBorg',
  'isVimana',
  'isTemple'
];

let specialWeapons = [
  'hasCloneDevice',
  'hasQuantumLockDevice'
];

let hudState = [
  'all',
  'none'
];

function createHud () {
  
}

module.exports = {
  create: function hasWeaponSelectorCreate (sprite, opts, game) {
    const behaviors = require('../../behaviors');
    sprite.G.currentShipName = 'isMIBCaddy';
    sprite.G.currentPrimaryWeapon = weapons[0];
    sprite.G.currentHUDState = 'all';
    sprite.G.currentSpecialWeapon = specialWeapons[0];
    sprite.G.cyclePrimaryWeaponKeyTime = 0;
    sprite.G.cycleSpecialWeaponKeyTime = 0;
    sprite.G.cycleHUDTime = 0;
    sprite.G.cycleShipTime = 0;
    
    // const weaponInfo = Thing.create
    console.log('iii', inputs, sprite.name)
    // inputs[sprite.name].primaryWeaponKey 
    let text = Thing.create({
      name: 'game-controls',
      gameobject: 'text',
      text: `
        Move: ↑↓←→ 
        Strafe: Hold Shift + ← →
        Fire: A, S, D
        Cycle weapons: Q, W, E
        Change Ship: R
        Toggle HUD: O`,
      x: 5,
      y: 30
    });
    var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "left", boundsAlignV: "middle" };
    text.setStyle(style);

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
    var style = { font: "24px Arial", fill: "#fff", boundsAlignH: "left", boundsAlignV: "middle" };
    shipHUD.setStyle(style);
    

    let primaryWeaponHUD = Thing.create({
      name: 'primaryWeapon-HUD',
      gameobject: 'text',
      text: `${behaviors[sprite.G.currentPrimaryWeapon].lore.name}`,
      x: 76,
      y: 615
    });
    var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    primaryWeaponHUD.setStyle(style);

    let specialWeaponHUD = Thing.create({
      name: 'specialWeapon-HUD',
      gameobject: 'text',
      text: `${behaviors[sprite.G.currentPrimaryWeapon].lore.name}`,
      x: 525,
      y: 615
    });
    var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    specialWeaponHUD.setStyle(style);

    let group = Things['group0'] = game.add.group();
    weapons.forEach(function(weapon){
      var r1 = game.add.rectangle(30, 30, 45, 45, 0x6666ff);
      var label;
      let button = game.add.container();
      if (weapon === 'hasFusionGun') {
        label = game.add.text(15, 15, behaviors[weapon].lore.symbol);
      } else {
        label = game.add.text(15, 15, behaviors[weapon].lore.symbol, { color: 0xBBBBBB });
      }
      label.setFontSize(24);
      button.add(r1);
      Things['label-' + weapon] = label;
      button.add(Things['label-' + weapon]);
      group.add(button);
    });

    Phaser.Actions.GridAlign(group.getChildren(), {
        width: 10,
        height: 10,
        cellWidth: 60,
        cellHeight: 60,
        x: 115,
        y: 720
    });

    let group2 = game.add.group();
    specialWeapons.forEach(function(weapon){
      var r1 = game.add.rectangle(30, 30, 45, 45, tints.red);
      var label;
      if (weapon === 'hasCloneDevice') {
        label = game.add.text(15, 15, behaviors[weapon].lore.symbol);
      } else {
        label = game.add.text(15, 15, behaviors[weapon].lore.symbol, { color: 0x6666ff });
      }
      label.setFontSize(24);
      let button = game.add.container();
      button.add(r1);
      Things['label-' + weapon] = label;
      button.add(label);
      group2.add(button);
    });

    Phaser.Actions.GridAlign(group2.getChildren(), {
        width: 10,
        height: 10,
        cellWidth: 60,
        cellHeight: 60,
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

      if (sprite.inputs.cycleShipKey && game.time.now > sprite.G.cycleShipTime) {
        sprite.G.cycleShipTime = game.time.now + 500;
        let index = ships.indexOf(sprite.G.currentShipName);
        if (index + 1 >= ships.length) {
          index = 0;
        } else {
          index++;
        }
        Behavior.detach(sprite.G.currentShipName, sprite);
        // remove any weapons we may have added
        weapons.forEach(function(w){
          Behavior.detach(w, sprite);
        });
        sprite.G.currentShipName = ships[index];
        Behavior.attach(sprite.G.currentShipName, sprite);
        sprite.G.currentPrimaryWeapon = sprite.G.mappedInputs.primaryWeaponKey[0];
      }

      if (sprite.inputs.cycleHUDKey && game.time.now > sprite.G.cycleHUDTime) {
        sprite.G.cycleHUDTime = game.time.now + 250;
        let index = hudState.indexOf(sprite.G.currentHUDState);
        if (index + 1 >= hudState.length) {
          index = 0;
        } else {
          index++;
        }
        let state = hudState[index];
        sprite.G.currentHUDState = state;
        if (state === 'all') {
          Things['game-controls'].setDepth(2);
          Things['primaryWeapon-HUD'].setDepth(2);
          Things['ship-HUD'].setDepth(2);
        }
        if (state === 'weapons-only') {
          Things['game-controls'].setDepth(-99);
          Things['primaryWeapon-HUD'].setDepth(10);
          Things['ship-HUD'].setDepth(-99);
        }
        if (state === 'none') {
          Things['game-controls'].setDepth(-99);
          Things['ship-HUD'].setDepth(-99);
        }
      }


      weapons.forEach(function(w){
        if (w ===  sprite.G.currentPrimaryWeapon) {
          Things['label-' + w].setColor('white');
        } else {
          Things['label-' + w].setColor('black');
        }
      });

      if (sprite.inputs.cyclePrimaryWeaponKey && game.time.now > sprite.G.cyclePrimaryWeaponKeyTime) {

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
        Things['label-' + weapon].setColor('white');
        sprite.G.cyclePrimaryWeaponKeyTime = game.time.now + 250;
      }
      
      if (sprite.inputs.cycleSpecialWeaponKey && game.time.now > sprite.G.cycleSpecialWeaponKeyTime) {
        specialWeapons.forEach(function(w){
          Behavior.detach(w, sprite);
        });

        let index = specialWeapons.indexOf(sprite.G.currentSpecialWeapon);
        if (index + 1 >= specialWeapons.length) {
          index = 0;
        } else {
          index++;
        }

        let weapon = specialWeapons[index];
        Things['label-' + sprite.G.currentSpecialWeapon].setColor('black');
        sprite.G.currentSpecialWeapon = weapon;
        Behavior.attach(weapon, sprite, {
          controlKey: 'specialWeaponKey'
        });
        Things['label-' + weapon].setColor('white');
        sprite.G.cycleSpecialWeaponKeyTime = game.time.now + 250;

      }

      let currentShipBehavior = behaviors[sprite.G.currentShipName];

      Things['ship-HUD'].setText(`
      ${behaviors[sprite.G.currentShipName].lore.name}\n
      Health: ${sprite.G.health}
      Energy: ${sprite.G.energy}
        Recharge Amount: ${sprite.G.energyRechargeAmount }
        Recharge Time: ${sprite.G.energyRechargeTime }
      Mass: ${currentShipBehavior.config.MASS }
      Thrust Force: ${currentShipBehavior.config.THRUST_FORCE }
      Max Velocity: (${currentShipBehavior.config.MAX_VELCOCITY.x }, ${currentShipBehavior.config.MAX_VELCOCITY.y})
      Rotation Speed: ${currentShipBehavior.config.ROTATION_SPEED }`
      );

      Things['primaryWeapon-HUD'].setText(`
         ${behaviors[sprite.G.currentPrimaryWeapon].lore.name}`
      );

      Things['specialWeapon-HUD'].setText(`
         ${behaviors[sprite.G.currentSpecialWeapon].lore.name}`
      );



      // console.log('sss', sprite.inputs.action1);
    }
  }
};