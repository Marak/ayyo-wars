const behaviors = {};

//
// Levels as Behaviors
//
behaviors['isLevel0'] = require('./levels/isLevel0');
behaviors['isOnlineLevel'] = require('./levels/isOnlineLevel');


//
// Outer Space Things as Behaviors
//
behaviors['isAsteroid'] = require('./space/isAsteroid');

//
// Ship Behaviors
//
behaviors['isMIBCaddy'] = require('./ships/isMIBCaddy');

//
// Weapon Behaviors
//
behaviors['hasFusionGun'] = require('./weapons/hasFusionGun');

//
// Artifical Intelligence Behaviors
//
behaviors['aiFollow'] = require('./ai/aiFollow');

//
// Properties of a Thing as Behaviors
//
behaviors['diesWithNoHealth'] = require('./properties/diesWithNoHealth');
behaviors['hasCollisions'] = require('./properties/hasCollisions');
behaviors['hasGravity'] = require('./properties/hasGravity');
behaviors['hasHealth'] = require('./properties/hasHealth');
behaviors['hasLifespan'] = require('./properties/hasLifespan');
behaviors['hasSignals'] = require('./properties/hasSignals');
behaviors['hasSpeechBubble'] = require('./properties/hasSpeechBubble');

//
// Movement based Behaviors
//
behaviors['hasPlasmaPropulsionEngine'] = require('./movement/hasPlasmaPropulsionEngine');
behaviors['hasMaxVelocity'] = require('./movement/hasMaxVelocity');

//
// Triggers as Behaviors
//
behaviors['allOtherPlayersDead'] = require('./triggers/allOtherPlayersDead');

//
// Status of a Thing as Behaviors
//
behaviors['isExploding'] = require('./status/isExploding');

//
// Game ( itself ) Behaviors
//
behaviors['hasChatBox'] = require('./game/hasChatBox');
behaviors['hasScreenWrap'] = require('./game/hasScreenWrap');
behaviors['hasStateManager'] = require('./game/hasStateManager');


module.exports = behaviors;