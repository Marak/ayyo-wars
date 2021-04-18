const Behavior = require('../../Geoffrey/Behavior');

// isDracoCruiser
module.exports = {
  tags: ['ship'],
  lore: {
    name: 'Draconian Cruiser',
    primaryWeapon: 'Plasma Cannon',
    secondaryWeapon: '',
    specialWeapon: '', 
    flavor: ''
  },
  config: {
    TEXTURE: 'draco-cruiser',
    HEIGHT: 60,
    WIDTH: 100,
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
  preload: function preloadDracoCruiser (opts, game) {
    game.load.spritesheet('draco-cruiser', 'assets/ships/draco-cruiser.png', { frameWidth: 104, frameHeight: 64, start: 0, end: 7 });
  },
  create: function createIsDracoCruiser (sprite, opts, game, config) {

    var name = opts.name, tint = opts.tint;
    var height = opts.height, width = opts.width;

    var x = opts.x || sprite.x || 0;
    var y = opts.y || sprite.y || 0;

    sprite.setTexture('draco-cruiser');

    sprite.x = x;
    sprite.y = y;

    sprite.setRectangle(100, 60);

    sprite.inputs = opts.inputs || sprite.inputs || {};

    sprite.setMass(config.MASS);
    sprite.setFriction(0, 0);

    sprite.G.thrustForce = config.THRUST_FORCE;
    sprite.G.rotationSpeed = opts.rotationSpeed || config.ROTATION_SPEED;
    
    sprite.G.maxVelocity = config.MAX_VELOCITY || {
      x: 3.8,
      y: 3.8
    };

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
  update: function updateIsDracoCruiser (sprite, game) {
  },
  remove: function removeIsDracoCruiser (sprite, game) {
    Behavior.detach('hasHealth', sprite);
    Behavior.detach('hasEnergy', sprite);
    Behavior.detach('hasSignals', sprite);
    Behavior.detach('hasPlasmaCannon', sprite);
    Behavior.detach('hasPlasmaPropulsionEngine', sprite);
  }
  
};


