var inputs = {};

inputs['PLAYER_1'] = {
  primaryWeaponKey: 'A',
  secondaryWeaponKey: 'S',
  specialWeaponKey: 'D',
  upKey: 'UP',
  downKey: 'DOWN',
  leftKey: 'LEFT',
  rightKey: 'RIGHT',
  leftBumper: 'SHIFT'
};

inputs['PLAYER_2'] = {
  primaryWeaponKey: 'Q',
  secondaryWeaponKey: 'W',
  specialWeaponKey: 'E',
  upKey: 'I',
  downKey: 'K',
  leftKey: 'J',
  rightKey: 'L',
  leftBumper: 'SHIFT'
};

// map inputs to current controller device ( hard-coded to Keyboard for now )

module.exports = inputs;