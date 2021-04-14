const Behavior = require('../../Geoffrey/Behavior');

// isMibCaddy
module.exports = {
  tags: ['ship'],
  lore: {
    name: 'MIB Caddy'
  },
  config: {
    TEXTURE: 'mib-caddy',
    HEIGHT: 18,
    WIDTH: 38,
    HEALTH: 60,
    ENERGY: 100,
    ENERGY_RECHARGE_TIME: 200,
    ENERGY_RECHARGE_AMOUNT: 5,
    MASS: 10,
    THRUST_FORCE: 0.0025,
    ROTATION_SPEED: 0.088,
    MAX_VELCOCITY: {
      x: 3.8,
      y: 3.8
    }
  },
  preload: function preloadMibCaddy (config, game) {
    game.load.spritesheet(config.TEXTURE, `assets/ships/${config.TEXTURE}.png`, { frameWidth: 140, frameHeight: 48, start: 0, end: 4 });
  },
  create: function createIsMibCaddy (sprite, opts, game, config) {

    var name = opts.name, tint = opts.tint;
    var height = opts.height, width = opts.width;

    var x = opts.x || sprite.x || 0;
    var y = opts.y || sprite.y || 0;

    sprite.setTexture(config.TEXTURE);

    sprite.x = x;
    sprite.y = y;

    sprite.height = 18;
    sprite.width = 38;
    sprite.displayHeight = 18;
    sprite.displayWidth = 38;

    sprite.body.customSeparateX = true;
    sprite.body.customSeparateY = true;

    sprite.setRectangle(48, 28)

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
      health: opts.health || config.HEALTH || 60
    });

    Behavior.attach('hasEnergy', sprite, {
      energy: opts.energy || config.ENERGY || 100
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

    Behavior.attach('hasFusionGun', sprite, {
      controlKey: 'primaryWeaponKey'
    });

    Behavior.attach('diesWithNoHealth', sprite, {});

    Behavior.attach('hasSignals', sprite);

    /* TODO: add default weapons
    Behavior.attach('hasThrusters', sprite, {
      controlKey: 'secondaryWeaponKey'
    });
    Behavior.attach('hasTemporalDisruptor', sprite, {
      controlKey: 'specialWeaponKey'
    });
    */

  },
  update: function updateIsMibCaddy (sprite, game) {
  },
  remove: function removeIsMibCaddy (sprite, game) {
    Behavior.detach('hasHealth', sprite);
    Behavior.detach('hasEnergy', sprite);
    Behavior.detach('hasSignals', sprite);
    Behavior.detach('hasFusionGun', sprite);
    Behavior.detach('hasPlasmaPropulsionEngine', sprite);
  }
};


