// hasSignals
module.exports = {
  create: function hasSignalsCreate (sprite, opts, game) {
  },
  update: function hasSignalsUpdate (sprite, game) {

    var inputs = {
      forwardThrust: false,
      reverseThrust: false,
      primaryWeapon: false,
      secondaryWeapon: false
    };
    // TODO: missing frames for ship and weapon sprites
    // return;
    var frame = 0;

    // sprite delegation
    if (sprite.inputs.primaryWeaponKey) {
      frame = 3;
    }

    if (sprite.inputs.upKey) {
      frame = 1;
    }

    if (sprite.inputs.downKey) {
      frame = 2;
    }

    if (sprite.inputs.secondaryWeaponKey) {
      frame = 6;
    }

    if (inputs.forwardThrust && inputs.primaryWeapon) {
      frame = 4;
    }

    if (inputs.reverseThrust && inputs.primaryWeapon) {
      frame = 5;
    }

    sprite.setFrame(frame);

  }
};