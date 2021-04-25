const Behavior = require('../../Geoffrey/Behavior');
const Thing = require('../../Geoffrey/Thing');
const tints = require('../../utils/tints');

//  hasFractalRocket
var mersenne = require('../../utils/mersenne');
mersenne.seed(1);

let i = 0;
module.exports = {
  lore: {
    name: 'Fractal Rocket',
    symbol: 'FR',
    flavor: ''
  },
  config: {
    BULLET_LIFESPAN: 8000,
    BULLET_RATE: 200,
    BULLET_SPEED: 180,
    BULLET_DAMAGE: 10,
    BULLET_MASS: 1,
    BULLET_THRUST: 0.02,
    BULLET_ENERGY: 10,
    FRACTAL_MAX_SPLITS: 4,
    FRACTAL_SPLIT_RATE: 2000,
    FRACTAL_MAX_FRAGMENTS: 40,
    FRAGMENT_HEAL: 2
  },
  preload: function preloadMibCaddy (config, game) {
    game.load.image('fractal-rocket', 'assets/weapons/fractal-rocket.png');
  },
  create: function createFractalRocket (sprite, opts, game, config) {
    sprite.G.fractalRocketTime = 0;
    sprite.G.fractalRocketSplit = 0;
    sprite.G.fractalRocketControlKey = opts.controlKey || 'primaryWeaponKey';
    sprite.G.fractalRockets = {};
  },
  update: function updateFractalRocket (sprite, game, config) {
    function fireBullet (angle, start, split, index) {
      var start = start || sprite;

      if (sprite.G.energy <= config.BULLET_ENERGY && split !== true) {
        return;
      }

      if (typeof sprite.G.energy === 'number' && split !== true) {
        sprite.G.energy -= config.BULLET_ENERGY;
      }

      let bullet = Thing.create({
        type: 'fractal-rocket',
        x: sprite.centerX,
        y: sprite.centerY,
        texture: 'fractal-rocket'
      }, game);

      bullet.G.owner = sprite.name;

      bullet.displayHeight = 25;
      bullet.displayWidth = 18;
      bullet.G.health = 1;
      bullet.G.destructable = true;
      bullet.G.ctime = game.time.now;

      // mohs scale
      // https://en.wikipedia.org/wiki/Mohs_scale_of_mineral_hardness
      bullet.G.hardness = 1;

      // put bullet into local object for easy group reference
      sprite.G.fractalRockets[bullet.name] = bullet;
      
      
      Behavior.attach('hasScreenWrap',  bullet);
      Behavior.attach('diesWithNoHealth', bullet);

      bullet.G.owner = sprite.name;
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
        bullet.G.lifespan = config.BULLET_LIFESPAN;
      } else {
        bullet.G.lifespan = config.BULLET_LIFESPAN;
      }

      Behavior.attach('hasLifespan', bullet, {
        lifespan: bullet.G.lifespan,
        callback: function () {
          try {
            delete sprite.G.fractalRockets[bullet.name];
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
          if (t1.name === t2.G.owner || t1.G.owner === t2.name) {
            if (game.time.now - t2.G.ctime > 2000) {
              console.log('self collides', thing.scale  )
              thing.G.health += config.FRAGMENT_HEAL;
              // change size of ship by scale with max scale
              if (thing.scaleX < 1.5 && thing.scaleY < 1.5) {
                var scaleX = thing.scaleX * 1.008;
                var scaleY = thing.scaleY * 1.008;
                thing.setScale(scaleX, scaleY);
              }
              // absorb(t2);
              let explosion = Thing.create({
                type: 'explosion',
                matter: false,
                x: t2.x,
                y: t2.y,
                height: t2.height * 0.66,
                width: t2.width * 0.66,
                isStatic: true
              }, game);
              explosion.setTint(tints['aqua']);
              t2.G.destroy();
              Behavior.attach('isExploding', explosion);
              delete sprite.G.fractalRockets[t2.name];
              //delete T[t2.name];
              //delete sprite.fractalRockets[t2.name];
              pair.isActive = false;
              // sprite.fractalRockets.splice(index, 1);
            }
          }
        },
        collisionHandler: function (thing) {
          if (!thing.body) {
            return;
          }
          let explosion = Thing.create({
            type: 'explosion',
            matter: false,
            x: thing.x,
            y: thing.y,
            height: thing.height * 0.66,
            width: thing.width * 0.66,
            isStatic: true
          }, game);
          Behavior.attach('isExploding', explosion);
          bullet.G.destroy(true, true);
          thing.G.health = Math.floor(thing.G.health - config.BULLET_DAMAGE);
          delete sprite.G.fractalRockets[bullet.name];
          
        },
        additionalCollisionCheck: function (thing, b) {
          // console.log('additionalCollisionCheck ')
        }
      });

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
      sprite.G.fractalRocketTime = game.time.now + config.BULLET_RATE;
    }
    if ((sprite.inputs && sprite.inputs[sprite.G.fractalRocketControlKey])) {
      if (game.time.now > sprite.G.fractalRocketTime) {
        fireBullet();
      } else {
        // do nothing
      }
    }

    var fireSplit = false;
    if (sprite.inputs && sprite.inputs['secondaryWeaponKey']) {
      fireSplit = true;
    }
    if (fireSplit) {
      // TODO: set maxium amount of splits at once ( 4? )
      // TODO: using special weapon split should take energy
      if (game.time.now > sprite.G.fractalRocketSplit && Object.keys(sprite.G.fractalRockets).length < config.FRACTAL_MAX_FRAGMENTS) {
        // split bullets 2 more ways, 1 bullet turns into 3
        Object.keys(sprite.G.fractalRockets).forEach(function(name, i){
          var b = sprite.G.fractalRockets[name];
          // TODO: lower lifespan for splits?
          fireBullet(1, b, true, i);
          fireBullet(3, b, true, i);
        });
        sprite.G.fractalRocketSplit = game.time.now + config.FRACTAL_SPLIT_RATE;
      }

    }

    let = hsv = Phaser.Display.Color.HSVColorWheel();
    const top = hsv[i].color;
    const bottom = hsv[359 - i].color;

    for (let fr in  sprite.G.fractalRockets) {
      let rocket = sprite.G.fractalRockets[fr];
      if (rocket && rocket.body) {
        rocket.setTint(top, bottom, top, bottom);
      }
    }

    i++;

    if (i === 360) {
      i = 0;
    }

  }
};
