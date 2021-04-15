var inputs = {};

inputs['PLAYER_1'] = {
  primaryWeaponKey: 'A',
  secondaryWeaponKey: 'S',
  specialWeaponKey: 'D',
  cycleShipKey: 'R',
  cyclePrimaryWeaponKey: 'Q',
  cycleSecondaryWeaponKey: 'W',
  cycleSpecialWeaponKey: 'E',
  cycleHUDKey: 'O',
  confirmKey: 'ENTER',
  upKey: 'UP',
  downKey: 'DOWN',
  leftKey: 'LEFT',
  rightKey: 'RIGHT',
  leftBumper: 'SHIFT',
  escape: 'ESC',
  fullscreen: 'F',
  action1: 'ONE',
  action2: 'TWO',
  action3: 'THREE',
  action4: 'FOUR',
  action5: 'FIVE',
  action6: 'SIX',
  action7: 'SEVEN',
  action8: 'EIGHT',
  action9: 'NINE',
  action0: 'ZERO',
};

inputs['PLAYER_2'] = {
  primaryWeaponKey: 'Z',
  secondaryWeaponKey: 'X',
  specialWeaponKey: 'C',
  upKey: 'I',
  downKey: 'K',
  leftKey: 'J',
  rightKey: 'L',
  leftBumper: 'SHIFT'
};
// asd
let x = 0;

// map inputs to current controller device ( hard-coded to Keyboard for now )

module.exports = inputs;