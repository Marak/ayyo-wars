const Behavior = require('../../Geoffrey/Behavior');
const Thing = require('../../Geoffrey/Thing');
const tints = require('../../utils/tints');

//  hasFractalRocket
var worldScale = 1;
var BULLET_LIFESPAN = 8000;
var BULLET_RATE = 200;
var BULLET_SPEED = 180;
var BULLET_DAMAGE = 10;
var BULLET_ENERGY = 10;
var FRACTAL_MAX_SPLITS = 4;
var FRACTAL_SPLIT_RATE = 2000;
var FRAGMENT_HEAL = 2;
var i = 0;

var mersenne = require('../../utils/mersenne');
mersenne.seed(1);

module.exports = {
  config: {
    BULLET_LIFESPAN: 8000,
    BULLET_RATE: 200,
    BULLET_SPEED: 180,
    BULLET_DAMAGE: 10,
    BULLET_MASS: 1,
    BULLET_THRUST: 0.02,
    BULLET_ENERGY: 10,
    FRACTAL_MAX_SPLITS: 4,
    FRACTAL_SPLIT_RATE: FRACTAL_SPLIT_RATE,
    FRAGMENT_HEAL: 2
  },
  create: function createFractalRocket (sprite, opts) {
    sprite.fractalRocketTime = 0;
    sprite.fractalRocketSplit = 0;
    sprite.fractalRocketControlKey = opts.controlKey || 'primaryWeaponKey';
    // sprite.fractalRocketSFX = game.add.audio('fractal-rocket', 1);
    sprite.fractalRockets = {};
  },
  update: function updateFractalRocket (sprite, game, config) {
    function fireBullet (angle, start, split, index) {
      var start = start || sprite;

      if (sprite.energy <= config.BULLET_ENERGY && split !== true) {
        return;
      }

      sprite.firingFractalRocket = true;

      if (typeof sprite.energy === 'number' && split !== true) {
        sprite.energy -= config.BULLET_ENERGY;
      }

      let bullet = Thing.create({
        type: 'bullet',
        x: sprite.centerX,
        y: sprite.centerY,
        texture: 'bullet'
      });

      bullet.G.owner = sprite.name;

      bullet.weapon = true;
      bullet.displayHeight = 20;
      bullet.displayWidth = 20;
      bullet.health = 1;
      bullet.destructable = true;
      bullet.ctime = game.time.now;
      bullet.tint = tints['brown'];

      // mohs scale
      // https://en.wikipedia.org/wiki/Mohs_scale_of_mineral_hardness
      bullet.hardness = 1;

      // put bullet into local object for easy group reference
      sprite.fractalRockets[bullet.name] = bullet;
      
      
      Behavior.attach('hasScreenWrap',  bullet);
      Behavior.attach('diesWithNoHealth', bullet);

      bullet.owner = sprite.name;
      if (start.body && bullet.body) {
        bullet.x = start.x;
        bullet.y = start.y;
        bullet.angle = start.angle;
      }

      //var scaleX = sprite.scale.x * 0.9998;
      //var scaleY = sprite.scale.y * 0.9998;
      //sprite.scale.setTo(scaleX, scaleY);

      // fragments have a random lifespan
      if (split) {
        // bullet.lifespan = mersenne.rand() * config.BULLET_LIFESPAN; // too large?
        bullet.lifespan = config.BULLET_LIFESPAN;
      } else {
        bullet.lifespan = config.BULLET_LIFESPAN;
      }

      Behavior.attach('hasLifespan', bullet, {
        lifespan: bullet.lifespan,
        callback: function () {
          try {
            bullet.G.destroy();
            delete sprite.fractalRockets[bullet.name];
          } catch (err) {
            console.log('errr', err);
          }
        }
      });
      Behavior.attach('hasCollisions', bullet, {
        owner: sprite,
        collidesWithSelf: false,
        collidesWithSiblings: false,
        collidesWithChildren: false,
        impacts: false,
        beforeCollisionCheck: function (thing, pair) {
          var t1 = pair.bodyA.gameObject;
          var t2 = pair.bodyB.gameObject;
          if (!t1 || !t2) {
            return;
          }
          if (t1.name === t2.owner || t1.owner === t2.name) {
            if (game.time.now - t2.ctime > 2000) {
              thing.G.health += config.FRAGMENT_HEAL;
              // change size of ship by scale with max scale
              if (thing.scale.x < 1.5 && thing.scale.y < 1.5) {
                var scaleX = thing.scale.x * 1.008;
                var scaleY = thing.scale.y * 1.008;
                thing.scale.setTo(scaleX, scaleY);
              }
              // absorb(t2);
              t2.G.destroy();
              delete sprite.fractalRockets[t2.name];
              
              //delete T[t2.name];
              //delete sprite.fractalRockets[t2.name];
              pair.isActive = false;
              // sprite.fractalRockets.splice(index, 1);
            }
          }
        },
        collisionHandler: function (thing) {
          // sprite.megaBlastDamageSFX.play();
          thing.G.health = Math.floor(thing.G.health - config.BULLET_DAMAGE);
          bullet.G.destroy(true, true);
          delete sprite.fractalRockets[bullet.name];
          
        },
        additionalCollisionCheck: function (thing, b) {
          // console.log('additionalCollisionCheck ')
        }
      });

      // console.log('firing split', angle)
      
      //      bullet.setDrag(-1);
      bullet.setMass(config.BULLET_MASS);
      bullet.setRectangle(30, 30);
      bullet.setFriction(0, 0);
      // create random angle from 5-60
      // var randomSplitAngle = Math.floor((Math.random() * 60) + 5);
      var randomSplitAngle = Math.floor((mersenne.rand() * 60) + 5);
      // console.log('game recog', game)
      bullet.angle = sprite.angle;
      if (angle === 1) {
        // shoots left split
        bullet.rotation -= randomSplitAngle;
      } else if (angle === 2) {
        // do nothing ( shoots straight )
      } else if (angle === 3) {
        // shoots right split
        bullet.rotation += randomSplitAngle;
      }
      bullet.thrust(config.BULLET_THRUST);
      sprite.fractalRocketTime = game.time.now + config.BULLET_RATE;
    }
    if ((sprite.inputs && sprite.inputs[sprite.fractalRocketControlKey]) || sprite.autofire) {
      if (game.time.now > sprite.fractalRocketTime) {
        fireBullet();
      } else {
        // do nothing
      }
    }

    var fireSplit = false;
    if (sprite.inputs && sprite.inputs['secondaryWeaponKey']) {
      fireSplit = true;
    }
    if (sprite.ai && Object.keys(sprite.fractalRockets).length > 4) {
      fireSplit = true;
    }
    if (fireSplit) {
      // TODO: set maxium amount of splits at once ( 4? )
      // TODO: using special weapon split should take energy
      if (game.time.now > sprite.fractalRocketSplit && Object.keys(sprite.fractalRockets).length < 100) {
        // split bullets 2 more ways, 1 bullet turns into 3
        Object.keys(sprite.fractalRockets).forEach(function(name, i){
          var b = sprite.fractalRockets[name];
          // TODO: lower lifespan for splits?
          fireBullet(1, b, true, i);
          fireBullet(3, b, true, i);
        });
        sprite.fractalRocketSplit = game.time.now + config.FRACTAL_SPLIT_RATE;
      }

    }

  }
};
