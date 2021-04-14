const behaviors = {};

//
// Levels as Behaviors
//
behaviors['isLevel0'] = require('./levels/isLevel0');
behaviors['isLevel1'] = require('./levels/isLevel1');
behaviors['isOnlineLevel'] = require('./levels/isOnlineLevel');


//
// Outer Space Things as Behaviors
//
behaviors['isAsteroid'] = require('./space/isAsteroid');

//
// Ship Behaviors
//

behaviors['isAgharian'] = require('./ships/isAgharian');
behaviors['isDracoBorg'] = require('./ships/isDracoBorg');
behaviors['isDracoCruiser'] = require('./ships/isDracoCruiser');
behaviors['isFlyingSaucer'] = require('./ships/isFlyingSaucer');
behaviors['isMIBCaddy'] = require('./ships/isMIBCaddy');
behaviors['isMothership'] = require('./ships/isMothership');
behaviors['isTemple'] = require('./ships/isTemple');
behaviors['isUrielWrath'] = require('./ships/isUrielWrath');
behaviors['isVimana'] = require('./ships/isVimana');

//
// Weapon Behaviors
//
behaviors['hasCloneDevice'] = require('./weapons/hasCloneDevice');
behaviors['hasEyeOfRa'] = require('./weapons/hasEyeOfRa');
behaviors['hasHomingMissle'] = require('./weapons/hasHomingMissle');
behaviors['hasFractalRocket'] = require('./weapons/hasFractalRocket');
behaviors['hasFusionGun'] = require('./weapons/hasFusionGun');
behaviors['hasPlasmaCannon'] = require('./weapons/hasPlasmaCannon');
behaviors['hasQuantumLockDevice'] = require('./weapons/hasQuantumLockDevice');
behaviors['hasTurboLaser'] = require('./weapons/hasTurboLaser');
behaviors['hasTeleporter'] = require('./weapons/hasTeleporter');

//
// Artifical Intelligence Behaviors
//
behaviors['aiFollow'] = require('./ai/aiFollow');

//
// Properties of a Thing as Behaviors
//
behaviors['diesWithNoHealth'] = require('./properties/diesWithNoHealth');
behaviors['hasCollisions'] = require('./properties/hasCollisions');
behaviors['hasEnergy'] = require('./properties/hasEnergy');
behaviors['hasGravity'] = require('./properties/hasGravity');
behaviors['hasHealth'] = require('./properties/hasHealth');
behaviors['hasLifespan'] = require('./properties/hasLifespan');
behaviors['hasSignals'] = require('./properties/hasSignals');
// behaviors['hasSpeechBubble'] = require('./properties/hasSpeechBubble');
behaviors['hasWeaponSelector'] = require('./properties/hasWeaponSelector');

//
// Movement based Behaviors
//
behaviors['hasAlcubierreWarpDrive'] = require('./movement/hasAlcubierreWarpDrive');
behaviors['hasPlasmaPropulsionEngine'] = require('./movement/hasPlasmaPropulsionEngine');
behaviors['hasMaxVelocity'] = require('./movement/hasMaxVelocity');

//
// Triggers as Behaviors
//
// behaviors['allOtherPlayersDead'] = require('./triggers/allOtherPlayersDead');

//
// Status of a Thing as Behaviors
//
behaviors['isExploding'] = require('./status/isExploding');

//
// Game ( itself ) Behaviors
//
// behaviors['hasChatBox'] = require('./game/hasChatBox');
behaviors['isItemGrid'] = require('./game/isItemGrid');
behaviors['hasFullScreenControl'] = require('./game/hasFullScreenControl');
behaviors['hasScreenWrap'] = require('./game/hasScreenWrap');
behaviors['hasStateManager'] = require('./game/hasStateManager');


//
// Game Modes as Behaviors
//
behaviors['isSkirmishMode'] = require('./modes/isSkirmishMode');

module.exports = behaviors;