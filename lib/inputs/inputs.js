var inputs = {};

inputs['PLAYER_1'] = {
  primaryWeaponKey: 'A',
  secondaryWeaponKey: 'S',
  specialWeaponKey: 'D',
  cycleShipKey: 'R',
  cyclePrimaryWeaponKey: 'Z',
  cycleSecondaryWeaponKey: 'C',
  cycleSpecialWeaponKey: 'X',
  cycleHUDKey: 'O',
  upKey: 'UP',
  downKey: 'DOWN',
  leftKey: 'LEFT',
  rightKey: 'RIGHT',
  leftBumper: 'SHIFT',
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
  primaryWeaponKey: 'Q',
  secondaryWeaponKey: 'W',
  specialWeaponKey: 'E',
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