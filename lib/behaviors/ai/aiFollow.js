const T = Things = require('../../Geoffrey/Things');

// aiFollow
// TODO: cleanup / review this behavior
var adjustmentDelay = 60;
module.exports = {
  tags: ['ai'],
  create: function createAiFollow (sprite, opts) {
    if (typeof opts.followTarget === 'undefined') {
      // TODO: un-hardcode player 1 and 2 lookups for auto follow target, query gamestate instead
      if (sprite.name === 'PLAYER_1' || sprite.G.owner === 'PLAYER_1') {
        sprite.followTarget = T['PLAYER_2'];
        sprite.followTargetName = 'PLAYER_2';
      } else {
        sprite.followTarget = T['PLAYER_1'];
        sprite.followTargetName = 'PLAYER_1';
      }
    } else {
      sprite.followTarget = opts.followTarget;
      sprite.followTargetName = opts.followTarget.name;
    }

    // works for string name, or whole object ( string style required for level design )
    if (typeof sprite.followTarget === 'string') {
      sprite.followTarget = T[opts.followTarget];
    }

    // sprite.G.rotationSpeed = sprite.G.rotationSpeed || 40;
    sprite.G.rotationSpeed = sprite.G.rotationSpeed || opts.rotationSpeed || 0.018;
    sprite.makingRandomMovement = false;
    sprite.lastRandomMovement = 0;
    sprite.courseCorrection = game.time.now;
    sprite.ai = true;
  },
  update: function updateAiFollow (sprite, game) {
    // Define constants that affect motion
    // sprite.SPEED = sprite.thrust; // missile speed pixels/second
    sprite.TURN_RATE = Phaser.Math.DegToRad(sprite.G.rotationSpeed); // turn rate in degrees/frame
    if (sprite.frozen) {
      return true;
    }
    sprite.followTarget = T[sprite.followTargetName];
    // console.log('tttt', sprite.followTargetName, sprite.followTarget)
    if (typeof sprite.followTarget === 'undefined') {
      return;
    }
    if (game.time.now - adjustmentDelay < sprite.courseCorrection) {
      // return;
    }
    // Calculate the angle from the missile to the mouse cursor game.input.x
    // and game.input.y are the mouse position; substitute with whatever
    // target coordinates you need.
    var targetAngle = Phaser.Math.Angle.Between(
      sprite.x, sprite.y,
      sprite.followTarget.x, sprite.followTarget.y
    );

    // Gradually (this.TURN_RATE) aim the missile towards the target angle
    if (sprite.rotation !== targetAngle) {
      // Calculate difference between the current angle and targetAngle
      var delta = targetAngle - sprite.rotation;

      // Keep it in range from -180 to 180 to make the most efficient turns.
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;

      if (delta > 0) {
        // Turn clockwise
        sprite.rotation += sprite.G.rotationSpeed;
        sprite.courseCorrection = game.time.now;
      } else {
        // Turn counter-clockwise
        sprite.rotation -= sprite.G.rotationSpeed;
        sprite.courseCorrection = game.time.now;
      }

      // Just set angle to target angle if they are close
      if (Math.abs(delta) < Phaser.Math.DegToRad(sprite.TURN_RATE)) {
        sprite.rotation = targetAngle;
      }
    }

    if (sprite.thrust) {
      if (typeof sprite.thrust !== 'function') {
        console.log("PROBLEM INVALID THRUST VALUE FROM OLD API")
      }
      var d1 = Phaser.Math.Distance.Between(sprite.x, sprite.y, sprite.followTarget.x, sprite.followTarget.y);
      // console.log('d1', d1)
      if (d1 > 12) {
        sprite.thrust(sprite.G.thrustForce || .001);
      }
    }


  },
  remove: function removeAiFollow(sprite) {
    if (sprite.body) {
      //sprite.setVelocity(0, 0);
    }
    sprite.ai = false;
  }
};