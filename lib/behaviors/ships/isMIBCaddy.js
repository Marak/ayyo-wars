const Behavior = require('../../Geoffrey/Behavior');

// isMibCaddy
module.exports = {
  tags: ['ship'],
  config: {
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
  },
  preload: function preloadMibCaddy (opts, game) {
    game.load.spritesheet('mib-caddy', 'assets/ships/mib-caddy.png', { frameWidth: 140, frameHeight: 48, start: 0, end: 4 });
  },
  create: function createIsMibCaddy (sprite, opts, game, config) {
    sprite.shipType = 'mib-caddy';
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

    sprite.setBounce(0.8);
    sprite.setBounce(0,0);

    sprite.setMass(config.MASS);

    sprite.inputs = opts.inputs || sprite.inputs || {};

    sprite.maxSpeed = opts.maxSpeed || config.MAX_SPEED;
    sprite.reverseThrust = opts.reverseThrust || config.REVERSE_THRUST;
    sprite.thrustForce = config.THRUST_FORCE;
    sprite.rotationSpeed = opts.rotationSpeed || config.ROTATION_SPEED;
    sprite.strafeSpeed = opts.strafeSpeed || config.STRAFE_SPEED;
    sprite.maxVelocity = config.MAX_VELOCITY || {
      x: 3.8,
      y: 3.8
    };

    sprite.rechardEnergyTime = 200;
    sprite.rechargeEnergyRate = 5;

    Behavior.attach('hasHealth', sprite, {
      health: opts.health || 60
    });

    Behavior.attach('hasEnergy', sprite, {
      health: opts.health || 60
    });

    Behavior.attach('hasPlasmaPropulsionEngine', sprite, {});

    Behavior.attach('hasFusionGun', sprite, {
      controlKey: 'primaryWeaponKey'
    });

    Behavior.attach('diesWithNoHealth', sprite, {});

    Behavior.attach('hasSignals', sprite);
    sprite.body.customSeparateX = true;
    sprite.body.customSeparateY = true;

    /*
    attach('hasEnergy', sprite, {
      energy: opts.energy || 100
    });
    attach('diesWithNoHealth', sprite, {});
    attach('hasThrusters', sprite, {
      controlKey: 'secondaryWeaponKey'
    });
    attach('hasTemporalDisruptor', sprite, {
      controlKey: 'specialWeaponKey'
    });
    */

  },
  update: function updateIsMibCaddy (sprite, game) {
    // TODO: replace with Behavior.ai code block
    if (sprite.ai && sprite.health <= 20) {
      sprite.fireTemporalDisruptor = true;
    } else {
      sprite.fireTemporalDisruptor = false;
    }

  }
};


