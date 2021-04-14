const Behavior = require('../../Geoffrey/Behavior');

// isDracoBorg
module.exports = {
  tags: ['ship'],
  lore: {
    name: 'Draconian Borg'
  },
  config: {
    TEXTURE: 'draco-borg',
    HEALTH: 200,
    ENERGY: 200,
    ENERGY_RECHARGE_TIME: 200,
    ENERGY_RECHARGE_AMOUNT: 12,
    MASS: 50,
    THRUST_FORCE: 0.002,
    ROTATION_SPEED: 0.048,
    MAX_VELCOCITY: {
      x: 3.8,
      y: 3.8
    }
  },
  preload: function preloadDracoBorg (opts, game) {
    game.load.spritesheet('draco-borg', 'assets/ships/draco-borg.png', { frameWidth: 88, frameHeight: 88, start: 0, end: 4 });
  },
  create: function createIsDracoBorg (sprite, opts, game, config) {

    var name = opts.name, tint = opts.tint;
    var height = opts.height, width = opts.width;

    var x = opts.x || sprite.x || 0;
    var y = opts.y || sprite.y || 0;

    sprite.setTexture('draco-borg');

    sprite.x = x;
    sprite.y = y;

    sprite.height = 66;
    sprite.width = 66;

    sprite.displayHeight = 66;
    sprite.displayWidth = 66;

    // TODO: shapes.json
    sprite.setRectangle(90, 90);

    sprite.inputs = opts.inputs || sprite.inputs || {};

    sprite.setMass(config.MASS);
    sprite.setFriction(0, 0);

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

    Behavior.attach('hasPlasmaPropulsionEngine', sprite, {
      thrustForce: sprite.G.thrustForce,
      rotationSpeed: sprite.G.rotationSpeed
    });

    Behavior.attach('diesWithNoHealth', sprite, {});

    Behavior.attach('hasSignals', sprite);

    Behavior.attach('hasTurboLaser', sprite, {
      controlKey: 'primaryWeaponKey'
    });

  },
  update: function updateIsDracoBorg (sprite, game) {
  },
  remove: function removeIsDracoBorg (sprite, game) {
    Behavior.detach('hasHealth', sprite);
    Behavior.detach('hasEnergy', sprite);
    Behavior.detach('hasSignals', sprite);
    Behavior.detach('hasTurboLaser', sprite);
    Behavior.detach('hasPlasmaPropulsionEngine', sprite);
  }
  
};


