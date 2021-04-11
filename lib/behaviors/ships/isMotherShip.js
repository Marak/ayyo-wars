const Behavior = require('../../Geoffrey/Behavior');

// isMothership
module.exports = {
  tags: ['ship'],
  lore: {
    name: 'Mothership'
  },
  config: {
    HEALTH: 180,
    ENERGY: 200,
    ENERGY_RECHARGE_TIME: 200,
    ENERGY_RECHARGE_AMOUNT: 12,
    MASS: 20,
    THRUST_FORCE: 0.001,
    ROTATION_SPEED: 0.028,
    MAX_VELCOCITY: {
      x: 3.7,
      y: 3.7
    }
  },
  preload: function preloadMothership (opts, game) {
    game.load.spritesheet('mothership', 'assets/ships/mothership.png', { frameWidth: 96, frameHeight: 96, start: 0, end: 1 });
  },
  create: function createIsMothership (sprite, opts, game, config) {

    var name = opts.name, tint = opts.tint;
    var height = opts.height, width = opts.width;

    var x = opts.x || sprite.x || 0;
    var y = opts.y || sprite.y || 0;

    sprite.setTexture('mothership');

    sprite.x = x;
    sprite.y = y;

    sprite.height = 85;
    sprite.width = 85;

    sprite.displayHeight = 85;
    sprite.displayWidth = 85;

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
  update: function updateIsMothership (sprite, game) {
  },
  remove: function removeIsMothership (sprite, game) {
    Behavior.detach('hasHealth', sprite);
    Behavior.detach('hasEnergy', sprite);
    Behavior.detach('hasSignals', sprite);
    Behavior.detach('hasPlasmaCannon', sprite);
  }
  
};


