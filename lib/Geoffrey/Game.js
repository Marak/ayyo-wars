const Behavior = require('./Behavior');
const Thing = require('./Thing');
const Things = require('./Things');
const Input = require('./Input');
window['game'] = '';
global.game = '';
let globalCollisionHandler = require('./Collisions');

var worldWidth = 1024;
var worldHeight = 768;


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

Game.update = function gameUpdate (time, delta) {
  
  /*
  var cam = game.cameras.main;
  cam.setSize(worldWidth, worldHeight);
  */
  Input.process(game);
  // Game.update(game);
  for (let thing in Things) {
    // console.log('updating', thing, Things[thing].inputs)
    Behavior.process(Things[thing], game, { time, delta });
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

  if (Game.servermode) {
    console.log('Bypassing Behavior.preload since running Headless Server');
    return;
  }

  const behaviors = require('../behaviors');

  for (let b in behaviors) {
    if (typeof behaviors[b].preload === "function") {
      try {
        console.log('preloading sprite',  behaviors[b].preload.toString())
        behaviors[b].preload(behaviors[b].config, game);
      } catch (err) {
        console.log('error running ' + b + '.preload()', err);
      }
    }
  }

};

Game.init = function initGame ({ renderMode, audio }) {
  const scenes = require('../index').scenes;

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
    scene: [scenes.preloader, scenes.title, scenes.demo, scenes.render, scenes.skirmish, scenes.galaxy],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: 'game-canvas-div',
      width: worldWidth,
      height: worldHeight
    },
    physics: {
      fps: 60,
      default: 'matter',
      matter: {
        debug: false, // TODO: use config
        gravity: { y: 0, x: 0 },
        plugins: {
          attractors: true
        }
      }
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
