const Behavior = require('../../Geoffrey/Behavior');

// isMibCaddy
module.exports = {
  tags: ['ship'],
  lore: {
    name: 'MIB Caddy'
  },
  config: {
    MASS: 10,
    THRUST_FORCE: 0.0025,
    ROTATION_SPEED: 0.088,
    MAX_VELCOCITY: {
      x: 3.8,
      y: 3.8
    }
  },
  preload: function preloadMibCaddy (opts, game) {
    game.load.spritesheet('mib-caddy', 'assets/ships/mib-caddy.png', { frameWidth: 140, frameHeight: 48, start: 0, end: 4 });
  },
  create: function createIsMibCaddy (sprite, opts, game, config) {

    var name = opts.name, tint = opts.tint;
    var height = opts.height, width = opts.width;

    var x = opts.x || sprite.x || 0;
    var y = opts.y || sprite.x || 0;

    sprite.x = x;
    sprite.y = y;

    sprite.height = 18;
    sprite.width = 38;
    sprite.displayHeight = 18;
    sprite.displayWidth = 38;

    sprite.inputs = opts.inputs || sprite.inputs || {};

    sprite.setMass(config.MASS);

    sprite.reverseThrust = opts.reverseThrust || config.REVERSE_THRUST;
    sprite.thrustForce = config.THRUST_FORCE;
    sprite.rotationSpeed = opts.rotationSpeed || config.ROTATION_SPEED;
    sprite.strafeSpeed = opts.strafeSpeed || config.STRAFE_SPEED;
    sprite.maxVelocity = config.MAX_VELOCITY || {
      x: 3.8,
      y: 3.8
    };

    sprite.G.rechardEnergyTime = 200;
    sprite.G.rechargeEnergyRate = 5;

    Behavior.attach('hasHealth', sprite, {
      health: opts.health || 60
    });

    Behavior.attach('hasEnergy', sprite, {
      energy: opts.energy || 100
    });

    Behavior.attach('hasPlasmaPropulsionEngine', sprite, {});

    Behavior.attach('hasFusionGun', sprite, {
      controlKey: 'primaryWeaponKey'
    });

    Behavior.attach('diesWithNoHealth', sprite, {});

    Behavior.attach('hasSignals', sprite);
    sprite.body.customSeparateX = true;
    sprite.body.customSeparateY = true;

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
  }
};


