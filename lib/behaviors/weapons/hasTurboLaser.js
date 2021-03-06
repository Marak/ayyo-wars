const Thing = require('../../Geoffrey/Thing');
const Behavior = require('../../Geoffrey/Behavior');
const findBestTarget = require('../../utils/findBestTarget');

//  hasTurboLaser
var BULLET_LIFESPAN = 200;
var BULLET_RATE = 6.66;
var BULLET_SPEED = 800;
var BULLET_DAMAGE = 1;
var BULLET_ENERGY = 0;
var i = 0;
module.exports = {
  tags: ['weapon'],
  lore: {
    name: 'Turbo Laser',
    symbol: 'TL',
    flavor: ''
  },
  preload: function preloadMibCaddy (config, game) {
    game.load.spritesheet('turbo-laser', `assets/weapons/turbo-laser.png`, { frameWidth: 10, frameHeight: 10 });
  },
  create: function createTurboLaser (sprite, opts) {
    //sprite.laserBeamSFX = game.add.audio('necroBomb'); // TODO: switch sound wav
    sprite.bulletTime = 0;
    sprite.laserBeamControlKey = opts.controlKey || 'primaryWeaponKey';
    sprite.laserBeams = {};
  },
  update: function updateTurboLaser (sprite, game) {
    // TODO: put this line into common helper? it's long
    if (sprite.inputs && sprite.inputs[sprite.laserBeamControlKey]) {
      if (game.time.now > sprite.bulletTime) {
        if (sprite.G.energy <= BULLET_ENERGY) {
          return;
        }
        if (typeof sprite.G.energy === 'number') {
          sprite.G.energy -= BULLET_ENERGY;
        }
        // energy check passed, create new bullet
        let bullet = Thing.create({
          type: 'turbo-laser',
          x: sprite.x,
          y: sprite.y,
          texture: 'turbo-laser'
        }, game);
        

        const animConfig = {
          key: 'wiggle',
          frames:  game.anims.generateFrameNames('turbo-laser',  { start: 0, end: 1 }),
          frameRate: 12,
          repeat: -1
         };
         game.anims.create(animConfig);
         bullet.play('wiggle')

        bullet.G.owner = sprite.name;
        bullet.G.impacts = false;

        // //bullet.anchor.set(0.5, 0.5);
        bullet.height = 10;
        bullet.width = 10;
        bullet.ctime = game.time.now;
        // mohs scale
        // https://en.wikipedia.org/wiki/Mohs_scale_of_mineral_hardness
        bullet.hardness = 1;
        bullet.setMass(0.25);
        // // attach('hasScreenWrap',  bullet);

        bullet.owner = sprite.owner || sprite.name;
        bullet.x = sprite.x;
        bullet.y = sprite.y;
        //bullet.anchor.setTo(0.5, 0.5);
        Behavior.attach('hasLifespan', bullet, {
          lifespan: BULLET_LIFESPAN,
          callback: function () {
            bullet.G.destroy(true, false);
          }
        }, game);

        Behavior.attach('hasCollisions', bullet, {
          owner: sprite,
          collidesWithSelf: false, // TODO: not supported yet?
          collidesWithSiblings: true,
          collidesWithChildren: true,
          impacts: false,
          collisionHandler: function (thing) {
            thing.G.health = Math.floor(thing.G.health - BULLET_DAMAGE);
            let explosion = Thing.create({
              type: 'explosion',
              matter: false,
              x: bullet.x,
              y: bullet.y,
              height: bullet.height * 0.66,
              width: bullet.width * 0.66,
              isStatic: true
            }, game);
            Behavior.attach('isExploding', explosion);
            bullet.G.destroy();
          }
        });

        bullet.rotation = sprite.rotation;

        var target = findBestTarget(sprite);
        if (target && target !== null) {
          bullet.angle = Phaser.Math.RadToDeg(Math.atan2(target.y - bullet.y, target.x - bullet.x));
          bullet.thrust(0.01)
        } else {
          var newVelocity = {};
          newVelocity.x = sprite.body.velocity.x + (Math.cos(sprite.rotation) * 17);
          newVelocity.y = sprite.body.velocity.y + (Math.sin(sprite.rotation) * 17);
          bullet.setVelocity(newVelocity.x,  newVelocity.y);
        }

        sprite.bulletTime = game.time.now + BULLET_RATE;
      }
    }

  }
};
