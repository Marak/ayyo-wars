const Behavior = require('./Behavior');
const Thing = require('./Thing');
const Things = require('./Things');
const Input = require('./Input');

let globalCollisionHandler = require('./Collisions');

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