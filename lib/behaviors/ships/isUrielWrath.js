const Behavior = require('../../Geoffrey/Behavior');

// isUrielWrath
module.exports = {
  tags: ['ship'],
  lore: {
    name: 'Uriel Wrath'
  },
  config: {
    TEXTURE: 'uriel-wrath',
    HEIGHT: 40,
    WIDTH: 40,
    HEALTH: 90,
    ENERGY: 220,
    ENERGY_RECHARGE_TIME: 220,
    ENERGY_RECHARGE_AMOUNT: 8,
    MASS: 100,
    THRUST_FORCE: 0.0004,
    ROTATION_SPEED: 0.028,
    MAX_VELCOCITY: {
      x: 3.7,
      y: 3.7
    }
  },
  preload: function preloadUrielWrath (opts, game) {
    game.load.spritesheet('uriel-wrath', 'assets/ships/uriel-wrath.png', { frameWidth: 96, frameHeight: 96, start: 0, end: 1 });
  },
  create: function createIsUrielWrath (sprite, opts, game, config) {

    var name = opts.name, tint = opts.tint;
    var height = opts.height, width = opts.width;

    var x = opts.x || sprite.x || 0;
    var y = opts.y || sprite.y || 0;

    sprite.setTexture('uriel-wrath');

    sprite.x = x;
    sprite.y = y;

    sprite.inputs = opts.inputs || sprite.inputs || {};

    sprite.setMass(config.MASS);
    sprite.setFriction(0, 0);

    sprite.G.thrustForce = config.THRUST_FORCE;
    sprite.G.rotationSpeed = opts.rotationSpeed || config.ROTATION_SPEED;
    
    sprite.G.maxVelocity = config.MAX_VELOCITY || {
      x: 3.8,
      y: 3.8
    };

    sprite.height = 40;
    sprite.width = 40;
    sprite.setFriction(0, 0);

    sprite.displayHeight = 40;
    sprite.displayWidth = 40;

    sprite.setRectangle(40, 40);

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
  update: function updateIsUrielWrath (sprite, game) {
  },
  remove: function removeIsUrielWrath (sprite, game) {
    Behavior.detach('hasHealth', sprite);
    Behavior.detach('hasEnergy', sprite);
    Behavior.detach('hasSignals', sprite);
    Behavior.detach('hasPlasmaCannon', sprite);
    Behavior.detach('hasPlasmaPropulsionEngine', sprite);
  }
  
};


