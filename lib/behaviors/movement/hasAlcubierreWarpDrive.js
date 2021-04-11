// hasAlcubierreWarpDrive
// see: https://en.wikipedia.org/wiki/Alcubierre_drive

module.exports = {
  create: function hasAlcubierreWarpDriveCreate (sprite, opts, game) {
    sprite.G.rotationSpeed = opts.rotationSpeed || sprite.G.rotationSpeed || 0.01;
    sprite.G.thrustForce = opts.thrustForce || sprite.G.thrustForce || 0.01;
    sprite.trailTick = 60;
    sprite.lastTrailTick = 0;
  },
  update: function hasAlcubierreWarpDriveUpdate (sprite, game) {

    if (typeof sprite.body === 'undefined') {
      return;
    }

    if (sprite.inputs && sprite.inputs.leftKey) {
      //sprite.rotation += 10;
      // sprite.body.angularVelocity = 0 - sprite.rotationSpeed;
      sprite.rotation -= 0.1;
    }
    else if (sprite.inputs && sprite.inputs.rightKey) {
      sprite.rotation += 0.1;
      // sprite.body.angularVelocity = sprite.rotationSpeed;
    }
    else {
      if (!sprite.ai) {
        if (sprite.body) {
          sprite.body.angularVelocity = 0;
        }
      }
    }

    if (sprite.inputs && sprite.inputs.downKey) {
      sprite.thrust(0 - sprite.G.thrustForce);
      return;
    }

    if (sprite.inputs && sprite.inputs.upKey) {
      sprite.thrust(sprite.G.thrustForce);
      return;
    }

    sprite.setVelocity(0, 0);

  }

};