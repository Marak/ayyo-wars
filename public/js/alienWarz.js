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

window['game'] = null;

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
    // T['bg'] = bg;
    /*
    G['playerHUD'] = game.add.group();
    G['background'] = game.add.container();
    G['background'].add(bg);
    */

    // attaches keyboard inputs for utility keys like ESC, 1, 2, 3, M, O, F, etc...
    // attach('hasKeyboardInputs', game);

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvR2VvZmZyZXkvQmVoYXZpb3IuanMiLCJsaWIvR2VvZmZyZXkvR2FtZS5qcyIsImxpYi9HZW9mZnJleS9JbnB1dC5qcyIsImxpYi9HZW9mZnJleS9UaGluZy5qcyIsImxpYi9HZW9mZnJleS9UaGluZ3MuanMiLCJsaWIvYmVoYXZpb3JzL2dhbWUvaGFzU2NyZWVuV3JhcC5qcyIsImxpYi9iZWhhdmlvcnMvaW5kZXguanMiLCJsaWIvYmVoYXZpb3JzL2xldmVscy9pc0xldmVsMC5qcyIsImxpYi9iZWhhdmlvcnMvbW92ZW1lbnQvaGFzTWF4VmVsb2NpdHkuanMiLCJsaWIvYmVoYXZpb3JzL21vdmVtZW50L2hhc1BsYXNtYVByb3B1bHNpb25FbmdpbmUuanMiLCJsaWIvYmVoYXZpb3JzL3NoaXBzL2lzTUlCQ2FkZHkuanMiLCJsaWIvaW5kZXguanMiLCJsaWIvaW5wdXRzL2lucHV0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBCZWhhdmlvciA9IHt9O1xuQmVoYXZpb3IuYXR0YWNoID0gZnVuY3Rpb24gYXR0YWNoQmVoYXZpb3IgKGJlaGF2aW9yLCBzcHJpdGUsIG9wdHMpIHtcblxuICBjb25zdCBiZWhhdmlvcnMgPSByZXF1aXJlKCcuLi9iZWhhdmlvcnMnKTtcblxuICBpZiAodHlwZW9mIHNwcml0ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIC8vIHRocm93IG5ldyBFcnJvcignV2FybmluZzogYXR0ZW1wdGluZyB0byBhdHRhY2ggYmVoYXZpb3IgdG8gdW5kZWZpbmVkIHNwcml0ZSAnICsgYmVoYXZpb3IpXG4gICAgY29uc29sZS5sb2coJ1dhcm5pbmc6IGF0dGVtcHRpbmcgdG8gYXR0YWNoIGJlaGF2aW9yIHRvIHVuZGVmaW5lZCBzcHJpdGUgJyArIGJlaGF2aW9yKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgb3B0cyA9IG9wdHMgfHwge307XG5cbiAgc3ByaXRlLmJlaGF2aW9ycyA9IHNwcml0ZS5iZWhhdmlvcnMgfHwge307XG4gIHNwcml0ZS5iZWhhdmlvcnNbYmVoYXZpb3JdID0gYmVoYXZpb3JzW2JlaGF2aW9yXTtcblxuICBpZiAodHlwZW9mIHNwcml0ZS5iZWhhdmlvcnNbYmVoYXZpb3JdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCZWhhdmlvciBjb3VsZCBub3QgYmUgcmVxdWlyZWQ6ICcgKyBiZWhhdmlvcik7XG4gIH1cblxuICBpZiAodHlwZW9mIHNwcml0ZS5iZWhhdmlvcnNbYmVoYXZpb3JdLmNyZWF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdHJ5IHtcbiAgICAgIHNwcml0ZS5iZWhhdmlvcnNbYmVoYXZpb3JdLmNyZWF0ZShzcHJpdGUsIG9wdHMsIGdhbWUpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coJ2Vycm9yIHJ1bm5pbmcgJyArIGJlaGF2aW9yICsgJy5jcmVhdGUoKScsIGVycik7XG4gICAgfVxuICB9XG5cbn07XG5cbkJlaGF2aW9yLmRldGFjaCA9IGZ1bmN0aW9uIGRldGFjaEJlaGF2aW9yIChiZWhhdmlvciwgc3ByaXRlLCBvcHRzKSB7fTtcblxuQmVoYXZpb3IucHJvY2VzcyA9IGZ1bmN0aW9uIHByb2Nlc3NCZWhhdmlvciAodGhpbmcpIHtcblxuICBjb25zdCBiZWhhdmlvcnMgPSByZXF1aXJlKCcuLi9iZWhhdmlvcnMnKTtcblxuICBpZiAodHlwZW9mIHRoaW5nID09PSBcIm9iamVjdFwiKSB7XG4gICAgaWYgKHR5cGVvZiB0aGluZy5iZWhhdmlvcnMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIHZhciBiZWhhdmlvcktleXMgPSBPYmplY3Qua2V5cyh0aGluZy5iZWhhdmlvcnMpO1xuICAgICAgYmVoYXZpb3JLZXlzLmZvckVhY2goZnVuY3Rpb24gKGIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGluZy5iZWhhdmlvcnNbYl0gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaW5nLmJlaGF2aW9yc1tiXS51cGRhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgdGhpbmcuYmVoYXZpb3JzW2JdLnVwZGF0ZS5jYWxsKHRoaXMsIHRoaW5nLCBnYW1lLCB0aGluZy5iZWhhdmlvcnNbYl0uY29uZmlnKTtcbiAgICAgICAgICAgICAgLy8gUmVtYXJrOiBUaGlzIGlzIHRoZSBiZXN0IHBsYWNlIHRvIGNsYW1wIG1heCB2ZWxvY2l0eSBvZiBhbGwgcGh5c2ljcyBib2RpZXNcbiAgICAgICAgICAgICAgLy8gICBUaGlzIG11c3QgYmUgZG9uZSBhZnRlciBhbGwgcG9zc2libGUgdGhydXN0IGlzIGFwcGxpZWQgKCBhZnRlciBhbGwgYmVoYXZpb3JzIHJ1biApXG4gICAgICAgICAgICAgIC8vIFRPRE86IFdlIGNvdWxkIHByb2JhYmx5IGltcGxlbWVudCB0aGlzIGFzIGEgc2VyaWVzIG9mIFwiYWZ0ZXJcIiBiZWhhdmlvcnMsXG4gICAgICAgICAgICAgIC8vICAgICAgIG9yIGFkZCBjYXJkaW5hbGl0eSB0byB0aGUgb3JkZXIgb2YgYmVoYXZpb3JzXG4gICAgICAgICAgICAgIGlmICh0aGluZy5tYXhWZWxvY2l0eSkge1xuICAgICAgICAgICAgICAgIGJlaGF2aW9ycy5oYXNNYXhWZWxvY2l0eS51cGRhdGUodGhpbmcpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhcm5pbmc6IGVycm9yIGluIHByb2Nlc3NpbmcgdXBkYXRlIGNhbGwgZm9yOicgKyBiLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmVoYXZpb3I7IiwiY29uc3QgQmVoYXZpb3IgPSByZXF1aXJlKCcuL0JlaGF2aW9yJyk7XG5jb25zdCBUaGluZyA9IHJlcXVpcmUoJy4vVGhpbmcnKTtcbmNvbnN0IFRoaW5ncyA9IHJlcXVpcmUoJy4vVGhpbmdzJyk7XG5jb25zdCBJbnB1dCA9IHJlcXVpcmUoJy4vSW5wdXQnKTtcblxud2luZG93WydnYW1lJ10gPSBudWxsO1xuXG4vLyBHYW1lIG9iamVjdCBpcyByZXNwb25zaWJsZSBmb3IgYWdncmVnYXRpbmcgYWxsIGdhbWUgYmVoYXZpb3JzIGludG8gY29tbW9uIFBoYXNlci5nYW1lIHByZWxvYWQgLyBjcmVhdGUgLyB1cGRhdGUgaGFuZGxlcnNcbmxldCBHYW1lID0ge307XG5HYW1lLl91cGRhdGVzID0gW107XG5HYW1lLl9jcmVhdGVzID0gW107XG5HYW1lLl9wcmVsb2FkcyA9IFtdO1xuXG5HYW1lLmJpbmRDcmVhdGUgPSBmdW5jdGlvbiBiaW5kQ3JlYXRlIChmbikge1xuICAvLyBhZGRzIG5ldyBjcmVhdGUgZnVuY3Rpb25zIHRvIEdhbWUgY3JlYXRlIGNoYWluXG4gIEdhbWUuX2NyZWF0ZXMucHVzaChmbilcbn07XG5cbkdhbWUuY3JlYXRlID0gZnVuY3Rpb24gZ2FtZUNyZWF0ZSAoKSB7XG4gIEdhbWUuX2NyZWF0ZXMuZm9yRWFjaChmdW5jdGlvbihmKXtcbiAgICBmKGdhbWUpO1xuICB9KTtcbn07XG5cbkdhbWUuYmluZFVwZGF0ZSA9IGZ1bmN0aW9uIGJpbmRVcGRhdGUgKGZuKSB7XG4gIC8vIGFkZHMgbmV3IHVwZGF0ZSBmdW5jdGlvbiB0byBHYW1lIHVwZGF0ZSBjaGFpblxuICBHYW1lLl91cGRhdGVzLnB1c2goZm4pXG59O1xuXG5HYW1lLnVwZGF0ZSA9IGZ1bmN0aW9uIGdhbWVVcGRhdGUgKGdhbWUpIHtcbiAgR2FtZS5fdXBkYXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGYpe1xuICAgIGYoZ2FtZSk7XG4gIH0pO1xufTtcblxuR2FtZS5wcmVsb2FkID0gZnVuY3Rpb24gZ2FtZVByZWxvYWQgKCkge1xuICBnYW1lID0gdGhpcztcblxuICBjb25zdCBiZWhhdmlvcnMgPSByZXF1aXJlKCcuLi9iZWhhdmlvcnMnKTtcblxuICBmb3IgKGxldCBiIGluIGJlaGF2aW9ycykge1xuICAgIGlmICh0eXBlb2YgYmVoYXZpb3JzW2JdLnByZWxvYWQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5sb2coJ3ByZWxvYWRpbmcgc3ByaXRlJywgIGJlaGF2aW9yc1tiXS5wcmVsb2FkLnRvU3RyaW5nKCkpXG4gICAgICAgIGJlaGF2aW9yc1tiXS5wcmVsb2FkKHt9LCBnYW1lKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZygnZXJyb3IgcnVubmluZyAnICsgYiArICcucHJlbG9hZCgpJywgZXJyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG59O1xuXG5HYW1lLmluaXQgPSBmdW5jdGlvbiBpbml0R2FtZSAoKSB7XG5cbiAgdmFyIHdvcmxkV2lkdGggPSAxMDI0O1xuICB2YXIgd29ybGRIZWlnaHQgPSA3NTk7XG5cbiAgdmFyIHJlbmRlck1vZGUgPSBQaGFzZXIuQVVUTztcblxuICB2YXIgX2NvbmZpZyA9IHtcbiAgICB0eXBlOiByZW5kZXJNb2RlLFxuICAgIHBhcmVudDogJ2dhbWUtY2FudmFzLWRpdicsXG4gICAgd2lkdGg6IHdvcmxkV2lkdGgsXG4gICAgaGVpZ2h0OiB3b3JsZEhlaWdodCxcbiAgICBwaHlzaWNzOiB7XG4gICAgICBkZWZhdWx0OiAnbWF0dGVyJyxcbiAgICAgIG1hdHRlcjoge1xuICAgICAgICBkZWJ1ZzogZmFsc2UsXG4gICAgICAgIGdyYXZpdHk6IHsgeTogMCwgeDogMCB9LFxuICAgICAgICBwbHVnaW5zOiB7XG4gICAgICAgICAgYXR0cmFjdG9yczogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBzY2VuZToge1xuICAgICAgcHJlbG9hZDogR2FtZS5wcmVsb2FkLFxuICAgICAgY3JlYXRlOiBHYW1lLmNyZWF0ZSxcbiAgICAgIHVwZGF0ZTogdXBkYXRlLFxuICAgICAgcmVuZGVyOiByZW5kZXJcbiAgICB9XG4gIH07XG5cbiAgLy8gY3JlYXRlIG5ldyBwaGFzZXIgZ2FtZVxuICBnYW1lID0gbmV3IFBoYXNlci5HYW1lKF9jb25maWcpO1xuICBcbiAgR2FtZS5iaW5kQ3JlYXRlKGNyZWF0ZSk7XG5cbiAgZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIC8vIGNyZWF0ZSBuZXcgc2NlbmUgZm9yIGJhdHRsZSBncm91bmRcbiAgICB2YXIgX2NvbmZpZyA9IHtcbiAgICAgICAga2V5OiAnYmF0dGxlZ3JvdW5kJyxcbiAgICAgICAgLy8gYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgLy8gdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgLy8gcGFjazogZmFsc2UsXG4gICAgICAgIC8vIGNhbWVyYXM6IG51bGwsXG4gICAgICAgIC8vIG1hcDoge30sXG4gICAgICAgIC8vIHBoeXNpY3M6IHt9LFxuICAgICAgICAvLyBsb2FkZXI6IHt9LFxuICAgICAgICAvLyBwbHVnaW5zOiBmYWxzZSxcbiAgICAgICAgLy8gaW5wdXQ6IHt9XG4gICAgICAgIHBoeXNpY3M6IHtcbiAgICAgICAgICBkZWZhdWx0OiAnbWF0dGVyJyxcbiAgICAgICAgICBtYXR0ZXI6IHtcbiAgICAgICAgICAgIGdyYXZpdHk6IHsgeTogMCwgeDogMCB9LFxuICAgICAgICAgICAgZGVidWc6IHRydWUsXG4gICAgICAgICAgICBwbHVnaW5zOiB7XG4gICAgICAgICAgICAgIGF0dHJhY3RvcnM6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vICBBIHNwYWNlIGJhY2tncm91bmRcbiAgICAvLyBUT0RPOiByZXBsYWNlIHNwcml0ZVxuICAgIC8vYmcgPSBnYW1lLmFkZC50aWxlU3ByaXRlKDAsIDAsIDIwMDAwLCAyMDAwMCwgJ3NwYWNlJyk7XG4gICAgLy9iZy5jb250ZXh0LmZpbGxTdHlsZSA9ICcjRkZGRkZGJztcbiAgICAvL2JnLnRpbnQgPSAweGZmMDAwMDtcbiAgICAvL2JnLnNldERlcHRoKDEpO1xuICAgIC8vIFRbJ2JnJ10gPSBiZztcbiAgICAvKlxuICAgIEdbJ3BsYXllckhVRCddID0gZ2FtZS5hZGQuZ3JvdXAoKTtcbiAgICBHWydiYWNrZ3JvdW5kJ10gPSBnYW1lLmFkZC5jb250YWluZXIoKTtcbiAgICBHWydiYWNrZ3JvdW5kJ10uYWRkKGJnKTtcbiAgICAqL1xuXG4gICAgLy8gYXR0YWNoZXMga2V5Ym9hcmQgaW5wdXRzIGZvciB1dGlsaXR5IGtleXMgbGlrZSBFU0MsIDEsIDIsIDMsIE0sIE8sIEYsIGV0Yy4uLlxuICAgIC8vIGF0dGFjaCgnaGFzS2V5Ym9hcmRJbnB1dHMnLCBnYW1lKTtcblxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlICgpIHtcbiAgICAvKlxuICAgIHZhciBjYW0gPSBnYW1lLmNhbWVyYXMubWFpbjtcbiAgICBjYW0uc2V0U2l6ZSh3b3JsZFdpZHRoLCB3b3JsZEhlaWdodCk7XG4gICAgKi9cbiAgICBJbnB1dC5wcm9jZXNzKGdhbWUpO1xuICAgIEdhbWUudXBkYXRlKGdhbWUpO1xuICAgIGZvciAobGV0IHRoaW5nIGluIFRoaW5ncykge1xuICAgICAgLy8gY29uc29sZS5sb2coJ3VwZGF0aW5nJywgdGhpbmcpXG4gICAgICBCZWhhdmlvci5wcm9jZXNzKFRoaW5nc1t0aGluZ10pO1xuICAgIH1cbiAgICBnYW1lLmNhbWVyYXMuY2FtZXJhc1swXS5zZXRCb3VuZHMoMCwgMCwgd29ybGRXaWR0aCwgd29ybGRIZWlnaHQpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGRlYnVnUmVuZGVyKCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XG5cbiIsImNvbnN0IElucHV0ID0ge307XG5jb25zdCBpbnB1dHMgPSByZXF1aXJlKCcuLi9pbnB1dHMvaW5wdXRzJyk7XG5cbklucHV0LnByb2Nlc3MgPSBmdW5jdGlvbiBwcm9jZXNzSW5wdXQgKGdhbWUpIHtcbiAgY29uc3QgVGhpbmdzID0gcmVxdWlyZSgnLi9UaGluZ3MnKTtcbiAgZm9yIChsZXQgcGxheWVyIGluIGlucHV0cykge1xuICAgIGZvciAobGV0IGlucHV0IGluIGlucHV0c1twbGF5ZXJdKSB7XG4gICAgICB2YXIga2V5ID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoaW5wdXRzW3BsYXllcl1baW5wdXRdKTtcbiAgICAgIFRoaW5nc1twbGF5ZXJdLmlucHV0cyA9IFRoaW5nc1twbGF5ZXJdLmlucHV0cyB8fCB7fTtcbiAgICAgIGlmIChrZXkuaXNEb3duKSB7XG4gICAgICAgIFRoaW5nc1twbGF5ZXJdLmlucHV0c1tpbnB1dF0gPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgVGhpbmdzW3BsYXllcl0uaW5wdXRzW2lucHV0XSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IElucHV0O1xuIiwiY29uc3QgVGhpbmcgPSB7fTtcbmNvbnN0IFRoaW5ncyA9IHJlcXVpcmUoJy4vVGhpbmdzJyk7XG5UaGluZy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGVUaGluZyAob3B0cykge1xuICAvLyBmaXJzdCwgZGV0ZXJtaW5lIHdoYXQgdGhlIG5hbWUgb2YgdGhlIHRoaW5nIHdpbGwgYmVcbiAgLy8gaWYgYSBUaGluZyBoYXMgYSB0eXBlLCBHZW9mZnJleSB3aWxsIGF1dG9tYXRpY2FsbHkgZ2l2ZSB0aGUgVGhpbmcgYSBuYW1lIHdpdGggYW4gYXV0by1pbmNyZW1lbnRlZCBJRFxuICBsZXQgbmFtZTtcbiAgaWYgKG9wdHMudHlwZSkge1xuICAgIGlmICh0eXBlb2YgX3R5cGVzW29wdHMudHlwZV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBjaGVjayBfdHlwZXMsIGlmIGRvZXNuJ3QgZXhpc3QgYWRkIG5ldyBrZXkgYW5kIHNldCB0byAwXG4gICAgICBfdHlwZXNbb3B0cy50eXBlXSA9IDA7XG4gICAgfSBlbHNle1xuICAgICAgLy8gaWYga2V5IGV4aXN0cywgaW5jcmVtZW50IHRoZSB2YWx1ZVxuICAgICAgX3R5cGVzW29wdHMudHlwZV0rKztcbiAgICB9XG4gICAgbmFtZSA9IG9wdHMudHlwZSArICctJyArIF90eXBlc1tvcHRzLnR5cGVdO1xuICB9XG4gIGlmIChvcHRzLm5hbWUpIHtcbiAgICBuYW1lID0gb3B0cy5uYW1lO1xuICB9XG4gIGNvbnNvbGUubG9nKCdjcmVhdGluZyB0aGluZyB3aXRoIG5hbWU6ICcsIG5hbWUsIG9wdHMpO1xuXG4gIGxldCB0aGluZztcbiAgLy8gVE9ETzogYWxsb3cgb3RoZXIgdHlwZXMgb2YgdGhpbmdzIHRvIGJlIGNyZWF0ZWQsIGJlc2lkZXMgcGh5c2ljcyAvIG1hdHRlciB0aGluZ3NcbiAgdGhpbmcgPSBnYW1lLm1hdHRlci5hZGQuc3ByaXRlKG9wdHMueCwgb3B0cy55LCBvcHRzLnRleHR1cmUpO1xuICB0aGluZy5iZWhhdmlvcnMgPSB0aGluZy5iZWhhdmlvcnMgfHwge307XG4gIHRoaW5nLm5hbWUgPSBuYW1lO1xuICBUaGluZ3NbdGhpbmcubmFtZV0gPSB0aGluZztcbiAgcmV0dXJuIHRoaW5nO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaGluZzsiLCJjb25zdCBUaGluZ3MgPSB7fTtcbm1vZHVsZS5leHBvcnRzID0gVGhpbmdzOyIsIi8vIGhhc1NjcmVlbldyYXBcbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uIGhhc1NjcmVlbldyYXBDcmVhdGUgKHNwcml0ZSwgZ2FtZSkge30sXG4gIHVwZGF0ZTogZnVuY3Rpb24gaGFzU2NyZWVuV3JhcFVwZGF0ZSAoc3ByaXRlLCBnYW1lKSB7XG5cbiAgICBsZXQgd29ybGRXaWR0aCA9IGdhbWUuc3lzLmdhbWUuY2FudmFzLndpZHRoO1xuICAgIGxldCB3b3JsZEhlaWdodCA9IGdhbWUuc3lzLmdhbWUuY2FudmFzLmhlaWdodDtcblxuICAgIGlmICghKHNwcml0ZSAmJiBzcHJpdGUueCAmJiBzcHJpdGUueSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGNhbSA9IGdhbWUuY2FtZXJhcy5jYW1lcmFzWzBdO1xuICAgIGlmIChzcHJpdGUueCA8IDApIHtcbiAgICAgIHNwcml0ZS54ID0gZ2FtZS53aWR0aDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZiAoc3ByaXRlLnggPiB3b3JsZFdpZHRoKSB7XG4gICAgICBzcHJpdGUueCA9IDA7XG4gICAgICByZXR1cm47XG4gICAgfSBpZiAoc3ByaXRlLnkgPCAwKSB7XG4gICAgICBzcHJpdGUueSA9IHdvcmxkSGVpZ2h0IC0gc3ByaXRlLmhlaWdodDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZiAoc3ByaXRlLnkgPiB3b3JsZEhlaWdodCkge1xuICAgICAgc3ByaXRlLnkgPSAwO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICB9XG59OyIsImNvbnN0IGJlaGF2aW9ycyA9IHt9O1xuXG5cbi8vXG4vLyBMZXZlbHMgYXMgQmVoYXZpb3JzXG4vL1xuYmVoYXZpb3JzWydpc0xldmVsMCddID0gcmVxdWlyZSgnLi9sZXZlbHMvaXNMZXZlbDAnKTtcblxuLy9cbi8vIFNoaXAgQmVoYXZpb3JzXG4vL1xuYmVoYXZpb3JzWydpc01JQkNhZGR5J10gPSByZXF1aXJlKCcuL3NoaXBzL2lzTUlCQ2FkZHknKTtcblxuLy9cbi8vIE1vdmVtZW50IGJhc2VkIEJlaGF2aW9yc1xuLy9cbmJlaGF2aW9yc1snaGFzUGxhc21hUHJvcHVsc2lvbkVuZ2luZSddID0gcmVxdWlyZSgnLi9tb3ZlbWVudC9oYXNQbGFzbWFQcm9wdWxzaW9uRW5naW5lJyk7XG5iZWhhdmlvcnNbJ2hhc01heFZlbG9jaXR5J10gPSByZXF1aXJlKCcuL21vdmVtZW50L2hhc01heFZlbG9jaXR5Jyk7XG5cbi8vXG4vLyBHYW1lICggaXRzZWxmICkgQmVoYXZpb3JzXG4vL1xuXG5iZWhhdmlvcnNbJ2hhc1NjcmVlbldyYXAnXSA9IHJlcXVpcmUoJy4vZ2FtZS9oYXNTY3JlZW5XcmFwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYmVoYXZpb3JzOyIsImNvbnN0IFRoaW5nID0gcmVxdWlyZSgnLi4vLi4vR2VvZmZyZXkvVGhpbmcnKTtcbmNvbnN0IEJlaGF2aW9yID0gcmVxdWlyZSgnLi4vLi4vR2VvZmZyZXkvQmVoYXZpb3InKTtcblxuLy8gaXNMZXZlbDBcbi8vIGxldmVsMCBpcyBjdXJyZW50IG1lbGVlIC8gc2tpcm1pc2ggbGV2ZWxcbm1vZHVsZS5leHBvcnRzID0ge1xuICB3aW5Db25kaXRpb25zOiBbXG4gICAge1xuICAgICAgLy8gbGV2ZWwgaXMgY29tcGxldGUgb25jZSBvbmUgb2YgdGhlIHBsYXllcnMgYWNoaWV2ZWQgXCJhbGxPdGhlclBsYXllcnNEZWFkXCIgd2luIGNvbmRpdGlvblxuICAgICAgbmFtZTogJ2FsbE90aGVyUGxheWVyc0RlYWQnXG4gICAgfVxuICBdLFxuICAvLyBVc2luZyB0aGUgQWxpZW4gV2FyeiBKU09OIEZvcm1hdCB3ZSBjYW4gYWRkIGRlZmF1bHQgXCJUaGluZ3NcIiB0aGF0IHdpbGwgZXhpc3Qgd2hlbiB0aGUgbGV2ZWwgaXMgY3JlYXRlZFxuICB0aGluZ3M6IHtcbiAgICAvKlxuICAgIFwicGxhbmV0LTFcIjoge1xuICAgICAgICBcIm5hbWVcIjogXCJwbGFuZXQtMVwiLFxuICAgICAgICBcInhcIjogMTkwLFxuICAgICAgICBcInlcIjogNDYwLFxuICAgICAgICBcImNpcmNsZVwiOiAyNSxcbiAgICAgICAgXCJoZWFsdGhcIjogNTAsXG4gICAgICAgIFwiYW5nbGVcIjogMCxcbiAgICAgICAgXCJiZWhhdmlvcnNcIjoge1xuICAgICAgICAgICAgXCJpc1BsYW5ldG9pZFwiOiB7fVxuICAgICAgICB9XG4gICAgfSovXG4gIH0sXG4gIGNyZWF0ZTogZnVuY3Rpb24gY3JlYXRlaXNMZXZlbDAgKHNwcml0ZSwgb3B0cywgZ2FtZSkge1xuICAgIC8vIGFsZXJ0KCdzdGFydCBiYXR0bGUnKVxuICAgIC8vIGFsZXJ0KCdjcmVhdGVkIG5ldyBsZXZlbDAnKVxuICAgIHNwcml0ZS5saW5lID0gbmV3IFBoYXNlci5HZW9tLkxpbmUoMCwgMCwgMjAwLCAyMDApO1xuICAgIHNwcml0ZS5taWQgPSBuZXcgUGhhc2VyLkdlb20uUG9pbnQoKTtcblxuICAgIHZhciBjYW0gPSBnYW1lLmNhbWVyYXMubWFpbjtcbiAgICBjYW0uc3RhcnRGb2xsb3coc3ByaXRlLm1pZCk7XG5cbiAgICBsZXQgc3RhcnRpbmdMb2NhdGlvbiA9IHtcbiAgICAgIHg6IDMwMCxcbiAgICAgIHk6IDI1MFxuICAgIH07XG5cbiAgICBsZXQgcDEgPSBUaGluZy5jcmVhdGUoe1xuICAgICAgbmFtZTogJ1BMQVlFUl8xJyxcbiAgICAgIHg6IHN0YXJ0aW5nTG9jYXRpb24ueCxcbiAgICAgIHk6IHN0YXJ0aW5nTG9jYXRpb24ueSxcbiAgICAgIHRleHR1cmU6ICdtaWItY2FkZHknXG4gICAgfSk7XG5cbiAgICBzdGFydGluZ0xvY2F0aW9uID0ge1xuICAgICAgeDogMTAwLFxuICAgICAgeTogMjUwXG4gICAgfTtcblxuICAgIGxldCBwMiA9IFRoaW5nLmNyZWF0ZSh7XG4gICAgICBuYW1lOiAnUExBWUVSXzInLFxuICAgICAgeDogc3RhcnRpbmdMb2NhdGlvbi54LFxuICAgICAgeTogc3RhcnRpbmdMb2NhdGlvbi55LFxuICAgICAgdGV4dHVyZTogJ21pYi1jYWRkeSdcbiAgICB9KTtcblxuICAgIEJlaGF2aW9yLmF0dGFjaCgnaXNNSUJDYWRkeScsIHAxKVxuICAgIEJlaGF2aW9yLmF0dGFjaCgnaXNNSUJDYWRkeScsIHAyKVxuXG4gICAgQmVoYXZpb3IuYXR0YWNoKCdoYXNTY3JlZW5XcmFwJywgcDEpO1xuICAgIEJlaGF2aW9yLmF0dGFjaCgnaGFzU2NyZWVuV3JhcCcsIHAyKTtcblxuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZWlzTGV2ZWwwIChzcHJpdGUsIGdhbWUpIHtcbiAgfVxufTtcbiIsIi8vIGhhc01heFZlbG9jaXR5XG5tb2R1bGUuZXhwb3J0cyA9e1xuICBjcmVhdGU6IGZ1bmN0aW9uIGhhc01heFZlbG9jaXR5Q3JlYXRlIChzcHJpdGUsIG9wdHMpIHtcbiAgICBzcHJpdGUubWF4VmVsb2NpdHkgPSBvcHRzLm1heFZlbG9jaXR5IHx8IHtcbiAgICAgIHg6IDQsXG4gICAgICB5OiA0XG4gICAgfTtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiBoYXNNYXhWZWxvY2l0eVVwZGF0ZSAoc3ByaXRlKSB7XG4gICAgaWYgKHNwcml0ZSAmJiBzcHJpdGUuYm9keSkge1xuICAgICAgLy8gY2FsY3VsYXRlIHRoZSBtYXggdmVsb2NpdHkgZm9yIHggYW5kIHkgYXhpc1xuICAgICAgbGV0IG1heFZlbG9jaXR5WCA9IHNwcml0ZS5ib2R5LnZlbG9jaXR5LnggPiBzcHJpdGUubWF4VmVsb2NpdHkueCA/IDEgOiBzcHJpdGUuYm9keS52ZWxvY2l0eS54IDwgLXNwcml0ZS5tYXhWZWxvY2l0eS54ID8gLTEgOiBudWxsO1xuICAgICAgbGV0IG1heFZlbG9jaXR5WSA9IHNwcml0ZS5ib2R5LnZlbG9jaXR5LnkgPiBzcHJpdGUubWF4VmVsb2NpdHkueSA/IDEgOiBzcHJpdGUuYm9keS52ZWxvY2l0eS55IDwgLXNwcml0ZS5tYXhWZWxvY2l0eS55ID8gLTEgOiBudWxsO1xuICAgIFxuICAgICAgLy8gY2hlY2sgZWFjaCBheGlzIHRvIHNlZSBpZiB0aGUgbWF4aW11bSB2ZWxvY2l0eSBoYXMgYmVlbiBleGNlZWRlZCxcbiAgICAgIC8vIGlmIHNvLCBzZXQgdGhlIHZlbG9jaXR5IGV4cGxpY2l0eSB0byB0aGUgbWF4IHZhbHVlICggY2xhbXBpbmcgbWF4aW11bSBzcGVlZCApXG4gICAgICBpZiAobWF4VmVsb2NpdHlYKSB7XG4gICAgICAgIHNwcml0ZS5zZXRWZWxvY2l0eShzcHJpdGUubWF4VmVsb2NpdHkueCAqIG1heFZlbG9jaXR5WCwgc3ByaXRlLmJvZHkudmVsb2NpdHkueSk7XG4gICAgICB9XG4gICAgICBpZiAobWF4VmVsb2NpdHlZKSB7XG4gICAgICAgIHNwcml0ZS5zZXRWZWxvY2l0eShzcHJpdGUuYm9keS52ZWxvY2l0eS54LCBzcHJpdGUubWF4VmVsb2NpdHkueSAqIG1heFZlbG9jaXR5WSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuIiwiY29uc3QgVGhpbmdzID0gcmVxdWlyZSgnLi4vLi4vR2VvZmZyZXkvVGhpbmdzJyk7XG4vKlxuICAgIC8vIFRPRE86IHJlbmFtZSwgXG4gICAgaGFzUGxhc21hUHJvcHVsc2lvbkVuZ2luZSwgLSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9QbGFzbWFfcHJvcHVsc2lvbl9lbmdpbmVcbiovXG4vLyBoYXNDb250cm9sbGVkRmxpZ2h0XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uIGhhc1BsYXNtYVByb3B1bHNpb25FbmdpbmVDcmVhdGUgKHNwcml0ZSwgb3B0cywgZ2FtZSkge1xuICAgIC8vIFxuICAgIHNwcml0ZS5pbnB1dHMgPSBvcHRzLmlucHV0cyB8fCBzcHJpdGUuaW5wdXRzIHx8IHt9O1xuICAgIHNwcml0ZS50aHJ1c3RGb3JjZSA9IG9wdHMudGhydXN0Rm9yY2UgfHwgc3ByaXRlLnRocnVzdEZvcmNlIHx8IDAuMDAxO1xuICAgIHNwcml0ZS5yb3RhdGlvblNwZWVkID0gc3ByaXRlLnJvdGF0aW9uU3BlZWQgfHwgb3B0cy5yb3RhdGlvblNwZWVkIHx8IDAuMDE4O1xuICAgIHNwcml0ZS5tYXhSb3RhdGlvblNwZWVkID0gc3ByaXRlLm1heFJvdGF0aW9uU3BlZWQgfHwgb3B0cy5yb3RhdGlvblNwZWVkIHx8IDAuNTtcblxuICAgIHNwcml0ZS5tYXhTcGVlZCA9IHNwcml0ZS5yb3RhdGlvblNwZWVkIHx8IG9wdHMubWF4U3BlZWQgfHwgMjAwO1xuICAgIHNwcml0ZS5yZXZlcnNlVGhydXN0ID0gc3ByaXRlLnJldmVyc2VUaHJ1c3QgfHwgb3B0cy5yZXZlcnNlVGhydXN0IHx8IDEwMDtcbiAgICBzcHJpdGUuZmxpZ2h0Q29udHJvbGxlZCA9IGZhbHNlO1xuXG4gICAgc3ByaXRlLm1heFZlbG9jaXR5ID0gb3B0cy5tYXhWZWxvY2l0eSB8fCBzcHJpdGUubWF4VmVsb2NpdHkgfHwge1xuICAgICAgeDogNCxcbiAgICAgIHk6IDRcbiAgICB9O1xuICAgIHNwcml0ZS50cmFpbFRpY2sgPSAxMjA7XG4gICAgc3ByaXRlLmxhc3RUcmFpbFRpY2sgPSAwO1xuICAgIC8vZ2FtZS5jdXJzb3JzID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5jcmVhdGVDdXJzb3JLZXlzKCk7XG5cbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiBoYXNQbGFzbWFQcm9wdWxzaW9uRW5naW5lVXBkYXRlIChzcHJpdGUsIGdhbWUpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnaGFzQ29udHJvbGxlZEZsaWdodFVwZGF0ZScsIHNwcml0ZS5pbnB1dHMpXG4gICAgLy9zcHJpdGUuc2hpcFRyYWlsLnggPSBzcHJpdGUueDtcbiAgICAvL3Nwcml0ZS5zaGlwVHJhaWwueSA9IHNwcml0ZS55O1xuICAgIC8vc3ByaXRlLnNoaXBUcmFpbC5yb3RhdGlvbiA9IHNwcml0ZS5yb3RhdGlvblxuICAgIHNwcml0ZS5mbGlnaHRDb250cm9sbGVkID0gZmFsc2U7XG5cbiAgICBpZiAodHlwZW9mIHNwcml0ZS5ib2R5ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKCdzc3MnLCBzcHJpdGUpXG4gICAgc3ByaXRlLmZvbyA9IFwiYmFyXCI7XG4gICAgLy9jb25zb2xlLmxvZyhzcHJpdGUuZm9vKVxuXG4gICAgaWYgKHNwcml0ZS5pbnB1dHMgJiYgc3ByaXRlLmlucHV0cy5sZWZ0S2V5KSB7XG4gICAgICBcbiAgICAgIHNwcml0ZS5mbGlnaHRDb250cm9sbGVkID0gdHJ1ZTtcbiAgICAgIC8vIGhvbGRpbmcgbGVmdCBidW1wZXIgZW5hYmxlcyBzdHJhZmUgZm9yIHR1cm5pbmcgKCBzaWRlIHRocnVzdGVycyApXG4gICAgICBpZiAoc3ByaXRlLmlucHV0cy5sZWZ0QnVtcGVyKSB7XG4gICAgICAgIHZhciBzdHJhZmVTcGVlZCA9IHNwcml0ZS5zdHJhZmVTcGVlZCB8fCBzcHJpdGUucm90YXRpb25TcGVlZDtcbiAgICAgICAgc3ByaXRlLnRocnVzdExlZnQoc3ByaXRlLnRocnVzdEZvcmNlKTtcbiAgICAgICAgaWYgKGdhbWUudGltZS5ub3cgLSBzcHJpdGUubGFzdFRyYWlsVGljayA+IHNwcml0ZS50cmFpbFRpY2spIHtcbiAgICAgICAgICAvKlxuICAgICAgICAgIGRyYXdUYWlsKHNwcml0ZSwge1xuICAgICAgICAgICAgc2lkZTogJ3N0YXJib2FyZCdcbiAgICAgICAgICB9LCBnYW1lKTtcbiAgICAgICAgICAqL1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc3ByaXRlLnJvdGF0aW9uIDw9IE1hdGguYWJzKHNwcml0ZS5tYXhSb3RhdGlvblNwZWVkKSkge1xuICAgICAgICAgICAvL3Nwcml0ZS5zZXRBbmd1bGFyVmVsb2NpdHkocilcbiAgICAgICAgfVxuICAgICAgICBzcHJpdGUucm90YXRpb24gLT0gc3ByaXRlLnJvdGF0aW9uU3BlZWQ7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHNwcml0ZS5pbnB1dHMgJiYgc3ByaXRlLmlucHV0cy5yaWdodEtleSkge1xuICAgICAgc3ByaXRlLmZsaWdodENvbnRyb2xsZWQgPSB0cnVlO1xuICAgICAgaWYgKHNwcml0ZS5pbnB1dHMubGVmdEJ1bXBlcikge1xuICAgICAgICB2YXIgc3RyYWZlU3BlZWQgPSBzcHJpdGUuc3RyYWZlU3BlZWQgfHwgc3ByaXRlLnJvdGF0aW9uU3BlZWQ7XG4gICAgICAgIHNwcml0ZS50aHJ1c3RSaWdodChzcHJpdGUudGhydXN0Rm9yY2UpO1xuICAgICAgICBpZiAoZ2FtZS50aW1lLm5vdyAtIHNwcml0ZS5sYXN0VHJhaWxUaWNrID4gc3ByaXRlLnRyYWlsVGljaykge1xuICAgICAgICAgIC8qXG4gICAgICAgICAgZHJhd1RhaWwoc3ByaXRlLCB7XG4gICAgICAgICAgICBzaWRlOiAncG9ydCdcbiAgICAgICAgICB9LCBnYW1lKTtcbiAgICAgICAgICAqL1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc3ByaXRlLnJvdGF0aW9uIDw9IE1hdGguYWJzKHNwcml0ZS5tYXhSb3RhdGlvblNwZWVkKSkge1xuICAgICAgICAgICAvL3Nwcml0ZS5zZXRBbmd1bGFyVmVsb2NpdHkocilcbiAgICAgICAgfVxuICAgICAgICBzcHJpdGUucm90YXRpb24gKz0gc3ByaXRlLnJvdGF0aW9uU3BlZWQ7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaWYgKHNwcml0ZS5ib2R5KSB7XG4gICAgICAgIHNwcml0ZS5ib2R5LmFuZ3VsYXJWZWxvY2l0eSA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNwcml0ZS5pbnB1dHMgJiYgc3ByaXRlLmlucHV0cy51cEtleSkge1xuICAgICAgaWYgKGdhbWUudGltZS5ub3cgLSBzcHJpdGUubGFzdFRyYWlsVGljayA+IHNwcml0ZS50cmFpbFRpY2spIHtcbiAgICAgICAgLypcbiAgICAgICAgZHJhd1RhaWwoc3ByaXRlLCB7XG4gICAgICAgICAgc2lkZTogJ3N0ZXJuJ1xuICAgICAgICB9LCBnYW1lKTtcbiAgICAgICAgKi9cbiAgICAgIH1cbiAgICAgIHNwcml0ZS5mbGlnaHRDb250cm9sbGVkID0gdHJ1ZTtcbiAgICAgIHNwcml0ZS50aHJ1c3Qoc3ByaXRlLnRocnVzdEZvcmNlKTtcbiAgICAgIC8vc3ByaXRlLmZyYW1lID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gc3ByaXRlLnNldEFuZ3VsYXJWZWxvY2l0eSgwKTtcbiAgICB9XG4gICAgaWYgKHNwcml0ZS5pbnB1dHMgJiYgc3ByaXRlLmlucHV0cy5kb3duS2V5KSB7XG4gICAgICAvL3Nwcml0ZS5mcmFtZSA9IDI7XG4gICAgICBzcHJpdGUudGhydXN0KDAgLSBzcHJpdGUudGhydXN0Rm9yY2UpO1xuICAgIH1cblxuICB9XG5cbn07IiwiY29uc3QgQmVoYXZpb3IgPSByZXF1aXJlKCcuLi8uLi9HZW9mZnJleS9CZWhhdmlvcicpO1xuXG4vLyBpc01pYkNhZGR5XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdGFnczogWydzaGlwJ10sXG4gIGNyZWF0ZTogZnVuY3Rpb24gY3JlYXRlSXNNaWJDYWRkeSAoc3ByaXRlLCBvcHRzLCBnYW1lKSB7XG4gICAgc3ByaXRlLnNoaXBUeXBlID0gJ21pYi1jYWRkeSc7XG4gICAgdmFyIG5hbWUgPSBvcHRzLm5hbWUsIHRpbnQgPSBvcHRzLnRpbnQ7XG4gICAgdmFyIGhlaWdodCA9IG9wdHMuaGVpZ2h0LCB3aWR0aCA9IG9wdHMud2lkdGg7XG5cbiAgICB2YXIgeCA9IG9wdHMueCB8fCBzcHJpdGUueCB8fCAwO1xuICAgIHZhciB5ID0gb3B0cy55IHx8IHNwcml0ZS54IHx8IDA7XG4gICAgc3ByaXRlLnggPSB4O1xuICAgIHNwcml0ZS55ID0geTtcblxuICAgIHNwcml0ZS5zZXRNYXNzKDIpO1xuICAgIHNwcml0ZS5zZXRGcmljdGlvbigwLDApO1xuICAgIHNwcml0ZS5pbnB1dHMgPSBvcHRzLmlucHV0cyB8fCBzcHJpdGUuaW5wdXRzIHx8IHt9O1xuXG4gICAgc3ByaXRlLm1heFNwZWVkID0gb3B0cy5tYXhTcGVlZCB8fCAzMDA7XG4gICAgc3ByaXRlLnJldmVyc2VUaHJ1c3QgPSBvcHRzLnJldmVyc2VUaHJ1c3QgfHwgMzAwO1xuXG4gICAgc3ByaXRlLnRocnVzdEZvcmNlID0gMC4wMDI1O1xuICAgIHNwcml0ZS5yb3RhdGlvblNwZWVkID0gb3B0cy5yb3RhdGlvblNwZWVkIHx8IDAuMDg4O1xuXG4gICAgc3ByaXRlLnN0cmFmZVNwZWVkID0gb3B0cy5zdHJhZmVTcGVlZCB8fCA2MDA7XG5cbiAgICBzcHJpdGUucmVjaGFyZEVuZXJneVRpbWUgPSAyMDA7XG4gICAgc3ByaXRlLnJlY2hhcmdlRW5lcmd5UmF0ZSA9IDU7XG4gICAgXG4gICAgc3ByaXRlLm1heFZlbG9jaXR5ID0ge1xuICAgICAgeDogMy44LFxuICAgICAgeTogMy44XG4gICAgfTtcblxuICAgIHNwcml0ZS5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgIEJlaGF2aW9yLmF0dGFjaCgnaGFzUGxhc21hUHJvcHVsc2lvbkVuZ2luZScsIHNwcml0ZSwge30pO1xuXG4gICAgLypcbiAgICBCZWhhdmlvci5hdHRhY2goJ2hhc0hlYWx0aCcsIHNwcml0ZSwge1xuICAgICAgaGVhbHRoOiBvcHRzLmhlYWx0aCB8fCA2MFxuICAgIH0pO1xuICAgIGF0dGFjaCgnaGFzRW5lcmd5Jywgc3ByaXRlLCB7XG4gICAgICBlbmVyZ3k6IG9wdHMuZW5lcmd5IHx8IDEwMFxuICAgIH0pO1xuICAgIGF0dGFjaCgnaGFzU2lnbmFscycsIHNwcml0ZSk7XG4gICAgYXR0YWNoKCdkaWVzV2l0aE5vSGVhbHRoJywgc3ByaXRlLCB7fSk7XG4gICAgYXR0YWNoKCdoYXNGdXNpb25HdW4nLCBzcHJpdGUsIHtcbiAgICAgIGNvbnRyb2xLZXk6ICdwcmltYXJ5V2VhcG9uS2V5J1xuICAgIH0pO1xuICAgIGF0dGFjaCgnaGFzVGhydXN0ZXJzJywgc3ByaXRlLCB7XG4gICAgICBjb250cm9sS2V5OiAnc2Vjb25kYXJ5V2VhcG9uS2V5J1xuICAgIH0pO1xuICAgIGF0dGFjaCgnaGFzVGVtcG9yYWxEaXNydXB0b3InLCBzcHJpdGUsIHtcbiAgICAgIGNvbnRyb2xLZXk6ICdzcGVjaWFsV2VhcG9uS2V5J1xuICAgIH0pO1xuICAgICovXG5cbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGVJc01pYkNhZGR5IChzcHJpdGUsIGdhbWUpIHtcbiAgICAvLyBUT0RPOiByZXBsYWNlIHdpdGggQmVoYXZpb3IuYWkgY29kZSBibG9ja1xuICAgIGlmIChzcHJpdGUuYWkgJiYgc3ByaXRlLmhlYWx0aCA8PSAyMCkge1xuICAgICAgc3ByaXRlLmZpcmVUZW1wb3JhbERpc3J1cHRvciA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNwcml0ZS5maXJlVGVtcG9yYWxEaXNydXB0b3IgPSBmYWxzZTtcbiAgICB9XG5cbiAgfSxcbiAgcHJlbG9hZDogZnVuY3Rpb24gcHJlbG9hZE1pYkNhZGR5IChvcHRzLCBnYW1lKSB7XG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdtaWItY2FkZHknLCAnYXNzZXRzL3NoaXBzL21pYi1jYWRkeS5wbmcnLCB7IGZyYW1lV2lkdGg6IDE0MCwgZnJhbWVIZWlnaHQ6IDQ4LCBzdGFydDogMCwgZW5kOiA0IH0pO1xuICB9XG59O1xuXG5cbiIsImxldCBhbGllbldhcnogPSB7XG4gIC8vIFRoaXMgcHJvamVjdCBpcyBhd2Vzb21lXG4gIGF3ZXNvbWU6IHRydWUsXG4gIC8qXG4gIFxuICAgIFwiVGhpbmdzXCIgb3IgXCJUXCIgaXMgdGhlIG1haW4gaGFzaCB3aGljaCBzdG9yZXMgYWxsIEFsaWVuIFdhcnogb2JqZWN0c1xuICAgIEFueXRoaW5nIHdoaWNoIGFwcGVhcnMgb24gdGhlIHNjcmVlbiBzaG91bGQgaGF2ZSBhIHJlcHJlc2VudGF0aW9uIGluIFRoaW5nc1sndGhlLXRoaW5nLW5hbWUnXSxcbiAgICB3aGVyZSBpdCBjYW4gYmUgbWFuaXB1bGF0ZWQgdXNpbmcgdGhlIFwiVGhpbmdzXCIgQVBJIGZvdW5kIGluIHRoZSBBbGllbiBXYXJ6IGRvY3VtZW50YXRpb25cblxuICAqL1xuICBUaGluZzogcmVxdWlyZSgnLi9HZW9mZnJleS9UaGluZycpLFxuICBUaGluZ3M6IHJlcXVpcmUoJy4vR2VvZmZyZXkvVGhpbmdzJyksXG4gIC8qXG4gIFxuICAgIFwiYmVoYXZpb3JzXCIgY2FuIGJlIGF0dGFjaGVkIHRvIFwiVGhpbmdzXCIgaW4gb3JkZXIgdG8gY3JlYXRlIFRoaW5ncyB3aGljaCBjYW4gYmVoYXZlXG4gICAgVW5saW1pdGVkIGJlaGF2aW9ycyBtYXkgYmUgYXR0YWNoZWQgdG8gYSBUaGluZyBnaXZpbmcgaXQgZW1lcmdlbnQgYW5kIGNvbXBsZXggYmVoYXZpb3JzXG4gIFxuICAgIEZvciBleGFtcGxlOlxuICBcbiAgICBUT0RPLi4uXG4gICBcbiAgICBcImJlaGF2aW9yc1wiIGFyZSBtb2R1bGVzIHdoaWNoIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBmb3VyIGV4cG9ydGVkIG1ldGhvZHM6XG4gIFxuICAgICBjcmVhdGUoKVxuICAgICAgIC0gVGhpcyBpcyBydW4gb25jZSwgd2hlbiB0aGUgVGhpbmcgd2hpY2ggaGFzIHRoZSBiZWhhdmlvciBpcyBjcmVhdGVkXG4gICAgIHVwZGF0ZSgpXG4gICAgICAgLSBUaGlzIGlzIHJ1biBvbiBldmVyeSB1cGRhdGUgb24gdGhlIGdhbWUgbG9vcFxuICAgICByZW1vdmUoKVxuICAgICAgIC0gVGhpcyBpcyBydW4gd2hlbiB0aGUgVGhpbmcgdGhlIGJlaGF2aW9yIGhhcyBiZWVuIGF0dGFjaGVkIHRvIGlzIGRlc3Ryb3llZFxuICBcbiAgKi9cbiAgYmVoYXZpb3JzOiByZXF1aXJlKCcuL2JlaGF2aW9ycycpLFxuICBCZWhhdmlvcjogcmVxdWlyZSgnLi9HZW9mZnJleS9CZWhhdmlvcicpLFxuICBHYW1lOiByZXF1aXJlKCcuL0dlb2ZmcmV5L0dhbWUnKSxcbiAgaW5wdXRzOiByZXF1aXJlKCcuL2lucHV0cy9pbnB1dHMnKSxcbiAgXG4gIC8vIEFueSBhZGRpdGlvbmFsIHRvcC1sZXZlbCBtZXRob2RzIGNhbiBiZSBhZGRlZCBoZXJlLCB0cnkgbm90IHRvIGFkZCB0aGluZ3MgdG8gdGhlIHRvcC1sZXZlbCBpZiB5b3UgY2FuIVxuICBhbGVydDogZnVuY3Rpb24gKCkge1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFsaWVuV2FyejtcbiIsInZhciBpbnB1dHMgPSB7fTtcblxuaW5wdXRzWydQTEFZRVJfMSddID0ge1xuICBwcmltYXJ5V2VhcG9uS2V5OiAnQScsXG4gIHNlY29uZGFyeVdlYXBvbktleTogJ1MnLFxuICBzcGVjaWFsV2VhcG9uS2V5OiAnRCcsXG4gIHVwS2V5OiAnVVAnLFxuICBkb3duS2V5OiAnRE9XTicsXG4gIGxlZnRLZXk6ICdMRUZUJyxcbiAgcmlnaHRLZXk6ICdSSUdIVCcsXG4gIGxlZnRCdW1wZXI6ICdTSElGVCdcbn07XG5cbmlucHV0c1snUExBWUVSXzInXSA9IHtcbiAgcHJpbWFyeVdlYXBvbktleTogJ1EnLFxuICBzZWNvbmRhcnlXZWFwb25LZXk6ICdXJyxcbiAgc3BlY2lhbFdlYXBvbktleTogJ0UnLFxuICB1cEtleTogJ0knLFxuICBkb3duS2V5OiAnSycsXG4gIGxlZnRLZXk6ICdKJyxcbiAgcmlnaHRLZXk6ICdMJyxcbiAgbGVmdEJ1bXBlcjogJ1NISUZUJ1xufTtcblxuLy8gbWFwIGlucHV0cyB0byBjdXJyZW50IGNvbnRyb2xsZXIgZGV2aWNlICggaGFyZC1jb2RlZCB0byBLZXlib2FyZCBmb3Igbm93IClcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dHM7Il19
