const Thing = require('../../Geoffrey/Thing');
const T = Things = require('../../Geoffrey/Things');
const Behavior = require('../../Geoffrey/Behavior');
const findBestTarget = require('../../utils/findBestTarget');

// hasHomingMissle

//var BULLET_RATE = 800;
//var BULLET_SPEED = 187;
var BULLET_DAMAGE = 40;
var BULLET_ENERGY = 20;
var HOMING_MISSLE_RATE = 2200;
var HOMING_MISSLE_LIFESPAN = 99999;
var i = 0;
module.exports = {
  preload: function preloadHomingMissle (opts, game) {
    game.load.image('missle', 'assets/weapons/missle.png');
  },
  create: function createHomingMissle (sprite, opts) {
    sprite.homingMissleControlKey = opts.controlKey || Phaser.Keyboard.S;
    sprite.homingMissles = sprite.homingMissles || [];
    sprite.homingMissleTime = 0;
    // sprite.homingMissleSFX = game.add.audio('homing-missle', 0.3);
  },
  update: function updateHomingMissle (sprite, game) {

    if (sprite.inputs[sprite.homingMissleControlKey]) {

      // sprite.frame = 3;
      if (sprite.homingMissles.length > 3) {
        // return;
      }
      if (sprite.energy <= BULLET_ENERGY) {
        return;
      }
      if (typeof sprite.energy === 'number') {
        sprite.energy -= BULLET_ENERGY;
      }

      i++;

      if (game.time.now > sprite.homingMissleTime) {
        let missle = Thing.create({
          type: 'missle',
          x: sprite.x,
          y: sprite.y,
          texture: 'missle'
        });
        
        missle.weapon = true;

        //  and its physics settings
        // 
        
        /*
        missle.body.drag.set(100);
        missle.body.maxVelocity.set(200);
        */
        missle.displayHeight = 12;
        missle.displayWidth = 35;

        missle.destructable = true;
        missle.ctime = game.time.now;
        missle.lifespan = HOMING_MISSLE_LIFESPAN;
        // missle.setTexture('missle');

        // missle.body.maxVelocity.set(200);
        sprite.homingMissles.push(missle);
        sprite.homingMissleTime = game.time.now + HOMING_MISSLE_RATE;
        missle.booster = false;
        missle.rotation = sprite.rotation;
        missle.thrust(0.001);
        missle.G.owner = sprite.name;
        missle.x = sprite.x;
        missle.y = sprite.y;

        missle.maxVelocity = {
          x: 1,
          y: 1
        };

        missle.health = 1;
        Behavior.attach('diesWithNoHealth', missle);
        Behavior.attach('hasScreenWrap', T[missle.name]);

        Behavior.attach('hasCollisions', missle, {
          owner: sprite,
          collidesWithSelf: true, // not supported?
          collidesWithSelfDelay: 8000, // not supported?
          collidesWithSiblings: true,
          collidesWithChildren: true,
          collisionHandler: function (thing) {
            if (thing.G.health) {
              thing.G.health -= BULLET_DAMAGE;
              // explode(missle);
              Behavior.detach('aiFollow', T[missle.name]);
              missle.G.destroy();
            }
          }
        });

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
        //missle.anims.load('homing-missle');
        //missle.anims.play('homing-missle');

      }

    } else {
      // sprite.frame = 0;
    }

    sprite.homingMissles.forEach(function(m) {

      /*
      if (!m.booster) {
        m.booster = true;
        game.physics.arcade.accelerationFromRotation(m.rotation, 200, m.body.acceleration);
      } else {
        attach("aiFollow",  T[m.name] , {
          followTarget: T["PLAYER_2"]
        });
      }
      */

      // TODO: better aiFollow / target behavior?
      var me = sprite.name,
        opponent;
      if (me === 'PLAYER_1') {
        opponent = 'PLAYER_2';
      } else {
        opponent = 'PLAYER_1';
      }

      // 300 ms delay between lauching of homing missle and firing of afterburner rockets
      // is this stacking up calls??? memory leak?
      setTimeout(function(){
        // since it's possible the homing missle blew up before it's rockets kicked in
        Behavior.attach('aiFollow', m, {
          followTarget: T[opponent],
          mode: 'collision'
        });
      }, 300);

    });

  },
  remove: function removeHomingMissle(sprite) {
  }
};