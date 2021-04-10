const Behavior = require('../../Geoffrey/Behavior');

// isDracoBorg
module.exports = {
  tags: ['ship'],
  lore: {
    name: 'Vimana'
  },
  config: {
    MASS: 10,
    THRUST_FORCE: 0.0008,
    ROTATION_SPEED: 0.058,
    MAX_VELCOCITY: {
      x: 3.8,
      y: 3.8
    }
  },
  preload: function preloadDracoBorg (opts, game) {
    game.load.spritesheet('vimana', 'assets/ships/vimana.png', { frameWidth: 32, frameHeight: 32, start: 0, end: 2 });
  },
  create: function createIsDracoBorg (sprite, opts, game, config) {

    var name = opts.name, tint = opts.tint;
    var height = opts.height, width = opts.width;

    var x = opts.x || sprite.x || 0;
    var y = opts.y || sprite.x || 0;

    sprite.setTexture('vimana');

    sprite.x = x;
    sprite.y = y;

    sprite.height = 35;
    sprite.width = 35;

    sprite.displayHeight = 35;
    sprite.displayWidth = 35;

    sprite.inputs = opts.inputs || sprite.inputs || {};

    sprite.setMass(config.MASS);

    
    sprite.G.thrustForce = config.THRUST_FORCE;
    sprite.G.rotationSpeed = opts.rotationSpeed || config.ROTATION_SPEED;
    
    sprite.G.maxVelocity = config.MAX_VELOCITY || {
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
  update: function updateIsDracoBorg (sprite, game) {
  }
};

