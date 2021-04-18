const Behavior = require('../../Geoffrey/Behavior');

// isFlyingSaucer
module.exports = {
  tags: ['ship'],
  lore: {
    name: 'Flying Saucer'
  },
  config: {
    TEXTURE: 'flying-saucer',
    HEALTH: 40,
    ENERGY: 100,
    ENERGY_RECHARGE_TIME: 100,
    ENERGY_RECHARGE_AMOUNT: 10,
    MASS: 10,
    THRUST_FORCE: 0.022,
    ROTATION_SPEED: 0.022,
    MAX_VELCOCITY: {
      x: 4,
      y: 4
    }
  },
  preload: function preloadFlyingSaucer (opts, game) {
    game.load.spritesheet('flying-saucer', 'assets/ships/flying-saucer.png', { frameWidth: 32, frameHeight: 32, start: 0, end: 2 });
  },
  create: function createIsFlyingSaucer (sprite, opts, game, config) {

    var name = opts.name, tint = opts.tint;
    var height = opts.height, width = opts.width;

    var x = opts.x || sprite.x || 0;
    var y = opts.y || sprite.y || 0;

    sprite.setTexture('flying-saucer');

    sprite.x = x;
    sprite.y = y;

    sprite.height = 32;
    sprite.width = 32;
    sprite.displayHeight = 32;
    sprite.displayWidth = 32;

    sprite.setCircle(18);

    sprite.inputs = opts.inputs || sprite.inputs || {};

    sprite.setMass(config.MASS);

    sprite.G.maxVelocity = config.MAX_VELOCITY || {
      x: 4,
      y: 4
    };

    Behavior.attach('hasHealth', sprite, {
      health: config.HEALTH || 60
    });

    Behavior.attach('hasEnergy', sprite, {
      energy: opts.energy || config.ENERGY,
      rechargeTime: opts.energyRechargeTime || config.ENERGY_RECHARGE_TIME,
      rechargeAmount: opts.energyRechargeAmount || config.ENERGY_RECHARGE_AMOUNT,
    });

    Behavior.attach('hasAlcubierreWarpDrive', sprite, {
      thrustForce: config.THRUST_FORCE,
      rotationSpeed: config.ROTATION_SPEED
    });

    Behavior.attach('diesWithNoHealth', sprite, {});

    Behavior.attach('hasSignals', sprite);

    Behavior.attach('hasTurboLaser', sprite, {
      controlKey: 'primaryWeaponKey'
    });

    Behavior.attach('hasTeleporter', sprite, {
      controlKey: 'secondaryWeaponKey'
    });

  },
  update: function updateIsFlyingSaucer (sprite, game) {
  },
  remove: function removeIsFlyingSaucer (sprite, game) {
    Behavior.detach('hasHealth', sprite);
    Behavior.detach('hasEnergy', sprite);
    Behavior.detach('hasSignals', sprite);
    Behavior.detach('hasTurboLaser', sprite);
    Behavior.detach('hasAlcubierreWarpDrive', sprite);
    Behavior.detach('hasTeleporter', sprite);
  }
};