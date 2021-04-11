const Behavior = require('../../Geoffrey/Behavior');

// isAgharian
module.exports = {
  tags: ['ship'],
  lore: {
    name: 'Agharian'
  },
  config: {
    HEALTH: 140,
    ENERGY: 100,
    ENERGY_RECHARGE_TIME: 500,
    ENERGY_RECHARGE_AMOUNT: 5,
    MASS: 100,
    THRUST_FORCE: 0.06,
    ROTATION_SPEED: 0.06,
    MAX_VELCOCITY: {
      x: 5.0,
      y: 5.0
    }
  },
  preload: function preloadAgharian (opts, game) {
    game.load.spritesheet('agharian', 'assets/ships/agharian.png', { frameWidth: 60, frameHeight: 60, start: 0, end: 2 });
  },
  create: function createIsAgharian (sprite, opts, game, config) {

    var name = opts.name, tint = opts.tint;
    var height = opts.height, width = opts.width;

    var x = opts.x || sprite.x || 0;
    var y = opts.y || sprite.y || 0;

    sprite.setTexture('agharian');

    sprite.x = x;
    sprite.y = y;

    /*
    sprite.height = 85;
    sprite.width = 85;

    sprite.displayHeight = 85;
    sprite.displayWidth = 85;
    */

    sprite.inputs = opts.inputs || sprite.inputs || {};

    sprite.setMass(config.MASS);

    sprite.G.thrustForce = config.THRUST_FORCE;
    sprite.G.rotationSpeed = opts.rotationSpeed || config.ROTATION_SPEED;
    
    sprite.G.maxVelocity = config.MAX_VELOCITY || {
      x: 3.8,
      y: 3.8
    };

    sprite.G.rechargeEnergyTime = 200;
    sprite.G.rechargeEnergyTime = 5;

    Behavior.attach('hasHealth', sprite, {
      health: config.HEALTH || 60
    });

    Behavior.attach('hasEnergy', sprite, {
      energy: opts.energy || config.ENERGY,
      rechargeTime: opts.energyRechargeTime || config.ENERGY_RECHARGE_TIME,
      rechargeAmount: opts.energyRechargeAmount || config.ENERGY_RECHARGE_AMOUNT,
    });

    Behavior.attach('hasPlasmaPropulsionEngine', sprite, {});

    Behavior.attach('diesWithNoHealth', sprite, {});

    Behavior.attach('hasSignals', sprite);

    Behavior.attach('hasPlasmaCannon', sprite, {
      controlKey: 'primaryWeaponKey'
    });

  },
  update: function updateIsAgharian (sprite, game) {
  },
  remove: function removeIsAgharian (sprite, game) {
    Behavior.detach('hasHealth', sprite);
    Behavior.detach('hasEnergy', sprite);
    Behavior.detach('hasSignals', sprite);
    Behavior.detach('hasPlasmaCannon', sprite);
  }
  
};


