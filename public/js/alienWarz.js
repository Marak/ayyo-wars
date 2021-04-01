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

  if (Behavior.mode !== 'server') {
    if (behavior === 'aiFollow') {
      return;
    }
  }


  sprite.behaviors = sprite.behaviors || {};
  sprite.behaviors[behavior] = behaviors[behavior];
  sprite.behaviors[behavior].opts = opts;

  if (typeof sprite.behaviors[behavior] === "undefined") {
    throw new Error('Behavior could not be required: ' + behavior);
  }



  if (typeof sprite.behaviors[behavior].create === "function") {
    try {
      if (!game) {
        console.log('no game variable found...', game)
      }
      sprite.behaviors[behavior].create(sprite, opts, game);
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

Behavior.process = function processBehavior (thing) {

  const behaviors = require('../behaviors');

  // process all Things
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
},{"../behaviors":11}],2:[function(require,module,exports){
module.exports = function globalCollisionHandler (event) {
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
    // console.log(t1.name, t2.owner)
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
    if (t1.name === t2.G.owner) {
      pair.isActive = false;
      // continue;
    }
    if (t1.G.owner === t2.name) {
      pair.isActive = false;
      // continue;
    }

    //
    // Collides with siblings
    //
    if (typeof t1.G.owner !== 'undefined' && t1.G.owner === t2.G.owner) {
      pair.isActive = false;
      // continue;
    }
    // console.log('COLLISIONS', pair.isActive, t1.G, t2.G)
    // console.log('pppp', pair.isActive)
    if (pair.isActive) {
      if (t1.collisionHandler) {
        t1.collisionHandler(t2, pair);
      }
      if (t2.collisionHandler) {
        t2.collisionHandler(t1, pair);
      }

      if (t1.G.impacts === false || t2.G.impacts === false) {
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
};
},{}],3:[function(require,module,exports){
(function (global){(function (){
const Behavior = require('./Behavior');
const Thing = require('./Thing');
const Things = require('./Things');
const Input = require('./Input');
window['game'] = '';
global.game = '';
let globalCollisionHandler = require('./Collisions');

var worldWidth = 1024;
var worldHeight = 759;


// Game object is responsible for aggregating all game behaviors into common Phaser.game preload / create / update handlers
let Game = {};
Game._updates = [];
Game._creates = [];
Game._preloads = [];

Game.bindCreate = function bindCreate (fn) {
  // adds new create functions to Game create chain
  Game._creates.push(fn)
};

Game.create = function gameCreate (game) {
  game.gamestate = {};
  Game._creates.forEach(function(f){
    f(game);
  });
};

Game.servermode = false;
Game.clientMode = false;

Game.bindUpdate = function bindUpdate (fn) {
  console.log('pushing fn')
  // adds new update function to Game update chain
  Game._updates.push(fn)
};

Game.update = function gameUpdate () {
  /*
  var cam = game.cameras.main;
  cam.setSize(worldWidth, worldHeight);
  */
  Input.process(game);
  // Game.update(game);
  for (let thing in Things) {
    // console.log('updating', thing, Things[thing].inputs)
    Behavior.process(Things[thing]);
  }
  // game.cameras.cameras[0].setBounds(0, 0, worldWidth, worldHeight);
  Game._updates.forEach(function(f){
    f(game);
  });
  
  try {
    game.cameras.cameras[0].setBounds(0, 0, worldWidth, worldHeight);
  } catch (err) {
    
  }
  
};

Game.preload = function gamePreload () {
  game = this;

  game.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
    globalCollisionHandler(event, bodyA, bodyB);
  });

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

Game.init = function initGame ({ renderMode, audio }) {


  var renderMode = renderMode || Phaser.AUTO;
  if (typeof audio === 'undefined') {
    audio = true;
  }
  var _config = {
    type: renderMode,
    parent: 'game-canvas-div',
    width: worldWidth,
    height: worldHeight,
    audio: false,
    banner: false,
    physics: {
      default: 'matter',
      matter: {
        debug: true, // TODO: use config
        gravity: { y: 0, x: 0 },
        plugins: {
          attractors: true
        }
      }
    },
    scene: {
      preload: Game.preload,
      create: Game.create,
      update: Game.update,
      render: render
    }
  };

  // create new phaser game
  game = new Phaser.Game(_config);

  function render() {
    debugRender();
  }
  return game;
};

module.exports = Game;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../behaviors":11,"./Behavior":1,"./Collisions":2,"./Input":4,"./Thing":5,"./Things":6}],4:[function(require,module,exports){
const Input = {};
const inputs = require('../inputs/inputs');
Input.process = function processInput (game) {
  /*
  if (game.gamestate.inputsDisabled === true) {
    return false;
  }
  */
  const Game = require('./Game');
  
  if (Game.servermode) {
    // console.log('server only')
    return;
  }
  
  if (Game.clientMode) {
    return;
  }
  
  // TODO: seperate logic for multiplayer vs single player
  // TODO: see multiplayer handler code in online.html
  // In single player mode, all controls are handled on one client
  // In multiplayer mode, we only want to send inputs for current player, PLAYER_1
  
  const Things = require('./Things');
  for (let player in inputs) {
    for (let input in inputs[player]) {
      if (!Things[player] || !Things[player].inputs) {
        continue;
      }
      if (game.input) {
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
}

Input.removeAll = function removeAllInput (game) {
  const Things = require('./Things');
  for (let player in inputs) {
    for (let input in inputs[player]) {
      if (!Things[player] || !Things[player].inputs) {
        continue;
      }
      console.log('iiii', input, player, inputs[player][input])
      console.log(inputs[player][input])
      var key = game.input.keyboard.removeKey(inputs[player][input]);
    }
  }
}

module.exports = Input;

},{"../inputs/inputs":26,"./Game":3,"./Things":6}],5:[function(require,module,exports){
(function (global){(function (){
const Thing = {};
const T = Things = require('./Things');
const _types = {};
const Behavior = require('./Behavior');

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

  // console.log('creating thing with name: ', name, opts);

  let thing;
  // TODO: allow other types of things to be created, besides physics / matter things
  if (opts.gameobject === 'text') {
    thing = game.add.text(opts.x, opts.y, opts.text, opts.style);
  } else if (opts.matter === false) {
    thing = game.add.sprite(opts.x, opts.y, opts.texture);
  } else {
    thing = global.game.matter.add.sprite(opts.x, opts.y, opts.texture, null, { isStatic: opts.isStatic });
  }

  thing.behaviors = thing.behaviors || {};
  thing.name = name;

  // Namespace added for Geoffrey, easier this way to reference anything Geoffrey is doing vs Phaser.io API
  thing.G = {
    name: name,
    texture: opts.texture
  };

  if (opts.owner) {
    thing.G.owner = opts.owner;
  }

  thing.G.destroy = function () {
    var name = thing.name;
    // console.log("DESTROY", name, T[name])
    if (typeof T[name] !== "object") {
      return;
    }
    // first detach / remove all behaviors
    var bs = T[name].behaviors;
    if (bs) {
      Object.keys(bs).forEach(function (b) {
        if (typeof bs[b] === "object") {
          if (typeof bs[b].remove === "function") {
            bs[b].remove(T[name]);
          }
          Behavior.detach(b, T[name], {});
        }
      });
    }
    // then actually destroy the thing ( phaser.io sprite level destroy )
    thing.destroy();
    if (thing.attachments) {
      thing.attachments.getChildren().forEach(function(a){
        a.destroy();
      });
    }

    // delete references to the thing in Things memory
    delete T[name];
    // delete actual thing itself ( javascript level destroy )
    delete thing;
  }

  Things[thing.name] = thing;
  return thing;
};

Thing.inflate = function inflateThing (thingy) {
  // TODO: must check if Thing already exists, if so, then we want to apply the values and not create duplicate
  // console.log('Things[thingy.name]', thingy.name, Things[thingy.name])
  if (Things[thingy.name]) {
    //Things[thingy.name].x = thingy.x;
    //Things[thingy.name].y = thingy.y;
    //Things[thingy.name].body.velocity = thingy.velocity;
    //Things[thingy.name].body.angle = thingy.angle;
    // Things[thingy.name].rotation = thingy.rotation;
    Things[thingy.name].health = thingy.health;
  } else {
    // takes a serialized thing type structure ( thingy ),
    // and reinflates it back into an actual Thing using Thing.create
    let thing = Thing.create({
      name: thingy.name,
      owner: thingy.owner,
      texture: thingy.texture
    });
    for (let b in thingy.behaviors) {
      Behavior.attach(b, thing, thingy.behaviors[b].opts)
    }
  }

};

module.exports = Thing;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Behavior":1,"./Things":6}],6:[function(require,module,exports){
const Things = {};
module.exports = Things;
},{}],7:[function(require,module,exports){
const T = Things = require('../../Geoffrey/Things');

// aiFollow
// TODO: cleanup / review this behavior
var adjustmentDelay = 60;
module.exports = {
  tags: ['ai'],
  create: function createAiFollow (sprite, opts) {
    if (typeof opts.followTarget === 'undefined') {
      if (sprite.name === 'PLAYER_1') {
        sprite.followTarget = T['PLAYER_2'];
        sprite.followTargetName = 'PLAYER_2';
      } else {
        sprite.followTarget = T['PLAYER_1'];
        sprite.followTargetName = 'PLAYER_1';
      }
    } else {
      sprite.followTarget = opts.followTarget;
      sprite.followTargetName = opts.followTarget.name;
    }

    // works for string name, or whole object ( string style required for level design )
    if (typeof sprite.followTarget === 'string') {
      sprite.followTarget = T[opts.followTarget];
    }

    // sprite.rotationSpeed = sprite.rotationSpeed || 40;
    sprite.rotationSpeed = sprite.rotationSpeed || opts.rotationSpeed || 0.018;
    sprite.makingRandomMovement = false;
    sprite.lastRandomMovement = 0;
    sprite.courseCorrection = game.time.now;
    sprite.ai = true;
  },
  update: function updateAiFollow (sprite, game) {
    // Define constants that affect motion
    // sprite.SPEED = sprite.thrust; // missile speed pixels/second
    sprite.TURN_RATE = Phaser.Math.DegToRad(sprite.rotationSpeed); // turn rate in degrees/frame
    if (sprite.frozen) {
      return true;
    }
    sprite.followTarget = T[sprite.followTargetName];
    // console.log('tttt', sprite.followTargetName, sprite.followTarget)
    if (typeof sprite.followTarget === 'undefined') {
      return;
    }
    if (game.time.now - adjustmentDelay < sprite.courseCorrection) {
      // return;
    }
    // Calculate the angle from the missile to the mouse cursor game.input.x
    // and game.input.y are the mouse position; substitute with whatever
    // target coordinates you need.
    var targetAngle = Phaser.Math.Angle.Between(
      sprite.x, sprite.y,
      sprite.followTarget.x, sprite.followTarget.y
    );

    // Gradually (this.TURN_RATE) aim the missile towards the target angle
    if (sprite.rotation !== targetAngle) {
      // Calculate difference between the current angle and targetAngle
      var delta = targetAngle - sprite.rotation;

      // Keep it in range from -180 to 180 to make the most efficient turns.
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;

      if (delta > 0) {
        // Turn clockwise
        sprite.rotation += sprite.rotationSpeed;
        sprite.courseCorrection = game.time.now;
      } else {
        // Turn counter-clockwise
        sprite.rotation -= sprite.rotationSpeed;
        sprite.courseCorrection = game.time.now;
      }

      // Just set angle to target angle if they are close
      if (Math.abs(delta) < Phaser.Math.DegToRad(sprite.TURN_RATE)) {
        sprite.rotation = targetAngle;
      }
    }

    if (sprite.thrust) {
      if (typeof sprite.thrust !== 'function') {
        console.log("PROBLEM INVALID THRUST VALUE FROM OLD API")
      }
      var d1 = Phaser.Math.Distance.Between(sprite.x, sprite.y, sprite.followTarget.x, sprite.followTarget.y);
      // console.log('d1', d1)
      if (d1 > 120) {
        sprite.thrust(sprite.thrustForce || .001);
      }
    }


  },
  remove: function removeAiFollow(sprite) {
    if (sprite.body) {
      //sprite.setVelocity(0, 0);
    }
    sprite.ai = false;
  }
};
},{"../../Geoffrey/Things":6}],8:[function(require,module,exports){
// hasChatBox
const Input = require('../../Geoffrey/Input');
const Things = require('../../Geoffrey/Things');

module.exports = {
  create: function hasChatBoxCreate (sprite, game) {
    var tKey = sprite.input.keyboard.addKey('T');
    tKey.on('down', function(event) {
      openChatBox();
    });
    function openChatBox (){
      $('.chatBox').show();
    };
    var escKey = sprite.input.keyboard.addKey('ESC');
    escKey.on('down', function(event) {
      closeChatBox();
    });
    var enterKey = sprite.input.keyboard.addKey('ENTER');
    enterKey.on('down', function(event) {
      sendChatMessage();
    });
    function openChatBox (){
      $('.chatBox').show();
      window['game'].gamestate.inputsDisabled = true;
      Input.removeAll(window['game']);
      // TODO: disable all other keys...
    };
    function closeChatBox (){
      $('.chatBox').hide();
      window['game'].gamestate.inputsDisabled = false;
    };
    function sendChatMessage () {
      let msg = $('.chatBoxArea').val();
      // TODO: how do Behaviors / Things send state to the peer broadcaster???
      // TODO: add out of band websocket message for doing real-time chat?
      // Bridge.emit('chat::message', msg);
      closeChatBox();
    }
    $('body').append(`
      <style>
        .chatBox {
          border: solid;
          height: 200px;
          width: 400px;
          position: absolute;
          top: 400px;
          left: 600px;
          color: white;
          display: none;
        }
        .chatBoxArea {
          width: 100%;
        }
      </style>
      <div class="chatBox">
        Talk son<br/>
        <textarea class="chatBoxArea" cols="20" rows="10"></textarea><br/>
        <button>Send</button>
      </div>
    `);
    $('.chatBox button').on('click', function(){
      sendChatMessage();
      return false;
    });
  },
  update: function hasChatBoxUpdate (sprite, game) {
  }
};
},{"../../Geoffrey/Input":4,"../../Geoffrey/Things":6}],9:[function(require,module,exports){
// hasScreenWrap
module.exports = {
  create: function hasScreenWrapCreate (sprite, game) {},
  update: function hasScreenWrapUpdate (sprite, game) {

    let worldWidth = game.sys.game.canvas.width;
    let worldHeight = game.sys.game.canvas.height;
    if (!sprite) {
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
},{}],10:[function(require,module,exports){
// hasStateManager
// const Bridge = require('../../Geoffrey/Bridge');
const Things = require('../../Geoffrey/Things');

module.exports = {
  create: function hasStateManagerCreate (sprite, game) {},
  update: function hasStateManagerUpdate (sprite, game) {
    let gamestate = [];
    // on every game update, serialize the gamestate
    for (let thing in Things) {
      let t = Things[thing];
      let state = {
        name: t.name,
        id: t.name,
        texture: t.G.texture,
        owner: t.G.owner,
        rotation: t.rotation,
        x: t.x,
        y: t.y,
        health: t.health,
        behaviors: t.behaviors
      };
      if (t.body) {
        state.velocity = t.body.velocity;
        state.angle = t.body.angle;
        
      }
      gamestate.push(state);
    }
    game.gamestate = game.gamestate || {};
    game.gamestate.currentState = gamestate;
    // console.log(game.gamestate)
  }
};
},{"../../Geoffrey/Things":6}],11:[function(require,module,exports){
const behaviors = {};

//
// Levels as Behaviors
//
behaviors['isLevel0'] = require('./levels/isLevel0');
behaviors['isOnlineLevel'] = require('./levels/isOnlineLevel');

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
behaviors['hasHealth'] = require('./properties/hasHealth');
behaviors['hasLifespan'] = require('./properties/hasLifespan');
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
},{"./ai/aiFollow":7,"./game/hasChatBox":8,"./game/hasScreenWrap":9,"./game/hasStateManager":10,"./levels/isLevel0":12,"./levels/isOnlineLevel":13,"./movement/hasMaxVelocity":14,"./movement/hasPlasmaPropulsionEngine":15,"./properties/diesWithNoHealth":16,"./properties/hasCollisions":17,"./properties/hasHealth":18,"./properties/hasLifespan":19,"./properties/hasSpeechBubble":20,"./ships/isMIBCaddy":21,"./status/isExploding":22,"./triggers/allOtherPlayersDead":23,"./weapons/hasFusionGun":24}],12:[function(require,module,exports){
const Thing = require('../../Geoffrey/Thing');
const Things = require('../../Geoffrey/Things');
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
  preload: function preloadMibCaddy (opts, game) {
    game.load.image('space', 'assets/levels/starfield.jpg');
  },
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

    let bg = game.add.tileSprite(0, 0, 20000, 20000, 'space');
    bg.context.fillStyle = '#FFFFFF';
    bg.tint = 0xff0000;
    bg.setDepth(-1);

    game.text2 = game.add.text(250, 250, 'Alien Warz', { font: "74px Arial Black", fill: "#000" });
    game.text2.setStroke('#fff', 16);
    game.text2.setShadow(2, 2, "#333333", 2, true, true);

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

    Behavior.attach('isMIBCaddy', p1, { 
      health: 10
    });

    Behavior.attach('isMIBCaddy', p2, { 
      health: 10
    });

    Behavior.attach('aiFollow', p2, { 
      followTarget: p1
    });

    Behavior.attach('hasScreenWrap', p1);
    Behavior.attach('hasScreenWrap', p2);
    Behavior.attach('allOtherPlayersDead', sprite);

  },
  update: function updateisLevel0 (sprite, game) {
    // console.log(Things.PLAYER_1.x, Things.PLAYER_1.y)
  }
};

},{"../../Geoffrey/Behavior":1,"../../Geoffrey/Thing":5,"../../Geoffrey/Things":6}],13:[function(require,module,exports){
const Thing = require('../../Geoffrey/Thing');
const Things = require('../../Geoffrey/Things');
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
  preload: function preloadMibCaddy (opts, game) {
    game.load.image('space', 'assets/levels/starfield.jpg');
  },
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

    let bg = game.add.tileSprite(0, 0, 20000, 20000, 'space');
    bg.context.fillStyle = '#FFFFFF';
    bg.tint = 0xff0000;
    bg.setDepth(-1);

    game.text2 = game.add.text(250, 250, 'Alien Warz', { font: "74px Arial Black", fill: "#000" });
    game.text2.setStroke('#fff', 16);
    game.text2.setShadow(2, 2, "#333333", 2, true, true);

  },
  update: function updateisLevel0 (sprite, game) {
    
    //console.log(Things.PLAYER_1.x, Things.PLAYER_1.y)
  }
};

},{"../../Geoffrey/Behavior":1,"../../Geoffrey/Thing":5,"../../Geoffrey/Things":6}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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
},{"../../Geoffrey/Things":6}],16:[function(require,module,exports){
// diesWithNoHealth
const Behavior = require('../../Geoffrey/Behavior');

module.exports ={
  create: function createDiesWithNoHealth (sprite, opts) {
    // should already have hasHealth attached
    sprite.diesWithNoHealthCallback = opts.callback || null;
  },
  update: function updateDiesWithNoHealth (sprite) {
    if (sprite.G.health <= 0 && !sprite.G.dead) {
      // TODO: add explosion / fix detach destroy remove error
      if (sprite.diesWithNoHealthCallback !== null) {
        sprite.diesWithNoHealthCallback(null, sprite);
      }
      Behavior.attach('isExploding', sprite);
      sprite.G.destroy();
      sprite.G.dead = true;
    } 
  }
};
},{"../../Geoffrey/Behavior":1}],17:[function(require,module,exports){
module.exports = {
  create: function createHasCollisions (sprite, opts) {
    if (typeof opts.collisionHandler === 'undefined') {
      // throw new Error('opts.collisionHandler is required!');
    }
    if (opts.collidesWithSelf) {
      sprite.collidesWithSelf = opts.collidesWithSelf;
    }
    if (opts.collidesWithSiblings) {
      sprite.collidesWithSiblings = opts.collidesWithSiblings;
    }
    if (opts.collidesWithChildren) {
      sprite.collidesWithChildren = opts.collidesWithChildren;
    }
    if (opts.beforeCollisionCheck) {
      sprite.beforeCollisionCheck = opts.beforeCollisionCheck;
    }
    if (opts.collisionHandler) {
      sprite.collisionHandler = opts.collisionHandler;
    }
    if (opts.additionalCollisionCheck) {
      sprite.additionalCollisionCheck = opts.additionalCollisionCheck;
    }
    if (typeof opts.impacts !== 'undefined') {
      sprite.impacts = opts.impacts;
    }
  },
  update: function updateHasCollisions (sprite, game) {
  },
  remove: function removeHasCollisions (sprite) {
  }
};


},{}],18:[function(require,module,exports){
// hasHealth
module.exports ={
  create: function createHealth (sprite, opts) {
    console.log('has health', opts)
    sprite.G.health = opts.health || 100;
    sprite.G.maxHealth = opts.maxHealth || opts.health;
  },
  update: function updateHealth (sprite) {
  }
};
},{}],19:[function(require,module,exports){
// hasLifespanCreate
module.exports ={
  create: function hasLifespanCreate (sprite, opts) {
    sprite.lifespan = opts.lifespan || 2000;
    opts.callback = opts.callback || function () {
      console.log('missing hasLifespan callback')
      sprite.G.destroy(true, false)
    };
    var timer = game.time.delayedCall(sprite.lifespan, function(){
      opts.callback();
    });
  },
  update: function hasLifespanUpdate (sprite) {
  }
};

},{}],20:[function(require,module,exports){
// hasSpeechBubble
const Thing = require('../../Geoffrey/Thing');

module.exports ={
  create: function createHasSpeechBubble (sprite, opts) {
    sprite.G.health = opts.health || 100;
    sprite.G.maxHealth = opts.maxHealth || opts.health;
    let style = { font: '20px Courier', fill: '#ccc', tabs: 132, align: 'left'};
    let speechBubble = sprite.G.speechBubble = Thing.create({
      type: 'speech-bubble',
      gameobject: 'text',
      owner: sprite.name,
      x: sprite.x,
      y: sprite.y,
      text: '...',
      style: style
    });
    
  },
  update: function updateHasSpeechBubble (sprite) {
    sprite.G.speechBubble.x = sprite.x;
    sprite.G.speechBubble.y = sprite.y;
  }
};
},{"../../Geoffrey/Thing":5}],21:[function(require,module,exports){
const Behavior = require('../../Geoffrey/Behavior');

// isMibCaddy
module.exports = {
  tags: ['ship'],
  preload: function preloadMibCaddy (opts, game) {
    game.load.spritesheet('mib-caddy', 'assets/ships/mib-caddy.png', { frameWidth: 140, frameHeight: 48, start: 0, end: 4 });
  },
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

    Behavior.attach('hasHealth', sprite, {
      health: opts.health || 60
    });

    Behavior.attach('hasPlasmaPropulsionEngine', sprite, {});

    Behavior.attach('hasFusionGun', sprite, {
      controlKey: 'primaryWeaponKey'
    });

    Behavior. attach('diesWithNoHealth', sprite, {});

    /*
    attach('hasEnergy', sprite, {
      energy: opts.energy || 100
    });
    attach('hasSignals', sprite);
    attach('diesWithNoHealth', sprite, {});
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

  }
};



},{"../../Geoffrey/Behavior":1}],22:[function(require,module,exports){
const Thing = require('../../Geoffrey/Thing');

// isExploding
module.exports = {
  preload: function preloadIsExploding (opts, game) {
    game.load.spritesheet('explode', 'assets/fx/explode.png', { frameWidth: 128, frameHeight: 128 });
  },
  create: function createDiesWithNoHealth (sprite, opts) {
    if (!(sprite && sprite.x && sprite.y)) {
      return;
    }
    var explosion = Thing.create({
      type: 'explosion',
      matter: false,
      x: sprite.x,
      y: sprite.y,
      texture: 'explode'
    });
    explosion.height = 10;
    explosion.width = 10;
    explosion.displayHeight = 25;
    explosion.displayWidth = 25;
    explosion.height = sprite.height * 2;
    explosion.width = sprite.width * 2;
    // should explosion be in front or behind of target sprite?
    //explosion.depth = -1;
    var config = {
      key: 'explodes',
      frames: game.anims.generateFrameNumbers('explode'),
      frameRate: 16,
      yoyo: false,
      repeat: 0
    };
    game.anims.create(config);
    explosion.anims.load('explodes');
    explosion.anims.play('explodes');
    explosion.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function(currentAnim, currentFrame, sprite){
      try {
        explosion.G.destroy();
      } catch (err) {
        console.log(err)
      }
    });
  },
  update: function updateIsExploding (sprite) {
  }
};


},{"../../Geoffrey/Thing":5}],23:[function(require,module,exports){
// allOtherPlayersDead
module.exports ={
  create: function createAllOtherPlayersDead (sprite, opts) {
    sprite.health = opts.health || 100;
    sprite.maxHealth = opts.maxHealth || opts.health;
  },
  update: function updateAllOtherPlayersDead (sprite) {
    let players = ['PLAYER_1', 'PLAYER_2'];
    let dead = 0;
    players.forEach(function(player){
      if (!Things[player].destructable) {
        dead++
      }
    });
    if (dead >= players.length) {
      // console.log("DEAD")
    }
  }
};
},{}],24:[function(require,module,exports){
const Behavior = require('../../Geoffrey/Behavior');
const Thing = require('../../Geoffrey/Thing');

//  hasFusionGun
let worldScale = 1;
let BULLET_LIFESPAN = 300;
let BULLET_RATE = 30;
let BULLET_SPEED = 200;
let BULLET_STRENGTH = 1;
let BULLET_ENERGY = 0;

module.exports = {
  preload: function preloadMibCaddy (opts, game) {
    game.load.image('bullet', 'assets/weapons/bullets.png');
  },
  create: function createFusionGun (sprite, opts) {
    //sprite.fusionGunSFX = game.add.audio('necroBomb', 0.2);
    BULLET_RATE = opts.BULLET_RATE || BULLET_RATE;
    sprite.G.fusionGunTime = 0;
    if (typeof opts.strength === 'number') {
      BULLET_STRENGTH = opts.strength;
    }
    sprite.G.fusionGunControlKey = opts.controlKey || 'primaryWeaponKey';
  },
  update: function updateFusionGun (sprite, game) {
    // console.log('updating with inputs', sprite.inputs)
    if ((sprite.inputs && sprite.inputs[sprite.G.fusionGunControlKey]) || sprite.autofire) {
      if (game.time.now > sprite.G.fusionGunTime) {
        // perform energy check
        if (sprite.energy <= BULLET_ENERGY) {
          return;
        }
        if (typeof sprite.energy === 'number') {
          sprite.energy -= BULLET_ENERGY;
        }
        // energy check passed, create new bullet
        let bullet = Thing.create({
          type: 'bullet',
          x: sprite.x,
          y: sprite.y,
          texture: 'bullet'
        })

        bullet.G.owner = sprite.name;

        bullet.hardness = 7;
        bullet.G.impacts = false;

        bullet.weapon = true;
        bullet.height = 10;
        bullet.width = 10;
        bullet.setMass(0);
        bullet.setFriction(0, 0);

        bullet.setBounce(0);
        bullet.setRectangle(5,5);

        Behavior.attach('hasScreenWrap',  bullet);

        //bullet.anchor.set(0.5, 0.5);
        //  and its physics settings
        let newVelocity = {};
        newVelocity.x = sprite.body.velocity.x + (Math.cos(sprite.rotation) * 15);
        newVelocity.y = sprite.body.velocity.y + (Math.sin(sprite.rotation) * 15);
        bullet.setVelocity(newVelocity.x,  newVelocity.y);
        sprite.G.fusionGunTime = game.time.now + BULLET_RATE;

        Behavior.attach('hasLifespan', bullet, {
          lifespan: BULLET_LIFESPAN,
          callback: function () {
            try {
              bullet.G.destroy();
            } catch (err) {
              console.log(err.message)
            }
          }
        });

        Behavior.attach('hasCollisions', bullet, {
          owner: sprite,
          collidesWithSelf: false, // TODO: not supported yet?
          collidesWithSiblings: true,
          collidesWithChildren: true,
          collisionHandler: function (thing) {
            if (typeof thing.hardness !== 'undefined' && thing.hardness > 7) { // TODO: b.hardness instead of 7
              // do nothing
              console.log('not hard enough');
            } else {
              // console.log(T[thing].name)
              thing.G.health -= BULLET_STRENGTH;
              bullet.G.destroy();
            }
          }
        });
        bullet.rotation = sprite.rotation;
        bullet.body.customSeparateX = true;
        bullet.body.customSeparateY = true;
      }
    }

  }
};

},{"../../Geoffrey/Behavior":1,"../../Geoffrey/Thing":5}],25:[function(require,module,exports){
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

},{"./Geoffrey/Behavior":1,"./Geoffrey/Game":3,"./Geoffrey/Thing":5,"./Geoffrey/Things":6,"./behaviors":11,"./inputs/inputs":26}],26:[function(require,module,exports){
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
},{}]},{},[25])(25)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvR2VvZmZyZXkvQmVoYXZpb3IuanMiLCJsaWIvR2VvZmZyZXkvQ29sbGlzaW9ucy5qcyIsImxpYi9HZW9mZnJleS9HYW1lLmpzIiwibGliL0dlb2ZmcmV5L0lucHV0LmpzIiwibGliL0dlb2ZmcmV5L1RoaW5nLmpzIiwibGliL0dlb2ZmcmV5L1RoaW5ncy5qcyIsImxpYi9iZWhhdmlvcnMvYWkvYWlGb2xsb3cuanMiLCJsaWIvYmVoYXZpb3JzL2dhbWUvaGFzQ2hhdEJveC5qcyIsImxpYi9iZWhhdmlvcnMvZ2FtZS9oYXNTY3JlZW5XcmFwLmpzIiwibGliL2JlaGF2aW9ycy9nYW1lL2hhc1N0YXRlTWFuYWdlci5qcyIsImxpYi9iZWhhdmlvcnMvaW5kZXguanMiLCJsaWIvYmVoYXZpb3JzL2xldmVscy9pc0xldmVsMC5qcyIsImxpYi9iZWhhdmlvcnMvbGV2ZWxzL2lzT25saW5lTGV2ZWwuanMiLCJsaWIvYmVoYXZpb3JzL21vdmVtZW50L2hhc01heFZlbG9jaXR5LmpzIiwibGliL2JlaGF2aW9ycy9tb3ZlbWVudC9oYXNQbGFzbWFQcm9wdWxzaW9uRW5naW5lLmpzIiwibGliL2JlaGF2aW9ycy9wcm9wZXJ0aWVzL2RpZXNXaXRoTm9IZWFsdGguanMiLCJsaWIvYmVoYXZpb3JzL3Byb3BlcnRpZXMvaGFzQ29sbGlzaW9ucy5qcyIsImxpYi9iZWhhdmlvcnMvcHJvcGVydGllcy9oYXNIZWFsdGguanMiLCJsaWIvYmVoYXZpb3JzL3Byb3BlcnRpZXMvaGFzTGlmZXNwYW4uanMiLCJsaWIvYmVoYXZpb3JzL3Byb3BlcnRpZXMvaGFzU3BlZWNoQnViYmxlLmpzIiwibGliL2JlaGF2aW9ycy9zaGlwcy9pc01JQkNhZGR5LmpzIiwibGliL2JlaGF2aW9ycy9zdGF0dXMvaXNFeHBsb2RpbmcuanMiLCJsaWIvYmVoYXZpb3JzL3RyaWdnZXJzL2FsbE90aGVyUGxheWVyc0RlYWQuanMiLCJsaWIvYmVoYXZpb3JzL3dlYXBvbnMvaGFzRnVzaW9uR3VuLmpzIiwibGliL2luZGV4LmpzIiwibGliL2lucHV0cy9pbnB1dHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdHQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgQmVoYXZpb3IgPSB7fTtcbkJlaGF2aW9yLmF0dGFjaCA9IGZ1bmN0aW9uIGF0dGFjaEJlaGF2aW9yIChiZWhhdmlvciwgc3ByaXRlLCBvcHRzKSB7XG5cbiAgY29uc3QgYmVoYXZpb3JzID0gcmVxdWlyZSgnLi4vYmVoYXZpb3JzJyk7XG5cbiAgaWYgKHR5cGVvZiBzcHJpdGUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAvLyB0aHJvdyBuZXcgRXJyb3IoJ1dhcm5pbmc6IGF0dGVtcHRpbmcgdG8gYXR0YWNoIGJlaGF2aW9yIHRvIHVuZGVmaW5lZCBzcHJpdGUgJyArIGJlaGF2aW9yKVxuICAgIGNvbnNvbGUubG9nKCdXYXJuaW5nOiBhdHRlbXB0aW5nIHRvIGF0dGFjaCBiZWhhdmlvciB0byB1bmRlZmluZWQgc3ByaXRlICcgKyBiZWhhdmlvcik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIG9wdHMgPSBvcHRzIHx8IHt9O1xuXG4gIGlmIChCZWhhdmlvci5tb2RlICE9PSAnc2VydmVyJykge1xuICAgIGlmIChiZWhhdmlvciA9PT0gJ2FpRm9sbG93Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG5cbiAgc3ByaXRlLmJlaGF2aW9ycyA9IHNwcml0ZS5iZWhhdmlvcnMgfHwge307XG4gIHNwcml0ZS5iZWhhdmlvcnNbYmVoYXZpb3JdID0gYmVoYXZpb3JzW2JlaGF2aW9yXTtcbiAgc3ByaXRlLmJlaGF2aW9yc1tiZWhhdmlvcl0ub3B0cyA9IG9wdHM7XG5cbiAgaWYgKHR5cGVvZiBzcHJpdGUuYmVoYXZpb3JzW2JlaGF2aW9yXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHRocm93IG5ldyBFcnJvcignQmVoYXZpb3IgY291bGQgbm90IGJlIHJlcXVpcmVkOiAnICsgYmVoYXZpb3IpO1xuICB9XG5cblxuXG4gIGlmICh0eXBlb2Ygc3ByaXRlLmJlaGF2aW9yc1tiZWhhdmlvcl0uY3JlYXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFnYW1lKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdubyBnYW1lIHZhcmlhYmxlIGZvdW5kLi4uJywgZ2FtZSlcbiAgICAgIH1cbiAgICAgIHNwcml0ZS5iZWhhdmlvcnNbYmVoYXZpb3JdLmNyZWF0ZShzcHJpdGUsIG9wdHMsIGdhbWUpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coJ2Vycm9yIHJ1bm5pbmcgJyArIGJlaGF2aW9yICsgJy5jcmVhdGUoKScsIGVycik7XG4gICAgfVxuICB9XG5cbn07XG5cbkJlaGF2aW9yLmRldGFjaCA9IGZ1bmN0aW9uIGRldGFjaEJlaGF2aW9yIChiZWhhdmlvciwgc3ByaXRlLCBvcHRzKSB7XG4gIGlmICh0eXBlb2Ygc3ByaXRlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHNwcml0ZS5iZWhhdmlvcnMgPSBzcHJpdGUuYmVoYXZpb3JzIHx8IHt9O1xuICBpZiAodHlwZW9mIHNwcml0ZS5iZWhhdmlvcnNbYmVoYXZpb3JdID09PSBcIm9iamVjdFwiKSB7XG4gICAgLy8gaWYgYSAncmVtb3ZlJyBtZXRob2QgaGFzIGJlZW4gcHJvdmlkZWQsIHJ1biBpdCBub3cgdG8gY2xlYW4gdXAgYmVoYXZpb3JcbiAgICBpZiAodHlwZW9mIHNwcml0ZS5iZWhhdmlvcnNbYmVoYXZpb3JdLnJlbW92ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAvLyAncmVtb3ZlJyBtZXRob2RzIHdpbGwgdXN1YWxseSBkZWxldGUgbm8gbG9uZ2VyIG5lZWRlZCByZXNvdXJjZXMsXG4gICAgICAvLyBvciByZXNldCB0aGUgc3RhdGUgb2Ygc29tZXRoaW5nIG5vdyB0aGF0IHRoZSBiZWhhdmlvciBpcyByZW1vdmVkXG4gICAgICBzcHJpdGUuYmVoYXZpb3JzW2JlaGF2aW9yXS5yZW1vdmUoc3ByaXRlLCBnYW1lKTtcbiAgICB9XG4gICAgZGVsZXRlIHNwcml0ZS5iZWhhdmlvcnNbYmVoYXZpb3JdO1xuICB9XG59O1xuXG5CZWhhdmlvci5wcm9jZXNzID0gZnVuY3Rpb24gcHJvY2Vzc0JlaGF2aW9yICh0aGluZykge1xuXG4gIGNvbnN0IGJlaGF2aW9ycyA9IHJlcXVpcmUoJy4uL2JlaGF2aW9ycycpO1xuXG4gIC8vIHByb2Nlc3MgYWxsIFRoaW5nc1xuICBpZiAodHlwZW9mIHRoaW5nID09PSBcIm9iamVjdFwiKSB7XG4gICAgaWYgKHR5cGVvZiB0aGluZy5iZWhhdmlvcnMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIHZhciBiZWhhdmlvcktleXMgPSBPYmplY3Qua2V5cyh0aGluZy5iZWhhdmlvcnMpO1xuICAgICAgYmVoYXZpb3JLZXlzLmZvckVhY2goZnVuY3Rpb24gKGIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGluZy5iZWhhdmlvcnNbYl0gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaW5nLmJlaGF2aW9yc1tiXS51cGRhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgdGhpbmcuYmVoYXZpb3JzW2JdLnVwZGF0ZS5jYWxsKHRoaXMsIHRoaW5nLCBnYW1lLCB0aGluZy5iZWhhdmlvcnNbYl0uY29uZmlnKTtcbiAgICAgICAgICAgICAgLy8gUmVtYXJrOiBUaGlzIGlzIHRoZSBiZXN0IHBsYWNlIHRvIGNsYW1wIG1heCB2ZWxvY2l0eSBvZiBhbGwgcGh5c2ljcyBib2RpZXNcbiAgICAgICAgICAgICAgLy8gICBUaGlzIG11c3QgYmUgZG9uZSBhZnRlciBhbGwgcG9zc2libGUgdGhydXN0IGlzIGFwcGxpZWQgKCBhZnRlciBhbGwgYmVoYXZpb3JzIHJ1biApXG4gICAgICAgICAgICAgIC8vIFRPRE86IFdlIGNvdWxkIHByb2JhYmx5IGltcGxlbWVudCB0aGlzIGFzIGEgc2VyaWVzIG9mIFwiYWZ0ZXJcIiBiZWhhdmlvcnMsXG4gICAgICAgICAgICAgIC8vICAgICAgIG9yIGFkZCBjYXJkaW5hbGl0eSB0byB0aGUgb3JkZXIgb2YgYmVoYXZpb3JzXG4gICAgICAgICAgICAgIGlmICh0aGluZy5tYXhWZWxvY2l0eSkge1xuICAgICAgICAgICAgICAgIGJlaGF2aW9ycy5oYXNNYXhWZWxvY2l0eS51cGRhdGUodGhpbmcpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3dhcm5pbmc6IGVycm9yIGluIHByb2Nlc3NpbmcgdXBkYXRlIGNhbGwgZm9yOicgKyBiLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmVoYXZpb3I7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnbG9iYWxDb2xsaXNpb25IYW5kbGVyIChldmVudCkge1xuICAvLyBSZW1hcms6IE9ubHkgdXNlIGV2ZW50IGFyZ3VtZW50IGFuZCBldmVudC5wYWlycyB2YWx1ZVxuICAvL2NvbnNvbGUubG9nKCdjb2xsaXNpb24gZXZlbnQnLCBldmVudCk7XG4gIC8vY29uc29sZS5sb2coJ2NvbGxpc2lvbiBwYWlycycsIHBhaXJzKTtcbiAgLy8gY29uc29sZS5sb2coXCJDT0xMSURFU1wiLCBldmVudC5wYWlycylcbiAgdmFyIHBhaXJzID0gZXZlbnQucGFpcnM7XG4gIC8vIFRPRE86IHBvcnQgaGFzQ29sbGlzaW9ucyBiZWhhdmlvciBjb2RlIGhlcmUuLi5jZW50cmFsIGNvbGxpc2lvbiBkZXRlY3Rvci4uLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBhaXIgPSBwYWlyc1tpXTtcbiAgICB2YXIgdDEgPSBwYWlyLmJvZHlBLmdhbWVPYmplY3Q7XG4gICAgdmFyIHQyID0gcGFpci5ib2R5Qi5nYW1lT2JqZWN0O1xuXG4gICAgLy8gaGFuZGxlIHNlbnNvciBjb2xsaXNpb25zIGZpcnN0XG4gICAgaWYgKHBhaXIuaXNTZW5zb3IpIHtcbiAgICAgIHZhciBib2R5QSA9IHBhaXIuYm9keUE7XG4gICAgICB2YXIgYm9keUIgPSBwYWlyLmJvZHlCO1xuICAgICAgaWYgKHBhaXIuYm9keUEuZ2FtZU9iamVjdCAhPT0gbnVsbCAmJiBwYWlyLmJvZHlCLmdhbWVPYmplY3QgIT09IG51bGwpIHtcbiAgICAgICAgcGFpci5ib2R5QS5nYW1lT2JqZWN0LnRvdWNoaW5nID0gcGFpci5ib2R5QS5nYW1lT2JqZWN0LnRvdWNoaW5nIHx8IHt9O1xuICAgICAgICBwYWlyLmJvZHlCLmdhbWVPYmplY3QudG91Y2hpbmcgPSBwYWlyLmJvZHlCLmdhbWVPYmplY3QudG91Y2hpbmcgfHwge307XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdzZW5zb3IgaGl0JywgcGFpciwgYm9keUEubGFiZWwsIGJvZHlCLmxhYmVsKTtcbiAgICAgICAgaWYgKGJvZHlBLmxhYmVsID09PSAnYm90dG9tJyB8fCBib2R5Qi5sYWJlbCA9PT0gJ2JvdHRvbScpIHtcbiAgICAgICAgICBwYWlyLmJvZHlBLmdhbWVPYmplY3QudG91Y2hpbmcuYm90dG9tID0gdHJ1ZTtcbiAgICAgICAgICBwYWlyLmJvZHlCLmdhbWVPYmplY3QudG91Y2hpbmcuYm90dG9tID0gdHJ1ZTtcbiAgICAgICAgICBwYWlyLmJvZHlBLmdhbWVPYmplY3QuanVtcGluZyA9IGZhbHNlO1xuICAgICAgICAgIHBhaXIuYm9keUIuZ2FtZU9iamVjdC5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY29udGludWU7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vY29uc29sZS5sb2coJ2NvbGxpZGVzJywgdDEubmFtZSwgdDIubmFtZSlcbiAgICAvL3JldHVybjtcbiAgICBpZiAodDEgPT09IG51bGwgfHwgdDIgPT09IG51bGwpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyh0MS5uYW1lLCB0Mi5vd25lcilcbiAgICAvLyBjb2xsaWRlcyB3aXRoIHNlbGZcbiAgICBpZiAodDEubmFtZSA9PT0gdDIubmFtZSkge1xuICAgICAgcGFpci5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyh0MSwgdDIpXG4gICAgaWYgKHQxLnNraXBDb2xsaXNpb24gfHwgdDIuc2tpcENvbGxpc2lvbikge1xuICAgICAgcGFpci5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgLy8gY29udGludWU7XG4gICAgfVxuICAgIGlmICh0MS5iZWZvcmVDb2xsaXNpb25DaGVjaykge1xuICAgICAgdDEuYmVmb3JlQ29sbGlzaW9uQ2hlY2sodDIsIHBhaXIpO1xuICAgIH1cbiAgICBpZiAodDIuYmVmb3JlQ29sbGlzaW9uQ2hlY2spIHtcbiAgICAgIHQyLmJlZm9yZUNvbGxpc2lvbkNoZWNrKHQxLCBwYWlyKTtcbiAgICB9XG4gICAgLy9cbiAgICAvLyBDb2xsaWRlcyB3aXRoIHBhcmVudFxuICAgIC8vXG4gICAgaWYgKHQxLm5hbWUgPT09IHQyLkcub3duZXIpIHtcbiAgICAgIHBhaXIuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgIC8vIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAodDEuRy5vd25lciA9PT0gdDIubmFtZSkge1xuICAgICAgcGFpci5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgLy8gY29udGludWU7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBDb2xsaWRlcyB3aXRoIHNpYmxpbmdzXG4gICAgLy9cbiAgICBpZiAodHlwZW9mIHQxLkcub3duZXIgIT09ICd1bmRlZmluZWQnICYmIHQxLkcub3duZXIgPT09IHQyLkcub3duZXIpIHtcbiAgICAgIHBhaXIuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgIC8vIGNvbnRpbnVlO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZygnQ09MTElTSU9OUycsIHBhaXIuaXNBY3RpdmUsIHQxLkcsIHQyLkcpXG4gICAgLy8gY29uc29sZS5sb2coJ3BwcHAnLCBwYWlyLmlzQWN0aXZlKVxuICAgIGlmIChwYWlyLmlzQWN0aXZlKSB7XG4gICAgICBpZiAodDEuY29sbGlzaW9uSGFuZGxlcikge1xuICAgICAgICB0MS5jb2xsaXNpb25IYW5kbGVyKHQyLCBwYWlyKTtcbiAgICAgIH1cbiAgICAgIGlmICh0Mi5jb2xsaXNpb25IYW5kbGVyKSB7XG4gICAgICAgIHQyLmNvbGxpc2lvbkhhbmRsZXIodDEsIHBhaXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodDEuRy5pbXBhY3RzID09PSBmYWxzZSB8fCB0Mi5HLmltcGFjdHMgPT09IGZhbHNlKSB7XG4gICAgICAgIHBhaXIuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgLy8gY29udGludWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHQxLmFkZGl0aW9uYWxDb2xsaXNpb25DaGVjaykge1xuICAgICAgdDEuYWRkaXRpb25hbENvbGxpc2lvbkNoZWNrKHQyLCB0MSk7XG4gICAgfVxuXG4gICAgaWYgKHQyLmFkZGl0aW9uYWxDb2xsaXNpb25DaGVjaykge1xuICAgICAgdDIuYWRkaXRpb25hbENvbGxpc2lvbkNoZWNrKHQxLCB0Mik7XG4gICAgfVxuICB9XG59OyIsImNvbnN0IEJlaGF2aW9yID0gcmVxdWlyZSgnLi9CZWhhdmlvcicpO1xuY29uc3QgVGhpbmcgPSByZXF1aXJlKCcuL1RoaW5nJyk7XG5jb25zdCBUaGluZ3MgPSByZXF1aXJlKCcuL1RoaW5ncycpO1xuY29uc3QgSW5wdXQgPSByZXF1aXJlKCcuL0lucHV0Jyk7XG53aW5kb3dbJ2dhbWUnXSA9ICcnO1xuZ2xvYmFsLmdhbWUgPSAnJztcbmxldCBnbG9iYWxDb2xsaXNpb25IYW5kbGVyID0gcmVxdWlyZSgnLi9Db2xsaXNpb25zJyk7XG5cbnZhciB3b3JsZFdpZHRoID0gMTAyNDtcbnZhciB3b3JsZEhlaWdodCA9IDc1OTtcblxuXG4vLyBHYW1lIG9iamVjdCBpcyByZXNwb25zaWJsZSBmb3IgYWdncmVnYXRpbmcgYWxsIGdhbWUgYmVoYXZpb3JzIGludG8gY29tbW9uIFBoYXNlci5nYW1lIHByZWxvYWQgLyBjcmVhdGUgLyB1cGRhdGUgaGFuZGxlcnNcbmxldCBHYW1lID0ge307XG5HYW1lLl91cGRhdGVzID0gW107XG5HYW1lLl9jcmVhdGVzID0gW107XG5HYW1lLl9wcmVsb2FkcyA9IFtdO1xuXG5HYW1lLmJpbmRDcmVhdGUgPSBmdW5jdGlvbiBiaW5kQ3JlYXRlIChmbikge1xuICAvLyBhZGRzIG5ldyBjcmVhdGUgZnVuY3Rpb25zIHRvIEdhbWUgY3JlYXRlIGNoYWluXG4gIEdhbWUuX2NyZWF0ZXMucHVzaChmbilcbn07XG5cbkdhbWUuY3JlYXRlID0gZnVuY3Rpb24gZ2FtZUNyZWF0ZSAoZ2FtZSkge1xuICBnYW1lLmdhbWVzdGF0ZSA9IHt9O1xuICBHYW1lLl9jcmVhdGVzLmZvckVhY2goZnVuY3Rpb24oZil7XG4gICAgZihnYW1lKTtcbiAgfSk7XG59O1xuXG5HYW1lLnNlcnZlcm1vZGUgPSBmYWxzZTtcbkdhbWUuY2xpZW50TW9kZSA9IGZhbHNlO1xuXG5HYW1lLmJpbmRVcGRhdGUgPSBmdW5jdGlvbiBiaW5kVXBkYXRlIChmbikge1xuICBjb25zb2xlLmxvZygncHVzaGluZyBmbicpXG4gIC8vIGFkZHMgbmV3IHVwZGF0ZSBmdW5jdGlvbiB0byBHYW1lIHVwZGF0ZSBjaGFpblxuICBHYW1lLl91cGRhdGVzLnB1c2goZm4pXG59O1xuXG5HYW1lLnVwZGF0ZSA9IGZ1bmN0aW9uIGdhbWVVcGRhdGUgKCkge1xuICAvKlxuICB2YXIgY2FtID0gZ2FtZS5jYW1lcmFzLm1haW47XG4gIGNhbS5zZXRTaXplKHdvcmxkV2lkdGgsIHdvcmxkSGVpZ2h0KTtcbiAgKi9cbiAgSW5wdXQucHJvY2VzcyhnYW1lKTtcbiAgLy8gR2FtZS51cGRhdGUoZ2FtZSk7XG4gIGZvciAobGV0IHRoaW5nIGluIFRoaW5ncykge1xuICAgIC8vIGNvbnNvbGUubG9nKCd1cGRhdGluZycsIHRoaW5nLCBUaGluZ3NbdGhpbmddLmlucHV0cylcbiAgICBCZWhhdmlvci5wcm9jZXNzKFRoaW5nc1t0aGluZ10pO1xuICB9XG4gIC8vIGdhbWUuY2FtZXJhcy5jYW1lcmFzWzBdLnNldEJvdW5kcygwLCAwLCB3b3JsZFdpZHRoLCB3b3JsZEhlaWdodCk7XG4gIEdhbWUuX3VwZGF0ZXMuZm9yRWFjaChmdW5jdGlvbihmKXtcbiAgICBmKGdhbWUpO1xuICB9KTtcbiAgXG4gIHRyeSB7XG4gICAgZ2FtZS5jYW1lcmFzLmNhbWVyYXNbMF0uc2V0Qm91bmRzKDAsIDAsIHdvcmxkV2lkdGgsIHdvcmxkSGVpZ2h0KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgXG4gIH1cbiAgXG59O1xuXG5HYW1lLnByZWxvYWQgPSBmdW5jdGlvbiBnYW1lUHJlbG9hZCAoKSB7XG4gIGdhbWUgPSB0aGlzO1xuXG4gIGdhbWUubWF0dGVyLndvcmxkLm9uKCdjb2xsaXNpb25zdGFydCcsIGZ1bmN0aW9uIChldmVudCwgYm9keUEsIGJvZHlCKSB7XG4gICAgZ2xvYmFsQ29sbGlzaW9uSGFuZGxlcihldmVudCwgYm9keUEsIGJvZHlCKTtcbiAgfSk7XG5cbiAgY29uc3QgYmVoYXZpb3JzID0gcmVxdWlyZSgnLi4vYmVoYXZpb3JzJyk7XG5cbiAgZm9yIChsZXQgYiBpbiBiZWhhdmlvcnMpIHtcbiAgICBpZiAodHlwZW9mIGJlaGF2aW9yc1tiXS5wcmVsb2FkID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdwcmVsb2FkaW5nIHNwcml0ZScsICBiZWhhdmlvcnNbYl0ucHJlbG9hZC50b1N0cmluZygpKVxuICAgICAgICBiZWhhdmlvcnNbYl0ucHJlbG9hZCh7fSwgZ2FtZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yIHJ1bm5pbmcgJyArIGIgKyAnLnByZWxvYWQoKScsIGVycik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn07XG5cbkdhbWUuaW5pdCA9IGZ1bmN0aW9uIGluaXRHYW1lICh7IHJlbmRlck1vZGUsIGF1ZGlvIH0pIHtcblxuXG4gIHZhciByZW5kZXJNb2RlID0gcmVuZGVyTW9kZSB8fCBQaGFzZXIuQVVUTztcbiAgaWYgKHR5cGVvZiBhdWRpbyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBhdWRpbyA9IHRydWU7XG4gIH1cbiAgdmFyIF9jb25maWcgPSB7XG4gICAgdHlwZTogcmVuZGVyTW9kZSxcbiAgICBwYXJlbnQ6ICdnYW1lLWNhbnZhcy1kaXYnLFxuICAgIHdpZHRoOiB3b3JsZFdpZHRoLFxuICAgIGhlaWdodDogd29ybGRIZWlnaHQsXG4gICAgYXVkaW86IGZhbHNlLFxuICAgIGJhbm5lcjogZmFsc2UsXG4gICAgcGh5c2ljczoge1xuICAgICAgZGVmYXVsdDogJ21hdHRlcicsXG4gICAgICBtYXR0ZXI6IHtcbiAgICAgICAgZGVidWc6IHRydWUsIC8vIFRPRE86IHVzZSBjb25maWdcbiAgICAgICAgZ3Jhdml0eTogeyB5OiAwLCB4OiAwIH0sXG4gICAgICAgIHBsdWdpbnM6IHtcbiAgICAgICAgICBhdHRyYWN0b3JzOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNjZW5lOiB7XG4gICAgICBwcmVsb2FkOiBHYW1lLnByZWxvYWQsXG4gICAgICBjcmVhdGU6IEdhbWUuY3JlYXRlLFxuICAgICAgdXBkYXRlOiBHYW1lLnVwZGF0ZSxcbiAgICAgIHJlbmRlcjogcmVuZGVyXG4gICAgfVxuICB9O1xuXG4gIC8vIGNyZWF0ZSBuZXcgcGhhc2VyIGdhbWVcbiAgZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZShfY29uZmlnKTtcblxuICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgZGVidWdSZW5kZXIoKTtcbiAgfVxuICByZXR1cm4gZ2FtZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcbiIsImNvbnN0IElucHV0ID0ge307XG5jb25zdCBpbnB1dHMgPSByZXF1aXJlKCcuLi9pbnB1dHMvaW5wdXRzJyk7XG5JbnB1dC5wcm9jZXNzID0gZnVuY3Rpb24gcHJvY2Vzc0lucHV0IChnYW1lKSB7XG4gIC8qXG4gIGlmIChnYW1lLmdhbWVzdGF0ZS5pbnB1dHNEaXNhYmxlZCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAqL1xuICBjb25zdCBHYW1lID0gcmVxdWlyZSgnLi9HYW1lJyk7XG4gIFxuICBpZiAoR2FtZS5zZXJ2ZXJtb2RlKSB7XG4gICAgLy8gY29uc29sZS5sb2coJ3NlcnZlciBvbmx5JylcbiAgICByZXR1cm47XG4gIH1cbiAgXG4gIGlmIChHYW1lLmNsaWVudE1vZGUpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgXG4gIC8vIFRPRE86IHNlcGVyYXRlIGxvZ2ljIGZvciBtdWx0aXBsYXllciB2cyBzaW5nbGUgcGxheWVyXG4gIC8vIFRPRE86IHNlZSBtdWx0aXBsYXllciBoYW5kbGVyIGNvZGUgaW4gb25saW5lLmh0bWxcbiAgLy8gSW4gc2luZ2xlIHBsYXllciBtb2RlLCBhbGwgY29udHJvbHMgYXJlIGhhbmRsZWQgb24gb25lIGNsaWVudFxuICAvLyBJbiBtdWx0aXBsYXllciBtb2RlLCB3ZSBvbmx5IHdhbnQgdG8gc2VuZCBpbnB1dHMgZm9yIGN1cnJlbnQgcGxheWVyLCBQTEFZRVJfMVxuICBcbiAgY29uc3QgVGhpbmdzID0gcmVxdWlyZSgnLi9UaGluZ3MnKTtcbiAgZm9yIChsZXQgcGxheWVyIGluIGlucHV0cykge1xuICAgIGZvciAobGV0IGlucHV0IGluIGlucHV0c1twbGF5ZXJdKSB7XG4gICAgICBpZiAoIVRoaW5nc1twbGF5ZXJdIHx8ICFUaGluZ3NbcGxheWVyXS5pbnB1dHMpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoZ2FtZS5pbnB1dCkge1xuICAgICAgICB2YXIga2V5ID0gZ2FtZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoaW5wdXRzW3BsYXllcl1baW5wdXRdKTtcbiAgICAgICAgVGhpbmdzW3BsYXllcl0uaW5wdXRzID0gVGhpbmdzW3BsYXllcl0uaW5wdXRzIHx8IHt9O1xuICAgICAgICBpZiAoa2V5LmlzRG93bikge1xuICAgICAgICAgIFRoaW5nc1twbGF5ZXJdLmlucHV0c1tpbnB1dF0gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIFRoaW5nc1twbGF5ZXJdLmlucHV0c1tpbnB1dF0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5JbnB1dC5yZW1vdmVBbGwgPSBmdW5jdGlvbiByZW1vdmVBbGxJbnB1dCAoZ2FtZSkge1xuICBjb25zdCBUaGluZ3MgPSByZXF1aXJlKCcuL1RoaW5ncycpO1xuICBmb3IgKGxldCBwbGF5ZXIgaW4gaW5wdXRzKSB7XG4gICAgZm9yIChsZXQgaW5wdXQgaW4gaW5wdXRzW3BsYXllcl0pIHtcbiAgICAgIGlmICghVGhpbmdzW3BsYXllcl0gfHwgIVRoaW5nc1twbGF5ZXJdLmlucHV0cykge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKCdpaWlpJywgaW5wdXQsIHBsYXllciwgaW5wdXRzW3BsYXllcl1baW5wdXRdKVxuICAgICAgY29uc29sZS5sb2coaW5wdXRzW3BsYXllcl1baW5wdXRdKVxuICAgICAgdmFyIGtleSA9IGdhbWUuaW5wdXQua2V5Ym9hcmQucmVtb3ZlS2V5KGlucHV0c1twbGF5ZXJdW2lucHV0XSk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW5wdXQ7XG4iLCJjb25zdCBUaGluZyA9IHt9O1xuY29uc3QgVCA9IFRoaW5ncyA9IHJlcXVpcmUoJy4vVGhpbmdzJyk7XG5jb25zdCBfdHlwZXMgPSB7fTtcbmNvbnN0IEJlaGF2aW9yID0gcmVxdWlyZSgnLi9CZWhhdmlvcicpO1xuXG5UaGluZy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGVUaGluZyAob3B0cykge1xuICAvLyBmaXJzdCwgZGV0ZXJtaW5lIHdoYXQgdGhlIG5hbWUgb2YgdGhlIHRoaW5nIHdpbGwgYmVcbiAgLy8gaWYgYSBUaGluZyBoYXMgYSB0eXBlLCBHZW9mZnJleSB3aWxsIGF1dG9tYXRpY2FsbHkgZ2l2ZSB0aGUgVGhpbmcgYSBuYW1lIHdpdGggYW4gYXV0by1pbmNyZW1lbnRlZCBJRFxuICBsZXQgbmFtZTtcbiAgaWYgKG9wdHMudHlwZSkge1xuICAgIGlmICh0eXBlb2YgX3R5cGVzW29wdHMudHlwZV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBjaGVjayBfdHlwZXMsIGlmIGRvZXNuJ3QgZXhpc3QgYWRkIG5ldyBrZXkgYW5kIHNldCB0byAwXG4gICAgICBfdHlwZXNbb3B0cy50eXBlXSA9IDA7XG4gICAgfSBlbHNle1xuICAgICAgLy8gaWYga2V5IGV4aXN0cywgaW5jcmVtZW50IHRoZSB2YWx1ZVxuICAgICAgX3R5cGVzW29wdHMudHlwZV0rKztcbiAgICB9XG4gICAgbmFtZSA9IG9wdHMudHlwZSArICctJyArIF90eXBlc1tvcHRzLnR5cGVdO1xuICB9XG4gIGlmIChvcHRzLm5hbWUpIHtcbiAgICBuYW1lID0gb3B0cy5uYW1lO1xuICB9XG5cbiAgLy8gY29uc29sZS5sb2coJ2NyZWF0aW5nIHRoaW5nIHdpdGggbmFtZTogJywgbmFtZSwgb3B0cyk7XG5cbiAgbGV0IHRoaW5nO1xuICAvLyBUT0RPOiBhbGxvdyBvdGhlciB0eXBlcyBvZiB0aGluZ3MgdG8gYmUgY3JlYXRlZCwgYmVzaWRlcyBwaHlzaWNzIC8gbWF0dGVyIHRoaW5nc1xuICBpZiAob3B0cy5nYW1lb2JqZWN0ID09PSAndGV4dCcpIHtcbiAgICB0aGluZyA9IGdhbWUuYWRkLnRleHQob3B0cy54LCBvcHRzLnksIG9wdHMudGV4dCwgb3B0cy5zdHlsZSk7XG4gIH0gZWxzZSBpZiAob3B0cy5tYXR0ZXIgPT09IGZhbHNlKSB7XG4gICAgdGhpbmcgPSBnYW1lLmFkZC5zcHJpdGUob3B0cy54LCBvcHRzLnksIG9wdHMudGV4dHVyZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpbmcgPSBnbG9iYWwuZ2FtZS5tYXR0ZXIuYWRkLnNwcml0ZShvcHRzLngsIG9wdHMueSwgb3B0cy50ZXh0dXJlLCBudWxsLCB7IGlzU3RhdGljOiBvcHRzLmlzU3RhdGljIH0pO1xuICB9XG5cbiAgdGhpbmcuYmVoYXZpb3JzID0gdGhpbmcuYmVoYXZpb3JzIHx8IHt9O1xuICB0aGluZy5uYW1lID0gbmFtZTtcblxuICAvLyBOYW1lc3BhY2UgYWRkZWQgZm9yIEdlb2ZmcmV5LCBlYXNpZXIgdGhpcyB3YXkgdG8gcmVmZXJlbmNlIGFueXRoaW5nIEdlb2ZmcmV5IGlzIGRvaW5nIHZzIFBoYXNlci5pbyBBUElcbiAgdGhpbmcuRyA9IHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIHRleHR1cmU6IG9wdHMudGV4dHVyZVxuICB9O1xuXG4gIGlmIChvcHRzLm93bmVyKSB7XG4gICAgdGhpbmcuRy5vd25lciA9IG9wdHMub3duZXI7XG4gIH1cblxuICB0aGluZy5HLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5hbWUgPSB0aGluZy5uYW1lO1xuICAgIC8vIGNvbnNvbGUubG9nKFwiREVTVFJPWVwiLCBuYW1lLCBUW25hbWVdKVxuICAgIGlmICh0eXBlb2YgVFtuYW1lXSAhPT0gXCJvYmplY3RcIikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBmaXJzdCBkZXRhY2ggLyByZW1vdmUgYWxsIGJlaGF2aW9yc1xuICAgIHZhciBicyA9IFRbbmFtZV0uYmVoYXZpb3JzO1xuICAgIGlmIChicykge1xuICAgICAgT2JqZWN0LmtleXMoYnMpLmZvckVhY2goZnVuY3Rpb24gKGIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBic1tiXSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIGlmICh0eXBlb2YgYnNbYl0ucmVtb3ZlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGJzW2JdLnJlbW92ZShUW25hbWVdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgQmVoYXZpb3IuZGV0YWNoKGIsIFRbbmFtZV0sIHt9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIHRoZW4gYWN0dWFsbHkgZGVzdHJveSB0aGUgdGhpbmcgKCBwaGFzZXIuaW8gc3ByaXRlIGxldmVsIGRlc3Ryb3kgKVxuICAgIHRoaW5nLmRlc3Ryb3koKTtcbiAgICBpZiAodGhpbmcuYXR0YWNobWVudHMpIHtcbiAgICAgIHRoaW5nLmF0dGFjaG1lbnRzLmdldENoaWxkcmVuKCkuZm9yRWFjaChmdW5jdGlvbihhKXtcbiAgICAgICAgYS5kZXN0cm95KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBkZWxldGUgcmVmZXJlbmNlcyB0byB0aGUgdGhpbmcgaW4gVGhpbmdzIG1lbW9yeVxuICAgIGRlbGV0ZSBUW25hbWVdO1xuICAgIC8vIGRlbGV0ZSBhY3R1YWwgdGhpbmcgaXRzZWxmICggamF2YXNjcmlwdCBsZXZlbCBkZXN0cm95IClcbiAgICBkZWxldGUgdGhpbmc7XG4gIH1cblxuICBUaGluZ3NbdGhpbmcubmFtZV0gPSB0aGluZztcbiAgcmV0dXJuIHRoaW5nO1xufTtcblxuVGhpbmcuaW5mbGF0ZSA9IGZ1bmN0aW9uIGluZmxhdGVUaGluZyAodGhpbmd5KSB7XG4gIC8vIFRPRE86IG11c3QgY2hlY2sgaWYgVGhpbmcgYWxyZWFkeSBleGlzdHMsIGlmIHNvLCB0aGVuIHdlIHdhbnQgdG8gYXBwbHkgdGhlIHZhbHVlcyBhbmQgbm90IGNyZWF0ZSBkdXBsaWNhdGVcbiAgLy8gY29uc29sZS5sb2coJ1RoaW5nc1t0aGluZ3kubmFtZV0nLCB0aGluZ3kubmFtZSwgVGhpbmdzW3RoaW5neS5uYW1lXSlcbiAgaWYgKFRoaW5nc1t0aGluZ3kubmFtZV0pIHtcbiAgICAvL1RoaW5nc1t0aGluZ3kubmFtZV0ueCA9IHRoaW5neS54O1xuICAgIC8vVGhpbmdzW3RoaW5neS5uYW1lXS55ID0gdGhpbmd5Lnk7XG4gICAgLy9UaGluZ3NbdGhpbmd5Lm5hbWVdLmJvZHkudmVsb2NpdHkgPSB0aGluZ3kudmVsb2NpdHk7XG4gICAgLy9UaGluZ3NbdGhpbmd5Lm5hbWVdLmJvZHkuYW5nbGUgPSB0aGluZ3kuYW5nbGU7XG4gICAgLy8gVGhpbmdzW3RoaW5neS5uYW1lXS5yb3RhdGlvbiA9IHRoaW5neS5yb3RhdGlvbjtcbiAgICBUaGluZ3NbdGhpbmd5Lm5hbWVdLmhlYWx0aCA9IHRoaW5neS5oZWFsdGg7XG4gIH0gZWxzZSB7XG4gICAgLy8gdGFrZXMgYSBzZXJpYWxpemVkIHRoaW5nIHR5cGUgc3RydWN0dXJlICggdGhpbmd5ICksXG4gICAgLy8gYW5kIHJlaW5mbGF0ZXMgaXQgYmFjayBpbnRvIGFuIGFjdHVhbCBUaGluZyB1c2luZyBUaGluZy5jcmVhdGVcbiAgICBsZXQgdGhpbmcgPSBUaGluZy5jcmVhdGUoe1xuICAgICAgbmFtZTogdGhpbmd5Lm5hbWUsXG4gICAgICBvd25lcjogdGhpbmd5Lm93bmVyLFxuICAgICAgdGV4dHVyZTogdGhpbmd5LnRleHR1cmVcbiAgICB9KTtcbiAgICBmb3IgKGxldCBiIGluIHRoaW5neS5iZWhhdmlvcnMpIHtcbiAgICAgIEJlaGF2aW9yLmF0dGFjaChiLCB0aGluZywgdGhpbmd5LmJlaGF2aW9yc1tiXS5vcHRzKVxuICAgIH1cbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRoaW5nOyIsImNvbnN0IFRoaW5ncyA9IHt9O1xubW9kdWxlLmV4cG9ydHMgPSBUaGluZ3M7IiwiY29uc3QgVCA9IFRoaW5ncyA9IHJlcXVpcmUoJy4uLy4uL0dlb2ZmcmV5L1RoaW5ncycpO1xuXG4vLyBhaUZvbGxvd1xuLy8gVE9ETzogY2xlYW51cCAvIHJldmlldyB0aGlzIGJlaGF2aW9yXG52YXIgYWRqdXN0bWVudERlbGF5ID0gNjA7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdGFnczogWydhaSddLFxuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZUFpRm9sbG93IChzcHJpdGUsIG9wdHMpIHtcbiAgICBpZiAodHlwZW9mIG9wdHMuZm9sbG93VGFyZ2V0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgaWYgKHNwcml0ZS5uYW1lID09PSAnUExBWUVSXzEnKSB7XG4gICAgICAgIHNwcml0ZS5mb2xsb3dUYXJnZXQgPSBUWydQTEFZRVJfMiddO1xuICAgICAgICBzcHJpdGUuZm9sbG93VGFyZ2V0TmFtZSA9ICdQTEFZRVJfMic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcHJpdGUuZm9sbG93VGFyZ2V0ID0gVFsnUExBWUVSXzEnXTtcbiAgICAgICAgc3ByaXRlLmZvbGxvd1RhcmdldE5hbWUgPSAnUExBWUVSXzEnO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzcHJpdGUuZm9sbG93VGFyZ2V0ID0gb3B0cy5mb2xsb3dUYXJnZXQ7XG4gICAgICBzcHJpdGUuZm9sbG93VGFyZ2V0TmFtZSA9IG9wdHMuZm9sbG93VGFyZ2V0Lm5hbWU7XG4gICAgfVxuXG4gICAgLy8gd29ya3MgZm9yIHN0cmluZyBuYW1lLCBvciB3aG9sZSBvYmplY3QgKCBzdHJpbmcgc3R5bGUgcmVxdWlyZWQgZm9yIGxldmVsIGRlc2lnbiApXG4gICAgaWYgKHR5cGVvZiBzcHJpdGUuZm9sbG93VGFyZ2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgc3ByaXRlLmZvbGxvd1RhcmdldCA9IFRbb3B0cy5mb2xsb3dUYXJnZXRdO1xuICAgIH1cblxuICAgIC8vIHNwcml0ZS5yb3RhdGlvblNwZWVkID0gc3ByaXRlLnJvdGF0aW9uU3BlZWQgfHwgNDA7XG4gICAgc3ByaXRlLnJvdGF0aW9uU3BlZWQgPSBzcHJpdGUucm90YXRpb25TcGVlZCB8fCBvcHRzLnJvdGF0aW9uU3BlZWQgfHwgMC4wMTg7XG4gICAgc3ByaXRlLm1ha2luZ1JhbmRvbU1vdmVtZW50ID0gZmFsc2U7XG4gICAgc3ByaXRlLmxhc3RSYW5kb21Nb3ZlbWVudCA9IDA7XG4gICAgc3ByaXRlLmNvdXJzZUNvcnJlY3Rpb24gPSBnYW1lLnRpbWUubm93O1xuICAgIHNwcml0ZS5haSA9IHRydWU7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlQWlGb2xsb3cgKHNwcml0ZSwgZ2FtZSkge1xuICAgIC8vIERlZmluZSBjb25zdGFudHMgdGhhdCBhZmZlY3QgbW90aW9uXG4gICAgLy8gc3ByaXRlLlNQRUVEID0gc3ByaXRlLnRocnVzdDsgLy8gbWlzc2lsZSBzcGVlZCBwaXhlbHMvc2Vjb25kXG4gICAgc3ByaXRlLlRVUk5fUkFURSA9IFBoYXNlci5NYXRoLkRlZ1RvUmFkKHNwcml0ZS5yb3RhdGlvblNwZWVkKTsgLy8gdHVybiByYXRlIGluIGRlZ3JlZXMvZnJhbWVcbiAgICBpZiAoc3ByaXRlLmZyb3plbikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHNwcml0ZS5mb2xsb3dUYXJnZXQgPSBUW3Nwcml0ZS5mb2xsb3dUYXJnZXROYW1lXTtcbiAgICAvLyBjb25zb2xlLmxvZygndHR0dCcsIHNwcml0ZS5mb2xsb3dUYXJnZXROYW1lLCBzcHJpdGUuZm9sbG93VGFyZ2V0KVxuICAgIGlmICh0eXBlb2Ygc3ByaXRlLmZvbGxvd1RhcmdldCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGdhbWUudGltZS5ub3cgLSBhZGp1c3RtZW50RGVsYXkgPCBzcHJpdGUuY291cnNlQ29ycmVjdGlvbikge1xuICAgICAgLy8gcmV0dXJuO1xuICAgIH1cbiAgICAvLyBDYWxjdWxhdGUgdGhlIGFuZ2xlIGZyb20gdGhlIG1pc3NpbGUgdG8gdGhlIG1vdXNlIGN1cnNvciBnYW1lLmlucHV0LnhcbiAgICAvLyBhbmQgZ2FtZS5pbnB1dC55IGFyZSB0aGUgbW91c2UgcG9zaXRpb247IHN1YnN0aXR1dGUgd2l0aCB3aGF0ZXZlclxuICAgIC8vIHRhcmdldCBjb29yZGluYXRlcyB5b3UgbmVlZC5cbiAgICB2YXIgdGFyZ2V0QW5nbGUgPSBQaGFzZXIuTWF0aC5BbmdsZS5CZXR3ZWVuKFxuICAgICAgc3ByaXRlLngsIHNwcml0ZS55LFxuICAgICAgc3ByaXRlLmZvbGxvd1RhcmdldC54LCBzcHJpdGUuZm9sbG93VGFyZ2V0LnlcbiAgICApO1xuXG4gICAgLy8gR3JhZHVhbGx5ICh0aGlzLlRVUk5fUkFURSkgYWltIHRoZSBtaXNzaWxlIHRvd2FyZHMgdGhlIHRhcmdldCBhbmdsZVxuICAgIGlmIChzcHJpdGUucm90YXRpb24gIT09IHRhcmdldEFuZ2xlKSB7XG4gICAgICAvLyBDYWxjdWxhdGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBjdXJyZW50IGFuZ2xlIGFuZCB0YXJnZXRBbmdsZVxuICAgICAgdmFyIGRlbHRhID0gdGFyZ2V0QW5nbGUgLSBzcHJpdGUucm90YXRpb247XG5cbiAgICAgIC8vIEtlZXAgaXQgaW4gcmFuZ2UgZnJvbSAtMTgwIHRvIDE4MCB0byBtYWtlIHRoZSBtb3N0IGVmZmljaWVudCB0dXJucy5cbiAgICAgIGlmIChkZWx0YSA+IE1hdGguUEkpIGRlbHRhIC09IE1hdGguUEkgKiAyO1xuICAgICAgaWYgKGRlbHRhIDwgLU1hdGguUEkpIGRlbHRhICs9IE1hdGguUEkgKiAyO1xuXG4gICAgICBpZiAoZGVsdGEgPiAwKSB7XG4gICAgICAgIC8vIFR1cm4gY2xvY2t3aXNlXG4gICAgICAgIHNwcml0ZS5yb3RhdGlvbiArPSBzcHJpdGUucm90YXRpb25TcGVlZDtcbiAgICAgICAgc3ByaXRlLmNvdXJzZUNvcnJlY3Rpb24gPSBnYW1lLnRpbWUubm93O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVHVybiBjb3VudGVyLWNsb2Nrd2lzZVxuICAgICAgICBzcHJpdGUucm90YXRpb24gLT0gc3ByaXRlLnJvdGF0aW9uU3BlZWQ7XG4gICAgICAgIHNwcml0ZS5jb3Vyc2VDb3JyZWN0aW9uID0gZ2FtZS50aW1lLm5vdztcbiAgICAgIH1cblxuICAgICAgLy8gSnVzdCBzZXQgYW5nbGUgdG8gdGFyZ2V0IGFuZ2xlIGlmIHRoZXkgYXJlIGNsb3NlXG4gICAgICBpZiAoTWF0aC5hYnMoZGVsdGEpIDwgUGhhc2VyLk1hdGguRGVnVG9SYWQoc3ByaXRlLlRVUk5fUkFURSkpIHtcbiAgICAgICAgc3ByaXRlLnJvdGF0aW9uID0gdGFyZ2V0QW5nbGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNwcml0ZS50aHJ1c3QpIHtcbiAgICAgIGlmICh0eXBlb2Ygc3ByaXRlLnRocnVzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlBST0JMRU0gSU5WQUxJRCBUSFJVU1QgVkFMVUUgRlJPTSBPTEQgQVBJXCIpXG4gICAgICB9XG4gICAgICB2YXIgZDEgPSBQaGFzZXIuTWF0aC5EaXN0YW5jZS5CZXR3ZWVuKHNwcml0ZS54LCBzcHJpdGUueSwgc3ByaXRlLmZvbGxvd1RhcmdldC54LCBzcHJpdGUuZm9sbG93VGFyZ2V0LnkpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ2QxJywgZDEpXG4gICAgICBpZiAoZDEgPiAxMjApIHtcbiAgICAgICAgc3ByaXRlLnRocnVzdChzcHJpdGUudGhydXN0Rm9yY2UgfHwgLjAwMSk7XG4gICAgICB9XG4gICAgfVxuXG5cbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmVBaUZvbGxvdyhzcHJpdGUpIHtcbiAgICBpZiAoc3ByaXRlLmJvZHkpIHtcbiAgICAgIC8vc3ByaXRlLnNldFZlbG9jaXR5KDAsIDApO1xuICAgIH1cbiAgICBzcHJpdGUuYWkgPSBmYWxzZTtcbiAgfVxufTsiLCIvLyBoYXNDaGF0Qm94XG5jb25zdCBJbnB1dCA9IHJlcXVpcmUoJy4uLy4uL0dlb2ZmcmV5L0lucHV0Jyk7XG5jb25zdCBUaGluZ3MgPSByZXF1aXJlKCcuLi8uLi9HZW9mZnJleS9UaGluZ3MnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogZnVuY3Rpb24gaGFzQ2hhdEJveENyZWF0ZSAoc3ByaXRlLCBnYW1lKSB7XG4gICAgdmFyIHRLZXkgPSBzcHJpdGUuaW5wdXQua2V5Ym9hcmQuYWRkS2V5KCdUJyk7XG4gICAgdEtleS5vbignZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBvcGVuQ2hhdEJveCgpO1xuICAgIH0pO1xuICAgIGZ1bmN0aW9uIG9wZW5DaGF0Qm94ICgpe1xuICAgICAgJCgnLmNoYXRCb3gnKS5zaG93KCk7XG4gICAgfTtcbiAgICB2YXIgZXNjS2V5ID0gc3ByaXRlLmlucHV0LmtleWJvYXJkLmFkZEtleSgnRVNDJyk7XG4gICAgZXNjS2V5Lm9uKCdkb3duJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNsb3NlQ2hhdEJveCgpO1xuICAgIH0pO1xuICAgIHZhciBlbnRlcktleSA9IHNwcml0ZS5pbnB1dC5rZXlib2FyZC5hZGRLZXkoJ0VOVEVSJyk7XG4gICAgZW50ZXJLZXkub24oJ2Rvd24nLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgc2VuZENoYXRNZXNzYWdlKCk7XG4gICAgfSk7XG4gICAgZnVuY3Rpb24gb3BlbkNoYXRCb3ggKCl7XG4gICAgICAkKCcuY2hhdEJveCcpLnNob3coKTtcbiAgICAgIHdpbmRvd1snZ2FtZSddLmdhbWVzdGF0ZS5pbnB1dHNEaXNhYmxlZCA9IHRydWU7XG4gICAgICBJbnB1dC5yZW1vdmVBbGwod2luZG93WydnYW1lJ10pO1xuICAgICAgLy8gVE9ETzogZGlzYWJsZSBhbGwgb3RoZXIga2V5cy4uLlxuICAgIH07XG4gICAgZnVuY3Rpb24gY2xvc2VDaGF0Qm94ICgpe1xuICAgICAgJCgnLmNoYXRCb3gnKS5oaWRlKCk7XG4gICAgICB3aW5kb3dbJ2dhbWUnXS5nYW1lc3RhdGUuaW5wdXRzRGlzYWJsZWQgPSBmYWxzZTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIHNlbmRDaGF0TWVzc2FnZSAoKSB7XG4gICAgICBsZXQgbXNnID0gJCgnLmNoYXRCb3hBcmVhJykudmFsKCk7XG4gICAgICAvLyBUT0RPOiBob3cgZG8gQmVoYXZpb3JzIC8gVGhpbmdzIHNlbmQgc3RhdGUgdG8gdGhlIHBlZXIgYnJvYWRjYXN0ZXI/Pz9cbiAgICAgIC8vIFRPRE86IGFkZCBvdXQgb2YgYmFuZCB3ZWJzb2NrZXQgbWVzc2FnZSBmb3IgZG9pbmcgcmVhbC10aW1lIGNoYXQ/XG4gICAgICAvLyBCcmlkZ2UuZW1pdCgnY2hhdDo6bWVzc2FnZScsIG1zZyk7XG4gICAgICBjbG9zZUNoYXRCb3goKTtcbiAgICB9XG4gICAgJCgnYm9keScpLmFwcGVuZChgXG4gICAgICA8c3R5bGU+XG4gICAgICAgIC5jaGF0Qm94IHtcbiAgICAgICAgICBib3JkZXI6IHNvbGlkO1xuICAgICAgICAgIGhlaWdodDogMjAwcHg7XG4gICAgICAgICAgd2lkdGg6IDQwMHB4O1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICB0b3A6IDQwMHB4O1xuICAgICAgICAgIGxlZnQ6IDYwMHB4O1xuICAgICAgICAgIGNvbG9yOiB3aGl0ZTtcbiAgICAgICAgICBkaXNwbGF5OiBub25lO1xuICAgICAgICB9XG4gICAgICAgIC5jaGF0Qm94QXJlYSB7XG4gICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIH1cbiAgICAgIDwvc3R5bGU+XG4gICAgICA8ZGl2IGNsYXNzPVwiY2hhdEJveFwiPlxuICAgICAgICBUYWxrIHNvbjxici8+XG4gICAgICAgIDx0ZXh0YXJlYSBjbGFzcz1cImNoYXRCb3hBcmVhXCIgY29scz1cIjIwXCIgcm93cz1cIjEwXCI+PC90ZXh0YXJlYT48YnIvPlxuICAgICAgICA8YnV0dG9uPlNlbmQ8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIGApO1xuICAgICQoJy5jaGF0Qm94IGJ1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICBzZW5kQ2hhdE1lc3NhZ2UoKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiBoYXNDaGF0Qm94VXBkYXRlIChzcHJpdGUsIGdhbWUpIHtcbiAgfVxufTsiLCIvLyBoYXNTY3JlZW5XcmFwXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiBoYXNTY3JlZW5XcmFwQ3JlYXRlIChzcHJpdGUsIGdhbWUpIHt9LFxuICB1cGRhdGU6IGZ1bmN0aW9uIGhhc1NjcmVlbldyYXBVcGRhdGUgKHNwcml0ZSwgZ2FtZSkge1xuXG4gICAgbGV0IHdvcmxkV2lkdGggPSBnYW1lLnN5cy5nYW1lLmNhbnZhcy53aWR0aDtcbiAgICBsZXQgd29ybGRIZWlnaHQgPSBnYW1lLnN5cy5nYW1lLmNhbnZhcy5oZWlnaHQ7XG4gICAgaWYgKCFzcHJpdGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGNhbSA9IGdhbWUuY2FtZXJhcy5jYW1lcmFzWzBdO1xuICAgIGlmIChzcHJpdGUueCA8IDApIHtcbiAgICAgIHNwcml0ZS54ID0gd29ybGRXaWR0aDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZiAoc3ByaXRlLnggPiB3b3JsZFdpZHRoKSB7XG4gICAgICBzcHJpdGUueCA9IDA7XG4gICAgICByZXR1cm47XG4gICAgfSBpZiAoc3ByaXRlLnkgPCAwKSB7XG4gICAgICBzcHJpdGUueSA9IHdvcmxkSGVpZ2h0IC0gc3ByaXRlLmhlaWdodDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZiAoc3ByaXRlLnkgPiB3b3JsZEhlaWdodCkge1xuICAgICAgc3ByaXRlLnkgPSAwO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICB9XG59OyIsIi8vIGhhc1N0YXRlTWFuYWdlclxuLy8gY29uc3QgQnJpZGdlID0gcmVxdWlyZSgnLi4vLi4vR2VvZmZyZXkvQnJpZGdlJyk7XG5jb25zdCBUaGluZ3MgPSByZXF1aXJlKCcuLi8uLi9HZW9mZnJleS9UaGluZ3MnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogZnVuY3Rpb24gaGFzU3RhdGVNYW5hZ2VyQ3JlYXRlIChzcHJpdGUsIGdhbWUpIHt9LFxuICB1cGRhdGU6IGZ1bmN0aW9uIGhhc1N0YXRlTWFuYWdlclVwZGF0ZSAoc3ByaXRlLCBnYW1lKSB7XG4gICAgbGV0IGdhbWVzdGF0ZSA9IFtdO1xuICAgIC8vIG9uIGV2ZXJ5IGdhbWUgdXBkYXRlLCBzZXJpYWxpemUgdGhlIGdhbWVzdGF0ZVxuICAgIGZvciAobGV0IHRoaW5nIGluIFRoaW5ncykge1xuICAgICAgbGV0IHQgPSBUaGluZ3NbdGhpbmddO1xuICAgICAgbGV0IHN0YXRlID0ge1xuICAgICAgICBuYW1lOiB0Lm5hbWUsXG4gICAgICAgIGlkOiB0Lm5hbWUsXG4gICAgICAgIHRleHR1cmU6IHQuRy50ZXh0dXJlLFxuICAgICAgICBvd25lcjogdC5HLm93bmVyLFxuICAgICAgICByb3RhdGlvbjogdC5yb3RhdGlvbixcbiAgICAgICAgeDogdC54LFxuICAgICAgICB5OiB0LnksXG4gICAgICAgIGhlYWx0aDogdC5oZWFsdGgsXG4gICAgICAgIGJlaGF2aW9yczogdC5iZWhhdmlvcnNcbiAgICAgIH07XG4gICAgICBpZiAodC5ib2R5KSB7XG4gICAgICAgIHN0YXRlLnZlbG9jaXR5ID0gdC5ib2R5LnZlbG9jaXR5O1xuICAgICAgICBzdGF0ZS5hbmdsZSA9IHQuYm9keS5hbmdsZTtcbiAgICAgICAgXG4gICAgICB9XG4gICAgICBnYW1lc3RhdGUucHVzaChzdGF0ZSk7XG4gICAgfVxuICAgIGdhbWUuZ2FtZXN0YXRlID0gZ2FtZS5nYW1lc3RhdGUgfHwge307XG4gICAgZ2FtZS5nYW1lc3RhdGUuY3VycmVudFN0YXRlID0gZ2FtZXN0YXRlO1xuICAgIC8vIGNvbnNvbGUubG9nKGdhbWUuZ2FtZXN0YXRlKVxuICB9XG59OyIsImNvbnN0IGJlaGF2aW9ycyA9IHt9O1xuXG4vL1xuLy8gTGV2ZWxzIGFzIEJlaGF2aW9yc1xuLy9cbmJlaGF2aW9yc1snaXNMZXZlbDAnXSA9IHJlcXVpcmUoJy4vbGV2ZWxzL2lzTGV2ZWwwJyk7XG5iZWhhdmlvcnNbJ2lzT25saW5lTGV2ZWwnXSA9IHJlcXVpcmUoJy4vbGV2ZWxzL2lzT25saW5lTGV2ZWwnKTtcblxuLy9cbi8vIFNoaXAgQmVoYXZpb3JzXG4vL1xuYmVoYXZpb3JzWydpc01JQkNhZGR5J10gPSByZXF1aXJlKCcuL3NoaXBzL2lzTUlCQ2FkZHknKTtcblxuLy9cbi8vIFdlYXBvbiBCZWhhdmlvcnNcbi8vXG5iZWhhdmlvcnNbJ2hhc0Z1c2lvbkd1biddID0gcmVxdWlyZSgnLi93ZWFwb25zL2hhc0Z1c2lvbkd1bicpO1xuXG4vL1xuLy8gQXJ0aWZpY2FsIEludGVsbGlnZW5jZSBCZWhhdmlvcnNcbi8vXG5iZWhhdmlvcnNbJ2FpRm9sbG93J10gPSByZXF1aXJlKCcuL2FpL2FpRm9sbG93Jyk7XG5cbi8vXG4vLyBQcm9wZXJ0aWVzIG9mIGEgVGhpbmcgYXMgQmVoYXZpb3JzXG4vL1xuYmVoYXZpb3JzWydkaWVzV2l0aE5vSGVhbHRoJ10gPSByZXF1aXJlKCcuL3Byb3BlcnRpZXMvZGllc1dpdGhOb0hlYWx0aCcpO1xuYmVoYXZpb3JzWydoYXNDb2xsaXNpb25zJ10gPSByZXF1aXJlKCcuL3Byb3BlcnRpZXMvaGFzQ29sbGlzaW9ucycpO1xuYmVoYXZpb3JzWydoYXNIZWFsdGgnXSA9IHJlcXVpcmUoJy4vcHJvcGVydGllcy9oYXNIZWFsdGgnKTtcbmJlaGF2aW9yc1snaGFzTGlmZXNwYW4nXSA9IHJlcXVpcmUoJy4vcHJvcGVydGllcy9oYXNMaWZlc3BhbicpO1xuYmVoYXZpb3JzWydoYXNTcGVlY2hCdWJibGUnXSA9IHJlcXVpcmUoJy4vcHJvcGVydGllcy9oYXNTcGVlY2hCdWJibGUnKTtcblxuLy9cbi8vIE1vdmVtZW50IGJhc2VkIEJlaGF2aW9yc1xuLy9cbmJlaGF2aW9yc1snaGFzUGxhc21hUHJvcHVsc2lvbkVuZ2luZSddID0gcmVxdWlyZSgnLi9tb3ZlbWVudC9oYXNQbGFzbWFQcm9wdWxzaW9uRW5naW5lJyk7XG5iZWhhdmlvcnNbJ2hhc01heFZlbG9jaXR5J10gPSByZXF1aXJlKCcuL21vdmVtZW50L2hhc01heFZlbG9jaXR5Jyk7XG5cbi8vXG4vLyBUcmlnZ2VycyBhcyBCZWhhdmlvcnNcbi8vXG5iZWhhdmlvcnNbJ2FsbE90aGVyUGxheWVyc0RlYWQnXSA9IHJlcXVpcmUoJy4vdHJpZ2dlcnMvYWxsT3RoZXJQbGF5ZXJzRGVhZCcpO1xuXG4vL1xuLy8gU3RhdHVzIG9mIGEgVGhpbmcgYXMgQmVoYXZpb3JzXG4vL1xuYmVoYXZpb3JzWydpc0V4cGxvZGluZyddID0gcmVxdWlyZSgnLi9zdGF0dXMvaXNFeHBsb2RpbmcnKTtcblxuLy9cbi8vIEdhbWUgKCBpdHNlbGYgKSBCZWhhdmlvcnNcbi8vXG5iZWhhdmlvcnNbJ2hhc0NoYXRCb3gnXSA9IHJlcXVpcmUoJy4vZ2FtZS9oYXNDaGF0Qm94Jyk7XG5iZWhhdmlvcnNbJ2hhc1NjcmVlbldyYXAnXSA9IHJlcXVpcmUoJy4vZ2FtZS9oYXNTY3JlZW5XcmFwJyk7XG5iZWhhdmlvcnNbJ2hhc1N0YXRlTWFuYWdlciddID0gcmVxdWlyZSgnLi9nYW1lL2hhc1N0YXRlTWFuYWdlcicpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gYmVoYXZpb3JzOyIsImNvbnN0IFRoaW5nID0gcmVxdWlyZSgnLi4vLi4vR2VvZmZyZXkvVGhpbmcnKTtcbmNvbnN0IFRoaW5ncyA9IHJlcXVpcmUoJy4uLy4uL0dlb2ZmcmV5L1RoaW5ncycpO1xuY29uc3QgQmVoYXZpb3IgPSByZXF1aXJlKCcuLi8uLi9HZW9mZnJleS9CZWhhdmlvcicpO1xuXG4vLyBpc0xldmVsMFxuLy8gbGV2ZWwwIGlzIGN1cnJlbnQgbWVsZWUgLyBza2lybWlzaCBsZXZlbFxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHdpbkNvbmRpdGlvbnM6IFtcbiAgICB7XG4gICAgICAvLyBsZXZlbCBpcyBjb21wbGV0ZSBvbmNlIG9uZSBvZiB0aGUgcGxheWVycyBhY2hpZXZlZCBcImFsbE90aGVyUGxheWVyc0RlYWRcIiB3aW4gY29uZGl0aW9uXG4gICAgICBuYW1lOiAnYWxsT3RoZXJQbGF5ZXJzRGVhZCdcbiAgICB9XG4gIF0sXG4gIHByZWxvYWQ6IGZ1bmN0aW9uIHByZWxvYWRNaWJDYWRkeSAob3B0cywgZ2FtZSkge1xuICAgIGdhbWUubG9hZC5pbWFnZSgnc3BhY2UnLCAnYXNzZXRzL2xldmVscy9zdGFyZmllbGQuanBnJyk7XG4gIH0sXG4gIC8vIFVzaW5nIHRoZSBBbGllbiBXYXJ6IEpTT04gRm9ybWF0IHdlIGNhbiBhZGQgZGVmYXVsdCBcIlRoaW5nc1wiIHRoYXQgd2lsbCBleGlzdCB3aGVuIHRoZSBsZXZlbCBpcyBjcmVhdGVkXG4gIHRoaW5nczoge1xuICAgIC8qXG4gICAgXCJwbGFuZXQtMVwiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcInBsYW5ldC0xXCIsXG4gICAgICAgIFwieFwiOiAxOTAsXG4gICAgICAgIFwieVwiOiA0NjAsXG4gICAgICAgIFwiY2lyY2xlXCI6IDI1LFxuICAgICAgICBcImhlYWx0aFwiOiA1MCxcbiAgICAgICAgXCJhbmdsZVwiOiAwLFxuICAgICAgICBcImJlaGF2aW9yc1wiOiB7XG4gICAgICAgICAgICBcImlzUGxhbmV0b2lkXCI6IHt9XG4gICAgICAgIH1cbiAgICB9Ki9cbiAgfSxcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGVpc0xldmVsMCAoc3ByaXRlLCBvcHRzLCBnYW1lKSB7XG4gICAgLy8gYWxlcnQoJ3N0YXJ0IGJhdHRsZScpXG4gICAgLy8gYWxlcnQoJ2NyZWF0ZWQgbmV3IGxldmVsMCcpXG4gICAgc3ByaXRlLmxpbmUgPSBuZXcgUGhhc2VyLkdlb20uTGluZSgwLCAwLCAyMDAsIDIwMCk7XG4gICAgc3ByaXRlLm1pZCA9IG5ldyBQaGFzZXIuR2VvbS5Qb2ludCgpO1xuXG4gICAgdmFyIGNhbSA9IGdhbWUuY2FtZXJhcy5tYWluO1xuICAgIGNhbS5zdGFydEZvbGxvdyhzcHJpdGUubWlkKTtcblxuICAgIGxldCBiZyA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMjAwMDAsIDIwMDAwLCAnc3BhY2UnKTtcbiAgICBiZy5jb250ZXh0LmZpbGxTdHlsZSA9ICcjRkZGRkZGJztcbiAgICBiZy50aW50ID0gMHhmZjAwMDA7XG4gICAgYmcuc2V0RGVwdGgoLTEpO1xuXG4gICAgZ2FtZS50ZXh0MiA9IGdhbWUuYWRkLnRleHQoMjUwLCAyNTAsICdBbGllbiBXYXJ6JywgeyBmb250OiBcIjc0cHggQXJpYWwgQmxhY2tcIiwgZmlsbDogXCIjMDAwXCIgfSk7XG4gICAgZ2FtZS50ZXh0Mi5zZXRTdHJva2UoJyNmZmYnLCAxNik7XG4gICAgZ2FtZS50ZXh0Mi5zZXRTaGFkb3coMiwgMiwgXCIjMzMzMzMzXCIsIDIsIHRydWUsIHRydWUpO1xuXG4gICAgbGV0IHN0YXJ0aW5nTG9jYXRpb24gPSB7XG4gICAgICB4OiAzMDAsXG4gICAgICB5OiAyNTBcbiAgICB9O1xuXG4gICAgbGV0IHAxID0gVGhpbmcuY3JlYXRlKHtcbiAgICAgIG5hbWU6ICdQTEFZRVJfMScsXG4gICAgICB4OiBzdGFydGluZ0xvY2F0aW9uLngsXG4gICAgICB5OiBzdGFydGluZ0xvY2F0aW9uLnksXG4gICAgICB0ZXh0dXJlOiAnbWliLWNhZGR5J1xuICAgIH0pO1xuXG4gICAgc3RhcnRpbmdMb2NhdGlvbiA9IHtcbiAgICAgIHg6IDEwMCxcbiAgICAgIHk6IDI1MFxuICAgIH07XG5cbiAgICBsZXQgcDIgPSBUaGluZy5jcmVhdGUoe1xuICAgICAgbmFtZTogJ1BMQVlFUl8yJyxcbiAgICAgIHg6IHN0YXJ0aW5nTG9jYXRpb24ueCxcbiAgICAgIHk6IHN0YXJ0aW5nTG9jYXRpb24ueSxcbiAgICAgIHRleHR1cmU6ICdtaWItY2FkZHknXG4gICAgfSk7XG5cbiAgICBCZWhhdmlvci5hdHRhY2goJ2lzTUlCQ2FkZHknLCBwMSwgeyBcbiAgICAgIGhlYWx0aDogMTBcbiAgICB9KTtcblxuICAgIEJlaGF2aW9yLmF0dGFjaCgnaXNNSUJDYWRkeScsIHAyLCB7IFxuICAgICAgaGVhbHRoOiAxMFxuICAgIH0pO1xuXG4gICAgQmVoYXZpb3IuYXR0YWNoKCdhaUZvbGxvdycsIHAyLCB7IFxuICAgICAgZm9sbG93VGFyZ2V0OiBwMVxuICAgIH0pO1xuXG4gICAgQmVoYXZpb3IuYXR0YWNoKCdoYXNTY3JlZW5XcmFwJywgcDEpO1xuICAgIEJlaGF2aW9yLmF0dGFjaCgnaGFzU2NyZWVuV3JhcCcsIHAyKTtcbiAgICBCZWhhdmlvci5hdHRhY2goJ2FsbE90aGVyUGxheWVyc0RlYWQnLCBzcHJpdGUpO1xuXG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlaXNMZXZlbDAgKHNwcml0ZSwgZ2FtZSkge1xuICAgIC8vIGNvbnNvbGUubG9nKFRoaW5ncy5QTEFZRVJfMS54LCBUaGluZ3MuUExBWUVSXzEueSlcbiAgfVxufTtcbiIsImNvbnN0IFRoaW5nID0gcmVxdWlyZSgnLi4vLi4vR2VvZmZyZXkvVGhpbmcnKTtcbmNvbnN0IFRoaW5ncyA9IHJlcXVpcmUoJy4uLy4uL0dlb2ZmcmV5L1RoaW5ncycpO1xuY29uc3QgQmVoYXZpb3IgPSByZXF1aXJlKCcuLi8uLi9HZW9mZnJleS9CZWhhdmlvcicpO1xuXG4vLyBpc0xldmVsMFxuLy8gbGV2ZWwwIGlzIGN1cnJlbnQgbWVsZWUgLyBza2lybWlzaCBsZXZlbFxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHdpbkNvbmRpdGlvbnM6IFtcbiAgICB7XG4gICAgICAvLyBsZXZlbCBpcyBjb21wbGV0ZSBvbmNlIG9uZSBvZiB0aGUgcGxheWVycyBhY2hpZXZlZCBcImFsbE90aGVyUGxheWVyc0RlYWRcIiB3aW4gY29uZGl0aW9uXG4gICAgICBuYW1lOiAnYWxsT3RoZXJQbGF5ZXJzRGVhZCdcbiAgICB9XG4gIF0sXG4gIHByZWxvYWQ6IGZ1bmN0aW9uIHByZWxvYWRNaWJDYWRkeSAob3B0cywgZ2FtZSkge1xuICAgIGdhbWUubG9hZC5pbWFnZSgnc3BhY2UnLCAnYXNzZXRzL2xldmVscy9zdGFyZmllbGQuanBnJyk7XG4gIH0sXG4gIC8vIFVzaW5nIHRoZSBBbGllbiBXYXJ6IEpTT04gRm9ybWF0IHdlIGNhbiBhZGQgZGVmYXVsdCBcIlRoaW5nc1wiIHRoYXQgd2lsbCBleGlzdCB3aGVuIHRoZSBsZXZlbCBpcyBjcmVhdGVkXG4gIHRoaW5nczoge1xuICAgIC8qXG4gICAgXCJwbGFuZXQtMVwiOiB7XG4gICAgICAgIFwibmFtZVwiOiBcInBsYW5ldC0xXCIsXG4gICAgICAgIFwieFwiOiAxOTAsXG4gICAgICAgIFwieVwiOiA0NjAsXG4gICAgICAgIFwiY2lyY2xlXCI6IDI1LFxuICAgICAgICBcImhlYWx0aFwiOiA1MCxcbiAgICAgICAgXCJhbmdsZVwiOiAwLFxuICAgICAgICBcImJlaGF2aW9yc1wiOiB7XG4gICAgICAgICAgICBcImlzUGxhbmV0b2lkXCI6IHt9XG4gICAgICAgIH1cbiAgICB9Ki9cbiAgfSxcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGVpc0xldmVsMCAoc3ByaXRlLCBvcHRzLCBnYW1lKSB7XG4gICAgLy8gYWxlcnQoJ3N0YXJ0IGJhdHRsZScpXG4gICAgLy8gYWxlcnQoJ2NyZWF0ZWQgbmV3IGxldmVsMCcpXG4gICAgc3ByaXRlLmxpbmUgPSBuZXcgUGhhc2VyLkdlb20uTGluZSgwLCAwLCAyMDAsIDIwMCk7XG4gICAgc3ByaXRlLm1pZCA9IG5ldyBQaGFzZXIuR2VvbS5Qb2ludCgpO1xuXG4gICAgdmFyIGNhbSA9IGdhbWUuY2FtZXJhcy5tYWluO1xuICAgIGNhbS5zdGFydEZvbGxvdyhzcHJpdGUubWlkKTtcblxuICAgIGxldCBiZyA9IGdhbWUuYWRkLnRpbGVTcHJpdGUoMCwgMCwgMjAwMDAsIDIwMDAwLCAnc3BhY2UnKTtcbiAgICBiZy5jb250ZXh0LmZpbGxTdHlsZSA9ICcjRkZGRkZGJztcbiAgICBiZy50aW50ID0gMHhmZjAwMDA7XG4gICAgYmcuc2V0RGVwdGgoLTEpO1xuXG4gICAgZ2FtZS50ZXh0MiA9IGdhbWUuYWRkLnRleHQoMjUwLCAyNTAsICdBbGllbiBXYXJ6JywgeyBmb250OiBcIjc0cHggQXJpYWwgQmxhY2tcIiwgZmlsbDogXCIjMDAwXCIgfSk7XG4gICAgZ2FtZS50ZXh0Mi5zZXRTdHJva2UoJyNmZmYnLCAxNik7XG4gICAgZ2FtZS50ZXh0Mi5zZXRTaGFkb3coMiwgMiwgXCIjMzMzMzMzXCIsIDIsIHRydWUsIHRydWUpO1xuXG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlaXNMZXZlbDAgKHNwcml0ZSwgZ2FtZSkge1xuICAgIFxuICAgIC8vY29uc29sZS5sb2coVGhpbmdzLlBMQVlFUl8xLngsIFRoaW5ncy5QTEFZRVJfMS55KVxuICB9XG59O1xuIiwiLy8gaGFzTWF4VmVsb2NpdHlcbm1vZHVsZS5leHBvcnRzID17XG4gIGNyZWF0ZTogZnVuY3Rpb24gaGFzTWF4VmVsb2NpdHlDcmVhdGUgKHNwcml0ZSwgb3B0cykge1xuICAgIHNwcml0ZS5tYXhWZWxvY2l0eSA9IG9wdHMubWF4VmVsb2NpdHkgfHwge1xuICAgICAgeDogNCxcbiAgICAgIHk6IDRcbiAgICB9O1xuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uIGhhc01heFZlbG9jaXR5VXBkYXRlIChzcHJpdGUpIHtcbiAgICBpZiAoc3ByaXRlICYmIHNwcml0ZS5ib2R5KSB7XG4gICAgICAvLyBjYWxjdWxhdGUgdGhlIG1heCB2ZWxvY2l0eSBmb3IgeCBhbmQgeSBheGlzXG4gICAgICBsZXQgbWF4VmVsb2NpdHlYID0gc3ByaXRlLmJvZHkudmVsb2NpdHkueCA+IHNwcml0ZS5tYXhWZWxvY2l0eS54ID8gMSA6IHNwcml0ZS5ib2R5LnZlbG9jaXR5LnggPCAtc3ByaXRlLm1heFZlbG9jaXR5LnggPyAtMSA6IG51bGw7XG4gICAgICBsZXQgbWF4VmVsb2NpdHlZID0gc3ByaXRlLmJvZHkudmVsb2NpdHkueSA+IHNwcml0ZS5tYXhWZWxvY2l0eS55ID8gMSA6IHNwcml0ZS5ib2R5LnZlbG9jaXR5LnkgPCAtc3ByaXRlLm1heFZlbG9jaXR5LnkgPyAtMSA6IG51bGw7XG4gICAgXG4gICAgICAvLyBjaGVjayBlYWNoIGF4aXMgdG8gc2VlIGlmIHRoZSBtYXhpbXVtIHZlbG9jaXR5IGhhcyBiZWVuIGV4Y2VlZGVkLFxuICAgICAgLy8gaWYgc28sIHNldCB0aGUgdmVsb2NpdHkgZXhwbGljaXR5IHRvIHRoZSBtYXggdmFsdWUgKCBjbGFtcGluZyBtYXhpbXVtIHNwZWVkIClcbiAgICAgIGlmIChtYXhWZWxvY2l0eVgpIHtcbiAgICAgICAgc3ByaXRlLnNldFZlbG9jaXR5KHNwcml0ZS5tYXhWZWxvY2l0eS54ICogbWF4VmVsb2NpdHlYLCBzcHJpdGUuYm9keS52ZWxvY2l0eS55KTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhWZWxvY2l0eVkpIHtcbiAgICAgICAgc3ByaXRlLnNldFZlbG9jaXR5KHNwcml0ZS5ib2R5LnZlbG9jaXR5LngsIHNwcml0ZS5tYXhWZWxvY2l0eS55ICogbWF4VmVsb2NpdHlZKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG4iLCJjb25zdCBUaGluZ3MgPSByZXF1aXJlKCcuLi8uLi9HZW9mZnJleS9UaGluZ3MnKTtcbi8qXG4gICAgLy8gVE9ETzogcmVuYW1lLCBcbiAgICBoYXNQbGFzbWFQcm9wdWxzaW9uRW5naW5lLCAtIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1BsYXNtYV9wcm9wdWxzaW9uX2VuZ2luZVxuKi9cbi8vIGhhc0NvbnRyb2xsZWRGbGlnaHRcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogZnVuY3Rpb24gaGFzUGxhc21hUHJvcHVsc2lvbkVuZ2luZUNyZWF0ZSAoc3ByaXRlLCBvcHRzLCBnYW1lKSB7XG4gICAgLy8gXG4gICAgc3ByaXRlLmlucHV0cyA9IG9wdHMuaW5wdXRzIHx8IHNwcml0ZS5pbnB1dHMgfHwge307XG4gICAgc3ByaXRlLnRocnVzdEZvcmNlID0gb3B0cy50aHJ1c3RGb3JjZSB8fCBzcHJpdGUudGhydXN0Rm9yY2UgfHwgMC4wMDE7XG4gICAgc3ByaXRlLnJvdGF0aW9uU3BlZWQgPSBzcHJpdGUucm90YXRpb25TcGVlZCB8fCBvcHRzLnJvdGF0aW9uU3BlZWQgfHwgMC4wMTg7XG4gICAgc3ByaXRlLm1heFJvdGF0aW9uU3BlZWQgPSBzcHJpdGUubWF4Um90YXRpb25TcGVlZCB8fCBvcHRzLnJvdGF0aW9uU3BlZWQgfHwgMC41O1xuXG4gICAgc3ByaXRlLm1heFNwZWVkID0gc3ByaXRlLnJvdGF0aW9uU3BlZWQgfHwgb3B0cy5tYXhTcGVlZCB8fCAyMDA7XG4gICAgc3ByaXRlLnJldmVyc2VUaHJ1c3QgPSBzcHJpdGUucmV2ZXJzZVRocnVzdCB8fCBvcHRzLnJldmVyc2VUaHJ1c3QgfHwgMTAwO1xuICAgIHNwcml0ZS5mbGlnaHRDb250cm9sbGVkID0gZmFsc2U7XG5cbiAgICBzcHJpdGUubWF4VmVsb2NpdHkgPSBvcHRzLm1heFZlbG9jaXR5IHx8IHNwcml0ZS5tYXhWZWxvY2l0eSB8fCB7XG4gICAgICB4OiA0LFxuICAgICAgeTogNFxuICAgIH07XG4gICAgc3ByaXRlLnRyYWlsVGljayA9IDEyMDtcbiAgICBzcHJpdGUubGFzdFRyYWlsVGljayA9IDA7XG4gICAgLy9nYW1lLmN1cnNvcnMgPSBnYW1lLmlucHV0LmtleWJvYXJkLmNyZWF0ZUN1cnNvcktleXMoKTtcblxuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uIGhhc1BsYXNtYVByb3B1bHNpb25FbmdpbmVVcGRhdGUgKHNwcml0ZSwgZ2FtZSkge1xuICAgIC8vIGNvbnNvbGUubG9nKCdoYXNDb250cm9sbGVkRmxpZ2h0VXBkYXRlJywgc3ByaXRlLmlucHV0cylcbiAgICAvL3Nwcml0ZS5zaGlwVHJhaWwueCA9IHNwcml0ZS54O1xuICAgIC8vc3ByaXRlLnNoaXBUcmFpbC55ID0gc3ByaXRlLnk7XG4gICAgLy9zcHJpdGUuc2hpcFRyYWlsLnJvdGF0aW9uID0gc3ByaXRlLnJvdGF0aW9uXG4gICAgc3ByaXRlLmZsaWdodENvbnRyb2xsZWQgPSBmYWxzZTtcblxuICAgIGlmICh0eXBlb2Ygc3ByaXRlLmJvZHkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coJ3NzcycsIHNwcml0ZSlcbiAgICBzcHJpdGUuZm9vID0gXCJiYXJcIjtcbiAgICAvL2NvbnNvbGUubG9nKHNwcml0ZS5mb28pXG5cbiAgICBpZiAoc3ByaXRlLmlucHV0cyAmJiBzcHJpdGUuaW5wdXRzLmxlZnRLZXkpIHtcbiAgICAgIHNwcml0ZS5zZXRBbmd1bGFyVmVsb2NpdHkoMCk7XG4gICAgICBzcHJpdGUuZmxpZ2h0Q29udHJvbGxlZCA9IHRydWU7XG4gICAgICAvLyBob2xkaW5nIGxlZnQgYnVtcGVyIGVuYWJsZXMgc3RyYWZlIGZvciB0dXJuaW5nICggc2lkZSB0aHJ1c3RlcnMgKVxuICAgICAgaWYgKHNwcml0ZS5pbnB1dHMubGVmdEJ1bXBlcikge1xuICAgICAgICB2YXIgc3RyYWZlU3BlZWQgPSBzcHJpdGUuc3RyYWZlU3BlZWQgfHwgc3ByaXRlLnJvdGF0aW9uU3BlZWQ7XG4gICAgICAgIHNwcml0ZS50aHJ1c3RMZWZ0KHNwcml0ZS50aHJ1c3RGb3JjZSk7XG4gICAgICAgIGlmIChnYW1lLnRpbWUubm93IC0gc3ByaXRlLmxhc3RUcmFpbFRpY2sgPiBzcHJpdGUudHJhaWxUaWNrKSB7XG4gICAgICAgICAgLypcbiAgICAgICAgICBkcmF3VGFpbChzcHJpdGUsIHtcbiAgICAgICAgICAgIHNpZGU6ICdzdGFyYm9hcmQnXG4gICAgICAgICAgfSwgZ2FtZSk7XG4gICAgICAgICAgKi9cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNwcml0ZS5yb3RhdGlvbiA8PSBNYXRoLmFicyhzcHJpdGUubWF4Um90YXRpb25TcGVlZCkpIHtcbiAgICAgICAgICAvL3Nwcml0ZS5zZXRBbmd1bGFyVmVsb2NpdHkocilcbiAgICAgICAgfVxuICAgICAgICBzcHJpdGUucm90YXRpb24gLT0gc3ByaXRlLnJvdGF0aW9uU3BlZWQ7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHNwcml0ZS5pbnB1dHMgJiYgc3ByaXRlLmlucHV0cy5yaWdodEtleSkge1xuICAgICAgc3ByaXRlLnNldEFuZ3VsYXJWZWxvY2l0eSgwKTtcbiAgICAgIHNwcml0ZS5mbGlnaHRDb250cm9sbGVkID0gdHJ1ZTtcbiAgICAgIGlmIChzcHJpdGUuaW5wdXRzLmxlZnRCdW1wZXIpIHtcbiAgICAgICAgdmFyIHN0cmFmZVNwZWVkID0gc3ByaXRlLnN0cmFmZVNwZWVkIHx8IHNwcml0ZS5yb3RhdGlvblNwZWVkO1xuICAgICAgICBzcHJpdGUudGhydXN0UmlnaHQoc3ByaXRlLnRocnVzdEZvcmNlKTtcbiAgICAgICAgaWYgKGdhbWUudGltZS5ub3cgLSBzcHJpdGUubGFzdFRyYWlsVGljayA+IHNwcml0ZS50cmFpbFRpY2spIHtcbiAgICAgICAgICAvKlxuICAgICAgICAgIGRyYXdUYWlsKHNwcml0ZSwge1xuICAgICAgICAgICAgc2lkZTogJ3BvcnQnXG4gICAgICAgICAgfSwgZ2FtZSk7XG4gICAgICAgICAgKi9cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNwcml0ZS5yb3RhdGlvbiA8PSBNYXRoLmFicyhzcHJpdGUubWF4Um90YXRpb25TcGVlZCkpIHtcbiAgICAgICAgICAvLyBzcHJpdGUuc2V0QW5ndWxhclZlbG9jaXR5KHIpXG4gICAgICAgIH1cbiAgICAgICAgc3ByaXRlLnJvdGF0aW9uICs9IHNwcml0ZS5yb3RhdGlvblNwZWVkO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGlmIChzcHJpdGUuYm9keSkge1xuICAgICAgICBzcHJpdGUuYm9keS5hbmd1bGFyVmVsb2NpdHkgPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzcHJpdGUuaW5wdXRzICYmIHNwcml0ZS5pbnB1dHMudXBLZXkpIHtcbiAgICAgIGlmIChnYW1lLnRpbWUubm93IC0gc3ByaXRlLmxhc3RUcmFpbFRpY2sgPiBzcHJpdGUudHJhaWxUaWNrKSB7XG4gICAgICAgIC8qXG4gICAgICAgIGRyYXdUYWlsKHNwcml0ZSwge1xuICAgICAgICAgIHNpZGU6ICdzdGVybidcbiAgICAgICAgfSwgZ2FtZSk7XG4gICAgICAgICovXG4gICAgICB9XG4gICAgICBzcHJpdGUuZmxpZ2h0Q29udHJvbGxlZCA9IHRydWU7XG4gICAgICBzcHJpdGUudGhydXN0KHNwcml0ZS50aHJ1c3RGb3JjZSk7XG4gICAgICAvL3Nwcml0ZS5mcmFtZSA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHNwcml0ZS5zZXRBbmd1bGFyVmVsb2NpdHkoMCk7XG4gICAgfVxuICAgIGlmIChzcHJpdGUuaW5wdXRzICYmIHNwcml0ZS5pbnB1dHMuZG93bktleSkge1xuICAgICAgLy9zcHJpdGUuZnJhbWUgPSAyO1xuICAgICAgc3ByaXRlLnRocnVzdCgwIC0gc3ByaXRlLnRocnVzdEZvcmNlKTtcbiAgICB9XG5cbiAgfVxuXG59OyIsIi8vIGRpZXNXaXRoTm9IZWFsdGhcbmNvbnN0IEJlaGF2aW9yID0gcmVxdWlyZSgnLi4vLi4vR2VvZmZyZXkvQmVoYXZpb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPXtcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGVEaWVzV2l0aE5vSGVhbHRoIChzcHJpdGUsIG9wdHMpIHtcbiAgICAvLyBzaG91bGQgYWxyZWFkeSBoYXZlIGhhc0hlYWx0aCBhdHRhY2hlZFxuICAgIHNwcml0ZS5kaWVzV2l0aE5vSGVhbHRoQ2FsbGJhY2sgPSBvcHRzLmNhbGxiYWNrIHx8IG51bGw7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlRGllc1dpdGhOb0hlYWx0aCAoc3ByaXRlKSB7XG4gICAgaWYgKHNwcml0ZS5HLmhlYWx0aCA8PSAwICYmICFzcHJpdGUuRy5kZWFkKSB7XG4gICAgICAvLyBUT0RPOiBhZGQgZXhwbG9zaW9uIC8gZml4IGRldGFjaCBkZXN0cm95IHJlbW92ZSBlcnJvclxuICAgICAgaWYgKHNwcml0ZS5kaWVzV2l0aE5vSGVhbHRoQ2FsbGJhY2sgIT09IG51bGwpIHtcbiAgICAgICAgc3ByaXRlLmRpZXNXaXRoTm9IZWFsdGhDYWxsYmFjayhudWxsLCBzcHJpdGUpO1xuICAgICAgfVxuICAgICAgQmVoYXZpb3IuYXR0YWNoKCdpc0V4cGxvZGluZycsIHNwcml0ZSk7XG4gICAgICBzcHJpdGUuRy5kZXN0cm95KCk7XG4gICAgICBzcHJpdGUuRy5kZWFkID0gdHJ1ZTtcbiAgICB9IFxuICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZUhhc0NvbGxpc2lvbnMgKHNwcml0ZSwgb3B0cykge1xuICAgIGlmICh0eXBlb2Ygb3B0cy5jb2xsaXNpb25IYW5kbGVyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gdGhyb3cgbmV3IEVycm9yKCdvcHRzLmNvbGxpc2lvbkhhbmRsZXIgaXMgcmVxdWlyZWQhJyk7XG4gICAgfVxuICAgIGlmIChvcHRzLmNvbGxpZGVzV2l0aFNlbGYpIHtcbiAgICAgIHNwcml0ZS5jb2xsaWRlc1dpdGhTZWxmID0gb3B0cy5jb2xsaWRlc1dpdGhTZWxmO1xuICAgIH1cbiAgICBpZiAob3B0cy5jb2xsaWRlc1dpdGhTaWJsaW5ncykge1xuICAgICAgc3ByaXRlLmNvbGxpZGVzV2l0aFNpYmxpbmdzID0gb3B0cy5jb2xsaWRlc1dpdGhTaWJsaW5ncztcbiAgICB9XG4gICAgaWYgKG9wdHMuY29sbGlkZXNXaXRoQ2hpbGRyZW4pIHtcbiAgICAgIHNwcml0ZS5jb2xsaWRlc1dpdGhDaGlsZHJlbiA9IG9wdHMuY29sbGlkZXNXaXRoQ2hpbGRyZW47XG4gICAgfVxuICAgIGlmIChvcHRzLmJlZm9yZUNvbGxpc2lvbkNoZWNrKSB7XG4gICAgICBzcHJpdGUuYmVmb3JlQ29sbGlzaW9uQ2hlY2sgPSBvcHRzLmJlZm9yZUNvbGxpc2lvbkNoZWNrO1xuICAgIH1cbiAgICBpZiAob3B0cy5jb2xsaXNpb25IYW5kbGVyKSB7XG4gICAgICBzcHJpdGUuY29sbGlzaW9uSGFuZGxlciA9IG9wdHMuY29sbGlzaW9uSGFuZGxlcjtcbiAgICB9XG4gICAgaWYgKG9wdHMuYWRkaXRpb25hbENvbGxpc2lvbkNoZWNrKSB7XG4gICAgICBzcHJpdGUuYWRkaXRpb25hbENvbGxpc2lvbkNoZWNrID0gb3B0cy5hZGRpdGlvbmFsQ29sbGlzaW9uQ2hlY2s7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0cy5pbXBhY3RzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgc3ByaXRlLmltcGFjdHMgPSBvcHRzLmltcGFjdHM7XG4gICAgfVxuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZUhhc0NvbGxpc2lvbnMgKHNwcml0ZSwgZ2FtZSkge1xuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZUhhc0NvbGxpc2lvbnMgKHNwcml0ZSkge1xuICB9XG59O1xuXG4iLCIvLyBoYXNIZWFsdGhcbm1vZHVsZS5leHBvcnRzID17XG4gIGNyZWF0ZTogZnVuY3Rpb24gY3JlYXRlSGVhbHRoIChzcHJpdGUsIG9wdHMpIHtcbiAgICBjb25zb2xlLmxvZygnaGFzIGhlYWx0aCcsIG9wdHMpXG4gICAgc3ByaXRlLkcuaGVhbHRoID0gb3B0cy5oZWFsdGggfHwgMTAwO1xuICAgIHNwcml0ZS5HLm1heEhlYWx0aCA9IG9wdHMubWF4SGVhbHRoIHx8IG9wdHMuaGVhbHRoO1xuICB9LFxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZUhlYWx0aCAoc3ByaXRlKSB7XG4gIH1cbn07IiwiLy8gaGFzTGlmZXNwYW5DcmVhdGVcbm1vZHVsZS5leHBvcnRzID17XG4gIGNyZWF0ZTogZnVuY3Rpb24gaGFzTGlmZXNwYW5DcmVhdGUgKHNwcml0ZSwgb3B0cykge1xuICAgIHNwcml0ZS5saWZlc3BhbiA9IG9wdHMubGlmZXNwYW4gfHwgMjAwMDtcbiAgICBvcHRzLmNhbGxiYWNrID0gb3B0cy5jYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zb2xlLmxvZygnbWlzc2luZyBoYXNMaWZlc3BhbiBjYWxsYmFjaycpXG4gICAgICBzcHJpdGUuRy5kZXN0cm95KHRydWUsIGZhbHNlKVxuICAgIH07XG4gICAgdmFyIHRpbWVyID0gZ2FtZS50aW1lLmRlbGF5ZWRDYWxsKHNwcml0ZS5saWZlc3BhbiwgZnVuY3Rpb24oKXtcbiAgICAgIG9wdHMuY2FsbGJhY2soKTtcbiAgICB9KTtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiBoYXNMaWZlc3BhblVwZGF0ZSAoc3ByaXRlKSB7XG4gIH1cbn07XG4iLCIvLyBoYXNTcGVlY2hCdWJibGVcbmNvbnN0IFRoaW5nID0gcmVxdWlyZSgnLi4vLi4vR2VvZmZyZXkvVGhpbmcnKTtcblxubW9kdWxlLmV4cG9ydHMgPXtcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGVIYXNTcGVlY2hCdWJibGUgKHNwcml0ZSwgb3B0cykge1xuICAgIHNwcml0ZS5HLmhlYWx0aCA9IG9wdHMuaGVhbHRoIHx8IDEwMDtcbiAgICBzcHJpdGUuRy5tYXhIZWFsdGggPSBvcHRzLm1heEhlYWx0aCB8fCBvcHRzLmhlYWx0aDtcbiAgICBsZXQgc3R5bGUgPSB7IGZvbnQ6ICcyMHB4IENvdXJpZXInLCBmaWxsOiAnI2NjYycsIHRhYnM6IDEzMiwgYWxpZ246ICdsZWZ0J307XG4gICAgbGV0IHNwZWVjaEJ1YmJsZSA9IHNwcml0ZS5HLnNwZWVjaEJ1YmJsZSA9IFRoaW5nLmNyZWF0ZSh7XG4gICAgICB0eXBlOiAnc3BlZWNoLWJ1YmJsZScsXG4gICAgICBnYW1lb2JqZWN0OiAndGV4dCcsXG4gICAgICBvd25lcjogc3ByaXRlLm5hbWUsXG4gICAgICB4OiBzcHJpdGUueCxcbiAgICAgIHk6IHNwcml0ZS55LFxuICAgICAgdGV4dDogJy4uLicsXG4gICAgICBzdHlsZTogc3R5bGVcbiAgICB9KTtcbiAgICBcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGVIYXNTcGVlY2hCdWJibGUgKHNwcml0ZSkge1xuICAgIHNwcml0ZS5HLnNwZWVjaEJ1YmJsZS54ID0gc3ByaXRlLng7XG4gICAgc3ByaXRlLkcuc3BlZWNoQnViYmxlLnkgPSBzcHJpdGUueTtcbiAgfVxufTsiLCJjb25zdCBCZWhhdmlvciA9IHJlcXVpcmUoJy4uLy4uL0dlb2ZmcmV5L0JlaGF2aW9yJyk7XG5cbi8vIGlzTWliQ2FkZHlcbm1vZHVsZS5leHBvcnRzID0ge1xuICB0YWdzOiBbJ3NoaXAnXSxcbiAgcHJlbG9hZDogZnVuY3Rpb24gcHJlbG9hZE1pYkNhZGR5IChvcHRzLCBnYW1lKSB7XG4gICAgZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KCdtaWItY2FkZHknLCAnYXNzZXRzL3NoaXBzL21pYi1jYWRkeS5wbmcnLCB7IGZyYW1lV2lkdGg6IDE0MCwgZnJhbWVIZWlnaHQ6IDQ4LCBzdGFydDogMCwgZW5kOiA0IH0pO1xuICB9LFxuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZUlzTWliQ2FkZHkgKHNwcml0ZSwgb3B0cywgZ2FtZSkge1xuICAgIHNwcml0ZS5zaGlwVHlwZSA9ICdtaWItY2FkZHknO1xuICAgIHZhciBuYW1lID0gb3B0cy5uYW1lLCB0aW50ID0gb3B0cy50aW50O1xuICAgIHZhciBoZWlnaHQgPSBvcHRzLmhlaWdodCwgd2lkdGggPSBvcHRzLndpZHRoO1xuXG4gICAgdmFyIHggPSBvcHRzLnggfHwgc3ByaXRlLnggfHwgMDtcbiAgICB2YXIgeSA9IG9wdHMueSB8fCBzcHJpdGUueCB8fCAwO1xuICAgIHNwcml0ZS54ID0geDtcbiAgICBzcHJpdGUueSA9IHk7XG5cbiAgICBzcHJpdGUuaGVpZ2h0ID0gMTg7XG4gICAgc3ByaXRlLndpZHRoID0gMzg7XG4gICAgc3ByaXRlLmRpc3BsYXlIZWlnaHQgPSAxODtcbiAgICBzcHJpdGUuZGlzcGxheVdpZHRoID0gMzg7XG5cbiAgICBzcHJpdGUuc2V0TWFzcygyKTtcbiAgICBzcHJpdGUuc2V0Qm91bmNlKDAuOCk7XG5cbiAgICBzcHJpdGUuc2V0RnJpY3Rpb24oMCwwKTtcbiAgICBzcHJpdGUuaW5wdXRzID0gb3B0cy5pbnB1dHMgfHwgc3ByaXRlLmlucHV0cyB8fCB7fTtcblxuICAgIHNwcml0ZS5tYXhTcGVlZCA9IG9wdHMubWF4U3BlZWQgfHwgMzAwO1xuICAgIHNwcml0ZS5yZXZlcnNlVGhydXN0ID0gb3B0cy5yZXZlcnNlVGhydXN0IHx8IDMwMDtcblxuICAgIHNwcml0ZS50aHJ1c3RGb3JjZSA9IDAuMDAyNTtcbiAgICBzcHJpdGUucm90YXRpb25TcGVlZCA9IG9wdHMucm90YXRpb25TcGVlZCB8fCAwLjA4ODtcblxuICAgIHNwcml0ZS5zdHJhZmVTcGVlZCA9IG9wdHMuc3RyYWZlU3BlZWQgfHwgNjAwO1xuXG4gICAgc3ByaXRlLnJlY2hhcmRFbmVyZ3lUaW1lID0gMjAwO1xuICAgIHNwcml0ZS5yZWNoYXJnZUVuZXJneVJhdGUgPSA1O1xuICAgIFxuICAgIHNwcml0ZS5tYXhWZWxvY2l0eSA9IHtcbiAgICAgIHg6IDMuOCxcbiAgICAgIHk6IDMuOFxuICAgIH07XG5cbiAgICBzcHJpdGUuaW5wdXRFbmFibGVkID0gdHJ1ZTtcblxuICAgIEJlaGF2aW9yLmF0dGFjaCgnaGFzSGVhbHRoJywgc3ByaXRlLCB7XG4gICAgICBoZWFsdGg6IG9wdHMuaGVhbHRoIHx8IDYwXG4gICAgfSk7XG5cbiAgICBCZWhhdmlvci5hdHRhY2goJ2hhc1BsYXNtYVByb3B1bHNpb25FbmdpbmUnLCBzcHJpdGUsIHt9KTtcblxuICAgIEJlaGF2aW9yLmF0dGFjaCgnaGFzRnVzaW9uR3VuJywgc3ByaXRlLCB7XG4gICAgICBjb250cm9sS2V5OiAncHJpbWFyeVdlYXBvbktleSdcbiAgICB9KTtcblxuICAgIEJlaGF2aW9yLiBhdHRhY2goJ2RpZXNXaXRoTm9IZWFsdGgnLCBzcHJpdGUsIHt9KTtcblxuICAgIC8qXG4gICAgYXR0YWNoKCdoYXNFbmVyZ3knLCBzcHJpdGUsIHtcbiAgICAgIGVuZXJneTogb3B0cy5lbmVyZ3kgfHwgMTAwXG4gICAgfSk7XG4gICAgYXR0YWNoKCdoYXNTaWduYWxzJywgc3ByaXRlKTtcbiAgICBhdHRhY2goJ2RpZXNXaXRoTm9IZWFsdGgnLCBzcHJpdGUsIHt9KTtcbiAgICBhdHRhY2goJ2hhc1RocnVzdGVycycsIHNwcml0ZSwge1xuICAgICAgY29udHJvbEtleTogJ3NlY29uZGFyeVdlYXBvbktleSdcbiAgICB9KTtcbiAgICBhdHRhY2goJ2hhc1RlbXBvcmFsRGlzcnVwdG9yJywgc3ByaXRlLCB7XG4gICAgICBjb250cm9sS2V5OiAnc3BlY2lhbFdlYXBvbktleSdcbiAgICB9KTtcbiAgICAqL1xuXG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlSXNNaWJDYWRkeSAoc3ByaXRlLCBnYW1lKSB7XG4gICAgLy8gVE9ETzogcmVwbGFjZSB3aXRoIEJlaGF2aW9yLmFpIGNvZGUgYmxvY2tcbiAgICBpZiAoc3ByaXRlLmFpICYmIHNwcml0ZS5oZWFsdGggPD0gMjApIHtcbiAgICAgIHNwcml0ZS5maXJlVGVtcG9yYWxEaXNydXB0b3IgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBzcHJpdGUuZmlyZVRlbXBvcmFsRGlzcnVwdG9yID0gZmFsc2U7XG4gICAgfVxuXG4gIH1cbn07XG5cblxuIiwiY29uc3QgVGhpbmcgPSByZXF1aXJlKCcuLi8uLi9HZW9mZnJleS9UaGluZycpO1xuXG4vLyBpc0V4cGxvZGluZ1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHByZWxvYWQ6IGZ1bmN0aW9uIHByZWxvYWRJc0V4cGxvZGluZyAob3B0cywgZ2FtZSkge1xuICAgIGdhbWUubG9hZC5zcHJpdGVzaGVldCgnZXhwbG9kZScsICdhc3NldHMvZngvZXhwbG9kZS5wbmcnLCB7IGZyYW1lV2lkdGg6IDEyOCwgZnJhbWVIZWlnaHQ6IDEyOCB9KTtcbiAgfSxcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGVEaWVzV2l0aE5vSGVhbHRoIChzcHJpdGUsIG9wdHMpIHtcbiAgICBpZiAoIShzcHJpdGUgJiYgc3ByaXRlLnggJiYgc3ByaXRlLnkpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBleHBsb3Npb24gPSBUaGluZy5jcmVhdGUoe1xuICAgICAgdHlwZTogJ2V4cGxvc2lvbicsXG4gICAgICBtYXR0ZXI6IGZhbHNlLFxuICAgICAgeDogc3ByaXRlLngsXG4gICAgICB5OiBzcHJpdGUueSxcbiAgICAgIHRleHR1cmU6ICdleHBsb2RlJ1xuICAgIH0pO1xuICAgIGV4cGxvc2lvbi5oZWlnaHQgPSAxMDtcbiAgICBleHBsb3Npb24ud2lkdGggPSAxMDtcbiAgICBleHBsb3Npb24uZGlzcGxheUhlaWdodCA9IDI1O1xuICAgIGV4cGxvc2lvbi5kaXNwbGF5V2lkdGggPSAyNTtcbiAgICBleHBsb3Npb24uaGVpZ2h0ID0gc3ByaXRlLmhlaWdodCAqIDI7XG4gICAgZXhwbG9zaW9uLndpZHRoID0gc3ByaXRlLndpZHRoICogMjtcbiAgICAvLyBzaG91bGQgZXhwbG9zaW9uIGJlIGluIGZyb250IG9yIGJlaGluZCBvZiB0YXJnZXQgc3ByaXRlP1xuICAgIC8vZXhwbG9zaW9uLmRlcHRoID0gLTE7XG4gICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgIGtleTogJ2V4cGxvZGVzJyxcbiAgICAgIGZyYW1lczogZ2FtZS5hbmltcy5nZW5lcmF0ZUZyYW1lTnVtYmVycygnZXhwbG9kZScpLFxuICAgICAgZnJhbWVSYXRlOiAxNixcbiAgICAgIHlveW86IGZhbHNlLFxuICAgICAgcmVwZWF0OiAwXG4gICAgfTtcbiAgICBnYW1lLmFuaW1zLmNyZWF0ZShjb25maWcpO1xuICAgIGV4cGxvc2lvbi5hbmltcy5sb2FkKCdleHBsb2RlcycpO1xuICAgIGV4cGxvc2lvbi5hbmltcy5wbGF5KCdleHBsb2RlcycpO1xuICAgIGV4cGxvc2lvbi5vbihQaGFzZXIuQW5pbWF0aW9ucy5FdmVudHMuQU5JTUFUSU9OX0NPTVBMRVRFLCBmdW5jdGlvbihjdXJyZW50QW5pbSwgY3VycmVudEZyYW1lLCBzcHJpdGUpe1xuICAgICAgdHJ5IHtcbiAgICAgICAgZXhwbG9zaW9uLkcuZGVzdHJveSgpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGVJc0V4cGxvZGluZyAoc3ByaXRlKSB7XG4gIH1cbn07XG5cbiIsIi8vIGFsbE90aGVyUGxheWVyc0RlYWRcbm1vZHVsZS5leHBvcnRzID17XG4gIGNyZWF0ZTogZnVuY3Rpb24gY3JlYXRlQWxsT3RoZXJQbGF5ZXJzRGVhZCAoc3ByaXRlLCBvcHRzKSB7XG4gICAgc3ByaXRlLmhlYWx0aCA9IG9wdHMuaGVhbHRoIHx8IDEwMDtcbiAgICBzcHJpdGUubWF4SGVhbHRoID0gb3B0cy5tYXhIZWFsdGggfHwgb3B0cy5oZWFsdGg7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlQWxsT3RoZXJQbGF5ZXJzRGVhZCAoc3ByaXRlKSB7XG4gICAgbGV0IHBsYXllcnMgPSBbJ1BMQVlFUl8xJywgJ1BMQVlFUl8yJ107XG4gICAgbGV0IGRlYWQgPSAwO1xuICAgIHBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpe1xuICAgICAgaWYgKCFUaGluZ3NbcGxheWVyXS5kZXN0cnVjdGFibGUpIHtcbiAgICAgICAgZGVhZCsrXG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKGRlYWQgPj0gcGxheWVycy5sZW5ndGgpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwiREVBRFwiKVxuICAgIH1cbiAgfVxufTsiLCJjb25zdCBCZWhhdmlvciA9IHJlcXVpcmUoJy4uLy4uL0dlb2ZmcmV5L0JlaGF2aW9yJyk7XG5jb25zdCBUaGluZyA9IHJlcXVpcmUoJy4uLy4uL0dlb2ZmcmV5L1RoaW5nJyk7XG5cbi8vICBoYXNGdXNpb25HdW5cbmxldCB3b3JsZFNjYWxlID0gMTtcbmxldCBCVUxMRVRfTElGRVNQQU4gPSAzMDA7XG5sZXQgQlVMTEVUX1JBVEUgPSAzMDtcbmxldCBCVUxMRVRfU1BFRUQgPSAyMDA7XG5sZXQgQlVMTEVUX1NUUkVOR1RIID0gMTtcbmxldCBCVUxMRVRfRU5FUkdZID0gMDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHByZWxvYWQ6IGZ1bmN0aW9uIHByZWxvYWRNaWJDYWRkeSAob3B0cywgZ2FtZSkge1xuICAgIGdhbWUubG9hZC5pbWFnZSgnYnVsbGV0JywgJ2Fzc2V0cy93ZWFwb25zL2J1bGxldHMucG5nJyk7XG4gIH0sXG4gIGNyZWF0ZTogZnVuY3Rpb24gY3JlYXRlRnVzaW9uR3VuIChzcHJpdGUsIG9wdHMpIHtcbiAgICAvL3Nwcml0ZS5mdXNpb25HdW5TRlggPSBnYW1lLmFkZC5hdWRpbygnbmVjcm9Cb21iJywgMC4yKTtcbiAgICBCVUxMRVRfUkFURSA9IG9wdHMuQlVMTEVUX1JBVEUgfHwgQlVMTEVUX1JBVEU7XG4gICAgc3ByaXRlLkcuZnVzaW9uR3VuVGltZSA9IDA7XG4gICAgaWYgKHR5cGVvZiBvcHRzLnN0cmVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgICAgQlVMTEVUX1NUUkVOR1RIID0gb3B0cy5zdHJlbmd0aDtcbiAgICB9XG4gICAgc3ByaXRlLkcuZnVzaW9uR3VuQ29udHJvbEtleSA9IG9wdHMuY29udHJvbEtleSB8fCAncHJpbWFyeVdlYXBvbktleSc7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlRnVzaW9uR3VuIChzcHJpdGUsIGdhbWUpIHtcbiAgICAvLyBjb25zb2xlLmxvZygndXBkYXRpbmcgd2l0aCBpbnB1dHMnLCBzcHJpdGUuaW5wdXRzKVxuICAgIGlmICgoc3ByaXRlLmlucHV0cyAmJiBzcHJpdGUuaW5wdXRzW3Nwcml0ZS5HLmZ1c2lvbkd1bkNvbnRyb2xLZXldKSB8fCBzcHJpdGUuYXV0b2ZpcmUpIHtcbiAgICAgIGlmIChnYW1lLnRpbWUubm93ID4gc3ByaXRlLkcuZnVzaW9uR3VuVGltZSkge1xuICAgICAgICAvLyBwZXJmb3JtIGVuZXJneSBjaGVja1xuICAgICAgICBpZiAoc3ByaXRlLmVuZXJneSA8PSBCVUxMRVRfRU5FUkdZKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygc3ByaXRlLmVuZXJneSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBzcHJpdGUuZW5lcmd5IC09IEJVTExFVF9FTkVSR1k7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZW5lcmd5IGNoZWNrIHBhc3NlZCwgY3JlYXRlIG5ldyBidWxsZXRcbiAgICAgICAgbGV0IGJ1bGxldCA9IFRoaW5nLmNyZWF0ZSh7XG4gICAgICAgICAgdHlwZTogJ2J1bGxldCcsXG4gICAgICAgICAgeDogc3ByaXRlLngsXG4gICAgICAgICAgeTogc3ByaXRlLnksXG4gICAgICAgICAgdGV4dHVyZTogJ2J1bGxldCdcbiAgICAgICAgfSlcblxuICAgICAgICBidWxsZXQuRy5vd25lciA9IHNwcml0ZS5uYW1lO1xuXG4gICAgICAgIGJ1bGxldC5oYXJkbmVzcyA9IDc7XG4gICAgICAgIGJ1bGxldC5HLmltcGFjdHMgPSBmYWxzZTtcblxuICAgICAgICBidWxsZXQud2VhcG9uID0gdHJ1ZTtcbiAgICAgICAgYnVsbGV0LmhlaWdodCA9IDEwO1xuICAgICAgICBidWxsZXQud2lkdGggPSAxMDtcbiAgICAgICAgYnVsbGV0LnNldE1hc3MoMCk7XG4gICAgICAgIGJ1bGxldC5zZXRGcmljdGlvbigwLCAwKTtcblxuICAgICAgICBidWxsZXQuc2V0Qm91bmNlKDApO1xuICAgICAgICBidWxsZXQuc2V0UmVjdGFuZ2xlKDUsNSk7XG5cbiAgICAgICAgQmVoYXZpb3IuYXR0YWNoKCdoYXNTY3JlZW5XcmFwJywgIGJ1bGxldCk7XG5cbiAgICAgICAgLy9idWxsZXQuYW5jaG9yLnNldCgwLjUsIDAuNSk7XG4gICAgICAgIC8vICBhbmQgaXRzIHBoeXNpY3Mgc2V0dGluZ3NcbiAgICAgICAgbGV0IG5ld1ZlbG9jaXR5ID0ge307XG4gICAgICAgIG5ld1ZlbG9jaXR5LnggPSBzcHJpdGUuYm9keS52ZWxvY2l0eS54ICsgKE1hdGguY29zKHNwcml0ZS5yb3RhdGlvbikgKiAxNSk7XG4gICAgICAgIG5ld1ZlbG9jaXR5LnkgPSBzcHJpdGUuYm9keS52ZWxvY2l0eS55ICsgKE1hdGguc2luKHNwcml0ZS5yb3RhdGlvbikgKiAxNSk7XG4gICAgICAgIGJ1bGxldC5zZXRWZWxvY2l0eShuZXdWZWxvY2l0eS54LCAgbmV3VmVsb2NpdHkueSk7XG4gICAgICAgIHNwcml0ZS5HLmZ1c2lvbkd1blRpbWUgPSBnYW1lLnRpbWUubm93ICsgQlVMTEVUX1JBVEU7XG5cbiAgICAgICAgQmVoYXZpb3IuYXR0YWNoKCdoYXNMaWZlc3BhbicsIGJ1bGxldCwge1xuICAgICAgICAgIGxpZmVzcGFuOiBCVUxMRVRfTElGRVNQQU4sXG4gICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGJ1bGxldC5HLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIubWVzc2FnZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIEJlaGF2aW9yLmF0dGFjaCgnaGFzQ29sbGlzaW9ucycsIGJ1bGxldCwge1xuICAgICAgICAgIG93bmVyOiBzcHJpdGUsXG4gICAgICAgICAgY29sbGlkZXNXaXRoU2VsZjogZmFsc2UsIC8vIFRPRE86IG5vdCBzdXBwb3J0ZWQgeWV0P1xuICAgICAgICAgIGNvbGxpZGVzV2l0aFNpYmxpbmdzOiB0cnVlLFxuICAgICAgICAgIGNvbGxpZGVzV2l0aENoaWxkcmVuOiB0cnVlLFxuICAgICAgICAgIGNvbGxpc2lvbkhhbmRsZXI6IGZ1bmN0aW9uICh0aGluZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGluZy5oYXJkbmVzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpbmcuaGFyZG5lc3MgPiA3KSB7IC8vIFRPRE86IGIuaGFyZG5lc3MgaW5zdGVhZCBvZiA3XG4gICAgICAgICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ25vdCBoYXJkIGVub3VnaCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coVFt0aGluZ10ubmFtZSlcbiAgICAgICAgICAgICAgdGhpbmcuRy5oZWFsdGggLT0gQlVMTEVUX1NUUkVOR1RIO1xuICAgICAgICAgICAgICBidWxsZXQuRy5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYnVsbGV0LnJvdGF0aW9uID0gc3ByaXRlLnJvdGF0aW9uO1xuICAgICAgICBidWxsZXQuYm9keS5jdXN0b21TZXBhcmF0ZVggPSB0cnVlO1xuICAgICAgICBidWxsZXQuYm9keS5jdXN0b21TZXBhcmF0ZVkgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICB9XG59O1xuIiwibGV0IGFsaWVuV2FyeiA9IHtcbiAgLy8gVGhpcyBwcm9qZWN0IGlzIGF3ZXNvbWVcbiAgYXdlc29tZTogdHJ1ZSxcbiAgLypcbiAgXG4gICAgXCJUaGluZ3NcIiBvciBcIlRcIiBpcyB0aGUgbWFpbiBoYXNoIHdoaWNoIHN0b3JlcyBhbGwgQWxpZW4gV2FyeiBvYmplY3RzXG4gICAgQW55dGhpbmcgd2hpY2ggYXBwZWFycyBvbiB0aGUgc2NyZWVuIHNob3VsZCBoYXZlIGEgcmVwcmVzZW50YXRpb24gaW4gVGhpbmdzWyd0aGUtdGhpbmctbmFtZSddLFxuICAgIHdoZXJlIGl0IGNhbiBiZSBtYW5pcHVsYXRlZCB1c2luZyB0aGUgXCJUaGluZ3NcIiBBUEkgZm91bmQgaW4gdGhlIEFsaWVuIFdhcnogZG9jdW1lbnRhdGlvblxuXG4gICovXG4gIFRoaW5nOiByZXF1aXJlKCcuL0dlb2ZmcmV5L1RoaW5nJyksXG4gIFRoaW5nczogcmVxdWlyZSgnLi9HZW9mZnJleS9UaGluZ3MnKSxcbiAgLypcbiAgXG4gICAgXCJiZWhhdmlvcnNcIiBjYW4gYmUgYXR0YWNoZWQgdG8gXCJUaGluZ3NcIiBpbiBvcmRlciB0byBjcmVhdGUgVGhpbmdzIHdoaWNoIGNhbiBiZWhhdmVcbiAgICBVbmxpbWl0ZWQgYmVoYXZpb3JzIG1heSBiZSBhdHRhY2hlZCB0byBhIFRoaW5nIGdpdmluZyBpdCBlbWVyZ2VudCBhbmQgY29tcGxleCBiZWhhdmlvcnNcbiAgXG4gICAgRm9yIGV4YW1wbGU6XG4gIFxuICAgIFRPRE8uLi5cbiAgIFxuICAgIFwiYmVoYXZpb3JzXCIgYXJlIG1vZHVsZXMgd2hpY2ggY29udGFpbiB0aGUgZm9sbG93aW5nIGZvdXIgZXhwb3J0ZWQgbWV0aG9kczpcbiAgXG4gICAgIGNyZWF0ZSgpXG4gICAgICAgLSBUaGlzIGlzIHJ1biBvbmNlLCB3aGVuIHRoZSBUaGluZyB3aGljaCBoYXMgdGhlIGJlaGF2aW9yIGlzIGNyZWF0ZWRcbiAgICAgdXBkYXRlKClcbiAgICAgICAtIFRoaXMgaXMgcnVuIG9uIGV2ZXJ5IHVwZGF0ZSBvbiB0aGUgZ2FtZSBsb29wXG4gICAgIHJlbW92ZSgpXG4gICAgICAgLSBUaGlzIGlzIHJ1biB3aGVuIHRoZSBUaGluZyB0aGUgYmVoYXZpb3IgaGFzIGJlZW4gYXR0YWNoZWQgdG8gaXMgZGVzdHJveWVkXG4gIFxuICAqL1xuICBiZWhhdmlvcnM6IHJlcXVpcmUoJy4vYmVoYXZpb3JzJyksXG4gIEJlaGF2aW9yOiByZXF1aXJlKCcuL0dlb2ZmcmV5L0JlaGF2aW9yJyksXG4gIEdhbWU6IHJlcXVpcmUoJy4vR2VvZmZyZXkvR2FtZScpLFxuICBpbnB1dHM6IHJlcXVpcmUoJy4vaW5wdXRzL2lucHV0cycpLFxuICBcbiAgLy8gQW55IGFkZGl0aW9uYWwgdG9wLWxldmVsIG1ldGhvZHMgY2FuIGJlIGFkZGVkIGhlcmUsIHRyeSBub3QgdG8gYWRkIHRoaW5ncyB0byB0aGUgdG9wLWxldmVsIGlmIHlvdSBjYW4hXG4gIGFsZXJ0OiBmdW5jdGlvbiAoKSB7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYWxpZW5XYXJ6O1xuIiwidmFyIGlucHV0cyA9IHt9O1xuXG5pbnB1dHNbJ1BMQVlFUl8xJ10gPSB7XG4gIHByaW1hcnlXZWFwb25LZXk6ICdBJyxcbiAgc2Vjb25kYXJ5V2VhcG9uS2V5OiAnUycsXG4gIHNwZWNpYWxXZWFwb25LZXk6ICdEJyxcbiAgdXBLZXk6ICdVUCcsXG4gIGRvd25LZXk6ICdET1dOJyxcbiAgbGVmdEtleTogJ0xFRlQnLFxuICByaWdodEtleTogJ1JJR0hUJyxcbiAgbGVmdEJ1bXBlcjogJ1NISUZUJ1xufTtcblxuaW5wdXRzWydQTEFZRVJfMiddID0ge1xuICBwcmltYXJ5V2VhcG9uS2V5OiAnUScsXG4gIHNlY29uZGFyeVdlYXBvbktleTogJ1cnLFxuICBzcGVjaWFsV2VhcG9uS2V5OiAnRScsXG4gIHVwS2V5OiAnSScsXG4gIGRvd25LZXk6ICdLJyxcbiAgbGVmdEtleTogJ0onLFxuICByaWdodEtleTogJ0wnLFxuICBsZWZ0QnVtcGVyOiAnU0hJRlQnXG59O1xuXG4vLyBtYXAgaW5wdXRzIHRvIGN1cnJlbnQgY29udHJvbGxlciBkZXZpY2UgKCBoYXJkLWNvZGVkIHRvIEtleWJvYXJkIGZvciBub3cgKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlucHV0czsiXX0=
