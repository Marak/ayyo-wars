const Thing = require('../../Geoffrey/Thing');
const T = Things = require('../../Geoffrey/Things');
const Behavior = require('../../Geoffrey/Behavior');
const findBestTarget = require('../../utils/findBestTarget');

// hasHomingMissle
module.exports = {
  lore: {
    name: 'Homing Missle',
    symbol: 'HM',
    flavor: ''
  },
  config: {
    BULLET_DAMAGE: 40,
    BULLET_ENERGY: 20,
    BULLET_RATE: 2200,
    BULLET_LIFESPAN: 99999,
    BULLET_MAX: 5
  },
  preload: function preloadHomingMissle (opts, game) {
    game.load.image('missle', 'assets/weapons/missle.png');
  },
  create: function createHomingMissle (sprite, opts) {
    sprite.G.homingMissleControlKey = opts.controlKey || 'primaryWeaponKey';
    sprite.G.homingMissles = sprite.G.homingMissles || [];
    sprite.G.homingMissleTime = 0;
  },
  update: function updateHomingMissle (sprite, game, config) {

    if (sprite.inputs[sprite.G.homingMissleControlKey]) {

      if (sprite.G.homingMissles.length > config.BULLET_MAX) {
        return;
      }

      if (sprite.G.energy <= config.BULLET_ENERGY) {
        return;
      }
      if (typeof sprite.G.energy === 'number') {
        sprite.G.energy -= config.BULLET_ENERGY;
      }

      if (game.time.now > sprite.G.homingMissleTime) {
        let missle = Thing.create({
          type: 'missle',
          x: sprite.x,
          y: sprite.y,
          texture: 'missle'
        }, game);
        
        missle.displayHeight = 12;
        missle.displayWidth = 35;

        missle.G.weapon = true;
        missle.G.destructable = true;
        missle.G.ctime = game.time.now;
        missle.G.lifespan = config.BULLET_LIFESPAN;

        sprite.G.homingMissles.push(missle);
        sprite.G.homingMissleTime = game.time.now + config.BULLET_RATE;

        missle.booster = false;
        missle.rotation = sprite.rotation;
        missle.thrust(0.001);
        missle.G.owner = sprite.name;
        missle.x = sprite.x;
        missle.y = sprite.y;

        missle.G.maxVelocity = {
          x: 1,
          y: 1
        };

        missle.health = 1;
        Behavior.attach('diesWithNoHealth', missle);
        Behavior.attach('hasScreenWrap', missle);
        Behavior.attach('aiFollow', missle);
        Behavior.attach('hasCollisions', missle, {
          owner: sprite,
          collidesWithSelf: true, // not supported?
          collidesWithSelfDelay: 8000, // not supported?
          collidesWithSiblings: true,
          collidesWithChildren: true,
          collisionHandler: function (thing) {
            if (thing.G.health) {
              thing.G.health -= config.BULLET_DAMAGE;
              // explode(missle);
              Behavior.detach('aiFollow', missle);
              let explosion = Thing.create({
                type: 'explosion',
                matter: false,
                x: missle.x,
                y: missle.y,
                height: missle.height * 1.33,
                width: missle.width * 1.33,
                isStatic: true
              }, game);
              Behavior.attach('isExploding', explosion, {}, game);
              missle.G.destroy();
            }
          }
        });

        /*
        var config = {
          key: 'homing-missle',
          frames: game.anims.generateFrameNumbers('missle'),
          frameRate: 12,
          repeat: 4
        };
        var anim = game.anims.create(config);
        anim.on('complete', function(currentAnim, currentFrame, sprite){
          try {
            // mummy.destroy();
            anim.destroy();
          } catch (err) {
      
          }
        });
        missle.anims.load('homing-missle');
        missle.anims.play('homing-missle');
        */

      }

    }

 

  },
  remove: function removeHomingMissle(sprite) {
  }
};