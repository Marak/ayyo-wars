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