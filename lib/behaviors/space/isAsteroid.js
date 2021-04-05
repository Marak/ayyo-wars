const Behavior = require('../../Geoffrey/Behavior');
const Thing = require('../../Geoffrey/Thing');

// isAsteroid
var i = 0;
module.exports = {
  tags: ['npc'],
  preload: function isAsteroidPreload (opts, game) {
    game.load.image('asteroid1', 'assets/space/asteroid1.png');
    game.load.image('asteroid2', 'assets/space/asteroid2.png');
    game.load.image('asteroid3', 'assets/space/asteroid3.png');
  },
  create: function isAsteroidCreate (sprite, opts, game) {
    var name = opts.name;
    sprite.x = opts.x || sprite.x || 0;
    sprite.y = opts.y || sprite.x || 0;

    var randomSprite = Math.floor((Math.random() * 3) + 1);
    sprite.setTexture('asteroid' + randomSprite.toString());

    sprite.height = opts.height || 50;
    sprite.width = opts.width || 50;
    sprite.displayHeight = opts.height || 50;
    sprite.displayWidth = opts.width || 50;

    //sprite.setTexture('asteroid');
    if (typeof opts.maxSplit !== 'undefined') {
      sprite.maxSplit = opts.maxSplit;
    } else {
      sprite.maxSplit =  2;
    }

    sprite.rotationSpeed = opts.rotationSpeed || 250;
    sprite.maxSpeed = opts.maxSpeed || 20;
    sprite.reverseThrust = opts.reverseThrust || 250;

    Behavior.attach('hasCollisions', sprite, {
      collidesWithSelf: false,
      collidesWithSiblings: false,
      collidesWithChildren: false,
      impacts: true
    });

    sprite.setMass(5);
    sprite.setBounce(0.8);
    sprite.setFriction(0,0);
    sprite.destructable = true;

    Behavior.attach('hasHealth', sprite, {
      health: opts.health || 10
    });

    function splitAsteroid (sprite) {
      var randx = Math.floor(Math.random() * (30 - 1) + 1);
      var randy = Math.floor(Math.random() * (30 - 1) + 1);
      
      let a1 = Thing.create({
        type: 'asteroid',
        matter: true,
        x: randx,
        y: randy,
      });

      var randomSprite = Math.floor((Math.random() * 3) + 1);
      a1.setTexture('asteroid' + randomSprite.toString());

      Behavior.attach('isAsteroid', a1, { 
        health: 10,
        height: 200,
        width: 200
      });

      var newSplit = sprite.maxSplit - 1;
      Behavior.attach('isAsteroid', a1, {
        name: a1.name,
        x: sprite.x + randx, // TODO: sprite scope could already be destroyed here?
        y: sprite.y + randy,
        height: sprite.height / 2,
        width: sprite.width / 2,
        maxSplit: newSplit,
        inputs: {}
      });
      Behavior.attach('hasScreenWrap', a1);
    }

    Behavior.attach('diesWithNoHealth', sprite, {
      callback: function () {
        // when asteroid dies, split into smaller asteroids unless maxSplit count has exceeded
        if (sprite.maxSplit > 0) {
          var splitAmount = Math.floor(Math.random() * 4 + 1);
          for (var i = 0; i <= splitAmount; i++) {
            // do not split
            splitAsteroid(sprite);
          }
        }
      }
    });
  },
  update: function isAsteroidUpdate (sprite, game) {
    if (sprite.body) {
      if (sprite.body.velocity.x === 0 && sprite.body.velocity.y === 0) {
        var angles = [45, 90, 180, 270, 360];
        var randomAngle = angles[Math.floor(Math.random() * angles.length)];
        var rotation = Phaser.Math.RadToDeg(randomAngle + Phaser.Math.RadToDeg(sprite.rotation));
        sprite.setVelocity(2);
        sprite.setRotation(rotation);
      }
    }
    // asteroid is always slightly rotating
    sprite.angle += 0.1;
  }
};