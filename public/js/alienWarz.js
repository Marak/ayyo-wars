(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.alienWarz = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Behavior = {};
Behavior.attach = function attachBehavior (behavior, sprite, opts) {

  const behaviors = require('../behaviors');

  if (typeof sprite === "undefined") {
    // throw new Error('Warning: attempting to attach behavior to undefined sprite ' + behavior)
    console.log('Warning: attempting to attach behavior to undefined sprite ' + behavior);
    return false;
  }
  opts = opts || {};

  sprite.behaviors = sprite.behaviors || {};
  sprite.behaviors[behavior] = behaviors[behavior];

  if (typeof sprite.behaviors[behavior] === "undefined") {
    throw new Error('Behavior could not be required: ' + behavior);
  }

  if (typeof sprite.behaviors[behavior].create === "function") {
    try {
      sprite.behaviors[behavior].create(sprite, opts, game);
    } catch (err) {
      console.log('error running ' + behavior + '.create()', err);
    }
  }

};

Behavior.detach = function detachBehavior (behavior, sprite, opts) {};

Behavior.process = function processBehavior (thing) {

  const behaviors = require('../behaviors');

  if (typeof thing === "object") {
    if (typeof thing.behaviors === "object") {
      var behaviorKeys = Object.keys(thing.behaviors);
      behaviorKeys.forEach(function (b) {
        if (typeof thing.behaviors[b] === "object") {
          if (typeof thing.behaviors[b].update === "function") {
            try {
              thing.behaviors[b].update.call(this, thing, game, thing.behaviors[b].config);
              // Remark: This is the best place to clamp max velocity of all physics bodies
              //   This must be done after all possible thrust is applied ( after all behaviors run )
              // TODO: We could probably implement this as a series of "after" behaviors,
              //       or add cardinality to the order of behaviors
              if (thing.maxVelocity) {
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
},{"../behaviors":7}],2:[function(require,module,exports){
const Behavior = require('./Behavior');
const Thing = require('./Thing');
const Things = require('./Things');
const Input = require('./Input');

// Game object is responsible for aggregating all game behaviors into common Phaser.game preload / create / update handlers
let Game = {};
Game._updates = [];
Game._creates = [];
Game._preloads = [];

Game.bindCreate = function bindCreate (fn) {
  // adds new create functions to Game create chain
  Game._creates.push(fn)
};

Game.create = function gameCreate () {
  Game._creates.forEach(function(f){
    f(game);
  });
};

Game.bindUpdate = function bindUpdate (fn) {
  // adds new update function to Game update chain
  Game._updates.push(fn)
};

Game.update = function gameUpdate (game) {
  Game._updates.forEach(function(f){
    f(game);
  });
};

Game.preload = function gamePreload () {
  game = this;

  /*
  game.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
    globalCollisionHandler(event, bodyA, bodyB);
  });
  */

  const behaviors = require('../behaviors');

  for (let b in behaviors) {
    if (typeof behaviors[b].preload === "function") {
      try {
        console.log('preloading sprite',  behaviors[b].preload.toString())
        behaviors[b].preload({}, game);
      } catch (err) {
        console.log('error running ' + b + '.preload()', err);
      }
    }
  }


};

Game.init = function initGame () {

  var worldWidth = 1024;
  var worldHeight = 759;

  var renderMode = Phaser.AUTO;

  var _config = {
    type: renderMode,
    parent: 'game-canvas-div',
    width: worldWidth,
    height: worldHeight,
    physics: {
      default: 'matter',
      matter: {
        debug: true,
        gravity: { y: 0, x: 0 },
        plugins: {
          attractors: true
        }
      }
    },
    scene: {
      preload: Game.preload,
      create: Game.create,
      update: update,
      render: render
    }
  };

  // create new phaser game
  game = new Phaser.Game(_config);

  Game.bindCreate(create);

  function create() {
    // create new scene for battle ground
    var _config = {
        key: 'battleground',
        // active: false,
        // visible: true,
        // pack: false,
        // cameras: null,
        // map: {},
        // physics: {},
        // loader: {},
        // plugins: false,
        // input: {}
        physics: {
          default: 'matter',
          matter: {
            gravity: { y: 0, x: 0 },
            debug: true,
            plugins: {
              attractors: true
            }
          }
        }
    };
    //  A space background
    // TODO: replace sprite
    //bg = game.add.tileSprite(0, 0, 20000, 20000, 'space');
    //bg.context.fillStyle = '#FFFFFF';
    //bg.tint = 0xff0000;
    //bg.setDepth(1);

  }

  function update () {
    /*
    var cam = game.cameras.main;
    cam.setSize(worldWidth, worldHeight);
    */
    Input.process(game);
    Game.update(game);
    for (let thing in Things) {
      // console.log('updating', thing)
      Behavior.process(Things[thing]);
    }
    game.cameras.cameras[0].setBounds(0, 0, worldWidth, worldHeight);
  }

  function render() {
    debugRender();
  }
  return this;
};

module.exports = Game;


function globalCollisionHandler (event) {
  // Remark: Only use event argument and event.pairs value
  //console.log('collision event', event);
  //console.log('collision pairs', pairs);
  // console.log("COLLIDES", event.pairs)
  var pairs = event.pairs;
  // TODO: port hasCollisions behavior code here...central collision detector...
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var t1 = pair.bodyA.gameObject;
    var t2 = pair.bodyB.gameObject;

    // handle sensor collisions first
    if (pair.isSensor) {
      var bodyA = pair.bodyA;
      var bodyB = pair.bodyB;
      if (pair.bodyA.gameObject !== null && pair.bodyB.gameObject !== null) {
        pair.bodyA.gameObject.touching = pair.bodyA.gameObject.touching || {};
        pair.bodyB.gameObject.touching = pair.bodyB.gameObject.touching || {};
        // console.log('sensor hit', pair, bodyA.label, bodyB.label);
        if (bodyA.label === 'bottom' || bodyB.label === 'bottom') {
          pair.bodyA.gameObject.touching.bottom = true;
          pair.bodyB.gameObject.touching.bottom = true;
          pair.bodyA.gameObject.jumping = false;
          pair.bodyB.gameObject.jumping = false;
        }
        // continue;
      }
    }
    
    //console.log('collides', t1.name, t2.name)
    //return;
    if (t1 === null || t2 === null) {
      continue;
    }
    // collides with self
    if (t1.name === t2.name) {
      pair.isActive = false;
    }
    // console.log(t1, t2)
    if (t1.skipCollision || t2.skipCollision) {
      pair.isActive = false;
      // continue;
    }
    if (t1.beforeCollisionCheck) {
      t1.beforeCollisionCheck(t2, pair);
    }
    if (t2.beforeCollisionCheck) {
      t2.beforeCollisionCheck(t1, pair);
    }
    //
    // Collides with parent
    //
    if (t1.name === t2.owner) {
      pair.isActive = false;
      // continue;
    }
    if (t1.owner === t2.name) {
      pair.isActive = false;
      // continue;
    }

    //
    // Collides with siblings
    //
    if (typeof t1.owner !== 'undefined' && t1.owner === t2.owner) {
      pair.isActive = false;
      // continue;
    }

    if (pair.isActive) {
      if (t1.collisionHandler) {
        t1.collisionHandler(t2, pair);
      }
      if (t2.collisionHandler) {
        t2.collisionHandler(t1, pair);
      }

      if (t1.impacts === false || t2.impacts === false) {
        pair.isActive = false;
        // continue;
      }
    }

    if (t1.additionalCollisionCheck) {
      t1.additionalCollisionCheck(t2, t1);
    }

    if (t2.additionalCollisionCheck) {
      t2.additionalCollisionCheck(t1, t2);
    }
  }

}
},{"../behaviors":7,"./Behavior":1,"./Input":3,"./Thing":4,"./Things":5}],3:[function(require,module,exports){
const Input = {};
const inputs = require('../inputs/inputs');

Input.process = function processInput (game) {
  const Things = require('./Things');
  for (let player in inputs) {
    for (let input in inputs[player]) {
      var key = game.input.keyboard.addKey(inputs[player][input]);
      Things[player].inputs = Things[player].inputs || {};
      if (key.isDown) {
        Things[player].inputs[input] = true;
      } else {
        Things[player].inputs[input] = false;
      }
    }
  }
}

module.exports = Input;

},{"../inputs/inputs":13,"./Things":5}],4:[function(require,module,exports){
const Thing = {};
const Things = require('./Things');
Thing.create = function createThing (opts) {
  // first, determine what the name of the thing will be
  // if a Thing has a type, Geoffrey will automatically give the Thing a name with an auto-incremented ID
  let name;
  if (opts.type) {
    if (typeof _types[opts.type] === 'undefined') {
      // check _types, if doesn't exist add new key and set to 0
      _types[opts.type] = 0;
    } else{
      // if key exists, increment the value
      _types[opts.type]++;
    }
    name = opts.type + '-' + _types[opts.type];
  }
  if (opts.name) {
    name = opts.name;
  }
  console.log('creating thing with name: ', name, opts);

  let thing;
  // TODO: allow other types of things to be created, besides physics / matter things
  thing = game.matter.add.sprite(opts.x, opts.y, opts.texture, null);
  thing.behaviors = thing.behaviors || {};
  thing.name = name;
  Things[thing.name] = thing;
  return thing;
};

module.exports = Thing;
},{"./Things":5}],5:[function(require,module,exports){
const Things = {};
module.exports = Things;
},{}],6:[function(require,module,exports){
// hasScreenWrap
module.exports = {
  create: function hasScreenWrapCreate (sprite, game) {},
  update: function hasScreenWrapUpdate (sprite, game) {

    let worldWidth = game.sys.game.canvas.width;
    let worldHeight = game.sys.game.canvas.height;

    if (!(sprite && sprite.x && sprite.y)) {
      return;
    }
    var cam = game.cameras.cameras[0];
    if (sprite.x < 0) {
      sprite.x = worldWidth;
      return;
    }
    else if (sprite.x > worldWidth) {
      sprite.x = 0;
      return;
    } if (sprite.y < 0) {
      sprite.y = worldHeight - sprite.height;
      return;
    }
    else if (sprite.y > worldHeight) {
      sprite.y = 0;
      return;
    }

  }
};
},{}],7:[function(require,module,exports){
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
behaviors['hasPlasmaPropulsionEngine'] = require('./movement/hasPlasmaPropulsionEngine');
behaviors['hasMaxVelocity'] = require('./movement/hasMaxVelocity');

//
// Game ( itself ) Behaviors
//

behaviors['hasScreenWrap'] = require('./game/hasScreenWrap');

module.exports = behaviors;
},{"./game/hasScreenWrap":6,"./levels/isLevel0":8,"./movement/hasMaxVelocity":9,"./movement/hasPlasmaPropulsionEngine":10,"./ships/isMIBCaddy":11}],8:[function(require,module,exports){
const Thing = require('../../Geoffrey/Thing');
const Behavior = require('../../Geoffrey/Behavior');

// isLevel0
// level0 is current melee / skirmish level
module.exports = {
  winConditions: [
    {
      // level is complete once one of the players achieved "allOtherPlayersDead" win condition
      name: 'allOtherPlayersDead'
    }
  ],
  // Using the Alien Warz JSON Format we can add default "Things" that will exist when the level is created
  things: {
    /*
    "planet-1": {
        "name": "planet-1",
        "x": 190,
        "y": 460,
        "circle": 25,
        "health": 50,
        "angle": 0,
        "behaviors": {
            "isPlanetoid": {}
        }
    }*/
  },
  create: function createisLevel0 (sprite, opts, game) {
    // alert('start battle')
    // alert('created new level0')
    sprite.line = new Phaser.Geom.Line(0, 0, 200, 200);
    sprite.mid = new Phaser.Geom.Point();

    var cam = game.cameras.main;
    cam.startFollow(sprite.mid);

    let startingLocation = {
      x: 300,
      y: 250
    };

    let p1 = Thing.create({
      name: 'PLAYER_1',
      x: startingLocation.x,
      y: startingLocation.y,
      texture: 'mib-caddy'
    });

    startingLocation = {
      x: 100,
      y: 250
    };

    let p2 = Thing.create({
      name: 'PLAYER_2',
      x: startingLocation.x,
      y: startingLocation.y,
      texture: 'mib-caddy'
    });

    Behavior.attach('isMIBCaddy', p1)
    Behavior.attach('isMIBCaddy', p2)

    Behavior.attach('hasScreenWrap', p1);
    Behavior.attach('hasScreenWrap', p2);

  },
  update: function updateisLevel0 (sprite, game) {
  }
};

},{"../../Geoffrey/Behavior":1,"../../Geoffrey/Thing":4}],9:[function(require,module,exports){
// hasMaxVelocity
module.exports ={
  create: function hasMaxVelocityCreate (sprite, opts) {
    sprite.maxVelocity = opts.maxVelocity || {
      x: 4,
      y: 4
    };
  },
  update: function hasMaxVelocityUpdate (sprite) {
    if (sprite && sprite.body) {
      // calculate the max velocity for x and y axis
      let maxVelocityX = sprite.body.velocity.x > sprite.maxVelocity.x ? 1 : sprite.body.velocity.x < -sprite.maxVelocity.x ? -1 : null;
      let maxVelocityY = sprite.body.velocity.y > sprite.maxVelocity.y ? 1 : sprite.body.velocity.y < -sprite.maxVelocity.y ? -1 : null;
    
      // check each axis to see if the maximum velocity has been exceeded,
      // if so, set the velocity explicity to the max value ( clamping maximum speed )
      if (maxVelocityX) {
        sprite.setVelocity(sprite.maxVelocity.x * maxVelocityX, sprite.body.velocity.y);
      }
      if (maxVelocityY) {
        sprite.setVelocity(sprite.body.velocity.x, sprite.maxVelocity.y * maxVelocityY);
      }
    }
  }
};

},{}],10:[function(require,module,exports){
const Things = require('../../Geoffrey/Things');
/*
    // TODO: rename, 
    hasPlasmaPropulsionEngine, - https://en.wikipedia.org/wiki/Plasma_propulsion_engine
*/
// hasControlledFlight

module.exports = {
  create: function hasPlasmaPropulsionEngineCreate (sprite, opts, game) {
    // 
    sprite.inputs = opts.inputs || sprite.inputs || {};
    sprite.thrustForce = opts.thrustForce || sprite.thrustForce || 0.001;
    sprite.rotationSpeed = sprite.rotationSpeed || opts.rotationSpeed || 0.018;
    sprite.maxRotationSpeed = sprite.maxRotationSpeed || opts.rotationSpeed || 0.5;

    sprite.maxSpeed = sprite.rotationSpeed || opts.maxSpeed || 200;
    sprite.reverseThrust = sprite.reverseThrust || opts.reverseThrust || 100;
    sprite.flightControlled = false;

    sprite.maxVelocity = opts.maxVelocity || sprite.maxVelocity || {
      x: 4,
      y: 4
    };
    sprite.trailTick = 120;
    sprite.lastTrailTick = 0;
    //game.cursors = game.input.keyboard.createCursorKeys();

  },
  update: function hasPlasmaPropulsionEngineUpdate (sprite, game) {
    // console.log('hasControlledFlightUpdate', sprite.inputs)
    //sprite.shipTrail.x = sprite.x;
    //sprite.shipTrail.y = sprite.y;
    //sprite.shipTrail.rotation = sprite.rotation
    sprite.flightControlled = false;

    if (typeof sprite.body === 'undefined') {
      return false;
    }
    //console.log('sss', sprite)
    sprite.foo = "bar";
    //console.log(sprite.foo)

    if (sprite.inputs && sprite.inputs.leftKey) {
      sprite.setAngularVelocity(0);
      sprite.flightControlled = true;
      // holding left bumper enables strafe for turning ( side thrusters )
      if (sprite.inputs.leftBumper) {
        var strafeSpeed = sprite.strafeSpeed || sprite.rotationSpeed;
        sprite.thrustLeft(sprite.thrustForce);
        if (game.time.now - sprite.lastTrailTick > sprite.trailTick) {
          /*
          drawTail(sprite, {
            side: 'starboard'
          }, game);
          */
        }
      } else {
        if (sprite.rotation <= Math.abs(sprite.maxRotationSpeed)) {
           //sprite.setAngularVelocity(r)
        }
        sprite.rotation -= sprite.rotationSpeed;
      }
    }
    else if (sprite.inputs && sprite.inputs.rightKey) {
      sprite.setAngularVelocity(0);
      sprite.flightControlled = true;
      if (sprite.inputs.leftBumper) {
        var strafeSpeed = sprite.strafeSpeed || sprite.rotationSpeed;
        sprite.thrustRight(sprite.thrustForce);
        if (game.time.now - sprite.lastTrailTick > sprite.trailTick) {
          /*
          drawTail(sprite, {
            side: 'port'
          }, game);
          */
        }
      } else {
        if (sprite.rotation <= Math.abs(sprite.maxRotationSpeed)) {
           // sprite.setAngularVelocity(r)
        }
        sprite.rotation += sprite.rotationSpeed;
      }
    }
    else {
      if (sprite.body) {
        sprite.body.angularVelocity = 0;
      }
    }

    if (sprite.inputs && sprite.inputs.upKey) {
      if (game.time.now - sprite.lastTrailTick > sprite.trailTick) {
        /*
        drawTail(sprite, {
          side: 'stern'
        }, game);
        */
      }
      sprite.flightControlled = true;
      sprite.thrust(sprite.thrustForce);
      //sprite.frame = 0;
    } else {
      // sprite.setAngularVelocity(0);
    }
    if (sprite.inputs && sprite.inputs.downKey) {
      //sprite.frame = 2;
      sprite.thrust(0 - sprite.thrustForce);
    }

  }

};
},{"../../Geoffrey/Things":5}],11:[function(require,module,exports){
const Behavior = require('../../Geoffrey/Behavior');

// isMibCaddy
module.exports = {
  tags: ['ship'],
  create: function createIsMibCaddy (sprite, opts, game) {
    sprite.shipType = 'mib-caddy';
    var name = opts.name, tint = opts.tint;
    var height = opts.height, width = opts.width;

    var x = opts.x || sprite.x || 0;
    var y = opts.y || sprite.x || 0;
    sprite.x = x;
    sprite.y = y;

    sprite.height = 18;
    sprite.width = 38;
    sprite.displayHeight = 18;
    sprite.displayWidth = 38;

    sprite.setMass(2);
    sprite.setBounce(0.8);

    sprite.setFriction(0,0);
    sprite.inputs = opts.inputs || sprite.inputs || {};

    sprite.maxSpeed = opts.maxSpeed || 300;
    sprite.reverseThrust = opts.reverseThrust || 300;

    sprite.thrustForce = 0.0025;
    sprite.rotationSpeed = opts.rotationSpeed || 0.088;

    sprite.strafeSpeed = opts.strafeSpeed || 600;

    sprite.rechardEnergyTime = 200;
    sprite.rechargeEnergyRate = 5;
    
    sprite.maxVelocity = {
      x: 3.8,
      y: 3.8
    };

    sprite.inputEnabled = true;
    Behavior.attach('hasPlasmaPropulsionEngine', sprite, {});

    /*
    Behavior.attach('hasHealth', sprite, {
      health: opts.health || 60
    });
    attach('hasEnergy', sprite, {
      energy: opts.energy || 100
    });
    attach('hasSignals', sprite);
    attach('diesWithNoHealth', sprite, {});
    attach('hasFusionGun', sprite, {
      controlKey: 'primaryWeaponKey'
    });
    attach('hasThrusters', sprite, {
      controlKey: 'secondaryWeaponKey'
    });
    attach('hasTemporalDisruptor', sprite, {
      controlKey: 'specialWeaponKey'
    });
    */

  },
  update: function updateIsMibCaddy (sprite, game) {
    // TODO: replace with Behavior.ai code block
    if (sprite.ai && sprite.health <= 20) {
      sprite.fireTemporalDisruptor = true;
    } else {
      sprite.fireTemporalDisruptor = false;
    }

  },
  preload: function preloadMibCaddy (opts, game) {
    game.load.spritesheet('mib-caddy', 'assets/ships/mib-caddy.png', { frameWidth: 140, frameHeight: 48, start: 0, end: 4 });
  }
};



},{"../../Geoffrey/Behavior":1}],12:[function(require,module,exports){
let alienWarz = {
  // This project is awesome
  awesome: true,
  /*
  
    "Things" or "T" is the main hash which stores all Alien Warz objects
    Anything which appears on the screen should have a representation in Things['the-thing-name'],
    where it can be manipulated using the "Things" API found in the Alien Warz documentation

  */
  Thing: require('./Geoffrey/Thing'),
  Things: require('./Geoffrey/Things'),
  /*
  
    "behaviors" can be attached to "Things" in order to create Things which can behave
    Unlimited behaviors may be attached to a Thing giving it emergent and complex behaviors
  
    For example:
  
    TODO...
   
    "behaviors" are modules which contain the following four exported methods:
  
     create()
       - This is run once, when the Thing which has the behavior is created
     update()
       - This is run on every update on the game loop
     remove()
       - This is run when the Thing the behavior has been attached to is destroyed
  
  */
  behaviors: require('./behaviors'),
  Behavior: require('./Geoffrey/Behavior'),
  Game: require('./Geoffrey/Game'),
  inputs: require('./inputs/inputs'),
  
  // Any additional top-level methods can be added here, try not to add things to the top-level if you can!
  alert: function () {
  }
};

module.exports = alienWarz;

},{"./Geoffrey/Behavior":1,"./Geoffrey/Game":2,"./Geoffrey/Thing":4,"./Geoffrey/Things":5,"./behaviors":7,"./inputs/inputs":13}],13:[function(require,module,exports){
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
},{}]},{},[12])(12)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvR2VvZmZyZXkvQmVoYXZpb3IuanMiLCJsaWIvR2VvZmZyZXkvR2FtZS5qcyIsImxpYi9HZW9mZnJleS9JbnB1dC5qcyIsImxpYi9HZW9mZnJleS9UaGluZy5qcyIsImxpYi9HZW9mZnJleS9UaGluZ3MuanMiLCJsaWIvYmVoYXZpb3JzL2dhbWUvaGFzU2NyZWVuV3JhcC5qcyIsImxpYi9iZWhhdmlvcnMvaW5kZXguanMiLCJsaWIvYmVoYXZpb3JzL2xldmVscy9pc0xldmVsMC5qcyIsImxpYi9iZWhhdmlvcnMvbW92ZW1lbnQvaGFzTWF4VmVsb2NpdHkuanMiLCJsaWIvYmVoYXZpb3JzL21vdmVtZW50L2hhc1BsYXNtYVByb3B1bHNpb25FbmdpbmUuanMiLCJsaWIvYmVoYXZpb3JzL3NoaXBzL2lzTUlCQ2FkZHkuanMiLCJsaWIvaW5kZXguanMiLCJsaWIvaW5wdXRzL2lucHV0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IEJlaGF2aW9yID0ge307XG5CZWhhdmlvci5hdHRhY2ggPSBmdW5jdGlvbiBhdHRhY2hCZWhhdmlvciAoYmVoYXZpb3IsIHNwcml0ZSwgb3B0cykge1xuXG4gIGNvbnN0IGJlaGF2aW9ycyA9IHJlcXVpcmUoJy4uL2JlaGF2aW9ycycpO1xuXG4gIGlmICh0eXBlb2Ygc3ByaXRlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgLy8gdGhyb3cgbmV3IEVycm9yKCdXYXJuaW5nOiBhdHRlbXB0aW5nIHRvIGF0dGFjaCBiZWhhdmlvciB0byB1bmRlZmluZWQgc3ByaXRlICcgKyBiZWhhdmlvcilcbiAgICBjb25zb2xlLmxvZygnV2FybmluZzogYXR0ZW1wdGluZyB0byBhdHRhY2ggYmVoYXZpb3IgdG8gdW5kZWZpbmVkIHNwcml0ZSAnICsgYmVoYXZpb3IpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICBzcHJpdGUuYmVoYXZpb3JzID0gc3ByaXRlLmJlaGF2aW9ycyB8fCB7fTtcbiAgc3ByaXRlLmJlaGF2aW9yc1tiZWhhdmlvcl0gPSBiZWhhdmlvcnNbYmVoYXZpb3JdO1xuXG4gIGlmICh0eXBlb2Ygc3ByaXRlLmJlaGF2aW9yc1tiZWhhdmlvcl0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0JlaGF2aW9yIGNvdWxkIG5vdCBiZSByZXF1aXJlZDogJyArIGJlaGF2aW9yKTtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygc3ByaXRlLmJlaGF2aW9yc1tiZWhhdmlvcl0uY3JlYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB0cnkge1xuICAgICAgc3ByaXRlLmJlaGF2aW9yc1tiZWhhdmlvcl0uY3JlYXRlKHNwcml0ZSwgb3B0cywgZ2FtZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZygnZXJyb3IgcnVubmluZyAnICsgYmVoYXZpb3IgKyAnLmNyZWF0ZSgpJywgZXJyKTtcbiAgICB9XG4gIH1cblxufTtcblxuQmVoYXZpb3IuZGV0YWNoID0gZnVuY3Rpb24gZGV0YWNoQmVoYXZpb3IgKGJlaGF2aW9yLCBzcHJpdGUsIG9wdHMpIHt9O1xuXG5CZWhhdmlvci5wcm9jZXNzID0gZnVuY3Rpb24gcHJvY2Vzc0JlaGF2aW9yICh0aGluZykge1xuXG4gIGNvbnN0IGJlaGF2aW9ycyA9IHJlcXVpcmUoJy4uL2JlaGF2aW9ycycpO1xuXG4gIGlmICh0eXBlb2YgdGhpbmcgPT09IFwib2JqZWN0XCIpIHtcbiAgICBpZiAodHlwZW9mIHRoaW5nLmJlaGF2aW9ycyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgdmFyIGJlaGF2aW9yS2V5cyA9IE9iamVjdC5rZXlzKHRoaW5nLmJlaGF2aW9ycyk7XG4gICAgICBiZWhhdmlvcktleXMuZm9yRWFjaChmdW5jdGlvbiAoYikge1xuICAgICAgICBpZiAodHlwZW9mIHRoaW5nLmJlaGF2aW9yc1tiXSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpbmcuYmVoYXZpb3JzW2JdLnVwZGF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICB0aGluZy5iZWhhdmlvcnNbYl0udXBkYXRlLmNhbGwodGhpcywgdGhpbmcsIGdhbWUsIHRoaW5nLmJlaGF2aW9yc1tiXS5jb25maWcpO1xuICAgICAgICAgICAgICAvLyBSZW1hcms6IFRoaXMgaXMgdGhlIGJlc3QgcGxhY2UgdG8gY2xhbXAgbWF4IHZlbG9jaXR5IG9mIGFsbCBwaHlzaWNzIGJvZGllc1xuICAgICAgICAgICAgICAvLyAgIFRoaXMgbXVzdCBiZSBkb25lIGFmdGVyIGFsbCBwb3NzaWJsZSB0aHJ1c3QgaXMgYXBwbGllZCAoIGFmdGVyIGFsbCBiZWhhdmlvcnMgcnVuIClcbiAgICAgICAgICAgICAgLy8gVE9ETzogV2UgY291bGQgcHJvYmFibHkgaW1wbGVtZW50IHRoaXMgYXMgYSBzZXJpZXMgb2YgXCJhZnRlclwiIGJlaGF2aW9ycyxcbiAgICAgICAgICAgICAgLy8gICAgICAgb3IgYWRkIGNhcmRpbmFsaXR5IHRvIHRoZSBvcmRlciBvZiBiZWhhdmlvcnNcbiAgICAgICAgICAgICAgaWYgKHRoaW5nLm1heFZlbG9jaXR5KSB7XG4gICAgICAgICAgICAgICAgYmVoYXZpb3JzLmhhc01heFZlbG9jaXR5LnVwZGF0ZSh0aGluZyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2FybmluZzogZXJyb3IgaW4gcHJvY2Vzc2luZyB1cGRhdGUgY2FsbCBmb3I6JyArIGIsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCZWhhdmlvcjsiLCJjb25zdCBCZWhhdmlvciA9IHJlcXVpcmUoJy4vQmVoYXZpb3InKTtcbmNvbnN0IFRoaW5nID0gcmVxdWlyZSgnLi9UaGluZycpO1xuY29uc3QgVGhpbmdzID0gcmVxdWlyZSgnLi9UaGluZ3MnKTtcbmNvbnN0IElucHV0ID0gcmVxdWlyZSgnLi9JbnB1dCcpO1xuXG4vLyBHYW1lIG9iamVjdCBpcyByZXNwb25zaWJsZSBmb3IgYWdncmVnYXRpbmcgYWxsIGdhbWUgYmVoYXZpb3JzIGludG8gY29tbW9uIFBoYXNlci5nYW1lIHByZWxvYWQgLyBjcmVhdGUgLyB1cGRhdGUgaGFuZGxlcnNcbmxldCBHYW1lID0ge307XG5HYW1lLl91cGRhdGVzID0gW107XG5HYW1lLl9jcmVhdGVzID0gW107XG5HYW1lLl9wcmVsb2FkcyA9IFtdO1xuXG5HYW1lLmJpbmRDcmVhdGUgPSBmdW5jdGlvbiBiaW5kQ3JlYXRlIChmbikge1xuICAvLyBhZGRzIG5ldyBjcmVhdGUgZnVuY3Rpb25zIHRvIEdhbWUgY3JlYXRlIGNoYWluXG4gIEdhbWUuX2NyZWF0ZXMucHVzaChmbilcbn07XG5cbkdhbWUuY3JlYXRlID0gZnVuY3Rpb24gZ2FtZUNyZWF0ZSAoKSB7XG4gIEdhbWUuX2NyZWF0ZXMuZm9yRWFjaChmdW5jdGlvbihmKXtcbiAgICBmKGdhbWUpO1xuICB9KTtcbn07XG5cbkdhbWUuYmluZFVwZGF0ZSA9IGZ1bmN0aW9uIGJpbmRVcGRhdGUgKGZuKSB7XG4gIC8vIGFkZHMgbmV3IHVwZGF0ZSBmdW5jdGlvbiB0byBHYW1lIHVwZGF0ZSBjaGFpblxuICBHYW1lLl91cGRhdGVzLnB1c2goZm4pXG59O1xuXG5HYW1lLnVwZGF0ZSA9IGZ1bmN0aW9uIGdhbWVVcGRhdGUgKGdhbWUpIHtcbiAgR2FtZS5fdXBkYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGYpe1xuICAgIGYoZ2FtZSk7XG4gIH0pO1xufTtcblxuR2FtZS5wcmVsb2FkID0gZnVuY3Rpb24gZ2FtZVByZWxvYWQgKCkge1xuICBnYW1lID0gdGhpcztcblxuICAvKlxuICBnYW1lLm1hdHRlci53b3JsZC5vbignY29sbGlzaW9uc3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIGJvZHlBLCBib2R5Qikge1xuICAgIGdsb2JhbENvbGxpc2lvbkhhbmRsZXIoZXZlbnQsIGJvZHlBLCBib2R5Qik7XG4gIH0pO1xuICAqL1xuXG4gIGNvbnN0IGJlaGF2aW9ycyA9IHJlcXVpcmUoJy4uL2JlaGF2aW9ycycpO1xuXG4gIGZvciAobGV0IGIgaW4gYmVoYXZpb3JzKSB7XG4gICAgaWYgKHR5cGVvZiBiZWhhdmlvcnNbYl0ucHJlbG9hZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zb2xlLmxvZygncHJlbG9hZGluZyBzcHJpdGUnLCAgYmVoYXZpb3JzW2JdLnByZWxvYWQudG9TdHJpbmcoKSlcbiAgICAgICAgYmVoYXZpb3JzW2JdLnByZWxvYWQoe30sIGdhbWUpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdlcnJvciBydW5uaW5nICcgKyBiICsgJy5wcmVsb2FkKCknLCBlcnIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbn07XG5cbkdhbWUuaW5pdCA9IGZ1bmN0aW9uIGluaXRHYW1lICgpIHtcblxuICB2YXIgd29ybGRXaWR0aCA9IDEwMjQ7XG4gIHZhciB3b3JsZEhlaWdodCA9IDc1OTtcblxuICB2YXIgcmVuZGVyTW9kZSA9IFBoYXNlci5BVVRPO1xuXG4gIHZhciBfY29uZmlnID0ge1xuICAgIHR5cGU6IHJlbmRlck1vZGUsXG4gICAgcGFyZW50OiAnZ2FtZS1jYW52YXMtZGl2JyxcbiAgICB3aWR0aDogd29ybGRXaWR0aCxcbiAgICBoZWlnaHQ6IHdvcmxkSGVpZ2h0LFxuICAgIHBoeXNpY3M6IHtcbiAgICAgIGRlZmF1bHQ6ICdtYXR0ZXInLFxuICAgICAgbWF0dGVyOiB7XG4gICAgICAgIGRlYnVnOiB0cnVlLFxuICAgICAgICBncmF2aXR5OiB7IHk6IDAsIHg6IDAgfSxcbiAgICAgICAgcGx1Z2luczoge1xuICAgICAgICAgIGF0dHJhY3RvcnM6IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgc2NlbmU6IHtcbiAgICAgIHByZWxvYWQ6IEdhbWUucHJlbG9hZCxcbiAgICAgIGNyZWF0ZTogR2FtZS5jcmVhdGUsXG4gICAgICB1cGRhdGU6IHVwZGF0ZSxcbiAgICAgIHJlbmRlcjogcmVuZGVyXG4gICAgfVxuICB9O1xuXG4gIC8vIGNyZWF0ZSBuZXcgcGhhc2VyIGdhbWVcbiAgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZShfY29uZmlnKTtcblxuICBHYW1lLmJpbmRDcmVhdGUoY3JlYXRlKTtcblxuICBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgLy8gY3JlYXRlIG5ldyBzY2VuZSBmb3IgYmF0dGxlIGdyb3VuZFxuICAgIHZhciBfY29uZmlnID0ge1xuICAgICAgICBrZXk6ICdiYXR0bGVncm91bmQnLFxuICAgICAgICAvLyBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAvLyB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAvLyBwYWNrOiBmYWxzZSxcbiAgICAgICAgLy8gY2FtZXJhczogbnVsbCxcbiAgICAgICAgLy8gbWFwOiB7fSxcbiAgICAgICAgLy8gcGh5c2ljczoge30sXG4gICAgICAgIC8vIGxvYWRlcjoge30sXG4gICAgICAgIC8vIHBsdWdpbnM6IGZhbHNlLFxuICAgICAgICAvLyBpbnB1dDoge31cbiAgICAgICAgcGh5c2ljczoge1xuICAgICAgICAgIGRlZmF1bHQ6ICdtYXR0ZXInLFxuICAgICAgICAgIG1hdHRlcjoge1xuICAgICAgICAgICAgZ3Jhdml0eTogeyB5OiAwLCB4OiAwIH0sXG4gICAgICAgICAgICBkZWJ1ZzogdHJ1ZSxcbiAgICAgICAgICAgIHBsdWdpbnM6IHtcbiAgICAgICAgICAgICAgYXR0cmFjdG9yczogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gIEEgc3BhY2UgYmFja2dyb3VuZFxuICAgIC8vIFRPRE86IHJlcGxhY2Ugc3ByaXRlXG4gICAgLy9iZyA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMjAwMDAsIDIwMDAwLCAnc3BhY2UnKTtcbiAgICAvL2JnLmNvbnRleHQuZmlsbFN0eWxlID0gJyNGRkZGRkYnO1xuICAgIC8vYmcudGludCA9IDB4ZmYwMDAwO1xuICAgIC8vYmcuc2V0RGVwdGgoMSk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZSAoKSB7XG4gICAgLypcbiAgICB2YXIgY2FtID0gZ2FtZS5jYW1lcmFzLm1haW47XG4gICAgY2FtLnNldFNpemUod29ybGRXaWR0aCwgd29ybGRIZWlnaHQpO1xuICAgICovXG4gICAgSW5wdXQucHJvY2VzcyhnYW1lKTtcbiAgICBHYW1lLnVwZGF0ZShnYW1lKTtcbiAgICBmb3IgKGxldCB0aGluZyBpbiBUaGluZ3MpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCd1cGRhdGluZycsIHRoaW5nKVxuICAgICAgQmVoYXZpb3IucHJvY2VzcyhUaGluZ3NbdGhpbmddKTtcbiAgICB9XG4gICAgZ2FtZS5jYW1lcmFzLmNhbWVyYXNbMF0uc2V0Qm91bmRzKDAsIDAsIHdvcmxkV2lkdGgsIHdvcmxkSGVpZ2h0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBkZWJ1Z1JlbmRlcigpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lO1xuXG5cbmZ1bmN0aW9uIGdsb2JhbENvbGxpc2lvbkhhbmRsZXIgKGV2ZW50KSB7XG4gIC8vIFJlbWFyazogT25seSB1c2UgZXZlbnQgYXJndW1lbnQgYW5kIGV2ZW50LnBhaXJzIHZhbHVlXG4gIC8vY29uc29sZS5sb2coJ2NvbGxpc2lvbiBldmVudCcsIGV2ZW50KTtcbiAgLy9jb25zb2xlLmxvZygnY29sbGlzaW9uIHBhaXJzJywgcGFpcnMpO1xuICAvLyBjb25zb2xlLmxvZyhcIkNPTExJREVTXCIsIGV2ZW50LnBhaXJzKVxuICB2YXIgcGFpcnMgPSBldmVudC5wYWlycztcbiAgLy8gVE9ETzogcG9ydCBoYXNDb2xsaXNpb25zIGJlaGF2aW9yIGNvZGUgaGVyZS4uLmNlbnRyYWwgY29sbGlzaW9uIGRldGVjdG9yLi4uXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcGFpciA9IHBhaXJzW2ldO1xuICAgIHZhciB0MSA9IHBhaXIuYm9keUEuZ2FtZU9iamVjdDtcbiAgICB2YXIgdDIgPSBwYWlyLmJvZHlCLmdhbWVPYmplY3Q7XG5cbiAgICAvLyBoYW5kbGUgc2Vuc29yIGNvbGxpc2lvbnMgZmlyc3RcbiAgICBpZiAocGFpci5pc1NlbnNvcikge1xuICAgICAgdmFyIGJvZHlBID0gcGFpci5ib2R5QTtcbiAgICAgIHZhciBib2R5QiA9IHBhaXIuYm9keUI7XG4gICAgICBpZiAocGFpci5ib2R5QS5nYW1lT2JqZWN0ICE9PSBudWxsICYmIHBhaXIuYm9keUIuZ2FtZU9iamVjdCAhPT0gbnVsbCkge1xuICAgICAgICBwYWlyLmJvZHlBLmdhbWVPYmplY3QudG91Y2hpbmcgPSBwYWlyLmJvZHlBLmdhbWVPYmplY3QudG91Y2hpbmcgfHwge307XG4gICAgICAgIHBhaXIuYm9keUIuZ2FtZU9iamVjdC50b3VjaGluZyA9IHBhaXIuYm9keUIuZ2FtZU9iamVjdC50b3VjaGluZyB8fCB7fTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3NlbnNvciBoaXQnLCBwYWlyLCBib2R5QS5sYWJlbCwgYm9keUIubGFiZWwpO1xuICAgICAgICBpZiAoYm9keUEubGFiZWwgPT09ICdib3R0b20nIHx8IGJvZHlCLmxhYmVsID09PSAnYm90dG9tJykge1xuICAgICAgICAgIHBhaXIuYm9keUEuZ2FtZU9iamVjdC50b3VjaGluZy5ib3R0b20gPSB0cnVlO1xuICAgICAgICAgIHBhaXIuYm9keUIuZ2FtZU9iamVjdC50b3VjaGluZy5ib3R0b20gPSB0cnVlO1xuICAgICAgICAgIHBhaXIuYm9keUEuZ2FtZU9iamVjdC5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgICAgcGFpci5ib2R5Qi5nYW1lT2JqZWN0Lmp1bXBpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy9jb25zb2xlLmxvZygnY29sbGlkZXMnLCB0MS5uYW1lLCB0Mi5uYW1lKVxuICAgIC8vcmV0dXJuO1xuICAgIGlmICh0MSA9PT0gbnVsbCB8fCB0MiA9PT0gbnVsbCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIC8vIGNvbGxpZGVzIHdpdGggc2VsZlxuICAgIGlmICh0MS5uYW1lID09PSB0Mi5uYW1lKSB7XG4gICAgICBwYWlyLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgfVxuICAgIC8vIGNvbnNvbGUubG9nKHQxLCB0MilcbiAgICBpZiAodDEuc2tpcENvbGxpc2lvbiB8fCB0Mi5za2lwQ29sbGlzaW9uKSB7XG4gICAgICBwYWlyLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAvLyBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHQxLmJlZm9yZUNvbGxpc2lvbkNoZWNrKSB7XG4gICAgICB0MS5iZWZvcmVDb2xsaXNpb25DaGVjayh0MiwgcGFpcik7XG4gICAgfVxuICAgIGlmICh0Mi5iZWZvcmVDb2xsaXNpb25DaGVjaykge1xuICAgICAgdDIuYmVmb3JlQ29sbGlzaW9uQ2hlY2sodDEsIHBhaXIpO1xuICAgIH1cbiAgICAvL1xuICAgIC8vIENvbGxpZGVzIHdpdGggcGFyZW50XG4gICAgLy9cbiAgICBpZiAodDEubmFtZSA9PT0gdDIub3duZXIpIHtcbiAgICAgIHBhaXIuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgIC8vIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAodDEub3duZXIgPT09IHQyLm5hbWUpIHtcbiAgICAgIHBhaXIuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgIC8vIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gQ29sbGlkZXMgd2l0aCBzaWJsaW5nc1xuICAgIC8vXG4gICAgaWYgKHR5cGVvZiB0MS5vd25lciAhPT0gJ3VuZGVmaW5lZCcgJiYgdDEub3duZXIgPT09IHQyLm93bmVyKSB7XG4gICAgICBwYWlyLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgICAvLyBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAocGFpci5pc0FjdGl2ZSkge1xuICAgICAgaWYgKHQxLmNvbGxpc2lvbkhhbmRsZXIpIHtcbiAgICAgICAgdDEuY29sbGlzaW9uSGFuZGxlcih0MiwgcGFpcik7XG4gICAgICB9XG4gICAgICBpZiAodDIuY29sbGlzaW9uSGFuZGxlcikge1xuICAgICAgICB0Mi5jb2xsaXNpb25IYW5kbGVyKHQxLCBwYWlyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHQxLmltcGFjdHMgPT09IGZhbHNlIHx8IHQyLmltcGFjdHMgPT09IGZhbHNlKSB7XG4gICAgICAgIHBhaXIuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgLy8gY29udGludWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHQxLmFkZGl0aW9uYWxDb2xsaXNpb25DaGVjaykge1xuICAgICAgdDEuYWRkaXRpb25hbENvbGxpc2lvbkNoZWNrKHQyLCB0MSk7XG4gICAgfVxuXG4gICAgaWYgKHQyLmFkZGl0aW9uYWxDb2xsaXNpb25DaGVjaykge1xuICAgICAgdDIuYWRkaXRpb25hbENvbGxpc2lvbkNoZWNrKHQxLCB0Mik7XG4gICAgfVxuICB9XG5cbn0iLCJjb25zdCBJbnB1dCA9IHt9O1xuY29uc3QgaW5wdXRzID0gcmVxdWlyZSgnLi4vaW5wdXRzL2lucHV0cycpO1xuXG5JbnB1dC5wcm9jZXNzID0gZnVuY3Rpb24gcHJvY2Vzc0lucHV0IChnYW1lKSB7XG4gIGNvbnN0IFRoaW5ncyA9IHJlcXVpcmUoJy4vVGhpbmdzJyk7XG4gIGZvciAobGV0IHBsYXllciBpbiBpbnB1dHMpIHtcbiAgICBmb3IgKGxldCBpbnB1dCBpbiBpbnB1dHNbcGxheWVyXSkge1xuICAgICAgdmFyIGtleSA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KGlucHV0c1twbGF5ZXJdW2lucHV0XSk7XG4gICAgICBUaGluZ3NbcGxheWVyXS5pbnB1dHMgPSBUaGluZ3NbcGxheWVyXS5pbnB1dHMgfHwge307XG4gICAgICBpZiAoa2V5LmlzRG93bikge1xuICAgICAgICBUaGluZ3NbcGxheWVyXS5pbnB1dHNbaW5wdXRdID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFRoaW5nc1twbGF5ZXJdLmlucHV0c1tpbnB1dF0gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnB1dDtcbiIsImNvbnN0IFRoaW5nID0ge307XG5jb25zdCBUaGluZ3MgPSByZXF1aXJlKCcuL1RoaW5ncycpO1xuVGhpbmcuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlVGhpbmcgKG9wdHMpIHtcbiAgLy8gZmlyc3QsIGRldGVybWluZSB3aGF0IHRoZSBuYW1lIG9mIHRoZSB0aGluZyB3aWxsIGJlXG4gIC8vIGlmIGEgVGhpbmcgaGFzIGEgdHlwZSwgR2VvZmZyZXkgd2lsbCBhdXRvbWF0aWNhbGx5IGdpdmUgdGhlIFRoaW5nIGEgbmFtZSB3aXRoIGFuIGF1dG8taW5jcmVtZW50ZWQgSURcbiAgbGV0IG5hbWU7XG4gIGlmIChvcHRzLnR5cGUpIHtcbiAgICBpZiAodHlwZW9mIF90eXBlc1tvcHRzLnR5cGVdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gY2hlY2sgX3R5cGVzLCBpZiBkb2Vzbid0IGV4aXN0IGFkZCBuZXcga2V5IGFuZCBzZXQgdG8gMFxuICAgICAgX3R5cGVzW29wdHMudHlwZV0gPSAwO1xuICAgIH0gZWxzZXtcbiAgICAgIC8vIGlmIGtleSBleGlzdHMsIGluY3JlbWVudCB0aGUgdmFsdWVcbiAgICAgIF90eXBlc1tvcHRzLnR5cGVdKys7XG4gICAgfVxuICAgIG5hbWUgPSBvcHRzLnR5cGUgKyAnLScgKyBfdHlwZXNbb3B0cy50eXBlXTtcbiAgfVxuICBpZiAob3B0cy5uYW1lKSB7XG4gICAgbmFtZSA9IG9wdHMubmFtZTtcbiAgfVxuICBjb25zb2xlLmxvZygnY3JlYXRpbmcgdGhpbmcgd2l0aCBuYW1lOiAnLCBuYW1lLCBvcHRzKTtcblxuICBsZXQgdGhpbmc7XG4gIC8vIFRPRE86IGFsbG93IG90aGVyIHR5cGVzIG9mIHRoaW5ncyB0byBiZSBjcmVhdGVkLCBiZXNpZGVzIHBoeXNpY3MgLyBtYXR0ZXIgdGhpbmdzXG4gIHRoaW5nID0gZ2FtZS5tYXR0ZXIuYWRkLnNwcml0ZShvcHRzLngsIG9wdHMueSwgb3B0cy50ZXh0dXJlLCBudWxsKTtcbiAgdGhpbmcuYmVoYXZpb3JzID0gdGhpbmcuYmVoYXZpb3JzIHx8IHt9O1xuICB0aGluZy5uYW1lID0gbmFtZTtcbiAgVGhpbmdzW3RoaW5nLm5hbWVdID0gdGhpbmc7XG4gIHJldHVybiB0aGluZztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGhpbmc7IiwiY29uc3QgVGhpbmdzID0ge307XG5tb2R1bGUuZXhwb3J0cyA9IFRoaW5nczsiLCIvLyBoYXNTY3JlZW5XcmFwXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiBoYXNTY3JlZW5XcmFwQ3JlYXRlIChzcHJpdGUsIGdhbWUpIHt9LFxuICB1cGRhdGU6IGZ1bmN0aW9uIGhhc1NjcmVlbldyYXBVcGRhdGUgKHNwcml0ZSwgZ2FtZSkge1xuXG4gICAgbGV0IHdvcmxkV2lkdGggPSBnYW1lLnN5cy5nYW1lLmNhbnZhcy53aWR0aDtcbiAgICBsZXQgd29ybGRIZWlnaHQgPSBnYW1lLnN5cy5nYW1lLmNhbnZhcy5oZWlnaHQ7XG5cbiAgICBpZiAoIShzcHJpdGUgJiYgc3ByaXRlLnggJiYgc3ByaXRlLnkpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBjYW0gPSBnYW1lLmNhbWVyYXMuY2FtZXJhc1swXTtcbiAgICBpZiAoc3ByaXRlLnggPCAwKSB7XG4gICAgICBzcHJpdGUueCA9IHdvcmxkV2lkdGg7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKHNwcml0ZS54ID4gd29ybGRXaWR0aCkge1xuICAgICAgc3ByaXRlLnggPSAwO1xuICAgICAgcmV0dXJuO1xuICAgIH0gaWYgKHNwcml0ZS55IDwgMCkge1xuICAgICAgc3ByaXRlLnkgPSB3b3JsZEhlaWdodCAtIHNwcml0ZS5oZWlnaHQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKHNwcml0ZS55ID4gd29ybGRIZWlnaHQpIHtcbiAgICAgIHNwcml0ZS55ID0gMDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgfVxufTsiLCJjb25zdCBiZWhhdmlvcnMgPSB7fTtcblxuXG4vL1xuLy8gTGV2ZWxzIGFzIEJlaGF2aW9yc1xuLy9cbmJlaGF2aW9yc1snaXNMZXZlbDAnXSA9IHJlcXVpcmUoJy4vbGV2ZWxzL2lzTGV2ZWwwJyk7XG5cbi8vXG4vLyBTaGlwIEJlaGF2aW9yc1xuLy9cbmJlaGF2aW9yc1snaXNNSUJDYWRkeSddID0gcmVxdWlyZSgnLi9zaGlwcy9pc01JQkNhZGR5Jyk7XG5cbi8vXG4vLyBNb3ZlbWVudCBiYXNlZCBCZWhhdmlvcnNcbi8vXG5iZWhhdmlvcnNbJ2hhc1BsYXNtYVByb3B1bHNpb25FbmdpbmUnXSA9IHJlcXVpcmUoJy4vbW92ZW1lbnQvaGFzUGxhc21hUHJvcHVsc2lvbkVuZ2luZScpO1xuYmVoYXZpb3JzWydoYXNNYXhWZWxvY2l0eSddID0gcmVxdWlyZSgnLi9tb3ZlbWVudC9oYXNNYXhWZWxvY2l0eScpO1xuXG4vL1xuLy8gR2FtZSAoIGl0c2VsZiApIEJlaGF2aW9yc1xuLy9cblxuYmVoYXZpb3JzWydoYXNTY3JlZW5XcmFwJ10gPSByZXF1aXJlKCcuL2dhbWUvaGFzU2NyZWVuV3JhcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJlaGF2aW9yczsiLCJjb25zdCBUaGluZyA9IHJlcXVpcmUoJy4uLy4uL0dlb2ZmcmV5L1RoaW5nJyk7XG5jb25zdCBCZWhhdmlvciA9IHJlcXVpcmUoJy4uLy4uL0dlb2ZmcmV5L0JlaGF2aW9yJyk7XG5cbi8vIGlzTGV2ZWwwXG4vLyBsZXZlbDAgaXMgY3VycmVudCBtZWxlZSAvIHNraXJtaXNoIGxldmVsXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgd2luQ29uZGl0aW9uczogW1xuICAgIHtcbiAgICAgIC8vIGxldmVsIGlzIGNvbXBsZXRlIG9uY2Ugb25lIG9mIHRoZSBwbGF5ZXJzIGFjaGlldmVkIFwiYWxsT3RoZXJQbGF5ZXJzRGVhZFwiIHdpbiBjb25kaXRpb25cbiAgICAgIG5hbWU6ICdhbGxPdGhlclBsYXllcnNEZWFkJ1xuICAgIH1cbiAgXSxcbiAgLy8gVXNpbmcgdGhlIEFsaWVuIFdhcnogSlNPTiBGb3JtYXQgd2UgY2FuIGFkZCBkZWZhdWx0IFwiVGhpbmdzXCIgdGhhdCB3aWxsIGV4aXN0IHdoZW4gdGhlIGxldmVsIGlzIGNyZWF0ZWRcbiAgdGhpbmdzOiB7XG4gICAgLypcbiAgICBcInBsYW5ldC0xXCI6IHtcbiAgICAgICAgXCJuYW1lXCI6IFwicGxhbmV0LTFcIixcbiAgICAgICAgXCJ4XCI6IDE5MCxcbiAgICAgICAgXCJ5XCI6IDQ2MCxcbiAgICAgICAgXCJjaXJjbGVcIjogMjUsXG4gICAgICAgIFwiaGVhbHRoXCI6IDUwLFxuICAgICAgICBcImFuZ2xlXCI6IDAsXG4gICAgICAgIFwiYmVoYXZpb3JzXCI6IHtcbiAgICAgICAgICAgIFwiaXNQbGFuZXRvaWRcIjoge31cbiAgICAgICAgfVxuICAgIH0qL1xuICB9LFxuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZWlzTGV2ZWwwIChzcHJpdGUsIG9wdHMsIGdhbWUpIHtcbiAgICAvLyBhbGVydCgnc3RhcnQgYmF0dGxlJylcbiAgICAvLyBhbGVydCgnY3JlYXRlZCBuZXcgbGV2ZWwwJylcbiAgICBzcHJpdGUubGluZSA9IG5ldyBQaGFzZXIuR2VvbS5MaW5lKDAsIDAsIDIwMCwgMjAwKTtcbiAgICBzcHJpdGUubWlkID0gbmV3IFBoYXNlci5HZW9tLlBvaW50KCk7XG5cbiAgICB2YXIgY2FtID0gZ2FtZS5jYW1lcmFzLm1haW47XG4gICAgY2FtLnN0YXJ0Rm9sbG93KHNwcml0ZS5taWQpO1xuXG4gICAgbGV0IHN0YXJ0aW5nTG9jYXRpb24gPSB7XG4gICAgICB4OiAzMDAsXG4gICAgICB5OiAyNTBcbiAgICB9O1xuXG4gICAgbGV0IHAxID0gVGhpbmcuY3JlYXRlKHtcbiAgICAgIG5hbWU6ICdQTEFZRVJfMScsXG4gICAgICB4OiBzdGFydGluZ0xvY2F0aW9uLngsXG4gICAgICB5OiBzdGFydGluZ0xvY2F0aW9uLnksXG4gICAgICB0ZXh0dXJlOiAnbWliLWNhZGR5J1xuICAgIH0pO1xuXG4gICAgc3RhcnRpbmdMb2NhdGlvbiA9IHtcbiAgICAgIHg6IDEwMCxcbiAgICAgIHk6IDI1MFxuICAgIH07XG5cbiAgICBsZXQgcDIgPSBUaGluZy5jcmVhdGUoe1xuICAgICAgbmFtZTogJ1BMQVlFUl8yJyxcbiAgICAgIHg6IHN0YXJ0aW5nTG9jYXRpb24ueCxcbiAgICAgIHk6IHN0YXJ0aW5nTG9jYXRpb24ueSxcbiAgICAgIHRleHR1cmU6ICdtaWItY2FkZHknXG4gICAgfSk7XG5cbiAgICBCZWhhdmlvci5hdHRhY2goJ2lzTUlCQ2FkZHknLCBwMSlcbiAgICBCZWhhdmlvci5hdHRhY2goJ2lzTUlCQ2FkZHknLCBwMilcblxuICAgIEJlaGF2aW9yLmF0dGFjaCgnaGFzU2NyZWVuV3JhcCcsIHAxKTtcbiAgICBCZWhhdmlvci5hdHRhY2goJ2hhc1NjcmVlbldyYXAnLCBwMik7XG5cbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGVpc0xldmVsMCAoc3ByaXRlLCBnYW1lKSB7XG4gIH1cbn07XG4iLCIvLyBoYXNNYXhWZWxvY2l0eVxubW9kdWxlLmV4cG9ydHMgPXtcbiAgY3JlYXRlOiBmdW5jdGlvbiBoYXNNYXhWZWxvY2l0eUNyZWF0ZSAoc3ByaXRlLCBvcHRzKSB7XG4gICAgc3ByaXRlLm1heFZlbG9jaXR5ID0gb3B0cy5tYXhWZWxvY2l0eSB8fCB7XG4gICAgICB4OiA0LFxuICAgICAgeTogNFxuICAgIH07XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gaGFzTWF4VmVsb2NpdHlVcGRhdGUgKHNwcml0ZSkge1xuICAgIGlmIChzcHJpdGUgJiYgc3ByaXRlLmJvZHkpIHtcbiAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgbWF4IHZlbG9jaXR5IGZvciB4IGFuZCB5IGF4aXNcbiAgICAgIGxldCBtYXhWZWxvY2l0eVggPSBzcHJpdGUuYm9keS52ZWxvY2l0eS54ID4gc3ByaXRlLm1heFZlbG9jaXR5LnggPyAxIDogc3ByaXRlLmJvZHkudmVsb2NpdHkueCA8IC1zcHJpdGUubWF4VmVsb2NpdHkueCA/IC0xIDogbnVsbDtcbiAgICAgIGxldCBtYXhWZWxvY2l0eVkgPSBzcHJpdGUuYm9keS52ZWxvY2l0eS55ID4gc3ByaXRlLm1heFZlbG9jaXR5LnkgPyAxIDogc3ByaXRlLmJvZHkudmVsb2NpdHkueSA8IC1zcHJpdGUubWF4VmVsb2NpdHkueSA/IC0xIDogbnVsbDtcbiAgICBcbiAgICAgIC8vIGNoZWNrIGVhY2ggYXhpcyB0byBzZWUgaWYgdGhlIG1heGltdW0gdmVsb2NpdHkgaGFzIGJlZW4gZXhjZWVkZWQsXG4gICAgICAvLyBpZiBzbywgc2V0IHRoZSB2ZWxvY2l0eSBleHBsaWNpdHkgdG8gdGhlIG1heCB2YWx1ZSAoIGNsYW1waW5nIG1heGltdW0gc3BlZWQgKVxuICAgICAgaWYgKG1heFZlbG9jaXR5WCkge1xuICAgICAgICBzcHJpdGUuc2V0VmVsb2NpdHkoc3ByaXRlLm1heFZlbG9jaXR5LnggKiBtYXhWZWxvY2l0eVgsIHNwcml0ZS5ib2R5LnZlbG9jaXR5LnkpO1xuICAgICAgfVxuICAgICAgaWYgKG1heFZlbG9jaXR5WSkge1xuICAgICAgICBzcHJpdGUuc2V0VmVsb2NpdHkoc3ByaXRlLmJvZHkudmVsb2NpdHkueCwgc3ByaXRlLm1heFZlbG9jaXR5LnkgKiBtYXhWZWxvY2l0eVkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcbiIsImNvbnN0IFRoaW5ncyA9IHJlcXVpcmUoJy4uLy4uL0dlb2ZmcmV5L1RoaW5ncycpO1xuLypcbiAgICAvLyBUT0RPOiByZW5hbWUsIFxuICAgIGhhc1BsYXNtYVByb3B1bHNpb25FbmdpbmUsIC0gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUGxhc21hX3Byb3B1bHNpb25fZW5naW5lXG4qL1xuLy8gaGFzQ29udHJvbGxlZEZsaWdodFxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiBoYXNQbGFzbWFQcm9wdWxzaW9uRW5naW5lQ3JlYXRlIChzcHJpdGUsIG9wdHMsIGdhbWUpIHtcbiAgICAvLyBcbiAgICBzcHJpdGUuaW5wdXRzID0gb3B0cy5pbnB1dHMgfHwgc3ByaXRlLmlucHV0cyB8fCB7fTtcbiAgICBzcHJpdGUudGhydXN0Rm9yY2UgPSBvcHRzLnRocnVzdEZvcmNlIHx8IHNwcml0ZS50aHJ1c3RGb3JjZSB8fCAwLjAwMTtcbiAgICBzcHJpdGUucm90YXRpb25TcGVlZCA9IHNwcml0ZS5yb3RhdGlvblNwZWVkIHx8IG9wdHMucm90YXRpb25TcGVlZCB8fCAwLjAxODtcbiAgICBzcHJpdGUubWF4Um90YXRpb25TcGVlZCA9IHNwcml0ZS5tYXhSb3RhdGlvblNwZWVkIHx8IG9wdHMucm90YXRpb25TcGVlZCB8fCAwLjU7XG5cbiAgICBzcHJpdGUubWF4U3BlZWQgPSBzcHJpdGUucm90YXRpb25TcGVlZCB8fCBvcHRzLm1heFNwZWVkIHx8IDIwMDtcbiAgICBzcHJpdGUucmV2ZXJzZVRocnVzdCA9IHNwcml0ZS5yZXZlcnNlVGhydXN0IHx8IG9wdHMucmV2ZXJzZVRocnVzdCB8fCAxMDA7XG4gICAgc3ByaXRlLmZsaWdodENvbnRyb2xsZWQgPSBmYWxzZTtcblxuICAgIHNwcml0ZS5tYXhWZWxvY2l0eSA9IG9wdHMubWF4VmVsb2NpdHkgfHwgc3ByaXRlLm1heFZlbG9jaXR5IHx8IHtcbiAgICAgIHg6IDQsXG4gICAgICB5OiA0XG4gICAgfTtcbiAgICBzcHJpdGUudHJhaWxUaWNrID0gMTIwO1xuICAgIHNwcml0ZS5sYXN0VHJhaWxUaWNrID0gMDtcbiAgICAvL2dhbWUuY3Vyc29ycyA9IGdhbWUuaW5wdXQua2V5Ym9hcmQuY3JlYXRlQ3Vyc29yS2V5cygpO1xuXG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gaGFzUGxhc21hUHJvcHVsc2lvbkVuZ2luZVVwZGF0ZSAoc3ByaXRlLCBnYW1lKSB7XG4gICAgLy8gY29uc29sZS5sb2coJ2hhc0NvbnRyb2xsZWRGbGlnaHRVcGRhdGUnLCBzcHJpdGUuaW5wdXRzKVxuICAgIC8vc3ByaXRlLnNoaXBUcmFpbC54ID0gc3ByaXRlLng7XG4gICAgLy9zcHJpdGUuc2hpcFRyYWlsLnkgPSBzcHJpdGUueTtcbiAgICAvL3Nwcml0ZS5zaGlwVHJhaWwucm90YXRpb24gPSBzcHJpdGUucm90YXRpb25cbiAgICBzcHJpdGUuZmxpZ2h0Q29udHJvbGxlZCA9IGZhbHNlO1xuXG4gICAgaWYgKHR5cGVvZiBzcHJpdGUuYm9keSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZygnc3NzJywgc3ByaXRlKVxuICAgIHNwcml0ZS5mb28gPSBcImJhclwiO1xuICAgIC8vY29uc29sZS5sb2coc3ByaXRlLmZvbylcblxuICAgIGlmIChzcHJpdGUuaW5wdXRzICYmIHNwcml0ZS5pbnB1dHMubGVmdEtleSkge1xuICAgICAgc3ByaXRlLnNldEFuZ3VsYXJWZWxvY2l0eSgwKTtcbiAgICAgIHNwcml0ZS5mbGlnaHRDb250cm9sbGVkID0gdHJ1ZTtcbiAgICAgIC8vIGhvbGRpbmcgbGVmdCBidW1wZXIgZW5hYmxlcyBzdHJhZmUgZm9yIHR1cm5pbmcgKCBzaWRlIHRocnVzdGVycyApXG4gICAgICBpZiAoc3ByaXRlLmlucHV0cy5sZWZ0QnVtcGVyKSB7XG4gICAgICAgIHZhciBzdHJhZmVTcGVlZCA9IHNwcml0ZS5zdHJhZmVTcGVlZCB8fCBzcHJpdGUucm90YXRpb25TcGVlZDtcbiAgICAgICAgc3ByaXRlLnRocnVzdExlZnQoc3ByaXRlLnRocnVzdEZvcmNlKTtcbiAgICAgICAgaWYgKGdhbWUudGltZS5ub3cgLSBzcHJpdGUubGFzdFRyYWlsVGljayA+IHNwcml0ZS50cmFpbFRpY2spIHtcbiAgICAgICAgICAvKlxuICAgICAgICAgIGRyYXdUYWlsKHNwcml0ZSwge1xuICAgICAgICAgICAgc2lkZTogJ3N0YXJib2FyZCdcbiAgICAgICAgICB9LCBnYW1lKTtcbiAgICAgICAgICAqL1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc3ByaXRlLnJvdGF0aW9uIDw9IE1hdGguYWJzKHNwcml0ZS5tYXhSb3RhdGlvblNwZWVkKSkge1xuICAgICAgICAgICAvL3Nwcml0ZS5zZXRBbmd1bGFyVmVsb2NpdHkocilcbiAgICAgICAgfVxuICAgICAgICBzcHJpdGUucm90YXRpb24gLT0gc3ByaXRlLnJvdGF0aW9uU3BlZWQ7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHNwcml0ZS5pbnB1dHMgJiYgc3ByaXRlLmlucHV0cy5yaWdodEtleSkge1xuICAgICAgc3ByaXRlLnNldEFuZ3VsYXJWZWxvY2l0eSgwKTtcbiAgICAgIHNwcml0ZS5mbGlnaHRDb250cm9sbGVkID0gdHJ1ZTtcbiAgICAgIGlmIChzcHJpdGUuaW5wdXRzLmxlZnRCdW1wZXIpIHtcbiAgICAgICAgdmFyIHN0cmFmZVNwZWVkID0gc3ByaXRlLnN0cmFmZVNwZWVkIHx8IHNwcml0ZS5yb3RhdGlvblNwZWVkO1xuICAgICAgICBzcHJpdGUudGhydXN0UmlnaHQoc3ByaXRlLnRocnVzdEZvcmNlKTtcbiAgICAgICAgaWYgKGdhbWUudGltZS5ub3cgLSBzcHJpdGUubGFzdFRyYWlsVGljayA+IHNwcml0ZS50cmFpbFRpY2spIHtcbiAgICAgICAgICAvKlxuICAgICAgICAgIGRyYXdUYWlsKHNwcml0ZSwge1xuICAgICAgICAgICAgc2lkZTogJ3BvcnQnXG4gICAgICAgICAgfSwgZ2FtZSk7XG4gICAgICAgICAgKi9cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNwcml0ZS5yb3RhdGlvbiA8PSBNYXRoLmFicyhzcHJpdGUubWF4Um90YXRpb25TcGVlZCkpIHtcbiAgICAgICAgICAgLy8gc3ByaXRlLnNldEFuZ3VsYXJWZWxvY2l0eShyKVxuICAgICAgICB9XG4gICAgICAgIHNwcml0ZS5yb3RhdGlvbiArPSBzcHJpdGUucm90YXRpb25TcGVlZDtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpZiAoc3ByaXRlLmJvZHkpIHtcbiAgICAgICAgc3ByaXRlLmJvZHkuYW5ndWxhclZlbG9jaXR5ID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3ByaXRlLmlucHV0cyAmJiBzcHJpdGUuaW5wdXRzLnVwS2V5KSB7XG4gICAgICBpZiAoZ2FtZS50aW1lLm5vdyAtIHNwcml0ZS5sYXN0VHJhaWxUaWNrID4gc3ByaXRlLnRyYWlsVGljaykge1xuICAgICAgICAvKlxuICAgICAgICBkcmF3VGFpbChzcHJpdGUsIHtcbiAgICAgICAgICBzaWRlOiAnc3Rlcm4nXG4gICAgICAgIH0sIGdhbWUpO1xuICAgICAgICAqL1xuICAgICAgfVxuICAgICAgc3ByaXRlLmZsaWdodENvbnRyb2xsZWQgPSB0cnVlO1xuICAgICAgc3ByaXRlLnRocnVzdChzcHJpdGUudGhydXN0Rm9yY2UpO1xuICAgICAgLy9zcHJpdGUuZnJhbWUgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzcHJpdGUuc2V0QW5ndWxhclZlbG9jaXR5KDApO1xuICAgIH1cbiAgICBpZiAoc3ByaXRlLmlucHV0cyAmJiBzcHJpdGUuaW5wdXRzLmRvd25LZXkpIHtcbiAgICAgIC8vc3ByaXRlLmZyYW1lID0gMjtcbiAgICAgIHNwcml0ZS50aHJ1c3QoMCAtIHNwcml0ZS50aHJ1c3RGb3JjZSk7XG4gICAgfVxuXG4gIH1cblxufTsiLCJjb25zdCBCZWhhdmlvciA9IHJlcXVpcmUoJy4uLy4uL0dlb2ZmcmV5L0JlaGF2aW9yJyk7XG5cbi8vIGlzTWliQ2FkZHlcbm1vZHVsZS5leHBvcnRzID0ge1xuICB0YWdzOiBbJ3NoaXAnXSxcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGVJc01pYkNhZGR5IChzcHJpdGUsIG9wdHMsIGdhbWUpIHtcbiAgICBzcHJpdGUuc2hpcFR5cGUgPSAnbWliLWNhZGR5JztcbiAgICB2YXIgbmFtZSA9IG9wdHMubmFtZSwgdGludCA9IG9wdHMudGludDtcbiAgICB2YXIgaGVpZ2h0ID0gb3B0cy5oZWlnaHQsIHdpZHRoID0gb3B0cy53aWR0aDtcblxuICAgIHZhciB4ID0gb3B0cy54IHx8IHNwcml0ZS54IHx8IDA7XG4gICAgdmFyIHkgPSBvcHRzLnkgfHwgc3ByaXRlLnggfHwgMDtcbiAgICBzcHJpdGUueCA9IHg7XG4gICAgc3ByaXRlLnkgPSB5O1xuXG4gICAgc3ByaXRlLmhlaWdodCA9IDE4O1xuICAgIHNwcml0ZS53aWR0aCA9IDM4O1xuICAgIHNwcml0ZS5kaXNwbGF5SGVpZ2h0ID0gMTg7XG4gICAgc3ByaXRlLmRpc3BsYXlXaWR0aCA9IDM4O1xuXG4gICAgc3ByaXRlLnNldE1hc3MoMik7XG4gICAgc3ByaXRlLnNldEJvdW5jZSgwLjgpO1xuXG4gICAgc3ByaXRlLnNldEZyaWN0aW9uKDAsMCk7XG4gICAgc3ByaXRlLmlucHV0cyA9IG9wdHMuaW5wdXRzIHx8IHNwcml0ZS5pbnB1dHMgfHwge307XG5cbiAgICBzcHJpdGUubWF4U3BlZWQgPSBvcHRzLm1heFNwZWVkIHx8IDMwMDtcbiAgICBzcHJpdGUucmV2ZXJzZVRocnVzdCA9IG9wdHMucmV2ZXJzZVRocnVzdCB8fCAzMDA7XG5cbiAgICBzcHJpdGUudGhydXN0Rm9yY2UgPSAwLjAwMjU7XG4gICAgc3ByaXRlLnJvdGF0aW9uU3BlZWQgPSBvcHRzLnJvdGF0aW9uU3BlZWQgfHwgMC4wODg7XG5cbiAgICBzcHJpdGUuc3RyYWZlU3BlZWQgPSBvcHRzLnN0cmFmZVNwZWVkIHx8IDYwMDtcblxuICAgIHNwcml0ZS5yZWNoYXJkRW5lcmd5VGltZSA9IDIwMDtcbiAgICBzcHJpdGUucmVjaGFyZ2VFbmVyZ3lSYXRlID0gNTtcbiAgICBcbiAgICBzcHJpdGUubWF4VmVsb2NpdHkgPSB7XG4gICAgICB4OiAzLjgsXG4gICAgICB5OiAzLjhcbiAgICB9O1xuXG4gICAgc3ByaXRlLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgQmVoYXZpb3IuYXR0YWNoKCdoYXNQbGFzbWFQcm9wdWxzaW9uRW5naW5lJywgc3ByaXRlLCB7fSk7XG5cbiAgICAvKlxuICAgIEJlaGF2aW9yLmF0dGFjaCgnaGFzSGVhbHRoJywgc3ByaXRlLCB7XG4gICAgICBoZWFsdGg6IG9wdHMuaGVhbHRoIHx8IDYwXG4gICAgfSk7XG4gICAgYXR0YWNoKCdoYXNFbmVyZ3knLCBzcHJpdGUsIHtcbiAgICAgIGVuZXJneTogb3B0cy5lbmVyZ3kgfHwgMTAwXG4gICAgfSk7XG4gICAgYXR0YWNoKCdoYXNTaWduYWxzJywgc3ByaXRlKTtcbiAgICBhdHRhY2goJ2RpZXNXaXRoTm9IZWFsdGgnLCBzcHJpdGUsIHt9KTtcbiAgICBhdHRhY2goJ2hhc0Z1c2lvbkd1bicsIHNwcml0ZSwge1xuICAgICAgY29udHJvbEtleTogJ3ByaW1hcnlXZWFwb25LZXknXG4gICAgfSk7XG4gICAgYXR0YWNoKCdoYXNUaHJ1c3RlcnMnLCBzcHJpdGUsIHtcbiAgICAgIGNvbnRyb2xLZXk6ICdzZWNvbmRhcnlXZWFwb25LZXknXG4gICAgfSk7XG4gICAgYXR0YWNoKCdoYXNUZW1wb3JhbERpc3J1cHRvcicsIHNwcml0ZSwge1xuICAgICAgY29udHJvbEtleTogJ3NwZWNpYWxXZWFwb25LZXknXG4gICAgfSk7XG4gICAgKi9cblxuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZUlzTWliQ2FkZHkgKHNwcml0ZSwgZ2FtZSkge1xuICAgIC8vIFRPRE86IHJlcGxhY2Ugd2l0aCBCZWhhdmlvci5haSBjb2RlIGJsb2NrXG4gICAgaWYgKHNwcml0ZS5haSAmJiBzcHJpdGUuaGVhbHRoIDw9IDIwKSB7XG4gICAgICBzcHJpdGUuZmlyZVRlbXBvcmFsRGlzcnVwdG9yID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3ByaXRlLmZpcmVUZW1wb3JhbERpc3J1cHRvciA9IGZhbHNlO1xuICAgIH1cblxuICB9LFxuICBwcmVsb2FkOiBmdW5jdGlvbiBwcmVsb2FkTWliQ2FkZHkgKG9wdHMsIGdhbWUpIHtcbiAgICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ21pYi1jYWRkeScsICdhc3NldHMvc2hpcHMvbWliLWNhZGR5LnBuZycsIHsgZnJhbWVXaWR0aDogMTQwLCBmcmFtZUhlaWdodDogNDgsIHN0YXJ0OiAwLCBlbmQ6IDQgfSk7XG4gIH1cbn07XG5cblxuIiwibGV0IGFsaWVuV2FyeiA9IHtcbiAgLy8gVGhpcyBwcm9qZWN0IGlzIGF3ZXNvbWVcbiAgYXdlc29tZTogdHJ1ZSxcbiAgLypcbiAgXG4gICAgXCJUaGluZ3NcIiBvciBcIlRcIiBpcyB0aGUgbWFpbiBoYXNoIHdoaWNoIHN0b3JlcyBhbGwgQWxpZW4gV2FyeiBvYmplY3RzXG4gICAgQW55dGhpbmcgd2hpY2ggYXBwZWFycyBvbiB0aGUgc2NyZWVuIHNob3VsZCBoYXZlIGEgcmVwcmVzZW50YXRpb24gaW4gVGhpbmdzWyd0aGUtdGhpbmctbmFtZSddLFxuICAgIHdoZXJlIGl0IGNhbiBiZSBtYW5pcHVsYXRlZCB1c2luZyB0aGUgXCJUaGluZ3NcIiBBUEkgZm91bmQgaW4gdGhlIEFsaWVuIFdhcnogZG9jdW1lbnRhdGlvblxuXG4gICovXG4gIFRoaW5nOiByZXF1aXJlKCcuL0dlb2ZmcmV5L1RoaW5nJyksXG4gIFRoaW5nczogcmVxdWlyZSgnLi9HZW9mZnJleS9UaGluZ3MnKSxcbiAgLypcbiAgXG4gICAgXCJiZWhhdmlvcnNcIiBjYW4gYmUgYXR0YWNoZWQgdG8gXCJUaGluZ3NcIiBpbiBvcmRlciB0byBjcmVhdGUgVGhpbmdzIHdoaWNoIGNhbiBiZWhhdmVcbiAgICBVbmxpbWl0ZWQgYmVoYXZpb3JzIG1heSBiZSBhdHRhY2hlZCB0byBhIFRoaW5nIGdpdmluZyBpdCBlbWVyZ2VudCBhbmQgY29tcGxleCBiZWhhdmlvcnNcbiAgXG4gICAgRm9yIGV4YW1wbGU6XG4gIFxuICAgIFRPRE8uLi5cbiAgIFxuICAgIFwiYmVoYXZpb3JzXCIgYXJlIG1vZHVsZXMgd2hpY2ggY29udGFpbiB0aGUgZm9sbG93aW5nIGZvdXIgZXhwb3J0ZWQgbWV0aG9kczpcbiAgXG4gICAgIGNyZWF0ZSgpXG4gICAgICAgLSBUaGlzIGlzIHJ1biBvbmNlLCB3aGVuIHRoZSBUaGluZyB3aGljaCBoYXMgdGhlIGJlaGF2aW9yIGlzIGNyZWF0ZWRcbiAgICAgdXBkYXRlKClcbiAgICAgICAtIFRoaXMgaXMgcnVuIG9uIGV2ZXJ5IHVwZGF0ZSBvbiB0aGUgZ2FtZSBsb29wXG4gICAgIHJlbW92ZSgpXG4gICAgICAgLSBUaGlzIGlzIHJ1biB3aGVuIHRoZSBUaGluZyB0aGUgYmVoYXZpb3IgaGFzIGJlZW4gYXR0YWNoZWQgdG8gaXMgZGVzdHJveWVkXG4gIFxuICAqL1xuICBiZWhhdmlvcnM6IHJlcXVpcmUoJy4vYmVoYXZpb3JzJyksXG4gIEJlaGF2aW9yOiByZXF1aXJlKCcuL0dlb2ZmcmV5L0JlaGF2aW9yJyksXG4gIEdhbWU6IHJlcXVpcmUoJy4vR2VvZmZyZXkvR2FtZScpLFxuICBpbnB1dHM6IHJlcXVpcmUoJy4vaW5wdXRzL2lucHV0cycpLFxuICBcbiAgLy8gQW55IGFkZGl0aW9uYWwgdG9wLWxldmVsIG1ldGhvZHMgY2FuIGJlIGFkZGVkIGhlcmUsIHRyeSBub3QgdG8gYWRkIHRoaW5ncyB0byB0aGUgdG9wLWxldmVsIGlmIHlvdSBjYW4hXG4gIGFsZXJ0OiBmdW5jdGlvbiAoKSB7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYWxpZW5XYXJ6O1xuIiwidmFyIGlucHV0cyA9IHt9O1xuXG5pbnB1dHNbJ1BMQVlFUl8xJ10gPSB7XG4gIHByaW1hcnlXZWFwb25LZXk6ICdBJyxcbiAgc2Vjb25kYXJ5V2VhcG9uS2V5OiAnUycsXG4gIHNwZWNpYWxXZWFwb25LZXk6ICdEJyxcbiAgdXBLZXk6ICdVUCcsXG4gIGRvd25LZXk6ICdET1dOJyxcbiAgbGVmdEtleTogJ0xFRlQnLFxuICByaWdodEtleTogJ1JJR0hUJyxcbiAgbGVmdEJ1bXBlcjogJ1NISUZUJ1xufTtcblxuaW5wdXRzWydQTEFZRVJfMiddID0ge1xuICBwcmltYXJ5V2VhcG9uS2V5OiAnUScsXG4gIHNlY29uZGFyeVdlYXBvbktleTogJ1cnLFxuICBzcGVjaWFsV2VhcG9uS2V5OiAnRScsXG4gIHVwS2V5OiAnSScsXG4gIGRvd25LZXk6ICdLJyxcbiAgbGVmdEtleTogJ0onLFxuICByaWdodEtleTogJ0wnLFxuICBsZWZ0QnVtcGVyOiAnU0hJRlQnXG59O1xuXG4vLyBtYXAgaW5wdXRzIHRvIGN1cnJlbnQgY29udHJvbGxlciBkZXZpY2UgKCBoYXJkLWNvZGVkIHRvIEtleWJvYXJkIGZvciBub3cgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlucHV0czsiXX0=
