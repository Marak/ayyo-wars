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
        debug: false,
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
  thing = game.matter.add.sprite(opts.x, opts.y, opts.texture);
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
      sprite.x = game.width;
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
           //sprite.setAngularVelocity(r)
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

    sprite.setMass(2);
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvR2VvZmZyZXkvQmVoYXZpb3IuanMiLCJsaWIvR2VvZmZyZXkvR2FtZS5qcyIsImxpYi9HZW9mZnJleS9JbnB1dC5qcyIsImxpYi9HZW9mZnJleS9UaGluZy5qcyIsImxpYi9HZW9mZnJleS9UaGluZ3MuanMiLCJsaWIvYmVoYXZpb3JzL2dhbWUvaGFzU2NyZWVuV3JhcC5qcyIsImxpYi9iZWhhdmlvcnMvaW5kZXguanMiLCJsaWIvYmVoYXZpb3JzL2xldmVscy9pc0xldmVsMC5qcyIsImxpYi9iZWhhdmlvcnMvbW92ZW1lbnQvaGFzTWF4VmVsb2NpdHkuanMiLCJsaWIvYmVoYXZpb3JzL21vdmVtZW50L2hhc1BsYXNtYVByb3B1bHNpb25FbmdpbmUuanMiLCJsaWIvYmVoYXZpb3JzL3NoaXBzL2lzTUlCQ2FkZHkuanMiLCJsaWIvaW5kZXguanMiLCJsaWIvaW5wdXRzL2lucHV0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IEJlaGF2aW9yID0ge307XG5CZWhhdmlvci5hdHRhY2ggPSBmdW5jdGlvbiBhdHRhY2hCZWhhdmlvciAoYmVoYXZpb3IsIHNwcml0ZSwgb3B0cykge1xuXG4gIGNvbnN0IGJlaGF2aW9ycyA9IHJlcXVpcmUoJy4uL2JlaGF2aW9ycycpO1xuXG4gIGlmICh0eXBlb2Ygc3ByaXRlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgLy8gdGhyb3cgbmV3IEVycm9yKCdXYXJuaW5nOiBhdHRlbXB0aW5nIHRvIGF0dGFjaCBiZWhhdmlvciB0byB1bmRlZmluZWQgc3ByaXRlICcgKyBiZWhhdmlvcilcbiAgICBjb25zb2xlLmxvZygnV2FybmluZzogYXR0ZW1wdGluZyB0byBhdHRhY2ggYmVoYXZpb3IgdG8gdW5kZWZpbmVkIHNwcml0ZSAnICsgYmVoYXZpb3IpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICBzcHJpdGUuYmVoYXZpb3JzID0gc3ByaXRlLmJlaGF2aW9ycyB8fCB7fTtcbiAgc3ByaXRlLmJlaGF2aW9yc1tiZWhhdmlvcl0gPSBiZWhhdmlvcnNbYmVoYXZpb3JdO1xuXG4gIGlmICh0eXBlb2Ygc3ByaXRlLmJlaGF2aW9yc1tiZWhhdmlvcl0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0JlaGF2aW9yIGNvdWxkIG5vdCBiZSByZXF1aXJlZDogJyArIGJlaGF2aW9yKTtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygc3ByaXRlLmJlaGF2aW9yc1tiZWhhdmlvcl0uY3JlYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB0cnkge1xuICAgICAgc3ByaXRlLmJlaGF2aW9yc1tiZWhhdmlvcl0uY3JlYXRlKHNwcml0ZSwgb3B0cywgZ2FtZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZygnZXJyb3IgcnVubmluZyAnICsgYmVoYXZpb3IgKyAnLmNyZWF0ZSgpJywgZXJyKTtcbiAgICB9XG4gIH1cblxufTtcblxuQmVoYXZpb3IuZGV0YWNoID0gZnVuY3Rpb24gZGV0YWNoQmVoYXZpb3IgKGJlaGF2aW9yLCBzcHJpdGUsIG9wdHMpIHt9O1xuXG5CZWhhdmlvci5wcm9jZXNzID0gZnVuY3Rpb24gcHJvY2Vzc0JlaGF2aW9yICh0aGluZykge1xuXG4gIGNvbnN0IGJlaGF2aW9ycyA9IHJlcXVpcmUoJy4uL2JlaGF2aW9ycycpO1xuXG4gIGlmICh0eXBlb2YgdGhpbmcgPT09IFwib2JqZWN0XCIpIHtcbiAgICBpZiAodHlwZW9mIHRoaW5nLmJlaGF2aW9ycyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgdmFyIGJlaGF2aW9yS2V5cyA9IE9iamVjdC5rZXlzKHRoaW5nLmJlaGF2aW9ycyk7XG4gICAgICBiZWhhdmlvcktleXMuZm9yRWFjaChmdW5jdGlvbiAoYikge1xuICAgICAgICBpZiAodHlwZW9mIHRoaW5nLmJlaGF2aW9yc1tiXSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpbmcuYmVoYXZpb3JzW2JdLnVwZGF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICB0aGluZy5iZWhhdmlvcnNbYl0udXBkYXRlLmNhbGwodGhpcywgdGhpbmcsIGdhbWUsIHRoaW5nLmJlaGF2aW9yc1tiXS5jb25maWcpO1xuICAgICAgICAgICAgICAvLyBSZW1hcms6IFRoaXMgaXMgdGhlIGJlc3QgcGxhY2UgdG8gY2xhbXAgbWF4IHZlbG9jaXR5IG9mIGFsbCBwaHlzaWNzIGJvZGllc1xuICAgICAgICAgICAgICAvLyAgIFRoaXMgbXVzdCBiZSBkb25lIGFmdGVyIGFsbCBwb3NzaWJsZSB0aHJ1c3QgaXMgYXBwbGllZCAoIGFmdGVyIGFsbCBiZWhhdmlvcnMgcnVuIClcbiAgICAgICAgICAgICAgLy8gVE9ETzogV2UgY291bGQgcHJvYmFibHkgaW1wbGVtZW50IHRoaXMgYXMgYSBzZXJpZXMgb2YgXCJhZnRlclwiIGJlaGF2aW9ycyxcbiAgICAgICAgICAgICAgLy8gICAgICAgb3IgYWRkIGNhcmRpbmFsaXR5IHRvIHRoZSBvcmRlciBvZiBiZWhhdmlvcnNcbiAgICAgICAgICAgICAgaWYgKHRoaW5nLm1heFZlbG9jaXR5KSB7XG4gICAgICAgICAgICAgICAgYmVoYXZpb3JzLmhhc01heFZlbG9jaXR5LnVwZGF0ZSh0aGluZyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnd2FybmluZzogZXJyb3IgaW4gcHJvY2Vzc2luZyB1cGRhdGUgY2FsbCBmb3I6JyArIGIsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCZWhhdmlvcjsiLCJjb25zdCBCZWhhdmlvciA9IHJlcXVpcmUoJy4vQmVoYXZpb3InKTtcbmNvbnN0IFRoaW5nID0gcmVxdWlyZSgnLi9UaGluZycpO1xuY29uc3QgVGhpbmdzID0gcmVxdWlyZSgnLi9UaGluZ3MnKTtcbmNvbnN0IElucHV0ID0gcmVxdWlyZSgnLi9JbnB1dCcpO1xuXG4vLyBHYW1lIG9iamVjdCBpcyByZXNwb25zaWJsZSBmb3IgYWdncmVnYXRpbmcgYWxsIGdhbWUgYmVoYXZpb3JzIGludG8gY29tbW9uIFBoYXNlci5nYW1lIHByZWxvYWQgLyBjcmVhdGUgLyB1cGRhdGUgaGFuZGxlcnNcbmxldCBHYW1lID0ge307XG5HYW1lLl91cGRhdGVzID0gW107XG5HYW1lLl9jcmVhdGVzID0gW107XG5HYW1lLl9wcmVsb2FkcyA9IFtdO1xuXG5HYW1lLmJpbmRDcmVhdGUgPSBmdW5jdGlvbiBiaW5kQ3JlYXRlIChmbikge1xuICAvLyBhZGRzIG5ldyBjcmVhdGUgZnVuY3Rpb25zIHRvIEdhbWUgY3JlYXRlIGNoYWluXG4gIEdhbWUuX2NyZWF0ZXMucHVzaChmbilcbn07XG5cbkdhbWUuY3JlYXRlID0gZnVuY3Rpb24gZ2FtZUNyZWF0ZSAoKSB7XG4gIEdhbWUuX2NyZWF0ZXMuZm9yRWFjaChmdW5jdGlvbihmKXtcbiAgICBmKGdhbWUpO1xuICB9KTtcbn07XG5cbkdhbWUuYmluZFVwZGF0ZSA9IGZ1bmN0aW9uIGJpbmRVcGRhdGUgKGZuKSB7XG4gIC8vIGFkZHMgbmV3IHVwZGF0ZSBmdW5jdGlvbiB0byBHYW1lIHVwZGF0ZSBjaGFpblxuICBHYW1lLl91cGRhdGVzLnB1c2goZm4pXG59O1xuXG5HYW1lLnVwZGF0ZSA9IGZ1bmN0aW9uIGdhbWVVcGRhdGUgKGdhbWUpIHtcbiAgR2FtZS5fdXBkYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGYpe1xuICAgIGYoZ2FtZSk7XG4gIH0pO1xufTtcblxuR2FtZS5wcmVsb2FkID0gZnVuY3Rpb24gZ2FtZVByZWxvYWQgKCkge1xuICBnYW1lID0gdGhpcztcblxuICBjb25zdCBiZWhhdmlvcnMgPSByZXF1aXJlKCcuLi9iZWhhdmlvcnMnKTtcblxuICBmb3IgKGxldCBiIGluIGJlaGF2aW9ycykge1xuICAgIGlmICh0eXBlb2YgYmVoYXZpb3JzW2JdLnByZWxvYWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5sb2coJ3ByZWxvYWRpbmcgc3ByaXRlJywgIGJlaGF2aW9yc1tiXS5wcmVsb2FkLnRvU3RyaW5nKCkpXG4gICAgICAgIGJlaGF2aW9yc1tiXS5wcmVsb2FkKHt9LCBnYW1lKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZygnZXJyb3IgcnVubmluZyAnICsgYiArICcucHJlbG9hZCgpJywgZXJyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG59O1xuXG5HYW1lLmluaXQgPSBmdW5jdGlvbiBpbml0R2FtZSAoKSB7XG5cbiAgdmFyIHdvcmxkV2lkdGggPSAxMDI0O1xuICB2YXIgd29ybGRIZWlnaHQgPSA3NTk7XG5cbiAgdmFyIHJlbmRlck1vZGUgPSBQaGFzZXIuQVVUTztcblxuICB2YXIgX2NvbmZpZyA9IHtcbiAgICB0eXBlOiByZW5kZXJNb2RlLFxuICAgIHBhcmVudDogJ2dhbWUtY2FudmFzLWRpdicsXG4gICAgd2lkdGg6IHdvcmxkV2lkdGgsXG4gICAgaGVpZ2h0OiB3b3JsZEhlaWdodCxcbiAgICBwaHlzaWNzOiB7XG4gICAgICBkZWZhdWx0OiAnbWF0dGVyJyxcbiAgICAgIG1hdHRlcjoge1xuICAgICAgICBkZWJ1ZzogZmFsc2UsXG4gICAgICAgIGdyYXZpdHk6IHsgeTogMCwgeDogMCB9LFxuICAgICAgICBwbHVnaW5zOiB7XG4gICAgICAgICAgYXR0cmFjdG9yczogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBzY2VuZToge1xuICAgICAgcHJlbG9hZDogR2FtZS5wcmVsb2FkLFxuICAgICAgY3JlYXRlOiBHYW1lLmNyZWF0ZSxcbiAgICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgICAgcmVuZGVyOiByZW5kZXJcbiAgICB9XG4gIH07XG5cbiAgLy8gY3JlYXRlIG5ldyBwaGFzZXIgZ2FtZVxuICBnYW1lID0gbmV3IFBoYXNlci5HYW1lKF9jb25maWcpO1xuICBcbiAgR2FtZS5iaW5kQ3JlYXRlKGNyZWF0ZSk7XG5cbiAgZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIC8vIGNyZWF0ZSBuZXcgc2NlbmUgZm9yIGJhdHRsZSBncm91bmRcbiAgICB2YXIgX2NvbmZpZyA9IHtcbiAgICAgICAga2V5OiAnYmF0dGxlZ3JvdW5kJyxcbiAgICAgICAgLy8gYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgLy8gdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgLy8gcGFjazogZmFsc2UsXG4gICAgICAgIC8vIGNhbWVyYXM6IG51bGwsXG4gICAgICAgIC8vIG1hcDoge30sXG4gICAgICAgIC8vIHBoeXNpY3M6IHt9LFxuICAgICAgICAvLyBsb2FkZXI6IHt9LFxuICAgICAgICAvLyBwbHVnaW5zOiBmYWxzZSxcbiAgICAgICAgLy8gaW5wdXQ6IHt9XG4gICAgICAgIHBoeXNpY3M6IHtcbiAgICAgICAgICBkZWZhdWx0OiAnbWF0dGVyJyxcbiAgICAgICAgICBtYXR0ZXI6IHtcbiAgICAgICAgICAgIGdyYXZpdHk6IHsgeTogMCwgeDogMCB9LFxuICAgICAgICAgICAgZGVidWc6IHRydWUsXG4gICAgICAgICAgICBwbHVnaW5zOiB7XG4gICAgICAgICAgICAgIGF0dHJhY3RvcnM6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vICBBIHNwYWNlIGJhY2tncm91bmRcbiAgICAvLyBUT0RPOiByZXBsYWNlIHNwcml0ZVxuICAgIC8vYmcgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDIwMDAwLCAyMDAwMCwgJ3NwYWNlJyk7XG4gICAgLy9iZy5jb250ZXh0LmZpbGxTdHlsZSA9ICcjRkZGRkZGJztcbiAgICAvL2JnLnRpbnQgPSAweGZmMDAwMDtcbiAgICAvL2JnLnNldERlcHRoKDEpO1xuXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGUgKCkge1xuICAgIC8qXG4gICAgdmFyIGNhbSA9IGdhbWUuY2FtZXJhcy5tYWluO1xuICAgIGNhbS5zZXRTaXplKHdvcmxkV2lkdGgsIHdvcmxkSGVpZ2h0KTtcbiAgICAqL1xuICAgIElucHV0LnByb2Nlc3MoZ2FtZSk7XG4gICAgR2FtZS51cGRhdGUoZ2FtZSk7XG4gICAgZm9yIChsZXQgdGhpbmcgaW4gVGhpbmdzKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZygndXBkYXRpbmcnLCB0aGluZylcbiAgICAgIEJlaGF2aW9yLnByb2Nlc3MoVGhpbmdzW3RoaW5nXSk7XG4gICAgfVxuICAgIGdhbWUuY2FtZXJhcy5jYW1lcmFzWzBdLnNldEJvdW5kcygwLCAwLCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodCk7XG4gIH1cblxuICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgZGVidWdSZW5kZXIoKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcblxuIiwiY29uc3QgSW5wdXQgPSB7fTtcbmNvbnN0IGlucHV0cyA9IHJlcXVpcmUoJy4uL2lucHV0cy9pbnB1dHMnKTtcblxuSW5wdXQucHJvY2VzcyA9IGZ1bmN0aW9uIHByb2Nlc3NJbnB1dCAoZ2FtZSkge1xuICBjb25zdCBUaGluZ3MgPSByZXF1aXJlKCcuL1RoaW5ncycpO1xuICBmb3IgKGxldCBwbGF5ZXIgaW4gaW5wdXRzKSB7XG4gICAgZm9yIChsZXQgaW5wdXQgaW4gaW5wdXRzW3BsYXllcl0pIHtcbiAgICAgIHZhciBrZXkgPSBnYW1lLmlucHV0LmtleWJvYXJkLmFkZEtleShpbnB1dHNbcGxheWVyXVtpbnB1dF0pO1xuICAgICAgVGhpbmdzW3BsYXllcl0uaW5wdXRzID0gVGhpbmdzW3BsYXllcl0uaW5wdXRzIHx8IHt9O1xuICAgICAgaWYgKGtleS5pc0Rvd24pIHtcbiAgICAgICAgVGhpbmdzW3BsYXllcl0uaW5wdXRzW2lucHV0XSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBUaGluZ3NbcGxheWVyXS5pbnB1dHNbaW5wdXRdID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW5wdXQ7XG4iLCJjb25zdCBUaGluZyA9IHt9O1xuY29uc3QgVGhpbmdzID0gcmVxdWlyZSgnLi9UaGluZ3MnKTtcblRoaW5nLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZVRoaW5nIChvcHRzKSB7XG4gIC8vIGZpcnN0LCBkZXRlcm1pbmUgd2hhdCB0aGUgbmFtZSBvZiB0aGUgdGhpbmcgd2lsbCBiZVxuICAvLyBpZiBhIFRoaW5nIGhhcyBhIHR5cGUsIEdlb2ZmcmV5IHdpbGwgYXV0b21hdGljYWxseSBnaXZlIHRoZSBUaGluZyBhIG5hbWUgd2l0aCBhbiBhdXRvLWluY3JlbWVudGVkIElEXG4gIGxldCBuYW1lO1xuICBpZiAob3B0cy50eXBlKSB7XG4gICAgaWYgKHR5cGVvZiBfdHlwZXNbb3B0cy50eXBlXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIGNoZWNrIF90eXBlcywgaWYgZG9lc24ndCBleGlzdCBhZGQgbmV3IGtleSBhbmQgc2V0IHRvIDBcbiAgICAgIF90eXBlc1tvcHRzLnR5cGVdID0gMDtcbiAgICB9IGVsc2V7XG4gICAgICAvLyBpZiBrZXkgZXhpc3RzLCBpbmNyZW1lbnQgdGhlIHZhbHVlXG4gICAgICBfdHlwZXNbb3B0cy50eXBlXSsrO1xuICAgIH1cbiAgICBuYW1lID0gb3B0cy50eXBlICsgJy0nICsgX3R5cGVzW29wdHMudHlwZV07XG4gIH1cbiAgaWYgKG9wdHMubmFtZSkge1xuICAgIG5hbWUgPSBvcHRzLm5hbWU7XG4gIH1cbiAgY29uc29sZS5sb2coJ2NyZWF0aW5nIHRoaW5nIHdpdGggbmFtZTogJywgbmFtZSwgb3B0cyk7XG5cbiAgbGV0IHRoaW5nO1xuICAvLyBUT0RPOiBhbGxvdyBvdGhlciB0eXBlcyBvZiB0aGluZ3MgdG8gYmUgY3JlYXRlZCwgYmVzaWRlcyBwaHlzaWNzIC8gbWF0dGVyIHRoaW5nc1xuICB0aGluZyA9IGdhbWUubWF0dGVyLmFkZC5zcHJpdGUob3B0cy54LCBvcHRzLnksIG9wdHMudGV4dHVyZSk7XG4gIHRoaW5nLmJlaGF2aW9ycyA9IHRoaW5nLmJlaGF2aW9ycyB8fCB7fTtcbiAgdGhpbmcubmFtZSA9IG5hbWU7XG4gIFRoaW5nc1t0aGluZy5uYW1lXSA9IHRoaW5nO1xuICByZXR1cm4gdGhpbmc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRoaW5nOyIsImNvbnN0IFRoaW5ncyA9IHt9O1xubW9kdWxlLmV4cG9ydHMgPSBUaGluZ3M7IiwiLy8gaGFzU2NyZWVuV3JhcFxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogZnVuY3Rpb24gaGFzU2NyZWVuV3JhcENyZWF0ZSAoc3ByaXRlLCBnYW1lKSB7fSxcbiAgdXBkYXRlOiBmdW5jdGlvbiBoYXNTY3JlZW5XcmFwVXBkYXRlIChzcHJpdGUsIGdhbWUpIHtcblxuICAgIGxldCB3b3JsZFdpZHRoID0gZ2FtZS5zeXMuZ2FtZS5jYW52YXMud2lkdGg7XG4gICAgbGV0IHdvcmxkSGVpZ2h0ID0gZ2FtZS5zeXMuZ2FtZS5jYW52YXMuaGVpZ2h0O1xuXG4gICAgaWYgKCEoc3ByaXRlICYmIHNwcml0ZS54ICYmIHNwcml0ZS55KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgY2FtID0gZ2FtZS5jYW1lcmFzLmNhbWVyYXNbMF07XG4gICAgaWYgKHNwcml0ZS54IDwgMCkge1xuICAgICAgc3ByaXRlLnggPSBnYW1lLndpZHRoO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbHNlIGlmIChzcHJpdGUueCA+IHdvcmxkV2lkdGgpIHtcbiAgICAgIHNwcml0ZS54ID0gMDtcbiAgICAgIHJldHVybjtcbiAgICB9IGlmIChzcHJpdGUueSA8IDApIHtcbiAgICAgIHNwcml0ZS55ID0gd29ybGRIZWlnaHQgLSBzcHJpdGUuaGVpZ2h0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbHNlIGlmIChzcHJpdGUueSA+IHdvcmxkSGVpZ2h0KSB7XG4gICAgICBzcHJpdGUueSA9IDA7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gIH1cbn07IiwiY29uc3QgYmVoYXZpb3JzID0ge307XG5cblxuLy9cbi8vIExldmVscyBhcyBCZWhhdmlvcnNcbi8vXG5iZWhhdmlvcnNbJ2lzTGV2ZWwwJ10gPSByZXF1aXJlKCcuL2xldmVscy9pc0xldmVsMCcpO1xuXG4vL1xuLy8gU2hpcCBCZWhhdmlvcnNcbi8vXG5iZWhhdmlvcnNbJ2lzTUlCQ2FkZHknXSA9IHJlcXVpcmUoJy4vc2hpcHMvaXNNSUJDYWRkeScpO1xuXG4vL1xuLy8gTW92ZW1lbnQgYmFzZWQgQmVoYXZpb3JzXG4vL1xuYmVoYXZpb3JzWydoYXNQbGFzbWFQcm9wdWxzaW9uRW5naW5lJ10gPSByZXF1aXJlKCcuL21vdmVtZW50L2hhc1BsYXNtYVByb3B1bHNpb25FbmdpbmUnKTtcbmJlaGF2aW9yc1snaGFzTWF4VmVsb2NpdHknXSA9IHJlcXVpcmUoJy4vbW92ZW1lbnQvaGFzTWF4VmVsb2NpdHknKTtcblxuLy9cbi8vIEdhbWUgKCBpdHNlbGYgKSBCZWhhdmlvcnNcbi8vXG5cbmJlaGF2aW9yc1snaGFzU2NyZWVuV3JhcCddID0gcmVxdWlyZSgnLi9nYW1lL2hhc1NjcmVlbldyYXAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBiZWhhdmlvcnM7IiwiY29uc3QgVGhpbmcgPSByZXF1aXJlKCcuLi8uLi9HZW9mZnJleS9UaGluZycpO1xuY29uc3QgQmVoYXZpb3IgPSByZXF1aXJlKCcuLi8uLi9HZW9mZnJleS9CZWhhdmlvcicpO1xuXG4vLyBpc0xldmVsMFxuLy8gbGV2ZWwwIGlzIGN1cnJlbnQgbWVsZWUgLyBza2lybWlzaCBsZXZlbFxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHdpbkNvbmRpdGlvbnM6IFtcbiAgICB7XG4gICAgICAvLyBsZXZlbCBpcyBjb21wbGV0ZSBvbmNlIG9uZSBvZiB0aGUgcGxheWVycyBhY2hpZXZlZCBcImFsbE90aGVyUGxheWVyc0RlYWRcIiB3aW4gY29uZGl0aW9uXG4gICAgICBuYW1lOiAnYWxsT3RoZXJQbGF5ZXJzRGVhZCdcbiAgICB9XG4gIF0sXG4gIC8vIFVzaW5nIHRoZSBBbGllbiBXYXJ6IEpTT04gRm9ybWF0IHdlIGNhbiBhZGQgZGVmYXVsdCBcIlRoaW5nc1wiIHRoYXQgd2lsbCBleGlzdCB3aGVuIHRoZSBsZXZlbCBpcyBjcmVhdGVkXG4gIHRoaW5nczoge1xuICAgIC8qXG4gICAgXCJwbGFuZXQtMVwiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcInBsYW5ldC0xXCIsXG4gICAgICAgIFwieFwiOiAxOTAsXG4gICAgICAgIFwieVwiOiA0NjAsXG4gICAgICAgIFwiY2lyY2xlXCI6IDI1LFxuICAgICAgICBcImhlYWx0aFwiOiA1MCxcbiAgICAgICAgXCJhbmdsZVwiOiAwLFxuICAgICAgICBcImJlaGF2aW9yc1wiOiB7XG4gICAgICAgICAgICBcImlzUGxhbmV0b2lkXCI6IHt9XG4gICAgICAgIH1cbiAgICB9Ki9cbiAgfSxcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGVpc0xldmVsMCAoc3ByaXRlLCBvcHRzLCBnYW1lKSB7XG4gICAgLy8gYWxlcnQoJ3N0YXJ0IGJhdHRsZScpXG4gICAgLy8gYWxlcnQoJ2NyZWF0ZWQgbmV3IGxldmVsMCcpXG4gICAgc3ByaXRlLmxpbmUgPSBuZXcgUGhhc2VyLkdlb20uTGluZSgwLCAwLCAyMDAsIDIwMCk7XG4gICAgc3ByaXRlLm1pZCA9IG5ldyBQaGFzZXIuR2VvbS5Qb2ludCgpO1xuXG4gICAgdmFyIGNhbSA9IGdhbWUuY2FtZXJhcy5tYWluO1xuICAgIGNhbS5zdGFydEZvbGxvdyhzcHJpdGUubWlkKTtcblxuICAgIGxldCBzdGFydGluZ0xvY2F0aW9uID0ge1xuICAgICAgeDogMzAwLFxuICAgICAgeTogMjUwXG4gICAgfTtcblxuICAgIGxldCBwMSA9IFRoaW5nLmNyZWF0ZSh7XG4gICAgICBuYW1lOiAnUExBWUVSXzEnLFxuICAgICAgeDogc3RhcnRpbmdMb2NhdGlvbi54LFxuICAgICAgeTogc3RhcnRpbmdMb2NhdGlvbi55LFxuICAgICAgdGV4dHVyZTogJ21pYi1jYWRkeSdcbiAgICB9KTtcblxuICAgIHN0YXJ0aW5nTG9jYXRpb24gPSB7XG4gICAgICB4OiAxMDAsXG4gICAgICB5OiAyNTBcbiAgICB9O1xuXG4gICAgbGV0IHAyID0gVGhpbmcuY3JlYXRlKHtcbiAgICAgIG5hbWU6ICdQTEFZRVJfMicsXG4gICAgICB4OiBzdGFydGluZ0xvY2F0aW9uLngsXG4gICAgICB5OiBzdGFydGluZ0xvY2F0aW9uLnksXG4gICAgICB0ZXh0dXJlOiAnbWliLWNhZGR5J1xuICAgIH0pO1xuXG4gICAgQmVoYXZpb3IuYXR0YWNoKCdpc01JQkNhZGR5JywgcDEpXG4gICAgQmVoYXZpb3IuYXR0YWNoKCdpc01JQkNhZGR5JywgcDIpXG5cbiAgICBCZWhhdmlvci5hdHRhY2goJ2hhc1NjcmVlbldyYXAnLCBwMSk7XG4gICAgQmVoYXZpb3IuYXR0YWNoKCdoYXNTY3JlZW5XcmFwJywgcDIpO1xuXG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlaXNMZXZlbDAgKHNwcml0ZSwgZ2FtZSkge1xuICB9XG59O1xuIiwiLy8gaGFzTWF4VmVsb2NpdHlcbm1vZHVsZS5leHBvcnRzID17XG4gIGNyZWF0ZTogZnVuY3Rpb24gaGFzTWF4VmVsb2NpdHlDcmVhdGUgKHNwcml0ZSwgb3B0cykge1xuICAgIHNwcml0ZS5tYXhWZWxvY2l0eSA9IG9wdHMubWF4VmVsb2NpdHkgfHwge1xuICAgICAgeDogNCxcbiAgICAgIHk6IDRcbiAgICB9O1xuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uIGhhc01heFZlbG9jaXR5VXBkYXRlIChzcHJpdGUpIHtcbiAgICBpZiAoc3ByaXRlICYmIHNwcml0ZS5ib2R5KSB7XG4gICAgICAvLyBjYWxjdWxhdGUgdGhlIG1heCB2ZWxvY2l0eSBmb3IgeCBhbmQgeSBheGlzXG4gICAgICBsZXQgbWF4VmVsb2NpdHlYID0gc3ByaXRlLmJvZHkudmVsb2NpdHkueCA+IHNwcml0ZS5tYXhWZWxvY2l0eS54ID8gMSA6IHNwcml0ZS5ib2R5LnZlbG9jaXR5LnggPCAtc3ByaXRlLm1heFZlbG9jaXR5LnggPyAtMSA6IG51bGw7XG4gICAgICBsZXQgbWF4VmVsb2NpdHlZID0gc3ByaXRlLmJvZHkudmVsb2NpdHkueSA+IHNwcml0ZS5tYXhWZWxvY2l0eS55ID8gMSA6IHNwcml0ZS5ib2R5LnZlbG9jaXR5LnkgPCAtc3ByaXRlLm1heFZlbG9jaXR5LnkgPyAtMSA6IG51bGw7XG4gICAgXG4gICAgICAvLyBjaGVjayBlYWNoIGF4aXMgdG8gc2VlIGlmIHRoZSBtYXhpbXVtIHZlbG9jaXR5IGhhcyBiZWVuIGV4Y2VlZGVkLFxuICAgICAgLy8gaWYgc28sIHNldCB0aGUgdmVsb2NpdHkgZXhwbGljaXR5IHRvIHRoZSBtYXggdmFsdWUgKCBjbGFtcGluZyBtYXhpbXVtIHNwZWVkIClcbiAgICAgIGlmIChtYXhWZWxvY2l0eVgpIHtcbiAgICAgICAgc3ByaXRlLnNldFZlbG9jaXR5KHNwcml0ZS5tYXhWZWxvY2l0eS54ICogbWF4VmVsb2NpdHlYLCBzcHJpdGUuYm9keS52ZWxvY2l0eS55KTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhWZWxvY2l0eVkpIHtcbiAgICAgICAgc3ByaXRlLnNldFZlbG9jaXR5KHNwcml0ZS5ib2R5LnZlbG9jaXR5LngsIHNwcml0ZS5tYXhWZWxvY2l0eS55ICogbWF4VmVsb2NpdHlZKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG4iLCJjb25zdCBUaGluZ3MgPSByZXF1aXJlKCcuLi8uLi9HZW9mZnJleS9UaGluZ3MnKTtcbi8qXG4gICAgLy8gVE9ETzogcmVuYW1lLCBcbiAgICBoYXNQbGFzbWFQcm9wdWxzaW9uRW5naW5lLCAtIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1BsYXNtYV9wcm9wdWxzaW9uX2VuZ2luZVxuKi9cbi8vIGhhc0NvbnRyb2xsZWRGbGlnaHRcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogZnVuY3Rpb24gaGFzUGxhc21hUHJvcHVsc2lvbkVuZ2luZUNyZWF0ZSAoc3ByaXRlLCBvcHRzLCBnYW1lKSB7XG4gICAgLy8gXG4gICAgc3ByaXRlLmlucHV0cyA9IG9wdHMuaW5wdXRzIHx8IHNwcml0ZS5pbnB1dHMgfHwge307XG4gICAgc3ByaXRlLnRocnVzdEZvcmNlID0gb3B0cy50aHJ1c3RGb3JjZSB8fCBzcHJpdGUudGhydXN0Rm9yY2UgfHwgMC4wMDE7XG4gICAgc3ByaXRlLnJvdGF0aW9uU3BlZWQgPSBzcHJpdGUucm90YXRpb25TcGVlZCB8fCBvcHRzLnJvdGF0aW9uU3BlZWQgfHwgMC4wMTg7XG4gICAgc3ByaXRlLm1heFJvdGF0aW9uU3BlZWQgPSBzcHJpdGUubWF4Um90YXRpb25TcGVlZCB8fCBvcHRzLnJvdGF0aW9uU3BlZWQgfHwgMC41O1xuXG4gICAgc3ByaXRlLm1heFNwZWVkID0gc3ByaXRlLnJvdGF0aW9uU3BlZWQgfHwgb3B0cy5tYXhTcGVlZCB8fCAyMDA7XG4gICAgc3ByaXRlLnJldmVyc2VUaHJ1c3QgPSBzcHJpdGUucmV2ZXJzZVRocnVzdCB8fCBvcHRzLnJldmVyc2VUaHJ1c3QgfHwgMTAwO1xuICAgIHNwcml0ZS5mbGlnaHRDb250cm9sbGVkID0gZmFsc2U7XG5cbiAgICBzcHJpdGUubWF4VmVsb2NpdHkgPSBvcHRzLm1heFZlbG9jaXR5IHx8IHNwcml0ZS5tYXhWZWxvY2l0eSB8fCB7XG4gICAgICB4OiA0LFxuICAgICAgeTogNFxuICAgIH07XG4gICAgc3ByaXRlLnRyYWlsVGljayA9IDEyMDtcbiAgICBzcHJpdGUubGFzdFRyYWlsVGljayA9IDA7XG4gICAgLy9nYW1lLmN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcblxuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uIGhhc1BsYXNtYVByb3B1bHNpb25FbmdpbmVVcGRhdGUgKHNwcml0ZSwgZ2FtZSkge1xuICAgIC8vIGNvbnNvbGUubG9nKCdoYXNDb250cm9sbGVkRmxpZ2h0VXBkYXRlJywgc3ByaXRlLmlucHV0cylcbiAgICAvL3Nwcml0ZS5zaGlwVHJhaWwueCA9IHNwcml0ZS54O1xuICAgIC8vc3ByaXRlLnNoaXBUcmFpbC55ID0gc3ByaXRlLnk7XG4gICAgLy9zcHJpdGUuc2hpcFRyYWlsLnJvdGF0aW9uID0gc3ByaXRlLnJvdGF0aW9uXG4gICAgc3ByaXRlLmZsaWdodENvbnRyb2xsZWQgPSBmYWxzZTtcblxuICAgIGlmICh0eXBlb2Ygc3ByaXRlLmJvZHkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coJ3NzcycsIHNwcml0ZSlcbiAgICBzcHJpdGUuZm9vID0gXCJiYXJcIjtcbiAgICAvL2NvbnNvbGUubG9nKHNwcml0ZS5mb28pXG5cbiAgICBpZiAoc3ByaXRlLmlucHV0cyAmJiBzcHJpdGUuaW5wdXRzLmxlZnRLZXkpIHtcbiAgICAgIFxuICAgICAgc3ByaXRlLmZsaWdodENvbnRyb2xsZWQgPSB0cnVlO1xuICAgICAgLy8gaG9sZGluZyBsZWZ0IGJ1bXBlciBlbmFibGVzIHN0cmFmZSBmb3IgdHVybmluZyAoIHNpZGUgdGhydXN0ZXJzIClcbiAgICAgIGlmIChzcHJpdGUuaW5wdXRzLmxlZnRCdW1wZXIpIHtcbiAgICAgICAgdmFyIHN0cmFmZVNwZWVkID0gc3ByaXRlLnN0cmFmZVNwZWVkIHx8IHNwcml0ZS5yb3RhdGlvblNwZWVkO1xuICAgICAgICBzcHJpdGUudGhydXN0TGVmdChzcHJpdGUudGhydXN0Rm9yY2UpO1xuICAgICAgICBpZiAoZ2FtZS50aW1lLm5vdyAtIHNwcml0ZS5sYXN0VHJhaWxUaWNrID4gc3ByaXRlLnRyYWlsVGljaykge1xuICAgICAgICAgIC8qXG4gICAgICAgICAgZHJhd1RhaWwoc3ByaXRlLCB7XG4gICAgICAgICAgICBzaWRlOiAnc3RhcmJvYXJkJ1xuICAgICAgICAgIH0sIGdhbWUpO1xuICAgICAgICAgICovXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzcHJpdGUucm90YXRpb24gPD0gTWF0aC5hYnMoc3ByaXRlLm1heFJvdGF0aW9uU3BlZWQpKSB7XG4gICAgICAgICAgIC8vc3ByaXRlLnNldEFuZ3VsYXJWZWxvY2l0eShyKVxuICAgICAgICB9XG4gICAgICAgIHNwcml0ZS5yb3RhdGlvbiAtPSBzcHJpdGUucm90YXRpb25TcGVlZDtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoc3ByaXRlLmlucHV0cyAmJiBzcHJpdGUuaW5wdXRzLnJpZ2h0S2V5KSB7XG4gICAgICBzcHJpdGUuZmxpZ2h0Q29udHJvbGxlZCA9IHRydWU7XG4gICAgICBpZiAoc3ByaXRlLmlucHV0cy5sZWZ0QnVtcGVyKSB7XG4gICAgICAgIHZhciBzdHJhZmVTcGVlZCA9IHNwcml0ZS5zdHJhZmVTcGVlZCB8fCBzcHJpdGUucm90YXRpb25TcGVlZDtcbiAgICAgICAgc3ByaXRlLnRocnVzdFJpZ2h0KHNwcml0ZS50aHJ1c3RGb3JjZSk7XG4gICAgICAgIGlmIChnYW1lLnRpbWUubm93IC0gc3ByaXRlLmxhc3RUcmFpbFRpY2sgPiBzcHJpdGUudHJhaWxUaWNrKSB7XG4gICAgICAgICAgLypcbiAgICAgICAgICBkcmF3VGFpbChzcHJpdGUsIHtcbiAgICAgICAgICAgIHNpZGU6ICdwb3J0J1xuICAgICAgICAgIH0sIGdhbWUpO1xuICAgICAgICAgICovXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzcHJpdGUucm90YXRpb24gPD0gTWF0aC5hYnMoc3ByaXRlLm1heFJvdGF0aW9uU3BlZWQpKSB7XG4gICAgICAgICAgIC8vc3ByaXRlLnNldEFuZ3VsYXJWZWxvY2l0eShyKVxuICAgICAgICB9XG4gICAgICAgIHNwcml0ZS5yb3RhdGlvbiArPSBzcHJpdGUucm90YXRpb25TcGVlZDtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpZiAoc3ByaXRlLmJvZHkpIHtcbiAgICAgICAgc3ByaXRlLmJvZHkuYW5ndWxhclZlbG9jaXR5ID0gMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3ByaXRlLmlucHV0cyAmJiBzcHJpdGUuaW5wdXRzLnVwS2V5KSB7XG4gICAgICBpZiAoZ2FtZS50aW1lLm5vdyAtIHNwcml0ZS5sYXN0VHJhaWxUaWNrID4gc3ByaXRlLnRyYWlsVGljaykge1xuICAgICAgICAvKlxuICAgICAgICBkcmF3VGFpbChzcHJpdGUsIHtcbiAgICAgICAgICBzaWRlOiAnc3Rlcm4nXG4gICAgICAgIH0sIGdhbWUpO1xuICAgICAgICAqL1xuICAgICAgfVxuICAgICAgc3ByaXRlLmZsaWdodENvbnRyb2xsZWQgPSB0cnVlO1xuICAgICAgc3ByaXRlLnRocnVzdChzcHJpdGUudGhydXN0Rm9yY2UpO1xuICAgICAgLy9zcHJpdGUuZnJhbWUgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzcHJpdGUuc2V0QW5ndWxhclZlbG9jaXR5KDApO1xuICAgIH1cbiAgICBpZiAoc3ByaXRlLmlucHV0cyAmJiBzcHJpdGUuaW5wdXRzLmRvd25LZXkpIHtcbiAgICAgIC8vc3ByaXRlLmZyYW1lID0gMjtcbiAgICAgIHNwcml0ZS50aHJ1c3QoMCAtIHNwcml0ZS50aHJ1c3RGb3JjZSk7XG4gICAgfVxuXG4gIH1cblxufTsiLCJjb25zdCBCZWhhdmlvciA9IHJlcXVpcmUoJy4uLy4uL0dlb2ZmcmV5L0JlaGF2aW9yJyk7XG5cbi8vIGlzTWliQ2FkZHlcbm1vZHVsZS5leHBvcnRzID0ge1xuICB0YWdzOiBbJ3NoaXAnXSxcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGVJc01pYkNhZGR5IChzcHJpdGUsIG9wdHMsIGdhbWUpIHtcbiAgICBzcHJpdGUuc2hpcFR5cGUgPSAnbWliLWNhZGR5JztcbiAgICB2YXIgbmFtZSA9IG9wdHMubmFtZSwgdGludCA9IG9wdHMudGludDtcbiAgICB2YXIgaGVpZ2h0ID0gb3B0cy5oZWlnaHQsIHdpZHRoID0gb3B0cy53aWR0aDtcblxuICAgIHZhciB4ID0gb3B0cy54IHx8IHNwcml0ZS54IHx8IDA7XG4gICAgdmFyIHkgPSBvcHRzLnkgfHwgc3ByaXRlLnggfHwgMDtcbiAgICBzcHJpdGUueCA9IHg7XG4gICAgc3ByaXRlLnkgPSB5O1xuXG4gICAgc3ByaXRlLnNldE1hc3MoMik7XG4gICAgc3ByaXRlLnNldEZyaWN0aW9uKDAsMCk7XG4gICAgc3ByaXRlLmlucHV0cyA9IG9wdHMuaW5wdXRzIHx8IHNwcml0ZS5pbnB1dHMgfHwge307XG5cbiAgICBzcHJpdGUubWF4U3BlZWQgPSBvcHRzLm1heFNwZWVkIHx8IDMwMDtcbiAgICBzcHJpdGUucmV2ZXJzZVRocnVzdCA9IG9wdHMucmV2ZXJzZVRocnVzdCB8fCAzMDA7XG5cbiAgICBzcHJpdGUudGhydXN0Rm9yY2UgPSAwLjAwMjU7XG4gICAgc3ByaXRlLnJvdGF0aW9uU3BlZWQgPSBvcHRzLnJvdGF0aW9uU3BlZWQgfHwgMC4wODg7XG5cbiAgICBzcHJpdGUuc3RyYWZlU3BlZWQgPSBvcHRzLnN0cmFmZVNwZWVkIHx8IDYwMDtcblxuICAgIHNwcml0ZS5yZWNoYXJkRW5lcmd5VGltZSA9IDIwMDtcbiAgICBzcHJpdGUucmVjaGFyZ2VFbmVyZ3lSYXRlID0gNTtcbiAgICBcbiAgICBzcHJpdGUubWF4VmVsb2NpdHkgPSB7XG4gICAgICB4OiAzLjgsXG4gICAgICB5OiAzLjhcbiAgICB9O1xuXG4gICAgc3ByaXRlLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgQmVoYXZpb3IuYXR0YWNoKCdoYXNQbGFzbWFQcm9wdWxzaW9uRW5naW5lJywgc3ByaXRlLCB7fSk7XG5cbiAgICAvKlxuICAgIEJlaGF2aW9yLmF0dGFjaCgnaGFzSGVhbHRoJywgc3ByaXRlLCB7XG4gICAgICBoZWFsdGg6IG9wdHMuaGVhbHRoIHx8IDYwXG4gICAgfSk7XG4gICAgYXR0YWNoKCdoYXNFbmVyZ3knLCBzcHJpdGUsIHtcbiAgICAgIGVuZXJneTogb3B0cy5lbmVyZ3kgfHwgMTAwXG4gICAgfSk7XG4gICAgYXR0YWNoKCdoYXNTaWduYWxzJywgc3ByaXRlKTtcbiAgICBhdHRhY2goJ2RpZXNXaXRoTm9IZWFsdGgnLCBzcHJpdGUsIHt9KTtcbiAgICBhdHRhY2goJ2hhc0Z1c2lvbkd1bicsIHNwcml0ZSwge1xuICAgICAgY29udHJvbEtleTogJ3ByaW1hcnlXZWFwb25LZXknXG4gICAgfSk7XG4gICAgYXR0YWNoKCdoYXNUaHJ1c3RlcnMnLCBzcHJpdGUsIHtcbiAgICAgIGNvbnRyb2xLZXk6ICdzZWNvbmRhcnlXZWFwb25LZXknXG4gICAgfSk7XG4gICAgYXR0YWNoKCdoYXNUZW1wb3JhbERpc3J1cHRvcicsIHNwcml0ZSwge1xuICAgICAgY29udHJvbEtleTogJ3NwZWNpYWxXZWFwb25LZXknXG4gICAgfSk7XG4gICAgKi9cblxuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZUlzTWliQ2FkZHkgKHNwcml0ZSwgZ2FtZSkge1xuICAgIC8vIFRPRE86IHJlcGxhY2Ugd2l0aCBCZWhhdmlvci5haSBjb2RlIGJsb2NrXG4gICAgaWYgKHNwcml0ZS5haSAmJiBzcHJpdGUuaGVhbHRoIDw9IDIwKSB7XG4gICAgICBzcHJpdGUuZmlyZVRlbXBvcmFsRGlzcnVwdG9yID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3ByaXRlLmZpcmVUZW1wb3JhbERpc3J1cHRvciA9IGZhbHNlO1xuICAgIH1cblxuICB9LFxuICBwcmVsb2FkOiBmdW5jdGlvbiBwcmVsb2FkTWliQ2FkZHkgKG9wdHMsIGdhbWUpIHtcbiAgICBnYW1lLmxvYWQuc3ByaXRlc2hlZXQoJ21pYi1jYWRkeScsICdhc3NldHMvc2hpcHMvbWliLWNhZGR5LnBuZycsIHsgZnJhbWVXaWR0aDogMTQwLCBmcmFtZUhlaWdodDogNDgsIHN0YXJ0OiAwLCBlbmQ6IDQgfSk7XG4gIH1cbn07XG5cblxuIiwibGV0IGFsaWVuV2FyeiA9IHtcbiAgLy8gVGhpcyBwcm9qZWN0IGlzIGF3ZXNvbWVcbiAgYXdlc29tZTogdHJ1ZSxcbiAgLypcbiAgXG4gICAgXCJUaGluZ3NcIiBvciBcIlRcIiBpcyB0aGUgbWFpbiBoYXNoIHdoaWNoIHN0b3JlcyBhbGwgQWxpZW4gV2FyeiBvYmplY3RzXG4gICAgQW55dGhpbmcgd2hpY2ggYXBwZWFycyBvbiB0aGUgc2NyZWVuIHNob3VsZCBoYXZlIGEgcmVwcmVzZW50YXRpb24gaW4gVGhpbmdzWyd0aGUtdGhpbmctbmFtZSddLFxuICAgIHdoZXJlIGl0IGNhbiBiZSBtYW5pcHVsYXRlZCB1c2luZyB0aGUgXCJUaGluZ3NcIiBBUEkgZm91bmQgaW4gdGhlIEFsaWVuIFdhcnogZG9jdW1lbnRhdGlvblxuXG4gICovXG4gIFRoaW5nOiByZXF1aXJlKCcuL0dlb2ZmcmV5L1RoaW5nJyksXG4gIFRoaW5nczogcmVxdWlyZSgnLi9HZW9mZnJleS9UaGluZ3MnKSxcbiAgLypcbiAgXG4gICAgXCJiZWhhdmlvcnNcIiBjYW4gYmUgYXR0YWNoZWQgdG8gXCJUaGluZ3NcIiBpbiBvcmRlciB0byBjcmVhdGUgVGhpbmdzIHdoaWNoIGNhbiBiZWhhdmVcbiAgICBVbmxpbWl0ZWQgYmVoYXZpb3JzIG1heSBiZSBhdHRhY2hlZCB0byBhIFRoaW5nIGdpdmluZyBpdCBlbWVyZ2VudCBhbmQgY29tcGxleCBiZWhhdmlvcnNcbiAgXG4gICAgRm9yIGV4YW1wbGU6XG4gIFxuICAgIFRPRE8uLi5cbiAgIFxuICAgIFwiYmVoYXZpb3JzXCIgYXJlIG1vZHVsZXMgd2hpY2ggY29udGFpbiB0aGUgZm9sbG93aW5nIGZvdXIgZXhwb3J0ZWQgbWV0aG9kczpcbiAgXG4gICAgIGNyZWF0ZSgpXG4gICAgICAgLSBUaGlzIGlzIHJ1biBvbmNlLCB3aGVuIHRoZSBUaGluZyB3aGljaCBoYXMgdGhlIGJlaGF2aW9yIGlzIGNyZWF0ZWRcbiAgICAgdXBkYXRlKClcbiAgICAgICAtIFRoaXMgaXMgcnVuIG9uIGV2ZXJ5IHVwZGF0ZSBvbiB0aGUgZ2FtZSBsb29wXG4gICAgIHJlbW92ZSgpXG4gICAgICAgLSBUaGlzIGlzIHJ1biB3aGVuIHRoZSBUaGluZyB0aGUgYmVoYXZpb3IgaGFzIGJlZW4gYXR0YWNoZWQgdG8gaXMgZGVzdHJveWVkXG4gIFxuICAqL1xuICBiZWhhdmlvcnM6IHJlcXVpcmUoJy4vYmVoYXZpb3JzJyksXG4gIEJlaGF2aW9yOiByZXF1aXJlKCcuL0dlb2ZmcmV5L0JlaGF2aW9yJyksXG4gIEdhbWU6IHJlcXVpcmUoJy4vR2VvZmZyZXkvR2FtZScpLFxuICBpbnB1dHM6IHJlcXVpcmUoJy4vaW5wdXRzL2lucHV0cycpLFxuICBcbiAgLy8gQW55IGFkZGl0aW9uYWwgdG9wLWxldmVsIG1ldGhvZHMgY2FuIGJlIGFkZGVkIGhlcmUsIHRyeSBub3QgdG8gYWRkIHRoaW5ncyB0byB0aGUgdG9wLWxldmVsIGlmIHlvdSBjYW4hXG4gIGFsZXJ0OiBmdW5jdGlvbiAoKSB7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYWxpZW5XYXJ6O1xuIiwidmFyIGlucHV0cyA9IHt9O1xuXG5pbnB1dHNbJ1BMQVlFUl8xJ10gPSB7XG4gIHByaW1hcnlXZWFwb25LZXk6ICdBJyxcbiAgc2Vjb25kYXJ5V2VhcG9uS2V5OiAnUycsXG4gIHNwZWNpYWxXZWFwb25LZXk6ICdEJyxcbiAgdXBLZXk6ICdVUCcsXG4gIGRvd25LZXk6ICdET1dOJyxcbiAgbGVmdEtleTogJ0xFRlQnLFxuICByaWdodEtleTogJ1JJR0hUJyxcbiAgbGVmdEJ1bXBlcjogJ1NISUZUJ1xufTtcblxuaW5wdXRzWydQTEFZRVJfMiddID0ge1xuICBwcmltYXJ5V2VhcG9uS2V5OiAnUScsXG4gIHNlY29uZGFyeVdlYXBvbktleTogJ1cnLFxuICBzcGVjaWFsV2VhcG9uS2V5OiAnRScsXG4gIHVwS2V5OiAnSScsXG4gIGRvd25LZXk6ICdLJyxcbiAgbGVmdEtleTogJ0onLFxuICByaWdodEtleTogJ0wnLFxuICBsZWZ0QnVtcGVyOiAnU0hJRlQnXG59O1xuXG4vLyBtYXAgaW5wdXRzIHRvIGN1cnJlbnQgY29udHJvbGxlciBkZXZpY2UgKCBoYXJkLWNvZGVkIHRvIEtleWJvYXJkIGZvciBub3cgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlucHV0czsiXX0=
