const Things = require('../../Geoffrey/Things');
/*
    // TODO: rename, 
    hasPlasmaPropulsionEngine, - https://en.wikipedia.org/wiki/Plasma_propulsion_engine
*/
// hasControlledFlight

module.exports = {
  create: function hasPlasmaPropulsionEngineCreate (sprite, opts, game) {
    // 
    sprite.inputs = opts.inputs || sprite.inputs || {};
    sprite.G.thrustForce = opts.thrustForce || sprite.G.thrustForce || 0.001;
    sprite.G.rotationSpeed = sprite.G.rotationSpeed || opts.rotationSpeed || 0.018;
    sprite.maxRotationSpeed = sprite.maxRotationSpeed || opts.rotationSpeed || 0.5;

    sprite.maxSpeed = sprite.G.rotationSpeed || opts.maxSpeed || 200;
    sprite.flightControlled = false;

    sprite.G.maxVelocity = opts.maxVelocity || sprite.G.maxVelocity || {
      x: 4,
      y: 4
    };
    sprite.trailTick = 120;
    sprite.lastTrailTick = 0;
    //game.cursors = game.input.keyboard.createCursorKeys();

  },
  update: function hasPlasmaPropulsionEngineUpdate (sprite, game) {
    // console.log('hasControlledFlightUpdate', sprite.inputs)
    //sprite.shipTrail.x = sprite.x;
    //sprite.shipTrail.y = sprite.y;
    //sprite.shipTrail.rotation = sprite.rotation
    sprite.flightControlled = false;

    if (typeof sprite.body === 'undefined') {
      return false;
    }
    //console.log('sss', sprite)
    sprite.foo = "bar";
    //console.log(sprite.foo)

    if (sprite.inputs && sprite.inputs.leftKey) {
      sprite.setAngularVelocity(0);
      sprite.flightControlled = true;
      // holding left bumper enables strafe for turning ( side thrusters )
      if (sprite.inputs.leftBumper) {
        sprite.thrustLeft(sprite.G.thrustForce);
        if (game.time.now - sprite.lastTrailTick > sprite.trailTick) {
          /*
          drawTail(sprite, {
            side: 'starboard'
          }, game);
          */
        }
      } else {
        if (sprite.rotation <= Math.abs(sprite.maxRotationSpeed)) {
          //sprite.setAngularVelocity(r)
        }
        sprite.rotation -= sprite.G.rotationSpeed;
      }
    }
    else if (sprite.inputs && sprite.inputs.rightKey) {
      sprite.setAngularVelocity(0);
      sprite.flightControlled = true;
      if (sprite.inputs.leftBumper) {
        sprite.thrustRight(sprite.G.thrustForce);
        if (game.time.now - sprite.lastTrailTick > sprite.trailTick) {
          /*
          drawTail(sprite, {
            side: 'port'
          }, game);
          */
        }
      } else {
        if (sprite.rotation <= Math.abs(sprite.maxRotationSpeed)) {
          // sprite.setAngularVelocity(r)
        }
        sprite.rotation += sprite.G.rotationSpeed;
      }
    }
    else {
      if (sprite.body) {
        sprite.body.angularVelocity = 0;
      }
    }

    if (sprite.inputs && sprite.inputs.upKey) {
      if (game.time.now - sprite.lastTrailTick > sprite.trailTick) {
        /*
        drawTail(sprite, {
          side: 'stern'
        }, game);
        */
      }
      sprite.flightControlled = true;
      sprite.thrust(sprite.G.thrustForce);
      //sprite.frame = 0;
    } else {
      // sprite.setAngularVelocity(0);
    }
    if (sprite.inputs && sprite.inputs.downKey) {
      //sprite.frame = 2;
      sprite.thrust(0 - sprite.G.thrustForce);
    }

  }

};