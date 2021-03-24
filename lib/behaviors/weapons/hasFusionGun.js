const Behavior = require('../../Geoffrey/Behavior');
const Thing = require('../../Geoffrey/Thing');

//  hasFusionGun
let worldScale = 1;
let BULLET_LIFESPAN = 300;
let BULLET_RATE = 30;
let BULLET_SPEED = 200;
let BULLET_STRENGTH = 1;
let BULLET_ENERGY = 0;

module.exports = {
  preload: function preloadMibCaddy (opts, game) {
    game.load.image('bullet', 'assets/weapons/bullets.png');
  },
  create: function createFusionGun (sprite, opts) {
    //sprite.fusionGunSFX = game.add.audio('necroBomb', 0.2);
    BULLET_RATE = opts.BULLET_RATE || BULLET_RATE;
    sprite.G.fusionGunTime = 0;
    if (typeof opts.strength === 'number') {
      BULLET_STRENGTH = opts.strength;
    }
    sprite.G.fusionGunControlKey = opts.controlKey || 'primaryWeaponKey';
  },
  update: function updateFusionGun (sprite, game) {
    if ((sprite.inputs && sprite.inputs[sprite.G.fusionGunControlKey]) || sprite.autofire) {
      if (game.time.now > sprite.G.fusionGunTime) {
        // perform energy check
        if (sprite.energy <= BULLET_ENERGY) {
          return;
        }
        if (typeof sprite.energy === 'number') {
          sprite.energy -= BULLET_ENERGY;
        }
        // energy check passed, create new bullet
        let bullet = Thing.create({
          type: 'bullet',
          x: sprite.x,
          y: sprite.y,
          texture: 'bullet'
        })

        bullet.owner = sprite.name;

        bullet.rotation = sprite.rotation;
        bullet.hardness = 7;
        bullet.impacts = false;

        bullet.weapon = true;
        bullet.height = 10;
        bullet.width = 10;
        bullet.setMass(0);
        bullet.setFriction(0, 0);

        bullet.setBounce(0);
        bullet.setRectangle(5,5);

        Behavior.attach('hasScreenWrap',  bullet);

        //bullet.anchor.set(0.5, 0.5);
        //  and its physics settings
        let newVelocity = {};
        newVelocity.x = sprite.body.velocity.x + (Math.cos(sprite.rotation) * 15);
        newVelocity.y = sprite.body.velocity.y + (Math.sin(sprite.rotation) * 15);
        bullet.setVelocity(newVelocity.x,  newVelocity.y);
        sprite.G.fusionGunTime = game.time.now + BULLET_RATE;

        Behavior.attach('hasLifespan', bullet, {
          lifespan: BULLET_LIFESPAN,
          callback: function () {
            try {
              bullet.G.destroy();
            } catch (err) {
              console.log(err.message)
            }
          }
        });

        Behavior.attach('hasCollisions', bullet, {
          owner: sprite,
          collidesWithSelf: false, // TODO: not supported yet?
          collidesWithSiblings: true,
          collidesWithChildren: true,
          collisionHandler: function (thing) {
            if (typeof thing.hardness !== 'undefined' && thing.hardness > 7) { // TODO: b.hardness instead of 7
              // do nothing
              console.log('not hard enough');
            } else {
              // console.log(T[thing].name)
              thing.G.health -= BULLET_STRENGTH;
              bullet.G.destroy();
            }
          }
        });

      }
    }

  }
};
