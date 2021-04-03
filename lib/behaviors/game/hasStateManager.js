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
      if (t.sync === false) {
        continue;
      }
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