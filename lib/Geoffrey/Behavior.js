const Behavior = {};
Behavior.attach = function attachBehavior (behavior, sprite, opts) {

  const behaviors = require('../behaviors');

  if (typeof sprite === "undefined") {
    // throw new Error('Warning: attempting to attach behavior to undefined sprite ' + behavior)
    console.log('Warning: Attempting to attach behavior to undefined sprite ' + behavior);
    return false;
  }


  if (typeof behaviors[behavior] === "undefined") {
    // throw new Error('Warning: attempting to attach behavior to undefined sprite ' + behavior)
    console.log('Warning: Attempting to attach undefined behavior to sprite: ' + behavior);
    return false;
  }

  opts = opts || {};

  /*
  if (Behavior.mode !== 'server') {
    if (behavior === 'aiFollow') {
      return;
    }
  }
  */

  sprite.behaviors = sprite.behaviors || {};
  sprite.behaviors[behavior] = behaviors[behavior];
  sprite.behaviors[behavior].opts = opts;
  sprite.behaviors[behavior].config = sprite.behaviors[behavior].config || { stack: 1 };

  if (typeof sprite.behaviors[behavior] === "undefined") {
    throw new Error('Behavior could not be required: ' + behavior);
  }



  if (typeof sprite.behaviors[behavior].create === "function") {
    try {
      if (!game) {
        console.log('no game variable found...', game)
      }
      sprite.behaviors[behavior].create(sprite, opts, game, sprite.behaviors[behavior].config);
    } catch (err) {
      console.log('error running ' + behavior + '.create()', err);
    }
  }

};

Behavior.detach = function detachBehavior (behavior, sprite, opts) {
  if (typeof sprite === "undefined") {
    return;
  }
  sprite.behaviors = sprite.behaviors || {};
  if (typeof sprite.behaviors[behavior] === "object") {
    // if a 'remove' method has been provided, run it now to clean up behavior
    if (typeof sprite.behaviors[behavior].remove === "function") {
      // 'remove' methods will usually delete no longer needed resources,
      // or reset the state of something now that the behavior is removed
      sprite.behaviors[behavior].remove(sprite, game);
    }
    delete sprite.behaviors[behavior];
  }
};

Behavior.process = function processBehavior (thing, game) {

  const behaviors = require('../behaviors');

  // process all Things
  if (typeof thing === "object") {
    if (typeof thing.behaviors === "object") {
      var behaviorKeys = Object.keys(thing.behaviors);
      // Remark: Sort the order the behaviors are applied based on their optional config.stack value
      // The lowest config.stack value will execute first
      // The highest config.stack value will execute last
      behaviorKeys = behaviorKeys.sort(function(a, b){
        if (behaviors[a].config.stack > behaviors[b].config.stack) {
          return 1;
        }
        return -1;
      });
      behaviorKeys.forEach(function (b) {
        if (typeof thing.behaviors[b] === "object") {
          if (typeof thing.behaviors[b].update === "function") {
            try {
              thing.behaviors[b].update.call(this, thing, game, thing.behaviors[b].config);
              // Remark: This is the best place to clamp max velocity of all physics bodies
              //   This must be done after all possible thrust is applied ( after all behaviors run )
              // TODO: We could probably implement this as a series of "after" behaviors,
              //       or add cardinality to the order of behaviors
              if (thing.G.maxVelocity) {
                behaviors.hasMaxVelocity.update(thing);
              }
            } catch (err) {
              console.log('warning: error in processing update call for:' + b, err);
            }
          }
        }
      });
    }
  }
}

module.exports = Behavior;