const Behavior = require('../../Geoffrey/Behavior');

// isMibCaddy
module.exports = {
  tags: ['ship'],
  preload: function preloadMibCaddy (opts, game) {
    game.load.spritesheet('mib-caddy', 'assets/ships/mib-caddy.png', { frameWidth: 140, frameHeight: 48, start: 0, end: 4 });
  },
  create: function createIsMibCaddy (sprite, opts, game) {
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

    sprite.setMass(2);
    sprite.setBounce(0.8);

    sprite.setFriction(0,0);
    sprite.inputs = opts.inputs || sprite.inputs || {};

    sprite.maxSpeed = opts.maxSpeed || 300;
    sprite.reverseThrust = opts.reverseThrust || 300;

    sprite.thrustForce = 0.0025;
    sprite.rotationSpeed = opts.rotationSpeed || 0.088;

    sprite.strafeSpeed = opts.strafeSpeed || 600;

    sprite.rechardEnergyTime = 200;
    sprite.rechargeEnergyRate = 5;
    
    sprite.maxVelocity = {
      x: 3.8,
      y: 3.8
    };

    sprite.inputEnabled = true;

    Behavior.attach('hasHealth', sprite, {
      health: opts.health || 60
    });

    Behavior.attach('hasPlasmaPropulsionEngine', sprite, {});

    Behavior.attach('hasFusionGun', sprite, {
      controlKey: 'primaryWeaponKey'
    });

    Behavior. attach('diesWithNoHealth', sprite, {});

    /*
    attach('hasEnergy', sprite, {
      energy: opts.energy || 100
    });
    attach('hasSignals', sprite);
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


