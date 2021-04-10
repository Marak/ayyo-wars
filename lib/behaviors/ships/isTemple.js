const Behavior = require('../../Geoffrey/Behavior');

// isDracoBorg
module.exports = {
  tags: ['ship'],
  lore: {
    name: 'Temple'
  },
  config: {
    MASS: 500,
    AIR_FRICTION: 0.15,
    THRUST_FORCE: 0.0005,
    ROTATION_SPEED: 0.028,
    MAX_VELCOCITY: {
      x: 3.8,
      y: 3.8
    }
  },
  preload: function preloadDracoBorg (opts, game) {
    game.load.spritesheet('temple', 'assets/ships/temple.png', { frameWidth: 80, frameHeight: 112, start: 0, end: 2 });
    game.load.json('shapes', 'assets/ships/temple.json');
  },
  create: function createIsDracoBorg (sprite, opts, game, config) {

    var name = opts.name, tint = opts.tint;
    var height = opts.height, width = opts.width;

    var x = opts.x || sprite.x || 0;
    var y = opts.y || sprite.x || 0;

    sprite.setTexture('temple');
    sprite.setFrictionAir(0);

    sprite.x = x;
    sprite.y = y;

    //var shapes = game.cache.json.get('shapes');
    //sprite.setBody(shapes.temple)

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

