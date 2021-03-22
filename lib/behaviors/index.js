const behaviors = {};


//
// Levels as Behaviors
//
behaviors['isLevel0'] = require('./levels/isLevel0');

//
// Ship Behaviors
//
behaviors['isMIBCaddy'] = require('./ships/isMIBCaddy');

//
// Movement based Behaviors
//
behaviors['hasControlledFlight'] = require('./movement/hasControlledFlight');
behaviors['hasMaxVelocity'] = require('./movement/hasMaxVelocity');

//
// Game ( itself ) Behaviors
//

behaviors['hasScreenWrap'] = require('./game/hasScreenWrap');

module.exports = behaviors;