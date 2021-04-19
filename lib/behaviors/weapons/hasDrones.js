// hasDrones
const Behavior = require('../../Geoffrey/Behavior');
const Thing = require('../../Geoffrey/Thing');
const tints = require('../../utils/tints');

var LAUNCH_TIME = 100;

module.exports = {
  create: function createDrones (sprite, opts) {
    sprite.inputs = opts.inputs || sprite.inputs || {};
    sprite.droneControlKey = opts.controlKey || 'specialWeaponKey';
    sprite.drones = sprite.drones || [];
    sprite.missleTime = 0;
  },
  update: function updateDrones (sprite, game) {
    
    let T = game.Things;
    // if (sprite.inputs[droneControlKey] || sprite.ai)
    if (sprite.inputs[sprite.droneControlKey]) {

      if (sprite.drones.length > 3) {
        return;
      }

      if (sprite.energy <= 0) {
        return;
      }

      if (typeof sprite.energy === 'number' && sprite.energy >= 150) {
        sprite.energy -= 150;
      }

      if (game.time.now > sprite.missleTime) {

        let missle = Thing.create({
          x: sprite.x,
          y: sprite.y,
          type: 'missle',
          texture: 'missle',
          matter: true
        }, game);
        missle.droppedTime = game.time.now;

        missle.displayHeight = 8;
        missle.displayWidth = 22;
        missle.setMass(5);
        missle.setRectangle(20, 5);

        missle.G.lifespan = 120000; // two minutes
        missle.G.thrustForce = 0.000008;
        missle.G.owner = sprite.name;
        
        sprite.missleTime = game.time.now + 1000;
        missle.booster = false;
        missle.rotationSpeed = 0.088;

        sprite.drones.push(missle);
        missle.destructable = true;
        missle.tint = tints['green'];

        Behavior.attach('hasLifespan', missle, {
          lifespan: missle.G.lifespan,
          callback: function () {
            missle.G.destroy();
          }
        });
        
        Behavior.attach('hasCollisions', missle, {
          owner: sprite,
          collidesWithSelf: false, // TODO: not supported yet?
          collidesWithSiblings: true,
          collidesWithChildren: true,
          collisionHandler: function (thing) {
          }
        }, game);

        Behavior.attach('hasHealth',  missle, {
          health: 30
        });
        Behavior.attach('diesWithNoHealth',  missle);

      }
    }

    sprite.drones = sprite.drones.filter(function(m){

      if (game.time.now > m.droppedTime + LAUNCH_TIME && m.spawned !== true) {
        if (typeof T[m.name] === 'undefined') {
          return false;
        }
        m.spawned = true;
        m.G.owner = sprite.name;
        sprite.droppedTime = game.time.now;

        Behavior.attach('hasFusionGun', m, {
          strength: 2,
          bulletRate: 500
        });

        Behavior.attach('aiFollow', m);
        Behavior.attach('aiShootsWhenInRange', m);
        Behavior.attach('hasScreenWrap', m);

        return true;
      }
      return true;

    });

  },
  remove: function removeDrones (sprite) {
  }
};
